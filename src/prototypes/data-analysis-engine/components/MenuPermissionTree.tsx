import React, { useState } from 'react';
import { Lock, Unlock, ChevronRight, ChevronDown } from 'lucide-react';
import { menuTree, type MenuPermission } from '../data/mockData';

interface MenuPermissionTreeProps {
  menuPermissions: MenuPermission[];
  /** 是否可编辑；传入 onToggle 后每个菜单项可点击切换 */
  onToggle?: (id: string) => void;
  /** 是否默认展开所有分组，默认 true */
  defaultExpandAll?: boolean;
}

export default function MenuPermissionTree({
  menuPermissions,
  onToggle,
  defaultExpandAll = true,
}: MenuPermissionTreeProps) {
  const allowedIds = React.useMemo(() => new Set(menuPermissions.map((m) => m.id)), [menuPermissions]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    menuTree.forEach((group) => {
      initial[group.label] = defaultExpandAll;
    });
    return initial;
  });

  const toggleGroup = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {menuTree.map((group) => {
        const isOpen = !!expanded[group.label];
        const allAllowed = group.items.every((it) => allowedIds.has(it.id));
        const someAllowed = group.items.some((it) => allowedIds.has(it.id));
        return (
          <div
            key={group.label}
            style={{
              border: '1px solid var(--dae-border)',
              borderRadius: 8,
              overflow: 'hidden',
              background: 'var(--dae-surface)',
            }}
          >
            <button
              onClick={() => toggleGroup(group.label)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dae-ink)' }}>{group.label}</span>
              </div>
              {allAllowed ? (
                <Unlock size={16} style={{ color: 'var(--dae-primary)' }} />
              ) : someAllowed ? (
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: '2px solid var(--dae-primary)',
                    background: 'var(--dae-primary)',
                    display: 'inline-block',
                    boxSizing: 'border-box',
                  }}
                />
              ) : (
                <Lock size={16} style={{ color: 'var(--dae-ink-muted)' }} />
              )}
            </button>
            {isOpen && (
              <div style={{ borderTop: '1px solid var(--dae-border)' }}>
                {group.items.map((item) => {
                  const has = allowedIds.has(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={onToggle ? () => onToggle(item.id) : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 12px 9px 36px',
                        borderBottom: '1px solid var(--dae-border)',
                        background: 'var(--dae-surface)',
                        cursor: onToggle ? 'pointer' : 'default',
                      }}
                    >
                      <span style={{ fontSize: 14, color: 'var(--dae-ink)' }}>{item.label}</span>
                      {has ? (
                        <Unlock size={16} style={{ color: 'var(--dae-primary)' }} />
                      ) : (
                        <Lock size={16} style={{ color: 'var(--dae-ink-muted)' }} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
