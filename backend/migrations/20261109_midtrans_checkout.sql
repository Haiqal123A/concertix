ALTER TABLE public.ticket_types
  ADD COLUMN IF NOT EXISTS reserved integer NOT NULL DEFAULT 0;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS ticket_reserved boolean NOT NULL DEFAULT false;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS gateway_order_id text,
  ADD COLUMN IF NOT EXISTS snap_token text,
  ADD COLUMN IF NOT EXISTS redirect_url text;

CREATE UNIQUE INDEX IF NOT EXISTS payments_gateway_order_id_unique
  ON public.payments (gateway_order_id)
  WHERE gateway_order_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.create_order_with_reservations(
  p_user_id bigint,
  p_items jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  item record;
  ticket_row public.ticket_types%ROWTYPE;
  created_order public.orders%ROWTYPE;
  created_items jsonb;
  order_total numeric := 0;
BEGIN
  IF jsonb_typeof(p_items) IS DISTINCT FROM 'array'
    OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Minimal harus ada 1 tiket';
  END IF;

  FOR item IN
    SELECT ticket_type_id, SUM(quantity)::integer AS quantity
    FROM jsonb_to_recordset(p_items) AS requested(ticket_type_id bigint, quantity integer)
    GROUP BY ticket_type_id
    ORDER BY ticket_type_id
  LOOP
    IF item.ticket_type_id IS NULL OR item.quantity IS NULL OR item.quantity <= 0 THEN
      RAISE EXCEPTION 'Item tiket tidak valid';
    END IF;

    SELECT * INTO ticket_row
    FROM public.ticket_types
    WHERE id = item.ticket_type_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Tipe tiket % tidak ditemukan', item.ticket_type_id;
    END IF;

    IF COALESCE(ticket_row.stock, 0) - COALESCE(ticket_row.sold, 0)
      - COALESCE(ticket_row.reserved, 0) < item.quantity THEN
      RAISE EXCEPTION 'Stok tiket % tidak mencukupi', ticket_row.name;
    END IF;

    order_total := order_total + (ticket_row.price * item.quantity);
  END LOOP;

  INSERT INTO public.orders (
    user_id,
    total_price,
    status,
    payment_status,
    ticket_reserved
  )
  VALUES (p_user_id, order_total, 'pending', 'unpaid', false)
  RETURNING * INTO created_order;

  FOR item IN
    SELECT ticket_type_id, SUM(quantity)::integer AS quantity
    FROM jsonb_to_recordset(p_items) AS requested(ticket_type_id bigint, quantity integer)
    GROUP BY ticket_type_id
    ORDER BY ticket_type_id
  LOOP
    SELECT * INTO ticket_row
    FROM public.ticket_types
    WHERE id = item.ticket_type_id;

    INSERT INTO public.order_items (
      order_id,
      ticket_type_id,
      quantity,
      price,
      subtotal
    )
    VALUES (
      created_order.id,
      item.ticket_type_id,
      item.quantity,
      ticket_row.price,
      ticket_row.price * item.quantity
    );
  END LOOP;

  SELECT COALESCE(jsonb_agg(to_jsonb(order_item)), '[]'::jsonb)
  INTO created_items
  FROM public.order_items AS order_item
  WHERE order_item.order_id = created_order.id;

  RETURN jsonb_build_object(
    'order', to_jsonb(created_order),
    'items', created_items
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.reserve_existing_order(
  p_order_id bigint,
  p_user_id bigint
)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  order_row public.orders%ROWTYPE;
  item record;
  ticket_row public.ticket_types%ROWTYPE;
BEGIN
  SELECT * INTO order_row
  FROM public.orders
  WHERE id = p_order_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order tidak ditemukan';
  END IF;

  IF order_row.payment_status = 'paid' THEN
    RAISE EXCEPTION 'Order ini sudah dibayar';
  END IF;

  IF order_row.ticket_reserved THEN
    RETURN;
  END IF;

  FOR item IN
    SELECT ticket_type_id, SUM(quantity)::integer AS quantity
    FROM public.order_items
    WHERE order_id = p_order_id
    GROUP BY ticket_type_id
    ORDER BY ticket_type_id
  LOOP
    SELECT * INTO ticket_row
    FROM public.ticket_types
    WHERE id = item.ticket_type_id
    FOR UPDATE;

    IF NOT FOUND OR COALESCE(ticket_row.stock, 0) - COALESCE(ticket_row.sold, 0)
      - COALESCE(ticket_row.reserved, 0) < item.quantity THEN
      RAISE EXCEPTION 'Stok tiket tidak mencukupi untuk melanjutkan pembayaran';
    END IF;

    UPDATE public.ticket_types
    SET reserved = reserved + item.quantity
    WHERE id = item.ticket_type_id;
  END LOOP;

  UPDATE public.orders
  SET ticket_reserved = true
  WHERE id = p_order_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.apply_midtrans_payment_notification(
  p_gateway_order_id text,
  p_payment_state text
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  payment_row public.payments%ROWTYPE;
  order_row public.orders%ROWTYPE;
  item record;
  ticket_row public.ticket_types%ROWTYPE;
BEGIN
  SELECT * INTO payment_row
  FROM public.payments
  WHERE gateway_order_id = p_gateway_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaksi Midtrans tidak ditemukan';
  END IF;

  SELECT * INTO order_row
  FROM public.orders
  WHERE id = payment_row.order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order tidak ditemukan';
  END IF;

  IF order_row.payment_status = 'paid' THEN
    RETURN jsonb_build_object('state', 'paid', 'already_processed', true);
  END IF;

  IF p_payment_state = 'paid' THEN
    IF NOT order_row.ticket_reserved THEN
      RAISE EXCEPTION 'Tiket tidak sedang direservasi untuk order ini';
    END IF;

    FOR item IN
      SELECT ticket_type_id, SUM(quantity)::integer AS quantity
      FROM public.order_items
      WHERE order_id = order_row.id
      GROUP BY ticket_type_id
      ORDER BY ticket_type_id
    LOOP
      SELECT * INTO ticket_row
      FROM public.ticket_types
      WHERE id = item.ticket_type_id
      FOR UPDATE;

      IF NOT FOUND OR ticket_row.reserved < item.quantity THEN
        RAISE EXCEPTION 'Reservasi tiket tidak valid';
      END IF;

      UPDATE public.ticket_types
      SET reserved = reserved - item.quantity,
          sold = COALESCE(sold, 0) + item.quantity
      WHERE id = item.ticket_type_id;
    END LOOP;

    UPDATE public.payments
    SET status = 'paid',
        payment_date = now()
    WHERE id = payment_row.id;

    UPDATE public.orders
    SET payment_status = 'paid',
        status = 'confirmed',
        ticket_reserved = false
    WHERE id = order_row.id;

    RETURN jsonb_build_object('state', 'paid', 'already_processed', false);
  END IF;

  IF p_payment_state = 'failed' THEN
    IF order_row.ticket_reserved THEN
      FOR item IN
        SELECT ticket_type_id, SUM(quantity)::integer AS quantity
        FROM public.order_items
        WHERE order_id = order_row.id
        GROUP BY ticket_type_id
        ORDER BY ticket_type_id
      LOOP
        SELECT * INTO ticket_row
        FROM public.ticket_types
        WHERE id = item.ticket_type_id
        FOR UPDATE;

        IF NOT FOUND OR ticket_row.reserved < item.quantity THEN
          RAISE EXCEPTION 'Reservasi tiket tidak valid';
        END IF;

        UPDATE public.ticket_types
        SET reserved = reserved - item.quantity
        WHERE id = item.ticket_type_id;
      END LOOP;
    END IF;

    UPDATE public.payments
    SET status = 'rejected'
    WHERE id = payment_row.id;

    UPDATE public.orders
    SET payment_status = 'unpaid',
        status = 'pending',
        ticket_reserved = false
    WHERE id = order_row.id;

    RETURN jsonb_build_object('state', 'failed', 'already_processed', false);
  END IF;

  UPDATE public.payments
  SET status = 'pending'
  WHERE id = payment_row.id;

  UPDATE public.orders
  SET payment_status = 'pending'
  WHERE id = order_row.id;

  RETURN jsonb_build_object('state', 'pending', 'already_processed', false);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_order_with_reservations(bigint, jsonb)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reserve_existing_order(bigint, bigint)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.apply_midtrans_payment_notification(text, text)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.create_order_with_reservations(bigint, jsonb)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.reserve_existing_order(bigint, bigint)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.apply_midtrans_payment_notification(text, text)
  TO service_role;
