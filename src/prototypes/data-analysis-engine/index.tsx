/**
 * @name 数据分析引擎系统
 */

import React from 'react';
import { defineHashPageRoute, useHashPage } from '../../common/useHashPage';
import Layout, { type PageId } from './components/Layout';
import PortalPage from './pages/PortalPage';
import DatasourcePage from './pages/DatasourcePage';
import DatasetPage from './pages/dataset';
import DatasetConfigPage from './pages/dataset/config';
import DatasetDetailConfigPage from './pages/dataset/detail';
import SelfServicePage from './pages/SelfServicePage';
import DataExplorePage from './pages/DataExplorePage';
import ChartManagePage from './pages/ChartManagePage';
import ReportPage from './pages/ReportPage';
import DashboardPage from './pages/DashboardPage';
import DataScreenPage from './pages/DataScreenPage';
import UserManagePage from './pages/UserManagePage';
import RoleManagePage from './pages/RoleManagePage';
import OperationLogPage from './pages/OperationLogPage';
import TenantManagePage from './pages/TenantManagePage';
import MetricsPage from './pages/MetricsPage';
import './style.css';

const pageMap: Record<string, React.ComponentType> = {
  portal: PortalPage,
  datasource: DatasourcePage,
  dataset: DatasetPage,
  'dataset-config': DatasetConfigPage,
  'dataset-detail': DatasetDetailConfigPage,
  'self-service': SelfServicePage,
  'data-explore': DataExplorePage,
  'chart-manage': ChartManagePage,
  report: ReportPage,
  dashboard: DashboardPage,
  'data-screen': DataScreenPage,
  'user-manage': UserManagePage,
  'role-manage': RoleManagePage,
  'operation-log': OperationLogPage,
  'tenant-manage': TenantManagePage,
  metrics: MetricsPage,
};

const route = defineHashPageRoute(
  [
    { id: 'portal', title: '数据门户' },
    { id: 'datasource', title: '数据源' },
    { id: 'dataset', title: '数据集' },
    { id: 'dataset-config', title: '数据集配置' },
    { id: 'self-service', title: '自助取数' },
    { id: 'data-explore', title: '数据探查' },
    { id: 'chart-manage', title: '图表管理' },
    { id: 'report', title: '报表' },
    { id: 'dashboard', title: '仪表盘' },
    { id: 'data-screen', title: '数据大屏' },
    { id: 'user-manage', title: '用户管理' },
    { id: 'role-manage', title: '角色管理' },
    { id: 'metrics', title: '指标监控' },
    { id: 'operation-log', title: '操作日志' },
    { id: 'tenant-manage', title: '租户管理' },
  ],
  { defaultPageId: 'portal' },
);

export default function DataAnalysisEngine() {
  const { page, setPage } = useHashPage(route);
  const activePage = page || 'portal';
  const PageComponent = pageMap[activePage] || PortalPage;

  // 对于二级页面，高亮父级菜单
  const layoutActivePage = activePage.startsWith('dataset-') ? 'dataset' : activePage;

  return (
    <Layout activePage={layoutActivePage as PageId} onNavigate={(p) => setPage(p)}>
      <PageComponent />
    </Layout>
  );
}
