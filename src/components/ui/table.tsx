import { ReactNode } from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function Table<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data found.',
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200/60 bg-white shadow-card">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-stone-100">
            {columns.map((col, i) => (
              <th
                key={i}
                className={`px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-12 text-center text-sm text-stone-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={`${rowIdx !== data.length - 1 ? 'border-b border-stone-100/80' : ''} ${
                  onRowClick ? 'cursor-pointer hover:bg-stone-50/60' : ''
                }`}
              >
                {columns.map((col, i) => (
                  <td key={i} className={`px-5 py-3.5 text-sm text-stone-700 ${col.className || ''}`}>
                    {typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : (row[col.accessor] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
