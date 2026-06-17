/**
 * @name 仪表盘
 */

import React from 'react';
import Layout from '../../components/Layout';
import DashboardPage from '../../pages/DashboardPage';
import '../../style.css';

export default function DataAnalysisEngineDashboard() {
  return (
    <Layout activePage="dashboard" onNavigate={() => {}}>
      <DashboardPage />
    </Layout>
  );
}
