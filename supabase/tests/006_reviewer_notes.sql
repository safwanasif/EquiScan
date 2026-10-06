begin;
insert into auth.users(id,email) values
('e0160000-0000-4000-8000-000000000001','note-a@example.invalid'),
('e0160000-0000-4000-8000-000000000002','note-b@example.invalid');
set local role authenticated;
select set_config('request.jwt.claim.sub','e0160000-0000-4000-8000-000000000001',true);
do $$ declare r jsonb; f uuid; begin
  r := public.save_audit('Reviewer note fixture','sample','Every patient should bring his medication list to the appointment.',
    '{"documentBiasScore":2,"summary":"Synthetic fixture","flags":[{"id":"flag-1","category":"PRONOUN_DEFAULT","severity":2,"flaggedSentence":"Every patient should bring his medication list to the appointment.","explanation":"Generic male pronoun","suggestedRewrite":"Every patient should bring their medication list to the appointment."}]}');
  f := (r->'flagIdMap'->>'flag-1')::uuid;
  perform set_config('equiscan.note_flag',f::text,true);
  if not public.save_reviewer_note(f,'Reviewed generic wording.') then raise exception 'FAIL: own note'; end if;
  if not exists(select 1 from public.flags where id=f and resolution_note='Reviewed generic wording.' and status='open') then raise exception 'FAIL: note or status'; end if;
  if not public.save_reviewer_note(f,'') then raise exception 'FAIL: clear note'; end if;
  begin
    perform public.save_reviewer_note(f,repeat('x',2001));
    raise exception 'FAIL: length';
  exception when invalid_parameter_value then null; end;
  update public.documents set deleted_at=now() where id=(r->>'documentId')::uuid;
  if public.save_reviewer_note(f,'Trash edit') then raise exception 'FAIL: trash'; end if;
  update public.documents set deleted_at=null where id=(r->>'documentId')::uuid;
end $$;
select set_config('request.jwt.claim.sub','e0160000-0000-4000-8000-000000000002',true);
do $$ begin
  if public.save_reviewer_note(current_setting('equiscan.note_flag')::uuid,'Cross-user') then raise exception 'FAIL: cross-user'; end if;
  if has_function_privilege('anon','public.save_reviewer_note(uuid,text)','EXECUTE') then raise exception 'FAIL: anonymous grant'; end if;
end $$;
reset role;
rollback;
select 'PASS: own save/clear, length, status unchanged, trash and cross-user denial; fixtures rolled back' as result;
