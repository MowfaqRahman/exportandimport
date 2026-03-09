-- =========================================================
-- ULTIMATE FIX FOR SALES HISTORY (RUN THIS IN SUPABASE SQL EDITOR)
-- =========================================================

-- 1. First, we need to ensure the sales_audit table doesn't have a cascading delete.
-- The most reliable way is to drop the foreign key constraint entirely.
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tc.constraint_name 
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.table_name = 'sales_audit' 
          AND tc.constraint_type = 'FOREIGN KEY'
    ) LOOP
        EXECUTE 'ALTER TABLE public.sales_audit DROP CONSTRAINT ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- 2. Ensure the table has the correct structure for our manual auditing
-- (In case it was created differently)
CREATE TABLE IF NOT EXISTS public.sales_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL,
    editor_user_id UUID,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    old_data JSONB,
    new_data JSONB
);

-- 3. ENABLE RLS and Add Policies so the Web App can insert logs
ALTER TABLE public.sales_audit ENABLE ROW LEVEL SECURITY;

-- Allow ANY authenticated user to insert an audit log (so deletions/edits are tracked)
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.sales_audit;
CREATE POLICY "Enable insert for authenticated users" ON public.sales_audit
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow admins to view all audit logs
DROP POLICY IF EXISTS "Admins can view all logs" ON public.sales_audit;
CREATE POLICY "Admins can view all logs" ON public.sales_audit
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- 4. Database Trigger (Full Backup)
-- This trigger will catch ANY delete/update that might be missed by the web app
CREATE OR REPLACE FUNCTION public.proc_audit_sales_v3()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.sales_audit (sale_id, editor_user_id, old_data, new_data)
        VALUES (OLD.id, auth.uid(), to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        -- CRITICAL: Store the snapshot before the sale is gone forever
        INSERT INTO public.sales_audit (sale_id, editor_user_id, old_data, new_data)
        VALUES (OLD.id, auth.uid(), to_jsonb(OLD), NULL);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_sales_v3 ON public.sales;
CREATE TRIGGER trg_audit_sales_v3
AFTER UPDATE OR DELETE ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.proc_audit_sales_v3();

-- =========================================================
-- SQL SETUP COMPLETE
-- =========================================================
