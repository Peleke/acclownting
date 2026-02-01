import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from '@/components/ui/select';

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
];

describe('Select', () => {
  it('renders with label', () => {
    render(<Select id="test" label="Pick one" options={options} />);
    expect(screen.getByLabelText('Pick one')).toBeInTheDocument();
  });

  it('renders all options plus default', () => {
    render(<Select id="test" options={options} />);
    const selectEl = screen.getByRole('combobox');
    expect(selectEl.children).toHaveLength(4); // "Select..." + 3 options
  });

  it('shows error message', () => {
    render(<Select id="test" options={options} error="Required" />);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('applies error border styling', () => {
    render(<Select id="test" options={options} error="Required" />);
    expect(screen.getByRole('combobox').className).toContain('border-destructive');
  });

  it('forwards onChange', () => {
    const onChange = vi.fn();
    render(<Select id="test" options={options} onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'b' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('has default empty option', () => {
    render(<Select id="test" options={options} />);
    const firstOption = screen.getByRole('combobox').children[0] as HTMLOptionElement;
    expect(firstOption.value).toBe('');
    expect(firstOption.textContent).toBe('Select...');
  });
});
