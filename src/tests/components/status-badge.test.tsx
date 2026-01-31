import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/ui/status-badge';

describe('StatusBadge', () => {
  it('renders the status text capitalized', () => {
    render(<StatusBadge status="paid" />);
    expect(screen.getByText('paid')).toBeInTheDocument();
    expect(screen.getByText('paid').className).toContain('capitalize');
  });

  it('applies emerald classes for paid', () => {
    render(<StatusBadge status="paid" />);
    expect(screen.getByText('paid').className).toContain('bg-emerald');
  });

  it('applies red classes for overdue', () => {
    render(<StatusBadge status="overdue" />);
    expect(screen.getByText('overdue').className).toContain('bg-red');
  });

  it('applies accent classes for sent', () => {
    render(<StatusBadge status="sent" />);
    expect(screen.getByText('sent').className).toContain('bg-accent');
  });

  it('applies amber classes for partial', () => {
    render(<StatusBadge status="partial" />);
    expect(screen.getByText('partial').className).toContain('bg-amber');
  });

  it('applies stone classes for draft', () => {
    render(<StatusBadge status="draft" />);
    expect(screen.getByText('draft').className).toContain('bg-stone');
  });

  it('has rounded-md class for badge shape', () => {
    render(<StatusBadge status="draft" />);
    expect(screen.getByText('draft').className).toContain('rounded-md');
  });
});
