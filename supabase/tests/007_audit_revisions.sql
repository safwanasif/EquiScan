begin;
insert into auth.users(id,email) values
('e0170000-0000-4000-8000-000000000001','revision-a@example.invalid'),
('e0170000-0000-4000-8000-000000000002','revision-b@example.invalid');
set local role authenticated;
select set_config('request.jwt.claim.sub','e0170000-0000-4000-8000-000000000001',true);
do $$ declare r jsonb; v jsonb; p uuid; begin
  r:=public.save_audit('Original revision fixture','sample',repeat('Synthetic educational text. ',3),'{"documentBiasScore":0,"summary":"Synthetic fixture","flags":[]}');
  p:=(r->>'scanId')::uuid;
  perform set_config('equiscan.revision_parent',p::text,true);
  v:=public.save_audit_revision(p,repeat('Revised educational text. ',3));
  if v->>'scanId' is not null then raise exception 'FAIL: draft generated audit'; end if;
  v:=public.save_audit_revision(p,repeat('Revised educational text. ',3),'{"documentBiasScore":0,"summary":"Revised fixture","flags":[]}');
  if v->>'scanId' is null then raise exception 'FAIL: child audit missing'; end if;
  if (select count(*) from public.audit_revisions where parent_scan_id=p)<>2 then raise exception 'FAIL: versions'; end if;
  if not exists(select 1 from public.documents where id=(r->>'documentId')::uuid and raw_text=repeat('Synthetic educational text. ',3)) then raise exception 'FAIL: original changed'; end if;
  begin
    perform public.save_audit_revision(p,'short');
    raise exception 'FAIL: invalid text accepted';
  exception when invalid_parameter_value then null; end;
  update public.documents set deleted_at=now() where id=(r->>'documentId')::uuid;
  begin
    perform public.save_audit_revision(p,repeat('Revised text. ',5));
    raise exception 'FAIL: trashed parent accepted';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','e0170000-0000-4000-8000-000000000002',true);
do $$ begin
  if exists(select 1 from public.audit_revisions) then raise exception 'FAIL: cross-user read'; end if;
  begin
    perform public.save_audit_revision(current_setting('equiscan.revision_parent')::uuid,repeat('Cross user text. ',5));
    raise exception 'FAIL: cross-user save';
  exception when insufficient_privilege then null; end;
  if has_function_privilege('anon','public.save_audit_revision(uuid,text,jsonb)','EXECUTE') then raise exception 'FAIL: anonymous grant'; end if;
end $$;
reset role;
rollback;
select 'PASS: draft/rescan snapshots, original unchanged, invalid text, trash and cross-user denial; fixtures rolled back' as result;
