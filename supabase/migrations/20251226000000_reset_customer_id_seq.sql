-- Migration to reset customer_id sequence after deletion
-- This ensures that if the last customer is deleted, the next one added will reuse the ID
-- preventing gaps at the end of the sequence.

CREATE OR REPLACE FUNCTION public.reset_customer_id_seq()
RETURNS TRIGGER AS $$
DECLARE
    max_id INTEGER;
BEGIN
    SELECT MAX(customer_id) INTO max_id FROM public.customers;
    
    IF max_id IS NULL THEN
        -- Table is empty, reset to 1
        PERFORM setval('public.customers_customer_id_seq', 1, false);
    ELSE
        -- Reset to max_id
        PERFORM setval('public.customers_customer_id_seq', max_id, true);
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger to run after any delete operation
DROP TRIGGER IF EXISTS tr_reset_customer_id_seq ON public.customers;
CREATE TRIGGER tr_reset_customer_id_seq
AFTER DELETE ON public.customers
FOR EACH STATEMENT
EXECUTE FUNCTION public.reset_customer_id_seq();
