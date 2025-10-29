CREATE TABLE IF NOT EXISTS public.sales (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount decimal(10, 2) NOT NULL,
    description text,
    category text,
    customer_name text,
    customer_email text,
    customer_phone text,
    date date NOT NULL DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount decimal(10, 2) NOT NULL,
    description text,
    category text NOT NULL,
    vendor text,
    date date NOT NULL DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    invoice_number text UNIQUE NOT NULL,
    customer_name text NOT NULL,
    customer_email text,
    customer_phone text,
    customer_address text,
    items jsonb NOT NULL,
    subtotal decimal(10, 2) NOT NULL,
    tax decimal(10, 2) DEFAULT 0,
    total decimal(10, 2) NOT NULL,
    status text DEFAULT 'draft',
    date date NOT NULL DEFAULT CURRENT_DATE,
    due_date date,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.delivery_notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    note_number text UNIQUE NOT NULL,
    customer_name text NOT NULL,
    customer_address text,
    items jsonb NOT NULL,
    date date NOT NULL DEFAULT CURRENT_DATE,
    delivered_by text,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS sales_user_id_idx ON public.sales(user_id);
CREATE INDEX IF NOT EXISTS sales_date_idx ON public.sales(date);
CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS expenses_date_idx ON public.expenses(date);
CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS delivery_notes_user_id_idx ON public.delivery_notes(user_id);

alter publication supabase_realtime add table sales;
alter publication supabase_realtime add table expenses;
alter publication supabase_realtime add table invoices;
alter publication supabase_realtime add table delivery_notes;