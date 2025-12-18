-- Migration to add customers, category and products tables

-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
  customer_id SERIAL NOT NULL,
  customer_name CHARACTER VARYING(255) NOT NULL,
  phone_number CHARACTER VARYING(20) NULL,
  email CHARACTER VARYING(255) NULL,
  address CHARACTER VARYING(255) NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT customers_pkey PRIMARY KEY (customer_id)
) TABLESPACE pg_default;

-- Create category table
CREATE TABLE IF NOT EXISTS public.category (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT category_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Create products table (inferred from requirements to manage products)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  unit TEXT,
  category_id UUID REFERENCES public.category(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT products_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Add RLS policies (Open for now as no user_id in provided schema, but good to have prepared)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow all access for authenticated users (since no user_id is present to filter by owner)
-- Adjust this if data should be private per user, but schema was provided without user_id.

CREATE POLICY "Enable read access for all users" ON public.customers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for all users" ON public.customers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for all users" ON public.customers
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for all users" ON public.customers
    FOR DELETE USING (auth.role() = 'authenticated');

-- Same for categories
CREATE POLICY "Enable read access for all users" ON public.category
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for all users" ON public.category
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for all users" ON public.category
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for all users" ON public.category
    FOR DELETE USING (auth.role() = 'authenticated');

-- Same for products
CREATE POLICY "Enable read access for all users" ON public.products
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for all users" ON public.products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for all users" ON public.products
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for all users" ON public.products
    FOR DELETE USING (auth.role() = 'authenticated');
