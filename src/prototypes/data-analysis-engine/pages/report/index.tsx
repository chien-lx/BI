/**
 * @name 报表
 */

import React from 'react';
import Layout from '../../components/Layout';
import ReportPage from '../../pages/ReportPage';
import '../../style.css';

export default function DataAnalysisEngineReport() {
  return (
    <Layout activePage="report" onNavigate={() => {}}>
      <ReportPage />
    </Layout>
  );
}
