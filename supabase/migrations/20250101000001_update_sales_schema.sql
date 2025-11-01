-- Migration: Update sales table to match new invoice structure
-- This migration updates the sales table from the old structure (amount, description, category, etc.)
-- to the new invoice structure (items, grand_total, customer_name, etc.)

-- Step 1: Drop old columns that are no longer needed
ALTER TABLE public.sales
DROP COLUMN IF EXISTS amount,
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS category,
DROP COLUMN IF EXISTS customer_email,
DROP COLUMN IF EXISTS customer_phone;

-- Step 2: Add new columns for the invoice structure
ALTER TABLE public.sales
ADD COLUMN IF NOT EXISTS items JSONB,
ADD COLUMN IF NOT EXISTS grand_total DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS salesman_name_footer TEXT,
ADD COLUMN IF NOT EXISTS customer_phone_footer TEXT;

-- Step 3: Update existing data (optional - only if you want to migrate existing data)
-- Note: If you have existing data, you may need to convert it or set default values
-- For now, we'll leave existing rows with NULL values for new columns

-- Step 4: Add comments to document the new structure
COMMENT ON COLUMN public.sales.items IS 'JSONB array of invoice items with structure: [{no: number, description: string, qty: number, unitPrice: number}]';
COMMENT ON COLUMN public.sales.grand_total IS 'Total amount calculated from all items (quantity * unitPrice) summed';
COMMENT ON COLUMN public.sales.customer_name IS 'Name of the customer (same as receiver)';
COMMENT ON COLUMN public.sales.salesman_name_footer IS 'Name of the salesman who processed the sale';
COMMENT ON COLUMN public.sales.customer_phone_footer IS 'Customer phone number from the invoice footer';

