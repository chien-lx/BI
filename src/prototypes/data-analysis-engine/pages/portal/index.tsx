/**
 * @name 数据门户
 */

import React from 'react';
import Layout from '../../components/Layout';
import PortalPage from '../../pages/PortalPage';
import '../../style.css';

export default function DataAnalysisEnginePortal() {
  return (
    <Layout activePage="portal" onNavigate={() => {}}>
      <PortalPage />
    </Layout>
  );
}
