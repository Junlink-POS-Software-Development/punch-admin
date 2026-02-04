-- 1. Soft Delete Admin Account RPC
CREATE OR REPLACE FUNCTION public.soft_delete_admin_account(deletion_type text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  user_role text;
BEGIN
  -- 1. Security Check
  SELECT role INTO user_role FROM public.users WHERE user_id = current_user_id;
  
  IF user_role != 'admin' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized: Only admins can perform this action.');
  END IF;

  -- 2. Mark the Admin as Deleted (Shared by both options)
  UPDATE public.users 
  SET deleted_at = now() 
  WHERE user_id = current_user_id;

  -- 3. Branching Logic based on user selection
  
  IF deletion_type = 'relinquish_ownership' THEN
    /* OPTION 1: Admin leaves, but Stores and Members stay active.
       We keep the store 'alive' (deleted_at remains NULL). 
       The store is now technically 'Ownerless' but operational.
    */
    -- No update to public.stores needed here, keeping them active.
    RETURN jsonb_build_object('success', true, 'message', 'Admin account deactivated. Stores remain operational.');

  ELSIF deletion_type = 'terminate_stores' THEN
    /* OPTION 2: Admin leaves and closes all their Stores.
       Members stay active (not deleted) but their store is hidden.
       This will trigger your "Store Deactivated" UI for the members.
    */
    UPDATE public.stores 
    SET deleted_at = now() 
    WHERE user_id = current_user_id;

    RETURN jsonb_build_object('success', true, 'message', 'Admin and stores deactivated. Members remain active.');

  ELSE
    RAISE EXCEPTION 'Invalid deletion type provided.';
  END IF;

END;
$$;

-- 2. Check Admin Access RPC
CREATE OR REPLACE FUNCTION public.check_admin_access()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_at timestamp with time zone;
  v_role text;
BEGIN
  -- 1. Fetch the user's current status
  SELECT role, deleted_at INTO v_role, v_deleted_at
  FROM public.users
  WHERE user_id = auth.uid();

  -- 2. Validate Role (Ensure only Admins are calling this logic)
  IF v_role != 'admin' THEN
    RETURN jsonb_build_object(
      'can_access', false,
      'reason', 'invalid_role',
      'message', 'This access check is reserved for Admin accounts.'
    );
  END IF;

  -- 3. Check Deletion Status
  IF v_deleted_at IS NOT NULL THEN
    RETURN jsonb_build_object(
      'can_access', false,
      'reason', 'account_deleted',
      'message', 'This admin account has been deactivated.',
      'deleted_on', v_deleted_at
    );
  END IF;

  -- 4. Success Case
  RETURN jsonb_build_object(
    'can_access', true,
    'reason', 'active',
    'message', 'Access granted.'
  );
END;
$$;
