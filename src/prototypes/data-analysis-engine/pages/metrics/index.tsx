/**
 * @name 指标监控
 */

import React from 'react';
import Layout from '../../components/Layout';
import MetricsTaskPage from '../../pages/MetricsTaskPage';
import '../../style.css';

export default function DataAnalysisEngineMetrics() {
  return (
    <Layout activePage="metrics-task" onNavigate={() => {}}>
      <MetricsTaskPage />
    </Layout>
  );
}
