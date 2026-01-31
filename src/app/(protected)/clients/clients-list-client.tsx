'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { ClientForm } from '@/components/client-form';

export function ClientsListClient() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button onClick={() => setShowModal(true)}>New Client</Button>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Client">
        <ClientForm onSuccess={() => setShowModal(false)} />
      </Modal>
    </>
  );
}
