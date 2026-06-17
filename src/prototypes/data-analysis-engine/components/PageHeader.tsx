import React from 'react';

interface PageHeaderProps {
  title: string;
  breadcrumb?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, breadcrumb, actions }: PageHeaderProps) {
  return (
    <div className="dae-page-header">
      <div>
        {breadcrumb && <div className="dae-breadcrumb">{breadcrumb}</div>}
        <h1>{title}</h1>
      </div>
      {actions && <div style={{ display: 'flex', gap: 10 }}>{actions}</div>}
    </div>
  );
}
