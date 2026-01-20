-- Drop existing restrictive policies
DROP POLICY IF EXISTS "View Store Transactions" ON public.transactions;
DROP POLICY IF EXISTS "View Store Payments" ON public.payments;

-- Create new policies for Transactions
CREATE POLICY "View Store Transactions" ON public.transactions
FOR SELECT
USING (
  (store_id IN (
    SELECT users.store_id
    FROM users
    WHERE users.user_id = (SELECT auth.uid())
  ))
  OR
  (
    (SELECT role FROM users WHERE user_id = (SELECT auth.uid())) = 'admin'
  )
);

-- Create new policies for Payments
CREATE POLICY "View Store Payments" ON public.payments
FOR SELECT
USING (
  (store_id IN (
    SELECT users.store_id
    FROM users
    WHERE users.user_id = (SELECT auth.uid())
  ))
  OR
  (
    (SELECT role FROM users WHERE user_id = (SELECT auth.uid())) = 'admin'
  )
);
