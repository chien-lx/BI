import React, { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  className?: string;
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

const pad = (n: number) => String(n).padStart(2, '0');
const formatDate = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

function parseValue(v?: string): { y: number; m: number; d: number } | null {
  if (!v) return null;
  const parts = v.split('-').map(Number);
  if (parts.length !== 3 || parts.some((p) => Number.isNaN(p))) return null;
  const [y, m, d] = parts;
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return { y, m: m - 1, d };
}

export default function DatePicker({
  value = '',
  onChange,
  placeholder = '选择日期',
  style,
  className = '',
}: DatePickerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const parsed = parseValue(value);
  const today = new Date();
  const [viewY, setViewY] = useState(parsed ? parsed.y : today.getFullYear());
  const [viewM, setViewM] = useState(parsed ? parsed.m : today.getMonth());

  // 打开时同步视图到已选日期或今天
  useEffect(() => {
    if (open) {
      const p = parseValue(value);
      setViewY(p ? p.y : today.getFullYear());
      setViewM(p ? p.m : today.getMonth());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const firstDay = new Date(viewY, viewM, 1).getDay(); // 0=周日
  const lead = (firstDay - 1 + 7) % 7; // 周一为一周起点
  const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const goPrevMonth = () => {
    if (viewM === 0) {
      setViewY(viewY - 1);
      setViewM(11);
    } else {
      setViewM(viewM - 1);
    }
  };
  const goNextMonth = () => {
    if (viewM === 11) {
      setViewY(viewY + 1);
      setViewM(0);
    } else {
      setViewM(viewM + 1);
    }
  };

  const handleSelect = (d: number) => {
    onChange?.(formatDate(viewY, viewM, d));
    setOpen(false);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.('');
  };

  return (
    <div
      ref={wrapperRef}
      className={`dae-input dae-date-picker ${className}`}
      onClick={() => setOpen((o) => !o)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        cursor: 'pointer',
        borderColor: open ? 'var(--dae-primary)' : undefined,
        boxShadow: open ? '0 0 0 3px rgba(22, 119, 255, 0.1)' : undefined,
        ...style,
      }}
    >
      <Calendar size={16} style={{ color: 'var(--dae-ink-muted)', flexShrink: 0 }} />
      <span
        style={{
          flex: 1,
          minWidth: 0,
          color: value ? 'var(--dae-ink)' : 'var(--dae-ink-subtle)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {value || placeholder}
      </span>
      {value && (
        <X
          size={14}
          onClick={clear}
          style={{ color: 'var(--dae-ink-subtle)', flexShrink: 0, cursor: 'pointer' }}
        />
      )}

      {open && (
        <div
          className="dae-date-popover"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 1000,
            width: 260,
            background: '#fff',
            border: '1px solid var(--dae-border)',
            borderRadius: 'var(--dae-radius-lg)',
            boxShadow: 'var(--dae-shadow-lg)',
            padding: 12,
            userSelect: 'none',
          }}
        >
          {/* 头部年月 + 切换 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <button
              type="button"
              onClick={goPrevMonth}
              style={navBtnStyle}
              aria-label="上个月"
            >
              <ChevronLeft size={16} />
            </button>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dae-ink)' }}>
              {viewY} 年 {viewM + 1} 月
            </div>
            <button
              type="button"
              onClick={goNextMonth}
              style={navBtnStyle}
              aria-label="下个月"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* 星期表头 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                style={{
                  textAlign: 'center',
                  fontSize: 12,
                  color: 'var(--dae-ink-muted)',
                  padding: '4px 0',
                }}
              >
                {w}
              </div>
            ))}
          </div>

          {/* 日期网格 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {cells.map((d, idx) => {
              if (d === null) return <div key={`blank-${idx}`} />;
              const isSelected = parsed && parsed.y === viewY && parsed.m === viewM && parsed.d === d;
              const isToday = today.getFullYear() === viewY && today.getMonth() === viewM && today.getDate() === d;
              return (
                <button
                  type="button"
                  key={d}
                  onClick={() => handleSelect(d)}
                  style={{
                    height: 32,
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 13,
                    background: isSelected ? 'var(--dae-primary)' : 'transparent',
                    color: isSelected ? '#fff' : isToday ? 'var(--dae-primary)' : 'var(--dae-ink)',
                    fontWeight: isSelected || isToday ? 600 : 400,
                    ...(isToday && !isSelected
                      ? { boxShadow: 'inset 0 0 0 1px var(--dae-primary)' }
                      : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--dae-surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  border: 'none',
  borderRadius: 6,
  background: 'transparent',
  color: 'var(--dae-ink-secondary)',
  cursor: 'pointer',
};
