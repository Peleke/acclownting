-- Seed data for development/testing
-- Note: Users must be created through Supabase Auth; profiles are auto-created via trigger.
-- This seed assumes at least one user exists and seeds clients/invoices/payments.

-- Insert test clients
insert into clients (id, name, email, phone, address) values
  ('a1111111-1111-4111-8111-111111111111', 'Acme Corp', 'billing@acme.com', '555-0100', '123 Main St, Springfield'),
  ('a2222222-2222-4222-8222-222222222222', 'Globex Inc', 'ap@globex.com', '555-0200', '456 Oak Ave, Shelbyville'),
  ('a3333333-3333-4333-8333-333333333333', 'Initech LLC', 'invoices@initech.com', '555-0300', '789 Pine Rd, Capital City');
