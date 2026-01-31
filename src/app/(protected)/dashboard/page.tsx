import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const { data: report } = await supabase.rpc('get_revenue_report', {
    start_date: startOfMonth,
    end_date: endOfMonth,
  });

  const { data: balances } = await supabase.rpc('get_client_balances');

  const totalOwed = balances?.reduce((sum: number, b: { balance: number }) => sum + b.balance, 0) || 0;

  const stats = report?.[0] || { total_invoiced: 0, total_paid: 0, total_outstanding: 0 };

  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900 tracking-tight mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-white rounded-xl border border-stone-200/60 shadow-card p-5">
          <p className="text-[13px] font-medium text-stone-400 mb-1">Invoiced This Month</p>
          <p className="text-2xl font-semibold text-stone-900 tracking-tight">{formatCurrency(stats.total_invoiced)}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200/60 shadow-card p-5">
          <p className="text-[13px] font-medium text-stone-400 mb-1">Collected This Month</p>
          <p className="text-2xl font-semibold text-emerald-600 tracking-tight">{formatCurrency(stats.total_paid)}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200/60 shadow-card p-5">
          <p className="text-[13px] font-medium text-stone-400 mb-1">Total Outstanding</p>
          <p className="text-2xl font-semibold text-amber-600 tracking-tight">{formatCurrency(totalOwed)}</p>
        </div>
      </div>

      <h2 className="text-sm font-semibold text-stone-900 mb-3">Client Balances</h2>
      <div className="bg-white rounded-xl border border-stone-200/60 shadow-card overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Client</th>
              <th className="px-5 py-3 text-right text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Invoiced</th>
              <th className="px-5 py-3 text-right text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Paid</th>
              <th className="px-5 py-3 text-right text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Balance</th>
            </tr>
          </thead>
          <tbody>
            {balances?.map((b: { client_id: string; client_name: string; total_invoiced: number; total_paid: number; balance: number }, idx: number) => (
              <tr key={b.client_id} className={idx !== (balances?.length ?? 0) - 1 ? 'border-b border-stone-100/80' : ''}>
                <td className="px-5 py-3.5 text-sm text-stone-700 font-medium">{b.client_name}</td>
                <td className="px-5 py-3.5 text-sm text-stone-500 text-right tabular-nums">{formatCurrency(b.total_invoiced)}</td>
                <td className="px-5 py-3.5 text-sm text-stone-500 text-right tabular-nums">{formatCurrency(b.total_paid)}</td>
                <td className="px-5 py-3.5 text-sm text-right font-semibold text-stone-900 tabular-nums">
                  {formatCurrency(b.balance)}
                </td>
              </tr>
            ))}
            {(!balances || balances.length === 0) && (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-sm text-stone-400">
                  No client data yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
