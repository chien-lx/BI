import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmProps {
  open: boolean;
  title?: string;
  content: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirm({ open, title = '确认删除', content, onClose, onConfirm }: DeleteConfirmProps) {
  if (!open) return null;
  return (
    <div className="dae-modal-overlay" onClick={onClose}>
      <div className="dae-modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
        <div className="dae-modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} style={{ color: 'var(--dae-error)' }} />
            {title}
          </h3>
          <button className="dae-btn-ghost" onClick={onClose} style={{ padding: 4 }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>&times;</span>
          </button>
        </div>
        <div className="dae-modal-body">
          <p style={{ color: 'var(--dae-ink-secondary)', fontSize: 14, lineHeight: 1.6 }}>{content}</p>
        </div>
        <div className="dae-modal-footer">
          <button className="dae-btn dae-btn-secondary" onClick={onClose}>取消</button>
          <button className="dae-btn dae-btn-danger" style={{ background: 'var(--dae-error)', color: '#fff', borderColor: 'var(--dae-error)' }} onClick={onConfirm}>删除</button>
        </div>
      </div>
    </div>
  );
}
