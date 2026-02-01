'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { ClientForm } from '@/components/client-form';
import type { Client } from '@/lib/types';

export function ClientDetailClient({ client }: { client: Client }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Link href={`/invoices/new?client_id=${client.id}`}>
        <Button>New Invoice</Button>
      </Link>
      <Button variant="secondary" onClick={() => setShowModal(true)}>
        Edit Client
      </Button>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Edit Client">
        <ClientForm client={client} onSuccess={() => setShowModal(false)} />
      </Modal>
    </div>
  );
}
