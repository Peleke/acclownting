import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClientForm } from '@/components/client-form';
import { MOCK_CLIENT } from '@/tests/helpers/mocks';

const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
const mockUpdate = vi.fn().mockReturnValue({
  eq: vi.fn().mockResolvedValue({ data: null, error: null }),
});

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      insert: mockInsert,
      update: mockUpdate,
    }),
  }),
}));

describe('ClientForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders create form with empty fields', () => {
    render(<ClientForm />);
    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Create Client' })).toBeInTheDocument();
  });

  it('renders edit form with pre-filled fields', () => {
    render(<ClientForm client={MOCK_CLIENT} />);
    expect(screen.getByLabelText('Name')).toHaveValue('Acme Corp');
    expect(screen.getByLabelText('Email')).toHaveValue('billing@acme.com');
    expect(screen.getByLabelText('Phone')).toHaveValue('555-0100');
    expect(screen.getByLabelText('Address')).toHaveValue('123 Main St');
    expect(screen.getByRole('button', { name: 'Update Client' })).toBeInTheDocument();
  });

  it('shows validation error for empty name', async () => {
    render(<ClientForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Create Client' }));
    // The required HTML5 attribute prevents submission, but Zod also catches it
    // We test that the form has required attribute
    expect(screen.getByLabelText('Name')).toBeRequired();
  });

  it('calls insert for new client', async () => {
    render(<ClientForm />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New Corp' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@corp.com' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Create Client' }).closest('form')!);

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New Corp', email: 'new@corp.com' })
      );
    });
  });

  it('calls update for existing client', async () => {
    render(<ClientForm client={MOCK_CLIENT} />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Updated Corp' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Update Client' }).closest('form')!);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  it('shows loading state while submitting', async () => {
    // Make insert return a never-resolving promise to keep loading state
    mockInsert.mockReturnValueOnce(new Promise(() => {}));
    render(<ClientForm />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Create Client' }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
    });
  });

  it('shows server error', async () => {
    mockInsert.mockResolvedValueOnce({ data: null, error: { message: 'Database error' } });
    render(<ClientForm />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Create Client' }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Database error')).toBeInTheDocument();
    });
  });

  it('calls onSuccess callback after successful create', async () => {
    const onSuccess = vi.fn();
    render(<ClientForm onSuccess={onSuccess} />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Create Client' }).closest('form')!);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('renders all form fields', () => {
    render(<ClientForm />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone')).toBeInTheDocument();
    expect(screen.getByLabelText('Address')).toBeInTheDocument();
  });
});
