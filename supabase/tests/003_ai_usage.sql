-- Run after 202610020002_ai_usage.sql. Fixtures and counters roll back.
begin;
insert into auth.users(id,email) values
('e0130000-0000-4000-8000-000000000001','usage-test@example.invalid');
do $$ declare r jsonb; d bigint := floor(extract(epoch from now()))::bigint / 86400 * 86400; begin
  if has_function_privilege('authenticated','public.reserve_ai_request(uuid)','EXECUTE')
    or has_function_privilege('anon','public.reserve_ai_request(uuid)','EXECUTE') then
    raise exception 'FAIL: public reservation permission';
  end if;
  if not has_function_privilege('service_role','public.reserve_ai_request(uuid)','EXECUTE') then
    raise exception 'FAIL: missing server permission';
  end if;
  delete from public.ai_usage_buckets;
  r := public.reserve_ai_request('e0130000-0000-4000-8000-000000000001');
  if r->>'allowed'<>'true' or (select count(*) from public.ai_usage_buckets)<>3 then
    raise exception 'FAIL: reservation counters';
  end if;
  r := public.reserve_ai_request('e0130000-0000-4000-8000-000000000001');
  if r->>'reason'<>'global_minute' then raise exception 'FAIL: minute cap'; end if;
  if exists(select 1 from public.ai_usage_buckets where requests<>1) then raise exception 'FAIL: denied request charged'; end if;
  update public.ai_usage_buckets set requests=20 where scope='global_day';
  r := public.reserve_ai_request('e0130000-0000-4000-8000-000000000001');
  if r->>'reason'<>'global_daily' then raise exception 'FAIL: global daily cap'; end if;
  update public.ai_usage_buckets set requests=8 where scope like 'user:%';
  r := public.reserve_ai_request('e0130000-0000-4000-8000-000000000001');
  if r->>'reason'<>'user_daily' or (r->>'retryAfter')::integer not between 1 and 86400 then raise exception 'FAIL: user daily cap'; end if;
  begin
    perform public.reserve_ai_request('e0130000-0000-4000-8000-000000000099');
    raise exception 'FAIL: unknown user allowed';
  exception when invalid_parameter_value then null; end;
end $$;
rollback;
select 'PASS: server-only permission, reservation counters, minute/global/user caps, denied requests uncharged, unknown user rejected; fixtures rolled back' as result;
