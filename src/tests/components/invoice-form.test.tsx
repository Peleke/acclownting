import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InvoiceForm } from '@/components/invoice-form';
import { MOCK_CLIENT, MOCK_CLIENT_2 } from '@/tests/helpers/mocks';

const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      insert: mockInsert,
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      }),
    },
  }),
}));

const clients = [MOCK_CLIENT, MOCK_CLIENT_2];

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(screen.getByLabelText('Client'), MOCK_CLIENT.id);
  // Description is controlled via onChange in state, fireEvent works for React controlled inputs
  const textInputs = screen.getAllByRole('textbox');
  fireEvent.change(textInputs[0], { target: { value: 'Service' } });
  const numberInputs = screen.getAllByRole('spinbutton');
  fireEvent.change(numberInputs[0], { target: { value: '1' } });
  fireEvent.change(numberInputs[1], { target: { value: '100' } });
  fireEvent.submit(screen.getByRole('button', { name: 'Create Invoice' }).closest('form')!);
}

describe('InvoiceForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders client select with all clients', () => {
    render(<InvoiceForm clients={clients} />);
    expect(screen.getByLabelText('Client')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Globex Inc')).toBeInTheDocument();
  });

  it('renders due date input', () => {
    render(<InvoiceForm clients={clients} />);
    expect(screen.getByLabelText('Due Date')).toBeInTheDocument();
  });

  it('renders initial line item section', () => {
    render(<InvoiceForm clients={clients} />);
    expect(screen.getByText('Line Items')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Qty')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
  });

  it('adds a new line item row', () => {
    render(<InvoiceForm clients={clients} />);
    // Line item rows have remove buttons with SVGs
    const initialRemoveCount = screen.getAllByRole('button').filter(b => b.querySelector('svg')).length;
    fireEvent.click(screen.getByText('+ Add line item'));
    const newRemoveCount = screen.getAllByRole('button').filter(b => b.querySelector('svg')).length;
    expect(newRemoveCount).toBe(initialRemoveCount + 1);
  });

  it('shows totals section', () => {
    render(<InvoiceForm clients={clients} />);
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    // "Tax" appears in both "Tax Rate (%)" label and the totals section
    expect(screen.getAllByText(/^Tax$/).length).toBeGreaterThanOrEqual(1);
    // "Total" appears in column header and totals section
    expect(screen.getAllByText(/^Total$/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders notes textarea', () => {
    render(<InvoiceForm clients={clients} />);
    expect(screen.getByLabelText('Notes')).toBeInTheDocument();
  });

  it('renders cancel and submit buttons', () => {
    render(<InvoiceForm clients={clients} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Invoice' })).toBeInTheDocument();
  });

  it('updates line item total when values change', async () => {
    render(<InvoiceForm clients={clients} />);
    const numberInputs = screen.getAllByRole('spinbutton');
    fireEvent.change(numberInputs[0], { target: { value: '10' } });
    fireEvent.change(numberInputs[1], { target: { value: '100' } });

    await waitFor(() => {
      // $1,000.00 appears in both line item total and subtotal
      expect(screen.getAllByText('$1,000.00').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<InvoiceForm clients={clients} />);
    await fillAndSubmit(user);

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalled();
    });
  });

  it('shows server error on failed submission', async () => {
    mockInsert.mockResolvedValueOnce({ data: null, error: { message: 'Constraint violated' } });
    const user = userEvent.setup();
    render(<InvoiceForm clients={clients} />);
    await fillAndSubmit(user);

    await waitFor(() => {
      expect(screen.getByText('Constraint violated')).toBeInTheDocument();
    });
  });

  it('disables remove button when only one line item', () => {
    render(<InvoiceForm clients={clients} />);
    // Remove buttons have SVG icons inside them
    const removeButtons = screen.getAllByRole('button').filter(b => b.querySelector('svg'));
    expect(removeButtons[0]).toBeDisabled();
  });

  it('shows loading state during submission', async () => {
    mockInsert.mockReturnValueOnce(new Promise(() => {}));
    const user = userEvent.setup();
    render(<InvoiceForm clients={clients} />);
    await fillAndSubmit(user);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Creating...' })).toBeDisabled();
    });
  });
});
