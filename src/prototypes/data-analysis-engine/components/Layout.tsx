import React, { useState, useCallback } from 'react';
import {
  LayoutDashboard,
  Database,
  FileSpreadsheet,
  Download,
  Search,
  BarChart3,
  FileText,
  Gauge,
  Monitor,
  Users,
  Shield,
  ClipboardList,
  Building2,
  Activity,
  PanelLeftClose,
  PanelLeftOpen,
  BarChart2,
} from 'lucide-react';

export type PageId =
  | 'portal'
  | 'datasource'
  | 'dataset'
  | 'dataset-config'
  | 'dataset-detail'
  | 'self-service'
  | 'data-explore'
  | 'chart-manage'
  | 'report'
  | 'dashboard'
  | 'data-screen'
  | 'data-screen-config'
  | 'data-screen-preview'
  | 'user-manage'
  | 'role-manage'
  | 'operation-log'
  | 'tenant-manage'
  | 'metrics';

interface NavGroup {
  label: string;
  items: { id: PageId; label: string; icon: React.ElementType }[];
}

const navGroups: NavGroup[] = [
  {
    label: '数据门户',
    items: [{ id: 'portal', label: '数据门户', icon: LayoutDashboard }],
  },
  {
    label: '数据准备',
    items: [
      { id: 'datasource', label: '数据源', icon: Database },
      { id: 'dataset', label: '数据集', icon: FileSpreadsheet },
      { id: 'self-service', label: '自助取数', icon: Download },
    ],
  },
  {
    label: '数据分析',
    items: [
      { id: 'data-explore', label: '数据探查', icon: Search },
      { id: 'chart-manage', label: '图表管理', icon: BarChart3 },
      { id: 'report', label: '报表', icon: FileText },
      { id: 'dashboard', label: '仪表盘', icon: Gauge },
      { id: 'data-screen', label: '数据大屏', icon: Monitor },
    ],
  },
  {
    label: '系统管理',
    items: [
      { id: 'user-manage', label: '用户管理', icon: Users },
      { id: 'role-manage', label: '角色管理', icon: Shield },
      { id: 'operation-log', label: '操作日志', icon: ClipboardList },
      { id: 'tenant-manage', label: '租户管理', icon: Building2 },
    ],
  },
  {
    label: '监控告警',
    items: [{ id: 'metrics', label: '指标监控', icon: Activity }],
  },
];

interface LayoutProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  children: React.ReactNode;
}

export default function Layout({ activePage, onNavigate, children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = useCallback(() => setCollapsed((v) => !v), []);

  return (
    <div className="dae-page" style={{ display: 'flex', height: '100vh', background: '#f8fafc' }}>
      <aside className={`dae-sidebar dae-scroll ${collapsed ? 'collapsed' : ''}`}>
        <div className="dae-sidebar-header">
          <div className="dae-logo-icon">
            <BarChart2 size={16} />
          </div>
          {!collapsed && <span className="dae-logo-text">数据分析引擎</span>}
          <button className="dae-sidebar-collapse" onClick={toggleCollapse} title={collapsed ? '展开' : '折叠'}>
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>
        <nav className="dae-sidebar-nav">
          {navGroups.map((group) => (
            <div key={group.label} className="dae-sidebar-group">
              {!collapsed && <div className="dae-sidebar-group-label">{group.label}</div>}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === activePage;
                return (
                  <button
                    key={item.id}
                    className={`dae-sidebar-item ${isActive ? 'active' : ''}`}
                    onClick={() => onNavigate(item.id)}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="dae-sidebar-icon" size={18} />
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'auto' }} className="dae-scroll">
          <div style={{ padding: '24px 28px', minHeight: '100%' }}>{children}</div>
        </div>
      </main>
    </div>
  );
}
