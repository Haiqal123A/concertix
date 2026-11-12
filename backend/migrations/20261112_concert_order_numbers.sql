CREATE TABLE IF NOT EXISTS public.concert_order_counters (
  concert_id bigint PRIMARY KEY REFERENCES public.concerts(id) ON DELETE CASCADE,
  last_number bigint NOT NULL DEFAULT 0 CHECK (last_number >= 0)
);

CREATE TABLE IF NOT EXISTS public.concert_order_numbers (
  order_id bigint NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  concert_id bigint NOT NULL REFERENCES public.concerts(id) ON DELETE CASCADE,
  order_number bigint NOT NULL CHECK (order_number > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (order_id, concert_id),
  UNIQUE (concert_id, order_number)
);

ALTER TABLE public.concert_order_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concert_order_numbers ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.concert_order_numbers TO service_role;

WITH concert_orders AS (
  SELECT
    concert_order.id AS order_id,
    ticket.concert_id,
    concert_order.created_at
  FROM public.orders AS concert_order
  JOIN public.order_items AS item
    ON item.order_id = concert_order.id
  JOIN public.ticket_types AS ticket
    ON ticket.id = item.ticket_type_id
  GROUP BY concert_order.id, ticket.concert_id, concert_order.created_at
),
numbered_orders AS (
  SELECT
    order_id,
    concert_id,
    row_number() OVER (
      PARTITION BY concert_id
      ORDER BY created_at, order_id
    ) AS order_number
  FROM concert_orders
)
INSERT INTO public.concert_order_numbers (
  order_id,
  concert_id,
  order_number
)
SELECT order_id, concert_id, order_number
FROM numbered_orders
ON CONFLICT DO NOTHING;

INSERT INTO public.concert_order_counters (concert_id, last_number)
SELECT concert_id, MAX(order_number)
FROM public.concert_order_numbers
GROUP BY concert_id
ON CONFLICT (concert_id) DO UPDATE
SET last_number = GREATEST(
  public.concert_order_counters.last_number,
  EXCLUDED.last_number
);

CREATE OR REPLACE FUNCTION public.assign_concert_order_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_concert_id bigint;
  next_order_number bigint;
BEGIN
  SELECT concert_id
  INTO target_concert_id
  FROM public.ticket_types
  WHERE id = NEW.ticket_type_id;

  IF target_concert_id IS NULL OR EXISTS (
    SELECT 1
    FROM public.concert_order_numbers
    WHERE order_id = NEW.order_id
      AND concert_id = target_concert_id
  ) THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.concert_order_counters AS counter (
    concert_id,
    last_number
  )
  VALUES (target_concert_id, 1)
  ON CONFLICT (concert_id) DO UPDATE
  SET last_number = counter.last_number + 1
  RETURNING last_number INTO next_order_number;

  INSERT INTO public.concert_order_numbers (
    order_id,
    concert_id,
    order_number
  )
  VALUES (NEW.order_id, target_concert_id, next_order_number)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS assign_concert_order_number_after_item
  ON public.order_items;

CREATE TRIGGER assign_concert_order_number_after_item
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.assign_concert_order_number();

REVOKE EXECUTE ON FUNCTION public.assign_concert_order_number()
  FROM PUBLIC, anon, authenticated;

NOTIFY pgrst, 'reload schema';
