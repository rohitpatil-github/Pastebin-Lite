-- Re-run this entire script in Supabase SQL Editor

-- Drop the old function to be safe (optional, but good practice if signature changes)
drop function if exists get_paste_atomic(text, bigint);

-- Create the Atomic View Counter Function with non-ambiguous output names
create or replace function get_paste_atomic(
  p_id text,
  p_now bigint 
)
returns table (
  content text,
  max_views int,
  ret_view_count int, -- Renamed from view_count to avoid ambiguity
  expires_at bigint
) 
language plpgsql
as $$
declare
  v_paste pastes%rowtype;
begin
  -- Lock the row for update
  select * into v_paste from pastes where id = p_id for update;
  
  if not found then
    return;
  end if;

  -- Check Expiry
  if v_paste.expires_at is not null and p_now > v_paste.expires_at then
    return;
  end if;

  -- Check View Limit
  if v_paste.max_views is not null and v_paste.view_count >= v_paste.max_views then
    return;
  end if;

  -- Increment View Count
  update pastes 
  set view_count = pastes.view_count + 1 -- Explicitly qualify just in case, though renaming param helps
  where id = p_id;

  -- Return Data
  return query select 
    v_paste.content, 
    v_paste.max_views, 
    (v_paste.view_count + 1) as ret_view_count,
    v_paste.expires_at;
end;
$$;
