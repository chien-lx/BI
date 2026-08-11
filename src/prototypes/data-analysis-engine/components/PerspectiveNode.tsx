import React from 'react';

interface PerspectiveNodeProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  color?: string;
}

export default function PerspectiveNode({
  icon,
  title,
  subtitle,
  color = 'var(--dae-primary)',
}: PerspectiveNodeProps) {
  return (
    <div
      style={{
        width: 150,
        borderRadius: 18,
        background: '#fff',
        border: '1px solid var(--dae-border)',
        boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        paddingTop: 22,
      }}
    >
      {/* 图标圆形徽章 */}
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: '50%',
          background: `linear-gradient(145deg, ${color}1a 0%, ${color}33 100%)`,
          border: `1px solid ${color}55`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
          boxShadow: `0 4px 12px ${color}22`,
        }}
      >
        {icon}
      </div>

      {/* 标题 */}
      <div
        style={{
          marginTop: 14,
          padding: '0 16px',
          fontSize: 16,
          fontWeight: 700,
          color: 'var(--dae-ink)',
          lineHeight: 1.35,
          wordBreak: 'break-word',
        }}
      >
        {title}
      </div>

      {/* 副标题徽标 */}
      {subtitle && (
        <div
          style={{
            marginTop: 8,
            marginBottom: 20,
            padding: '3px 10px',
            borderRadius: 12,
            background: 'var(--dae-surface)',
            border: '1px solid var(--dae-border)',
            color: 'var(--dae-ink-secondary)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: 0.5,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}
