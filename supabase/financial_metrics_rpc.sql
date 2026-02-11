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
create or replace function get_financial_metrics(
  store_id_param uuid default null,
  start_date date default '-infinity',
  end_date date default 'infinity'
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  -- Renamed variables to avoid conflict with table columns
  v_total_gross_sales numeric := 0;
  v_total_net_sales numeric := 0;
  v_total_expenses numeric := 0;
  v_net_profit numeric := 0;
  v_transaction_count integer := 0;
  v_average_order_value numeric := 0;
  
  -- Security Variables
  current_user_id uuid := auth.uid();
  current_user_role text;
  allowed_store_ids uuid[];
  is_admin_view boolean := false;
begin
  -- 1. SECURITY & SCOPE
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
          'total_expenses', 0, 'net_profit', 0,
          'transaction_count', 0, 'average_order_value', 0
        );
      END IF;
    END IF;
  END IF;

  -- 2. THE GOLD STANDARD QUERY (With fixed references)
  SELECT 
    -- Explicitly sum the TABLE COLUMNS
    COALESCE(SUM(d.total_gross_sales), 0),
    COALESCE(SUM(d.total_net_sales), 0),
    COALESCE(SUM(d.total_expenses), 0),
    COALESCE(SUM(d.net_profit), 0),
    COALESCE(SUM(d.transaction_count), 0)
  INTO 
    -- Store result in the RENAMED VARIABLES
    v_total_gross_sales, 
    v_total_net_sales, 
    v_total_expenses, 
    v_net_profit, 
    v_transaction_count
  FROM daily_store_stats d  -- Used alias 'd' to be specific
  WHERE d.date >= start_date
  AND d.date <= end_date
  AND (
    is_admin_view 
    OR d.store_id = ANY(allowed_store_ids)
  );

  -- 3. CALCULATE DERIVED METRICS
  IF v_transaction_count > 0 THEN
    v_average_order_value := v_total_net_sales / v_transaction_count;
  ELSE
    v_average_order_value := 0;
  END IF;

  -- 5. RETURN RESULT
  return json_build_object(
    'gross_sales', v_total_gross_sales,
    'net_sales', v_total_net_sales,
    'total_expenses', v_total_expenses,
    'net_profit', v_net_profit,
    'transaction_count', v_transaction_count,
    'average_order_value', round(v_average_order_value, 2),
    'debug_start', start_date,
    'debug_end', end_date
  );
end;
$$;
