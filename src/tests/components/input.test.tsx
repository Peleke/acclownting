import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '@/components/ui/input';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input id="test" label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<Input id="test" placeholder="Type..." />);
    expect(screen.getByPlaceholderText('Type...')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Input id="test" label="Email" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('applies error border styling', () => {
    render(<Input id="test" error="Bad" />);
    expect(screen.getByRole('textbox').className).toContain('border-destructive');
  });

  it('applies normal border when no error', () => {
    render(<Input id="test" />);
    expect(screen.getByRole('textbox').className).toContain('border-input');
  });

  it('forwards onChange', () => {
    const onChange = vi.fn();
    render(<Input id="test" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('forwards type prop', () => {
    render(<Input id="test" label="Pass" type="password" />);
    expect(screen.getByLabelText('Pass')).toHaveAttribute('type', 'password');
  });

  it('renders as required', () => {
    render(<Input id="test" label="Name" required />);
    expect(screen.getByLabelText('Name')).toBeRequired();
  });

  it('renders with defaultValue', () => {
    render(<Input id="test" label="Name" defaultValue="John" />);
    expect(screen.getByLabelText('Name')).toHaveValue('John');
  });
});
