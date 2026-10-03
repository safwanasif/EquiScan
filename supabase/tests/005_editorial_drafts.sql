begin;
insert into auth.users(id,email) values
('e0150000-0000-4000-8000-000000000001','draft-a@example.invalid'),
('e0150000-0000-4000-8000-000000000002','draft-b@example.invalid');
set local role authenticated;
select set_config('request.jwt.claim.sub','e0150000-0000-4000-8000-000000000001',true);
do $$ declare r jsonb; begin
  r := public.save_audit('Draft fixture','sample',repeat('Synthetic educational text. ',3),'{"documentBiasScore":0,"summary":"Synthetic","flags":[]}');
  perform set_config('equiscan.draft_scan',r->>'scanId',true);
  insert into public.editorial_drafts(scan_id,created_by,addendum) values ((r->>'scanId')::uuid,auth.uid(),'{"title":"Synthetic draft","content":"Review the language.","topicsCovered":["Language"],"wordCount":4}');
  update public.editorial_drafts set addendum=jsonb_set(addendum,'{title}','"Updated draft"') where scan_id=(r->>'scanId')::uuid;
  if not exists(select 1 from public.editorial_drafts where addendum->>'title'='Updated draft') then raise exception 'FAIL: own draft update'; end if;
  begin
    update public.editorial_drafts set created_by='e0150000-0000-4000-8000-000000000002';
    raise exception 'FAIL: creator editable';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','e0150000-0000-4000-8000-000000000002',true);
do $$ declare n integer; begin
  if exists(select 1 from public.editorial_drafts) then raise exception 'FAIL: cross-user read'; end if;
  update public.editorial_drafts set addendum='{}' where scan_id=current_setting('equiscan.draft_scan')::uuid;
  get diagnostics n=row_count;
  if n<>0 then raise exception 'FAIL: cross-user update'; end if;
  if has_table_privilege('anon','public.editorial_drafts','SELECT') then raise exception 'FAIL: anonymous grant'; end if;
end $$;
reset role;
rollback;
select 'PASS: own save/update, immutable creator, cross-user read/update denial, anonymous denial; fixtures rolled back' as result;
