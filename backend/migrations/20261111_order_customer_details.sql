ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_name text,
  ADD COLUMN IF NOT EXISTS customer_email text;

UPDATE public.orders AS concert_order
SET customer_name = users.name,
    customer_email = users.email
FROM public.users AS users
WHERE users.id = concert_order.user_id
  AND (
    concert_order.customer_name IS NULL
    OR concert_order.customer_email IS NULL
  );
