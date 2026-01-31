-- Acclownting: Initial Schema Migration

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Enums
create type user_role as enum ('admin', 'staff');
create type invoice_status as enum ('draft', 'sent', 'partial', 'paid', 'overdue');
create type payment_method as enum ('cash', 'check', 'card', 'transfer');

-- Profiles
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null,
  role user_role not null default 'staff',
  created_at timestamptz not null default now()
);

-- Clients
create table clients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid,
  name text not null,
  email text,
  phone text,
  address text,
  created_at timestamptz not null default now()
);

-- Invoices
create table invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number serial,
  client_id uuid not null references clients(id) on delete restrict,
  status invoice_status not null default 'draft',
  due_date date,
  line_items jsonb not null default '[]'::jsonb,
  subtotal numeric(12,2) not null default 0,
  tax_rate numeric(5,4) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  notes text,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

-- Payments
create table payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete restrict,
  amount numeric(12,2) not null,
  method payment_method not null,
  reference text,
  received_at timestamptz not null default now(),
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_invoices_client on invoices(client_id);
create index idx_invoices_status on invoices(status);
create index idx_payments_invoice on payments(invoice_id);
create index idx_invoices_created_by on invoices(created_by);

-- RLS
alter table profiles enable row level security;
alter table clients enable row level security;
alter table invoices enable row level security;
alter table payments enable row level security;

-- Profiles policies
create policy "Authenticated users can view profiles"
  on profiles for select to authenticated using (true);
create policy "Users can update own profile"
  on profiles for update to authenticated using (id = auth.uid());
create policy "Admins can insert profiles"
  on profiles for insert to authenticated
  with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
    or id = auth.uid()
  );

-- Clients policies
create policy "Authenticated users can view clients"
  on clients for select to authenticated using (true);
create policy "Authenticated users can create clients"
  on clients for insert to authenticated with check (true);
create policy "Admins can update clients"
  on clients for update to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can delete clients"
  on clients for delete to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Invoices policies
create policy "Authenticated users can view invoices"
  on invoices for select to authenticated using (true);
create policy "Authenticated users can create invoices"
  on invoices for insert to authenticated with check (true);
create policy "Users can update own invoices or admins update any"
  on invoices for update to authenticated
  using (
    created_by = auth.uid()
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Payments policies
create policy "Authenticated users can view payments"
  on payments for select to authenticated using (true);
create policy "Authenticated users can create payments"
  on payments for insert to authenticated with check (true);

-- Function: get_client_balances
create or replace function get_client_balances()
returns table (
  client_id uuid,
  client_name text,
  total_invoiced numeric,
  total_paid numeric,
  balance numeric
) language sql stable security definer as $$
  select
    c.id as client_id,
    c.name as client_name,
    coalesce(sum(i.total), 0) as total_invoiced,
    coalesce(sum(p.paid), 0) as total_paid,
    coalesce(sum(i.total), 0) - coalesce(sum(p.paid), 0) as balance
  from clients c
  left join invoices i on i.client_id = c.id
  left join (
    select invoice_id, sum(amount) as paid
    from payments
    group by invoice_id
  ) p on p.invoice_id = i.id
  group by c.id, c.name;
$$;

-- Function: get_revenue_report
create or replace function get_revenue_report(start_date date, end_date date)
returns table (
  total_invoiced numeric,
  total_paid numeric,
  total_outstanding numeric
) language sql stable security definer as $$
  select
    coalesce((
      select sum(total) from invoices
      where created_at >= start_date and created_at < end_date + interval '1 day'
    ), 0) as total_invoiced,
    coalesce((
      select sum(amount) from payments
      where received_at >= start_date and received_at < end_date + interval '1 day'
    ), 0) as total_paid,
    coalesce((
      select sum(i.total) - coalesce(sum(p_sum.paid), 0)
      from invoices i
      left join (
        select invoice_id, sum(amount) as paid from payments group by invoice_id
      ) p_sum on p_sum.invoice_id = i.id
      where i.status not in ('paid')
        and i.created_at >= start_date
        and i.created_at < end_date + interval '1 day'
    ), 0) as total_outstanding;
$$;

-- Trigger: auto-update invoice status on payment
create or replace function update_invoice_status_on_payment()
returns trigger language plpgsql security definer as $$
declare
  inv_total numeric;
  paid_total numeric;
begin
  select total into inv_total from invoices where id = new.invoice_id;
  select coalesce(sum(amount), 0) into paid_total from payments where invoice_id = new.invoice_id;

  if paid_total >= inv_total then
    update invoices set status = 'paid' where id = new.invoice_id;
  elsif paid_total > 0 then
    update invoices set status = 'partial' where id = new.invoice_id;
  end if;

  return new;
end;
$$;

create trigger trg_update_invoice_status
  after insert on payments
  for each row execute function update_invoice_status_on_payment();

-- Handle new user signup: create profile
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'staff');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
