/**
 * @name 指标监控
 */

import React from 'react';
import Layout from '../../components/Layout';
import MetricsPage from '../../pages/MetricsPage';
import '../../style.css';

export default function DataAnalysisEngineMetrics() {
  return (
    <Layout activePage="metrics" onNavigate={() => {}}>
      <MetricsPage />
    </Layout>
  );
}
