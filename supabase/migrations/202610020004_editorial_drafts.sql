begin;
create table public.editorial_drafts (
  scan_id uuid primary key references public.scans(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  addendum jsonb not null check (jsonb_typeof(addendum)='object' and octet_length(addendum::text)<=60000),
  updated_at timestamptz not null default now()
);
alter table public.editorial_drafts enable row level security;
revoke all on public.editorial_drafts from public, anon, authenticated;
grant select, insert on public.editorial_drafts to authenticated;
grant update(addendum,updated_at) on public.editorial_drafts to authenticated;
create policy read_own_drafts on public.editorial_drafts for select to authenticated
using (created_by=auth.uid() and exists (
  select 1 from public.scans s join public.workspace_members m on m.workspace_id=s.workspace_id
  where s.id=scan_id and s.created_by=auth.uid() and m.user_id=auth.uid()
));
create policy insert_own_drafts on public.editorial_drafts for insert to authenticated
with check (created_by=auth.uid() and exists (
  select 1 from public.scans s join public.documents d on d.id=s.document_id
  join public.workspace_members m on m.workspace_id=s.workspace_id
  where s.id=scan_id and s.created_by=auth.uid() and m.user_id=auth.uid() and d.deleted_at is null
));
create policy update_own_drafts on public.editorial_drafts for update to authenticated
using (created_by=auth.uid())
with check (created_by=auth.uid() and exists (
  select 1 from public.scans s join public.documents d on d.id=s.document_id
  join public.workspace_members m on m.workspace_id=s.workspace_id
  where s.id=scan_id and s.created_by=auth.uid() and m.user_id=auth.uid() and d.deleted_at is null
));
commit;
