'use client';

import { PaymentForm } from '@/components/payment-form';

export function InvoiceDetailClient({
  invoiceId,
  maxAmount,
}: {
  invoiceId: string;
  maxAmount: number;
}) {
  return <PaymentForm invoiceId={invoiceId} maxAmount={maxAmount} />;
}
