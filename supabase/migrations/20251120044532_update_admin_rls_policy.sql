-- This migration allows admin users to update any user's data, while regular users can still update their own data.

-- Drop the existing policy that allows users to update only their own data
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

-- Create a new policy that allows users to update their own data OR if they are an admin
CREATE POLICY "Users can update own data" 
ON public.users 
FOR UPDATE 
USING (auth.uid()::text = user_id OR auth.role() = 'admin')
WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'admin');



