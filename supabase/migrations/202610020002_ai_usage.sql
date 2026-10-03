-- Shared, durable reservations. No document content or provider secrets stored.
begin;
create table public.ai_usage_buckets (
  scope text not null,
  bucket bigint not null,
  requests integer not null default 0 check (requests >= 0),
  primary key(scope,bucket)
);
alter table public.ai_usage_buckets enable row level security;
revoke all on public.ai_usage_buckets from public, anon, authenticated;

create function public.reserve_ai_request(p_user_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_now bigint := floor(extract(epoch from now()))::bigint;
  v_day bigint := (v_now / 86400) * 86400;
  v_minute bigint := (v_now / 60) * 60;
  v_user_scope text := 'user:' || p_user_id::text;
begin
  if p_user_id is null or not exists(select 1 from auth.users where id=p_user_id) then
    raise exception 'Invalid user' using errcode='22023';
  end if;
  -- All server instances serialize the check and reservation in one transaction.
  perform pg_catalog.pg_advisory_xact_lock(202610020002::bigint);
  if coalesce((select requests from public.ai_usage_buckets where scope=v_user_scope and bucket=v_day),0) >= 8 then
    return jsonb_build_object('allowed',false,'reason','user_daily','retryAfter',v_day+86400-v_now);
  end if;
  if coalesce((select requests from public.ai_usage_buckets where scope='global_day' and bucket=v_day),0) >= 20 then
    return jsonb_build_object('allowed',false,'reason','global_daily','retryAfter',v_day+86400-v_now);
  end if;
  if coalesce((select requests from public.ai_usage_buckets where scope='global_minute' and bucket=v_minute),0) >= 1 then
    return jsonb_build_object('allowed',false,'reason','global_minute','retryAfter',v_minute+60-v_now);
  end if;
  insert into public.ai_usage_buckets(scope,bucket,requests) values
    (v_user_scope,v_day,1),('global_day',v_day,1),('global_minute',v_minute,1)
    on conflict(scope,bucket) do update set requests=public.ai_usage_buckets.requests+1;
  delete from public.ai_usage_buckets where bucket < v_day - 30*86400;
  return jsonb_build_object('allowed',true);
end $$;
revoke all on function public.reserve_ai_request(uuid) from public, anon, authenticated;
grant execute on function public.reserve_ai_request(uuid) to service_role;
commit;
