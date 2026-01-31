import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/ui/status-badge';

describe('StatusBadge', () => {
  it('renders the status text capitalized', () => {
    render(<StatusBadge status="paid" />);
    expect(screen.getByText('paid')).toBeInTheDocument();
    // capitalize is a CSS class, text remains lowercase in DOM
    expect(screen.getByText('paid').className).toContain('capitalize');
  });

  it('applies green classes for paid', () => {
    render(<StatusBadge status="paid" />);
    expect(screen.getByText('paid').className).toContain('bg-green');
  });

  it('applies red classes for overdue', () => {
    render(<StatusBadge status="overdue" />);
    expect(screen.getByText('overdue').className).toContain('bg-red');
  });

  it('applies blue classes for sent', () => {
    render(<StatusBadge status="sent" />);
    expect(screen.getByText('sent').className).toContain('bg-blue');
  });

  it('applies yellow classes for partial', () => {
    render(<StatusBadge status="partial" />);
    expect(screen.getByText('partial').className).toContain('bg-yellow');
  });

  it('applies gray classes for draft', () => {
    render(<StatusBadge status="draft" />);
    expect(screen.getByText('draft').className).toContain('bg-gray');
  });

  it('has rounded-full class for pill shape', () => {
    render(<StatusBadge status="draft" />);
    expect(screen.getByText('draft').className).toContain('rounded-full');
  });
});
