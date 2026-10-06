begin;
create table public.audit_revisions (
  id uuid primary key default gen_random_uuid(),
  parent_scan_id uuid not null references public.scans(id) on delete cascade,
  revised_scan_id uuid references public.scans(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  revised_text text not null check (length(revised_text) between 50 and 8000),
  created_at timestamptz not null default now()
);
alter table public.audit_revisions enable row level security;
revoke all on public.audit_revisions from public, anon, authenticated;
grant select, insert on public.audit_revisions to authenticated;
create policy read_own_revisions on public.audit_revisions for select to authenticated
using (created_by=auth.uid() and exists (
  select 1 from public.scans s join public.workspace_members m on m.workspace_id=s.workspace_id
  where s.id=parent_scan_id and s.created_by=auth.uid() and m.user_id=auth.uid()
));
create policy insert_own_revisions on public.audit_revisions for insert to authenticated
with check (created_by=auth.uid() and exists (
  select 1 from public.scans s join public.documents d on d.id=s.document_id
  join public.workspace_members m on m.workspace_id=s.workspace_id
  where s.id=parent_scan_id and s.created_by=auth.uid() and d.created_by=auth.uid()
    and m.user_id=auth.uid() and d.deleted_at is null
) and (revised_scan_id is null or exists (
  select 1 from public.scans child join public.documents cd on cd.id=child.document_id
  where child.id=revised_scan_id and child.created_by=auth.uid() and cd.raw_text=revised_text
)));
create function public.save_audit_revision(p_parent_scan_id uuid,p_text text,p_result jsonb default null)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare v_user uuid:=auth.uid(); v_title text; v_saved jsonb; v_child uuid; v_revision uuid;
begin
  if v_user is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_text is null or length(p_text) not between 50 and 8000 then raise exception 'Invalid revision' using errcode='22023'; end if;
  select d.title into v_title from public.scans s join public.documents d on d.id=s.document_id
  where s.id=p_parent_scan_id and s.created_by=v_user and d.created_by=v_user and d.deleted_at is null;
  if v_title is null then raise exception 'Audit unavailable' using errcode='42501'; end if;
  if p_result is not null then
    v_saved:=public.save_audit(left(v_title,220)||' · revised','paste',p_text,p_result);
    v_child:=(v_saved->>'scanId')::uuid;
  end if;
  insert into public.audit_revisions(parent_scan_id,revised_scan_id,created_by,revised_text)
  values(p_parent_scan_id,v_child,v_user,p_text) returning id into v_revision;
  return jsonb_build_object('revisionId',v_revision,'scanId',v_child);
end $$;
revoke all on function public.save_audit_revision(uuid,text,jsonb) from public,anon;
grant execute on function public.save_audit_revision(uuid,text,jsonb) to authenticated;
commit;
