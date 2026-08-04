import React, { useRef, useState, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface StatusSwitchProps {
  status: string;
  onToggle: () => void;
}

export default function StatusSwitch({ status, onToggle }: StatusSwitchProps) {
  const ref = useRef<HTMLLabelElement>(null);
  const [hover, setHover] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const updatePos = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({ top: rect.top - 36, left: rect.left + rect.width / 2 });
    }
  }, []);

  useLayoutEffect(() => {
    if (hover) {
      updatePos();
      window.addEventListener('scroll', updatePos, true);
      window.addEventListener('resize', updatePos);
      return () => {
        window.removeEventListener('scroll', updatePos, true);
        window.removeEventListener('resize', updatePos);
      };
    }
  }, [hover, updatePos]);

  const isOnline = status === 'online';

  const tooltip = (
    <div
      className="dae-status-tooltip"
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.75)',
        color: '#fff',
        padding: '4px 8px',
        borderRadius: 4,
        fontSize: 12,
        whiteSpace: 'nowrap',
        zIndex: 2147483647,
        pointerEvents: 'none',
        lineHeight: '20px',
      }}
    >
      {isOnline ? '已上线' : '已下线'}
      <span
        style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          border: '4px solid transparent',
          borderTopColor: 'rgba(0,0,0,0.75)',
        }}
      />
    </div>
  );

  return (
    <>
      <label
        ref={ref}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div style={{
          width: 32, height: 18, borderRadius: 9,
          background: isOnline ? 'var(--dae-primary)' : 'var(--dae-border-strong)',
          transition: 'background 0.2s', position: 'relative',
        }}>
          <div style={{
            width: 14, height: 14, borderRadius: '50%', background: '#fff',
            position: 'absolute', top: 2,
            left: isOnline ? 16 : 2,
            transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }} />
        </div>
      </label>
      {hover && typeof document !== 'undefined' && createPortal(tooltip, document.body)}
    </>
  );
}
