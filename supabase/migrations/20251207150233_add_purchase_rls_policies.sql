-- Add RLS policies for the public.purchases table
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT: authenticated users can view their own purchases
DROP POLICY IF EXISTS "Authenticated users can view own purchases" ON public.purchases;
CREATE POLICY "Authenticated users can view own purchases"
ON public.purchases
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for INSERT: authenticated users can insert their own purchases
DROP POLICY IF EXISTS "Authenticated users can insert own purchases" ON public.purchases;
CREATE POLICY "Authenticated users can insert own purchases"
ON public.purchases
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE: authenticated users can update their own purchases
DROP POLICY IF EXISTS "Authenticated users can update own purchases" ON public.purchases;
CREATE POLICY "Authenticated users can update own purchases"
ON public.purchases
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for DELETE: authenticated users can delete their own purchases
DROP POLICY IF EXISTS "Authenticated users can delete own purchases" ON public.purchases;
CREATE POLICY "Authenticated users can delete own purchases"
ON public.purchases
FOR DELETE
USING (auth.uid() = user_id);
