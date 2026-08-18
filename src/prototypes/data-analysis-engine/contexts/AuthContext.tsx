import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  currentUser,
  getCurrentUserTenants,
  tenants,
  appendOperationLog,
  nextOperationLogId,
  type TenantItem,
  type UserItem,
} from '../data/mockData';

export interface LoginResult {
  ok: boolean;
  error?: string;
}

/** 演示账号：账号/邮箱 → 用户 ID（原型固定以张三 U001 作为演示主体） */
const DEMO_CREDENTIALS: Record<string, string> = {
  zhangsan: 'U001',
  'zhangsan@company.com': 'U001',
  admin: 'U001',
};
const DEMO_PASSWORD = '123456';

function nowStr() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

interface AuthContextValue {
  /** 当前登录用户 */
  currentUser: UserItem;
  /** 是否已登录（原型用 localStorage 模拟登录态） */
  loggedIn: boolean;
  /** 账号密码登录，返回是否成功及错误信息 */
  login: (account: string, password: string) => LoginResult;
  /** 当前选中的租户 ID */
  currentTenantId: string;
  /** 当前选中的租户对象 */
  currentTenant: TenantItem | undefined;
  /** 当前用户可访问的租户列表 */
  accessibleTenants: TenantItem[];
  /** 切换当前租户 */
  switchTenant: (tenantId: string) => void;
  /** 退出登录（清空登录态并刷新） */
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 默认选中第一个可访问租户；超级管理员默认总部 T001，普通用户默认其第一个 membership
  const accessibleTenants = useMemo(() => getCurrentUserTenants(currentUser), []);
  const [loggedIn, setLoggedIn] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('dae-logged-in') === '1';
  });
  const [currentTenantId, setCurrentTenantId] = useState(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('dae-current-tenant-id') : null;
    if (stored && accessibleTenants.some((t) => t.id === stored)) return stored;
    return accessibleTenants[0]?.id || '';
  });

  const login = (account: string, password: string): LoginResult => {
    const key = account.trim().toLowerCase();
    const userId = DEMO_CREDENTIALS[key];
    if (!userId) {
      return { ok: false, error: '账号不存在，请使用演示账号 zhangsan' };
    }
    if (password !== DEMO_PASSWORD) {
      return { ok: false, error: '密码错误，演示密码为 123456' };
    }
    setLoggedIn(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dae-logged-in', '1');
      localStorage.setItem('dae-last-login', nowStr());
      appendOperationLog({
        id: nextOperationLogId(),
        user: currentUser.name,
        account: currentUser.email,
        module: '数据门户',
        menuId: 'data-portal',
        action: '登录',
        actionType: 'login',
        detail: '登录了系统',
        ip: '192.168.1.100',
        time: nowStr(),
      });
    }
    return { ok: true };
  };

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
    // 原型阶段仅清空本地登录态；真实项目中应调用登录服务并清空 Token
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dae-logged-in');
      localStorage.removeItem('dae-current-tenant-id');
    }
    setLoggedIn(false);
  };

  const value = useMemo(
    () => ({
      currentUser,
      loggedIn,
      login,
      currentTenantId,
      currentTenant,
      accessibleTenants,
      switchTenant,
      logout,
    }),
    [currentTenantId, currentTenant, accessibleTenants, loggedIn]
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
