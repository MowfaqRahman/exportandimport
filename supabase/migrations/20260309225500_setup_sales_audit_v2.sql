-- Migration to implement comprehensive auditing for sales
-- This handles UPDATE and DELETE operations, logging them to sales_audit.

-- 1. Ensure sales_audit table exists
CREATE TABLE IF NOT EXISTS public.sales_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL,
    editor_user_id UUID,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    old_data JSONB,
    new_data JSONB
);

-- 2. Enable RLS on sales_audit (if not already)
ALTER TABLE public.sales_audit ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policy for admins to view all audit logs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'sales_audit' AND policyname = 'Admins can view all audit logs'
    ) THEN
        CREATE POLICY "Admins can view all audit logs" ON public.sales_audit
        FOR SELECT TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.users
                WHERE users.id = auth.uid() AND users.role = 'admin'
            )
        );
    END IF;
END
$$;

-- 4. Create the audit trigger function
CREATE OR REPLACE FUNCTION public.proc_audit_sales_changes()
RETURNS TRIGGER AS $$
DECLARE
    editor_id UUID;
BEGIN
    -- Try to get the user ID from the Supabase auth context
    BEGIN
        editor_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        editor_id := NULL;
    END;

    IF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.sales_audit (sale_id, editor_user_id, old_data, new_data)
        VALUES (OLD.id, editor_id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO public.sales_audit (sale_id, editor_user_id, old_data, new_data)
        VALUES (OLD.id, editor_id, to_jsonb(OLD), NULL);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Attach the trigger to the sales table
DROP TRIGGER IF EXISTS trg_audit_sales_changes ON public.sales;
CREATE TRIGGER trg_audit_sales_changes
AFTER UPDATE OR DELETE ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.proc_audit_sales_changes();
