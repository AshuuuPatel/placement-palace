-- Drop the existing policy that has the RLS recursion issue
DROP POLICY IF EXISTS "Companies can view student profiles" ON public.profiles;

-- Create a new policy using the security definer function
CREATE POLICY "Companies can view student profiles"
ON public.profiles
FOR SELECT
USING (
  has_role(auth.uid(), 'company'::app_role) 
  AND has_role(user_id, 'student'::app_role)
);