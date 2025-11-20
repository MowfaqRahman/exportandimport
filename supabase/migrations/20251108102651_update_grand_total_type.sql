-- Alter grand_total column type in public.sales table
ALTER TABLE public.sales
ALTER COLUMN grand_total TYPE DECIMAL(10, 2) USING grand_total::text::DECIMAL(10, 2);





