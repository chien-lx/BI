/**
 * @name 角色管理
 */

import React from 'react';
import Layout from '../../components/Layout';
import RoleManagePage from '../../pages/RoleManagePage';
import '../../style.css';

export default function DataAnalysisEngineRoleManage() {
  return (
    <Layout activePage="role-manage" onNavigate={() => {}}>
      <RoleManagePage />
    </Layout>
  );
}
