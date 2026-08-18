import React, { useState } from 'react';
import { User, Lock, Activity, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { login } = useAuth();
  const [account, setAccount] = useState('zhangsan');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!account.trim() || !password) {
      setError('请输入账号和密码');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const res = login(account, password);
      setLoading(false);
      if (res.ok) {
        onLoginSuccess?.();
      } else {
        setError(res.error || '登录失败，请重试');
      }
    }, 420);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        background: 'linear-gradient(135deg, #eef5ff 0%, #e3f0ff 45%, #f3f7ff 75%, #eaf6ff 100%)',
        fontFamily: 'inherit',
        overflow: 'hidden',
      }}
    >
      {/* 浅色科技纹理：柔和光晕 + 细网格 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 18% 25%, rgba(56, 189, 248, 0.22) 0%, transparent 38%),' +
            'radial-gradient(circle at 82% 72%, rgba(99, 102, 241, 0.18) 0%, transparent 42%),' +
            'radial-gradient(circle at 60% 10%, rgba(14, 165, 233, 0.12) 0%, transparent 35%),' +
            'linear-gradient(rgba(100, 116, 139, 0.06) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(100, 116, 139, 0.06) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 100% 100%, 100% 100%, 56px 56px, 56px 56px',
          pointerEvents: 'none',
        }}
      />

      {/* 左侧品牌区（浅色底，深色文字） */}
      <div
        style={{
          flex: '0 0 46%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 64px',
          color: '#0b2545',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 30 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              boxShadow: '0 8px 24px rgba(14, 165, 233, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Activity size={28} color="#fff" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: 1, color: '#0b2545' }}>数据分析引擎</div>
        </div>
        <h1 style={{ fontSize: 42, lineHeight: 1.2, margin: 0, fontWeight: 800, color: '#0b2545' }}>
          让数据触手可及
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: '#475569', marginTop: 20, maxWidth: 430 }}>
          连接数据源、构建数据集、可视化探索与自助取数，一站式完成图表、报表、仪表盘、数据大屏的制作、上线与门户订阅。
        </p>
        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            '数据源 / 数据集 / 自助取数',
            '数据探查 · 图表 · 报表 · 仪表盘 · 数据大屏',
            '上线发布 · 数据门户 · 订阅审核 · 指标监控',
          ].map((t) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#334155' }}>
              <ShieldCheck size={18} color="#0ea5e9" />
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* 右侧登录卡片 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            width: '100%',
            maxWidth: 400,
            background: 'rgba(255, 255, 255, 0.82)',
            borderRadius: 20,
            padding: '40px 38px 34px',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            boxShadow: '0 24px 70px rgba(30, 64, 120, 0.16), inset 0 1px 0 rgba(255,255,255,0.9)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            color: '#0f172a',
          }}
        >
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0b2545' }}>账号登录</h2>
          <p style={{ margin: '10px 0 28px', fontSize: 13, color: '#64748b' }}>
            请输入账号密码进入系统（原型演示环境）
          </p>

          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8 }}>
            账号
          </label>
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <User size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              value={account}
              autoFocus
              onChange={(e) => setAccount(e.target.value)}
              placeholder="请输入账号"
              style={{
                width: '100%',
                padding: '11px 14px 11px 40px',
                height: 46,
                fontSize: 14,
                color: '#0f172a',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 10,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#0ea5e9';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.18)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8 }}>
            密码
          </label>
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <Lock size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              style={{
                width: '100%',
                padding: '11px 14px 11px 40px',
                height: 46,
                fontSize: 14,
                color: '#0f172a',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 10,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#0ea5e9';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.18)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {error && (
            <div
              style={{
                fontSize: 13,
                color: '#b91c1c',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 8,
                padding: '9px 12px',
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: 46,
              fontSize: 15,
              fontWeight: 700,
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.75 : 1,
              background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 55%, #6366f1 100%)',
              boxShadow: '0 8px 26px rgba(37, 99, 235, 0.35)',
              transition: 'transform 0.15s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 12px 34px rgba(37, 99, 235, 0.45)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 26px rgba(37, 99, 235, 0.35)';
            }}
          >
            {loading ? '登录中…' : '登 录'}
          </button>

          <div
            style={{
              marginTop: 22,
              fontSize: 12,
              color: '#64748b',
              background: '#f1f5f9',
              border: '1px dashed #cbd5e1',
              borderRadius: 10,
              padding: '12px 14px',
              lineHeight: 1.7,
            }}
          >
            演示账号：<strong style={{ color: '#0b2545' }}>zhangsan</strong> &nbsp;|&nbsp; 密码：
            <strong style={{ color: '#0b2545' }}>123456</strong>
            <br />
            登录后将以「张三（系统管理员）」身份进入个人工作台。
          </div>
        </form>
      </div>
    </div>
  );
}
