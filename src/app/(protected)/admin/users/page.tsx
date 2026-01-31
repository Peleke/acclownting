import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AdminUsersClient } from './admin-users-client';

export default async function AdminUsersPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (currentProfile?.role !== 'admin') {
    redirect('/dashboard');
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-stone-900 tracking-tight">User Management</h1>
        <AdminUsersClient />
      </div>
      <div className="bg-white rounded-xl border border-stone-200/60 shadow-card overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Name</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Role</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody>
            {profiles?.map((p, idx) => (
              <tr key={p.id} className={idx !== (profiles?.length ?? 0) - 1 ? 'border-b border-stone-100/80' : ''}>
                <td className="px-5 py-3.5 text-sm text-stone-700 font-medium">{p.full_name}</td>
                <td className="px-5 py-3.5 text-sm">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize ${
                    p.role === 'admin' ? 'bg-accent-50 text-accent-700' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {p.role}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sm text-stone-500">
                  {new Date(p.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
