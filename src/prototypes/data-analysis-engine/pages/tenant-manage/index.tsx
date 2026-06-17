/**
 * @name 租户管理
 */

import React from 'react';
import Layout from '../../components/Layout';
import TenantManagePage from '../../pages/TenantManagePage';
import '../../style.css';

export default function DataAnalysisEngineTenantManage() {
  return (
    <Layout activePage="tenant-manage" onNavigate={() => {}}>
      <TenantManagePage />
    </Layout>
  );
}
