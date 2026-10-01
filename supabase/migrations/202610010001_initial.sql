-- EquiScan v1 foundation. Supports the inspected legacy schema and fresh projects.
-- All statements commit together; no existing data is dropped.
begin;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 120),
  slug text not null unique,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  id uuid primary key default gen_random_uuid(),
  role text not null default 'member' check (role in ('owner','admin','member')),
  joined_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null check (length(btrim(title)) between 1 and 240),
  source_type text not null check (source_type in ('pdf','paste','sample')),
  raw_text text not null check (length(raw_text) between 50 and 2000000),
  char_count integer not null default 0,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (id, workspace_id)
);
create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null,
  workspace_id uuid not null,
  letter_grade text not null check (letter_grade in ('A','B','C','D','F')),
  bias_score numeric not null check (bias_score >= 0 and bias_score <= 10),
  total_flags integer not null check (total_flags between 0 and 200),
  summary text not null check (length(summary) between 1 and 10000),
  category_counts jsonb not null,
  scan_data jsonb not null,
  addendum jsonb,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  foreign key (document_id, workspace_id) references public.documents(id, workspace_id) on delete cascade,
  unique (id, document_id, workspace_id)
);
create table if not exists public.flags (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null,
  document_id uuid not null,
  workspace_id uuid not null,
  flag_index integer not null check (flag_index >= 0),
  category text not null check (category in ('MALE_DEFAULT_CASE','MISSING_FEMALE_SYMPTOMS','PRONOUN_DEFAULT','PSYCHOSOMATIC_ATTRIBUTION','MISSING_SEX_DATA')),
  severity integer not null check (severity between 1 and 3),
  flagged_sentence text not null check (length(flagged_sentence) between 1 and 20000),
  explanation text not null check (length(explanation) between 1 and 10000),
  suggested_rewrite text not null check (length(suggested_rewrite) between 1 and 20000),
  citation jsonb,
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null,
  resolution_note text,
  status text not null default 'open' check (status in ('open','accepted','resolved','dismissed')),
  foreign key (scan_id, document_id, workspace_id) references public.scans(id, document_id, workspace_id) on delete cascade,
  unique (scan_id, flag_index)
);
create index if not exists documents_workspace_created_idx on public.documents(workspace_id, created_at desc);
create index if not exists scans_workspace_created_idx on public.scans(workspace_id, created_at desc);
create index if not exists flags_workspace_idx on public.flags(workspace_id);

-- Fail atomically if legacy cross-workspace ancestry is inconsistent; never repair by deleting data.
create unique index if not exists equiscan_document_workspace_key on public.documents(id,workspace_id);
create unique index if not exists equiscan_scan_document_workspace_key on public.scans(id,document_id,workspace_id);
alter table public.scans add constraint equiscan_scan_parent foreign key(document_id,workspace_id) references public.documents(id,workspace_id) on delete cascade;
alter table public.flags add constraint equiscan_flag_parent foreign key(scan_id,document_id,workspace_id) references public.scans(id,document_id,workspace_id) on delete cascade;

-- Provision exactly one personal workspace for every auth user, including admin-created users.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare workspace_id uuid;
begin
  insert into public.workspaces(name, slug, created_by)
  values ('My Workspace', 'workspace-' || new.id::text, new.id) returning id into workspace_id;
  insert into public.workspace_members(workspace_id, user_id, role) values (workspace_id, new.id, 'owner');
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();
-- Repair only accounts with no membership; preserve restored accounts and shared workspaces.
insert into public.workspaces(name, slug, created_by)
select 'My Workspace', 'workspace-' || u.id::text, u.id from auth.users u
where not exists (select 1 from public.workspace_members m where m.user_id=u.id)
on conflict (slug) do nothing;
insert into public.workspace_members(workspace_id,user_id,role)
select w.id,w.created_by,'owner' from public.workspaces w
where w.slug='workspace-' || w.created_by::text
and not exists (select 1 from public.workspace_members m where m.user_id=w.created_by)
on conflict (workspace_id,user_id) do nothing;

-- Replace legacy permissive policies, including unrestricted membership insertion.
do $$ declare p record; begin
  for p in select tablename,policyname from pg_policies where schemaname='public'
    and tablename in ('workspaces','workspace_members','documents','scans','flags') loop
    execute format('drop policy %I on public.%I',p.policyname,p.tablename);
  end loop;
end $$;

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.documents enable row level security;
alter table public.scans enable row level security;
alter table public.flags enable row level security;

-- Membership's own policy never queries membership, avoiding recursive RLS.
create policy own_membership on public.workspace_members for select to authenticated
using (user_id = (select auth.uid()));
create policy own_workspace on public.workspaces for select to authenticated
using (exists (select 1 from public.workspace_members m where m.workspace_id = workspaces.id and m.user_id = (select auth.uid())));
create policy read_documents on public.documents for select to authenticated
using (exists (select 1 from public.workspace_members m where m.workspace_id = documents.workspace_id and m.user_id = (select auth.uid())));
create policy insert_documents on public.documents for insert to authenticated
with check (created_by = (select auth.uid()) and exists (select 1 from public.workspace_members m where m.workspace_id = documents.workspace_id and m.user_id = (select auth.uid())));
create policy read_scans on public.scans for select to authenticated
using (exists (select 1 from public.workspace_members m where m.workspace_id = scans.workspace_id and m.user_id = (select auth.uid())));
create policy insert_scans on public.scans for insert to authenticated
with check (created_by = (select auth.uid()) and exists (select 1 from public.workspace_members m where m.workspace_id = scans.workspace_id and m.user_id = (select auth.uid())));
create policy read_flags on public.flags for select to authenticated
using (exists (select 1 from public.workspace_members m where m.workspace_id = flags.workspace_id and m.user_id = (select auth.uid())));
create policy insert_flags on public.flags for insert to authenticated
with check (exists (select 1 from public.workspace_members m where m.workspace_id = flags.workspace_id and m.user_id = (select auth.uid())));
create policy review_flags on public.flags for update to authenticated
using (exists (select 1 from public.workspace_members m where m.workspace_id = flags.workspace_id and m.user_id = (select auth.uid())))
with check (exists (select 1 from public.workspace_members m where m.workspace_id = flags.workspace_id and m.user_id = (select auth.uid())));

revoke all on public.workspaces, public.workspace_members, public.documents, public.scans, public.flags from public, anon, authenticated;
grant select on public.workspaces, public.workspace_members to authenticated;
grant select, insert on public.documents, public.scans, public.flags to authenticated;
grant update(status) on public.flags to authenticated;

-- A single RPC runs all writes in one transaction under the caller's RLS policies.
create function public.save_audit(p_title text, p_source_type text, p_raw_text text, p_result jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_user uuid := auth.uid(); v_workspace uuid; v_document uuid; v_scan uuid;
  v_flag jsonb; v_id uuid; v_map jsonb := '{}'::jsonb; v_index integer := 0;
  v_counts jsonb := '{"MALE_DEFAULT_CASE":0,"MISSING_FEMALE_SYMPTOMS":0,"PRONOUN_DEFAULT":0,"PSYCHOSOMATIC_ATTRIBUTION":0,"MISSING_SEX_DATA":0}';
  v_score numeric; v_grade text;
begin
  if v_user is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  select workspace_id into v_workspace from public.workspace_members where user_id = v_user order by joined_at,workspace_id limit 1;
  if v_workspace is null then raise exception 'No workspace' using errcode = '42501'; end if;
  if length(btrim(p_title)) not between 1 and 240 or length(p_raw_text) not between 50 and 2000000 then raise exception 'Invalid document' using errcode = '22023'; end if;
  if jsonb_typeof(p_result->'flags') is distinct from 'array' then raise exception 'Invalid flags' using errcode = '22023'; end if;
  if jsonb_array_length(p_result->'flags') > 200 then raise exception 'Too many flags' using errcode = '22023'; end if;
  v_score := (p_result->>'documentBiasScore')::numeric;
  if v_score is null or v_score < 0 or v_score > 10 then raise exception 'Invalid score' using errcode = '22023'; end if;
  v_grade := case when v_score < 2 then 'A' when v_score < 4 then 'B' when v_score < 6 then 'C' when v_score < 8 then 'D' else 'F' end;
  for v_flag in select value from jsonb_array_elements(p_result->'flags') loop
    if not (v_counts ? (v_flag->>'category')) then raise exception 'Invalid category' using errcode = '22023'; end if;
    v_counts := jsonb_set(v_counts, array[v_flag->>'category'], to_jsonb((v_counts->>(v_flag->>'category'))::integer + 1));
  end loop;
  p_result := p_result || jsonb_build_object('letterGrade', v_grade, 'totalFlags', jsonb_array_length(p_result->'flags'), 'categoryCounts', v_counts);
  insert into public.documents(workspace_id,title,source_type,raw_text,char_count,created_by)
  values(v_workspace,p_title,p_source_type,p_raw_text,length(p_raw_text),v_user) returning id into v_document;
  insert into public.scans(document_id,workspace_id,letter_grade,bias_score,total_flags,summary,category_counts,scan_data,created_by)
  values(v_document,v_workspace,v_grade,v_score,jsonb_array_length(p_result->'flags'),p_result->>'summary',v_counts,p_result,v_user) returning id into v_scan;
  for v_flag in select value from jsonb_array_elements(p_result->'flags') loop
    if coalesce(v_flag->>'id','') = '' or v_map ? (v_flag->>'id') then raise exception 'Invalid flag ID' using errcode = '22023'; end if;
    insert into public.flags(scan_id,document_id,workspace_id,flag_index,category,severity,flagged_sentence,explanation,suggested_rewrite,citation)
    values(v_scan,v_document,v_workspace,v_index,v_flag->>'category',(v_flag->>'severity')::integer,v_flag->>'flaggedSentence',v_flag->>'explanation',v_flag->>'suggestedRewrite',nullif(v_flag->'citation','null'::jsonb)) returning id into v_id;
    v_map := v_map || jsonb_build_object(v_flag->>'id',v_id);
    v_index := v_index + 1;
  end loop;
  return jsonb_build_object('success',true,'workspaceId',v_workspace,'documentId',v_document,'scanId',v_scan,'flagIdMap',v_map);
end;
$$;
revoke all on function public.save_audit(text,text,text,jsonb) from public, anon;
grant execute on function public.save_audit(text,text,text,jsonb) to authenticated;
commit;
