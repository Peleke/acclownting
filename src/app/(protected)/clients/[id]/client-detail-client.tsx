'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { ClientForm } from '@/components/client-form';
import type { Client } from '@/lib/types';

export function ClientDetailClient({ client }: { client: Client }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setShowModal(true)}>
        Edit Client
      </Button>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Edit Client">
        <ClientForm client={client} onSuccess={() => setShowModal(false)} />
      </Modal>
    </>
  );
}
