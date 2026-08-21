/**
 * 智能问数 · 独立页面（与 AI 助手内「问数助手」能力同源）
 * - 作用域选择器：数据集（问数）/ 报表 / 仪表盘 / 数据大屏（智能解读）
 * - 自然语言输入 → 推理过程 + SQL + 图表 + 结论
 * - 支持回答后手动切换图表类型
 * - 问数记录写入语义层日志，供管理员评估迭代
 */

import React, { useMemo, useState } from 'react';
import {
  Sparkles,
  Send,
  Database,
  FileText,
  Gauge,
  Monitor,
  History,
  Search,
} from 'lucide-react';
import {
  getDatasets,
  getScopes,
  getTerms,
  getMetrics,
  getQueryLogs,
  appendQueryLog,
  groupScopes,
  type QueryChartType,
  type QueryScope,
} from '../data/semanticLayer';
import { runQuery, type QueryResult } from '../components/AIAssistant/queryEngine';
import { QueryResultView } from '../components/AIAssistant/QueryResultView';
import { useAuth } from '../contexts/AuthContext';

const SCOPE_ICONS: Record<QueryScope['type'], React.ElementType> = {
  dataset: Database,
  report: FileText,
  dashboard: Gauge,
  'data-screen': Monitor,
};

export default function QueryPage() {
  const { currentUser } = useAuth();
  const scopes = getScopes();
  const datasets = getDatasets();
  const terms = getTerms();
  const metrics = getMetrics();

  const [scopeId, setScopeId] = useState<string>(scopes[0]?.id || '');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [chartType, setChartType] = useState<QueryChartType>('bar');
  const [logId, setLogId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [history, setHistory] = useState(() => getQueryLogs().slice(0, 8));

  const scope = useMemo(() => scopes.find((s) => s.id === scopeId) || scopes[0], [scopes, scopeId]);
  const isQuery = scope?.type === 'dataset';
  const scopeGroups = useMemo(() => groupScopes(scopes), [scopes]);

  const SUGGESTIONS = isQuery
    ? ['最近 7 天的 GMV 趋势', '各地区的销量占比', '销售额 Top 10 商品', '本月客单价是多少']
    : ['帮我把这个仪表盘解读一下', '这个报表的核心指标有哪些', '大屏展示了哪些经营情况'];

  const run = (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || loading || !scope) return;
    setInput('');
    setLoading(true);
    setResult(null);
    const start = Date.now();
    window.setTimeout(() => {
      const r = runQuery(q, scope, datasets, terms, metrics);
      setResult(r);
      setChartType(r.chartType);
      setFeedback(null);
      const id = `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setLogId(id);
      appendQueryLog({
        id,
        userId: currentUser?.id,
        userName: currentUser?.name,
        question: q,
        rewrittenQuestion: r.rewrittenQuestion,
        scopeType: scope.type,
        scopeName: scope.name,
        datasetId: scope.datasetId,
        datasetName: scope.datasetId ? datasets.find((d) => d.id === scope.datasetId)?.datasetName : undefined,
        hitTerms: r.hitTerms.map((t) => t.term),
        reasoning: r.reasoning,
        sql: r.sql,
        chartType: r.chartType,
        chartTypeName: r.chartTypeName,
        resultSummary: r.summary,
        hitSemantic: r.hitSemantic,
        feedback: null,
        responseTimeMs: Date.now() - start,
        createdAt: Date.now(),
      });
      setHistory(getQueryLogs().slice(0, 8));
      setLoading(false);
    }, 700 + Math.random() * 500);
  };

  return (
    <div style={{ display: 'flex', gap: 16, height: '100%' }}>
      {/* 左：作用域 + 历史 */}
      <div style={{ width: 248, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={panelStyle}>
          <div style={panelTitleStyle}>问数作用域</div>
          <div className="dae-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', maxHeight: 360, paddingRight: 2 }}>
            {scopeGroups.map((group) => (
              <div key={group.type}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', padding: '0 2px 4px', letterSpacing: 1 }}>
                  {group.label}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {group.items.map((s) => {
                    const Icon = SCOPE_ICONS[s.type];
                    const active = s.id === scopeId;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setScopeId(s.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '9px 10px',
                          borderRadius: 8,
                          border: active ? '1px solid #1677FF' : '1px solid #e2e8f0',
                          background: active ? '#eff6ff' : '#fff',
                          color: active ? '#075985' : '#334155',
                          fontSize: 13,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <Icon size={15} style={{ color: active ? '#1677FF' : '#94a3b8', flexShrink: 0 }} />
                        <div style={{ lineHeight: 1.25 }}>
                          <div style={{ fontWeight: 500 }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>
                            {s.type === 'dataset' ? '数据集问数' : '智能解读'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...panelStyle, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={panelTitleStyle}>
            <History size={14} /> 最近问数
          </div>
          <div className="dae-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {history.length === 0 ? (
              <div style={{ fontSize: 12, color: '#94a3b8', padding: 8 }}>暂无记录</div>
            ) : (
              history.map((h) => (
                <button
                  key={h.id}
                  onClick={() => run(h.question)}
                  style={{
                    textAlign: 'left',
                    border: '1px solid #eef2f7',
                    background: '#f8fafc',
                    borderRadius: 8,
                    padding: '7px 9px',
                    fontSize: 12,
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.question}</div>
                  <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 2 }}>
                    {h.scopeName} · {h.chartTypeName}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 右：对话区 */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ ...panelStyle, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {/* 头部 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#1677FF,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Sparkles size={18} />
            </div>
            <div style={{ flex: 1, lineHeight: 1.25 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>智能问数</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                当前作用域：{scope?.name} · {isQuery ? '基于数据集 NL2SQL 取数' : '智能解读资产核心指标'}
              </div>
            </div>
          </div>

          {/* 内容 */}
          <div className="dae-scroll" style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {!result && !loading && (
              <div style={{ margin: 'auto', textAlign: 'center', color: '#94a3b8', maxWidth: 420 }}>
                <Sparkles size={40} style={{ opacity: 0.5, marginBottom: 12 }} />
                <div style={{ fontSize: 15, color: '#475569', fontWeight: 500 }}>用自然语言问数</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>例如「最近 7 天的 GMV 趋势」「各地区的销量占比」</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 16 }}>
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => run(s)} style={chipStyle}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div style={{ margin: 'auto', display: 'flex', alignItems: 'center', gap: 10, color: '#64748b' }}>
                <Sparkles size={18} /> 正在分析并生成图表…
              </div>
            )}

            {result && (
              <QueryResultView
                result={result}
                chartType={chartType}
                onChartTypeChange={setChartType}
                onFeedback={(f) => {
                  setFeedback(f);
                  if (logId) {
                    // 简易反馈同步（原型：直接更新日志）
                    import('../data/semanticLayer').then((m) => {
                      const logs = m.getQueryLogs();
                      m.saveQueryLogs(logs.map((l) => (l.id === logId ? { ...l, feedback: f } : l)));
                    });
                  }
                }}
                feedback={feedback}
              />
            )}
          </div>

          {/* 输入 */}
          <div style={{ borderTop: '1px solid #e2e8f0', padding: 12, display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  run();
                }
              }}
              placeholder={isQuery ? '描述你想查的数据，例如：各地区的销量占比' : '描述你想解读的资产，例如：帮我把这个仪表盘解读一下'}
              rows={1}
              style={{
                flex: 1,
                resize: 'none',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '10px 12px',
                fontSize: 13.5,
                lineHeight: 1.5,
                fontFamily: 'inherit',
                outline: 'none',
                maxHeight: 120,
              }}
            />
            <button
              onClick={() => run()}
              disabled={!input.trim() || loading}
              style={{
                height: 40,
                padding: '0 18px',
                borderRadius: 10,
                border: 'none',
                background: input.trim() && !loading ? 'linear-gradient(135deg,#1677FF,#0ea5e9)' : '#cbd5e1',
                color: '#fff',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                fontSize: 13,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Send size={16} /> 问数
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: 12,
  boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
};

const panelTitleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 13,
  fontWeight: 600,
  color: '#0f172a',
  marginBottom: 10,
};

const chipStyle: React.CSSProperties = {
  border: '1px solid #bfdbfe',
  background: '#fff',
  borderRadius: 999,
  padding: '7px 13px',
  fontSize: 12.5,
  color: '#1677FF',
  cursor: 'pointer',
  fontWeight: 500,
};
