-- Run after 202610020001. All synthetic fixtures roll back.
begin;
insert into auth.users(id,email) values
('e0120000-0000-4000-8000-000000000001','trash-test-a@example.invalid'),
('e0120000-0000-4000-8000-000000000002','trash-test-b@example.invalid');
set local role authenticated;
select set_config('request.jwt.claim.sub','e0120000-0000-4000-8000-000000000001',true);
do $$ declare r jsonb; n integer; begin
  r := public.save_audit('Trash fixture','sample',repeat('Synthetic educational text. ',3),
    '{"documentBiasScore":0,"summary":"Synthetic fixture","flags":[]}');
  perform set_config('equiscan.trash_document',r->>'documentId',true);
  update public.documents set deleted_at=now() where id=(r->>'documentId')::uuid;
  get diagnostics n = row_count;
  if n<>1 or not exists(select 1 from public.documents where deleted_at is not null) then raise exception 'FAIL: own trash'; end if;
  update public.documents set deleted_at=null where id=(r->>'documentId')::uuid;
  if not exists(select 1 from public.documents where deleted_at is null) then raise exception 'FAIL: own restore'; end if;
  if (select count(*) from public.scans)<>1 then raise exception 'FAIL: scan lost'; end if;
  begin
    update public.documents set raw_text='Tampered';
    raise exception 'FAIL: source editable';
  exception when insufficient_privilege then null; end;
  begin
    update public.documents set created_by='e0120000-0000-4000-8000-000000000002';
    raise exception 'FAIL: ownership editable';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','e0120000-0000-4000-8000-000000000002',true);
do $$ declare n integer; begin
  update public.documents set deleted_at=now() where id=current_setting('equiscan.trash_document')::uuid;
  get diagnostics n = row_count;
  if n<>0 then raise exception 'FAIL: cross-user trash'; end if;
end $$;
reset role;
rollback;
select 'PASS: trash, restore, preserved scans, immutable source/owner, cross-user denial; fixtures rolled back' as result;
