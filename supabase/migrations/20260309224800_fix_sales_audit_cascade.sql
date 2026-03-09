-- Migration to fix the cascade delete on sales_audit table
-- This will ensure that when a sale is deleted, its audit history remains in the database.

DO $$
BEGIN
    -- We try to find any foreign key constraint on sales_audit that references sales table on the sale_id column
    -- and drop it so we can recreated it with ON DELETE SET NULL or just as a non-cascading reference.
    
    DECLARE 
        const_record RECORD;
    BEGIN
        FOR const_record IN (
            SELECT tc.constraint_name 
            FROM information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' 
              AND tc.table_name = 'sales_audit' 
              AND kcu.column_name = 'sale_id'
        ) LOOP
            EXECUTE 'ALTER TABLE public.sales_audit DROP CONSTRAINT IF EXISTS ' || const_record.constraint_name;
        END LOOP;
    END;
END $$;

-- Add a new foreign key constraint with ON DELETE NO ACTION (or SET NULL)
-- Actually, ON DELETE SET NULL is better if we want to explicitly know the sale is gone, 
-- but it wipes out the sale_id. 
-- ON DELETE NO ACTION would prevent the sale from being deleted if audit exists.
-- The BEST way is to have NO foreign key constraint OR a constraint with ON DELETE SET NULL if we have other fields.
-- But wait, if we want to keep the sale_id, we should just not have a foreign key constraint at all, 
-- or have one that doesn't cascade.

-- Let's use SET NULL so the UI can easily detect a deleted sale while keeping the audit record.
-- However, if we lose the sale_id, we can't easily join.
-- If we keep the sale_id but remove the constraint, we can still join but it will be null for missing rows.

-- Given the requirements, we'll remove the constraint so the record stays exactly as it is (with the sale_id).
-- This allows the UI to say "Deleted Sale" for that sale_id.

-- We already dropped the constraint in the DO block. 
-- If we want to keep it as a loose reference, we just don't add it back.
-- Or we add it back with ON DELETE NO ACTION if we want to force something else (not good).
-- Let's add it back with NO ACTION but making it non-restrictive? No.
-- We'll just leave it without the constraint for now, or add a SET NULL one if that's preferred.
-- Actually, the user wants it to SHOW as deleted. 

-- Let's go with dropping the constraint so it doesn't cascade.
