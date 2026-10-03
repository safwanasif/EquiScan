-- Recoverable deletion. Keep original source, findings, and reviews for restoration.
begin;
alter table public.documents add column if not exists deleted_at timestamptz;
create policy trash_own_documents on public.documents for update to authenticated
using (created_by = (select auth.uid()) and exists (
  select 1 from public.workspace_members m
  where m.workspace_id = documents.workspace_id and m.user_id = (select auth.uid())
))
with check (created_by = (select auth.uid()) and exists (
  select 1 from public.workspace_members m
  where m.workspace_id = documents.workspace_id and m.user_id = (select auth.uid())
));
-- Only this column may change; source text and ownership remain immutable.
grant update(deleted_at) on public.documents to authenticated;
commit;
