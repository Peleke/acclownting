import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReportFilters } from '@/components/report-filters';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

describe('ReportFilters', () => {
  it('renders start and end date inputs', () => {
    render(<ReportFilters />);
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();
  });

  it('renders Run Report button', () => {
    render(<ReportFilters />);
    expect(screen.getByRole('button', { name: 'Run Report' })).toBeInTheDocument();
  });

  it('pushes URL with date params on submit', () => {
    render(<ReportFilters />);
    fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2025-01-01' } });
    fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2025-12-31' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Run Report' }).closest('form')!);

    expect(mockPush).toHaveBeenCalledWith('/reports?start=2025-01-01&end=2025-12-31');
  });

  it('both date fields are required', () => {
    render(<ReportFilters />);
    expect(screen.getByLabelText('Start Date')).toBeRequired();
    expect(screen.getByLabelText('End Date')).toBeRequired();
  });
});
