/**
 * @name 数据源
 */

import React from 'react';
import Layout from '../../components/Layout';
import DatasourcePage from '../DatasourcePage';
import '../../style.css';

export default function DataAnalysisEngineDatasource() {
  return (
    <Layout activePage="datasource" onNavigate={() => {}}>
      <DatasourcePage />
    </Layout>
  );
}
