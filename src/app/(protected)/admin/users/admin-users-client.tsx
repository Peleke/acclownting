'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { inviteUserSchema } from '@/lib/schemas';

export function AdminUsersClient() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const raw = {
      email: formData.get('email') as string,
      full_name: formData.get('full_name') as string,
      role: formData.get('role') as string,
    };

    const result = inviteUserSchema.safeParse(raw);
    if (!result.success) {
      setError(result.error.issues[0].message);
      setLoading(false);
      return;
    }

    const res = await fetch('/api/admin/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.data),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to invite user');
      setLoading(false);
      return;
    }

    setShowModal(false);
    router.refresh();
    setLoading(false);
  }

  return (
    <>
      <Button onClick={() => setShowModal(true)}>Invite User</Button>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Invite User">
        <form onSubmit={handleInvite} className="space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
          <Input id="full_name" name="full_name" label="Full Name" required />
          <Input id="email" name="email" label="Email" type="email" required />
          <Select
            id="role"
            name="role"
            label="Role"
            options={[
              { value: 'staff', label: 'Staff' },
              { value: 'admin', label: 'Admin' },
            ]}
            required
          />
          <div className="flex gap-2 justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Inviting...' : 'Send Invite'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
