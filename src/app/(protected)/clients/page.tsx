import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ClientsListClient } from './clients-list-client';

export default async function ClientsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('name');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-stone-900 tracking-tight">Clients</h1>
        <ClientsListClient />
      </div>
      <div className="bg-white rounded-xl border border-stone-200/60 shadow-card overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Name</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Email</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Phone</th>
            </tr>
          </thead>
          <tbody>
            {clients?.map((client, idx) => (
              <tr key={client.id} className={`hover:bg-stone-50/60 ${idx !== (clients?.length ?? 0) - 1 ? 'border-b border-stone-100/80' : ''}`}>
                <td className="px-5 py-3.5 text-sm">
                  <Link href={`/clients/${client.id}`} className="text-stone-900 font-medium hover:text-accent-600">
                    {client.name}
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-sm text-stone-500">{client.email || '-'}</td>
                <td className="px-5 py-3.5 text-sm text-stone-500">{client.phone || '-'}</td>
              </tr>
            ))}
            {(!clients || clients.length === 0) && (
              <tr>
                <td colSpan={3} className="px-5 py-12 text-center text-sm text-stone-400">
                  No clients yet. Create your first client to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
