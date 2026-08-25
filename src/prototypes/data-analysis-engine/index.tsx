/**
 * @name 数据分析引擎系统
 */

import React, { useEffect } from 'react';
import { defineHashPageRoute, useHashPage } from '../../common/useHashPage';
import Layout, { type PageId } from './components/Layout';
import PersonalWorkbenchPage from './pages/PersonalWorkbenchPage';
import PortalPage from './pages/PortalPage';
import DatasourcePage from './pages/DatasourcePage';
import DatasetPage from './pages/dataset';
import DatasetConfigPage from './pages/dataset/config';
import DatasetDetailConfigPage from './pages/dataset/detail';
import SelfServicePage from './pages/SelfServicePage';
import DataExplorePage from './pages/DataExplorePage';
import ChartManagePage from './pages/ChartManagePage';
import ReportPage from './pages/ReportPage';
import ReportConfigPage from './pages/report/config';
import ReportPreviewPage from './pages/report/preview';
import DashboardPage from './pages/DashboardPage';
import DashboardConfigPage from './pages/dashboard/config';
import DashboardPreviewPage from './pages/dashboard/preview';
import DataScreenPage from './pages/DataScreenPage';
import DataScreenConfigPage from './pages/data-screen/config';
import DataScreenPreviewPage from './pages/data-screen/preview';
import DatasetPreviewPage from './pages/DatasetPreviewPage';
import UserManagePage from './pages/UserManagePage';
import RoleManagePage from './pages/RoleManagePage';
import OperationLogPage from './pages/OperationLogPage';
import TenantManagePage from './pages/TenantManagePage';
import MetricsTaskPage from './pages/MetricsTaskPage';
import MetricsAlertPage from './pages/MetricsAlertPage';
import MetricsPushPage from './pages/MetricsPushPage';
import SubscribeApprovePage from './pages/SubscribeApprovePage';
import ApproveAssigneePage from './pages/ApproveAssigneePage';
import PermissionApprovePage from './pages/PermissionApprovePage';
import AssistantAdminPage from './pages/AssistantAdminPage';
import QueryPage from './pages/QueryPage';
import SemanticLayerPage from './pages/SemanticLayerPage';
import QueryLogsPage from './pages/QueryLogsPage';
import LoginPage from './pages/LoginPage';
import AIAssistantWidget from './components/AIAssistant/AIAssistantWidget';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './style.css';
import { AnnotationViewer, type AnnotationSourceDocument } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';

const pageMap: Record<string, React.ComponentType> = {
  login: LoginPage,
  'personal-workbench': PersonalWorkbenchPage,
  portal: PortalPage,
  datasource: DatasourcePage,
  dataset: DatasetPage,
  'dataset-config': DatasetConfigPage,
  'dataset-detail': DatasetDetailConfigPage,
  'self-service': SelfServicePage,
  'data-explore': DataExplorePage,
  'chart-manage': ChartManagePage,
  report: ReportPage,
  'report-config': ReportConfigPage,
  'report-preview': ReportPreviewPage,
  dashboard: DashboardPage,
  'dashboard-config': DashboardConfigPage,
  'dashboard-preview': DashboardPreviewPage,
  'data-screen': DataScreenPage,
  'data-screen-config': DataScreenConfigPage,
  'data-screen-preview': DataScreenPreviewPage,
  'dataset-preview': DatasetPreviewPage,
  'user-manage': UserManagePage,
  'role-manage': RoleManagePage,
  'operation-log': OperationLogPage,
  'tenant-manage': TenantManagePage,
  'metrics-task': MetricsTaskPage,
  'metrics-alert': MetricsAlertPage,
  'metrics-push': MetricsPushPage,
  'subscribe-approve': SubscribeApprovePage,
  'approve-assignee': ApproveAssigneePage,
  'permission-approve': PermissionApprovePage,
  'assistant-admin': AssistantAdminPage,
  'query': QueryPage,
  'ai-knowledge': AssistantAdminPage,
  'ai-config': AssistantAdminPage,
  'ai-semantic': SemanticLayerPage,
  'ai-conv-logs': AssistantAdminPage,
  'ai-query-logs': QueryLogsPage,
};

/** AI 中心子菜单 → 管理后台默认 Tab 映射（仅指向 AssistantAdminPage 的子项） */
const AI_TAB_DEFAULTS: Record<string, string> = {
  'ai-knowledge': 'docs',
  'ai-config': 'config',
  'ai-conv-logs': 'logs',
};

const route = defineHashPageRoute(
  [
    { id: 'login', title: '登录' },
    { id: 'personal-workbench', title: '个人工作台' },
    { id: 'portal', title: '数据门户' },
    { id: 'datasource', title: '数据源' },
    { id: 'dataset', title: '数据集' },
    { id: 'dataset-config', title: '数据集配置' },
    { id: 'self-service', title: '自助取数' },
    { id: 'data-explore', title: '数据探查' },
    { id: 'chart-manage', title: '图表管理' },
    { id: 'report', title: '报表' },
    { id: 'report-config', title: '报表配置' },
    { id: 'report-preview', title: '报表预览' },
    { id: 'dashboard', title: '仪表盘' },
    { id: 'dashboard-config', title: '仪表盘配置' },
    { id: 'dashboard-preview', title: '仪表盘预览' },
    { id: 'data-screen', title: '数据大屏' },
    { id: 'data-screen-config', title: '数据大屏配置' },
    { id: 'data-screen-preview', title: '数据大屏预览' },
    { id: 'dataset-preview', title: '数据集预览' },
    { id: 'user-manage', title: '用户管理' },
    { id: 'role-manage', title: '角色管理' },
    { id: 'metrics-task', title: '监控任务' },
    { id: 'metrics-alert', title: '预警记录' },
    { id: 'metrics-push', title: '推送规则' },
    { id: 'operation-log', title: '操作日志' },
    { id: 'tenant-manage', title: '租户管理' },
    { id: 'subscribe-approve', title: '任务审核' },
    { id: 'approve-assignee', title: '审核人配置' },
    { id: 'permission-approve', title: '权限审核' },
    { id: 'assistant-admin', title: 'AI 助手管理' },
    { id: 'query', title: '智能问数' },
    { id: 'ai-knowledge', title: '知识库文档' },
    { id: 'ai-config', title: '参数配置' },
    { id: 'ai-semantic', title: '语义层 / 行业黑话' },
    { id: 'ai-conv-logs', title: '对话记录' },
    { id: 'ai-query-logs', title: '问数记录' },
  ],
  { defaultPageId: 'portal' },
);

export default function DataAnalysisEngine() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

function AppShell() {
  const { loggedIn, logout, currentUser } = useAuth();
  const { page, setPage } = useHashPage(route);

  // 登录后默认进入个人工作台（防止直接访问 #page=login 等越权入口）
  useEffect(() => {
    if (loggedIn && page === 'login') {
      setPage('personal-workbench');
    }
  }, [loggedIn, page, setPage]);

  const handleNavigate = (p: string) => {
    if (p === 'login' && loggedIn) {
      logout();
      setPage('login');
      return;
    }
    setPage(p);
  };

  // 未登录：强制进入登录页（演示环境用账号密码登录）
  if (!loggedIn) {
    return <LoginPage onLoginSuccess={() => setPage('personal-workbench')} />;
  }

  const activePage = page || 'portal';
  const PageComponent = pageMap[activePage] || PortalPage;
  const adminDefaultTab = AI_TAB_DEFAULTS[activePage];

  // 对于二级页面，高亮父级菜单
  const layoutActivePage = activePage.startsWith('dataset-')
    ? 'dataset'
    : activePage.startsWith('report-')
    ? 'report'
    : activePage.startsWith('dashboard-')
    ? 'dashboard'
    : activePage.startsWith('data-screen-')
    ? 'data-screen'
    : activePage;

  // 仪表盘配置/预览页、数据大屏配置/预览页为全屏二级页面，去掉侧边导航和主布局边距
  const isFullScreenPage =
    activePage === 'dashboard-config' ||
    activePage === 'dashboard-preview' ||
    activePage === 'data-screen-config' ||
    activePage === 'data-screen-preview';

  if (isFullScreenPage) {
    return (
      <>
        <div className="dae-page" style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <PageComponent />
          <AnnotationViewer
            source={annotationSourceDocument as unknown as AnnotationSourceDocument}
            options={{
              currentPageId: "data-analysis-engine",
              toolbarEdge: 'right',
              showToolbar: true,
              showThemeToggle: true,
              showColorFilter: true,
              emptyWhenNoData: true,
            }}
          />
        </div>
        <AIAssistantWidget setPage={setPage} />
      </>
    );
  }

  return (
    <>
      <Layout activePage={layoutActivePage as PageId} onNavigate={handleNavigate}>
        {adminDefaultTab ? <AssistantAdminPage defaultTab={adminDefaultTab} /> : <PageComponent />}
      </Layout>
      <AIAssistantWidget setPage={setPage} />
    </>
  );
}
