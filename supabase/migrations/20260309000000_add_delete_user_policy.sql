CREATE POLICY "Admins can delete users" 
ON public.users 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
