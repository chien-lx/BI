import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles } from 'lucide-react';
import {
  getScopeQueryability,
  getScopeDatasetDependencies,
  queryabilityLabel,
  queryabilityColor,
  getDatasets,
  trainingStatusLabel,
  type ScopeType,
} from '../data/semanticLayer';

export function QueryabilityBadge({ type, id, name, refreshKey }: { type: ScopeType; id: string; name: string; refreshKey?: number }) {
  const [showTip, setShowTip] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const scope = useMemo(() => ({ type, id, name }), [type, id, name]);
  const q = useMemo(() => getScopeQueryability(scope), [scope, refreshKey]);
  const deps = useMemo(() => getScopeDatasetDependencies(scope), [scope, refreshKey]);
  const datasets = useMemo(() => getDatasets(), [refreshKey]);
  const color = queryabilityColor(q);

  const updatePos = () => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, left: rect.left });
  };

  useEffect(() => {
    if (!showTip) return;
    updatePos();
    const handle = () => updatePos();
    window.addEventListener('scroll', handle, true);
    window.addEventListener('resize', handle);
    return () => {
      window.removeEventListener('scroll', handle, true);
      window.removeEventListener('resize', handle);
    };
  }, [showTip]);

  if (q === 'na') return null;

  const tipEl =
    showTip && deps.length > 0 && pos ? (
      <span
        style={{
          position: 'fixed',
          zIndex: 9999,
          top: pos.top,
          left: pos.left,
          minWidth: 180,
          maxWidth: 320,
          background: '#0f172a',
          color: '#f8fafc',
          padding: '8px 10px',
          borderRadius: 6,
          fontSize: 12,
          lineHeight: 1.5,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          pointerEvents: 'none',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 4 }}>依赖数据集训练状态</div>
        {deps.map((dsId) => {
          const ds = datasets.find((d) => d.id === dsId);
          const status = ds?.trainingStatus || 'untrained';
          const trained = status === 'trained';
          return (
            <div key={dsId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ds?.datasetName || dsId}</span>
              <span style={{ color: trained ? '#86efac' : '#fca5a5', whiteSpace: 'nowrap', flexShrink: 0 }}>{trainingStatusLabel(status)}</span>
            </div>
          );
        })}
      </span>
    ) : null;

  const canQuery = q === 'queryable' || q === 'partial';

  const handleQueryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('open-ai-query', {
        detail: { type, id, name },
      })
    );
  };

  return (
    <span
      ref={ref}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6 }}
      onMouseEnter={() => {
        updatePos();
        setShowTip(true);
      }}
      onMouseLeave={() => setShowTip(false)}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 8px',
          borderRadius: 999,
          fontSize: 12,
          whiteSpace: 'nowrap',
          background: color.bg,
          color: color.color,
          border: `1px solid ${color.border}`,
          cursor: 'default',
        }}
      >
        {queryabilityLabel(q)}
      </span>
      {canQuery && (
        <button
          onClick={handleQueryClick}
          title="智能问数"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 20,
            height: 20,
            borderRadius: 5,
            border: 'none',
            background: '#1677FF',
            color: '#fff',
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
          }}
        >
          <Sparkles size={12} />
        </button>
      )}
      {typeof document !== 'undefined' && tipEl ? createPortal(tipEl, document.body) : tipEl}
    </span>
  );
}
