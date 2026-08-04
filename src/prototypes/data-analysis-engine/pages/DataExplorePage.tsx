import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Save,
  BarChart3,
  Settings2,
  ChevronDown,
  X,
  GripVertical,
  Filter,
  Plus,
  RotateCcw,
  LayoutGrid,
  LineChart,
  AreaChart,
  PieChart,
  Table,
  ShieldCheck,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import ChartRenderer from '../components/ChartRenderer';
import Drawer from '../components/Drawer';
import UserPermSelect from '../components/UserPermSelect';
import {
  datasetFields,
  datasets,
  charts,
  chartSampleData,
  pieSampleData,
} from '../data/mockData';
import { useHashParams } from '../../../common/useHashParams';

export type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'table';

export interface SelectedField {
  name: string;
  dataType: string;
  aggregation?: string;
  alias?: string;
  sort?: 'asc' | 'desc' | 'none';
  visible?: boolean;
  rank?: number | null;
}

export interface DataLimitCondition {
  field: string;
  fieldType: 'dimension' | 'metric';
  operator: string;
  value: string;
  logic: 'and' | 'or';
}

export interface DynamicDimension {
  id: string;
  alias: string;
  fields: string[];
  displayMode: 'dropdown' | 'flat';
  activeField?: string;
}

export interface DynamicMetric {
  id: string;
  alias: string;
  fields: string[];
  displayMode: 'dropdown' | 'flat';
  activeField?: string;
}

const chartTypeOptions: { key: ChartType; label: string; icon: React.ElementType }[] = [
  { key: 'bar', label: '柱状图', icon: BarChart3 },
  { key: 'line', label: '折线图', icon: LineChart },
  { key: 'area', label: '面积图', icon: AreaChart },
  { key: 'pie', label: '饼图', icon: PieChart },
  { key: 'table', label: '明细表', icon: Table },
];

const aggOptions = ['SUM', 'AVG', 'COUNT', 'MAX', 'MIN'];

// 图表类型中文到英文的映射
const chartTypeMap: Record<string, ChartType> = {
  '柱状图': 'bar',
  '折线图': 'line',
  '面积图': 'area',
  '饼图': 'pie',
  '漏斗图': 'pie',
  '明细表': 'table',
};

function getChartType(typeName: string): ChartType {
  return chartTypeMap[typeName] || 'bar';
}

export default function DataExplorePage() {
  const hashParams = useHashParams();
  const chartId = hashParams['chartId'];
  const editingChart = chartId ? charts.find(c => c.id === chartId) : null;

  const [selectedDataset, setSelectedDataset] = useState('订单明细数据集');
  const [dimensions, setDimensions] = useState<SelectedField[]>([]);
  const [metrics, setMetrics] = useState<SelectedField[]>([]);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [showChart, setShowChart] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [chartName, setChartName] = useState('');
  const [activeTab, setActiveTab] = useState<'style' | 'advanced'>('style');
  const [searchField, setSearchField] = useState('');
  const [dataLimitConditions, setDataLimitConditions] = useState<DataLimitCondition[]>([]);
  const [limitDrawerOpen, setLimitDrawerOpen] = useState(false);
  const [openConfig, setOpenConfig] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // 动态维度/指标
  const [dynamicDimensions, setDynamicDimensions] = useState<DynamicDimension[]>([]);
  const [dynamicMetrics, setDynamicMetrics] = useState<DynamicMetric[]>([]);
  const [dynDimDrawerOpen, setDynDimDrawerOpen] = useState(false);
  const [dynMetDrawerOpen, setDynMetDrawerOpen] = useState(false);
  const [dynDimForm, setDynDimForm] = useState<Partial<DynamicDimension>>({ alias: '', fields: [], displayMode: 'dropdown' });
  const [dynMetForm, setDynMetForm] = useState<Partial<DynamicMetric>>({ alias: '', fields: [], displayMode: 'dropdown' });

  // 当有 chartId 时，回显图表数据
  useEffect(() => {
    if (editingChart) {
      setIsEditMode(true);
      setChartName(editingChart.name);
      setSelectedDataset(editingChart.datasetName);
      setChartType(getChartType(editingChart.type));
      // 根据数据集设置默认的维度和指标
      const fields = datasetFields[editingChart.datasetName] || [];
      const dims = fields.filter(f => f.type === 'dimension');
      const mets = fields.filter(f => f.type === 'metric');
      if (dims.length > 0) {
        setDimensions([{ name: dims[0].name, dataType: dims[0].dataType, sort: 'none', visible: true }]);
      }
      if (mets.length > 0) {
        setMetrics([{ name: mets[0].name, dataType: mets[0].dataType, aggregation: 'SUM', visible: true, rank: null }]);
      }
      setShowChart(true);
    } else {
      setIsEditMode(false);
    }
  }, [editingChart?.id]);

  // 样式配置开关状态
  const [viewPerm, setViewPerm] = useState<string[]>([]);
  const [managePerm, setManagePerm] = useState<string[]>([]);

  // 样式配置开关状态
  const [styleConfig, setStyleConfig] = useState({
    title: false,
    background: false,
    border: false,
    tooltip: false,
    tableHeader: false,
    total: false,
    scroll: false,
    conditional: false,
  });

  // 各配置项的具体值
  const [titleSettings, setTitleSettings] = useState({
    content: '销售统计',
    fontSize: '16',
    fontWeight: '600',
    color: '#0f172a',
    align: 'center' as 'left' | 'center' | 'right',
  });
  const [borderSettings, setBorderSettings] = useState({
    width: '1',
    style: 'solid' as 'solid' | 'dashed' | 'dotted',
    color: '#e2e8f0',
    radius: '8',
  });
  const [tooltipSettings, setTooltipSettings] = useState({
    trigger: 'hover' as 'hover' | 'click',
    bgColor: '#0f172a',
    textColor: '#ffffff',
  });
  const [headerSettings, setHeaderSettings] = useState({
    bgColor: '#f8fafc',
    textColor: '#334155',
    fontSize: '13',
    fontWeight: '500',
  });
  const [totalSettings, setTotalSettings] = useState({
    position: 'bottom' as 'top' | 'bottom',
    label: '合计',
  });
  const [scrollSettings, setScrollSettings] = useState({
    x: true,
    y: true,
    maxHeight: '400',
  });

  const toggleConfig = (key: keyof typeof styleConfig) => {
    setStyleConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const fields = datasetFields[selectedDataset] || [];
  const dimensionList = fields.filter((f) => f.type === 'dimension');
  const metricList = fields.filter((f) => f.type === 'metric');

  const filteredDimensions = dimensionList.filter((f) =>
    f.name.toLowerCase().includes(searchField.toLowerCase())
  );
  const filteredMetrics = metricList.filter((f) =>
    f.name.toLowerCase().includes(searchField.toLowerCase())
  );

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
    setMetrics((prev) => [
      ...prev,
      { name: f.name, dataType: f.dataType, aggregation: 'SUM', visible: true, rank: null },
    ]);
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

  const removeDynamicDimension = (id: string) => {
    setDynamicDimensions((prev) => prev.filter((d) => d.id !== id));
  };

  const removeDynamicMetric = (id: string) => {
    setDynamicMetrics((prev) => prev.filter((m) => m.id !== id));
  };

  const updateDynamicDimension = (id: string, updates: Partial<DynamicDimension>) => {
    setDynamicDimensions((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const updateDynamicMetric = (id: string, updates: Partial<DynamicMetric>) => {
    setDynamicMetrics((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const clearAll = () => {
    setDimensions([]);
    setMetrics([]);
    setShowChart(false);
    setDataLimitConditions([]);
    setLimitDrawerOpen(false);
    setDynamicDimensions([]);
    setDynamicMetrics([]);
    setDynDimDrawerOpen(false);
    setDynMetDrawerOpen(false);
    setDynDimForm({ alias: '', fields: [], displayMode: 'dropdown' });
    setDynMetForm({ alias: '', fields: [], displayMode: 'dropdown' });
    setOpenConfig(null);
  };

  const addLimitCondition = () => {
    const firstDim = dimensions[0];
    const firstMet = metrics[0];
    const defaultField = firstDim || firstMet;
    setDataLimitConditions((prev) => [
      ...prev,
      {
        field: defaultField ? (defaultField.alias || defaultField.name) : '',
        fieldType: firstDim ? 'dimension' : 'metric',
        operator: '等于',
        value: '',
        logic: 'and',
      },
    ]);
  };

  const updateLimitCondition = (index: number, key: keyof DataLimitCondition, value: string) => {
    setDataLimitConditions((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [key]: value } : c))
    );
  };

  const removeLimitCondition = (index: number) => {
    setDataLimitConditions((prev) => prev.filter((_, i) => i !== index));
  };

  const previewTitle = useMemo(() => {
    const dimStr = dimensions.map((d) => d.name).join('、') || '无维度';
    const metStr = metrics.map((m) => m.name).join('、') || '无指标';
    return `${selectedDataset} · ${dimStr} · ${metStr}`;
  }, [selectedDataset, dimensions, metrics]);

  // 点击文档其他区域关闭配置面板
  useEffect(() => {
    const handleDocClick = () => setOpenConfig(null);
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader
        title={isEditMode ? `编辑图表 - ${editingChart?.name || ''}` : '数据探查'}
        breadcrumb={isEditMode ? `数据分析 / 图表管理 / 编辑` : '数据分析 / 数据探查'}
        actions={
          showChart && (
            <button
              className="dae-btn dae-btn-primary"
              onClick={() => setSaveOpen(true)}
            >
              <Save size={16} />
              {isEditMode ? '更新图表' : '保存图表'}
            </button>
          )
        }
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 240px 1fr',
          gap: 0,
          flex: 1,
          minHeight: 0,
          border: '1px solid var(--dae-border)',
          borderRadius: 'var(--dae-radius-lg)',
          overflow: 'hidden',
          background: '#fff',
        }}
      >
        {/* ========== Left: Field Panel ========== */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid var(--dae-border)',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '14px 14px 10px' }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--dae-ink)',
                marginBottom: 8,
                display: 'block',
              }}
            >
              数据集
            </label>
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

          <div style={{ padding: '0 14px 10px' }}>
            <div className="dae-filter-bar" style={{ marginBottom: 0 }}>
              <div className="dae-search-box" style={{ maxWidth: '100%' }}>
                <Search size={14} />
                <input
                  className="dae-input"
                  placeholder="请输入字段名称"
                  value={searchField}
                  onChange={(e) => setSearchField(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div
            style={{ flex: 1, overflow: 'auto', padding: '0 8px' }}
            className="dae-scroll"
          >
            <div style={{ padding: '4px 4px 6px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--dae-ink)',
                  }}
                >
                  维度
                </span>
                <button
                  className="dae-btn dae-btn-ghost dae-btn-sm"
                  style={{ padding: '2px 6px', fontSize: 12 }}
                  onClick={() => {
                    setDynDimForm({ alias: '', fields: [], displayMode: 'dropdown' });
                    setDynDimDrawerOpen(true);
                  }}
                >
                  <Plus size={12} />
                </button>
              </div>
              {filteredDimensions.map((f) => (
                <div
                  key={f.name}
                  className="de-field-item"
                  onClick={() => addDimension(f)}
                >
                  <span className="de-field-icon de-field-dim">T</span>
                  <span className="de-field-name">{f.name}</span>
                </div>
              ))}
            </div>

            <div style={{ padding: '8px 4px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--dae-ink)',
                  }}
                >
                  指标
                </span>
                <button
                  className="dae-btn dae-btn-ghost dae-btn-sm"
                  style={{ padding: '2px 6px', fontSize: 12 }}
                  onClick={() => {
                    setDynMetForm({ alias: '', fields: [], displayMode: 'dropdown' });
                    setDynMetDrawerOpen(true);
                  }}
                >
                  <Plus size={12} />
                </button>
              </div>
              {filteredMetrics.map((f) => (
                <div
                  key={f.name}
                  className="de-field-item"
                  onClick={() => addMetric(f)}
                >
                  <span className="de-field-icon de-field-metric">#</span>
                  <span className="de-field-name">{f.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========== Middle: Chart Type + Style Config ========== */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid var(--dae-border)',
            overflow: 'hidden',
          }}
        >
          {/* Chart type selector */}
          <div
            style={{
              padding: '14px 12px',
              borderBottom: '1px solid var(--dae-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--dae-ink)',
              }}
            >
              图表
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {chartTypeOptions.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    className={`de-mid-chart-btn ${chartType === t.key ? 'active' : ''}`}
                    onClick={() => setChartType(t.key)}
                    title={t.label}
                  >
                    <Icon size={18} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Style / Advanced tabs */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--dae-border)',
            }}
          >
            <button
              className={`de-mid-tab ${activeTab === 'style' ? 'active' : ''}`}
              onClick={() => setActiveTab('style')}
            >
              样式
            </button>
            <button
              className={`de-mid-tab ${activeTab === 'advanced' ? 'active' : ''}`}
              onClick={() => setActiveTab('advanced')}
            >
              高级
            </button>
          </div>

          {/* Config content */}
          <div
            style={{ flex: 1, overflow: 'auto', padding: '12px' }}
            className="dae-scroll"
          >
            {activeTab === 'style' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* 基础样式 - 无开关 */}
                <div style={{ padding: '8px 0' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dae-ink)' }}>基础样式</span>
                </div>

                {/* 标题 - 有开关 + 子配置 */}
                <div style={{ border: '1px solid var(--dae-border)', borderRadius: 'var(--dae-radius-sm)', overflow: 'hidden' }}>
                  <div
                    className="de-mid-config-row"
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleConfig('title')}
                  >
                    <span style={{ fontSize: 13, color: 'var(--dae-ink-secondary)' }}>标题</span>
                    <span className={`de-toggle ${styleConfig.title ? 'on' : ''}`} />
                  </div>
                  {styleConfig.title && (
                    <div style={{ padding: '10px 12px', borderTop: '1px solid var(--dae-border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div className="dae-form-group" style={{ marginBottom: 0 }}>
                        <label>标题内容</label>
                        <input className="dae-input" value={titleSettings.content} onChange={(e) => setTitleSettings(s => ({ ...s, content: e.target.value }))} placeholder="请输入标题" />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                          <label>字体大小</label>
                          <select className="dae-input" value={titleSettings.fontSize} onChange={(e) => setTitleSettings(s => ({ ...s, fontSize: e.target.value }))}>
                            {['12','14','16','18','20','24','28'].map(s => <option key={s} value={s}>{s}px</option>)}
                          </select>
                        </div>
                        <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                          <label>字重</label>
                          <select className="dae-input" value={titleSettings.fontWeight} onChange={(e) => setTitleSettings(s => ({ ...s, fontWeight: e.target.value }))}>
                            <option value="400">常规</option><option value="500">中等</option><option value="600">半粗</option><option value="700">粗体</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                        <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                          <label>文字颜色</label>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input type="color" value={titleSettings.color} onChange={(e) => setTitleSettings(s => ({ ...s, color: e.target.value }))} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
                            <input className="dae-input" value={titleSettings.color} onChange={(e) => setTitleSettings(s => ({ ...s, color: e.target.value }))} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
                          </div>
                        </div>
                        <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                          <label>对齐方式</label>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {(['left','center','right'] as const).map(a => (
                              <button key={a} className={`de-mid-chart-btn ${titleSettings.align === a ? 'active' : ''}`} style={{ height: 30, width: 36, fontSize: 11 }} onClick={() => setTitleSettings(s => ({ ...s, align: a }))}>
                                {a === 'left' ? '左' : a === 'center' ? '中' : '右'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 背景 - 无开关，直接展示 */}
                <div style={{ border: '1px solid var(--dae-border)', borderRadius: 'var(--dae-radius-sm)', overflow: 'hidden' }}>
                  <div className="de-mid-config-row">
                    <span style={{ fontSize: 13, color: 'var(--dae-ink-secondary)' }}>背景</span>
                  </div>
                  <div style={{ padding: '10px 12px', borderTop: '1px solid var(--dae-border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="dae-form-group" style={{ marginBottom: 0 }}>
                      <label>背景颜色</label>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input type="color" defaultValue="#ffffff" style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
                        <input className="dae-input" defaultValue="#ffffff" style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
                      </div>
                    </div>
                    <div className="dae-form-group" style={{ marginBottom: 0 }}>
                      <label>背景透明度</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="range" min="0" max="100" defaultValue="100" style={{ flex: 1 }} />
                        <span style={{ fontSize: 12, color: 'var(--dae-ink-muted)', minWidth: 32 }}>100%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 边框 - 有开关 + 子配置 */}
                <div style={{ border: '1px solid var(--dae-border)', borderRadius: 'var(--dae-radius-sm)', overflow: 'hidden' }}>
                  <div className="de-mid-config-row" style={{ cursor: 'pointer' }} onClick={() => toggleConfig('border')}>
                    <span style={{ fontSize: 13, color: 'var(--dae-ink-secondary)' }}>边框</span>
                    <span className={`de-toggle ${styleConfig.border ? 'on' : ''}`} />
                  </div>
                  {styleConfig.border && (
                    <div style={{ padding: '10px 12px', borderTop: '1px solid var(--dae-border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                          <label>边框宽度</label>
                          <select className="dae-input" value={borderSettings.width} onChange={(e) => setBorderSettings(s => ({ ...s, width: e.target.value }))}>
                            <option value="0">无边框</option><option value="1">细(1px)</option><option value="2">中(2px)</option><option value="3">粗(3px)</option>
                          </select>
                        </div>
                        <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                          <label>边框样式</label>
                          <select className="dae-input" value={borderSettings.style} onChange={(e) => setBorderSettings(s => ({ ...s, style: e.target.value as typeof borderSettings.style }))}>
                            <option value="solid">实线</option><option value="dashed">虚线</option><option value="dotted">点线</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                          <label>边框颜色</label>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input type="color" value={borderSettings.color} onChange={(e) => setBorderSettings(s => ({ ...s, color: e.target.value }))} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
                            <input className="dae-input" value={borderSettings.color} onChange={(e) => setBorderSettings(s => ({ ...s, color: e.target.value }))} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
                          </div>
                        </div>
                        <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                          <label>圆角大小</label>
                          <select className="dae-input" value={borderSettings.radius} onChange={(e) => setBorderSettings(s => ({ ...s, radius: e.target.value }))}>
                            <option value="0">无圆角</option><option value="4">4px</option><option value="8">8px</option><option value="12">12px</option><option value="16">16px</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 提示 - 有开关 + 子配置 */}
                <div style={{ border: '1px solid var(--dae-border)', borderRadius: 'var(--dae-radius-sm)', overflow: 'hidden' }}>
                  <div className="de-mid-config-row" style={{ cursor: 'pointer' }} onClick={() => toggleConfig('tooltip')}>
                    <span style={{ fontSize: 13, color: 'var(--dae-ink-secondary)' }}>提示</span>
                    <span className={`de-toggle ${styleConfig.tooltip ? 'on' : ''}`} />
                  </div>
                  {styleConfig.tooltip && (
                    <div style={{ padding: '10px 12px', borderTop: '1px solid var(--dae-border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div className="dae-form-group" style={{ marginBottom: 0 }}>
                        <label>触发方式</label>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {(['hover','click'] as const).map(t => (
                            <button key={t} className={`de-mid-chart-btn ${tooltipSettings.trigger === t ? 'active' : ''}`} style={{ height: 30, flex: 1, fontSize: 12 }} onClick={() => setTooltipSettings(s => ({ ...s, trigger: t }))}>
                              {t === 'hover' ? '悬浮显示' : '点击显示'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="dae-form-group" style={{ marginBottom: 0 }}>
                        <label>提示内容格式</label>
                        <select className="dae-input" defaultValue="auto">
                          <option value="auto">自动（维度+指标值）</option>
                          <option value="custom">自定义模板</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                          <label>背景色</label>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input type="color" value={tooltipSettings.bgColor} onChange={(e) => setTooltipSettings(s => ({ ...s, bgColor: e.target.value }))} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
                            <input className="dae-input" value={tooltipSettings.bgColor} onChange={(e) => setTooltipSettings(s => ({ ...s, bgColor: e.target.value }))} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
                          </div>
                        </div>
                        <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                          <label>文字色</label>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input type="color" value={tooltipSettings.textColor} onChange={(e) => setTooltipSettings(s => ({ ...s, textColor: e.target.value }))} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
                            <input className="dae-input" value={tooltipSettings.textColor} onChange={(e) => setTooltipSettings(s => ({ ...s, textColor: e.target.value }))} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 表头 - 有开关 + 子配置 */}
                <div style={{ border: '1px solid var(--dae-border)', borderRadius: 'var(--dae-radius-sm)', overflow: 'hidden' }}>
                  <div className="de-mid-config-row" style={{ cursor: 'pointer' }} onClick={() => toggleConfig('tableHeader')}>
                    <span style={{ fontSize: 13, color: 'var(--dae-ink-secondary)' }}>表头</span>
                    <span className={`de-toggle ${styleConfig.tableHeader ? 'on' : ''}`} />
                  </div>
                  {styleConfig.tableHeader && (
                    <div style={{ padding: '10px 12px', borderTop: '1px solid var(--dae-border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                          <label>表头背景色</label>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input type="color" value={headerSettings.bgColor} onChange={(e) => setHeaderSettings(s => ({ ...s, bgColor: e.target.value }))} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
                            <input className="dae-input" value={headerSettings.bgColor} onChange={(e) => setHeaderSettings(s => ({ ...s, bgColor: e.target.value }))} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
                          </div>
                        </div>
                        <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                          <label>表头文字色</label>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input type="color" value={headerSettings.textColor} onChange={(e) => setHeaderSettings(s => ({ ...s, textColor: e.target.value }))} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
                            <input className="dae-input" value={headerSettings.textColor} onChange={(e) => setHeaderSettings(s => ({ ...s, textColor: e.target.value }))} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                          <label>字号</label>
                          <select className="dae-input" value={headerSettings.fontSize} onChange={(e) => setHeaderSettings(s => ({ ...s, fontSize: e.target.value }))}>
                            {['12','13','14','16'].map(s => <option key={s} value={s}>{s}px</option>)}
                          </select>
                        </div>
                        <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                          <label>字重</label>
                          <select className="dae-input" value={headerSettings.fontWeight} onChange={(e) => setHeaderSettings(s => ({ ...s, fontWeight: e.target.value }))}>
                            <option value="400">常规</option><option value="500">中等</option><option value="600">半粗</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 单元格 - 无开关，直接展示 */}
                <div style={{ border: '1px solid var(--dae-border)', borderRadius: 'var(--dae-radius-sm)', overflow: 'hidden' }}>
                  <div className="de-mid-config-row">
                    <span style={{ fontSize: 13, color: 'var(--dae-ink-secondary)' }}>单元格</span>
                  </div>
                  <div style={{ padding: '10px 12px', borderTop: '1px solid var(--dae-border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label>行高</label>
                        <select className="dae-input" defaultValue="44">
                          <option value="36">紧凑(36px)</option><option value="44">默认(44px)</option><option value="52">宽松(52px)</option>
                        </select>
                      </div>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label>内边距</label>
                        <select className="dae-input" defaultValue="12">
                          <option value="8">小(8px)</option><option value="12">中(12px)</option><option value="16">大(16px)</option>
                        </select>
                      </div>
                    </div>
                    <div className="dae-form-group" style={{ marginBottom: 0 }}>
                      <label>斑马纹</label>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        {(['none','odd','even'] as const).map(z => (
                          <label key={z} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--dae-ink-secondary)', cursor: 'pointer' }}>
                            <input type="radio" name="zebra" defaultChecked={z === 'none'} />{z === 'none' ? '无' : z === 'odd' ? '奇数行' : '偶数行'}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 总计 - 有开关 + 子配置 */}
                <div style={{ border: '1px solid var(--dae-border)', borderRadius: 'var(--dae-radius-sm)', overflow: 'hidden' }}>
                  <div className="de-mid-config-row" style={{ cursor: 'pointer' }} onClick={() => toggleConfig('total')}>
                    <span style={{ fontSize: 13, color: 'var(--dae-ink-secondary)' }}>总计</span>
                    <span className={`de-toggle ${styleConfig.total ? 'on' : ''}`} />
                  </div>
                  {styleConfig.total && (
                    <div style={{ padding: '10px 12px', borderTop: '1px solid var(--dae-border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div className="dae-form-group" style={{ marginBottom: 0 }}>
                        <label>总计位置</label>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {(['top','bottom'] as const).map(p => (
                            <button key={p} className={`de-mid-chart-btn ${totalSettings.position === p ? 'active' : ''}`} style={{ height: 30, flex: 1, fontSize: 12 }} onClick={() => setTotalSettings(s => ({ ...s, position: p }))}>
                              {p === 'top' ? '顶部' : '底部'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="dae-form-group" style={{ marginBottom: 0 }}>
                        <label>总计标签</label>
                        <input className="dae-input" value={totalSettings.label} onChange={(e) => setTotalSettings(s => ({ ...s, label: e.target.value }))} placeholder="如：合计、总计" />
                      </div>
                      <div className="dae-form-group" style={{ marginBottom: 0 }}>
                        <label>汇总指标</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {metrics.map(m => (
                            <label key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--dae-ink-secondary)', cursor: 'pointer' }}>
                              <input type="checkbox" defaultChecked />{m.name}({m.aggregation})
                            </label>
                          ))}
                          {metrics.length === 0 && <span style={{ fontSize: 12, color: 'var(--dae-ink-subtle)' }}>暂无指标</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 功能设置 - 无开关，直接展示 */}
                <div style={{ border: '1px solid var(--dae-border)', borderRadius: 'var(--dae-radius-sm)', overflow: 'hidden' }}>
                  <div className="de-mid-config-row">
                    <span style={{ fontSize: 13, color: 'var(--dae-ink-secondary)' }}>功能设置</span>
                  </div>
                  <div style={{ padding: '10px 12px', borderTop: '1px solid var(--dae-border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { key: 'export', label: '导出数据' },
                      { key: 'fullscreen', label: '全屏查看' },
                      { key: 'refresh', label: '刷新按钮' },
                      { key: 'drill', label: '数据下钻' },
                    ].map(item => (
                      <label key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: 'var(--dae-ink-secondary)', cursor: 'pointer' }}>
                        <span>{item.label}</span>
                        <span className="de-toggle on" />
                      </label>
                    ))}
                  </div>
                </div>

                {/* 滚动设置 - 有开关 + 子配置 */}
                <div style={{ border: '1px solid var(--dae-border)', borderRadius: 'var(--dae-radius-sm)', overflow: 'hidden' }}>
                  <div className="de-mid-config-row" style={{ cursor: 'pointer' }} onClick={() => toggleConfig('scroll')}>
                    <span style={{ fontSize: 13, color: 'var(--dae-ink-secondary)' }}>滚动设置</span>
                    <span className={`de-toggle ${styleConfig.scroll ? 'on' : ''}`} />
                  </div>
                  {styleConfig.scroll && (
                    <div style={{ padding: '10px 12px', borderTop: '1px solid var(--dae-border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: 'var(--dae-ink-secondary)', cursor: 'pointer' }}>
                        <span>横向滚动</span>
                        <span className={`de-toggle ${scrollSettings.x ? 'on' : ''}`} onClick={() => setScrollSettings(s => ({ ...s, x: !s.x }))} />
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: 'var(--dae-ink-secondary)', cursor: 'pointer' }}>
                        <span>纵向滚动</span>
                        <span className={`de-toggle ${scrollSettings.y ? 'on' : ''}`} onClick={() => setScrollSettings(s => ({ ...s, y: !s.y }))} />
                      </label>
                      <div className="dae-form-group" style={{ marginBottom: 0 }}>
                        <label>最大高度 (px)</label>
                        <input className="dae-input" type="number" value={scrollSettings.maxHeight} onChange={(e) => setScrollSettings(s => ({ ...s, maxHeight: e.target.value }))} placeholder="如 400" />
                      </div>
                    </div>
                  )}
                </div>

                {/* 条件样式 - 有开关 + 子配置 */}
                <div style={{ border: '1px solid var(--dae-border)', borderRadius: 'var(--dae-radius-sm)', overflow: 'hidden' }}>
                  <div className="de-mid-config-row" style={{ cursor: 'pointer' }} onClick={() => toggleConfig('conditional')}>
                    <span style={{ fontSize: 13, color: 'var(--dae-ink-secondary)' }}>条件样式</span>
                    <span className={`de-toggle ${styleConfig.conditional ? 'on' : ''}`} />
                  </div>
                  {styleConfig.conditional && (
                    <div style={{ padding: '10px 12px', borderTop: '1px solid var(--dae-border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                          <label>条件类型</label>
                          <select className="dae-input" defaultValue="gt">
                            <option value="gt">大于</option><option value="lt">小于</option><option value="eq">等于</option><option value="between">介于</option><option value="contains">包含</option>
                          </select>
                        </div>
                        <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                          <label>目标字段</label>
                          <select className="dae-input" defaultValue="">
                            <option value="">选择指标...</option>
                            {metrics.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="dae-form-group" style={{ marginBottom: 0 }}>
                        <label>阈值</label>
                        <input className="dae-input" placeholder="输入阈值数值" />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                          <label>样式效果</label>
                          <select className="dae-input" defaultValue="textColor">
                            <option value="textColor">文字变色</option><option value="bgColor">背景变色</option><option value="bold">加粗</option><option value="icon">添加图标</option>
                          </select>
                        </div>
                        <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                          <label>效果值</label>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input type="color" defaultValue="#dc2626" style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
                            <input className="dae-input" defaultValue="#dc2626" style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    color: 'var(--dae-ink-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  <input type="checkbox" />
                  开启数据下钻
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    color: 'var(--dae-ink-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  <input type="checkbox" />
                  开启自动刷新
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    color: 'var(--dae-ink-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  <input type="checkbox" />
                  开启数据对比
                </label>
              </div>
            )}
          </div>
        </div>

        {/* ========== Right: Config + Preview ========== */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Top config area */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--dae-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              flexShrink: 0,
            }}
          >
            {/* Dimension row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--dae-ink)',
                  width: 48,
                  flexShrink: 0,
                  marginTop: 5,
                }}
              >
                维度
              </div>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                }}
              >
                {dimensions.map((d) => (
                  <div key={d.name} style={{ position: 'relative' }}>
                    <div className="de-pill de-pill-dim" style={{ opacity: d.visible === false ? 0.5 : 1 }}>
                      <GripVertical size={10} className="de-pill-drag" />
                      <span>{d.alias || d.name}</span>
                      {d.sort !== 'none' && (
                        <span style={{ fontSize: 10, opacity: 0.8 }}>
                          {d.sort === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
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
                          padding: 12,
                          width: 220,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 2 }}>
                          {d.name}
                        </div>
                        <div className="dae-form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: 12 }}>别名</label>
                          <input
                            className="dae-input"
                            style={{ fontSize: 12, padding: '4px 8px' }}
                            placeholder="显示别名"
                            value={d.alias || ''}
                            onChange={(e) => updateDimension(d.name, { alias: e.target.value })}
                          />
                        </div>
                        <div className="dae-form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: 12 }}>排序</label>
                          <select
                            className="dae-input"
                            style={{ fontSize: 12, padding: '4px 8px' }}
                            value={d.sort || 'none'}
                            onChange={(e) => updateDimension(d.name, { sort: e.target.value as 'asc' | 'desc' | 'none' })}
                          >
                            <option value="none">默认</option>
                            <option value="asc">升序</option>
                            <option value="desc">降序</option>
                          </select>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--dae-ink-secondary)', cursor: 'pointer' }}>
                          <span>显示</span>
                          <span
                            className={`de-toggle ${d.visible !== false ? 'on' : ''}`}
                            onClick={() => updateDimension(d.name, { visible: d.visible === false ? true : false })}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                ))}
                {dynamicDimensions.map((dd) => (
                  <div key={dd.id} style={{ position: 'relative' }}>
                    <div className="de-pill" style={{ background: '#fef3c7', color: '#b45309', borderColor: '#fde68a' }}>
                      <GripVertical size={10} className="de-pill-drag" />
                      <span style={{ fontWeight: 600 }}>{dd.alias}</span>
                      <span style={{ fontSize: 10, opacity: 0.7 }}>(动态)</span>
                      <X
                        size={10}
                        className="de-pill-close"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeDynamicDimension(dd.id);
                        }}
                      />
                    </div>
                  </div>
                ))}
                {dimensions.length === 0 && dynamicDimensions.length === 0 && (
                  <span
                    style={{
                      fontSize: 13,
                      color: 'var(--dae-ink-subtle)',
                      marginTop: 5,
                    }}
                  >
                    请从左侧选择维度
                  </span>
                )}
              </div>
            </div>

            {/* Metric row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--dae-ink)',
                  width: 48,
                  flexShrink: 0,
                  marginTop: 5,
                }}
              >
                指标
              </div>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                }}
              >
                {metrics.map((m) => (
                  <div key={m.name} style={{ position: 'relative' }}>
                    <div className="de-pill de-pill-metric" style={{ opacity: m.visible === false ? 0.5 : 1 }}>
                      <GripVertical size={10} className="de-pill-drag" />
                      <span>{m.alias || m.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.85, marginLeft: 2 }}>
                        {m.aggregation || 'SUM'}
                      </span>
                      {m.rank != null && m.rank > 0 && (
                        <span style={{ fontSize: 10, opacity: 0.8 }}>TOP{m.rank}</span>
                      )}
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
                          padding: 12,
                          width: 220,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 2 }}>
                          {m.name}
                        </div>
                        <div className="dae-form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: 12 }}>别名</label>
                          <input
                            className="dae-input"
                            style={{ fontSize: 12, padding: '4px 8px' }}
                            placeholder="显示别名"
                            value={m.alias || ''}
                            onChange={(e) => updateMetric(m.name, { alias: e.target.value })}
                          />
                        </div>
                        <div className="dae-form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: 12 }}>聚合计算</label>
                          <select
                            className="dae-input"
                            style={{ fontSize: 12, padding: '4px 8px' }}
                            value={m.aggregation || 'SUM'}
                            onChange={(e) => updateMetric(m.name, { aggregation: e.target.value })}
                          >
                            {aggOptions.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="dae-form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: 12 }}>排名</label>
                          <select
                            className="dae-input"
                            style={{ fontSize: 12, padding: '4px 8px' }}
                            value={m.rank ?? 0}
                            onChange={(e) => updateMetric(m.name, { rank: Number(e.target.value) || null })}
                          >
                            <option value={0}>不排名</option>
                            <option value={3}>TOP 3</option>
                            <option value={5}>TOP 5</option>
                            <option value={10}>TOP 10</option>
                          </select>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--dae-ink-secondary)', cursor: 'pointer' }}>
                          <span>显示</span>
                          <span
                            className={`de-toggle ${m.visible !== false ? 'on' : ''}`}
                            onClick={() => updateMetric(m.name, { visible: m.visible === false ? true : false })}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                ))}
                {dynamicMetrics.map((dm) => (
                  <div key={dm.id} style={{ position: 'relative' }}>
                    <div className="de-pill" style={{ background: '#dbeafe', color: '#1e40af', borderColor: '#bfdbfe' }}>
                      <GripVertical size={10} className="de-pill-drag" />
                      <span style={{ fontWeight: 600 }}>{dm.alias}</span>
                      <span style={{ fontSize: 10, opacity: 0.7 }}>(动态)</span>
                      <X
                        size={10}
                        className="de-pill-close"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeDynamicMetric(dm.id);
                        }}
                      />
                    </div>
                  </div>
                ))}
                {metrics.length === 0 && dynamicMetrics.length === 0 && (
                  <span
                    style={{
                      fontSize: 13,
                      color: 'var(--dae-ink-subtle)',
                      marginTop: 5,
                    }}
                  >
                    请从左侧选择指标
                  </span>
                )}
              </div>
            </div>

            {/* Data limit row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--dae-ink)',
                  width: 48,
                  flexShrink: 0,
                }}
              >
                数据限制
              </div>
              <button
                className="de-pill de-pill-limit"
                onClick={() => setLimitDrawerOpen(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <Filter size={10} />
                <span>数据限制</span>
                {dataLimitConditions.length > 0 && (
                  <span style={{
                    background: 'var(--dae-primary)',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 600,
                    padding: '0 5px',
                    borderRadius: 8,
                    lineHeight: '14px',
                  }}>
                    {dataLimitConditions.length}
                  </span>
                )}
              </button>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button
                  className="dae-btn dae-btn-secondary dae-btn-sm"
                  onClick={clearAll}
                >
                  <RotateCcw size={12} />
                  重置
                </button>
                <button
                  className="dae-btn dae-btn-primary dae-btn-sm"
                  onClick={handleQuery}
                  disabled={dimensions.length === 0 || metrics.length === 0}
                >
                  <Search size={12} />
                  查询
                </button>
              </div>
            </div>
          </div>

          {/* Preview area */}
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              padding: 16,
            }}
            className="dae-scroll"
          >
            {showChart ? (
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--dae-ink)',
                    marginBottom: 12,
                  }}
                >
                  {chartName || (isEditMode ? editingChart?.name : '销售统计') || '销售统计'}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 12,
                    marginBottom: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  {dynamicMetrics.map((dm) => (
                    <div key={dm.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>{dm.alias}</span>
                      {dm.displayMode === 'dropdown' ? (
                        <select
                          className="dae-input"
                          style={{ width: 120, fontSize: 12, padding: '4px 8px' }}
                          value={dm.activeField || dm.fields[0] || ''}
                          onChange={(e) => updateDynamicMetric(dm.id, { activeField: e.target.value })}
                        >
                          {dm.fields.map((f) => {
                            const field = metrics.find((m) => m.name === f || m.alias === f);
                            return <option key={f} value={f}>{field?.alias || f}</option>;
                          })}
                        </select>
                      ) : (
                        <div style={{ display: 'flex', gap: 4 }}>
                          {dm.fields.map((f) => {
                            const field = metrics.find((m) => m.name === f || m.alias === f);
                            const isActive = dm.activeField === f || (dm.activeField == null && dm.fields[0] === f);
                            return (
                              <button
                                key={f}
                                className={`de-pill ${isActive ? 'de-pill-metric' : ''}`}
                                style={{ fontSize: 11, padding: '2px 8px', cursor: 'pointer', opacity: isActive ? 1 : 0.6, background: isActive ? undefined : '#f1f5f9', color: isActive ? undefined : '#64748b', borderColor: isActive ? undefined : '#e2e8f0' }}
                                onClick={() => updateDynamicMetric(dm.id, { activeField: f })}
                              >
                                {field?.alias || f}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                  {dynamicDimensions.map((dd) => (
                    <div key={dd.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>{dd.alias}</span>
                      {dd.displayMode === 'dropdown' ? (
                        <select
                          className="dae-input"
                          style={{ width: 120, fontSize: 12, padding: '4px 8px' }}
                          value={dd.activeField || dd.fields[0] || ''}
                          onChange={(e) => updateDynamicDimension(dd.id, { activeField: e.target.value })}
                        >
                          {dd.fields.map((f) => {
                            const field = dimensions.find((d) => d.name === f || d.alias === f);
                            return <option key={f} value={f}>{field?.alias || f}</option>;
                          })}
                        </select>
                      ) : (
                        <div style={{ display: 'flex', gap: 4 }}>
                          {dd.fields.map((f) => {
                            const field = dimensions.find((d) => d.name === f || d.alias === f);
                            const isActive = dd.activeField === f || (dd.activeField == null && dd.fields[0] === f);
                            return (
                              <button
                                key={f}
                                className={`de-pill ${isActive ? 'de-pill-dim' : ''}`}
                                style={{ fontSize: 11, padding: '2px 8px', cursor: 'pointer', opacity: isActive ? 1 : 0.6, background: isActive ? undefined : '#f1f5f9', color: isActive ? undefined : '#64748b', borderColor: isActive ? undefined : '#e2e8f0' }}
                                onClick={() => updateDynamicDimension(dd.id, { activeField: f })}
                              >
                                {field?.alias || f}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}

                </div>
                {chartType === 'table' ? (
                  <div className="dae-scroll" style={{ overflow: 'auto' }}>
                    <table className="dae-table">
                      <thead>
                        <tr>
                          <th>序号</th>
                          {dimensions.map((d) => (
                            <th key={d.name}>{d.alias || d.name}</th>
                          ))}
                          {metrics.map((m) => (
                            <th key={m.name}>
                              {m.alias || m.name} ({m.aggregation})
                            </th>
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
                  <ChartRenderer
                    type={chartType}
                    data={chartData}
                    yKeys={chartType === 'pie' ? undefined : ['value', 'value2']}
                    height={360}
                  />
                )}
              </div>
            ) : (
              <div className="dae-empty" style={{ minHeight: 320 }}>
                <BarChart3 size={48} />
                <p>选择数据集、维度和指标后点击「查询」生成图表</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Drawer
        open={saveOpen}
        title={isEditMode ? '更新图表' : '保存图表'}
        onClose={() => setSaveOpen(false)}
        footer={
          <>
            <button
              className="dae-btn dae-btn-secondary"
              onClick={() => setSaveOpen(false)}
            >
              取消
            </button>
            <button
              className="dae-btn dae-btn-primary"
              onClick={() => setSaveOpen(false)}
            >
              {isEditMode ? '更新' : '保存'}
            </button>
          </>
        }
      >
        <div className="dae-form-group">
          <label>图表名称</label>
          <input
            className="dae-input"
            placeholder="请输入图表名称"
            value={chartName}
            onChange={(e) => setChartName(e.target.value)}
          />
        </div>
        <div className="dae-form-group">
          <label>所属数据集</label>
          <input className="dae-input" disabled value={selectedDataset} />
        </div>
        <div style={{ paddingTop: 16, borderTop: '1px solid var(--dae-border)' }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={16} style={{ color: 'var(--dae-primary)' }} />
            权限设置
          </h4>
          <UserPermSelect label="查看权限" selected={viewPerm} onChange={setViewPerm} />
          <UserPermSelect label="管理权限" selected={managePerm} onChange={setManagePerm} />
        </div>
      </Drawer>

      {/* 数据限制配置 Drawer */}
      <Drawer
        open={limitDrawerOpen}
        title="数据限制配置"
        onClose={() => setLimitDrawerOpen(false)}
        footer={
          <>
            <button className="dae-btn dae-btn-secondary" onClick={() => setLimitDrawerOpen(false)}>
              取消
            </button>
            <button className="dae-btn dae-btn-primary" onClick={() => setLimitDrawerOpen(false)}>
              确定
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {dataLimitConditions.length === 0 && (
            <div style={{ fontSize: 13, color: 'var(--dae-ink-muted)', padding: '12px 0' }}>
              暂无限制条件，点击「添加条件」配置
            </div>
          )}
          {dataLimitConditions.map((condition, index) => (
            <div key={index} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {index > 0 && (
                <select
                  className="dae-input"
                  style={{ width: 70, fontWeight: 600, color: 'var(--dae-primary)', fontSize: 12, padding: '4px 6px' }}
                  value={condition.logic}
                  onChange={(e) => updateLimitCondition(index, 'logic', e.target.value)}
                >
                  <option value="and">且</option>
                  <option value="or">或</option>
                </select>
              )}
              <select
                className="dae-input"
                style={{ width: 160, fontSize: 12, padding: '4px 6px' }}
                value={`${condition.fieldType}:${condition.field}`}
                onChange={(e) => {
                  const [type, ...nameParts] = e.target.value.split(':');
                  const name = nameParts.join(':');
                  updateLimitCondition(index, 'fieldType', type);
                  updateLimitCondition(index, 'field', name);
                }}
              >
                <option value="">选择字段...</option>
                <optgroup label="维度">
                  {dimensions.map((d) => (
                    <option key={d.name} value={`dimension:${d.alias || d.name}`}>{d.alias || d.name}</option>
                  ))}
                </optgroup>
                <optgroup label="指标">
                  {metrics.map((m) => (
                    <option key={m.name} value={`metric:${m.alias || m.name}`}>{m.alias || m.name}</option>
                  ))}
                </optgroup>
              </select>
              <select
                className="dae-input"
                style={{ width: 100, fontSize: 12, padding: '4px 6px' }}
                value={condition.operator}
                onChange={(e) => updateLimitCondition(index, 'operator', e.target.value)}
              >
                <option>等于</option>
                <option>不等于</option>
                <option>大于</option>
                <option>小于</option>
                <option>大于等于</option>
                <option>小于等于</option>
                <option>包含</option>
                <option>不包含</option>
              </select>
              <input
                className="dae-input"
                style={{ flex: 1, minWidth: 80, fontSize: 12, padding: '4px 8px' }}
                placeholder="输入值"
                value={condition.value}
                onChange={(e) => updateLimitCondition(index, 'value', e.target.value)}
              />
              <button
                className="dae-btn dae-btn-danger dae-btn-sm"
                onClick={() => removeLimitCondition(index)}
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            className="dae-btn dae-btn-secondary dae-btn-sm"
            onClick={addLimitCondition}
            style={{ alignSelf: 'flex-start', marginTop: 4 }}
          >
            <Plus size={14} />
            添加条件
          </button>
        </div>
      </Drawer>

      {/* 动态维度设置 Drawer */}
      <Drawer
        open={dynDimDrawerOpen}
        title="添加动态维度"
        onClose={() => setDynDimDrawerOpen(false)}
        footer={
          <>
            <button className="dae-btn dae-btn-secondary" onClick={() => setDynDimDrawerOpen(false)}>
              取消
            </button>
            <button
              className="dae-btn dae-btn-primary"
              onClick={() => {
                if (dynDimForm.alias && dynDimForm.fields && dynDimForm.fields.length > 0) {
                  setDynamicDimensions((prev) => [
                    ...prev,
                    {
                      id: 'dyn-dim-' + Date.now(),
                      alias: dynDimForm.alias,
                      fields: dynDimForm.fields,
                      displayMode: dynDimForm.displayMode || 'dropdown',
                      activeField: dynDimForm.fields[0],
                    },
                  ]);
                  setDynDimDrawerOpen(false);
                  setDynDimForm({ alias: '', fields: [], displayMode: 'dropdown' });
                }
              }}
            >
              确定
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="dae-form-group" style={{ marginBottom: 0 }}>
            <label>动态维度别名</label>
            <input
              className="dae-input"
              placeholder="如：地理维度"
              value={dynDimForm.alias || ''}
              onChange={(e) => setDynDimForm((prev) => ({ ...prev, alias: e.target.value }))}
            />
          </div>
          <div className="dae-form-group" style={{ marginBottom: 0 }}>
            <label>选择维度字段</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
              {dimensionList.map((f) => (
                <label
                  key={f.name}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--dae-ink-secondary)', cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={(dynDimForm.fields || []).includes(f.name)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setDynDimForm((prev) => ({
                        ...prev,
                        fields: checked
                          ? [...(prev.fields || []), f.name]
                          : (prev.fields || []).filter((name) => name !== f.name),
                      }));
                    }}
                  />
                  {f.name}
                </label>
              ))}
            </div>
          </div>
          <div className="dae-form-group" style={{ marginBottom: 0 }}>
            <label>展示形式</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              {([
                { key: 'dropdown', label: '下拉选择' },
                { key: 'flat', label: '平铺展示' },
              ] as const).map((opt) => (
                <button
                  key={opt.key}
                  className={`de-mid-chart-btn ${dynDimForm.displayMode === opt.key ? 'active' : ''}`}
                  style={{ height: 32, flex: 1, fontSize: 13 }}
                  onClick={() => setDynDimForm((prev) => ({ ...prev, displayMode: opt.key }))}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Drawer>

      {/* 动态指标设置 Drawer */}
      <Drawer
        open={dynMetDrawerOpen}
        title="添加动态指标"
        onClose={() => setDynMetDrawerOpen(false)}
        footer={
          <>
            <button className="dae-btn dae-btn-secondary" onClick={() => setDynMetDrawerOpen(false)}>
              取消
            </button>
            <button
              className="dae-btn dae-btn-primary"
              onClick={() => {
                if (dynMetForm.alias && dynMetForm.fields && dynMetForm.fields.length > 0) {
                  setDynamicMetrics((prev) => [
                    ...prev,
                    {
                      id: 'dyn-met-' + Date.now(),
                      alias: dynMetForm.alias,
                      fields: dynMetForm.fields,
                      displayMode: dynMetForm.displayMode || 'dropdown',
                      activeField: dynMetForm.fields[0],
                    },
                  ]);
                  setDynMetDrawerOpen(false);
                  setDynMetForm({ alias: '', fields: [], displayMode: 'dropdown' });
                }
              }}
            >
              确定
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="dae-form-group" style={{ marginBottom: 0 }}>
            <label>动态指标别名</label>
            <input
              className="dae-input"
              placeholder="如：核心指标"
              value={dynMetForm.alias || ''}
              onChange={(e) => setDynMetForm((prev) => ({ ...prev, alias: e.target.value }))}
            />
          </div>
          <div className="dae-form-group" style={{ marginBottom: 0 }}>
            <label>选择指标字段</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
              {metricList.map((f) => (
                <label
                  key={f.name}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--dae-ink-secondary)', cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={(dynMetForm.fields || []).includes(f.name)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setDynMetForm((prev) => ({
                        ...prev,
                        fields: checked
                          ? [...(prev.fields || []), f.name]
                          : (prev.fields || []).filter((name) => name !== f.name),
                      }));
                    }}
                  />
                  {f.name}
                </label>
              ))}
            </div>
          </div>
          <div className="dae-form-group" style={{ marginBottom: 0 }}>
            <label>展示形式</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              {([
                { key: 'dropdown', label: '下拉选择' },
                { key: 'flat', label: '平铺展示' },
              ] as const).map((opt) => (
                <button
                  key={opt.key}
                  className={`de-mid-chart-btn ${dynMetForm.displayMode === opt.key ? 'active' : ''}`}
                  style={{ height: 32, flex: 1, fontSize: 13 }}
                  onClick={() => setDynMetForm((prev) => ({ ...prev, displayMode: opt.key }))}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
