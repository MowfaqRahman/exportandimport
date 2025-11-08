-- Add the search_sales_by_product_name function
CREATE OR REPLACE FUNCTION public.search_sales_by_product_name(
    search_term TEXT,
    user_uuid UUID
)
RETURNS SETOF public.sales
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT s.*
    FROM public.sales s,
         jsonb_array_elements(s.items) as item
    WHERE item->>'productName' ILIKE '%' || search_term || '%'
      AND s.user_id = user_uuid;
END;
$$;
