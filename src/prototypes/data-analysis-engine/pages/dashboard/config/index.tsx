import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  Save,
  BarChart3,
  Settings2,
  X,
  GripVertical,
  Plus,
  RotateCcw,
  LineChart,
  AreaChart,
  PieChart,
  Table,
  LayoutGrid,
  Settings,
  Trash2,
  ArrowLeft,
  ChevronDown,
  Type,
  Palette,
  Monitor,
  Image,
  Grid3x3,
  Heading,
  Box,
  EyeOff,
  Hash,
  Eye,
  ChevronUp,
  Filter,
  SlidersHorizontal,
} from 'lucide-react';
import ChartRenderer from '../../../components/ChartRenderer';
import {
  datasetFields,
  datasets,
  chartSampleData,
  pieSampleData,
  dashboards,
  type DashboardChart,
} from '../../../data/mockData';
import { useHashParams } from '@/common/useHashParams';

export type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'table';

export interface SelectedField {
  name: string;
  dataType: string;
  aggregation?: string;
  alias?: string;
  sort?: 'asc' | 'desc' | 'none';
  visible?: boolean;
}

const chartTypeOptions: { key: ChartType; label: string; icon: React.ElementType }[] = [
  { key: 'bar', label: '柱状图', icon: BarChart3 },
  { key: 'line', label: '折线图', icon: LineChart },
  { key: 'area', label: '面积图', icon: AreaChart },
  { key: 'pie', label: '饼图', icon: PieChart },
  { key: 'table', label: '明细表', icon: Table },
];

const aggOptions = ['SUM', 'AVG', 'COUNT', 'MAX', 'MIN'];

function generateId() {
  return 'ch_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

function CollapsiblePanel({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid var(--dae-border)' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--dae-ink)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp size={14} style={{ color: 'var(--dae-ink-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--dae-ink-muted)' }} />}
      </button>
      {isOpen && (
        <div style={{ padding: '0 14px 12px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function DashboardConfigPage() {
  const hashParams = useHashParams();
  const dashboardId = hashParams['dashboardId'];
  const dashboard = dashboardId ? dashboards.find((d) => d.id === dashboardId) : undefined;
  const isNewMode = !dashboardId;

  const [chartList, setChartList] = useState<DashboardChart[]>(dashboard?.charts || []);
  const [dashboardName, setDashboardName] = useState(dashboard?.name || '新建仪表盘');

  // 当前选中的图表ID（null 表示未选中任何组件，右侧面板显示全局配置）
  const [editingChartId, setEditingChartId] = useState<string | null>(null);

  // ========== 图表配置状态（配置面板内使用）==========
  const [selectedDataset, setSelectedDataset] = useState('订单明细数据集');
  const [dimensions, setDimensions] = useState<SelectedField[]>([]);
  const [metrics, setMetrics] = useState<SelectedField[]>([]);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [showChart, setShowChart] = useState(false);
  const [chartName, setChartName] = useState('');
  const [searchField, setSearchField] = useState('');

  const [openConfig, setOpenConfig] = useState<string | null>(null);

  // 数据过滤弹窗
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filterConditions, setFilterConditions] = useState<{ field: string; operator: string; value: string; logic: 'and' | 'or' }[]>([]);

  // 图表样式配置
  const [titleSettings, setTitleSettings] = useState({
    content: '',
    fontSize: '14',
    fontWeight: '600',
    color: '#0f172a',
    align: 'left' as 'left' | 'center' | 'right',
  });

  // 全局样式配置
  const [globalStyle, setGlobalStyle] = useState({
    themeMode: 'light' as 'light' | 'dark',
    chartColor: 'official',
    gradient: true,
    pageFont: '官方',
    borderRadius: 'small' as 'none' | 'small' | 'large',
    spacing: 'normal' as 'compact' | 'normal' | 'custom',
  });

  // 将当前 state 打包成 DashboardChart
  const packChart = useCallback((): DashboardChart | null => {
    if (!editingChartId) return null;
    return {
      id: editingChartId,
      name: chartName || '未命名图表',
      type: chartType,
      datasetName: selectedDataset,
      dimensions: dimensions.filter((d) => d.visible !== false).map((d) => d.name),
      metrics: metrics.filter((m) => m.visible !== false).map((m) => m.name),
    };
  }, [editingChartId, chartName, chartType, selectedDataset, dimensions, metrics]);

  // 加载图表到 state
  const loadChart = useCallback((chart: DashboardChart | null) => {
    if (!chart) return;
    setSelectedDataset(chart.datasetName || '订单明细数据集');
    setChartName(chart.name || '');
    setChartType(chart.type || 'bar');

    const fields = datasetFields[chart.datasetName] || [];
    const dims = fields.filter((f) => f.type === 'dimension');
    const mets = fields.filter((f) => f.type === 'metric');

    setDimensions(
      chart.dimensions.map((name) => {
        const f = dims.find((d) => d.name === name);
        return { name, dataType: f?.dataType || '文本', sort: 'none' as const, visible: true };
      })
    );
    setMetrics(
      chart.metrics.map((name) => {
        const f = mets.find((m) => m.name === name);
        return { name, dataType: f?.dataType || '数值', aggregation: 'SUM', visible: true, rank: null };
      })
    );
    setShowChart(chart.dimensions.length > 0 && chart.metrics.length > 0);
  }, []);

  // 点击画布上的图表卡片 = 选中该组件
  const selectChart = (chart: DashboardChart) => {
    // 切换前保存上一个
    if (editingChartId && editingChartId !== chart.id) {
      const packed = packChart();
      if (packed) {
        setChartList((prev) => prev.map((c) => (c.id === editingChartId ? packed : c)));
      }
    }
    setEditingChartId(chart.id);
    loadChart(chart);
    setOpenConfig(null);
  };

  // 取消选中
  const deselectChart = () => {
    const packed = packChart();
    if (packed) {
      setChartList((prev) => prev.map((c) => (c.id === editingChartId ? packed : c)));
    }
    setEditingChartId(null);
  };

  const fields = datasetFields[selectedDataset] || [];
  const dimensionList = fields.filter((f) => f.type === 'dimension');
  const metricList = fields.filter((f) => f.type === 'metric');

  const filteredDimensions = dimensionList.filter((f) => f.name.toLowerCase().includes(searchField.toLowerCase()));
  const filteredMetrics = metricList.filter((f) => f.name.toLowerCase().includes(searchField.toLowerCase()));

  const chartData = useMemo(() => {
    if (chartType === 'pie') return pieSampleData;
    return chartSampleData;
  }, [chartType]);

  const handleQuery = () => {
    if (dimensions.length === 0 || metrics.length === 0) return;
    setShowChart(true);
  };

  const addDimension = (f: { name: string; dataType: string }) => {
    if (dimensions.find((d) => d.name === f.name)) return;
    setDimensions((prev) => [...prev, { name: f.name, dataType: f.dataType, sort: 'none', visible: true }]);
  };

  const addMetric = (f: { name: string; dataType: string }) => {
    if (metrics.find((m) => m.name === f.name)) return;
    setMetrics((prev) => [...prev, { name: f.name, dataType: f.dataType, aggregation: 'SUM', visible: true, rank: null }]);
  };

  const removeDimension = (name: string) => {
    setDimensions((prev) => prev.filter((d) => d.name !== name));
  };

  const removeMetric = (name: string) => {
    setMetrics((prev) => prev.filter((m) => m.name !== name));
  };

  const updateDimension = (name: string, updates: Partial<SelectedField>) => {
    setDimensions((prev) => prev.map((d) => (d.name === name ? { ...d, ...updates } : d)));
  };

  const updateMetric = (name: string, updates: Partial<SelectedField>) => {
    setMetrics((prev) => prev.map((m) => (m.name === name ? { ...m, ...updates } : m)));
  };

  const clearAll = () => {
    setDimensions([]);
    setMetrics([]);
    setShowChart(false);
    setOpenConfig(null);
    setFilterConditions([]);
    setTitleSettings({ content: '', fontSize: '14', fontWeight: '600', color: '#0f172a', align: 'left' });
  };

  const addChart = () => {
    const newChart: DashboardChart = {
      id: generateId(),
      name: '新图表 ' + (chartList.length + 1),
      type: 'bar',
      datasetName: '订单明细数据集',
      dimensions: [],
      metrics: [],
    };
    setChartList((prev) => [...prev, newChart]);
    setTimeout(() => selectChart(newChart), 0);
  };

  const removeChart = (chartId: string) => {
    setChartList((prev) => prev.filter((c) => c.id !== chartId));
    if (editingChartId === chartId) {
      setEditingChartId(null);
    }
  };

  const handleSaveDashboard = () => {
    if (editingChartId) {
      const packed = packChart();
      if (packed) {
        setChartList((prev) => prev.map((c) => (c.id === editingChartId ? packed : c)));
      }
    }
    console.log('保存仪表盘', dashboardId, chartList);
    alert('仪表盘保存成功（演示模式）');
  };

  const goBack = () => {
    window.location.hash = 'page=dashboard';
  };

  const goPreview = () => {
    window.location.hash = `page=dashboard-preview&dashboardId=${dashboardId || dashboards[0]?.id || ''}`;
  };

  // 点击文档其他区域关闭字段配置弹窗
  useEffect(() => {
    const handleDocClick = () => setOpenConfig(null);
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, []);

  const getChartPreviewData = (chart: DashboardChart) => {
    if (chart.type === 'pie') return pieSampleData;
    return chartSampleData;
  };

  const editingChart = chartList.find((c) => c.id === editingChartId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f1f5f9' }}>
      {/* ========== 顶部标题栏 ========== */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 18px',
          background: '#fff',
          borderBottom: '1px solid var(--dae-border)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="dae-btn dae-btn-secondary dae-btn-sm" onClick={goBack} title="返回">
            <ArrowLeft size={16} />
          </button>
          <input
            className="dae-input"
            style={{ width: 220, fontSize: 14, fontWeight: 600 }}
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="dae-btn dae-btn-secondary" onClick={addChart}>
            <Plus size={16} />
            添加图表
          </button>
          <button className="dae-btn dae-btn-secondary" onClick={goPreview}>
            <Eye size={16} />
            预览
          </button>
          <button className="dae-btn dae-btn-primary" onClick={handleSaveDashboard}>
            <Save size={16} />
            保存
          </button>
        </div>
      </div>

      {/* ========== 主体三栏区域 ========== */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* ---------- 左侧：数据集选择 / 字段库 ---------- */}
        <div
          style={{
            width: 220,
            flexShrink: 0,
            background: '#fff',
            borderRight: '1px solid var(--dae-border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* 数据集切换 */}
          <div style={{ padding: '12px 10px', borderBottom: '1px solid var(--dae-border)' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 6, display: 'block' }}>数据集</label>
            <select
              className="dae-input"
              style={{ fontSize: 13 }}
              value={selectedDataset}
              onChange={(e) => {
                setSelectedDataset(e.target.value);
                setShowChart(false);
                setDimensions([]);
                setMetrics([]);
              }}
            >
              {datasets.filter((d) => d.status === 'online').map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* 字段搜索 */}
          <div style={{ padding: '10px 10px 6px' }}>
            <div className="dae-search-box" style={{ maxWidth: '100%' }}>
              <Search size={14} />
              <input
                className="dae-input"
                placeholder="搜索字段"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                style={{ fontSize: 12 }}
              />
            </div>
          </div>

          {/* 字段列表 */}
          <div style={{ flex: 1, overflow: 'auto', padding: '0 8px 8px' }} className="dae-scroll">
            {/* 维度 */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 6px', marginBottom: 4 }}>
                <Type size={12} style={{ color: 'var(--dae-primary)' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--dae-ink)' }}>维度</span>
                <span style={{ fontSize: 11, color: 'var(--dae-ink-muted)', marginLeft: 'auto' }}>{filteredDimensions.length}</span>
              </div>
              {filteredDimensions.map((f) => (
                <div
                  key={f.name}
                  className="de-field-item"
                  onClick={() => {
                    if (editingChartId) {
                      addDimension(f);
                    }
                  }}
                  style={{ opacity: editingChartId ? 1 : 0.5, cursor: editingChartId ? 'pointer' : 'not-allowed' }}
                  title={editingChartId ? `添加到「${editingChart?.name}」` : '请先选中一个图表'}
                >
                  <span className="de-field-icon de-field-dim">T</span>
                  <span className="de-field-name">{f.name}</span>
                </div>
              ))}
            </div>
            {/* 指标 */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 6px', marginBottom: 4 }}>
                <Hash size={12} style={{ color: '#10b981' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--dae-ink)' }}>指标</span>
                <span style={{ fontSize: 11, color: 'var(--dae-ink-muted)', marginLeft: 'auto' }}>{filteredMetrics.length}</span>
              </div>
              {filteredMetrics.map((f) => (
                <div
                  key={f.name}
                  className="de-field-item"
                  onClick={() => {
                    if (editingChartId) {
                      addMetric(f);
                    }
                  }}
                  style={{ opacity: editingChartId ? 1 : 0.5, cursor: editingChartId ? 'pointer' : 'not-allowed' }}
                  title={editingChartId ? `添加到「${editingChart?.name}」` : '请先选中一个图表'}
                >
                  <span className="de-field-icon de-field-metric">#</span>
                  <span className="de-field-name">{f.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ---------- 中间：画布 ---------- */}
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }} className="dae-scroll">
          {chartList.length === 0 ? (
            <div className="dae-empty" style={{ minHeight: 320, background: 'transparent' }}>
              <LayoutGrid size={48} />
              <p>画布为空，点击上方「添加图表」开始搭建仪表盘</p>
              <button className="dae-btn dae-btn-primary" onClick={addChart}>
                <Plus size={16} />
                添加图表
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              {chartList.map((chart) => {
                const isEditing = editingChartId === chart.id;
                return (
                  <div
                    key={chart.id}
                    onClick={() => selectChart(chart)}
                    style={{
                      border: isEditing ? '2px solid var(--dae-primary)' : '1px solid var(--dae-border)',
                      borderRadius: 'var(--dae-radius-lg)',
                      background: '#fff',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      boxShadow: isEditing ? '0 0 0 4px rgba(59,130,246,0.08)' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {/* 卡片标题栏 */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderBottom: '1px solid var(--dae-border)',
                        background: isEditing ? 'rgba(59,130,246,0.04)' : '#fff',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BarChart3 size={16} style={{ color: 'var(--dae-primary)' }} />
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--dae-ink)' }}>{chart.name}</span>
                        <span
                          style={{
                            fontSize: 11,
                            color: 'var(--dae-ink-muted)',
                            background: '#f1f5f9',
                            padding: '2px 6px',
                            borderRadius: 4,
                          }}
                        >
                          {chartTypeOptions.find((t) => t.key === chart.type)?.label || chart.type}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {isEditing && (
                          <span style={{ fontSize: 11, color: 'var(--dae-primary)', fontWeight: 500 }}>配置中</span>
                        )}
                        <button
                          className="dae-btn dae-btn-secondary dae-btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeChart(chart.id);
                          }}
                          title="删除"
                          style={{ color: '#ef4444' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* 卡片内容区 */}
                    <div style={{ flex: 1, padding: 14, minHeight: 240 }}>
                      {chart.dimensions.length > 0 && chart.metrics.length > 0 ? (
                        chart.type === 'table' ? (
                          <div className="dae-scroll" style={{ overflow: 'auto' }}>
                            <table className="dae-table">
                              <thead>
                                <tr>
                                  <th>序号</th>
                                  {chart.dimensions.map((d) => (
                                    <th key={d}>{d}</th>
                                  ))}
                                  {chart.metrics.map((m) => (
                                    <th key={m}>{m}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {chartSampleData.map((row, idx) => (
                                  <tr key={idx}>
                                    <td>{idx + 1}</td>
                                    {chart.dimensions.map((d) => (
                                      <td key={d}>{row.name}</td>
                                    ))}
                                    {chart.metrics.map((m) => (
                                      <td key={m}>{row.value}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <ChartRenderer
                            type={chart.type}
                            data={getChartPreviewData(chart)}
                            yKeys={chart.type === 'pie' ? undefined : ['value', 'value2']}
                            height={260}
                          />
                        )
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 240,
                            color: 'var(--dae-ink-muted)',
                            gap: 8,
                          }}
                        >
                          <BarChart3 size={32} />
                          <span style={{ fontSize: 13 }}>未配置数据，点击卡片选中后配置</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ---------- 右侧：常驻配置面板 ---------- */}
        <div
          style={{
            width: 320,
            flexShrink: 0,
            background: '#fff',
            borderLeft: '1px solid var(--dae-border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {editingChartId && editingChart ? (
            /* ===== 组件配置模式 ===== */
            <>
              {/* 面板头部 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderBottom: '1px solid var(--dae-border)',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Settings size={16} style={{ color: 'var(--dae-primary)' }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--dae-ink)' }}>图表配置</span>
                </div>
                <button className="dae-btn dae-btn-secondary dae-btn-sm" onClick={deselectChart}>
                  <X size={14} />
                </button>
              </div>

              {/* 配置内容：垂直滚动 */}
              <div style={{ flex: 1, overflow: 'auto', padding: '12px 14px' }} className="dae-scroll">
                {/* 图表名称 */}
                <div className="dae-form-group">
                  <label style={{ fontSize: 12 }}>图表名称</label>
                  <input
                    className="dae-input"
                    style={{ fontSize: 13 }}
                    value={chartName}
                    onChange={(e) => setChartName(e.target.value)}
                  />
                </div>

                {/* 数据集 */}
                <div className="dae-form-group">
                  <label style={{ fontSize: 12 }}>数据集</label>
                  <select
                    className="dae-input"
                    style={{ fontSize: 13 }}
                    value={selectedDataset}
                    onChange={(e) => {
                      setSelectedDataset(e.target.value);
                      setShowChart(false);
                      setDimensions([]);
                      setMetrics([]);
                    }}
                  >
                    {datasets
                      .filter((d) => d.status === 'online')
                      .map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* 图表类型 */}
                <div className="dae-form-group" style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12 }}>图表类型</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {chartTypeOptions.map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.key}
                          className={`de-mid-chart-btn ${chartType === t.key ? 'active' : ''}`}
                          onClick={() => setChartType(t.key)}
                          title={t.label}
                          style={{ width: 50, height: 36 }}
                        >
                          <Icon size={16} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 维度 */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600 }}>维度</label>
                    <span style={{ fontSize: 11, color: 'var(--dae-ink-muted)' }}>点击左侧字段添加</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {dimensions.map((d) => (
                      <div key={d.name} style={{ position: 'relative' }}>
                        <div className="de-pill de-pill-dim" style={{ opacity: d.visible === false ? 0.5 : 1 }}>
                          <GripVertical size={10} className="de-pill-drag" />
                          <span>{d.alias || d.name}</span>
                          <Settings2
                            size={10}
                            style={{ cursor: 'pointer', opacity: 0.6, marginLeft: 2 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenConfig((prev) => (prev === `dim:${d.name}` ? null : `dim:${d.name}`));
                            }}
                          />
                          <X
                            size={10}
                            className="de-pill-close"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeDimension(d.name);
                            }}
                          />
                        </div>
                        {openConfig === `dim:${d.name}` && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              position: 'absolute',
                              top: 'calc(100% + 4px)',
                              left: 0,
                              zIndex: 50,
                              background: '#fff',
                              border: '1px solid var(--dae-border)',
                              borderRadius: 'var(--dae-radius-md)',
                              padding: 10,
                              width: 200,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 8,
                            }}
                          >
                            <div style={{ fontSize: 12, fontWeight: 600 }}>{d.name}</div>
                            <div className="dae-form-group" style={{ marginBottom: 0 }}>
                              <label style={{ fontSize: 11 }}>别名</label>
                              <input className="dae-input" style={{ fontSize: 12, padding: '4px 8px' }} value={d.alias || ''} onChange={(e) => updateDimension(d.name, { alias: e.target.value })} />
                            </div>
                            <div className="dae-form-group" style={{ marginBottom: 0 }}>
                              <label style={{ fontSize: 11 }}>排序</label>
                              <select className="dae-input" style={{ fontSize: 12, padding: '4px 8px' }} value={d.sort || 'none'} onChange={(e) => updateDimension(d.name, { sort: e.target.value as 'asc' | 'desc' | 'none' })}>
                                <option value="none">默认</option>
                                <option value="asc">升序</option>
                                <option value="desc">降序</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {dimensions.length === 0 && (
                      <span style={{ fontSize: 12, color: 'var(--dae-ink-subtle)' }}>请从左侧选择维度</span>
                    )}
                  </div>
                </div>

                {/* 指标 */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600 }}>指标</label>
                    <span style={{ fontSize: 11, color: 'var(--dae-ink-muted)' }}>点击左侧字段添加</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {metrics.map((m) => (
                      <div key={m.name} style={{ position: 'relative' }}>
                        <div className="de-pill de-pill-metric" style={{ opacity: m.visible === false ? 0.5 : 1 }}>
                          <GripVertical size={10} className="de-pill-drag" />
                          <span>{m.alias || m.name}</span>
                          <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.8 }}>{m.aggregation}</span>
                          <Settings2
                            size={10}
                            style={{ cursor: 'pointer', opacity: 0.6, marginLeft: 2 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenConfig((prev) => (prev === `metric:${m.name}` ? null : `metric:${m.name}`));
                            }}
                          />
                          <X
                            size={10}
                            className="de-pill-close"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeMetric(m.name);
                            }}
                          />
                        </div>
                        {openConfig === `metric:${m.name}` && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              position: 'absolute',
                              top: 'calc(100% + 4px)',
                              left: 0,
                              zIndex: 50,
                              background: '#fff',
                              border: '1px solid var(--dae-border)',
                              borderRadius: 'var(--dae-radius-md)',
                              padding: 10,
                              width: 200,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 8,
                            }}
                          >
                            <div style={{ fontSize: 12, fontWeight: 600 }}>{m.name}</div>
                            <div className="dae-form-group" style={{ marginBottom: 0 }}>
                              <label style={{ fontSize: 11 }}>别名</label>
                              <input className="dae-input" style={{ fontSize: 12, padding: '4px 8px' }} value={m.alias || ''} onChange={(e) => updateMetric(m.name, { alias: e.target.value })} />
                            </div>
                            <div className="dae-form-group" style={{ marginBottom: 0 }}>
                              <label style={{ fontSize: 11 }}>聚合</label>
                              <select className="dae-input" style={{ fontSize: 12, padding: '4px 8px' }} value={m.aggregation || 'SUM'} onChange={(e) => updateMetric(m.name, { aggregation: e.target.value })}>
                                {aggOptions.map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {metrics.length === 0 && (
                      <span style={{ fontSize: 12, color: 'var(--dae-ink-subtle)' }}>请从左侧选择指标</span>
                    )}
                  </div>
                </div>

                {/* 数据过滤 */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600 }}>数据过滤</label>
                    <button
                      className="dae-btn dae-btn-secondary dae-btn-sm"
                      onClick={() => setFilterModalOpen(true)}
                      disabled={!editingChartId}
                    >
                      <Filter size={12} />
                      配置过滤
                    </button>
                  </div>
                  {filterConditions.length === 0 ? (
                    <span style={{ fontSize: 12, color: 'var(--dae-ink-subtle)' }}>未设置过滤条件</span>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {filterConditions.map((cond, idx) => (
                        <div key={idx} style={{ fontSize: 12, color: 'var(--dae-ink-secondary)', background: '#f8fafc', padding: '4px 8px', borderRadius: 4 }}>
                          {idx > 0 && <span style={{ color: 'var(--dae-ink-muted)' }}>{cond.logic === 'and' ? '且' : '或'} </span>}
                          {cond.field} {cond.operator} {cond.value}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 图表样式 */}
                <CollapsiblePanel title="图表样式" defaultOpen={false}>
                  <div className="dae-form-group" style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 12 }}>标题内容</label>
                    <input className="dae-input" style={{ fontSize: 13 }} value={titleSettings.content} onChange={(e) => setTitleSettings((s) => ({ ...s, content: e.target.value }))} placeholder="请输入标题" />
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                      <label style={{ fontSize: 12 }}>字体大小</label>
                      <select className="dae-input" style={{ fontSize: 13 }} value={titleSettings.fontSize} onChange={(e) => setTitleSettings((s) => ({ ...s, fontSize: e.target.value }))}>
                        {['12', '14', '16', '18', '20', '24'].map((s) => (
                          <option key={s} value={s}>{s}px</option>
                        ))}
                      </select>
                    </div>
                    <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                      <label style={{ fontSize: 12 }}>字重</label>
                      <select className="dae-input" style={{ fontSize: 13 }} value={titleSettings.fontWeight} onChange={(e) => setTitleSettings((s) => ({ ...s, fontWeight: e.target.value }))}>
                        <option value="400">常规</option>
                        <option value="500">中等</option>
                        <option value="600">半粗</option>
                        <option value="700">粗体</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                      <label style={{ fontSize: 12 }}>颜色</label>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input type="color" value={titleSettings.color} onChange={(e) => setTitleSettings((s) => ({ ...s, color: e.target.value }))} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
                        <input className="dae-input" value={titleSettings.color} onChange={(e) => setTitleSettings((s) => ({ ...s, color: e.target.value }))} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
                      </div>
                    </div>
                    <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                      <label style={{ fontSize: 12 }}>对齐</label>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {(['left', 'center', 'right'] as const).map((a) => (
                          <button
                            key={a}
                            className={`de-mid-chart-btn ${titleSettings.align === a ? 'active' : ''}`}
                            style={{ flex: 1, height: 28, fontSize: 12 }}
                            onClick={() => setTitleSettings((s) => ({ ...s, align: a }))}
                          >
                            {a === 'left' ? '左' : a === 'center' ? '中' : '右'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CollapsiblePanel>

                {/* 操作 */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, marginTop: 12 }}>
                  <button className="dae-btn dae-btn-secondary dae-btn-sm" onClick={clearAll}>
                    <RotateCcw size={12} />
                    重置
                  </button>
                  <button className="dae-btn dae-btn-primary dae-btn-sm" onClick={handleQuery} disabled={dimensions.length === 0 || metrics.length === 0}>
                    <Search size={12} />
                    查询
                  </button>
                </div>

                {/* 预览 */}
                <div style={{ borderTop: '1px solid var(--dae-border)', paddingTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 8 }}>预览</div>
                  {showChart ? (
                    chartType === 'table' ? (
                      <div className="dae-scroll" style={{ overflow: 'auto' }}>
                        <table className="dae-table">
                          <thead>
                            <tr>
                              <th>序号</th>
                              {dimensions.map((d) => (
                                <th key={d.name}>{d.alias || d.name}</th>
                              ))}
                              {metrics.map((m) => (
                                <th key={m.name}>{m.alias || m.name} ({m.aggregation})</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {chartSampleData.map((row, idx) => (
                              <tr key={idx}>
                                <td>{idx + 1}</td>
                                {dimensions.map((d) => (
                                  <td key={d.name}>{row.name}</td>
                                ))}
                                {metrics.map((m) => (
                                  <td key={m.name}>{row.value}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <ChartRenderer type={chartType} data={chartData} yKeys={chartType === 'pie' ? undefined : ['value', 'value2']} height={220} />
                    )
                  ) : (
                    <div className="dae-empty" style={{ minHeight: 160, padding: 16 }}>
                      <BarChart3 size={32} />
                      <p style={{ fontSize: 12 }}>选择维度指标后点击查询</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* ===== 全局配置模式 ===== */
            <>
              {/* 面板头部 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  borderBottom: '1px solid var(--dae-border)',
                  flexShrink: 0,
                }}
              >
                <Palette size={16} style={{ color: 'var(--dae-primary)' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--dae-ink)' }}>全局配置</span>
              </div>

              <div style={{ flex: 1, overflow: 'auto', padding: '0' }} className="dae-scroll">
                {/* 折叠面板：仪表盘主题 */}
                <CollapsiblePanel title="仪表盘主题" defaultOpen>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                    <button className="dae-btn dae-btn-primary dae-btn-sm" style={{ fontSize: 12 }}>官方</button>
                    <button className="dae-btn dae-btn-secondary dae-btn-sm" style={{ fontSize: 12 }}>自定义</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    {['默认', '智能浅', '智能深', '科技'].map((theme) => (
                      <div
                        key={theme}
                        style={{
                          border: theme === '默认' ? '2px solid var(--dae-primary)' : '1px solid var(--dae-border)',
                          borderRadius: 'var(--dae-radius-sm)',
                          padding: '8px 4px',
                          textAlign: 'center',
                          fontSize: 12,
                          cursor: 'pointer',
                          background: theme === '默认' ? 'rgba(59,130,246,0.04)' : '#fff',
                        }}
                      >
                        <div style={{ height: 40, background: '#f1f5f9', borderRadius: 4, marginBottom: 4 }} />
                        {theme}
                      </div>
                    ))}
                  </div>
                </CollapsiblePanel>

                {/* 折叠面板：全局样式 */}
                <CollapsiblePanel title="全局样式" defaultOpen>
                  <div className="dae-form-group" style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 12 }}>主题模式</label>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {(['light', 'dark'] as const).map((mode) => (
                        <button
                          key={mode}
                          className={`de-mid-chart-btn ${globalStyle.themeMode === mode ? 'active' : ''}`}
                          style={{ flex: 1, height: 28, fontSize: 12 }}
                          onClick={() => setGlobalStyle((s) => ({ ...s, themeMode: mode }))}
                        >
                          {mode === 'light' ? '浅色模式' : '深色模式'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="dae-form-group" style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 12 }}>图表色系</label>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'].map((c) => (
                        <div key={c} style={{ width: 18, height: 18, borderRadius: 4, background: c, cursor: 'pointer' }} />
                      ))}
                      <span style={{ fontSize: 12, marginLeft: 4 }}>官方</span>
                    </div>
                  </div>

                  <div className="dae-form-group" style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 12 }}>圆角风格</label>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {(['none', 'small', 'large'] as const).map((r) => (
                        <button
                          key={r}
                          className={`de-mid-chart-btn ${globalStyle.borderRadius === r ? 'active' : ''}`}
                          style={{ flex: 1, height: 28, fontSize: 12 }}
                          onClick={() => setGlobalStyle((s) => ({ ...s, borderRadius: r }))}
                        >
                          {r === 'none' ? '无' : r === 'small' ? '小' : '大'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="dae-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: 12 }}>间距</label>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {(['compact', 'normal', 'custom'] as const).map((s) => (
                        <button
                          key={s}
                          className={`de-mid-chart-btn ${globalStyle.spacing === s ? 'active' : ''}`}
                          style={{ flex: 1, height: 28, fontSize: 12 }}
                          onClick={() => setGlobalStyle((prev) => ({ ...prev, spacing: s }))}
                        >
                          {s === 'compact' ? '紧凑' : s === 'normal' ? '常规' : '自定义'}
                        </button>
                      ))}
                    </div>
                  </div>
                </CollapsiblePanel>

                {/* 折叠面板：页面布局 */}
                <CollapsiblePanel title="页面布局" defaultOpen>
                  <div className="dae-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: 12 }}>页面布局</label>
                    <select className="dae-input" style={{ fontSize: 13 }}>
                      <option>适应内容</option>
                      <option>适应窗口</option>
                    </select>
                  </div>
                </CollapsiblePanel>

                {/* 折叠面板：仪表板背景 */}
                <CollapsiblePanel title="仪表板背景" defaultOpen>
                  <div className="dae-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: 12 }}>背景颜色</label>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="color" defaultValue="#ffffff" style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
                      <input className="dae-input" defaultValue="#ffffff" style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
                    </div>
                  </div>
                </CollapsiblePanel>

                {/* 折叠面板：组件 */}
                <CollapsiblePanel title="组件" defaultOpen>
                  <div className="dae-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: 12 }}>组件容器</label>
                    <select className="dae-input" style={{ fontSize: 13 }}>
                      <option>显示阴影</option>
                      <option>无边框</option>
                    </select>
                  </div>
                </CollapsiblePanel>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ========== 数据过滤弹窗 ========== */}
      {filterModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setFilterModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 'var(--dae-radius-lg)',
              width: 520,
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderBottom: '1px solid var(--dae-border)',
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--dae-ink)' }}>数据过滤</span>
              <button className="dae-btn dae-btn-secondary dae-btn-sm" onClick={() => setFilterModalOpen(false)}>
                <X size={14} />
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '16px 18px' }} className="dae-scroll">
              {filterConditions.length === 0 && (
                <div style={{ fontSize: 13, color: 'var(--dae-ink-muted)', marginBottom: 12 }}>暂无过滤条件，点击下方按钮添加</div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filterConditions.map((cond, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', padding: 10, borderRadius: 'var(--dae-radius-md)' }}>
                    {idx > 0 && (
                      <select
                        className="dae-input"
                        style={{ width: 60, fontSize: 12 }}
                        value={cond.logic}
                        onChange={(e) => {
                          const updated = [...filterConditions];
                          updated[idx].logic = e.target.value as 'and' | 'or';
                          setFilterConditions(updated);
                        }}
                      >
                        <option value="and">且</option>
                        <option value="or">或</option>
                      </select>
                    )}
                    <select
                      className="dae-input"
                      style={{ flex: 1, fontSize: 12 }}
                      value={cond.field}
                      onChange={(e) => {
                        const updated = [...filterConditions];
                        updated[idx].field = e.target.value;
                        setFilterConditions(updated);
                      }}
                    >
                      <option value="">选择字段</option>
                      {[...dimensions, ...metrics].map((f) => (
                        <option key={f.name} value={f.alias || f.name}>{f.alias || f.name}</option>
                      ))}
                    </select>
                    <select
                      className="dae-input"
                      style={{ width: 100, fontSize: 12 }}
                      value={cond.operator}
                      onChange={(e) => {
                        const updated = [...filterConditions];
                        updated[idx].operator = e.target.value;
                        setFilterConditions(updated);
                      }}
                    >
                      <option value="等于">等于</option>
                      <option value="不等于">不等于</option>
                      <option value="大于">大于</option>
                      <option value="小于">小于</option>
                      <option value="包含">包含</option>
                      <option value="不包含">不包含</option>
                    </select>
                    <input
                      className="dae-input"
                      style={{ flex: 1, fontSize: 12 }}
                      placeholder="值"
                      value={cond.value}
                      onChange={(e) => {
                        const updated = [...filterConditions];
                        updated[idx].value = e.target.value;
                        setFilterConditions(updated);
                      }}
                    />
                    <button
                      className="dae-btn dae-btn-secondary dae-btn-sm"
                      style={{ color: '#ef4444' }}
                      onClick={() => setFilterConditions((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="dae-btn dae-btn-secondary dae-btn-sm"
                style={{ marginTop: 12 }}
                onClick={() =>
                  setFilterConditions((prev) => [
                    ...prev,
                    { field: dimensions[0]?.alias || dimensions[0]?.name || metrics[0]?.alias || metrics[0]?.name || '', operator: '等于', value: '', logic: 'and' },
                  ])
                }
              >
                <Plus size={12} />
                添加条件
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '12px 18px', borderTop: '1px solid var(--dae-border)' }}>
              <button className="dae-btn dae-btn-secondary" onClick={() => setFilterModalOpen(false)}>取消</button>
              <button
                className="dae-btn dae-btn-primary"
                onClick={() => {
                  setFilterModalOpen(false);
                }}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
