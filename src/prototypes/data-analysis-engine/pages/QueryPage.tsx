/**
 * 智能问数 · 独立页面（与 AI 助手内「问数助手」能力同源）
 * - 左侧：最近问数历史记录
 * - 顶部：当前作用域选择器（数据集 / 报表 / 仪表盘 / 数据大屏）
 * - 输入区：快捷推荐问题 + 自然语言输入
 * - 结果：推理过程 + SQL + 图表 + 结论
 * - 问数记录写入语义层日志，供管理员评估迭代
 *
 * 交互参考：阿里 Quick BI 智能小Q
 * - 左侧只放历史/最近问数
 * - 作用域放在聊天框上方随时切换
 * - 推荐问题放在输入框上方
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Sparkles,
  Send,
  Database,
  FileText,
  Gauge,
  Monitor,
  History,
  Search,
  ChevronDown,
  X,
  Check,
  Eye,
  EyeOff,
  Table2,
} from 'lucide-react';
import { SchemaPanel } from '../components/SchemaPanel';
import {
  getDatasets,
  getScopes,
  getTerms,
  getMetrics,
  getQueryLogs,
  appendQueryLog,
  groupScopes,
  getScopeQueryability,
  getScopeDatasetDependencies,
  queryabilityLabel,
  queryabilityColor,
  trainingStatusLabel,
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

const TYPE_LABELS: Record<QueryScope['type'], string> = {
  dataset: '数据集',
  report: '报表',
  dashboard: '仪表盘',
  'data-screen': '数据大屏',
};

export default function QueryPage() {
  const { currentUser } = useAuth();
  const scopes = getScopes();
  const datasets = getDatasets();
  const terms = getTerms();
  const metrics = getMetrics();

  const [scopeId, setScopeId] = useState<string>(() => {
    // 默认选中第一个可问数资产
    const firstQueryable = scopes.find((s) => getScopeQueryability(s) !== 'unqueryable');
    return firstQueryable?.id || scopes[0]?.id || '';
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [chartType, setChartType] = useState<QueryChartType>('bar');
  const [logId, setLogId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [history, setHistory] = useState(() => getQueryLogs().slice(0, 20));
  const [historySearch, setHistorySearch] = useState('');
  const [schemaOpen, setSchemaOpen] = useState(false);

  const scope = useMemo(() => scopes.find((s) => s.id === scopeId) || scopes[0], [scopes, scopeId]);
  const isQuery = scope?.type === 'dataset';

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
      setHistory(getQueryLogs().slice(0, 20));
      setLoading(false);
    }, 700 + Math.random() * 500);
  };

  const filteredHistory = useMemo(() => {
    const text = historySearch.trim().toLowerCase();
    if (!text) return history;
    return history.filter((h) => h.question.toLowerCase().includes(text));
  }, [history, historySearch]);

  return (
    <div style={{ display: 'flex', gap: 16, height: '100%' }}>
      {/* 左：最近问数 */}
      <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ ...panelStyle, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={panelTitleStyle}>
            <History size={14} /> 最近问数
          </div>
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            <input
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="搜索历史问题"
              style={{
                width: '100%',
                padding: '7px 10px 7px 28px',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 12.5,
                color: '#334155',
                outline: 'none',
              }}
            />
          </div>
          <div className="dae-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filteredHistory.length === 0 ? (
              <div style={{ fontSize: 12, color: '#94a3b8', padding: 12, textAlign: 'center' }}>
                {historySearch ? '没有匹配的历史问题' : '暂无问数记录'}
              </div>
            ) : (
              filteredHistory.map((h) => (
                <button
                  key={h.id}
                  onClick={() => run(h.question)}
                  style={{
                    textAlign: 'left',
                    border: '1px solid #eef2f7',
                    background: '#f8fafc',
                    borderRadius: 8,
                    padding: '8px 10px',
                    fontSize: 12.5,
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.question}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
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
          {/* 头部：当前作用域选择器 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#1677FF,#0ea5e9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Sparkles size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>智能问数</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>选择资产后用自然语言取数或解读</div>
            </div>
            <ScopeSelector
              value={scopeId}
              onChange={setScopeId}
              scopes={scopes}
              onViewSchema={(s) => {
                setScopeId(s.id);
                setSchemaOpen(true);
              }}
            />
          </div>

          {/* 当前作用域提示条 */}
          {scope && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                padding: '8px 16px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                fontSize: 12,
                color: '#475569',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CurrentScopeTag scope={scope} />
                <span style={{ color: '#94a3b8' }}>|</span>
                <span>
                  {isQuery ? '基于数据集 NL2SQL 取数' : '智能解读资产核心指标与组件'}
                </span>
              </div>
              <button
                onClick={() => setSchemaOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 10px',
                  borderRadius: 6,
                  border: '1px solid #bfdbfe',
                  background: '#fff',
                  color: '#1677FF',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                <Table2 size={13} />
                查看数据详情
              </button>
            </div>
          )}

          {/* 内容 */}
          <div className="dae-scroll" style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {!result && !loading && (
              <div style={{ margin: 'auto', textAlign: 'center', color: '#94a3b8', maxWidth: 520 }}>
                <Sparkles size={40} style={{ opacity: 0.5, marginBottom: 12 }} />
                <div style={{ fontSize: 16, color: '#475569', fontWeight: 500 }}>用自然语言问数</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>例如「最近 7 天的 GMV 趋势」「各地区的销量占比」</div>
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

          {/* 输入区 */}
          <div style={{ borderTop: '1px solid #e2e8f0', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* 快捷推荐问题 */}
            {!loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: '#64748b', flexShrink: 0 }}>猜你想问：</span>
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => run(s)} style={chipStyle}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* 输入框 */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
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

      <SchemaPanel scope={scope} open={schemaOpen} onClose={() => setSchemaOpen(false)} />
    </div>
  );
}

/** 当前作用域小标签 */
function CurrentScopeTag({ scope }: { scope: QueryScope }) {
  const Icon = SCOPE_ICONS[scope.type];
  const q = getScopeQueryability(scope);
  const qColor = queryabilityColor(q);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 9px',
        borderRadius: 999,
        background: '#fff',
        border: '1px solid #e2e8f0',
        fontSize: 12,
        color: '#334155',
      }}
    >
      <Icon size={13} style={{ color: '#64748b' }} />
      {scope.name}
      {q !== 'na' && (
        <span
          style={{
            marginLeft: 3,
            fontSize: 10,
            padding: '0 5px',
            borderRadius: 999,
            background: qColor.bg,
            color: qColor.color,
            border: `1px solid ${qColor.border}`,
          }}
        >
          {queryabilityLabel(q)}
        </span>
      )}
    </span>
  );
}

/** 作用域选择器（顶部）
 *  点击后弹出选择面板，默认只展示可问数资产，支持搜索
 */
function ScopeSelector({
  value,
  onChange,
  scopes,
  onViewSchema,
}: {
  value: string;
  onChange: (id: string) => void;
  scopes: QueryScope[];
  onViewSchema?: (scope: QueryScope) => void;
}) {
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showAll, setShowAll] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const scopeGroups = useMemo(() => groupScopes(scopes), [scopes]);

  const filteredGroups = useMemo(() => {
    const text = searchText.trim().toLowerCase();
    return scopeGroups
      .map((g) => ({
        ...g,
        items: g.items.filter((s) => {
          const q = getScopeQueryability(s);
          const matchesText = !text || s.name.toLowerCase().includes(text);
          const matchesQueryable = showAll || q === 'queryable' || q === 'partial';
          return matchesText && matchesQueryable;
        }),
      }))
      .filter((g) => g.items.length > 0);
  }, [scopeGroups, searchText, showAll]);

  const selectedScope = useMemo(() => scopes.find((s) => s.id === value), [scopes, value]);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(target) && buttonRef.current && !buttonRef.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '7px 12px',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          background: '#fff',
          color: '#334155',
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        {selectedScope ? (
          <>
            {(() => {
              const Icon = SCOPE_ICONS[selectedScope.type];
              return <Icon size={14} style={{ color: '#1677FF' }} />;
            })()}
            <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedScope.name}
            </span>
          </>
        ) : (
          <span style={{ color: '#94a3b8' }}>选择资产</span>
        )}
        <ChevronDown size={14} style={{ color: '#94a3b8', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {open && (
        <div
          ref={panelRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 380,
            maxHeight: 520,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* 面板头部 */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>选择问数资产</span>
            <button
              onClick={() => setOpen(false)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2, border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* 搜索 + 过滤 */}
          <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8, borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              <input
                autoFocus
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="搜索资产名称"
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 28px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 12.5,
                  color: '#334155',
                  outline: 'none',
                }}
              />
            </div>
            <button
              onClick={() => setShowAll((v) => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                padding: '5px 8px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                color: '#475569',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {showAll ? <EyeOff size={13} /> : <Eye size={13} />}
                {showAll ? '已显示全部（含不可问数）' : '仅展示可问数资产'}
              </span>
              <span style={{ color: '#94a3b8', fontSize: 11 }}>
                {filteredGroups.reduce((sum, g) => sum + g.items.length, 0)} / {scopes.length}
              </span>
            </button>
          </div>

          {/* 分组列表 */}
          <div className="dae-scroll" style={{ flex: 1, overflowY: 'auto', padding: '10px 14px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredGroups.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
                没有匹配的可问数资产
              </div>
            )}
            {filteredGroups.map((group) => (
              <div key={group.type}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', padding: '0 2px 6px', letterSpacing: 1 }}>
                  {group.label}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {group.items.map((s) => (
                    <ScopeOption
                      key={s.id}
                      scope={s}
                      selected={s.id === value}
                      onSelect={() => {
                        onChange(s.id);
                        setOpen(false);
                      }}
                      onViewSchema={onViewSchema ? () => {
                        setOpen(false);
                        onViewSchema(s);
                      } : undefined}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** 选择面板中的单个资产选项 */
function ScopeOption({
  scope,
  selected,
  onSelect,
  onViewSchema,
}: {
  scope: QueryScope;
  selected: boolean;
  onSelect: () => void;
  onViewSchema?: () => void;
}) {
  const Icon = SCOPE_ICONS[scope.type];
  const q = getScopeQueryability(scope);
  const qColor = queryabilityColor(q);
  const disabled = q === 'unqueryable';
  const deps = getScopeDatasetDependencies(scope);

  return (
    <div
      title={disabled ? '依赖数据集未训练，无法问数' : `点击选择该${TYPE_LABELS[scope.type]}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 9px',
        borderRadius: 8,
        border: selected ? '1px solid #1677FF' : '1px solid #e2e8f0',
        background: selected ? '#eff6ff' : disabled ? '#f8fafc' : '#fff',
        opacity: disabled ? 0.65 : 1,
      }}
    >
      <button
        onClick={disabled ? undefined : onSelect}
        disabled={disabled}
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          border: 'none',
          background: 'transparent',
          padding: 0,
          cursor: disabled ? 'not-allowed' : 'pointer',
          textAlign: 'left',
          color: selected ? '#075985' : disabled ? '#94a3b8' : '#334155',
          fontSize: 13,
        }}
      >
        <Icon size={15} style={{ color: selected ? '#1677FF' : disabled ? '#cbd5e1' : '#94a3b8', flexShrink: 0 }} />
        <div style={{ lineHeight: 1.25, flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scope.name}</span>
            {q !== 'na' && (
              <span
                style={{
                  fontSize: 10,
                  padding: '1px 5px',
                  borderRadius: 999,
                  background: qColor.bg,
                  color: qColor.color,
                  border: `1px solid ${qColor.border}`,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {queryabilityLabel(q)}
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: disabled ? '#cbd5e1' : '#94a3b8', marginTop: 2 }}>
            {scope.type === 'dataset' ? '数据集问数' : `依赖 ${deps.length} 个数据集 · 智能解读`}
          </div>
        </div>
        {selected && <Check size={14} style={{ color: '#1677FF', flexShrink: 0 }} />}
      </button>
      {onViewSchema && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewSchema();
          }}
          title="查看数据详情"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 26,
            height: 26,
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            background: '#fff',
            color: '#64748b',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <Table2 size={13} />
        </button>
      )}
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
  padding: '6px 12px',
  fontSize: 12,
  color: '#1677FF',
  cursor: 'pointer',
  fontWeight: 500,
};
