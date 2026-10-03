begin;
-- A narrow RPC avoids granting direct edits to source text or ownership.
create function public.rename_audit(p_document_id uuid, p_title text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_count integer;
begin
  if v_user is null then raise exception 'Sign in required' using errcode='42501'; end if;
  if p_title is null or length(btrim(p_title)) not between 1 and 240 then
    raise exception 'Invalid title' using errcode='22023';
  end if;
  update public.documents d set title=btrim(p_title)
  where d.id=p_document_id and d.created_by=v_user and d.deleted_at is null
    and exists(select 1 from public.workspace_members m where m.workspace_id=d.workspace_id and m.user_id=v_user);
  get diagnostics v_count = row_count;
  return v_count=1;
end $$;
revoke all on function public.rename_audit(uuid,text) from public, anon;
grant execute on function public.rename_audit(uuid,text) to authenticated;
commit;
