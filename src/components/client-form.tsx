'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { clientSchema, type ClientInput } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Client } from '@/lib/types';

interface ClientFormProps {
  client?: Client;
  onSuccess?: () => void;
}

export function ClientForm({ client, onSuccess }: ClientFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const raw: ClientInput = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
    };

    const result = clientSchema.safeParse(raw);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    const data = result.data;
    let error;

    if (client) {
      ({ error } = await supabase.from('clients').update(data).eq('id', client.id));
    } else {
      ({ error } = await supabase.from('clients').insert(data));
    }

    if (error) {
      setErrors({ form: error.message });
      setLoading(false);
      return;
    }

    if (onSuccess) onSuccess();
    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.form && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 px-3 py-2.5 rounded-lg">
          {errors.form}
        </div>
      )}
      <Input
        id="name"
        name="name"
        label="Name"
        defaultValue={client?.name}
        error={errors.name}
        required
      />
      <Input
        id="email"
        name="email"
        label="Email"
        type="email"
        defaultValue={client?.email || ''}
        error={errors.email}
      />
      <Input
        id="phone"
        name="phone"
        label="Phone"
        defaultValue={client?.phone || ''}
        error={errors.phone}
      />
      <Input
        id="address"
        name="address"
        label="Address"
        defaultValue={client?.address || ''}
        error={errors.address}
      />
      <div className="flex gap-2 justify-end pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : client ? 'Update Client' : 'Create Client'}
        </Button>
      </div>
    </form>
  );
}
