import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/ui/status-badge';

describe('StatusBadge', () => {
  it('renders the status text capitalized', () => {
    render(<StatusBadge status="paid" />);
    expect(screen.getByText('paid')).toBeInTheDocument();
    expect(screen.getByText('paid').className).toContain('capitalize');
  });

  it('applies paid status classes', () => {
    render(<StatusBadge status="paid" />);
    expect(screen.getByText('paid').className).toContain('bg-status-paid');
  });

  it('applies overdue status classes', () => {
    render(<StatusBadge status="overdue" />);
    expect(screen.getByText('overdue').className).toContain('bg-status-overdue');
  });

  it('applies sent status classes', () => {
    render(<StatusBadge status="sent" />);
    expect(screen.getByText('sent').className).toContain('bg-status-sent');
  });

  it('applies partial status classes', () => {
    render(<StatusBadge status="partial" />);
    expect(screen.getByText('partial').className).toContain('bg-status-partial');
  });

  it('applies draft status classes', () => {
    render(<StatusBadge status="draft" />);
    expect(screen.getByText('draft').className).toContain('bg-status-draft');
  });

  it('has rounded-md class for badge shape', () => {
    render(<StatusBadge status="draft" />);
    expect(screen.getByText('draft').className).toContain('rounded-md');
  });
});
