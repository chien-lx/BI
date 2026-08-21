/**
 * 问数记录页（AI 中心 → 问数记录）
 * 展示用户通过「问数助手 / 智能问数页」发起的自然语言问数，
 * 含：问题、黑话改写、作用域、命中语义层、推理过程、SQL、图表类型、结论、反馈。
 * 供管理员评估回答质量并迭代语义层 / 模型策略。
 */

import React, { useMemo, useState } from 'react';
import { BarChart, Search, Filter, X, ThumbsUp, ThumbsDown, Sparkles, Database, FileText, Gauge, Monitor } from 'lucide-react';
import { getQueryLogs, type QueryLog, type ScopeType } from '../data/semanticLayer';
import { useAuth } from '../contexts/AuthContext';

const SCOPE_ICONS: Record<ScopeType, React.ElementType> = {
  dataset: Database,
  report: FileText,
  dashboard: Gauge,
  'data-screen': Monitor,
};

const FEEDBACK_FILTERS = [
  { value: 'all', label: '全部' },
  { value: 'up', label: '准确' },
  { value: 'down', label: '不准' },
  { value: 'null', label: '未反馈' },
];

export default function QueryLogsPage() {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState<QueryLog[]>(() => getQueryLogs());
  const [search, setSearch] = useState('');
  const [fb, setFb] = useState<'all' | 'up' | 'down' | 'null'>('all');
  const [detail, setDetail] = useState<QueryLog | null>(null);

  if (!currentUser?.isSuperAdmin) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--dae-ink-muted)' }}>
        <BarChart size={36} style={{ opacity: 0.5 }} />
        <div style={{ marginTop: 12, fontSize: 15, fontWeight: 600, color: 'var(--dae-ink)' }}>无访问权限</div>
        <div style={{ fontSize: 13, marginTop: 6 }}>问数记录仅对超级管理员开放。</div>
      </div>
    );
  }

  const refresh = () => setLogs(getQueryLogs());

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return logs.filter((l) => {
      if (fb !== 'all' && String(l.feedback) !== fb) return false;
      if (q && !(l.question.toLowerCase().includes(q) || l.resultSummary.toLowerCase().includes(q) || l.scopeName.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [logs, search, fb]);

  const stats = useMemo(() => {
    const total = logs.length;
    const accurate = logs.filter((l) => l.feedback === 'up').length;
    const inaccurate = logs.filter((l) => l.feedback === 'down').length;
    const hitSemantic = logs.filter((l) => l.hitSemantic).length;
    return { total, accurate, inaccurate, hitSemantic };
  }, [logs]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#1677FF,#0ea5e9)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BarChart size={20} />
        </div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--dae-ink)' }}>问数记录</div>
          <div style={{ fontSize: 12.5, color: 'var(--dae-ink-muted)', marginTop: 2 }}>评估智能问数回答质量，据此迭代语义层与模型策略</div>
        </div>
      </div>

      {/* 统计卡 */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <StatCard label="总记录" value={stats.total} />
        <StatCard label="回答准确" value={stats.accurate} color="#16a34a" />
        <StatCard label="回答不准" value={stats.inaccurate} color="#dc2626" />
        <StatCard label="命中语义层" value={stats.hitSemantic} color="#7c3aed" />
      </div>

      {/* 筛选 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, background: '#fff', border: '1px solid var(--dae-border)', flex: 1, maxWidth: 360 }}>
          <Search size={14} style={{ color: '#94a3b8' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索问题 / 结论 / 作用域" style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, background: 'transparent' }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {FEEDBACK_FILTERS.map((f) => (
            <button key={f.value} onClick={() => setFb(f.value as typeof fb)} style={{ padding: '7px 12px', borderRadius: 8, border: fb === f.value ? '1px solid #1677FF' : '1px solid var(--dae-border)', background: fb === f.value ? '#eff6ff' : '#fff', color: fb === f.value ? '#1677FF' : 'var(--dae-ink-secondary)', fontSize: 12.5, cursor: 'pointer' }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 列表 */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: '#fff', border: '1px solid var(--dae-border)', borderRadius: 12 }} className="dae-scroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={thStyle}>用户问题</th>
              <th style={thStyle}>作用域</th>
              <th style={thStyle}>命中黑话</th>
              <th style={thStyle}>图表</th>
              <th style={thStyle}>语义层</th>
              <th style={thStyle}>反馈</th>
              <th style={{ ...thStyle, width: 70 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => {
              const Icon = SCOPE_ICONS[l.scopeType];
              return (
                <tr key={l.id} style={{ cursor: 'pointer' }} onClick={() => setDetail(l)}>
                  <td style={{ ...tdStyle, maxWidth: 280 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{l.question}</div>
                    <div style={{ fontSize: 11, color: 'var(--dae-ink-muted)', marginTop: 2 }}>{new Date(l.createdAt).toLocaleString('zh-CN')}</div>
                  </td>
                  <td style={tdStyle}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon size={13} style={{ color: '#94a3b8' }} />{l.scopeName}</span></td>
                  <td style={tdStyle}>{l.hitTerms.length ? l.hitTerms.join('、') : '—'}</td>
                  <td style={tdStyle}>{l.chartTypeName}</td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: l.hitSemantic ? '#ede9fe' : '#f1f5f9', color: l.hitSemantic ? '#7c3aed' : '#94a3b8' }}>
                      {l.hitSemantic ? '已命中' : '未命中'}
                    </span>
                  </td>
                  <td style={tdStyle}>{l.feedback === 'up' ? <span style={{ color: '#16a34a' }}><ThumbsUp size={14} /></span> : l.feedback === 'down' ? <span style={{ color: '#dc2626' }}><ThumbsDown size={14} /></span> : <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                  <td style={tdStyle}><button onClick={(e) => { e.stopPropagation(); setDetail(l); }} style={ghostBtn}>详情</button></td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--dae-ink-muted)' }}>暂无记录</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 详情抽屉 */}
      {detail && (
        <div style={drawerMask} onClick={() => setDetail(null)}>
          <div style={drawerPanel} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--dae-ink)' }}>问数详情</div>
              <button onClick={() => setDetail(null)} style={iconBtn}><X size={16} /></button>
            </div>

            <Field label="用户问题">{detail.question}</Field>
            {detail.rewrittenQuestion !== detail.question && <Field label="黑话改写">{detail.rewrittenQuestion}</Field>}
            <Field label="作用域">{detail.scopeName}（{detail.scopeType}）{detail.datasetName ? ` · 数据集：${detail.datasetName}` : ''}</Field>
            <Field label="命中语义层">
              {detail.hitSemantic ? '是' : '否'}
              {detail.hitTerms.length > 0 && <span style={{ marginLeft: 8, color: '#7c3aed' }}>术语：{detail.hitTerms.join('、')}</span>}
            </Field>

            <Divider />
            <Field label="推理过程"><pre style={preStyle}>{detail.reasoning}</pre></Field>
            <Field label="生成 SQL"><pre style={preStyle}>{detail.sql}</pre></Field>
            <Field label="图表类型">{detail.chartTypeName}</Field>
            <Field label="结论">{detail.resultSummary}</Field>

            <Divider />
            <Field label="用户反馈">
              {detail.feedback === 'up' ? <span style={{ color: '#16a34a' }}>👍 准确</span> : detail.feedback === 'down' ? <span style={{ color: '#dc2626' }}>👎 不准</span> : '未反馈'}
              {detail.feedbackReason && <div style={{ marginTop: 6, fontSize: 12.5, color: 'var(--dae-ink-muted)' }}>原因：{detail.feedbackReason}</div>}
            </Field>
            {detail.correctedSql && <Field label="管理员修正 SQL"><pre style={preStyle}>{detail.correctedSql}</pre></Field>}

            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <button onClick={() => { /* 原型：仅展示 */ }} style={ghostBtn}><ThumbsUp size={14} /> 标记准确</button>
              <button onClick={() => { /* 原型：仅展示 */ }} style={{ ...ghostBtn, color: '#dc2626' }}><ThumbsDown size={14} /> 标记不准</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div style={{ flex: 1, background: '#fff', border: '1px solid var(--dae-border)', borderRadius: 12, padding: '12px 16px' }}>
      <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: color || 'var(--dae-ink)', marginTop: 4 }}>{value}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--dae-ink-secondary)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--dae-ink)', lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--dae-border)', margin: '14px 0' }} />;
}

const thStyle: React.CSSProperties = { textAlign: 'left', padding: '9px 10px', borderBottom: '2px solid var(--dae-border)', color: 'var(--dae-ink-secondary)', fontWeight: 600, background: '#f8fafc' };
const tdStyle: React.CSSProperties = { padding: '10px', borderBottom: '1px solid var(--dae-border)', color: 'var(--dae-ink)', verticalAlign: 'top' };
const preStyle: React.CSSProperties = { margin: 0, fontSize: 12, background: '#0f172a', color: '#d1fae5', borderRadius: 8, padding: '10px 12px', whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, monospace', maxHeight: 200, overflow: 'auto' };
const ghostBtn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 5, border: '1px solid var(--dae-border)', background: '#fff', borderRadius: 8, padding: '6px 10px', fontSize: 12.5, cursor: 'pointer', color: 'var(--dae-ink-secondary)' };
const iconBtn: React.CSSProperties = { width: 30, height: 30, borderRadius: 8, border: '1px solid var(--dae-border)', background: '#fff', color: 'var(--dae-ink-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const drawerMask: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.35)', zIndex: 1500, display: 'flex', justifyContent: 'flex-end' };
const drawerPanel: React.CSSProperties = { width: 480, maxWidth: '94vw', height: '100%', background: '#fff', padding: 22, overflowY: 'auto', boxShadow: '-8px 0 30px rgba(0,0,0,0.15)' };
