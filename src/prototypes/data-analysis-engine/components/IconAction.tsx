import React, { useRef, useState, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface IconActionProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

export default function IconAction({ icon, label, onClick, disabled }: IconActionProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [showTip, setShowTip] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const updatePos = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({ top: rect.top - 36, left: rect.left + rect.width / 2 });
    }
  }, []);

  useLayoutEffect(() => {
    if (showTip) {
      updatePos();
      window.addEventListener('scroll', updatePos, true);
      window.addEventListener('resize', updatePos);
      return () => {
        window.removeEventListener('scroll', updatePos, true);
        window.removeEventListener('resize', updatePos);
      };
    }
  }, [showTip, updatePos]);

  const tooltip = (
    <div
      className="dae-icon-tooltip"
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        transform: 'translateX(-50%)',
        background: '#0f172a',
        color: '#fff',
        fontSize: 12,
        padding: '4px 10px',
        borderRadius: '6px',
        whiteSpace: 'nowrap',
        zIndex: 2147483647,
        pointerEvents: 'none',
        lineHeight: '20px',
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
          borderTopColor: '#0f172a',
        }}
      />
    </div>
  );

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        ref={ref}
        type="button"
        className="dae-icon-action"
        onClick={disabled ? undefined : onClick}
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
        style={{ opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
        title={disabled ? `${label}（当前状态不可用）` : label}
      >
        {icon}
      </button>
      {showTip && typeof document !== 'undefined' && createPortal(tooltip, document.body)}
    </div>
  );
}
