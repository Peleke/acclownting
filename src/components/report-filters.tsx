'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ReportFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const now = new Date();
  const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(searchParams.get('start') || defaultStart);
  const [endDate, setEndDate] = useState(searchParams.get('end') || defaultEnd);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (startDate) params.set('start', startDate);
    if (endDate) params.set('end', endDate);
    router.push(`/reports?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
      <Input
        id="start"
        label="Start Date"
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        required
      />
      <Input
        id="end"
        label="End Date"
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        required
      />
      <Button type="submit">Run Report</Button>
    </form>
  );
}
