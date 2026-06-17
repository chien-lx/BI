import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';

const mockUsers = ['admin', 'zhangsan', 'lisi', 'wangwu', 'data_team'];

interface UserPermSelectProps {
  label: string;
  selected: string[];
  onChange: (users: string[]) => void;
}

export default function UserPermSelect({ label, selected, onChange }: UserPermSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const addUser = (user: string) => {
    if (!selected.includes(user)) {
      onChange([...selected, user]);
    }
    setOpen(false);
  };

  const removeUser = (user: string) => {
    onChange(selected.filter((u) => u !== user));
  };

  const available = mockUsers.filter((u) => !selected.includes(u));

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--dae-ink-secondary)', marginBottom: 8, display: 'block' }}>
        {label}
      </label>
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="dae-input"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            background: '#fff',
            minHeight: 44,
            height: 'auto',
            padding: selected.length > 0 ? '6px 12px' : '8px 12px',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', flex: 1 }}>
            {selected.map((user) => (
              <span
                key={user}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 8px',
                  fontSize: 13,
                  borderRadius: 'var(--dae-radius-sm)',
                  border: '1px solid var(--dae-primary)',
                  background: 'var(--dae-primary-light)',
                  color: 'var(--dae-primary)',
                }}
              >
                {user}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeUser(user); }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--dae-primary)',
                    cursor: 'pointer',
                    marginLeft: 2,
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {selected.length === 0 && (
              <span style={{ color: 'var(--dae-ink-subtle)', fontSize: 14 }}>选择用户添加...</span>
            )}
          </div>
          <ChevronDown size={16} style={{ color: 'var(--dae-ink-muted)', flexShrink: 0, marginLeft: 8 }} />
        </button>
        {open && available.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              background: '#fff',
              border: '1px solid var(--dae-border)',
              borderRadius: 'var(--dae-radius-md)',
              boxShadow: 'var(--dae-shadow-md)',
              zIndex: 10,
              maxHeight: 200,
              overflowY: 'auto',
            }}
          >
            {available.map((user) => (
              <button
                key={user}
                type="button"
                onClick={() => addUser(user)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  fontSize: 13,
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--dae-ink)',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--dae-border)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dae-surface-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {user}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
