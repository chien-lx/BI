/**
 * @name 数据探查
 */

import React from 'react';
import Layout from '../../components/Layout';
import DataExplorePage from '../../pages/DataExplorePage';
import '../../style.css';

export default function DataAnalysisEngineDataExplore() {
  return (
    <Layout activePage="data-explore" onNavigate={() => {}}>
      <DataExplorePage />
    </Layout>
  );
}
