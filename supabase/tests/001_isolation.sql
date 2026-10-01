-- Run after the initial migration. Fixtures and all audit writes roll back.
begin;
insert into auth.users(id,email) values
('e0110000-0000-4000-8000-000000000001','equiscan-test-a@example.invalid'),
('e0110000-0000-4000-8000-000000000002','equiscan-test-b@example.invalid');

do $$ begin
  if (select count(*) from public.workspace_members where user_id in ('e0110000-0000-4000-8000-000000000001','e0110000-0000-4000-8000-000000000002')) <> 2 then
    raise exception 'FAIL: automatic workspace provisioning';
  end if;
  if has_table_privilege('anon','public.documents','SELECT') then raise exception 'FAIL: anonymous read grant'; end if;
  if has_function_privilege('anon','public.save_audit(text,text,text,jsonb)','EXECUTE') then raise exception 'FAIL: anonymous RPC grant'; end if;
end $$;

set local role authenticated;
select set_config('request.jwt.claim.sub','e0110000-0000-4000-8000-000000000001',true);
do $$
declare r jsonb; audit jsonb; n integer;
begin
  if (select count(*) from public.workspace_members) <> 1 then raise exception 'FAIL: membership isolation'; end if;
  if (select count(*) from public.workspaces) <> 1 then raise exception 'FAIL: workspace isolation'; end if;
  audit := '{"documentBiasScore":4,"summary":"Synthetic test audit","flags":[{"id":"flag-1","category":"PRONOUN_DEFAULT","severity":1,"flaggedSentence":"Synthetic sentence","explanation":"Synthetic explanation","suggestedRewrite":"Synthetic rewrite"}]}';
  r := public.save_audit('Isolation fixture','sample',repeat('Synthetic educational text. ',3),audit);
  perform set_config('equiscan.test_flag',r->'flagIdMap'->>'flag-1',true);
  if (select total_flags from public.scans where id=(r->>'scanId')::uuid) <> 1 then raise exception 'FAIL: derived count'; end if;
  if (select letter_grade from public.scans where id=(r->>'scanId')::uuid) <> 'C' then raise exception 'FAIL: grade'; end if;
  update public.flags set status='dismissed' where id=(r->'flagIdMap'->>'flag-1')::uuid;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL: own review update'; end if;
  -- A bad final flag must roll back document and scan inserts as well.
  begin
    perform public.save_audit('Must roll back','sample',repeat('Synthetic educational text. ',3),jsonb_set(audit,'{flags,0,severity}','9'));
    raise exception 'FAIL: invalid severity accepted';
  exception when check_violation then null;
  end;
  if (select count(*) from public.documents) <> 1 or (select count(*) from public.scans) <> 1 then raise exception 'FAIL: partial audit remains'; end if;
  begin
    update public.flags set explanation='Tampered';
    raise exception 'FAIL: immutable content writable';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.workspace_members(workspace_id,user_id) select workspace_id,'e0110000-0000-4000-8000-000000000002' from public.workspace_members;
    raise exception 'FAIL: membership escalation';
  exception when insufficient_privilege then null;
  end;
end $$;

select set_config('request.jwt.claim.sub','e0110000-0000-4000-8000-000000000002',true);
do $$ declare n integer; begin
  if (select count(*) from public.documents) <> 0 or (select count(*) from public.scans) <> 0 or (select count(*) from public.flags) <> 0 then raise exception 'FAIL: cross-user read'; end if;
  update public.flags set status='resolved' where id=current_setting('equiscan.test_flag')::uuid;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: cross-user update'; end if;
  begin
    insert into public.documents(workspace_id,title,source_type,raw_text,created_by)
    select workspace_id,'Cross-user','sample',repeat('Synthetic text. ',5),'e0110000-0000-4000-8000-000000000001' from public.workspace_members;
    raise exception 'FAIL: forged creator';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
rollback;
select 'PASS: provisioning, atomic save, counts, grades, review, isolation, grants; fixtures rolled back' as result;
