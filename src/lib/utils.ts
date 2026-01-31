export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function calculateLineItemTotal(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}

export function calculateInvoiceTotals(
  lineItems: { quantity: number; unit_price: number }[],
  taxRate: number
) {
  const subtotal = lineItems.reduce(
    (sum, item) => sum + calculateLineItemTotal(item.quantity, item.unit_price),
    0
  );
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;
  return { subtotal, taxAmount, total };
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-stone-100 text-stone-600',
    sent: 'bg-accent-50 text-accent-700',
    partial: 'bg-amber-50 text-amber-800',
    paid: 'bg-emerald-50 text-emerald-700',
    overdue: 'bg-red-50 text-red-700',
  };
  return colors[status] || 'bg-stone-100 text-stone-600';
}

export function getStatusDot(status: string): string {
  const dots: Record<string, string> = {
    draft: 'bg-stone-400',
    sent: 'bg-accent-500',
    partial: 'bg-amber-500',
    paid: 'bg-emerald-500',
    overdue: 'bg-red-500',
  };
  return dots[status] || 'bg-stone-400';
}
