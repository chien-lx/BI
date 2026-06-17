/**
 * @name 图表管理
 */

import React from 'react';
import Layout from '../../components/Layout';
import ChartManagePage from '../../pages/ChartManagePage';
import '../../style.css';

export default function DataAnalysisEngineChartManage() {
  return (
    <Layout activePage="chart-manage" onNavigate={() => {}}>
      <ChartManagePage />
    </Layout>
  );
}
