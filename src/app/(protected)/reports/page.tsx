import Link from 'next/link';
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

  // FR30: Sensible defaults — default to current month if no date range provided
  const now = new Date();
  const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  const effectiveStart = start || defaultStart;
  const effectiveEnd = end || defaultEnd;

  const { data: reportData, error: reportError } = await supabase.rpc('get_revenue_report', {
    start_date: effectiveStart,
    end_date: effectiveEnd,
  });
  
  if (reportError) {
    console.error('Error fetching revenue report:', reportError);
  }
  
  const report = reportData?.[0] || null;

  const { data: balanceData, error: balanceError } = await supabase.rpc('get_client_balances');
  
  if (balanceError) {
    console.error('Error fetching client balances:', balanceError);
  }
  
  const balances = balanceData;

  // FR31: Identify clients with overdue invoices for visual flagging
  const today = new Date().toISOString().split('T')[0];
  const { data: overdueInvoices } = await supabase
    .from('invoices')
    .select('client_id')
    .in('status', ['sent', 'partial', 'overdue'])
    .lt('due_date', today);
  const overdueClientIds = new Set(overdueInvoices?.map((inv) => inv.client_id) || []);

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground tracking-tight mb-6">Reports</h1>

      <div className="bg-card rounded-xl border border-border shadow-card p-6 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Revenue Report</h2>
        <ReportFilters />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-muted rounded-xl border border-border/50">
            <p className="text-[13px] font-medium text-muted-foreground mb-1">Total Invoiced</p>
            <p className="text-xl font-semibold text-foreground tabular-nums tracking-tight">{formatCurrency(report?.total_invoiced ?? 0)}</p>
          </div>
          <div className="p-4 bg-muted rounded-xl border border-border/50">
            <p className="text-[13px] font-medium text-muted-foreground mb-1">Total Paid</p>
            <p className="text-xl font-semibold text-success tabular-nums tracking-tight">{formatCurrency(report?.total_paid ?? 0)}</p>
          </div>
          <div className="p-4 bg-muted rounded-xl border border-border/50">
            <p className="text-[13px] font-medium text-muted-foreground mb-1">Outstanding</p>
            <p className="text-xl font-semibold text-accent-foreground tabular-nums tracking-tight">{formatCurrency(report?.total_outstanding ?? 0)}</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <h2 className="text-sm font-semibold text-foreground">Client Balances</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Client</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Invoiced</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Paid</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Balance</th>
              </tr>
            </thead>
            <tbody>
              {balances?.map((b: { client_id: string; client_name: string; total_invoiced: number; total_paid: number; balance: number }, idx: number) => {
                const isOverdue = overdueClientIds.has(b.client_id) && b.balance > 0;
                return (
                  <tr key={b.client_id} className={idx !== (balances?.length ?? 0) - 1 ? 'border-b border-border/30' : ''}>
                    <td className="px-5 py-3.5 text-sm font-medium">
                      <Link href={`/clients/${b.client_id}`} className="text-foreground hover:text-primary">{b.client_name}</Link>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground text-right tabular-nums">{formatCurrency(b.total_invoiced)}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground text-right tabular-nums">{formatCurrency(b.total_paid)}</td>
                    <td className={`px-5 py-3.5 text-sm text-right font-bold tabular-nums ${isOverdue ? 'text-destructive' : 'text-foreground'}`}>
                      {formatCurrency(b.balance)}
                      {isOverdue && <span className="ml-1 text-destructive" title="Overdue">overdue</span>}
                    </td>
                  </tr>
                );
              })}
              {(!balances || balances.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-sm text-muted-foreground">No data.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
