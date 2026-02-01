import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
    draft: 'bg-status-draft-bg text-status-draft-text',
    sent: 'bg-status-sent-bg text-status-sent-text',
    partial: 'bg-status-partial-bg text-status-partial-text',
    paid: 'bg-status-paid-bg text-status-paid-text',
    overdue: 'bg-status-overdue-bg text-status-overdue-text',
  };
  return colors[status] || 'bg-status-draft-bg text-status-draft-text';
}

export function getStatusDot(status: string): string {
  const dots: Record<string, string> = {
    draft: 'bg-status-draft-dot',
    sent: 'bg-status-sent-dot',
    partial: 'bg-status-partial-dot',
    paid: 'bg-status-paid-dot',
    overdue: 'bg-status-overdue-dot',
  };
  return dots[status] || 'bg-status-draft-dot';
}
