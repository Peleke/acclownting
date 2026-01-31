import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentForm } from '@/components/payment-form';

const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
const mockGetUser = vi.fn().mockResolvedValue({
  data: { user: { id: 'user-1' } },
  error: null,
});

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      insert: mockInsert,
    }),
    auth: {
      getUser: () => mockGetUser(),
    },
  }),
}));

const INVOICE_ID = 'b1111111-1111-4111-8111-111111111111';

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  const amountInput = screen.getByLabelText(/Amount/) as HTMLInputElement;
  await user.clear(amountInput);
  await user.type(amountInput, '250');
  await user.selectOptions(screen.getByLabelText('Payment Method'), 'card');
  fireEvent.submit(screen.getByRole('button', { name: 'Record Payment' }).closest('form')!);
}

describe('PaymentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue({ data: null, error: null });
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
  });

  it('renders with max amount displayed', () => {
    render(<PaymentForm invoiceId={INVOICE_ID} maxAmount={500} />);
    expect(screen.getByLabelText(/Amount.*max: \$500\.00/)).toBeInTheDocument();
  });

  it('renders payment method select with all options', () => {
    render(<PaymentForm invoiceId={INVOICE_ID} maxAmount={500} />);
    expect(screen.getByLabelText('Payment Method')).toBeInTheDocument();
    expect(screen.getByText('Cash')).toBeInTheDocument();
    expect(screen.getByText('Check')).toBeInTheDocument();
    expect(screen.getByText('Card')).toBeInTheDocument();
    expect(screen.getByText('Transfer')).toBeInTheDocument();
  });

  it('renders reference field', () => {
    render(<PaymentForm invoiceId={INVOICE_ID} maxAmount={500} />);
    expect(screen.getByLabelText('Reference (optional)')).toBeInTheDocument();
  });

  it('submits valid payment', async () => {
    const user = userEvent.setup();
    render(<PaymentForm invoiceId={INVOICE_ID} maxAmount={500} />);
    await fillAndSubmit(user);

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          invoice_id: INVOICE_ID,
          amount: 250,
          method: 'card',
          created_by: 'user-1',
        })
      );
    });
  });

  it('shows loading state', async () => {
    mockInsert.mockReturnValueOnce(new Promise(() => {}));
    const user = userEvent.setup();
    render(<PaymentForm invoiceId={INVOICE_ID} maxAmount={500} />);
    await fillAndSubmit(user);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Recording...' })).toBeDisabled();
    });
  });

  it('shows server error', async () => {
    mockInsert.mockResolvedValueOnce({ data: null, error: { message: 'Insert failed' } });
    const user = userEvent.setup();
    render(<PaymentForm invoiceId={INVOICE_ID} maxAmount={500} />);
    await fillAndSubmit(user);

    await waitFor(() => {
      expect(screen.getByText('Insert failed')).toBeInTheDocument();
    });
  });

  it('calls onSuccess after successful submission', async () => {
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    render(<PaymentForm invoiceId={INVOICE_ID} maxAmount={500} onSuccess={onSuccess} />);
    await fillAndSubmit(user);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
