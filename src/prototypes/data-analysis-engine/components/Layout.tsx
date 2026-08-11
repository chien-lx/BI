import React, { useMemo, useState, useCallback } from 'react';
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
  ChevronDown,
  LogOut,
  User,
  Check,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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

const allNavGroups: NavGroup[] = [
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
  const [tenantOpen, setTenantOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { currentUser, currentTenant, accessibleTenants, switchTenant, logout } = useAuth();

  const toggleCollapse = useCallback(() => setCollapsed((v) => !v), []);

  const navGroups = useMemo(() => {
    if (currentUser.isSuperAdmin) return allNavGroups;
    return allNavGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.id !== 'tenant-manage'),
      }))
      .filter((group) => group.items.length > 0);
  }, [currentUser.isSuperAdmin]);

  const handleSwitchTenant = (tenantId: string) => {
    switchTenant(tenantId);
    setTenantOpen(false);
  };

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
        {/* 顶部全局导航栏：租户切换 + 账号退出 */}
        <header
          style={{
            height: 56,
            flexShrink: 0,
            background: '#fff',
            borderBottom: '1px solid var(--dae-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 24px',
            gap: 20,
          }}
        >
          {/* 租户空间切换 */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setTenantOpen((v) => !v);
                setAccountOpen(false);
              }}
              style={topNavBtnStyle}
            >
              <Building2 size={16} style={{ color: 'var(--dae-primary)' }} />
              <span style={{ fontWeight: 500 }}>{currentTenant?.name || '选择租户'}</span>
              <ChevronDown size={14} style={{ color: 'var(--dae-ink-muted)' }} />
            </button>
            {tenantOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  width: 220,
                  background: '#fff',
                  border: '1px solid var(--dae-border)',
                  borderRadius: 'var(--dae-radius-lg)',
                  boxShadow: 'var(--dae-shadow-lg)',
                  zIndex: 1000,
                  padding: 6,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--dae-ink-muted)',
                    padding: '6px 10px',
                    fontWeight: 500,
                  }}
                >
                  切换租户空间
                </div>
                {accessibleTenants.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSwitchTenant(t.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: 'none',
                      background: currentTenant?.id === t.id ? 'var(--dae-primary-light)' : 'transparent',
                      color: currentTenant?.id === t.id ? 'var(--dae-primary)' : 'var(--dae-ink)',
                      cursor: 'pointer',
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Building2 size={14} />
                      {t.name}
                    </span>
                    {currentTenant?.id === t.id && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 账号信息 / 退出 */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setAccountOpen((v) => !v);
                setTenantOpen(false);
              }}
              style={topNavBtnStyle}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--dae-primary-light)',
                  color: 'var(--dae-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {currentUser.name.slice(0, 1)}
              </div>
              <span style={{ fontWeight: 500 }}>{currentUser.name}</span>
              <ChevronDown size={14} style={{ color: 'var(--dae-ink-muted)' }} />
            </button>
            {accountOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  width: 180,
                  background: '#fff',
                  border: '1px solid var(--dae-border)',
                  borderRadius: 'var(--dae-radius-lg)',
                  boxShadow: 'var(--dae-shadow-lg)',
                  zIndex: 1000,
                  padding: 6,
                }}
              >
                <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--dae-border)', marginBottom: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dae-ink)' }}>{currentUser.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)', marginTop: 2 }}>{currentUser.email}</div>
                  <div style={{ fontSize: 12, color: 'var(--dae-primary)', marginTop: 4 }}>
                    {currentUser.isSuperAdmin ? '系统超级管理员' : currentUser.role}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setAccountOpen(false);
                    logout();
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--dae-ink)',
                    cursor: 'pointer',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dae-surface-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut size={14} />
                  退出登录
                </button>
              </div>
            )}
          </div>
        </header>

        <div style={{ flex: 1, overflow: 'auto' }} className="dae-scroll">
          <div style={{ padding: '24px 28px', minHeight: '100%' }}>{children}</div>
        </div>
      </main>
    </div>
  );
}

const topNavBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 10px',
  borderRadius: 8,
  border: '1px solid transparent',
  background: 'transparent',
  color: 'var(--dae-ink)',
  cursor: 'pointer',
  fontSize: 14,
  transition: 'background 0.15s',
};
