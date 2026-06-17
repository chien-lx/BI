import React, { useState } from 'react';
import Drawer from './Drawer';

interface PermissionTarget {
  id: string;
  name: string;
  type: 'user' | 'role';
}

interface PermissionDrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSave: (permissions: Record<string, { view: boolean; manage: boolean }>) => void;
}

const mockTargets: PermissionTarget[] = [
  { id: 'u1', name: '张三', type: 'user' },
  { id: 'u2', name: '李四', type: 'user' },
  { id: 'u3', name: '王五', type: 'user' },
  { id: 'r1', name: '系统管理员', type: 'role' },
  { id: 'r2', name: '数据分析师', type: 'role' },
  { id: 'r3', name: '业务人员', type: 'role' },
];

export default function PermissionDrawer({ open, title, onClose, onSave }: PermissionDrawerProps) {
  const [perms, setPerms] = useState<Record<string, { view: boolean; manage: boolean }>>({});

  const toggle = (id: string, key: 'view' | 'manage') => {
    setPerms((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || { view: false, manage: false }), [key]: !(prev[id]?.[key] ?? false) },
    }));
  };

  return (
    <Drawer
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <button className="dae-btn dae-btn-secondary" onClick={onClose}>取消</button>
          <button className="dae-btn dae-btn-primary" onClick={() => onSave(perms)}>保存</button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {mockTargets.map((t) => (
          <div
            key={t.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              border: '1px solid var(--dae-border)',
              borderRadius: 'var(--dae-radius-md)',
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dae-ink)' }}>{t.name}</div>
              <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>{t.type === 'user' ? '用户' : '角色'}</div>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={perms[t.id]?.view ?? false}
                  onChange={() => toggle(t.id, 'view')}
                />
                查看
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={perms[t.id]?.manage ?? false}
                  onChange={() => toggle(t.id, 'manage')}
                />
                管理
              </label>
            </div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}
