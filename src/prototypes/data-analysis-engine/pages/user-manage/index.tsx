/**
 * @name 用户管理
 */

import React from 'react';
import Layout from '../../components/Layout';
import UserManagePage from '../../pages/UserManagePage';
import '../../style.css';

export default function DataAnalysisEngineUserManage() {
  return (
    <Layout activePage="user-manage" onNavigate={() => {}}>
      <UserManagePage />
    </Layout>
  );
}
