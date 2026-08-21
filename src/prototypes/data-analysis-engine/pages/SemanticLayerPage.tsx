/**
 * 语义层 / 行业黑话 管理页（AI 中心 → 语义层）
 * - 行业黑话 / 同义词词典（提升问数准确率的关键）
 * - 指标口径定义（消除口径歧义）
 * - 示例问数（few-shot 提升 NL2SQL 准确率）
 * - 数据集字段语义层（手动维护 / 导入字段业务含义）
 */

import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Tags,
  Ruler,
  Lightbulb,
  Table2,
  Download,
} from 'lucide-react';
import {
  getTerms,
  saveTerms,
  getMetrics,
  saveMetrics,
  getExamples,
  saveExamples,
  getDatasets,
  saveDatasets,
  syncDatasetFromSource,
  type Aggregation,
  type DatasetSchema,
  type ExampleQuery,
  type MetricDefinition,
  type TerminologyItem,
} from '../data/semanticLayer';
import { useAuth } from '../contexts/AuthContext';

type SubTab = 'terms' | 'metrics' | 'examples' | 'datasets';

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '9px 12px',
  border: '1px solid var(--dae-border)',
  borderRadius: 8,
  fontSize: 13,
  outline: 'none',
  fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 600,
  color: 'var(--dae-ink-secondary)',
  marginBottom: 5,
  display: 'block',
};

const SUB_TABS: { id: SubTab; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'terms', label: '行业黑话', icon: Tags, desc: '口语/黑话 → 标准术语的同义词映射' },
  { id: 'metrics', label: '指标口径', icon: Ruler, desc: '定义指标的计算口径与聚合方式' },
  { id: 'examples', label: '示例问数', icon: Lightbulb, desc: '标准问题 → 期望 SQL（few-shot）' },
  { id: 'datasets', label: '数据集字段', icon: Table2, desc: '维护数据集字段的业务含义' },
];

const AGG_OPTIONS: { value: Aggregation; label: string }[] = [
  { value: 'sum', label: '求和 sum' },
  { value: 'avg', label: '平均 avg' },
  { value: 'count', label: '计数 count' },
  { value: 'count_distinct', label: '去重计数 count_distinct' },
  { value: 'max', label: '最大 max' },
  { value: 'min', label: '最小 min' },
];

export default function SemanticLayerPage() {
  const { currentUser } = useAuth();
  const [sub, setSub] = useState<SubTab>('terms');
  const [terms, setTerms] = useState<TerminologyItem[]>(() => getTerms());
  const [metrics, setMetrics] = useState<MetricDefinition[]>(() => getMetrics());
  const [examples, setExamples] = useState<ExampleQuery[]>(() => getExamples());
  const [datasets, setDatasets] = useState<DatasetSchema[]>(() => getDatasets());

  const [drawer, setDrawer] = useState<null | { kind: SubTab; item: any }>(null);
  const [toast, setToast] = useState('');

  if (!currentUser?.isSuperAdmin) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--dae-ink-muted)' }}>
        <Layers size={36} style={{ opacity: 0.5 }} />
        <div style={{ marginTop: 12, fontSize: 15, fontWeight: 600, color: 'var(--dae-ink)' }}>无访问权限</div>
        <div style={{ fontSize: 13, marginTop: 6 }}>语义层管理仅对超级管理员开放。</div>
      </div>
    );
  }

  const showToast = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(''), 2200);
  };

  const openNew = (kind: SubTab) => {
    if (kind === 'terms') setDrawer({ kind, item: { id: '', term: '', standard: '', field: '', description: '' } });
    if (kind === 'metrics') setDrawer({ kind, item: { id: '', name: '', expression: '', unit: '', aggregation: 'sum', relatedDimension: '', description: '', status: 'enabled' } });
    if (kind === 'examples') setDrawer({ kind, item: { id: '', question: '', datasetId: datasets[0]?.id || '', datasetName: datasets[0]?.datasetName || '', sql: '', chartType: 'bar' } });
    if (kind === 'datasets') setDrawer({ kind, item: { id: '', datasetName: '', tableName: '', fields: [] as DatasetSchema['fields'], updatedAt: new Date().toISOString().slice(0, 10) } });
  };

  const openEdit = (kind: SubTab, item: Record<string, unknown>) => setDrawer({ kind, item: JSON.parse(JSON.stringify(item)) });

  const handleSave = () => {
    if (!drawer) return;
    const { kind, item } = drawer;
    if (kind === 'terms') {
      const arr = [...terms];
      const idx = arr.findIndex((t) => t.id === item.id);
      const next = { ...(item as unknown as TerminologyItem), id: item.id || `t-${Date.now()}` };
      if (idx >= 0) arr[idx] = next;
      else arr.unshift(next);
      setTerms(arr);
      saveTerms(arr);
    }
    if (kind === 'metrics') {
      const arr = [...metrics];
      const idx = arr.findIndex((m) => m.id === item.id);
      const next = { ...(item as unknown as MetricDefinition), id: item.id || `m-${Date.now()}` };
      if (idx >= 0) arr[idx] = next;
      else arr.unshift(next);
      setMetrics(arr);
      saveMetrics(arr);
    }
    if (kind === 'examples') {
      const arr = [...examples];
      const ex = item as unknown as ExampleQuery;
      const ds = datasets.find((d) => d.id === ex.datasetId);
      const next = { ...ex, id: ex.id || `e-${Date.now()}`, datasetName: ds?.datasetName || ex.datasetName };
      const idx = arr.findIndex((e) => e.id === next.id);
      if (idx >= 0) arr[idx] = next;
      else arr.unshift(next);
      setExamples(arr);
      saveExamples(arr);
    }
    if (kind === 'datasets') {
      const arr = [...datasets];
      const next = { ...(item as unknown as DatasetSchema), id: item.id || `ds-${Date.now()}` };
      const idx = arr.findIndex((d) => d.id === next.id);
      if (idx >= 0) arr[idx] = next;
      else arr.unshift(next);
      setDatasets(arr);
      saveDatasets(arr);
    }
    showToast('已保存');
    setDrawer(null);
  };

  const handleDelete = (kind: SubTab, id: string) => {
    if (kind === 'terms') { const a = terms.filter((t) => t.id !== id); setTerms(a); saveTerms(a); }
    if (kind === 'metrics') { const a = metrics.filter((m) => m.id !== id); setMetrics(a); saveMetrics(a); }
    if (kind === 'examples') { const a = examples.filter((e) => e.id !== id); setExamples(a); saveExamples(a); }
    if (kind === 'datasets') { const a = datasets.filter((d) => d.id !== id); setDatasets(a); saveDatasets(a); }
    showToast('已删除');
  };

  // 从数据源导入真实字段（覆盖为系统数据源真实列）
  const handleImportFields = () => {
    if (!drawer) return;
    const ds = drawer.item as unknown as DatasetSchema;
    const synced = syncDatasetFromSource(ds);
    setDrawer({ ...drawer, item: { ...drawer.item, fields: synced.fields, fieldSource: synced.fieldSource } });
    showToast(synced.fieldSource === 'real' ? '已从数据源导入真实字段' : '数据源暂未提供该表结构，已保留当前字段');
  };

  // 同步单个数据集字段为数据源真实列
  const handleSyncOne = (d: DatasetSchema) => {
    const synced = syncDatasetFromSource(d);
    const arr = datasets.map((x) => (x.id === d.id ? synced : x));
    setDatasets(arr);
    saveDatasets(arr);
    showToast(synced.fieldSource === 'real' ? `「${d.datasetName}」已同步真实字段` : '数据源暂未提供该表结构');
  };

  // 一键同步全部待完善（字段来源为推断的数据集）
  const handleSyncAll = () => {
    const arr = datasets.map((d) => syncDatasetFromSource(d));
    setDatasets(arr);
    saveDatasets(arr);
    const synced = arr.filter((d) => d.fieldSource === 'real').length;
    showToast(`已同步 ${synced} 个数据集的真实字段`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 头部 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#0ea5e9)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Layers size={20} />
        </div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--dae-ink)' }}>语义层 / 行业黑话</div>
          <div style={{ fontSize: 12.5, color: 'var(--dae-ink-muted)', marginTop: 2 }}>
            统一业务术语与字段口径，是智能问数准确率的关键（无语义层 ~60-70%，完整语义层 90%+）
          </div>
        </div>
      </div>

      {/* 子 Tab */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {SUB_TABS.map((t) => {
          const Icon = t.icon;
          const active = sub === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSub(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 14px',
                borderRadius: 10,
                border: active ? '1px solid #7c3aed' : '1px solid var(--dae-border)',
                background: active ? '#f5f3ff' : '#fff',
                color: active ? '#7c3aed' : 'var(--dae-ink-secondary)',
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* 内容 */}
      <div style={{ flex: 1, minHeight: 0, background: '#fff', border: '1px solid var(--dae-border)', borderRadius: 12, padding: 16, overflow: 'auto' }} className="dae-scroll">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: 'var(--dae-ink-muted)' }}>{SUB_TABS.find((t) => t.id === sub)?.desc}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {sub === 'datasets' && datasets.some((d) => d.fieldSource !== 'real') && (
              <button onClick={handleSyncAll} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', color: '#7c3aed', border: '1px solid #7c3aed', borderRadius: 8, padding: '8px 12px', fontSize: 13, cursor: 'pointer' }}>
                <Download size={14} /> 一键同步全部待完善
              </button>
            )}
            <button onClick={() => openNew(sub)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 13, cursor: 'pointer' }}>
              <Plus size={14} /> 新建
            </button>
          </div>
        </div>

        {sub === 'terms' && (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>行业黑话</th>
                <th style={thStyle}>标准术语</th>
                <th style={thStyle}>关联字段</th>
                <th style={thStyle}>说明</th>
                <th style={{ ...thStyle, width: 90 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {terms.map((t) => (
                <tr key={t.id}>
                  <td style={tdStyle}><b>{t.term}</b></td>
                  <td style={tdStyle}>{t.standard}</td>
                  <td style={tdStyle}>{t.field || '—'}</td>
                  <td style={{ ...tdStyle, color: 'var(--dae-ink-muted)' }}>{t.description}</td>
                  <td style={tdStyle}><RowActions onEdit={() => openEdit('terms', t as unknown as Record<string, unknown>)} onDelete={() => handleDelete('terms', t.id)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {sub === 'metrics' && (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>指标名称</th>
                <th style={thStyle}>口径</th>
                <th style={thStyle}>单位</th>
                <th style={thStyle}>聚合</th>
                <th style={thStyle}>状态</th>
                <th style={{ ...thStyle, width: 90 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => (
                <tr key={m.id}>
                  <td style={tdStyle}><b>{m.name}</b></td>
                  <td style={tdStyle}><code style={codeStyle}>{m.expression}</code></td>
                  <td style={tdStyle}>{m.unit}</td>
                  <td style={tdStyle}>{m.aggregation}</td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: m.status === 'enabled' ? '#dcfce7' : '#f1f5f9', color: m.status === 'enabled' ? '#16a34a' : '#94a3b8' }}>
                      {m.status === 'enabled' ? '已启用' : '草稿'}
                    </span>
                  </td>
                  <td style={tdStyle}><RowActions onEdit={() => openEdit('metrics', m as unknown as Record<string, unknown>)} onDelete={() => handleDelete('metrics', m.id)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {sub === 'examples' && (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>标准问题</th>
                <th style={thStyle}>数据集</th>
                <th style={thStyle}>图表</th>
                <th style={thStyle}>SQL</th>
                <th style={{ ...thStyle, width: 90 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {examples.map((e) => (
                <tr key={e.id}>
                  <td style={tdStyle}><b>{e.question}</b></td>
                  <td style={tdStyle}>{e.datasetName}</td>
                  <td style={tdStyle}>{e.chartType}</td>
                  <td style={{ ...tdStyle, maxWidth: 280 }}><code style={codeStyle}>{e.sql}</code></td>
                  <td style={tdStyle}><RowActions onEdit={() => openEdit('examples', e as unknown as Record<string, unknown>)} onDelete={() => handleDelete('examples', e.id)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {sub === 'datasets' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {datasets.map((d) => {
              const isReal = d.fieldSource === 'real';
              return (
              <div key={d.id} style={{ border: '1px solid var(--dae-border)', borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                    <b style={{ fontSize: 14, color: 'var(--dae-ink)' }}>{d.datasetName}</b>
                    <span style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>表：{d.tableName}</span>
                    <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 999, background: isReal ? '#ecfdf5' : '#fff7ed', color: isReal ? '#059669' : '#ea580c', border: `1px solid ${isReal ? '#a7f3d0' : '#fed7aa'}` }}>
                      {isReal ? '数据源已同步' : '待完善'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {!isReal && (
                      <button onClick={() => handleSyncOne(d)} style={{ ...ghostBtn, color: '#7c3aed' }}><Download size={13} /> 从数据源导入</button>
                    )}
                    <button onClick={() => openEdit('datasets', d as unknown as Record<string, unknown>)} style={ghostBtn}><Pencil size={13} /> 编辑字段</button>
                    <button onClick={() => handleDelete('datasets', d.id)} style={{ ...ghostBtn, color: '#dc2626' }}><Trash2 size={13} /> 删除</button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {d.fields.map((f) => (
                    <span key={f.name} style={{ fontSize: 11.5, padding: '3px 9px', borderRadius: 6, background: f.isMetric ? '#eff6ff' : '#f8fafc', border: '1px solid var(--dae-border)', color: f.isMetric ? '#1677FF' : 'var(--dae-ink-secondary)' }}>
                      {f.alias} <span style={{ color: 'var(--dae-ink-subtle)' }}>({f.name})</span> {f.isMetric ? `·${f.aggregation}` : '·维度'}
                    </span>
                  ))}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 编辑抽屉 */}
      {drawer && (
        <div style={drawerMaskStyle} onClick={() => setDrawer(null)}>
          <div style={drawerStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--dae-ink)' }}>
                编辑{SUB_TABS.find((t) => t.id === drawer.kind)?.label}
              </div>
              <button onClick={() => setDrawer(null)} style={iconBtn}><X size={16} /></button>
            </div>

            {drawer.kind === 'terms' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div><label style={labelStyle}>行业黑话 / 口语</label><input style={inputStyle} value={(drawer.item.term as string) || ''} onChange={(e) => setDrawer({ ...drawer, item: { ...drawer.item, term: e.target.value } })} /></div>
                <div><label style={labelStyle}>标准术语</label><input style={inputStyle} value={(drawer.item.standard as string) || ''} onChange={(e) => setDrawer({ ...drawer, item: { ...drawer.item, standard: e.target.value } })} /></div>
                <div><label style={labelStyle}>关联字段（可选）</label><input style={inputStyle} value={(drawer.item.field as string) || ''} onChange={(e) => setDrawer({ ...drawer, item: { ...drawer.item, field: e.target.value } })} /></div>
                <div><label style={labelStyle}>说明</label><textarea style={{ ...inputStyle, minHeight: 64 }} value={(drawer.item.description as string) || ''} onChange={(e) => setDrawer({ ...drawer, item: { ...drawer.item, description: e.target.value } })} /></div>
              </div>
            )}

            {drawer.kind === 'metrics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div><label style={labelStyle}>指标名称</label><input style={inputStyle} value={(drawer.item.name as string) || ''} onChange={(e) => setDrawer({ ...drawer, item: { ...drawer.item, name: e.target.value } })} /></div>
                <div><label style={labelStyle}>口径表达式</label><input style={inputStyle} value={(drawer.item.expression as string) || ''} onChange={(e) => setDrawer({ ...drawer, item: { ...drawer.item, expression: e.target.value } })} /></div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}><label style={labelStyle}>单位</label><input style={inputStyle} value={(drawer.item.unit as string) || ''} onChange={(e) => setDrawer({ ...drawer, item: { ...drawer.item, unit: e.target.value } })} /></div>
                  <div style={{ flex: 1 }}><label style={labelStyle}>聚合方式</label>
                    <select style={inputStyle} value={(drawer.item.aggregation as string) || 'sum'} onChange={(e) => setDrawer({ ...drawer, item: { ...drawer.item, aggregation: e.target.value } })}>
                      {AGG_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
                <div><label style={labelStyle}>业务说明</label><textarea style={{ ...inputStyle, minHeight: 56 }} value={(drawer.item.description as string) || ''} onChange={(e) => setDrawer({ ...drawer, item: { ...drawer.item, description: e.target.value } })} /></div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <input type="checkbox" checked={(drawer.item.status as string) === 'enabled'} onChange={(e) => setDrawer({ ...drawer, item: { ...drawer.item, status: e.target.checked ? 'enabled' : 'draft' } })} />
                  启用该指标口径
                </label>
              </div>
            )}

            {drawer.kind === 'examples' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div><label style={labelStyle}>标准问题</label><input style={inputStyle} value={(drawer.item.question as string) || ''} onChange={(e) => setDrawer({ ...drawer, item: { ...drawer.item, question: e.target.value } })} /></div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}><label style={labelStyle}>数据集</label>
                    <select style={inputStyle} value={(drawer.item.datasetId as string) || ''} onChange={(e) => setDrawer({ ...drawer, item: { ...drawer.item, datasetId: e.target.value } })}>
                      {datasets.map((d) => <option key={d.id} value={d.id}>{d.datasetName}</option>)}
                    </select>
                  </div>
                  <div style={{ width: 140 }}><label style={labelStyle}>推荐图表</label>
                    <select style={inputStyle} value={(drawer.item.chartType as string) || 'bar'} onChange={(e) => setDrawer({ ...drawer, item: { ...drawer.item, chartType: e.target.value } })}>
                      {['line', 'bar', 'pie', 'metric', 'scatter', 'table'].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div><label style={labelStyle}>期望 SQL</label><textarea style={{ ...inputStyle, minHeight: 90, fontFamily: 'ui-monospace, monospace', fontSize: 12 }} value={(drawer.item.sql as string) || ''} onChange={(e) => setDrawer({ ...drawer, item: { ...drawer.item, sql: e.target.value } })} /></div>
              </div>
            )}

            {drawer.kind === 'datasets' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}><label style={labelStyle}>数据集名称</label><input style={inputStyle} value={(drawer.item.datasetName as string) || ''} onChange={(e) => setDrawer({ ...drawer, item: { ...drawer.item, datasetName: e.target.value } })} /></div>
                  <div style={{ flex: 1 }}><label style={labelStyle}>物理表名</label><input style={inputStyle} value={(drawer.item.tableName as string) || ''} onChange={(e) => setDrawer({ ...drawer, item: { ...drawer.item, tableName: e.target.value } })} /></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={labelStyle}>字段语义（{(drawer.item.fields as DatasetSchema['fields'])?.length || 0} 个）</label>
                  <button onClick={handleImportFields} style={{ ...ghostBtn, color: '#7c3aed' }}><Download size={13} /> 从数据源导入真实字段</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflow: 'auto' }}>
                  {((drawer.item.fields as DatasetSchema['fields']) || []).map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input style={{ ...inputStyle, flex: 1 }} value={f.alias} onChange={(e) => { const arr = [...((drawer.item.fields as DatasetSchema['fields']) || [])]; arr[i] = { ...f, alias: e.target.value }; setDrawer({ ...drawer, item: { ...drawer.item, fields: arr } }); }} />
                      <input style={{ ...inputStyle, flex: 1 }} value={f.name} onChange={(e) => { const arr = [...((drawer.item.fields as DatasetSchema['fields']) || [])]; arr[i] = { ...f, name: e.target.value }; setDrawer({ ...drawer, item: { ...drawer.item, fields: arr } }); }} />
                      <select style={{ ...inputStyle, width: 110 }} value={f.aggregation || ''} onChange={(e) => { const arr = [...((drawer.item.fields as DatasetSchema['fields']) || [])]; arr[i] = { ...f, isMetric: !!e.target.value, aggregation: (e.target.value || undefined) as Aggregation }; setDrawer({ ...drawer, item: { ...drawer.item, fields: arr } }); }}>
                        <option value="">维度</option>
                        {AGG_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <button onClick={() => { const arr = ((drawer.item.fields as DatasetSchema['fields']) || []).filter((_, j) => j !== i); setDrawer({ ...drawer, item: { ...drawer.item, fields: arr } }); }} style={iconBtn}><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <button onClick={() => { const arr = [...((drawer.item.fields as DatasetSchema['fields']) || []), { name: '', alias: '', type: 'string' as const, description: '', isDimension: true, isMetric: false }]; setDrawer({ ...drawer, item: { ...drawer.item, fields: arr } }); }} style={{ ...ghostBtn, borderStyle: 'dashed' }}><Plus size={13} /> 新增字段</button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button onClick={() => setDrawer(null)} style={ghostBtn}>取消</button>
              <button onClick={handleSave} style={{ ...ghostBtn, background: '#7c3aed', color: '#fff', borderColor: '#7c3aed' }}><Save size={14} /> 保存</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#0f172a', color: '#fff', padding: '8px 16px', borderRadius: 8, fontSize: 13, zIndex: 2000 }}>{toast}</div>}
    </div>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <button onClick={onEdit} style={ghostBtn}><Pencil size={13} /></button>
      <button onClick={onDelete} style={{ ...ghostBtn, color: '#dc2626' }}><Trash2 size={13} /></button>
    </div>
  );
}

const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: '9px 10px', borderBottom: '2px solid var(--dae-border)', color: 'var(--dae-ink-secondary)', fontWeight: 600, background: '#f8fafc' };
const tdStyle: React.CSSProperties = { padding: '9px 10px', borderBottom: '1px solid var(--dae-border)', color: 'var(--dae-ink)', verticalAlign: 'top' };
const codeStyle: React.CSSProperties = { fontSize: 11.5, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, color: '#334155', fontFamily: 'ui-monospace, monospace', wordBreak: 'break-all' };
const ghostBtn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 5, border: '1px solid var(--dae-border)', background: '#fff', borderRadius: 8, padding: '6px 10px', fontSize: 12.5, cursor: 'pointer', color: 'var(--dae-ink-secondary)' };
const iconBtn: React.CSSProperties = { width: 30, height: 30, borderRadius: 8, border: '1px solid var(--dae-border)', background: '#fff', color: 'var(--dae-ink-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const drawerMaskStyle: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.35)', zIndex: 1500, display: 'flex', justifyContent: 'flex-end' };
const drawerStyle: React.CSSProperties = { width: 460, maxWidth: '94vw', height: '100%', background: '#fff', padding: 22, overflowY: 'auto', boxShadow: '-8px 0 30px rgba(0,0,0,0.15)' };
