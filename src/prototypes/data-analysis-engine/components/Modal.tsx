import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Modal({ open, title, onClose, children, footer }: ModalProps) {
  if (!open) return null;
  return (
    <div className="dae-modal-overlay" onClick={onClose}>
      <div className="dae-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dae-modal-header">
          <h3>{title}</h3>
          <button className="dae-btn-ghost" onClick={onClose} style={{ padding: 4 }}>
            <X size={18} />
          </button>
        </div>
        <div className="dae-modal-body">{children}</div>
        {footer && <div className="dae-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
