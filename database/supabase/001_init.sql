-- ============================================================
-- CABLINK V2 — SUPABASE INIT
-- ============================================================
-- Generic document store, mirroring the Firestore adapter shape
-- (collection, id, data) so ride_persistence.js needs minimal
-- changes. Same table can later hold drivers, users, incidents
-- etc. by using a different `collection` value.
-- ============================================================

create table if not exists cablink_store (
  collection   text not null,
  id           text not null,
  data         jsonb not null,
  updated_at   timestamptz not null default now(),
  primary key (collection, id)
);

create index if not exists cablink_store_collection_idx
  on cablink_store (collection);

-- ============================================================
-- ATOMIC "ACCEPT RIDE" — first-driver-wins
-- ============================================================
-- Postgres does this in one statement, no explicit transaction
-- needed (single UPDATE is already atomic). Mirrors the
-- Firestore transaction in ride_persistence.js::accept().
-- ============================================================

create or replace function cablink_accept_ride(
  p_collection text,
  p_id text,
  p_driver_id text,
  p_driver_name text
) returns jsonb
language plpgsql
as $$
declare
  v_row cablink_store%rowtype;
  v_updated jsonb;
begin
  select * into v_row
  from cablink_store
  where collection = p_collection and id = p_id
  for update;

  if not found then
    return jsonb_build_object(
      'success', false,
      'code', 'NOT_FOUND',
      'error', 'Ride not found'
    );
  end if;

  if (v_row.data->>'status') is distinct from 'MATCHING' then
    return jsonb_build_object(
      'success', false,
      'code', 'ALREADY_ACCEPTED',
      'error', 'Ride is no longer available for acceptance',
      'currentStatus', v_row.data->>'status',
      'ride', v_row.data
    );
  end if;

  v_updated := v_row.data
    || jsonb_build_object(
      'driverId', p_driver_id,
      'driverName', coalesce(p_driver_name, v_row.data->>'driverName'),
      'status', 'DRIVER_ASSIGNED',
      'acceptedAt', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
      'updatedAt', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
    );

  update cablink_store
  set data = v_updated, updated_at = now()
  where collection = p_collection and id = p_id;

  return jsonb_build_object(
    'success', true,
    'code', 'ACCEPTED',
    'ride', v_updated
  );
end;
$$;
