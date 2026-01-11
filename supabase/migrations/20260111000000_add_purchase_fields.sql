-- Add new columns to the purchases table to match Sale dialog options
ALTER TABLE public.purchases
ADD COLUMN IF NOT EXISTS paid BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS payment_type TEXT,
ADD COLUMN IF NOT EXISTS supplier_phone TEXT;

-- Update comments for documentation
COMMENT ON COLUMN public.purchases.paid IS 'Indicates if the purchase has been paid';
COMMENT ON COLUMN public.purchases.due_date IS 'The date when the payment is due if not paid';
COMMENT ON COLUMN public.purchases.payment_type IS 'Method of payment (Cash, Online, UPI)';
COMMENT ON COLUMN public.purchases.supplier_phone IS 'Phone number of the supplier';
