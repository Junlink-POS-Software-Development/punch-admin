-- 1. Helper function for security
CREATE OR REPLACE FUNCTION public.has_store_access(target_store_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  -- Get user role
  SELECT role INTO user_role FROM public.users WHERE user_id = auth.uid();

  -- Super-admin bypass: Admins can access any store
  IF user_role = 'admin' THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM stores s
    WHERE s.store_id = target_store_id
    AND (
      s.user_id = auth.uid() -- Owner
      OR auth.uid() = ANY(s.co_admins) -- Co-admin
      OR s.store_id = (SELECT u.store_id FROM users u WHERE u.user_id = auth.uid()) -- Staff
    )
  );
END;
$$;

-- 2. Main Financial Metrics RPC
-- Updated to bundle all costs into total_expenses and support All Stores view.
create or replace function get_financial_metrics(
  store_id_param uuid default null,
  start_date timestamp with time zone default '-infinity',
  end_date timestamp with time zone default 'infinity'
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  total_gross_sales numeric := 0;
  total_net_sales numeric := 0;
  total_expenses numeric := 0;
  net_profit numeric := 0;
  
  -- Security Variables
  current_user_id uuid := auth.uid();
  current_user_role text;
  allowed_store_ids uuid[];
  is_admin_view boolean := false;
begin
  -- 1. SECURITY & SCOPE (Same robust security as before)
  SELECT role INTO current_user_role FROM public.users WHERE user_id = current_user_id;

  IF store_id_param IS NOT NULL THEN
    IF NOT public.has_store_access(store_id_param) THEN
      RAISE EXCEPTION 'Access Denied: You do not have permission for this store.';
    END IF;
    allowed_store_ids := ARRAY[store_id_param];
  ELSE
    IF current_user_role = 'admin' THEN
      is_admin_view := true;
    ELSE
      SELECT ARRAY_AGG(store_id) INTO allowed_store_ids
      FROM public.stores 
      WHERE user_id = current_user_id 
         OR current_user_id = ANY(co_admins)
         OR store_id = (SELECT u.store_id FROM public.users u WHERE u.user_id = current_user_id);
      
      IF allowed_store_ids IS NULL THEN
         return json_build_object(
          'gross_sales', 0, 'net_sales', 0, 
          'total_expenses', 0, 'net_profit', 0
        );
      END IF;
    END IF;
  END IF;

  -- 2. CALCULATE SALES (Money In)
  select 
    coalesce(sum(t.total_price + coalesce(t.discount, 0)), 0), -- Gross (Sticker Price)
    coalesce(sum(t.total_price), 0)                            -- Net (Cash Received)
  into 
    total_gross_sales, total_net_sales
  from transactions t
  where t.transaction_time >= start_date
  and t.transaction_time <= end_date
  and (
    is_admin_view 
    OR t.store_id = ANY(allowed_store_ids)
  );

  -- 3. CALCULATE EXPENSES (Money Out)
  -- This now includes COGS, Rent, Salary, Drawings - everything.
  select 
    coalesce(sum(e.amount), 0)
  into total_expenses
  from expenses e
  where e.created_at >= start_date
  and e.created_at <= end_date
  and (
    is_admin_view 
    OR e.store_id = ANY(allowed_store_ids)
  );

  -- 4. CALCULATE NET PROFIT
  net_profit := total_net_sales - total_expenses;

  -- 5. RETURN SIMPLIFIED JSON
  return json_build_object(
    'gross_sales', total_gross_sales,
    'net_sales', total_net_sales,
    'total_expenses', total_expenses,
    'net_profit', net_profit
  );
end;
$$;
