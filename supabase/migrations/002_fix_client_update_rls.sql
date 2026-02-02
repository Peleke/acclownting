-- Fix: Allow authenticated users to update clients
-- Issue: RLS policy was restricting client updates to admins only,
-- causing silent failures when non-admin users tried to edit clients.

-- Drop the restrictive admin-only policy
drop policy if exists "Admins can update clients" on clients;

-- Create new policy allowing all authenticated users to update clients
create policy "Authenticated users can update clients"
  on clients for update to authenticated using (true);
