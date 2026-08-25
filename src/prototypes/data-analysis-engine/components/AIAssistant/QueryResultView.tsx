/**
 * 问数结果可视化组件（纯 SVG，无第三方图表库依赖）
 * - 推理过程 / SQL / 图表 / 文字结论
 * - 支持回答后手动切换图表类型
 */

import React, { useMemo } from 'react';
import { BarChart3, LineChart, PieChart, Hash, ScatterChart, Table2, FileText, Search } from 'lucide-react';
import type { QueryResult } from './queryEngine';
import type { LinkedComponent, QueryChartType } from '../../data/semanticLayer';

const PALETTE = ['#1677FF', '#22c55e', '#f59e0b', '#a855f7', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

const CHART_OPTIONS: { type: QueryChartType; label: string; icon: React.ElementType }[] = [
  { type: 'line', label: '折线', icon: LineChart },
  { type: 'bar', label: '柱状', icon: BarChart3 },
  { type: 'pie', label: '饼图', icon: PieChart },
  { type: 'metric', label: '指标卡', icon: Hash },
  { type: 'scatter', label: '散点', icon: ScatterChart },
  { type: 'table', label: '明细', icon: Table2 },
];

/** 为联动组件生成 mock 数据 */
function buildComponentData(component: LinkedComponent): { dim: string; value: number }[] {
  const name = component.name;
  const isTrend = /趋势|走势|曲线|变化|波动|趋势图|实时/.test(name);
  const isRatio = /占比|分布|结构|比例|份额/.test(name);
  const isRank = /排行|排名|Top|TOP/.test(name);

  if (isTrend) {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月'];
    const base = 5000 + Math.abs(name.length * 317) % 8000;
    return months.map((m, i) => ({ dim: m, value: Math.round(base * (0.8 + i * 0.08 + Math.random() * 0.15)) }));
  }
  if (isRatio || isRank) {
    const cats = ['数码', '家居', '服饰', '食品', '美妆'];
    return cats.map((c, i) => ({ dim: c, value: Math.round(1200 + Math.abs(name.length * 53 + i * 237) % 4800) }));
  }
  // 默认分类数据
  return ['A类', 'B类', 'C类', 'D类'].map((c, i) => ({ dim: c, value: Math.round(800 + Math.abs(name.length * 71 + i * 199) % 3200) }));
}

/** 把资产组件类型映射为可渲染图表类型 */
function mapComponentType(type: string): QueryChartType | 'metric' | 'placeholder' {
  switch (type) {
    case 'line':
    case 'area':
      return 'line';
    case 'bar':
      return 'bar';
    case 'pie':
      return 'pie';
    case 'table':
      return 'table';
    case 'card':
      return 'metric';
    default:
      return 'placeholder';
  }
}

function componentTypeLabel(t: string): string {
  const map: Record<string, string> = {
    line: '折线图',
    bar: '柱状图',
    pie: '饼图',
    area: '面积图',
    table: '明细表',
    card: '指标卡',
    text: '文本',
    image: '图片',
    query: '查询',
    richText: '富文本',
    media: '媒体',
    tab: '标签页',
    insight: '洞察',
    reuse: '复用组件',
  };
  return map[t] || t;
}

function componentIcon(t: string): React.ElementType {
  const map: Record<string, React.ElementType> = {
    line: LineChart,
    bar: BarChart3,
    pie: PieChart,
    area: LineChart,
    table: Table2,
    card: Hash,
    text: FileText,
    image: FileText,
    query: Search,
    richText: FileText,
    media: FileText,
    tab: FileText,
    insight: FileText,
    reuse: FileText,
  };
  return map[t] || FileText;
}

function MetricCardView({ name, value }: { name: string; value: number }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12 }}>
      <div style={{ fontSize: 32, fontWeight: 700, color: '#0f172a' }}>{value.toLocaleString()}</div>
      <div style={{ fontSize: 12, color: '#64748b', textAlign: 'center' }}>{name}</div>
    </div>
  );
}

function LinkedComponentView({ component }: { component: LinkedComponent }) {
  const data = useMemo(() => buildComponentData(component), [component]);
  const chartType = mapComponentType(component.type);
  const Icon = componentIcon(component.type);

  if (chartType === 'metric') {
    return (
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
        <MetricCardView name={component.name} value={data[0]?.value ?? Math.round(10000 + Math.random() * 90000)} />
      </div>
    );
  }

  if (chartType === 'placeholder') {
    return (
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#f8fafc', padding: '16px 12px', display: 'flex', alignItems: 'center', gap: 10, minHeight: 120 }}>
        <Icon size={18} style={{ color: '#94a3b8', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 500 }}>{component.name}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>{componentTypeLabel(component.type)} · 非图表组件</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{component.name}</div>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>{componentTypeLabel(component.type)}</span>
      </div>
      <div style={{ padding: 8 }}>
        {chartType === 'table' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                <th style={thStyle}>维度</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>数值</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={i}>
                  <td style={tdStyle}>{d.dim}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{d.value.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <QueryChart chartType={chartType} data={data} />
        )}
      </div>
    </div>
  );
}

export function QueryChart({ chartType, data }: { chartType: QueryChartType; data: { dim: string; value: number }[] }) {
  const W = 520;
  const H = 220;
  if (chartType === 'metric') {
    const v = data.length ? data.reduce((s, d) => s + d.value, 0) : 0;
    return (
      <div style={{ height: H, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <div style={{ fontSize: 40, fontWeight: 700, color: '#0f172a' }}>{v.toLocaleString()}</div>
        <div style={{ fontSize: 13, color: '#64748b' }}>指标值</div>
      </div>
    );
  }
  if (data.length === 0) {
    return <div style={{ height: H, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13 }}>暂无数据</div>;
  }
  if (chartType === 'line') return <LineChartView data={data} W={W} H={H} />;
  if (chartType === 'bar') return <BarChartView data={data} W={W} H={H} />;
  if (chartType === 'pie') return <PieChartView data={data} W={W} H={H} />;
  if (chartType === 'scatter') return <ScatterView data={data} W={W} H={H} />;
  return <BarChartView data={data} W={W} H={H} />;
}

function LineChartView({ data, W, H }: { data: { dim: string; value: number }[]; W: number; H: number }) {
  const max = Math.max(...data.map((d) => d.value)) * 1.1 || 1;
  const pad = 36;
  const iw = W - pad * 2;
  const ih = H - pad * 2;
  const pts = data.map((d, i) => {
    const x = pad + (iw * i) / Math.max(1, data.length - 1);
    const y = pad + ih - (d.value / max) * ih;
    return { x, y, d };
  });
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${path} L${pts[pts.length - 1].x.toFixed(1)},${pad + ih} L${pts[0].x.toFixed(1)},${pad + ih} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }}>
      <defs>
        <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1677FF" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#1677FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((t) => (
        <line key={t} x1={pad} x2={W - pad} y1={pad + ih * t} y2={pad + ih * t} stroke="#eef2f7" />
      ))}
      <path d={area} fill="url(#lineFill)" />
      <path d={path} fill="none" stroke="#1677FF" strokeWidth={2} />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#1677FF" />
      ))}
      {pts.map((p, i) => (
        <text key={i} x={p.x} y={H - 12} fontSize={10} fill="#94a3b8" textAnchor="middle">
          {p.d.dim}
        </text>
      ))}
    </svg>
  );
}

function BarChartView({ data, W, H }: { data: { dim: string; value: number }[]; W: number; H: number }) {
  const max = Math.max(...data.map((d) => d.value)) * 1.1 || 1;
  const pad = 36;
  const iw = W - pad * 2;
  const ih = H - pad * 2;
  const bw = (iw / data.length) * 0.6;
  const gap = iw / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }}>
      {[0, 0.5, 1].map((t) => (
        <line key={t} x1={pad} x2={W - pad} y1={pad + ih * t} y2={pad + ih * t} stroke="#eef2f7" />
      ))}
      {data.map((d, i) => {
        const h = (d.value / max) * ih;
        const x = pad + gap * i + (gap - bw) / 2;
        const y = pad + ih - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={h} rx={4} fill={PALETTE[i % PALETTE.length]} />
            <text x={x + bw / 2} y={y - 5} fontSize={10} fill="#475569" textAnchor="middle">
              {d.value > 999 ? `${(d.value / 1000).toFixed(1)}k` : d.value}
            </text>
            <text x={x + bw / 2} y={H - 12} fontSize={10} fill="#94a3b8" textAnchor="middle">
              {d.dim.length > 5 ? d.dim.slice(0, 5) : d.dim}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function PieChartView({ data, W, H }: { data: { dim: string; value: number }[]; W: number; H: number }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx = W / 2;
  const cy = H / 2;
  const r = 80;
  let acc = 0;
  const slices = data.map((d, i) => {
    const start = (acc / total) * Math.PI * 2 - Math.PI / 2;
    acc += d.value;
    const end = (acc / total) * Math.PI * 2 - Math.PI / 2;
    const large = end - start > Math.PI ? 1 : 0;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    return { d, i, path: `M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${large} 1 ${x2.toFixed(1)},${y2.toFixed(1)} Z` };
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }}>
      {slices.map((s) => (
        <path key={s.i} d={s.path} fill={PALETTE[s.i % PALETTE.length]} />
      ))}
      {slices.map((s, i) => {
        const pct = ((s.d.value / total) * 100).toFixed(1);
        return (
          <g key={i}>
            <rect x={W - 130} y={20 + i * 22} width={12} height={12} rx={3} fill={PALETTE[i % PALETTE.length]} />
            <text x={W - 113} y={30 + i * 22} fontSize={11} fill="#475569">
              {s.d.dim} {pct}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ScatterView({ data, W, H }: { data: { dim: string; value: number }[]; W: number; H: number }) {
  const maxY = Math.max(...data.map((d) => d.value)) * 1.1 || 1;
  const pad = 36;
  const iw = W - pad * 2;
  const ih = H - pad * 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }}>
      {[0, 0.5, 1].map((t) => (
        <line key={t} x1={pad} x2={W - pad} y1={pad + ih * t} y2={pad + ih * t} stroke="#eef2f7" />
      ))}
      {data.map((d, i) => {
        const x = pad + (iw * i) / Math.max(1, data.length - 1);
        const y = pad + ih - (d.value / maxY) * ih;
        return <circle key={i} cx={x} cy={y} r={5} fill="#1677FF" fillOpacity={0.7} />;
      })}
    </svg>
  );
}

export function QueryResultView({
  result,
  chartType,
  onChartTypeChange,
  onFeedback,
  feedback,
}: {
  result: QueryResult;
  chartType: QueryChartType;
  onChartTypeChange?: (t: QueryChartType) => void;
  onFeedback?: (f: 'up' | 'down') => void;
  feedback?: 'up' | 'down' | null;
}) {
  const showData = chartType !== 'table' ? result.data : [];
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      {/* 推理过程 */}
      <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>推理过程</div>
      <div style={{ fontSize: 12.5, lineHeight: 1.6, color: '#475569', background: '#f8fafc', borderRadius: 8, padding: '8px 10px', border: '1px solid #eef2f7' }}>
        {result.reasoning}
        {result.hitTerms.length > 0 && (
          <span style={{ marginLeft: 6, color: '#1677FF' }}>（已应用语义层：{result.hitTerms.map((t) => t.term).join('、')}）</span>
        )}
      </div>

      {/* SQL */}
      <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', margin: '12px 0 6px' }}>生成 SQL</div>
      <pre
        style={{
          margin: 0,
          fontSize: 12,
          lineHeight: 1.55,
          background: '#0f172a',
          color: '#d1fae5',
          borderRadius: 8,
          padding: '10px 12px',
          overflowX: 'auto',
          whiteSpace: 'pre-wrap',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        }}
      >
        {result.sql}
      </pre>

      {/* 解读模式：仪表盘/数据大屏联动渲染真实图表组件；报表只给结论，不展示任何图表区块 */}
      {result.isInterpretation ? (
        result.scopeType !== 'report' ? (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>
              实际图表组件
              <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 400, color: '#94a3b8' }}>（{result.linkedComponents?.length ?? 0} 个，来自系统已配置）</span>
            </div>
            {result.linkedComponents && result.linkedComponents.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                {result.linkedComponents.map((c) => (
                  <LinkedComponentView key={c.id} component={c} />
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 12.5, color: '#94a3b8', background: '#f8fafc', border: '1px solid #eef2f7', borderRadius: 8, padding: '10px 12px' }}>
                该资产暂未关联图表组件。
              </div>
            )}
          </div>
        ) : null
      ) : (
        <>
          {/* 图表 + 手动切换 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '14px 0 8px' }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a' }}>
              可视化结果
              <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 400, color: '#94a3b8' }}>（{result.chartTypeName}）</span>
            </div>
            {onChartTypeChange && (
              <div style={{ display: 'flex', gap: 4 }}>
                {CHART_OPTIONS.map((o) => {
                  const Icon = o.icon;
                  const active = o.type === chartType;
                  return (
                    <button
                      key={o.type}
                      onClick={() => onChartTypeChange(o.type)}
                      title={`切换为${o.label}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        border: active ? '1px solid #1677FF' : '1px solid #e2e8f0',
                        background: active ? '#eff6ff' : '#fff',
                        color: active ? '#1677FF' : '#64748b',
                        borderRadius: 6,
                        padding: '4px 7px',
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      <Icon size={12} />
                      {o.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div style={{ border: '1px solid #eef2f7', borderRadius: 8, padding: 8 }}>
            {chartType === 'table' ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={thStyle}>维度</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>数值</th>
                  </tr>
                </thead>
                <tbody>
                  {result.data.map((d, i) => (
                    <tr key={i}>
                      <td style={tdStyle}>{d.dim}</td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>{d.value.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <QueryChart chartType={chartType} data={showData} />
            )}
          </div>
        </>
      )}

      {/* 结论 */}
      <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', margin: '12px 0 6px' }}>分析结论</div>
      <div style={{ fontSize: 13, lineHeight: 1.6, color: '#334155' }}>{result.summary}</div>

      {/* 反馈 */}
      {onFeedback && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>结果准确吗？</span>
          <button onClick={() => onFeedback('up')} style={fbStyle(feedback === 'up')}>
            👍 准确
          </button>
          <button onClick={() => onFeedback('down')} style={fbStyle(feedback === 'down')}>
            👎 不准
          </button>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = { textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600 };
const tdStyle: React.CSSProperties = { padding: '6px 8px', borderBottom: '1px solid #f1f5f9', color: '#334155' };

function fbStyle(active: boolean): React.CSSProperties {
  return {
    border: '1px solid var(--dae-border)',
    background: active ? 'var(--dae-primary-light)' : '#fff',
    color: active ? 'var(--dae-primary)' : '#64748b',
    borderRadius: '999px',
    padding: '4px 10px',
    fontSize: 12,
    cursor: 'pointer',
  };
}
