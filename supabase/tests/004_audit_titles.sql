begin;
insert into auth.users(id,email) values
('e0140000-0000-4000-8000-000000000001','title-a@example.invalid'),
('e0140000-0000-4000-8000-000000000002','title-b@example.invalid');
set local role authenticated;
select set_config('request.jwt.claim.sub','e0140000-0000-4000-8000-000000000001',true);
do $$ declare r jsonb; begin
  r := public.save_audit('Original title','sample',repeat('Synthetic educational text. ',3),'{"documentBiasScore":0,"summary":"Synthetic fixture","flags":[]}');
  perform set_config('equiscan.title_document',r->>'documentId',true);
  if not public.rename_audit((r->>'documentId')::uuid,'  Updated title  ') then raise exception 'FAIL: own rename'; end if;
  if not exists(select 1 from public.documents where title='Updated title' and raw_text=repeat('Synthetic educational text. ',3)) then raise exception 'FAIL: title/source'; end if;
  begin
    perform public.rename_audit((r->>'documentId')::uuid,repeat('x',241));
    raise exception 'FAIL: long title';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.rename_audit((r->>'documentId')::uuid,'   ');
    raise exception 'FAIL: empty title';
  exception when invalid_parameter_value then null; end;
  update public.documents set deleted_at=now() where id=(r->>'documentId')::uuid;
  if public.rename_audit((r->>'documentId')::uuid,'Trash rename') then raise exception 'FAIL: trashed rename'; end if;
  update public.documents set deleted_at=null where id=(r->>'documentId')::uuid;
end $$;
select set_config('request.jwt.claim.sub','e0140000-0000-4000-8000-000000000002',true);
do $$ begin
  if public.rename_audit(current_setting('equiscan.title_document')::uuid,'Cross-user') then raise exception 'FAIL: cross-user rename'; end if;
  if has_function_privilege('anon','public.rename_audit(uuid,text)','EXECUTE') then raise exception 'FAIL: anonymous grant'; end if;
end $$;
reset role;
rollback;
select 'PASS: own rename, trimmed title, source unchanged, invalid titles, trash and cross-user denial; fixtures rolled back' as result;
