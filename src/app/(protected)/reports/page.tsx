import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import { ReportFilters } from '@/components/report-filters';

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const { start, end } = await searchParams;
  const supabase = await createServerSupabaseClient();

  let report = null;
  let balances = null;

  if (start && end) {
    const { data } = await supabase.rpc('get_revenue_report', {
      start_date: start,
      end_date: end,
    });
    report = data?.[0] || null;
  }

  const { data: balanceData } = await supabase.rpc('get_client_balances');
  balances = balanceData;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports</h1>

      <div className="bg-white rounded-lg shadow border p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Revenue Report</h2>
        <ReportFilters />
        {report && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Total Invoiced</p>
              <p className="text-xl font-bold">{formatCurrency(report.total_invoiced)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(report.total_paid)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Outstanding</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(report.total_outstanding)}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Client Balances</h2>
        <div className="overflow-x-auto">
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
                  <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(b.balance)}</td>
                </tr>
              ))}
              {(!balances || balances.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No data.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
