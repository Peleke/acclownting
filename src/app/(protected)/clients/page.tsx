import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ClientsListClient } from './clients-list-client';
import { ClientSearch } from './client-search';

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createServerSupabaseClient();
  let query = supabase.from('clients').select('*').order('name');
  if (q) {
    query = query.ilike('name', `%${q}%`);
  }
  const { data: clients } = await query;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground tracking-tight">Clients</h1>
        <ClientsListClient />
      </div>
      <div className="mb-4">
        <ClientSearch defaultValue={q ?? ''} />
      </div>
      <div className="bg-card rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Phone</th>
            </tr>
          </thead>
          <tbody>
            {clients?.map((client, idx) => (
              <tr key={client.id} className={`hover:bg-muted/50 ${idx !== (clients?.length ?? 0) - 1 ? 'border-b border-border/30' : ''}`}>
                <td className="px-5 py-3.5 text-sm">
                  <Link href={`/clients/${client.id}`} className="text-foreground font-medium hover:text-primary">
                    {client.name}
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground">{client.email || '-'}</td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground">{client.phone || '-'}</td>
              </tr>
            ))}
            {(!clients || clients.length === 0) && (
              <tr>
                <td colSpan={3} className="px-5 py-12 text-center text-sm text-muted-foreground">
                  {q ? 'No clients match your search.' : 'No clients yet. Create your first client to get started.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
