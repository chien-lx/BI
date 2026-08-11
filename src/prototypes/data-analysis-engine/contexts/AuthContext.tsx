import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  currentUser,
  getCurrentUserTenants,
  tenants,
  type TenantItem,
  type UserItem,
} from '../data/mockData';

interface AuthContextValue {
  /** 当前登录用户 */
  currentUser: UserItem;
  /** 当前选中的租户 ID */
  currentTenantId: string;
  /** 当前选中的租户对象 */
  currentTenant: TenantItem | undefined;
  /** 当前用户可访问的租户列表 */
  accessibleTenants: TenantItem[];
  /** 切换当前租户 */
  switchTenant: (tenantId: string) => void;
  /** 退出登录（原型中仅触发提示/刷新） */
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 默认选中第一个可访问租户；超级管理员默认总部 T001，普通用户默认其第一个 membership
  const accessibleTenants = useMemo(() => getCurrentUserTenants(currentUser), []);
  const [currentTenantId, setCurrentTenantId] = useState(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('dae-current-tenant-id') : null;
    if (stored && accessibleTenants.some((t) => t.id === stored)) return stored;
    return accessibleTenants[0]?.id || '';
  });

  const currentTenant = useMemo(
    () => tenants.find((t) => t.id === currentTenantId),
    [currentTenantId]
  );

  const switchTenant = (tenantId: string) => {
    if (!accessibleTenants.some((t) => t.id === tenantId)) return;
    setCurrentTenantId(tenantId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dae-current-tenant-id', tenantId);
    }
  };

  const logout = () => {
    // 原型阶段仅做页面级提示；真实项目中应调用登录服务并清空 Token
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dae-current-tenant-id');
      window.location.reload();
    }
  };

  const value = useMemo(
    () => ({
      currentUser,
      currentTenantId,
      currentTenant,
      accessibleTenants,
      switchTenant,
      logout,
    }),
    [currentTenantId, currentTenant, accessibleTenants]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
