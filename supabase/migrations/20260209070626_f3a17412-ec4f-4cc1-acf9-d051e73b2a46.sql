
-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- The trigger function uses SECURITY DEFINER which bypasses RLS,
-- so we can safely deny all direct client inserts
CREATE POLICY "No direct inserts on notifications"
ON public.notifications
FOR INSERT
WITH CHECK (false);
