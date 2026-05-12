create table if not exists public.orders (
  id                   uuid        primary key default gen_random_uuid(),
  stripe_session_id    text        unique not null,
  customer_name        text        not null,
  customer_email       text        not null,
  customer_phone       text,
  delivery_street      text        not null,
  delivery_city        text        not null,
  delivery_postcode    text        not null,
  delivery_country     text        not null default 'DE',
  quantity             int         not null default 1,
  amount_total         int,
  currency             text        default 'eur',
  status               text        not null default 'pending'
    check (status in (
      'pending', 'paid', 'delivery_created',
      'courier_assigned', 'picked_up', 'delivered',
      'cancelled', 'failed'
    )),
  just_eat_delivery_id   text,
  just_eat_tracking_url  text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists orders_stripe_session_id_idx   on public.orders (stripe_session_id);
create index if not exists orders_just_eat_delivery_id_idx on public.orders (just_eat_delivery_id);
create index if not exists orders_created_at_idx          on public.orders (created_at desc);
create index if not exists orders_status_idx              on public.orders (status);

alter table public.orders enable row level security;

-- All writes go through the service-role key in serverless functions; no public access.
