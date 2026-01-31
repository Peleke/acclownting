import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  calculateLineItemTotal,
  calculateInvoiceTotals,
  getStatusColor,
} from '@/lib/utils';

describe('formatCurrency', () => {
  it('formats positive amounts', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats negative amounts', () => {
    expect(formatCurrency(-50)).toBe('-$50.00');
  });

  it('formats large amounts with commas', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });

  it('rounds to 2 decimal places', () => {
    expect(formatCurrency(10.999)).toBe('$11.00');
  });

  it('formats small amounts', () => {
    expect(formatCurrency(0.01)).toBe('$0.01');
  });

  it('formats amounts with one decimal', () => {
    expect(formatCurrency(10.5)).toBe('$10.50');
  });
});

describe('formatDate', () => {
  it('formats ISO date string', () => {
    const result = formatDate('2025-06-15T12:00:00Z');
    expect(result).toContain('Jun');
    expect(result).toContain('15');
    expect(result).toContain('2025');
  });

  it('formats date-only string', () => {
    // Date-only strings are parsed as UTC midnight, which may shift in local TZ
    const result = formatDate('2025-01-15');
    expect(result).toContain('2025');
  });

  it('handles different months', () => {
    expect(formatDate('2025-12-25T12:00:00Z')).toContain('Dec');
    expect(formatDate('2025-03-15T12:00:00Z')).toContain('Mar');
  });
});

describe('calculateLineItemTotal', () => {
  it('multiplies quantity by price', () => {
    expect(calculateLineItemTotal(3, 10.50)).toBe(31.50);
  });

  it('rounds to 2 decimal places', () => {
    expect(calculateLineItemTotal(3, 10.333)).toBe(31.00);
  });

  it('handles zero quantity', () => {
    expect(calculateLineItemTotal(0, 100)).toBe(0);
  });

  it('handles zero price', () => {
    expect(calculateLineItemTotal(5, 0)).toBe(0);
  });

  it('handles fractional quantities', () => {
    expect(calculateLineItemTotal(1.5, 100)).toBe(150);
  });

  it('handles very small amounts', () => {
    expect(calculateLineItemTotal(1, 0.01)).toBe(0.01);
  });

  it('avoids floating point errors', () => {
    // 0.1 + 0.2 !== 0.3 in JS, but we round
    expect(calculateLineItemTotal(3, 0.1)).toBe(0.3);
  });
});

describe('calculateInvoiceTotals', () => {
  it('calculates subtotal, tax, and total', () => {
    const items = [
      { quantity: 2, unit_price: 100 },
      { quantity: 1, unit_price: 50 },
    ];
    const result = calculateInvoiceTotals(items, 0.1);
    expect(result.subtotal).toBe(250);
    expect(result.taxAmount).toBe(25);
    expect(result.total).toBe(275);
  });

  it('handles zero tax', () => {
    const items = [{ quantity: 1, unit_price: 100 }];
    const result = calculateInvoiceTotals(items, 0);
    expect(result.subtotal).toBe(100);
    expect(result.taxAmount).toBe(0);
    expect(result.total).toBe(100);
  });

  it('handles empty items', () => {
    const result = calculateInvoiceTotals([], 0.1);
    expect(result.subtotal).toBe(0);
    expect(result.taxAmount).toBe(0);
    expect(result.total).toBe(0);
  });

  it('handles high tax rate', () => {
    const items = [{ quantity: 1, unit_price: 100 }];
    const result = calculateInvoiceTotals(items, 0.25);
    expect(result.subtotal).toBe(100);
    expect(result.taxAmount).toBe(25);
    expect(result.total).toBe(125);
  });

  it('rounds tax amount correctly', () => {
    const items = [{ quantity: 1, unit_price: 33.33 }];
    const result = calculateInvoiceTotals(items, 0.0725);
    expect(result.taxAmount).toBe(2.42); // 33.33 * 0.0725 = 2.416425, rounded to 2.42
  });

  it('handles multiple items with tax', () => {
    const items = [
      { quantity: 10, unit_price: 150 },
      { quantity: 5, unit_price: 120 },
    ];
    const result = calculateInvoiceTotals(items, 0.08);
    expect(result.subtotal).toBe(2100);
    expect(result.taxAmount).toBe(168);
    expect(result.total).toBe(2268);
  });

  it('handles single penny items', () => {
    const items = [{ quantity: 1, unit_price: 0.01 }];
    const result = calculateInvoiceTotals(items, 0.1);
    expect(result.subtotal).toBe(0.01);
    expect(result.total).toBeGreaterThanOrEqual(0.01);
  });
});

describe('getStatusColor', () => {
  it('returns correct class for each status', () => {
    expect(getStatusColor('draft')).toContain('gray');
    expect(getStatusColor('sent')).toContain('blue');
    expect(getStatusColor('partial')).toContain('yellow');
    expect(getStatusColor('paid')).toContain('green');
    expect(getStatusColor('overdue')).toContain('red');
  });

  it('returns default for unknown status', () => {
    expect(getStatusColor('unknown')).toContain('gray');
  });

  it('returns default for empty string', () => {
    expect(getStatusColor('')).toContain('gray');
  });

  it('includes both bg and text classes', () => {
    const color = getStatusColor('paid');
    expect(color).toMatch(/bg-/);
    expect(color).toMatch(/text-/);
  });
});
