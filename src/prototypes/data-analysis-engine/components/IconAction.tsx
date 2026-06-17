import React, { useState } from 'react';

interface IconActionProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

export default function IconAction({ icon, label, onClick }: IconActionProps) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        className="dae-icon-action"
        onClick={onClick}
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
      >
        {icon}
      </button>
      {showTip && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 6px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--dae-ink)',
            color: '#fff',
            fontSize: 12,
            padding: '4px 10px',
            borderRadius: 'var(--dae-radius-sm)',
            whiteSpace: 'nowrap',
            zIndex: 100,
            pointerEvents: 'none',
          }}
        >
          {label}
          <span
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              border: '4px solid transparent',
              borderTopColor: 'var(--dae-ink)',
            }}
          />
        </div>
      )}
    </div>
  );
}
