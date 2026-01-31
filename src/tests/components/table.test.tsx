import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Table } from '@/components/ui/table';

interface TestRow {
  id: string;
  name: string;
  value: number;
}

const data: TestRow[] = [
  { id: '1', name: 'Alpha', value: 100 },
  { id: '2', name: 'Beta', value: 200 },
  { id: '3', name: 'Gamma', value: 300 },
];

const columns = [
  { header: 'Name', accessor: 'name' as const },
  { header: 'Value', accessor: 'value' as const },
];

describe('Table', () => {
  it('renders headers', () => {
    render(<Table columns={columns} data={data} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
  });

  it('renders data rows', () => {
    render(<Table columns={columns} data={data} />);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('300')).toBeInTheDocument();
  });

  it('shows empty message when no data', () => {
    render(<Table columns={columns} data={[]} emptyMessage="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('shows default empty message', () => {
    render(<Table columns={columns} data={[]} />);
    expect(screen.getByText('No data found.')).toBeInTheDocument();
  });

  it('calls onRowClick when row clicked', () => {
    const onClick = vi.fn();
    render(<Table columns={columns} data={data} onRowClick={onClick} />);
    fireEvent.click(screen.getByText('Alpha'));
    expect(onClick).toHaveBeenCalledWith(data[0]);
  });

  it('supports function accessor for custom rendering', () => {
    const customColumns = [
      { header: 'Name', accessor: ((row: TestRow) => `Item: ${row.name}`) },
      { header: 'Value', accessor: 'value' as const },
    ];
    render(<Table columns={customColumns} data={data} />);
    expect(screen.getByText('Item: Alpha')).toBeInTheDocument();
  });

  it('applies cursor-pointer class when onRowClick provided', () => {
    const onClick = vi.fn();
    render(<Table columns={columns} data={data} onRowClick={onClick} />);
    const row = screen.getByText('Alpha').closest('tr');
    expect(row?.className).toContain('cursor-pointer');
  });

  it('does not apply cursor-pointer without onRowClick', () => {
    render(<Table columns={columns} data={data} />);
    const row = screen.getByText('Alpha').closest('tr');
    expect(row?.className).not.toContain('cursor-pointer');
  });
});
