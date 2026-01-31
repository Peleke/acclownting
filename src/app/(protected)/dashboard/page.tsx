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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <p className="text-sm text-gray-600">Invoiced This Month</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_invoiced)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <p className="text-sm text-gray-600">Collected This Month</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.total_paid)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <p className="text-sm text-gray-600">Total Outstanding</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOwed)}</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Balances</h2>
      <div className="bg-white rounded-lg shadow border overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Invoiced</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Paid</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {balances?.map((b: { client_id: string; client_name: string; total_invoiced: number; total_paid: number; balance: number }) => (
              <tr key={b.client_id}>
                <td className="px-4 py-3 text-sm">{b.client_name}</td>
                <td className="px-4 py-3 text-sm text-right">{formatCurrency(b.total_invoiced)}</td>
                <td className="px-4 py-3 text-sm text-right">{formatCurrency(b.total_paid)}</td>
                <td className="px-4 py-3 text-sm text-right font-medium">
                  {formatCurrency(b.balance)}
                </td>
              </tr>
            ))}
            {(!balances || balances.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
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
