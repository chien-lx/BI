import React from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number | string;
}

export default function Drawer({ open, title, onClose, children, footer, width }: DrawerProps) {
  if (!open) return null;
  return (
    <>
      <div className="dae-drawer-overlay" onClick={onClose} />
      <div className="dae-drawer" style={width ? { width } : undefined}>
        <div className="dae-drawer-header">
          <h3>{title}</h3>
          <button className="dae-btn-ghost" onClick={onClose} style={{ padding: 4 }}>
            <X size={18} />
          </button>
        </div>
        <div className="dae-drawer-body">{children}</div>
        {footer && <div className="dae-drawer-footer">{footer}</div>}
      </div>
    </>
  );
}
