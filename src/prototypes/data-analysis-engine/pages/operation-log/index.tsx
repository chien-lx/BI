/**
 * @name 操作日志
 */

import React from 'react';
import Layout from '../../components/Layout';
import OperationLogPage from '../../pages/OperationLogPage';
import '../../style.css';

export default function DataAnalysisEngineOperationLog() {
  return (
    <Layout activePage="operation-log" onNavigate={() => {}}>
      <OperationLogPage />
    </Layout>
  );
}
