-- Reuse the existing resolution_note column; no broad column update grant.
create or replace function public.save_reviewer_note(p_flag_id uuid, p_note text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_count integer;
begin
  if v_user is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if p_note is null or length(p_note) > 2000 then raise exception 'Invalid note' using errcode = '22023'; end if;
  update public.flags f set resolution_note = p_note
  from public.scans s, public.documents d
  where f.id = p_flag_id and s.id = f.scan_id and d.id = s.document_id
    and s.created_by = v_user and d.created_by = v_user and d.deleted_at is null
    and exists (select 1 from public.workspace_members m where m.workspace_id = s.workspace_id and m.user_id = v_user);
  get diagnostics v_count = row_count;
  return v_count = 1;
end $$;
revoke all on function public.save_reviewer_note(uuid,text) from public, anon;
grant execute on function public.save_reviewer_note(uuid,text) to authenticated;
