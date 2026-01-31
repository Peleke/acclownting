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
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <ClientsListClient />
      </div>
      <div className="bg-white rounded-lg shadow border overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {clients?.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  <Link href={`/clients/${client.id}`} className="text-blue-600 hover:underline">
                    {client.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{client.email || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{client.phone || '-'}</td>
              </tr>
            ))}
            {(!clients || clients.length === 0) && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
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
