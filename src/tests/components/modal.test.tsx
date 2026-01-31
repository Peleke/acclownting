import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '@/components/ui/modal';

// Mock HTMLDialogElement methods not available in jsdom
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

describe('Modal', () => {
  it('renders title and children when open', () => {
    render(
      <Modal open={true} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('calls showModal when open is true', () => {
    render(
      <Modal open={true} onClose={() => {}} title="Test">
        Content
      </Modal>
    );
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it('calls close when open is false', () => {
    render(
      <Modal open={false} onClose={() => {}} title="Test">
        Content
      </Modal>
    );
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Test">
        Content
      </Modal>
    );
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('has accessible close button', () => {
    render(
      <Modal open={true} onClose={() => {}} title="Test">
        Content
      </Modal>
    );
    expect(screen.getByLabelText('Close')).toBeInTheDocument();
  });
});
