import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
  Trash2,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Type,
  Hash,
  Eye,
  Filter,
  Undo2,
  Redo2,
  Text,
  Image,
  PanelsTopLeft,
  MoreHorizontal,
  Copy,
  Sparkles,
  Link2,
  RefreshCw,
  Bell,
  MousePointerClick,
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

/* ========== 通用折叠面板（支持开关） ========== */
function StyleCollapseItem({
  title,
  children,
  defaultOpen = false,
  enabled,
  onToggle,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  enabled: boolean;
  onToggle: (v: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid var(--dae-border)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          cursor: 'pointer',
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isOpen ? <ChevronUp size={14} style={{ color: 'var(--dae-ink-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--dae-ink-muted)' }} />}
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--dae-ink)' }}>{title}</span>
        </div>
        <span
          className={`de-toggle ${enabled ? 'on' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(!enabled);
          }}
        />
      </div>
      {isOpen && <div style={{ padding: '0 14px 12px' }}>{children}</div>}
    </div>
  );
}

/* ========== 数据过滤弹窗 ========== */
function FilterModal({
  open,
  onClose,
  dimensions,
  metrics,
  conditions,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  dimensions: SelectedField[];
  metrics: SelectedField[];
  conditions: { field: string; operator: string; value: string; logic: 'and' | 'or' }[];
  onChange: (v: { field: string; operator: string; value: string; logic: 'and' | 'or' }[]) => void;
}) {
  if (!open) return null;
  const allFields = [...dimensions, ...metrics];
  return (
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
      onClick={onClose}
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
          <button className="dae-btn dae-btn-secondary dae-btn-sm" onClick={onClose}>
            <X size={14} />
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '16px 18px' }} className="dae-scroll">
          {conditions.length === 0 && (
            <div style={{ fontSize: 13, color: 'var(--dae-ink-muted)', marginBottom: 12 }}>暂无过滤条件，点击下方按钮添加</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {conditions.map((cond, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', padding: 10, borderRadius: 'var(--dae-radius-md)' }}>
                {idx > 0 && (
                  <select
                    className="dae-input"
                    style={{ width: 60, fontSize: 12 }}
                    value={cond.logic}
                    onChange={(e) => {
                      const updated = [...conditions];
                      updated[idx].logic = e.target.value as 'and' | 'or';
                      onChange(updated);
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
                    const updated = [...conditions];
                    updated[idx].field = e.target.value;
                    onChange(updated);
                  }}
                >
                  <option value="">选择字段</option>
                  {allFields.map((f) => (
                    <option key={f.name} value={f.alias || f.name}>{f.alias || f.name}</option>
                  ))}
                </select>
                <select
                  className="dae-input"
                  style={{ width: 100, fontSize: 12 }}
                  value={cond.operator}
                  onChange={(e) => {
                    const updated = [...conditions];
                    updated[idx].operator = e.target.value;
                    onChange(updated);
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
                    const updated = [...conditions];
                    updated[idx].value = e.target.value;
                    onChange(updated);
                  }}
                />
                <button
                  className="dae-btn dae-btn-secondary dae-btn-sm"
                  style={{ color: '#ef4444' }}
                  onClick={() => onChange(conditions.filter((_, i) => i !== idx))}
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
              onChange([
                ...conditions,
                { field: allFields[0]?.alias || allFields[0]?.name || '', operator: '等于', value: '', logic: 'and' },
              ])
            }
          >
            <Plus size={12} />
            添加条件
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '12px 18px', borderTop: '1px solid var(--dae-border)' }}>
          <button className="dae-btn dae-btn-secondary" onClick={onClose}>取消</button>
          <button className="dae-btn dae-btn-primary" onClick={onClose}>确定</button>
        </div>
      </div>
    </div>
  );
}

/* ========== 条件样式弹窗 ========== */
function ConditionalStyleModal({
  open,
  onClose,
  conditions,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  conditions: { field: string; operator: string; value: string; textColor: string; bgColor: string }[];
  onChange: (v: { field: string; operator: string; value: string; textColor: string; bgColor: string }[]) => void;
}) {
  if (!open) return null;
  return (
    <div
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 'var(--dae-radius-lg)', width: 480, maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--dae-border)' }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>条件样式</span>
          <button className="dae-btn dae-btn-secondary dae-btn-sm" onClick={onClose}><X size={14} /></button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '16px 18px' }} className="dae-scroll">
          {conditions.length === 0 && <div style={{ fontSize: 13, color: 'var(--dae-ink-muted)', marginBottom: 12 }}>暂无规则，点击下方按钮添加</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {conditions.map((cond, idx) => (
              <div key={idx} style={{ background: '#f8fafc', padding: 10, borderRadius: 'var(--dae-radius-md)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input className="dae-input" style={{ flex: 1, fontSize: 12 }} placeholder="字段名" value={cond.field} onChange={(e) => { const u = [...conditions]; u[idx].field = e.target.value; onChange(u); }} />
                  <select className="dae-input" style={{ width: 90, fontSize: 12 }} value={cond.operator} onChange={(e) => { const u = [...conditions]; u[idx].operator = e.target.value; onChange(u); }}>
                    <option value="等于">等于</option>
                    <option value="大于">大于</option>
                    <option value="小于">小于</option>
                    <option value="大于等于">大于等于</option>
                    <option value="小于等于">小于等于</option>
                  </select>
                  <input className="dae-input" style={{ flex: 1, fontSize: 12 }} placeholder="值" value={cond.value} onChange={(e) => { const u = [...conditions]; u[idx].value = e.target.value; onChange(u); }} />
                  <button className="dae-btn dae-btn-secondary dae-btn-sm" style={{ color: '#ef4444' }} onClick={() => onChange(conditions.filter((_, i) => i !== idx))}><X size={14} /></button>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                    <span style={{ fontSize: 11 }}>文字色</span>
                    <input type="color" value={cond.textColor} onChange={(e) => { const u = [...conditions]; u[idx].textColor = e.target.value; onChange(u); }} style={{ width: 24, height: 24, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 1, cursor: 'pointer' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                    <span style={{ fontSize: 11 }}>背景色</span>
                    <input type="color" value={cond.bgColor} onChange={(e) => { const u = [...conditions]; u[idx].bgColor = e.target.value; onChange(u); }} style={{ width: 24, height: 24, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 1, cursor: 'pointer' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="dae-btn dae-btn-secondary dae-btn-sm" style={{ marginTop: 12 }} onClick={() => onChange([...conditions, { field: '', operator: '大于', value: '', textColor: '#ef4444', bgColor: '#fef2f2' }])}>
            <Plus size={12} /> 添加规则
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '12px 18px', borderTop: '1px solid var(--dae-border)' }}>
          <button className="dae-btn dae-btn-secondary" onClick={onClose}>取消</button>
          <button className="dae-btn dae-btn-primary" onClick={onClose}>确定</button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardConfigPage() {
  const hashParams = useHashParams();
  const dashboardId = hashParams['dashboardId'];
  const dashboard = dashboardId ? dashboards.find((d) => d.id === dashboardId) : undefined;

  const [chartList, setChartList] = useState<DashboardChart[]>(() => {
    const list = dashboard?.charts || [];
    const cols = 3;
    const cardW = 376;
    const cardH = 280;
    const gap = 16;
    return list.map((c, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      return {
        ...c,
        x: typeof c.x === 'number' ? c.x : col * (cardW + gap),
        y: typeof c.y === 'number' ? c.y : row * (cardH + gap),
        w: c.w || cardW,
        h: c.h || cardH,
      };
    });
  });
  const [dashboardName, setDashboardName] = useState(dashboard?.name || '新建仪表盘');
  const [editingChartId, setEditingChartId] = useState<string | null>(null);

  /* ===== 图表数据配置状态 ===== */
  const [selectedDataset, setSelectedDataset] = useState('订单明细数据集');
  const [dimensions, setDimensions] = useState<SelectedField[]>([]);
  const [metrics, setMetrics] = useState<SelectedField[]>([]);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [showChart, setShowChart] = useState(false);
  const [chartName, setChartName] = useState('');
  const [searchField, setSearchField] = useState('');
  const [openConfig, setOpenConfig] = useState<string | null>(null);
  const [filterConditions, setFilterConditions] = useState<{ field: string; operator: string; value: string; logic: 'and' | 'or' }[]>([]);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  /* ===== 配置面板 Tab ===== */
  const [activeConfigTab, setActiveConfigTab] = useState<'data' | 'style' | 'advanced'>('data');

  /* ===== 样式配置开关 ===== */
  const [styleSwitches, setStyleSwitches] = useState({
    title: true,
    background: true,
    border: true,
    tooltip: true,
    tableHeader: true,
    cell: true,
    total: true,
    funcSettings: true,
    scroll: true,
    conditional: true,
  });

  /* ===== 样式具体值 ===== */
  const [titleSettings, setTitleSettings] = useState({ content: '', fontSize: '14', fontWeight: '600', color: '#0f172a', align: 'left' as 'left' | 'center' | 'right', visible: true, marginBottom: '12' });
  const [chartPalette, setChartPalette] = useState('#3b82f6');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [bgSettings, setBgSettings] = useState({ color: '#ffffff', padding: '12', radius: '8', shadow: '0 1px 3px rgba(0,0,0,0.08)', gradientEnabled: false, gradientFrom: '#ffffff', gradientTo: '#f8fafc' });
  const [borderSettings, setBorderSettings] = useState({ width: '1', style: 'solid' as 'solid' | 'dashed' | 'dotted', color: '#e2e8f0', radius: '8' });
  const [tooltipSettings, setTooltipSettings] = useState({ trigger: 'hover' as 'hover' | 'click', bgColor: '#0f172a', textColor: '#ffffff', borderColor: '#334155', borderWidth: '0', borderRadius: '4' });
  const [headerSettings, setHeaderSettings] = useState({ bgColor: '#f8fafc', textColor: '#334155', fontSize: '13', fontWeight: '500', align: 'left' as 'left' | 'center' | 'right', height: '40' });
  const [cellSettings, setCellSettings] = useState({ fontSize: '12', padding: '8', textColor: '#334155', align: 'left' as 'left' | 'center' | 'right', lineHeight: '1.5' });
  const [totalSettings, setTotalSettings] = useState({ position: 'bottom' as 'top' | 'bottom', label: '合计', fontSize: '13', fontWeight: '600', bgColor: '#f8fafc', textColor: '#0f172a' });
  const [scrollSettings, setScrollSettings] = useState({ x: true, y: true, maxHeight: '400', autoScroll: false, scrollInterval: '3', scrollbarVisible: true });
  const [funcSettings, setFuncSettings] = useState({ exportExcel: true, drillDown: false, showLegend: true, showDataLabel: false, enableLinkage: false, enableJump: false });

  /* ===== 条件样式 ===== */
  const [conditionalConditions, setConditionalConditions] = useState<{ field: string; operator: string; value: string; textColor: string; bgColor: string }[]>([]);
  const [conditionalModalOpen, setConditionalModalOpen] = useState(false);

  /* ===== 高级配置 ===== */
  const [linkageEnabled, setLinkageEnabled] = useState(false);
  const [linkageTargets, setLinkageTargets] = useState<string[]>([]);
  const [jumpEnabled, setJumpEnabled] = useState(false);
  const [jumpUrl, setJumpUrl] = useState('');
  const [refreshEnabled, setRefreshEnabled] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState('60');
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [alertRules, setAlertRules] = useState<{ metric: string; operator: string; threshold: string }[]>([]);

  const toggleStyle = (key: keyof typeof styleSwitches) => {
    setStyleSwitches((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const packChart = useCallback((): DashboardChart | null => {
    if (!editingChartId) return null;
    const existing = chartList.find((c) => c.id === editingChartId);
    return {
      id: editingChartId,
      name: chartName || '未命名图表',
      type: chartType,
      datasetName: selectedDataset,
      dimensions: dimensions.filter((d) => d.visible !== false).map((d) => d.name),
      metrics: metrics.filter((m) => m.visible !== false).map((m) => m.name),
      x: existing?.x,
      y: existing?.y,
      w: existing?.w || 376,
      h: existing?.h || 280,
    };
  }, [editingChartId, chartName, chartType, selectedDataset, dimensions, metrics, chartList]);

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
    setFilterConditions([]);
    setTitleSettings({ content: chart.name || '', fontSize: '14', fontWeight: '600', color: '#0f172a', align: 'left', visible: true, marginBottom: '12' });
    setChartPalette('#3b82f6');
    setThemeMode('light');
    setActiveConfigTab('data');
  }, []);

  const selectChart = (chart: DashboardChart) => {
    if (editingChartId && editingChartId !== chart.id) {
      const packed = packChart();
      if (packed) setChartList((prev) => prev.map((c) => (c.id === editingChartId ? packed : c)));
    }
    setEditingChartId(chart.id);
    loadChart(chart);
    setOpenConfig(null);
  };

  const deselectChart = () => {
    const packed = packChart();
    if (packed) setChartList((prev) => prev.map((c) => (c.id === editingChartId ? packed : c)));
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

  const removeDimension = (name: string) => setDimensions((prev) => prev.filter((d) => d.name !== name));
  const removeMetric = (name: string) => setMetrics((prev) => prev.filter((m) => m.name !== name));
  const updateDimension = (name: string, updates: Partial<SelectedField>) => setDimensions((prev) => prev.map((d) => (d.name === name ? { ...d, ...updates } : d)));
  const updateMetric = (name: string, updates: Partial<SelectedField>) => setMetrics((prev) => prev.map((m) => (m.name === name ? { ...m, ...updates } : m)));

  const clearAll = () => {
    setDimensions([]);
    setMetrics([]);
    setShowChart(false);
    setOpenConfig(null);
    setFilterConditions([]);
  };

  const addChart = () => {
    const idx = chartList.length;
    const cols = 3;
    const cardW = 376;
    const cardH = 280;
    const gap = 16;
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const newChart: DashboardChart = {
      id: generateId(),
      name: '新图表 ' + (idx + 1),
      type: 'bar',
      datasetName: '订单明细数据集',
      dimensions: [],
      metrics: [],
      x: col * (cardW + gap),
      y: row * (cardH + gap),
      w: cardW,
      h: cardH,
    };
    setChartList((prev) => [...prev, newChart]);
    setTimeout(() => selectChart(newChart), 0);
  };

  const removeChart = (chartId: string) => {
    setChartList((prev) => prev.filter((c) => c.id !== chartId));
    if (editingChartId === chartId) setEditingChartId(null);
  };

  const handleSaveDashboard = () => {
    if (editingChartId) {
      const packed = packChart();
      if (packed) setChartList((prev) => prev.map((c) => (c.id === editingChartId ? packed : c)));
    }
    alert('仪表盘保存成功（演示模式）');
  };

  const goBack = () => {
    window.location.hash = 'page=dashboard';
  };

  const goPreview = () => {
    window.location.hash = `page=dashboard-preview&dashboardId=${dashboardId || dashboards[0]?.id || ''}`;
  };

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

  /* ===== 组件大小/位置：自由画布拖拽 ===== */
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<null | { mode: 'move' | 'resize'; id: string; startX: number; startY: number; startChartX: number; startChartY: number; startW: number; startH: number }>(null);
  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 800;

  const updateChart = useCallback((id: string, patch: Partial<DashboardChart>) => {
    setChartList((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const onDragMove = useCallback((e: MouseEvent) => {
    const d = dragRef.current;
    if (!d || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    if (d.mode === 'move') {
      const dx = (e.clientX - d.startX) * scaleX;
      const dy = (e.clientY - d.startY) * scaleY;
      const nx = Math.max(0, Math.min(d.startChartX + dx, CANVAS_WIDTH - (d.startW || 200)));
      const ny = Math.max(0, Math.min(d.startChartY + dy, CANVAS_HEIGHT - (d.startH || 160)));
      setChartList((prev) => prev.map((c) => (c.id === d.id ? { ...c, x: nx, y: ny } : c)));
    } else {
      const dw = (e.clientX - d.startX) * scaleX;
      const dh = (e.clientY - d.startY) * scaleY;
      const nw = Math.max(200, d.startW + dw);
      const nh = Math.max(160, d.startH + dh);
      setChartList((prev) => prev.map((c) => (c.id === d.id ? { ...c, w: nw, h: nh } : c)));
    }
  }, []);

  const onDragEnd = useCallback(() => {
    dragRef.current = null;
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
  }, [onDragMove]);

  const startMove = (e: React.MouseEvent, chart: DashboardChart) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { mode: 'move', id: chart.id, startX: e.clientX, startY: e.clientY, startChartX: chart.x || 0, startChartY: chart.y || 0, startW: chart.w || 376, startH: chart.h || 280 };
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
  };

  const startResize = (e: React.MouseEvent, chart: DashboardChart) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { mode: 'resize', id: chart.id, startX: e.clientX, startY: e.clientY, startChartX: chart.x || 0, startChartY: chart.y || 0, startW: chart.w || 376, startH: chart.h || 280 };
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
  };

  /* ===== 工具栏组件按钮 ===== */
  const toolbarItems = [
    { icon: BarChart3, label: '图表' },
    { icon: Filter, label: '查询组件' },
    { icon: Text, label: '富文本' },
    { icon: Image, label: '媒体' },
    { icon: PanelsTopLeft, label: 'Tab' },
    { icon: MoreHorizontal, label: '更多' },
    { icon: Copy, label: '复用' },
    { icon: Sparkles, label: '智能解读' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f5f7fa' }}>
      {/* ========== 顶部工具栏 ========== */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          background: '#fff',
          borderBottom: '1px solid var(--dae-border)',
          flexShrink: 0,
        }}
      >
        {/* 左侧：返回 + 名称 + 撤销/重做 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <button
            onClick={goBack}
            title="返回"
            style={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              background: '#fff',
              cursor: 'pointer',
              color: 'var(--dae-ink)',
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <input
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
            style={{
              width: 180,
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--dae-ink)',
              border: 'none',
              background: 'transparent',
              padding: 0,
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              title="撤销"
              style={{
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #d9d9d9',
                borderRadius: 4,
                background: '#fff',
                cursor: 'pointer',
                color: 'var(--dae-ink-secondary)',
              }}
            >
              <Undo2 size={14} />
            </button>
            <button
              title="重做"
              style={{
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #d9d9d9',
                borderRadius: 4,
                background: '#fff',
                cursor: 'pointer',
                color: 'var(--dae-ink-secondary)',
              }}
            >
              <Redo2 size={14} />
            </button>
          </div>
        </div>

        {/* 中间：组件工具栏 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center', minWidth: 0, overflow: 'hidden' }}>
          {toolbarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={item.label === '图表' ? addChart : undefined}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  width: 56,
                  height: 52,
                  border: '1px solid #d9d9d9',
                  borderRadius: 4,
                  background: '#fff',
                  cursor: 'pointer',
                  color: 'var(--dae-ink)',
                }}
              >
                <Icon size={16} />
                <span style={{ fontSize: 11 }}>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* 右侧：预览/保存 */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
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

      {/* ========== 主体区域 ========== */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* ---------- 画布 ---------- */}
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }} className="dae-scroll">
          {chartList.length === 0 ? (
            <div className="dae-empty" style={{ minHeight: 320, background: 'transparent' }}>
              <LayoutGrid size={48} />
              <p>画布为空，点击上方「图表」按钮开始搭建仪表盘</p>
              <button className="dae-btn dae-btn-primary" onClick={addChart}>
                <Plus size={16} />
                添加图表
              </button>
            </div>
          ) : (
            <div
              ref={canvasRef}
              style={{
                position: 'relative',
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                background: '#fff',
                border: '1px dashed var(--dae-border)',
                borderRadius: 'var(--dae-radius-lg)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              {chartList.map((chart) => {
                const isEditing = editingChartId === chart.id;
                return (
                  <div
                    key={chart.id}
                    onClick={() => selectChart(chart)}
                    className={`de-chart-card ${isEditing ? 'de-chart-selected' : ''}`}
                    style={{
                      position: 'absolute',
                      left: chart.x || 0,
                      top: chart.y || 0,
                      width: chart.w || 376,
                      height: chart.h || 280,
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
                    <div
                      onMouseDown={(e) => startMove(e, chart)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderBottom: '1px solid var(--dae-border)',
                        background: isEditing ? 'rgba(59,130,246,0.04)' : '#fff',
                        cursor: isEditing ? 'move' : 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BarChart3 size={16} style={{ color: 'var(--dae-primary)' }} />
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--dae-ink)' }}>{chart.name}</span>
                        <span style={{ fontSize: 11, color: 'var(--dae-ink-muted)', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                          {chartTypeOptions.find((t) => t.key === chart.type)?.label || chart.type}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button
                          className="dae-icon-action de-chart-delete"
                          onClick={(e) => { e.stopPropagation(); removeChart(chart.id); }}
                          onMouseDown={(e) => e.stopPropagation()}
                          title="删除"
                          style={{ color: '#ef4444', width: 24, height: 24 }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <div style={{ flex: 1, padding: 14, minHeight: 0 }}>
                      {(() => {
                        const isCurrentEditing = isEditing;
                        const dims = isCurrentEditing ? dimensions : chart.dimensions;
                        const mets = isCurrentEditing ? metrics : chart.metrics;
                        const cType = isCurrentEditing ? chartType : chart.type;
                        return dims.length > 0 && mets.length > 0 ? (
                        cType === 'table' ? (
                          <div className="dae-scroll" style={{ overflow: 'auto' }}>
                            <table className="dae-table">
                              <thead>
                                <tr><th>序号</th>{dims.map((d: string | SelectedField, i: number) => (<th key={i}>{typeof d === 'string' ? d : d.alias || d.name}</th>))}{mets.map((m: string | SelectedField, i: number) => (<th key={i}>{typeof m === 'string' ? m : m.alias || m.name}</th>))}</tr>
                              </thead>
                              <tbody>
                                {chartSampleData.map((row, idx) => (
                                  <tr key={idx}>
                                    <td>{idx + 1}</td>
                                    {dims.map((d: string | SelectedField, i: number) => (<td key={i}>{row.name}</td>))}
                                    {mets.map((m: string | SelectedField, i: number) => (<td key={i}>{row.value}</td>))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <ChartRenderer type={cType} data={cType === 'pie' ? pieSampleData : chartSampleData} yKeys={cType === 'pie' ? undefined : ['value', 'value2']} height={Math.max(120, (chart.h || 280) - 90)} />
                        )
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--dae-ink-muted)', gap: 8 }}>
                          <BarChart3 size={32} />
                          <span style={{ fontSize: 13 }}>未配置数据，点击卡片选中后配置</span>
                        </div>
                      );
                      })()}
                    </div>
                    {isEditing && (
                      <div
                        onMouseDown={(e) => startResize(e, chart)}
                        title="拖动调整大小"
                        style={{
                          position: 'absolute',
                          right: 2,
                          bottom: 2,
                          width: 16,
                          height: 16,
                          cursor: 'nwse-resize',
                          borderRadius: '0 0 6px 0',
                          background:
                            'linear-gradient(135deg, transparent 50%, var(--dae-primary) 50%, var(--dae-primary) 70%, transparent 70%, transparent 80%, var(--dae-primary) 80%, var(--dae-primary) 90%, transparent 90%)',
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ---------- 图表配置面板 ---------- */}
        {editingChartId && editingChart && (
          <div
            style={{
              width: 300,
              flexShrink: 0,
              background: '#fff',
              borderLeft: '1px solid var(--dae-border)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* 面板标题 */}
            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--dae-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--dae-ink)' }}>
                {chartTypeOptions.find((t) => t.key === chartType)?.label || '图表'}
              </span>
              <button className="dae-icon-action" onClick={deselectChart} title="关闭">
                <X size={14} />
              </button>
            </div>

            {/* Tab 切换 */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--dae-border)' }}>
              {(['data', 'style', 'advanced'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveConfigTab(tab)}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    fontSize: 13,
                    fontWeight: activeConfigTab === tab ? 600 : 400,
                    color: activeConfigTab === tab ? 'var(--dae-primary)' : 'var(--dae-ink-secondary)',
                    border: 'none',
                    borderBottom: activeConfigTab === tab ? '2px solid var(--dae-primary)' : '2px solid transparent',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  {tab === 'data' ? '数据' : tab === 'style' ? '样式' : '高级'}
                </button>
              ))}
            </div>

            {/* 配置内容 */}
            <div style={{ flex: 1, overflow: 'auto' }} className="dae-scroll">
              {/* ===== 数据 Tab ===== */}
              {activeConfigTab === 'data' && (
                <div style={{ padding: '12px 14px' }}>
                  <div className="de-config-section">
                    <div className="dae-form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: 12 }}>图表名称</label>
                      <input className="dae-input" style={{ fontSize: 13 }} value={chartName} onChange={(e) => setChartName(e.target.value)} />
                    </div>
                  </div>

                  <div className="de-config-section">
                    <div className="dae-form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: 12 }}>图表类型</label>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {chartTypeOptions.map((t) => {
                          const Icon = t.icon;
                          return (
                            <button key={t.key} className={`de-mid-chart-btn ${chartType === t.key ? 'active' : ''}`} onClick={() => setChartType(t.key)} title={t.label} style={{ width: 44, height: 32 }}>
                              <Icon size={16} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 位置与尺寸 */}
                  <div className="de-config-section">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <label style={{ fontSize: 12, fontWeight: 600 }}>位置尺寸</label>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div className="dae-form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: 12 }}>X</label>
                        <input
                          className="dae-input"
                          type="number"
                          min={0}
                          style={{ fontSize: 13 }}
                          value={Math.round(editingChart.x || 0)}
                          onChange={(e) => updateChart(editingChart.id, { x: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                        />
                      </div>
                      <div className="dae-form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: 12 }}>Y</label>
                        <input
                          className="dae-input"
                          type="number"
                          min={0}
                          style={{ fontSize: 13 }}
                          value={Math.round(editingChart.y || 0)}
                          onChange={(e) => updateChart(editingChart.id, { y: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                        />
                      </div>
                      <div className="dae-form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: 12 }}>宽度</label>
                        <input
                          className="dae-input"
                          type="number"
                          min={200}
                          style={{ fontSize: 13 }}
                          value={Math.round(editingChart.w || 376)}
                          onChange={(e) => updateChart(editingChart.id, { w: Math.max(200, parseInt(e.target.value, 10) || 200) })}
                        />
                      </div>
                      <div className="dae-form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: 12 }}>高度</label>
                        <input
                          className="dae-input"
                          type="number"
                          min={160}
                          style={{ fontSize: 13 }}
                          value={Math.round(editingChart.h || 280)}
                          onChange={(e) => updateChart(editingChart.id, { h: Math.max(160, parseInt(e.target.value, 10) || 160) })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 维度 */}
                  <div className="de-config-section">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <label style={{ fontSize: 12, fontWeight: 600 }}>维度</label>
                      <span style={{ fontSize: 11, color: 'var(--dae-ink-muted)' }}>点击右侧字段添加</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 28 }}>
                      {dimensions.map((d) => (
                        <div key={d.name} style={{ position: 'relative' }}>
                          <div className="de-pill de-pill-dim" style={{ opacity: d.visible === false ? 0.5 : 1 }}>
                            <GripVertical size={10} className="de-pill-drag" />
                            <span>{d.alias || d.name}</span>
                            <Settings2 size={10} style={{ cursor: 'pointer', opacity: 0.6, marginLeft: 2 }} onClick={(e) => { e.stopPropagation(); setOpenConfig((prev) => (prev === `dim:${d.name}` ? null : `dim:${d.name}`)); }} />
                            <X size={10} className="de-pill-close" onClick={(e) => { e.stopPropagation(); removeDimension(d.name); }} />
                          </div>
                          {openConfig === `dim:${d.name}` && (
                            <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50, background: '#fff', border: '1px solid var(--dae-border)', borderRadius: 'var(--dae-radius-md)', padding: 10, width: 200, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                      {dimensions.length === 0 && <span style={{ fontSize: 12, color: 'var(--dae-ink-subtle)' }}>请从右侧选择维度</span>}
                    </div>
                  </div>

                  {/* 指标 */}
                  <div className="de-config-section">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <label style={{ fontSize: 12, fontWeight: 600 }}>指标</label>
                      <span style={{ fontSize: 11, color: 'var(--dae-ink-muted)' }}>点击右侧字段添加</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 28 }}>
                      {metrics.map((m) => (
                        <div key={m.name} style={{ position: 'relative' }}>
                          <div className="de-pill de-pill-metric" style={{ opacity: m.visible === false ? 0.5 : 1 }}>
                            <GripVertical size={10} className="de-pill-drag" />
                            <span>{m.alias || m.name}</span>
                            <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.8 }}>{m.aggregation}</span>
                            <Settings2 size={10} style={{ cursor: 'pointer', opacity: 0.6, marginLeft: 2 }} onClick={(e) => { e.stopPropagation(); setOpenConfig((prev) => (prev === `metric:${m.name}` ? null : `metric:${m.name}`)); }} />
                            <X size={10} className="de-pill-close" onClick={(e) => { e.stopPropagation(); removeMetric(m.name); }} />
                          </div>
                          {openConfig === `metric:${m.name}` && (
                            <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50, background: '#fff', border: '1px solid var(--dae-border)', borderRadius: 'var(--dae-radius-md)', padding: 10, width: 200, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <div style={{ fontSize: 12, fontWeight: 600 }}>{m.name}</div>
                              <div className="dae-form-group" style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: 11 }}>别名</label>
                                <input className="dae-input" style={{ fontSize: 12, padding: '4px 8px' }} value={m.alias || ''} onChange={(e) => updateMetric(m.name, { alias: e.target.value })} />
                              </div>
                              <div className="dae-form-group" style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: 11 }}>聚合</label>
                                <select className="dae-input" style={{ fontSize: 12, padding: '4px 8px' }} value={m.aggregation || 'SUM'} onChange={(e) => updateMetric(m.name, { aggregation: e.target.value })}>
                                  {aggOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {metrics.length === 0 && <span style={{ fontSize: 12, color: 'var(--dae-ink-subtle)' }}>请从右侧选择指标</span>}
                    </div>
                  </div>

                  {/* 数据过滤 */}
                  <div className="de-config-section">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <label style={{ fontSize: 12, fontWeight: 600 }}>数据过滤</label>
                      <button
                        onClick={() => setFilterModalOpen(true)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '2px 0',
                          fontSize: 12,
                          color: 'var(--dae-primary)',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 500,
                        }}
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

                  {/* 数据更新 */}
                  <div className="de-config-section">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <label style={{ fontSize: 12, fontWeight: 600 }}>数据更新</label>
                    </div>
                    <div className="dae-form-group" style={{ marginBottom: 10 }}>
                      <label style={{ fontSize: 12 }}>自动刷新间隔</label>
                      <select className="dae-input" style={{ fontSize: 13 }} value={refreshInterval} onChange={(e) => setRefreshInterval(e.target.value)}>
                        <option value="0">关闭</option>
                        <option value="30">30 秒</option>
                        <option value="60">1 分钟</option>
                        <option value="120">2 分钟</option>
                        <option value="300">5 分钟</option>
                        <option value="600">10 分钟</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ===== 样式 Tab ===== */}
              {activeConfigTab === 'style' && (
                <div>
                  {/* 基础样式（默认展开，无开关） */}
                  <div style={{ borderBottom: '1px solid var(--dae-border)' }}>
                    <div style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, color: 'var(--dae-ink)' }}>基础样式</div>
                    <div style={{ padding: '0 14px 12px' }}>
                      <div className="dae-form-group" style={{ marginBottom: 8 }}>
                        <label style={{ fontSize: 12 }}>图表色系</label>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'].map((c) => (
                            <div
                              key={c}
                              onClick={() => setChartPalette(c)}
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: 4,
                                background: c,
                                cursor: 'pointer',
                                border: chartPalette === c ? '2px solid var(--dae-ink)' : '2px solid transparent',
                                boxShadow: chartPalette === c ? '0 0 0 2px rgba(59,130,246,0.3)' : 'none',
                                transition: 'all 0.15s',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="dae-form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: 12 }}>主题模式</label>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {(['light', 'dark'] as const).map((mode) => (
                            <button key={mode} className={`de-mid-chart-btn ${themeMode === mode ? 'active' : ''}`} style={{ flex: 1, height: 28, fontSize: 12 }} onClick={() => setThemeMode(mode)}>
                              {mode === 'light' ? '浅色' : '深色'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 标题 */}
                  <StyleCollapseItem defaultOpen={true} title="标题" enabled={styleSwitches.title} onToggle={(v) => toggleStyle('title')}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>标题内容</label>
                        <input className="dae-input" style={{ fontSize: 13 }} value={titleSettings.content} onChange={(e) => setTitleSettings((s) => ({ ...s, content: e.target.value }))} placeholder="请输入标题" />
                      </div>
                      <div className="dae-form-group" style={{ marginBottom: 0, width: 70 }}>
                        <label style={{ fontSize: 12 }}>下边距</label>
                        <input className="dae-input" style={{ fontSize: 13 }} value={titleSettings.marginBottom} onChange={(e) => setTitleSettings((s) => ({ ...s, marginBottom: e.target.value }))} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>字体大小</label>
                        <select className="dae-input" style={{ fontSize: 13 }} value={titleSettings.fontSize} onChange={(e) => setTitleSettings((s) => ({ ...s, fontSize: e.target.value }))}>
                          {['12', '14', '16', '18', '20', '24'].map((s) => (<option key={s} value={s}>{s}px</option>))}
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
                    <div style={{ display: 'flex', gap: 8 }}>
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
                            <button key={a} className={`de-mid-chart-btn ${titleSettings.align === a ? 'active' : ''}`} style={{ flex: 1, height: 28, fontSize: 12 }} onClick={() => setTitleSettings((s) => ({ ...s, align: a }))}>
                              {a === 'left' ? '左' : a === 'center' ? '中' : '右'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </StyleCollapseItem>

                  {/* 背景 */}
                  <StyleCollapseItem defaultOpen={true} title="背景" enabled={styleSwitches.background} onToggle={(v) => toggleStyle('background')}>
                    <div className="dae-form-group" style={{ marginBottom: 8 }}>
                      <label style={{ fontSize: 12 }}>背景颜色</label>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input type="color" value={bgSettings.color} onChange={(e) => setBgSettings((s) => ({ ...s, color: e.target.value }))} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
                        <input className="dae-input" value={bgSettings.color} onChange={(e) => setBgSettings((s) => ({ ...s, color: e.target.value }))} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>内边距</label>
                        <input className="dae-input" style={{ fontSize: 13 }} value={bgSettings.padding} onChange={(e) => setBgSettings((s) => ({ ...s, padding: e.target.value }))} />
                      </div>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>圆角</label>
                        <input className="dae-input" style={{ fontSize: 13 }} value={bgSettings.radius} onChange={(e) => setBgSettings((s) => ({ ...s, radius: e.target.value }))} />
                      </div>
                    </div>
                    <div className="dae-form-group" style={{ marginBottom: 8 }}>
                      <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <input type="checkbox" checked={bgSettings.gradientEnabled} onChange={(e) => setBgSettings((s) => ({ ...s, gradientEnabled: e.target.checked }))} />
                        启用渐变色
                      </label>
                    </div>
                    {bgSettings.gradientEnabled && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                          <label style={{ fontSize: 12 }}>起始色</label>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input type="color" value={bgSettings.gradientFrom} onChange={(e) => setBgSettings((s) => ({ ...s, gradientFrom: e.target.value }))} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
                            <input className="dae-input" value={bgSettings.gradientFrom} onChange={(e) => setBgSettings((s) => ({ ...s, gradientFrom: e.target.value }))} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
                          </div>
                        </div>
                        <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                          <label style={{ fontSize: 12 }}>结束色</label>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input type="color" value={bgSettings.gradientTo} onChange={(e) => setBgSettings((s) => ({ ...s, gradientTo: e.target.value }))} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
                            <input className="dae-input" value={bgSettings.gradientTo} onChange={(e) => setBgSettings((s) => ({ ...s, gradientTo: e.target.value }))} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </StyleCollapseItem>

                  {/* 边框 */}
                  <StyleCollapseItem defaultOpen={true} title="边框" enabled={styleSwitches.border} onToggle={(v) => toggleStyle('border')}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>边框宽度</label>
                        <input className="dae-input" style={{ fontSize: 13 }} value={borderSettings.width} onChange={(e) => setBorderSettings((s) => ({ ...s, width: e.target.value }))} />
                      </div>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>边框线型</label>
                        <select className="dae-input" style={{ fontSize: 13 }} value={borderSettings.style} onChange={(e) => setBorderSettings((s) => ({ ...s, style: e.target.value as 'solid' | 'dashed' | 'dotted' }))}>
                          <option value="solid">实线</option>
                          <option value="dashed">虚线</option>
                          <option value="dotted">点线</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>圆角</label>
                        <input className="dae-input" style={{ fontSize: 13 }} value={borderSettings.radius} onChange={(e) => setBorderSettings((s) => ({ ...s, radius: e.target.value }))} />
                      </div>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>边框颜色</label>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <input type="color" value={borderSettings.color} onChange={(e) => setBorderSettings((s) => ({ ...s, color: e.target.value }))} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
                          <input className="dae-input" value={borderSettings.color} onChange={(e) => setBorderSettings((s) => ({ ...s, color: e.target.value }))} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
                        </div>
                      </div>
                    </div>
                  </StyleCollapseItem>

                  {/* 提示 */}
                  <StyleCollapseItem defaultOpen={true} title="提示" enabled={styleSwitches.tooltip} onToggle={(v) => toggleStyle('tooltip')}>
                    <div className="dae-form-group" style={{ marginBottom: 8 }}>
                      <label style={{ fontSize: 12 }}>触发方式</label>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {(['hover', 'click'] as const).map((t) => (
                          <button key={t} className={`de-mid-chart-btn ${tooltipSettings.trigger === t ? 'active' : ''}`} style={{ flex: 1, height: 28, fontSize: 12 }} onClick={() => setTooltipSettings((s) => ({ ...s, trigger: t }))}>
                            {t === 'hover' ? '悬停' : '点击'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>背景色</label>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <input type="color" value={tooltipSettings.bgColor} onChange={(e) => setTooltipSettings((s) => ({ ...s, bgColor: e.target.value }))} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
                          <input className="dae-input" value={tooltipSettings.bgColor} onChange={(e) => setTooltipSettings((s) => ({ ...s, bgColor: e.target.value }))} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
                        </div>
                      </div>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>文字颜色</label>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <input type="color" value={tooltipSettings.textColor} onChange={(e) => setTooltipSettings((s) => ({ ...s, textColor: e.target.value }))} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
                          <input className="dae-input" value={tooltipSettings.textColor} onChange={(e) => setTooltipSettings((s) => ({ ...s, textColor: e.target.value }))} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>边框颜色</label>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <input type="color" value={tooltipSettings.borderColor} onChange={(e) => setTooltipSettings((s) => ({ ...s, borderColor: e.target.value }))} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
                          <input className="dae-input" value={tooltipSettings.borderColor} onChange={(e) => setTooltipSettings((s) => ({ ...s, borderColor: e.target.value }))} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
                        </div>
                      </div>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>圆角</label>
                        <input className="dae-input" style={{ fontSize: 13 }} value={tooltipSettings.borderRadius} onChange={(e) => setTooltipSettings((s) => ({ ...s, borderRadius: e.target.value }))} />
                      </div>
                    </div>
                  </StyleCollapseItem>

                  {/* 表头 */}
                  <StyleCollapseItem defaultOpen={true} title="表头" enabled={styleSwitches.tableHeader} onToggle={(v) => toggleStyle('tableHeader')}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>背景色</label>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <input type="color" value={headerSettings.bgColor} onChange={(e) => setHeaderSettings((s) => ({ ...s, bgColor: e.target.value }))} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
                          <input className="dae-input" value={headerSettings.bgColor} onChange={(e) => setHeaderSettings((s) => ({ ...s, bgColor: e.target.value }))} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
                        </div>
                      </div>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>文字颜色</label>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <input type="color" value={headerSettings.textColor} onChange={(e) => setHeaderSettings((s) => ({ ...s, textColor: e.target.value }))} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
                          <input className="dae-input" value={headerSettings.textColor} onChange={(e) => setHeaderSettings((s) => ({ ...s, textColor: e.target.value }))} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>字体大小</label>
                        <select className="dae-input" style={{ fontSize: 13 }} value={headerSettings.fontSize} onChange={(e) => setHeaderSettings((s) => ({ ...s, fontSize: e.target.value }))}>
                          {['12', '13', '14', '15', '16'].map((s) => (<option key={s} value={s}>{s}px</option>))}
                        </select>
                      </div>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>字重</label>
                        <select className="dae-input" style={{ fontSize: 13 }} value={headerSettings.fontWeight} onChange={(e) => setHeaderSettings((s) => ({ ...s, fontWeight: e.target.value }))}>
                          <option value="400">常规</option>
                          <option value="500">中等</option>
                          <option value="600">半粗</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>对齐</label>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {(['left', 'center', 'right'] as const).map((a) => (
                            <button key={a} className={`de-mid-chart-btn ${headerSettings.align === a ? 'active' : ''}`} style={{ flex: 1, height: 28, fontSize: 12 }} onClick={() => setHeaderSettings((s) => ({ ...s, align: a }))}>
                              {a === 'left' ? '左' : a === 'center' ? '中' : '右'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>行高</label>
                        <input className="dae-input" style={{ fontSize: 13 }} value={headerSettings.height} onChange={(e) => setHeaderSettings((s) => ({ ...s, height: e.target.value }))} />
                      </div>
                    </div>
                  </StyleCollapseItem>

                  {/* 单元格 */}
                  <StyleCollapseItem defaultOpen={true} title="单元格" enabled={styleSwitches.cell} onToggle={(v) => toggleStyle('cell')}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>字体大小</label>
                        <select className="dae-input" style={{ fontSize: 13 }} value={cellSettings.fontSize} onChange={(e) => setCellSettings((s) => ({ ...s, fontSize: e.target.value }))}>
                          {['11', '12', '13', '14'].map((s) => (<option key={s} value={s}>{s}px</option>))}
                        </select>
                      </div>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>内边距</label>
                        <input className="dae-input" style={{ fontSize: 13 }} value={cellSettings.padding} onChange={(e) => setCellSettings((s) => ({ ...s, padding: e.target.value }))} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>文字颜色</label>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <input type="color" value={cellSettings.textColor} onChange={(e) => setCellSettings((s) => ({ ...s, textColor: e.target.value }))} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
                          <input className="dae-input" value={cellSettings.textColor} onChange={(e) => setCellSettings((s) => ({ ...s, textColor: e.target.value }))} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
                        </div>
                      </div>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>行高</label>
                        <input className="dae-input" style={{ fontSize: 13 }} value={cellSettings.lineHeight} onChange={(e) => setCellSettings((s) => ({ ...s, lineHeight: e.target.value }))} />
                      </div>
                    </div>
                    <div className="dae-form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: 12 }}>对齐</label>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {(['left', 'center', 'right'] as const).map((a) => (
                          <button key={a} className={`de-mid-chart-btn ${cellSettings.align === a ? 'active' : ''}`} style={{ flex: 1, height: 28, fontSize: 12 }} onClick={() => setCellSettings((s) => ({ ...s, align: a }))}>
                            {a === 'left' ? '左' : a === 'center' ? '中' : '右'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </StyleCollapseItem>

                  {/* 总计 */}
                  <StyleCollapseItem defaultOpen={true} title="总计" enabled={styleSwitches.total} onToggle={(v) => toggleStyle('total')}>
                    <div className="dae-form-group" style={{ marginBottom: 8 }}>
                      <label style={{ fontSize: 12 }}>位置</label>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {(['top', 'bottom'] as const).map((p) => (
                          <button key={p} className={`de-mid-chart-btn ${totalSettings.position === p ? 'active' : ''}`} style={{ flex: 1, height: 28, fontSize: 12 }} onClick={() => setTotalSettings((s) => ({ ...s, position: p }))}>
                            {p === 'top' ? '顶部' : '底部'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>标签</label>
                        <input className="dae-input" style={{ fontSize: 13 }} value={totalSettings.label} onChange={(e) => setTotalSettings((s) => ({ ...s, label: e.target.value }))} />
                      </div>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>字体大小</label>
                        <select className="dae-input" style={{ fontSize: 13 }} value={totalSettings.fontSize} onChange={(e) => setTotalSettings((s) => ({ ...s, fontSize: e.target.value }))}>
                          {['12', '13', '14', '15', '16'].map((s) => (<option key={s} value={s}>{s}px</option>))}
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>字重</label>
                        <select className="dae-input" style={{ fontSize: 13 }} value={totalSettings.fontWeight} onChange={(e) => setTotalSettings((s) => ({ ...s, fontWeight: e.target.value }))}>
                          <option value="400">常规</option>
                          <option value="500">中等</option>
                          <option value="600">半粗</option>
                          <option value="700">粗体</option>
                        </select>
                      </div>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>背景色</label>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <input type="color" value={totalSettings.bgColor} onChange={(e) => setTotalSettings((s) => ({ ...s, bgColor: e.target.value }))} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
                          <input className="dae-input" value={totalSettings.bgColor} onChange={(e) => setTotalSettings((s) => ({ ...s, bgColor: e.target.value }))} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
                        </div>
                      </div>
                    </div>
                    <div className="dae-form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: 12 }}>文字颜色</label>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input type="color" value={totalSettings.textColor} onChange={(e) => setTotalSettings((s) => ({ ...s, textColor: e.target.value }))} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
                        <input className="dae-input" value={totalSettings.textColor} onChange={(e) => setTotalSettings((s) => ({ ...s, textColor: e.target.value }))} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
                      </div>
                    </div>
                  </StyleCollapseItem>

                  {/* 功能设置 */}
                  <StyleCollapseItem defaultOpen={true} title="功能设置" enabled={styleSwitches.funcSettings} onToggle={(v) => toggleStyle('funcSettings')}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <input type="checkbox" checked={funcSettings.exportExcel} onChange={(e) => setFuncSettings((s) => ({ ...s, exportExcel: e.target.checked }))} />
                        支持导出 Excel
                      </label>
                      <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <input type="checkbox" checked={funcSettings.drillDown} onChange={(e) => setFuncSettings((s) => ({ ...s, drillDown: e.target.checked }))} />
                        支持数据下钻
                      </label>
                      <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <input type="checkbox" checked={funcSettings.showLegend} onChange={(e) => setFuncSettings((s) => ({ ...s, showLegend: e.target.checked }))} />
                        显示图例
                      </label>
                      <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <input type="checkbox" checked={funcSettings.showDataLabel} onChange={(e) => setFuncSettings((s) => ({ ...s, showDataLabel: e.target.checked }))} />
                        显示数据标签
                      </label>
                      <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <input type="checkbox" checked={funcSettings.enableLinkage} onChange={(e) => setFuncSettings((s) => ({ ...s, enableLinkage: e.target.checked }))} />
                        开启图表联动
                      </label>
                      <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <input type="checkbox" checked={funcSettings.enableJump} onChange={(e) => setFuncSettings((s) => ({ ...s, enableJump: e.target.checked }))} />
                        开启跳转
                      </label>
                    </div>
                  </StyleCollapseItem>

                  {/* 滚动设置 */}
                  <StyleCollapseItem defaultOpen={true} title="滚动设置" enabled={styleSwitches.scroll} onToggle={(v) => toggleStyle('scroll')}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>最大高度</label>
                        <input className="dae-input" style={{ fontSize: 13 }} value={scrollSettings.maxHeight} onChange={(e) => setScrollSettings((s) => ({ ...s, maxHeight: e.target.value }))} />
                      </div>
                      <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label style={{ fontSize: 12 }}>滚动间隔（秒）</label>
                        <input className="dae-input" style={{ fontSize: 13 }} value={scrollSettings.scrollInterval} onChange={(e) => setScrollSettings((s) => ({ ...s, scrollInterval: e.target.value }))} disabled={!scrollSettings.autoScroll} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <input type="checkbox" checked={scrollSettings.x} onChange={(e) => setScrollSettings((s) => ({ ...s, x: e.target.checked }))} />
                        横向滚动
                      </label>
                      <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <input type="checkbox" checked={scrollSettings.y} onChange={(e) => setScrollSettings((s) => ({ ...s, y: e.target.checked }))} />
                        纵向滚动
                      </label>
                      <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <input type="checkbox" checked={scrollSettings.autoScroll} onChange={(e) => setScrollSettings((s) => ({ ...s, autoScroll: e.target.checked }))} />
                        自动轮播滚动
                      </label>
                      <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <input type="checkbox" checked={scrollSettings.scrollbarVisible} onChange={(e) => setScrollSettings((s) => ({ ...s, scrollbarVisible: e.target.checked }))} />
                        显示滚动条
                      </label>
                    </div>
                  </StyleCollapseItem>

                  {/* 条件样式 */}
                  <StyleCollapseItem defaultOpen={true} title="条件样式" enabled={styleSwitches.conditional} onToggle={(v) => toggleStyle('conditional')}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>已配置 {conditionalConditions.length} 条规则</span>
                      <button className="dae-btn dae-btn-secondary dae-btn-sm" onClick={() => setConditionalModalOpen(true)}>
                        <Settings2 size={12} />
                        配置规则
                      </button>
                    </div>
                  </StyleCollapseItem>
                </div>
              )}

              {/* ===== 高级 Tab ===== */}
              {activeConfigTab === 'advanced' && (
                <div style={{ padding: '12px 14px' }}>
                  {/* 图表联动 */}
                  <div style={{ borderBottom: '1px solid var(--dae-border)', paddingBottom: 12, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Link2 size={14} style={{ color: 'var(--dae-primary)' }} />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>图表联动</span>
                      </div>
                      <span className={`de-toggle ${linkageEnabled ? 'on' : ''}`} onClick={() => setLinkageEnabled(!linkageEnabled)} />
                    </div>
                    {linkageEnabled && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>选择联动目标图表</span>
                        {chartList.filter((c) => c.id !== editingChartId).map((c) => (
                          <label key={c.id} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                            <input type="checkbox" checked={linkageTargets.includes(c.id)} onChange={(e) => setLinkageTargets((prev) => e.target.checked ? [...prev, c.id] : prev.filter((id) => id !== c.id))} />
                            {c.name}
                          </label>
                        ))}
                        {chartList.filter((c) => c.id !== editingChartId).length === 0 && (
                          <span style={{ fontSize: 12, color: 'var(--dae-ink-subtle)' }}>暂无其他图表可作为联动目标</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 点击跳转 */}
                  <div style={{ borderBottom: '1px solid var(--dae-border)', paddingBottom: 12, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MousePointerClick size={14} style={{ color: 'var(--dae-primary)' }} />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>点击跳转</span>
                      </div>
                      <span className={`de-toggle ${jumpEnabled ? 'on' : ''}`} onClick={() => setJumpEnabled(!jumpEnabled)} />
                    </div>
                    {jumpEnabled && (
                      <div className="dae-form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: 12 }}>跳转链接</label>
                        <input className="dae-input" style={{ fontSize: 13 }} placeholder="https://..." value={jumpUrl} onChange={(e) => setJumpUrl(e.target.value)} />
                      </div>
                    )}
                  </div>

                  {/* 定时刷新 */}
                  <div style={{ borderBottom: '1px solid var(--dae-border)', paddingBottom: 12, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <RefreshCw size={14} style={{ color: 'var(--dae-primary)' }} />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>定时刷新</span>
                      </div>
                      <span className={`de-toggle ${refreshEnabled ? 'on' : ''}`} onClick={() => setRefreshEnabled(!refreshEnabled)} />
                    </div>
                    {refreshEnabled && (
                      <div className="dae-form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: 12 }}>刷新间隔（秒）</label>
                        <select className="dae-input" style={{ fontSize: 13 }} value={refreshInterval} onChange={(e) => setRefreshInterval(e.target.value)}>
                          {['10', '30', '60', '120', '300'].map((s) => (<option key={s} value={s}>{s} 秒</option>))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* 数据预警 */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Bell size={14} style={{ color: 'var(--dae-primary)' }} />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>数据预警</span>
                      </div>
                      <span className={`de-toggle ${alertEnabled ? 'on' : ''}`} onClick={() => setAlertEnabled(!alertEnabled)} />
                    </div>
                    {alertEnabled && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {alertRules.length === 0 && <span style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>未配置预警规则</span>}
                        {alertRules.map((rule, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', padding: 8, borderRadius: 'var(--dae-radius-md)' }}>
                            <input className="dae-input" style={{ flex: 1, fontSize: 12 }} placeholder="指标" value={rule.metric} onChange={(e) => { const u = [...alertRules]; u[idx].metric = e.target.value; setAlertRules(u); }} />
                            <select className="dae-input" style={{ width: 70, fontSize: 12 }} value={rule.operator} onChange={(e) => { const u = [...alertRules]; u[idx].operator = e.target.value; setAlertRules(u); }}>
                              <option value=">">&gt;</option>
                              <option value="<">&lt;</option>
                              <option value="=">=</option>
                            </select>
                            <input className="dae-input" style={{ width: 70, fontSize: 12 }} placeholder="阈值" value={rule.threshold} onChange={(e) => { const u = [...alertRules]; u[idx].threshold = e.target.value; setAlertRules(u); }} />
                            <button className="dae-btn dae-btn-secondary dae-btn-sm" style={{ color: '#ef4444' }} onClick={() => setAlertRules((prev) => prev.filter((_, i) => i !== idx))}><X size={14} /></button>
                          </div>
                        ))}
                        <button className="dae-btn dae-btn-secondary dae-btn-sm" onClick={() => setAlertRules((prev) => [...prev, { metric: '', operator: '>', threshold: '' }])}>
                          <Plus size={12} /> 添加规则
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 底部操作按钮 */}
            {editingChartId && (
              <div style={{ padding: '12px 14px', borderTop: '1px solid var(--dae-border)', display: 'flex', gap: 8, background: '#fff' }}>
                <button
                  className="dae-btn dae-btn-primary dae-btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => {
                    const packed = packChart();
                    if (packed) {
                      setChartList((prev) => prev.map((c) => (c.id === editingChartId ? packed : c)));
                    }
                    handleQuery();
                  }}
                  disabled={dimensions.length === 0 || metrics.length === 0}
                >
                  <RefreshCw size={14} />
                  数据更新
                </button>
              </div>
            )}
          </div>
        )}

        {/* ---------- 最右侧：数据集面板 ---------- */}
        <div
          style={{
            width: 220,
            flexShrink: 0,
            background: '#fff',
            borderLeft: '1px solid var(--dae-border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
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

          <div style={{ padding: '10px 10px 6px' }}>
            <div className="dae-search-box" style={{ maxWidth: '100%' }}>
              <Search size={14} />
              <input
                className="dae-input"
                placeholder="请输入字段名称"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                style={{ fontSize: 12 }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '0 8px 8px' }} className="dae-scroll">
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Type size={12} style={{ color: 'var(--dae-primary)' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--dae-ink)' }}>维度</span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--dae-ink-muted)' }}>{filteredDimensions.length}</span>
              </div>
              {filteredDimensions.map((f) => (
                <div
                  key={f.name}
                  className="de-field-item"
                  onClick={() => { if (editingChartId) addDimension(f); }}
                  style={{ opacity: editingChartId ? 1 : 0.5, cursor: editingChartId ? 'pointer' : 'not-allowed' }}
                  title={editingChartId ? `添加到「${editingChart?.name}」` : '请先选中一个图表'}
                >
                  <span className="de-field-icon de-field-dim">T</span>
                  <span className="de-field-name">{f.name}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Hash size={12} style={{ color: '#10b981' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--dae-ink)' }}>指标</span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--dae-ink-muted)' }}>{filteredMetrics.length}</span>
              </div>
              {filteredMetrics.map((f) => (
                <div
                  key={f.name}
                  className="de-field-item"
                  onClick={() => { if (editingChartId) addMetric(f); }}
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
      </div>

      <FilterModal
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        dimensions={dimensions}
        metrics={metrics}
        conditions={filterConditions}
        onChange={setFilterConditions}
      />
      <ConditionalStyleModal
        open={conditionalModalOpen}
        onClose={() => setConditionalModalOpen(false)}
        conditions={conditionalConditions}
        onChange={setConditionalConditions}
      />
    </div>
  );
}
