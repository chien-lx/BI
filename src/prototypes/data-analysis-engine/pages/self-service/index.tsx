/**
 * @name 自助取数
 */

import React from 'react';
import Layout from '../../components/Layout';
import SelfServicePage from '../../pages/SelfServicePage';
import '../../style.css';

export default function DataAnalysisEngineSelfService() {
  return (
    <Layout activePage="self-service" onNavigate={() => {}}>
      <SelfServicePage />
    </Layout>
  );
}
