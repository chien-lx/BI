import React, { useState } from 'react';
import '../../../style.css';

/* ---------- 类型定义 ---------- */

interface DimensionConfig {
  id: string;
  fieldName: string;
  alias: string;
  visible: boolean;
}

interface MetricConfig {
  id: string;
  fieldName: string;
  alias: string;
  aggregation: string;
  visible: boolean;
}

interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

/* ---------- 模拟数据 ---------- */

const initialReportData = {
  name: '月度销售分析报表',
  desc: '按月份统计各维度的销售额与订单量趋势',
  datasetName: '订单明细数据集',
  dimensions: [
    { id: 'd1', fieldName: '订单日期', alias: '订单日期', visible: true },
    { id: 'd2', fieldName: '省份', alias: '省份', visible: true },
    { id: 'd3', fieldName: '城市', alias: '城市', visible: true },
    { id: 'd4', fieldName: '商品品类', alias: '商品品类', visible: true },
    { id: 'd5', fieldName: '商品名称', alias: '商品名称', visible: true },
  ] as DimensionConfig[],
  metrics: [
    { id: 'm1', fieldName: '订单金额', alias: '销售额', aggregation: '求和', visible: true },
    { id: 'm2', fieldName: '订单数量', alias: '订单量', aggregation: '求和', visible: true },
    { id: 'm3', fieldName: '优惠金额', alias: '优惠额', aggregation: '求和', visible: true },
    { id: 'm4', fieldName: '实付金额', alias: '实付额', aggregation: '求和', visible: true },
  ] as MetricConfig[],
  filters: [
    { id: 'f1', field: '订单日期', operator: '>', value: '2025-01-01' } as FilterCondition,
  ],
};

const allPreviewRows: Record<string, string>[] = [
  { 订单日期: '2026-01', 省份: '广东省', 商品品类: '电子产品', 销售额: '125,680.00', 订单量: '328' },
  { 订单日期: '2026-02', 省份: '浙江省', 商品品类: '服装配饰', 销售额: '98,450.00', 订单量: '256' },
  { 订单日期: '2026-03', 省份: '江苏省', 商品品类: '食品饮料', 销售额: '156,230.00', 订单量: '412' },
  { 订单日期: '2026-04', 省份: '四川省', 商品品类: '家居用品', 销售额: '87,920.00', 订单量: '198' },
  { 订单日期: '2026-05', 省份: '湖北省', 商品品类: '电子产品', 销售额: '203,560.00', 订单量: '534' },
  { 订单日期: '2026-06', 省份: '山东省', 商品品类: '服装配饰', 销售额: '178,340.00', 订单量: '467' },
];

const operatorLabels: Record<string, string> = {
  '=': '等于',
  '!=': '不等于',
  contains: '包含',
  '>': '大于',
  '<': '小于',
  between: '介于',
};

const fieldOptions = ['订单日期', '省份', '城市', '商品品类', '商品名称', '销售额', '订单量'];

/* ========== 主组件 ========== */

export default function ReportPreviewPage() {
  const [dimensions, setDimensions] = useState<DimensionConfig[]>(initialReportData.dimensions);
  const [metrics, setMetrics] = useState<MetricConfig[]>(initialReportData.metrics);
  const [filters, setFilters] = useState<FilterCondition[]>(initialReportData.filters);
  const [filterEditing, setFilterEditing] = useState<string | null>(null);
  const [tempFilter, setTempFilter] = useState<{ field: string; operator: string; value: string }>({ field: '', operator: '=', value: '' });

  const handleBack = () => {
    window.location.hash = '#page=report';
  };

  /* 维度显示切换 */
  const toggleDimension = (id: string) => {
    setDimensions(prev => prev.map(d =>
      d.id === id ? { ...d, visible: !d.visible } : d
    ));
  };

  /* 指标显示切换 */
  const toggleMetric = (id: string) => {
    setMetrics(prev => prev.map(m =>
      m.id === id ? { ...m, visible: !m.visible } : m
    ));
  };

  /* 开始编辑筛选条件 */
  const startEditFilter = (filter: FilterCondition) => {
    setFilterEditing(filter.id);
    setTempFilter({ field: filter.field, operator: filter.operator, value: filter.value });
  };

  /* 保存筛选条件 */
  const saveFilter = () => {
    if (!tempFilter.field) return;
    setFilters(prev => prev.map(f =>
      f.id === filterEditing ? { ...f, ...tempFilter } : f
    ));
    setFilterEditing(null);
  };

  /* 取消筛选编辑 */
  const cancelEditFilter = () => {
    setFilterEditing(null);
  };

  /* 构建表格列（只包含可见字段） */
  const visibleDimAliases = dimensions.filter(d => d.visible).map(d => d.alias);
  const visibleMetricAliases = metrics.filter(m => m.visible).map(m => m.alias);
  const tableColumns = [...visibleDimAliases, ...visibleMetricAliases];

  /* 映别名到原始 key */
  const aliasToKeyMap: Record<string, string> = {};
  dimensions.forEach(d => { aliasToKeyMap[d.alias] = d.fieldName; });
  metrics.forEach(m => { aliasToKeyMap[m.alias] = m.fieldName; });

  /* ========== 渲染 ========== */
  return (
    <div className="dae-page dae-scroll" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* ====== 顶部标题栏 ====== */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px', borderBottom: '1px solid var(--dae-border)',
        background: '#fff', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="dae-btn dae-btn-ghost dae-btn-sm" onClick={handleBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h1 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--dae-ink)', margin: 0 }}>报表预览</h1>
          <span style={{
            fontSize: '13px', color: 'var(--dae-ink-muted)', fontWeight: 400,
            display: 'flex', alignItems: 'center', gap: 4,
            paddingLeft: 8, borderLeft: '1px solid var(--dae-border)',
          }}>
            {initialReportData.name}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="dae-btn dae-btn-secondary dae-btn-sm" onClick={handleBack}>关闭</button>
        </div>
      </header>

      {/* ====== 主区域（无左侧面板） ====== */}
      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto',
        background: 'var(--dae-surface)', padding: '16px 24px', gap: 14,
      }}>

        {/* --- 区域 A：维度配置（紧凑标签行，可点击切换显隐） --- */}
        <section style={{
          background: '#fff', borderRadius: 'var(--dae-radius-md)',
          border: '1px solid var(--dae-border)', overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 16px', borderBottom: '1px solid var(--dae-border)',
            background: 'var(--dae-surface)',
          }}>
            <h2 style={{
              fontSize: '13px', fontWeight: 600, color: 'var(--dae-ink)',
              margin: 0, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--dae-primary)" strokeWidth="2">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
              </svg>
              维度配置
              <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--dae-ink-muted)', background: 'var(--dae-primary-light)', padding: '1px 6px', borderRadius: 8 }}>
                {dimensions.filter(d => d.visible).length}/{dimensions.length}
              </span>
            </h2>
          </div>

          <div style={{ padding: '10px 16px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {dimensions.map(dim => (
                <span
                  key={dim.id}
                  className={`de-pill ${dim.visible ? 'de-pill-dim' : 'de-pill-disabled'}`}
                  style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                  onClick={() => toggleDimension(dim.id)}
                  title={dim.visible ? '点击隐藏' : '点击显示'}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {dim.alias}
                  {!dim.visible && <span style={{ marginLeft: 4, fontSize: '10px', opacity: 0.6 }}>(已隐藏)</span>}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* --- 区域 B：指标配置（紧凑标签行，可点击切换显隐） --- */}
        <section style={{
          background: '#fff', borderRadius: 'var(--dae-radius-md)',
          border: '1px solid var(--dae-border)', overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 16px', borderBottom: '1px solid var(--dae-border)',
            background: 'var(--dae-surface)',
          }}>
            <h2 style={{
              fontSize: '13px', fontWeight: 600, color: 'var(--dae-ink)',
              margin: 0, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2">
                <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
                <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
              </svg>
              指标配置
              <span style={{ fontSize: '11px', fontWeight: 500, background: '#dcfce7', padding: '1px 6px', borderRadius: 8, color: '#15803d' }}>
                {metrics.filter(m => m.visible).length}/{metrics.length}
              </span>
            </h2>
          </div>

          <div style={{ padding: '10px 16px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {metrics.map(metric => (
                <span
                  key={metric.id}
                  className={`de-pill ${metric.visible ? 'de-pill-metric' : 'de-pill-disabled'}`}
                  style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                  onClick={() => toggleMetric(metric.id)}
                  title={metric.visible ? '点击隐藏' : '点击显示'}
                >
                  <span style={{ width: 12, height: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>#</span>
                  {metric.alias}({metric.aggregation})
                  {!metric.visible && <span style={{ marginLeft: 4, fontSize: '10px', opacity: 0.6 }}>(已隐藏)</span>}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* --- 区域 C：筛选条件（流式布局，单查询按钮） --- */}
        <section style={{
          background: '#fff', borderRadius: 'var(--dae-radius-md)',
          border: '1px solid var(--dae-border)', overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 16px', borderBottom: filters.length > 0 ? '1px solid var(--dae-border)' : 'none',
            background: 'var(--dae-surface)',
          }}>
            <h2 style={{
              fontSize: '13px', fontWeight: 600, color: 'var(--dae-ink)',
              margin: 0, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              筛选条件
              <span style={{ fontSize: '11px', fontWeight: 500, background: '#fef3c7', padding: '1px 6px', borderRadius: 10, color: '#92400e' }}>
                {filters.length}
              </span>
            </h2>
          </div>

          <div style={{ padding: '12px 16px' }}>
            {/* 流式容器：筛选条件（只读展示配置内容）+ 查询按钮 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>

              {/* 已有筛选条件（不可增删，只可修改值和操作符） */}
              {filters.map(filter => {
                const isDateField = filter.field === '订单日期';
                return (
                  <div key={filter.id} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 10px', borderRadius: 'var(--dae-radius-sm)',
                    border: '1px solid var(--dae-border)', background: 'var(--dae-surface)',
                  }}>
                    {/* 字段名标签 */}
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '2px 8px', borderRadius: 'var(--dae-radius-sm)',
                      border: '1px solid #bae0ff', background: '#e6f4ff',
                      color: '#1677FF', fontSize: '12px', fontWeight: 500,
                      whiteSpace: 'nowrap',
                    }}>{filter.field}</span>

                    {/* 操作符 */}
                    <select
                      className="dae-input"
                      style={{ width: isDateField ? 65 : 80, padding: '4px 6px', fontSize: '12px' }}
                      value={filterEditing === filter.id ? tempFilter.operator : filter.operator}
                      onChange={(e) => {
                        if (filterEditing !== filter.id) startEditFilter(filter);
                        setTempFilter(prev => ({ ...prev, operator: e.target.value }));
                      }}
                    >
                      {isDateField ? (
                        <>
                          <option value=">">大于</option>
                          <option value="<">小于</option>
                          <option value="=">=</option>
                        </>
                      ) : (
                        <>
                          <option value="=">=</option>
                          <option value="!=">不等于</option>
                          <option value="contains">包含</option>
                          <option value=">">大于</option>
                          <option value="<">小于</option>
                        </>
                      )}
                    </select>

                    {/* 值输入 */}
                    {isDateField ? (
                      <div style={{ position: 'relative' }}>
                        <input
                          className="dae-input"
                          style={{ width: 140, padding: '4px 24px 4px 6px', fontSize: '12px' }}
                          type="text"
                          value={filterEditing === filter.id ? tempFilter.value : filter.value}
                          onChange={(e) => {
                            if (filterEditing !== filter.id) startEditFilter(filter);
                            setTempFilter(prev => ({ ...prev, value: e.target.value }));
                          }}
                          placeholder="选择时间"
                        />
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" style={{
                          position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none',
                        }}>
                          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                      </div>
                    ) : (
                      <input
                        className="dae-input"
                        style={{ width: 120, padding: '4px 6px', fontSize: '12px' }}
                        type="text"
                        value={filterEditing === filter.id ? tempFilter.value : filter.value}
                        onChange={(e) => {
                          if (filterEditing !== filter.id) startEditFilter(filter);
                          setTempFilter(prev => ({ ...prev, value: e.target.value }));
                        }}
                        placeholder="输入值"
                      />
                    )}
                  </div>
                );
              })}

              {/* 查询按钮（始终靠右，只有一个） */}
              <button
                className="dae-btn dae-btn-primary dae-btn-sm"
                style={{ marginLeft: 'auto', padding: '5px 16px', fontSize: '12px', whiteSpace: 'nowrap' }}
                onClick={() => saveFilter()}
              >查询</button>

            </div>
          </div>
        </section>

        {/* --- 区域 D：数据预览（表格展示，仅可见字段） --- */}
        <section style={{
          background: '#fff', borderRadius: 'var(--dae-radius-md)',
          border: '1px solid var(--dae-border)', overflow: 'hidden',
          flex: 1, minHeight: 200,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            padding: '10px 16px', borderBottom: '1px solid var(--dae-border)',
            background: 'var(--dae-surface)',
          }}>
            <h2 style={{
              fontSize: '13px', fontWeight: 600, color: 'var(--dae-ink)',
              margin: 0, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--dae-primary)" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>
              </svg>
              数据预览
            </h2>
          </div>

          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table className="dae-table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  {tableColumns.map(col => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allPreviewRows.map((row, idx) => (
                  <tr key={idx}>
                    {tableColumns.map(col => {
                      const originalKey = aliasToKeyMap[col] || col;
                      const val = row[originalKey];
                      return (
                        <td
                          key={col}
                          style={
                            ['销售额'].includes(col)
                              ? { textAlign: 'right', fontFamily: '"SF Mono", "Fira Code", monospace', fontWeight: 500 }
                              : undefined
                          }
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}
