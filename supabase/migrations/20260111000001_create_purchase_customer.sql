-- Create purchase_customer table
CREATE TABLE IF NOT EXISTS public.purchase_customer (
  id serial PRIMARY KEY NOT NULL,
  name character varying(255) not null,
  phone character varying(20) null,
  email character varying(255) null,
  address character varying(255) null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.purchase_customer ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to see purchase customers
DROP POLICY IF EXISTS "Allow authenticated users to view purchase customers" ON public.purchase_customer;
CREATE POLICY "Allow authenticated users to view purchase customers"
ON public.purchase_customer
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert purchase customers (standard for administrative apps)
DROP POLICY IF EXISTS "Allow authenticated users to insert purchase customers" ON public.purchase_customer;
CREATE POLICY "Allow authenticated users to insert purchase customers"
ON public.purchase_customer
FOR INSERT
TO authenticated
WITH CHECK (true);
