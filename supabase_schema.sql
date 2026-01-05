-- 1. Create the pastes table
create table if not exists pastes (
  id text primary key,
  content text not null,
  created_at bigint not null, -- Storing as MS timestamp for consistency with app logic
  expires_at bigint,         -- Nullable MS timestamp
  max_views int,             -- Nullable integer
  view_count int default 0 not null
);

-- 2. Create the Atomic View Counter Function (RPC)
-- This function atomically checks constraints and increments the view count.
create or replace function get_paste_atomic(
  p_id text,
  p_now bigint 
)
returns table (
  content text,
  max_views int,
  view_count int,
  expires_at bigint
) 
language plpgsql
as $$
declare
  v_paste pastes%rowtype;
begin
  -- Lock the row for update to ensure atomicity
  select * into v_paste from pastes where id = p_id for update;
  
  -- 1. Check if exists
  if not found then
    return;
  end if;

  -- 2. Check Expiry
  if v_paste.expires_at is not null and p_now > v_paste.expires_at then
    return; -- Return nothing (effectively 404)
  end if;

  -- 3. Check View Limit (using current view_count)
  -- If max_views is set, strict check: view_count must be < max_views
  if v_paste.max_views is not null and v_paste.view_count >= v_paste.max_views then
    return;
  end if;

  -- 4. Increment View Count
  update pastes 
  set view_count = view_count + 1
  where id = p_id;

  -- 5. Return Data (return the *old* view_count + 1, or just the new state)
  -- The requirement says "Fetch Paste ... increments view_count".
  -- We return the state *after* increment essentially, or consistent with the "view" action.
  return query select 
    v_paste.content, 
    v_paste.max_views, 
    (v_paste.view_count + 1), -- Return the new count
    v_paste.expires_at;
end;
$$;
