/**
 * @name 数据大屏
 */

import React from 'react';
import Layout from '../../components/Layout';
import DataScreenPage from '../../pages/DataScreenPage';
import '../../style.css';

export default function DataAnalysisEngineDataScreen() {
  return (
    <Layout activePage="data-screen" onNavigate={() => {}}>
      <DataScreenPage />
    </Layout>
  );
}
