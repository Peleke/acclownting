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
      <h1 className="text-xl font-semibold text-stone-900 tracking-tight mb-6">Reports</h1>

      <div className="bg-white rounded-xl border border-stone-200/60 shadow-card p-6 mb-6">
        <h2 className="text-sm font-semibold text-stone-900 mb-4">Revenue Report</h2>
        <ReportFilters />
        {report && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
              <p className="text-[13px] font-medium text-stone-400 mb-1">Total Invoiced</p>
              <p className="text-xl font-semibold text-stone-900 tabular-nums tracking-tight">{formatCurrency(report.total_invoiced)}</p>
            </div>
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
              <p className="text-[13px] font-medium text-stone-400 mb-1">Total Paid</p>
              <p className="text-xl font-semibold text-emerald-600 tabular-nums tracking-tight">{formatCurrency(report.total_paid)}</p>
            </div>
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
              <p className="text-[13px] font-medium text-stone-400 mb-1">Outstanding</p>
              <p className="text-xl font-semibold text-amber-600 tabular-nums tracking-tight">{formatCurrency(report.total_outstanding)}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-stone-200/60 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <h2 className="text-sm font-semibold text-stone-900">Client Balances</h2>
        </div>
        <div className="overflow-x-auto">
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
                  <td className="px-5 py-3.5 text-sm text-right font-semibold text-stone-900 tabular-nums">{formatCurrency(b.balance)}</td>
                </tr>
              ))}
              {(!balances || balances.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-sm text-stone-400">No data.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
