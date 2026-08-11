import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Trash2,
  Copy,
  Move,
  Maximize,
  Grid3X3,
  Type,
  Image,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Layers,
  Settings,
  Settings2,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Lock,
  Unlock,
  EyeOff,
  Undo2,
  Redo2,
} from 'lucide-react';
import ChartRenderer from '../../../components/ChartRenderer';
import {
  dataScreens,
  datasets,
  datasetFields,
  chartSampleData,
  pieSampleData,
  aggOptions,
  type DataScreenComponent,
  type SelectedField,
} from '../../../data/mockData';
import { useHashParams } from '@/common/useHashParams';

/* ========== 组件类型定义 ========== */
export type ScreenCompType = DataScreenComponent['type'];

type Align = 'left' | 'center' | 'right';

export interface FilterCondition {
  field: string;
  operator: string;
  value: string;
  logic: 'and' | 'or';
}

export interface ConditionalRule {
  field: string;
  operator: string;
  value: string;
  textColor: string;
  bgColor: string;
}

interface StyleSwitches {
  title: boolean;
  background: boolean;
  border: boolean;
  tooltip: boolean;
  tableHeader: boolean;
  cell: boolean;
  total: boolean;
  funcSettings: boolean;
  scroll: boolean;
  conditional: boolean;
}

interface TitleSettings {
  content: string;
  fontSize: string;
  fontWeight: string;
  color: string;
  align: Align;
  visible: boolean;
  marginBottom: string;
}

interface BgSettings {
  color: string;
  padding: string;
  radius: string;
  shadow: string;
  gradientEnabled: boolean;
  gradientFrom: string;
  gradientTo: string;
}

interface BorderSettings {
  width: string;
  style: 'solid' | 'dashed' | 'dotted';
  color: string;
  radius: string;
}

interface TooltipSettings {
  trigger: 'hover' | 'click';
  bgColor: string;
  textColor: string;
  borderColor: string;
  borderWidth: string;
  borderRadius: string;
}

interface HeaderSettings {
  bgColor: string;
  textColor: string;
  fontSize: string;
  fontWeight: string;
  align: Align;
  height: string;
}

interface CellSettings {
  fontSize: string;
  padding: string;
  textColor: string;
  align: Align;
  lineHeight: string;
}

interface TotalSettings {
  position: 'top' | 'bottom';
  label: string;
  fontSize: string;
  fontWeight: string;
  bgColor: string;
  textColor: string;
}

interface ScrollSettings {
  x: boolean;
  y: boolean;
  maxHeight: string;
  autoScroll: boolean;
  scrollInterval: string;
  scrollbarVisible: boolean;
}

interface FuncSettings {
  exportExcel: boolean;
  drillDown: boolean;
  showLegend: boolean;
  showDataLabel: boolean;
  enableLinkage: boolean;
  enableJump: boolean;
}

/** 单个大屏组件的完整配置（数据 + 样式） */
export interface ScreenCompConfig {
  dimensions: SelectedField[];
  metrics: SelectedField[];
  filterConditions: FilterCondition[];
  refreshInterval: string;
  chartPalette: string;
  themeMode: 'light' | 'dark';
  styleSwitches: StyleSwitches;
  titleSettings: TitleSettings;
  bgSettings: BgSettings;
  borderSettings: BorderSettings;
  tooltipSettings: TooltipSettings;
  headerSettings: HeaderSettings;
  cellSettings: CellSettings;
  totalSettings: TotalSettings;
  scrollSettings: ScrollSettings;
  funcSettings: FuncSettings;
  conditionalRules: ConditionalRule[];
}

interface ScreenComponent extends DataScreenComponent {
  visible?: boolean;
  locked?: boolean;
  config: ScreenCompConfig;
}

interface ScreenConfig {
  id: string;
  name: string;
  resolution: string;
  width: number;
  height: number;
  bgColor: string;
  bgImage: string;
  gridEnabled: boolean;
  gridSize: number;
  components: ScreenComponent[];
}

/** 大屏组件默认配置（深色大屏基调） */
function createCompConfig(name = ''): ScreenCompConfig {
  return {
    dimensions: [],
    metrics: [],
    filterConditions: [],
    refreshInterval: '30',
    chartPalette: '#38bdf8',
    themeMode: 'dark',
    styleSwitches: {
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
    },
    titleSettings: { content: name, fontSize: '14', fontWeight: '600', color: '#e2e8f0', align: 'left', visible: true, marginBottom: '12' },
    bgSettings: { color: '#102147', padding: '12', radius: '6', shadow: '0 1px 3px rgba(0,0,0,0.08)', gradientEnabled: false, gradientFrom: '#102147', gradientTo: '#0b1121' },
    borderSettings: { width: '1', style: 'solid', color: '#1e3a8a', radius: '6' },
    tooltipSettings: { trigger: 'hover', bgColor: '#0f172a', textColor: '#ffffff', borderColor: '#334155', borderWidth: '0', borderRadius: '4' },
    headerSettings: { bgColor: '#0f2144', textColor: '#cbd5f5', fontSize: '13', fontWeight: '500', align: 'left', height: '40' },
    cellSettings: { fontSize: '12', padding: '8', textColor: '#e2e8f0', align: 'left', lineHeight: '1.5' },
    totalSettings: { position: 'bottom', label: '合计', fontSize: '13', fontWeight: '600', bgColor: '#0f2144', textColor: '#e2e8f0' },
    scrollSettings: { x: true, y: true, maxHeight: '400', autoScroll: false, scrollInterval: '3', scrollbarVisible: true },
    funcSettings: { exportExcel: true, drillDown: false, showLegend: true, showDataLabel: false, enableLinkage: false, enableJump: false },
    conditionalRules: [],
  };
}

/** 把 mock 里的字段名数组转换为可配置的 SelectedField */
function toSelectedFields(names: string[] | undefined, datasetName: string, kind: 'dimension' | 'metric'): SelectedField[] {
  const fields = datasetFields[datasetName] || [];
  return (names || []).map((name) => {
    const f = fields.find((x) => x.name === name);
    return kind === 'dimension'
      ? { name, dataType: f?.dataType || '文本', sort: 'none' as const, visible: true }
      : { name, dataType: f?.dataType || '数值', aggregation: 'SUM', visible: true };
  });
}

const resolutions: { label: string; width: number; height: number }[] = [
  { label: '1920×1080', width: 1920, height: 1080 },
  { label: '3840×1080', width: 3840, height: 1080 },
  { label: '2560×1440', width: 2560, height: 1440 },
  { label: '5760×2160', width: 5760, height: 2160 },
];

const componentLibrary: { key: ScreenCompType; label: string; icon: React.ElementType; defaultW: number; defaultH: number }[] = [
  { key: 'card', label: '指标卡', icon: Activity, defaultW: 280, defaultH: 140 },
  { key: 'text', label: '文本标题', icon: Type, defaultW: 400, defaultH: 60 },
  { key: 'bar', label: '柱状图', icon: BarChart3, defaultW: 520, defaultH: 320 },
  { key: 'line', label: '折线图', icon: LineChart, defaultW: 520, defaultH: 320 },
  { key: 'area', label: '面积图', icon: Activity, defaultW: 520, defaultH: 320 },
  { key: 'pie', label: '饼图', icon: PieChart, defaultW: 400, defaultH: 320 },
  { key: 'image', label: '图片', icon: Image, defaultW: 320, defaultH: 200 },
];

function generateId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`;
}

function parseResolution(resolution: string) {
  const [width, height] = resolution.split('×').map((v) => parseInt(v, 10));
  return { width: width || 1920, height: height || 1080 };
}

/* ========== 折叠面板 ========== */
function ConfigSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid var(--dae-border)' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', cursor: 'pointer' }}
        onClick={() => setOpen(!open)}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--dae-ink)' }}>{title}</span>
        {open ? <ChevronUp size={14} style={{ color: 'var(--dae-ink-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--dae-ink-muted)' }} />}
      </div>
      {open && <div style={{ padding: '0 14px 12px' }}>{children}</div>}
    </div>
  );
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
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', cursor: 'pointer' }}
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
  conditions: FilterCondition[];
  onChange: (v: FilterCondition[]) => void;
}) {
  if (!open) return null;
  const allFields = [...dimensions, ...metrics];
  return (
    <div
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 'var(--dae-radius-lg)', width: 520, maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--dae-border)' }}>
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
                      const updated = conditions.map((c, i) => (i === idx ? { ...c, logic: e.target.value as 'and' | 'or' } : c));
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
                  onChange={(e) => onChange(conditions.map((c, i) => (i === idx ? { ...c, field: e.target.value } : c)))}
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
                  onChange={(e) => onChange(conditions.map((c, i) => (i === idx ? { ...c, operator: e.target.value } : c)))}
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
                  onChange={(e) => onChange(conditions.map((c, i) => (i === idx ? { ...c, value: e.target.value } : c)))}
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
  conditions: ConditionalRule[];
  onChange: (v: ConditionalRule[]) => void;
}) {
  if (!open) return null;
  const patchRule = (idx: number, patch: Partial<ConditionalRule>) =>
    onChange(conditions.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
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
                  <input className="dae-input" style={{ flex: 1, fontSize: 12 }} placeholder="字段名" value={cond.field} onChange={(e) => patchRule(idx, { field: e.target.value })} />
                  <select className="dae-input" style={{ width: 90, fontSize: 12 }} value={cond.operator} onChange={(e) => patchRule(idx, { operator: e.target.value })}>
                    <option value="等于">等于</option>
                    <option value="大于">大于</option>
                    <option value="小于">小于</option>
                    <option value="大于等于">大于等于</option>
                    <option value="小于等于">小于等于</option>
                  </select>
                  <input className="dae-input" style={{ flex: 1, fontSize: 12 }} placeholder="值" value={cond.value} onChange={(e) => patchRule(idx, { value: e.target.value })} />
                  <button className="dae-btn dae-btn-secondary dae-btn-sm" style={{ color: '#ef4444' }} onClick={() => onChange(conditions.filter((_, i) => i !== idx))}><X size={14} /></button>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                    <span style={{ fontSize: 11 }}>文字色</span>
                    <input type="color" value={cond.textColor} onChange={(e) => patchRule(idx, { textColor: e.target.value })} style={{ width: 24, height: 24, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 1, cursor: 'pointer' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                    <span style={{ fontSize: 11 }}>背景色</span>
                    <input type="color" value={cond.bgColor} onChange={(e) => patchRule(idx, { bgColor: e.target.value })} style={{ width: 24, height: 24, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 1, cursor: 'pointer' }} />
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

type ConfigUpdater = (updater: (cfg: ScreenCompConfig) => ScreenCompConfig) => void;

/* ========== 右侧「数据」Tab ========== */
function DataTabPanel({
  comp,
  onUpdateComp,
  patchConfig,
  onOpenFilter,
}: {
  comp: ScreenComponent;
  onUpdateComp: (patch: Partial<ScreenComponent>) => void;
  patchConfig: ConfigUpdater;
  onOpenFilter: () => void;
}) {
  const [openConfig, setOpenConfig] = useState<string | null>(null);
  const cfg = comp.config;

  const datasetName = comp.datasetName || '';
  const fields = datasetFields[datasetName] || [];
  const dimensionFields = fields.filter((f) => f.type === 'dimension');
  const metricFields = fields.filter((f) => f.type === 'metric');
  const availableDimensions = dimensionFields.filter((f) => !cfg.dimensions.some((d) => d.name === f.name));
  const availableMetrics = metricFields.filter((f) => !cfg.metrics.some((m) => m.name === f.name));

  const addDimension = (name: string) => {
    const f = dimensionFields.find((x) => x.name === name);
    if (!f) return;
    patchConfig((c) =>
      c.dimensions.some((d) => d.name === name)
        ? c
        : { ...c, dimensions: [...c.dimensions, { name: f.name, dataType: f.dataType, sort: 'none', visible: true }] }
    );
  };
  const addMetric = (name: string) => {
    const f = metricFields.find((x) => x.name === name);
    if (!f) return;
    patchConfig((c) =>
      c.metrics.some((m) => m.name === name)
        ? c
        : { ...c, metrics: [...c.metrics, { name: f.name, dataType: f.dataType, aggregation: 'SUM', visible: true }] }
    );
  };
  const removeDimension = (name: string) => patchConfig((c) => ({ ...c, dimensions: c.dimensions.filter((d) => d.name !== name) }));
  const removeMetric = (name: string) => patchConfig((c) => ({ ...c, metrics: c.metrics.filter((m) => m.name !== name) }));
  const updateDimension = (name: string, updates: Partial<SelectedField>) =>
    patchConfig((c) => ({ ...c, dimensions: c.dimensions.map((d) => (d.name === name ? { ...d, ...updates } : d)) }));
  const updateMetric = (name: string, updates: Partial<SelectedField>) =>
    patchConfig((c) => ({ ...c, metrics: c.metrics.map((m) => (m.name === name ? { ...m, ...updates } : m)) }));

  const handleDatasetChange = (name: string) => {
    onUpdateComp({ datasetName: name });
    patchConfig((c) => ({ ...c, dimensions: [], metrics: [], filterConditions: [] }));
  };

  return (
    <div style={{ padding: '12px 14px' }}>
      {/* 图表名称 */}
      <div className="de-config-section">
        <div className="dae-form-group" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: 12 }}>图表名称</label>
          <input className="dae-input" style={{ fontSize: 13 }} value={comp.name} onChange={(e) => onUpdateComp({ name: e.target.value })} />
        </div>
      </div>

      {/* 图表类型 */}
      <div className="de-config-section">
        <div className="dae-form-group" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: 12 }}>图表类型</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {componentLibrary.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  className={`de-mid-chart-btn ${comp.type === t.key ? 'active' : ''}`}
                  onClick={() => onUpdateComp({ type: t.key })}
                  title={t.label}
                  style={{ width: 44, height: 32 }}
                >
                  <Icon size={16} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 位置尺寸 */}
      <div className="de-config-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <label style={{ fontSize: 12, fontWeight: 600 }}>位置尺寸</label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="dae-form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: 12 }}>X</label>
            <input className="dae-input" type="number" min={0} style={{ fontSize: 13 }} value={Math.round(comp.x)} onChange={(e) => onUpdateComp({ x: Math.max(0, parseInt(e.target.value, 10) || 0) })} />
          </div>
          <div className="dae-form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: 12 }}>Y</label>
            <input className="dae-input" type="number" min={0} style={{ fontSize: 13 }} value={Math.round(comp.y)} onChange={(e) => onUpdateComp({ y: Math.max(0, parseInt(e.target.value, 10) || 0) })} />
          </div>
          <div className="dae-form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: 12 }}>宽度</label>
            <input className="dae-input" type="number" min={40} style={{ fontSize: 13 }} value={Math.round(comp.w)} onChange={(e) => onUpdateComp({ w: Math.max(40, parseInt(e.target.value, 10) || 40) })} />
          </div>
          <div className="dae-form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: 12 }}>高度</label>
            <input className="dae-input" type="number" min={40} style={{ fontSize: 13 }} value={Math.round(comp.h)} onChange={(e) => onUpdateComp({ h: Math.max(40, parseInt(e.target.value, 10) || 40) })} />
          </div>
        </div>
      </div>

      {/* 数据集 */}
      <div className="de-config-section">
        <div className="dae-form-group" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: 12 }}>数据集</label>
          <select className="dae-input" style={{ fontSize: 13 }} value={datasetName} onChange={(e) => handleDatasetChange(e.target.value)}>
            {datasets.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
        </div>
      </div>

      {/* 维度 */}
      <div className="de-config-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600 }}>维度</label>
          <span style={{ fontSize: 11, color: 'var(--dae-ink-muted)' }}>共 {cfg.dimensions.length} 个</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 28, marginBottom: 8 }}>
          {cfg.dimensions.map((d) => (
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
          {cfg.dimensions.length === 0 && <span style={{ fontSize: 12, color: 'var(--dae-ink-subtle)' }}>请从下方选择维度</span>}
        </div>
        <select
          className="dae-input"
          style={{ fontSize: 12 }}
          value=""
          onChange={(e) => { if (e.target.value) addDimension(e.target.value); }}
          disabled={availableDimensions.length === 0}
        >
          <option value="">{availableDimensions.length === 0 ? '无可用维度字段' : '+ 添加维度'}</option>
          {availableDimensions.map((f) => <option key={f.name} value={f.name}>{f.name}</option>)}
        </select>
      </div>

      {/* 指标 */}
      <div className="de-config-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600 }}>指标</label>
          <span style={{ fontSize: 11, color: 'var(--dae-ink-muted)' }}>共 {cfg.metrics.length} 个</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 28, marginBottom: 8 }}>
          {cfg.metrics.map((m) => (
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
          {cfg.metrics.length === 0 && <span style={{ fontSize: 12, color: 'var(--dae-ink-subtle)' }}>请从下方选择指标</span>}
        </div>
        <select
          className="dae-input"
          style={{ fontSize: 12 }}
          value=""
          onChange={(e) => { if (e.target.value) addMetric(e.target.value); }}
          disabled={availableMetrics.length === 0}
        >
          <option value="">{availableMetrics.length === 0 ? '无可用指标字段' : '+ 添加指标'}</option>
          {availableMetrics.map((f) => <option key={f.name} value={f.name}>{f.name}</option>)}
        </select>
      </div>

      {/* 数据过滤 */}
      <div className="de-config-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600 }}>数据过滤</label>
          <button
            onClick={onOpenFilter}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 0', fontSize: 12, color: 'var(--dae-primary)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 500 }}
          >
            <Filter size={12} />
            配置过滤
          </button>
        </div>
        {cfg.filterConditions.length === 0 ? (
          <span style={{ fontSize: 12, color: 'var(--dae-ink-subtle)' }}>未设置过滤条件</span>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {cfg.filterConditions.map((cond, idx) => (
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
        <div className="dae-form-group" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: 12 }}>自动刷新间隔</label>
          <select className="dae-input" style={{ fontSize: 13 }} value={cfg.refreshInterval} onChange={(e) => patchConfig((c) => ({ ...c, refreshInterval: e.target.value }))}>
            <option value="0">关闭</option>
            <option value="5">5 秒</option>
            <option value="10">10 秒</option>
            <option value="30">30 秒</option>
            <option value="60">1 分钟</option>
            <option value="120">2 分钟</option>
            <option value="300">5 分钟</option>
            <option value="600">10 分钟</option>
          </select>
        </div>
      </div>
    </div>
  );
}

/* ========== 右侧「属性」Tab（样式配置） ========== */
function StyleTabPanel({
  comp,
  patchConfig,
  onOpenConditional,
  onDuplicate,
  onDelete,
}: {
  comp: ScreenComponent;
  patchConfig: ConfigUpdater;
  onOpenConditional: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const cfg = comp.config;

  const toggleStyle = (key: keyof StyleSwitches) =>
    patchConfig((c) => ({ ...c, styleSwitches: { ...c.styleSwitches, [key]: !c.styleSwitches[key] } }));
  const setTitle = (p: Partial<TitleSettings>) => patchConfig((c) => ({ ...c, titleSettings: { ...c.titleSettings, ...p } }));
  const setBg = (p: Partial<BgSettings>) => patchConfig((c) => ({ ...c, bgSettings: { ...c.bgSettings, ...p } }));
  const setBorder = (p: Partial<BorderSettings>) => patchConfig((c) => ({ ...c, borderSettings: { ...c.borderSettings, ...p } }));
  const setTooltip = (p: Partial<TooltipSettings>) => patchConfig((c) => ({ ...c, tooltipSettings: { ...c.tooltipSettings, ...p } }));
  const setHeader = (p: Partial<HeaderSettings>) => patchConfig((c) => ({ ...c, headerSettings: { ...c.headerSettings, ...p } }));
  const setCell = (p: Partial<CellSettings>) => patchConfig((c) => ({ ...c, cellSettings: { ...c.cellSettings, ...p } }));
  const setTotal = (p: Partial<TotalSettings>) => patchConfig((c) => ({ ...c, totalSettings: { ...c.totalSettings, ...p } }));
  const setScroll = (p: Partial<ScrollSettings>) => patchConfig((c) => ({ ...c, scrollSettings: { ...c.scrollSettings, ...p } }));
  const setFunc = (p: Partial<FuncSettings>) => patchConfig((c) => ({ ...c, funcSettings: { ...c.funcSettings, ...p } }));

  return (
    <div>
      {/* 基础样式（默认展开，无开关） */}
      <div style={{ borderBottom: '1px solid var(--dae-border)' }}>
        <div style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, color: 'var(--dae-ink)' }}>基础样式</div>
        <div style={{ padding: '0 14px 12px' }}>
          <div className="dae-form-group" style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 12 }}>图表色系</label>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {['#3b82f6', '#38bdf8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map((c) => (
                <div
                  key={c}
                  onClick={() => patchConfig((prev) => ({ ...prev, chartPalette: c }))}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    background: c,
                    cursor: 'pointer',
                    border: cfg.chartPalette === c ? '2px solid var(--dae-ink)' : '2px solid transparent',
                    boxShadow: cfg.chartPalette === c ? '0 0 0 2px rgba(59,130,246,0.3)' : 'none',
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
                <button
                  key={mode}
                  className={`de-mid-chart-btn ${cfg.themeMode === mode ? 'active' : ''}`}
                  style={{ flex: 1, height: 28, fontSize: 12 }}
                  onClick={() => patchConfig((prev) => ({ ...prev, themeMode: mode }))}
                >
                  {mode === 'light' ? '浅色' : '深色'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 标题 */}
      <StyleCollapseItem defaultOpen={true} title="标题" enabled={cfg.styleSwitches.title} onToggle={() => toggleStyle('title')}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label style={{ fontSize: 12 }}>标题内容</label>
            <input className="dae-input" style={{ fontSize: 13 }} value={cfg.titleSettings.content} onChange={(e) => setTitle({ content: e.target.value })} placeholder="请输入标题" />
          </div>
          <div className="dae-form-group" style={{ marginBottom: 0, width: 70 }}>
            <label style={{ fontSize: 12 }}>下边距</label>
            <input className="dae-input" style={{ fontSize: 13 }} value={cfg.titleSettings.marginBottom} onChange={(e) => setTitle({ marginBottom: e.target.value })} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label style={{ fontSize: 12 }}>字体大小</label>
            <select className="dae-input" style={{ fontSize: 13 }} value={cfg.titleSettings.fontSize} onChange={(e) => setTitle({ fontSize: e.target.value })}>
              {['12', '14', '16', '18', '20', '24'].map((s) => (<option key={s} value={s}>{s}px</option>))}
            </select>
          </div>
          <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label style={{ fontSize: 12 }}>字重</label>
            <select className="dae-input" style={{ fontSize: 13 }} value={cfg.titleSettings.fontWeight} onChange={(e) => setTitle({ fontWeight: e.target.value })}>
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
              <input type="color" value={cfg.titleSettings.color} onChange={(e) => setTitle({ color: e.target.value })} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
              <input className="dae-input" value={cfg.titleSettings.color} onChange={(e) => setTitle({ color: e.target.value })} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
            </div>
          </div>
          <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label style={{ fontSize: 12 }}>对齐</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['left', 'center', 'right'] as const).map((a) => (
                <button key={a} className={`de-mid-chart-btn ${cfg.titleSettings.align === a ? 'active' : ''}`} style={{ flex: 1, height: 28, fontSize: 12 }} onClick={() => setTitle({ align: a })}>
                  {a === 'left' ? '左' : a === 'center' ? '中' : '右'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </StyleCollapseItem>

      {/* 背景 */}
      <StyleCollapseItem defaultOpen={true} title="背景" enabled={cfg.styleSwitches.background} onToggle={() => toggleStyle('background')}>
        <div className="dae-form-group" style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 12 }}>背景颜色</label>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="color" value={cfg.bgSettings.color} onChange={(e) => setBg({ color: e.target.value })} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
            <input className="dae-input" value={cfg.bgSettings.color} onChange={(e) => setBg({ color: e.target.value })} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label style={{ fontSize: 12 }}>内边距</label>
            <input className="dae-input" style={{ fontSize: 13 }} value={cfg.bgSettings.padding} onChange={(e) => setBg({ padding: e.target.value })} />
          </div>
          <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label style={{ fontSize: 12 }}>圆角</label>
            <input className="dae-input" style={{ fontSize: 13 }} value={cfg.bgSettings.radius} onChange={(e) => setBg({ radius: e.target.value })} />
          </div>
        </div>
        <div className="dae-form-group" style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={cfg.bgSettings.gradientEnabled} onChange={(e) => setBg({ gradientEnabled: e.target.checked })} />
            启用渐变色
          </label>
        </div>
        {cfg.bgSettings.gradientEnabled && (
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
              <label style={{ fontSize: 12 }}>起始色</label>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="color" value={cfg.bgSettings.gradientFrom} onChange={(e) => setBg({ gradientFrom: e.target.value })} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
                <input className="dae-input" value={cfg.bgSettings.gradientFrom} onChange={(e) => setBg({ gradientFrom: e.target.value })} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
              </div>
            </div>
            <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
              <label style={{ fontSize: 12 }}>结束色</label>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="color" value={cfg.bgSettings.gradientTo} onChange={(e) => setBg({ gradientTo: e.target.value })} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
                <input className="dae-input" value={cfg.bgSettings.gradientTo} onChange={(e) => setBg({ gradientTo: e.target.value })} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
              </div>
            </div>
          </div>
        )}
      </StyleCollapseItem>

      {/* 边框 */}
      <StyleCollapseItem defaultOpen={true} title="边框" enabled={cfg.styleSwitches.border} onToggle={() => toggleStyle('border')}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label style={{ fontSize: 12 }}>边框宽度</label>
            <input className="dae-input" style={{ fontSize: 13 }} value={cfg.borderSettings.width} onChange={(e) => setBorder({ width: e.target.value })} />
          </div>
          <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label style={{ fontSize: 12 }}>边框线型</label>
            <select className="dae-input" style={{ fontSize: 13 }} value={cfg.borderSettings.style} onChange={(e) => setBorder({ style: e.target.value as 'solid' | 'dashed' | 'dotted' })}>
              <option value="solid">实线</option>
              <option value="dashed">虚线</option>
              <option value="dotted">点线</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label style={{ fontSize: 12 }}>圆角</label>
            <input className="dae-input" style={{ fontSize: 13 }} value={cfg.borderSettings.radius} onChange={(e) => setBorder({ radius: e.target.value })} />
          </div>
          <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label style={{ fontSize: 12 }}>边框颜色</label>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="color" value={cfg.borderSettings.color} onChange={(e) => setBorder({ color: e.target.value })} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
              <input className="dae-input" value={cfg.borderSettings.color} onChange={(e) => setBorder({ color: e.target.value })} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
            </div>
          </div>
        </div>
      </StyleCollapseItem>

      {/* 提示 */}
      <StyleCollapseItem defaultOpen={true} title="提示" enabled={cfg.styleSwitches.tooltip} onToggle={() => toggleStyle('tooltip')}>
        <div className="dae-form-group" style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 12 }}>触发方式</label>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['hover', 'click'] as const).map((t) => (
              <button key={t} className={`de-mid-chart-btn ${cfg.tooltipSettings.trigger === t ? 'active' : ''}`} style={{ flex: 1, height: 28, fontSize: 12 }} onClick={() => setTooltip({ trigger: t })}>
                {t === 'hover' ? '悬停' : '点击'}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label style={{ fontSize: 12 }}>背景色</label>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="color" value={cfg.tooltipSettings.bgColor} onChange={(e) => setTooltip({ bgColor: e.target.value })} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
              <input className="dae-input" value={cfg.tooltipSettings.bgColor} onChange={(e) => setTooltip({ bgColor: e.target.value })} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
            </div>
          </div>
          <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label style={{ fontSize: 12 }}>文字颜色</label>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="color" value={cfg.tooltipSettings.textColor} onChange={(e) => setTooltip({ textColor: e.target.value })} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
              <input className="dae-input" value={cfg.tooltipSettings.textColor} onChange={(e) => setTooltip({ textColor: e.target.value })} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label style={{ fontSize: 12 }}>边框颜色</label>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="color" value={cfg.tooltipSettings.borderColor} onChange={(e) => setTooltip({ borderColor: e.target.value })} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
              <input className="dae-input" value={cfg.tooltipSettings.borderColor} onChange={(e) => setTooltip({ borderColor: e.target.value })} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
            </div>
          </div>
          <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label style={{ fontSize: 12 }}>圆角</label>
            <input className="dae-input" style={{ fontSize: 13 }} value={cfg.tooltipSettings.borderRadius} onChange={(e) => setTooltip({ borderRadius: e.target.value })} />
          </div>
        </div>
      </StyleCollapseItem>

      {/* 表头 */}
      <StyleCollapseItem defaultOpen={true} title="表头" enabled={cfg.styleSwitches.tableHeader} onToggle={() => toggleStyle('tableHeader')}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label style={{ fontSize: 12 }}>背景色</label>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="color" value={cfg.headerSettings.bgColor} onChange={(e) => setHeader({ bgColor: e.target.value })} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
              <input className="dae-input" value={cfg.headerSettings.bgColor} onChange={(e) => setHeader({ bgColor: e.target.value })} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
            </div>
          </div>
          <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label style={{ fontSize: 12 }}>文字颜色</label>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="color" value={cfg.headerSettings.textColor} onChange={(e) => setHeader({ textColor: e.target.value })} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
              <input className="dae-input" value={cfg.headerSettings.textColor} onChange={(e) => setHeader({ textColor: e.target.value })} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label style={{ fontSize: 12 }}>字体大小</label>
            <select className="dae-input" style={{ fontSize: 13 }} value={cfg.headerSettings.fontSize} onChange={(e) => setHeader({ fontSize: e.target.value })}>
              {['12', '13', '14', '15', '16'].map((s) => (<option key={s} value={s}>{s}px</option>))}
            </select>
          </div>
          <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label style={{ fontSize: 12 }}>字重</label>
            <select className="dae-input" style={{ fontSize: 13 }} value={cfg.headerSettings.fontWeight} onChange={(e) => setHeader({ fontWeight: e.target.value })}>
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
                <button key={a} className={`de-mid-chart-btn ${cfg.headerSettings.align === a ? 'active' : ''}`} style={{ flex: 1, height: 28, fontSize: 12 }} onClick={() => setHeader({ align: a })}>
                  {a === 'left' ? '左' : a === 'center' ? '中' : '右'}
                </button>
              ))}
            </div>
          </div>
          <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label style={{ fontSize: 12 }}>行高</label>
            <input className="dae-input" style={{ fontSize: 13 }} value={cfg.headerSettings.height} onChange={(e) => setHeader({ height: e.target.value })} />
          </div>
        </div>
      </StyleCollapseItem>

      {/* 单元格 */}
      <StyleCollapseItem defaultOpen={true} title="单元格" enabled={cfg.styleSwitches.cell} onToggle={() => toggleStyle('cell')}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label style={{ fontSize: 12 }}>字体大小</label>
            <select className="dae-input" style={{ fontSize: 13 }} value={cfg.cellSettings.fontSize} onChange={(e) => setCell({ fontSize: e.target.value })}>
              {['11', '12', '13', '14'].map((s) => (<option key={s} value={s}>{s}px</option>))}
            </select>
          </div>
          <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label style={{ fontSize: 12 }}>内边距</label>
            <input className="dae-input" style={{ fontSize: 13 }} value={cfg.cellSettings.padding} onChange={(e) => setCell({ padding: e.target.value })} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label style={{ fontSize: 12 }}>文字颜色</label>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="color" value={cfg.cellSettings.textColor} onChange={(e) => setCell({ textColor: e.target.value })} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
              <input className="dae-input" value={cfg.cellSettings.textColor} onChange={(e) => setCell({ textColor: e.target.value })} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
            </div>
          </div>
          <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label style={{ fontSize: 12 }}>行高</label>
            <input className="dae-input" style={{ fontSize: 13 }} value={cfg.cellSettings.lineHeight} onChange={(e) => setCell({ lineHeight: e.target.value })} />
          </div>
        </div>
        <div className="dae-form-group" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: 12 }}>对齐</label>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['left', 'center', 'right'] as const).map((a) => (
              <button key={a} className={`de-mid-chart-btn ${cfg.cellSettings.align === a ? 'active' : ''}`} style={{ flex: 1, height: 28, fontSize: 12 }} onClick={() => setCell({ align: a })}>
                {a === 'left' ? '左' : a === 'center' ? '中' : '右'}
              </button>
            ))}
          </div>
        </div>
      </StyleCollapseItem>

      {/* 总计 */}
      <StyleCollapseItem defaultOpen={true} title="总计" enabled={cfg.styleSwitches.total} onToggle={() => toggleStyle('total')}>
        <div className="dae-form-group" style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 12 }}>位置</label>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['top', 'bottom'] as const).map((p) => (
              <button key={p} className={`de-mid-chart-btn ${cfg.totalSettings.position === p ? 'active' : ''}`} style={{ flex: 1, height: 28, fontSize: 12 }} onClick={() => setTotal({ position: p })}>
                {p === 'top' ? '顶部' : '底部'}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label style={{ fontSize: 12 }}>标签</label>
            <input className="dae-input" style={{ fontSize: 13 }} value={cfg.totalSettings.label} onChange={(e) => setTotal({ label: e.target.value })} />
          </div>
          <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label style={{ fontSize: 12 }}>字体大小</label>
            <select className="dae-input" style={{ fontSize: 13 }} value={cfg.totalSettings.fontSize} onChange={(e) => setTotal({ fontSize: e.target.value })}>
              {['12', '13', '14', '15', '16'].map((s) => (<option key={s} value={s}>{s}px</option>))}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label style={{ fontSize: 12 }}>字重</label>
            <select className="dae-input" style={{ fontSize: 13 }} value={cfg.totalSettings.fontWeight} onChange={(e) => setTotal({ fontWeight: e.target.value })}>
              <option value="400">常规</option>
              <option value="500">中等</option>
              <option value="600">半粗</option>
              <option value="700">粗体</option>
            </select>
          </div>
          <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label style={{ fontSize: 12 }}>背景色</label>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="color" value={cfg.totalSettings.bgColor} onChange={(e) => setTotal({ bgColor: e.target.value })} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
              <input className="dae-input" value={cfg.totalSettings.bgColor} onChange={(e) => setTotal({ bgColor: e.target.value })} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
            </div>
          </div>
        </div>
        <div className="dae-form-group" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: 12 }}>文字颜色</label>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="color" value={cfg.totalSettings.textColor} onChange={(e) => setTotal({ textColor: e.target.value })} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
            <input className="dae-input" value={cfg.totalSettings.textColor} onChange={(e) => setTotal({ textColor: e.target.value })} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
          </div>
        </div>
      </StyleCollapseItem>

      {/* 功能设置 */}
      <StyleCollapseItem defaultOpen={true} title="功能设置" enabled={cfg.styleSwitches.funcSettings} onToggle={() => toggleStyle('funcSettings')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={cfg.funcSettings.exportExcel} onChange={(e) => setFunc({ exportExcel: e.target.checked })} />
            支持导出 Excel
          </label>
          <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={cfg.funcSettings.drillDown} onChange={(e) => setFunc({ drillDown: e.target.checked })} />
            支持数据下钻
          </label>
          <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={cfg.funcSettings.showLegend} onChange={(e) => setFunc({ showLegend: e.target.checked })} />
            显示图例
          </label>
          <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={cfg.funcSettings.showDataLabel} onChange={(e) => setFunc({ showDataLabel: e.target.checked })} />
            显示数据标签
          </label>
          <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={cfg.funcSettings.enableLinkage} onChange={(e) => setFunc({ enableLinkage: e.target.checked })} />
            开启图表联动
          </label>
          <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={cfg.funcSettings.enableJump} onChange={(e) => setFunc({ enableJump: e.target.checked })} />
            开启跳转
          </label>
        </div>
      </StyleCollapseItem>

      {/* 滚动设置 */}
      <StyleCollapseItem defaultOpen={true} title="滚动设置" enabled={cfg.styleSwitches.scroll} onToggle={() => toggleStyle('scroll')}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label style={{ fontSize: 12 }}>最大高度</label>
            <input className="dae-input" style={{ fontSize: 13 }} value={cfg.scrollSettings.maxHeight} onChange={(e) => setScroll({ maxHeight: e.target.value })} />
          </div>
          <div className="dae-form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label style={{ fontSize: 12 }}>滚动间隔（秒）</label>
            <input className="dae-input" style={{ fontSize: 13 }} value={cfg.scrollSettings.scrollInterval} onChange={(e) => setScroll({ scrollInterval: e.target.value })} disabled={!cfg.scrollSettings.autoScroll} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={cfg.scrollSettings.x} onChange={(e) => setScroll({ x: e.target.checked })} />
            横向滚动
          </label>
          <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={cfg.scrollSettings.y} onChange={(e) => setScroll({ y: e.target.checked })} />
            纵向滚动
          </label>
          <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={cfg.scrollSettings.autoScroll} onChange={(e) => setScroll({ autoScroll: e.target.checked })} />
            自动轮播滚动
          </label>
          <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={cfg.scrollSettings.scrollbarVisible} onChange={(e) => setScroll({ scrollbarVisible: e.target.checked })} />
            显示滚动条
          </label>
        </div>
      </StyleCollapseItem>

      {/* 条件样式 */}
      <StyleCollapseItem defaultOpen={true} title="条件样式" enabled={cfg.styleSwitches.conditional} onToggle={() => toggleStyle('conditional')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>已配置 {cfg.conditionalRules.length} 条规则</span>
          <button className="dae-btn dae-btn-secondary dae-btn-sm" onClick={onOpenConditional}>
            <Settings2 size={12} />
            配置规则
          </button>
        </div>
      </StyleCollapseItem>

      {/* 操作 */}
      <ConfigSection title="操作">
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="dae-btn dae-btn-secondary dae-btn-sm" style={{ flex: 1 }} onClick={onDuplicate}>
            <Copy size={12} />
            复制
          </button>
          <button className="dae-btn dae-btn-secondary dae-btn-sm" style={{ flex: 1, color: '#ef4444' }} onClick={onDelete}>
            <Trash2 size={12} />
            删除
          </button>
        </div>
      </ConfigSection>
    </div>
  );
}

/* ========== 主页面 ========== */
export default function DataScreenConfigPage() {
  const hashParams = useHashParams();
  const screenId = hashParams['screenId'];
  const sourceScreen = useMemo(() => dataScreens.find((s) => s.id === screenId), [screenId]);
  const parsed = parseResolution(sourceScreen?.resolution || '1920×1080');

  const [config, setConfig] = useState<ScreenConfig>(() => {
    const base: ScreenConfig = {
      id: sourceScreen?.id || generateId('screen'),
      name: sourceScreen?.name || '未命名大屏',
      resolution: sourceScreen?.resolution || '1920×1080',
      width: parsed.width,
      height: parsed.height,
      bgColor: sourceScreen?.bgColor || '#0b1121',
      bgImage: sourceScreen?.bgImage || '',
      gridEnabled: true,
      gridSize: 20,
      components: (sourceScreen?.components || []).map((c) => {
        const datasetName = c.datasetName || datasets[0]?.name || '';
        return {
          ...c,
          visible: true,
          locked: false,
          datasetName,
          config: {
            ...createCompConfig(c.name),
            dimensions: toSelectedFields(c.dimensions, datasetName, 'dimension'),
            metrics: toSelectedFields(c.metrics, datasetName, 'metric'),
          },
        };
      }),
    };
    return base;
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scale, setScale] = useState(0.42);
  const [activeLeftTab, setActiveLeftTab] = useState<'components' | 'layers'>('components');
  const [activeRightTab, setActiveRightTab] = useState<'property' | 'data' | 'interaction' | 'canvas'>('property');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [conditionalModalOpen, setConditionalModalOpen] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedComp = useMemo(
    () => config.components.find((c) => c.id === selectedId) || null,
    [config.components, selectedId]
  );

  const updateConfig = useCallback((patch: Partial<ScreenConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateComponent = useCallback((id: string, patch: Partial<ScreenComponent>) => {
    setConfig((prev) => ({
      ...prev,
      components: prev.components.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  /** 更新某个组件自己的配置（数据 + 样式） */
  const patchComponentConfig = useCallback((id: string, updater: (cfg: ScreenCompConfig) => ScreenCompConfig) => {
    setConfig((prev) => ({
      ...prev,
      components: prev.components.map((c) => (c.id === id ? { ...c, config: updater(c.config) } : c)),
    }));
  }, []);

  const patchSelectedConfig = useCallback<ConfigUpdater>(
    (updater) => {
      if (!selectedId) return;
      patchComponentConfig(selectedId, updater);
    },
    [selectedId, patchComponentConfig]
  );

  const updateSelectedComp = useCallback(
    (patch: Partial<ScreenComponent>) => {
      if (!selectedId) return;
      updateComponent(selectedId, patch);
    },
    [selectedId, updateComponent]
  );

  const addComponent = useCallback((type: ScreenCompType, label: string, defaultW: number, defaultH: number) => {
    const name = `新${label}`;
    const newComp: ScreenComponent = {
      id: generateId('comp'),
      name,
      type,
      x: Math.round((config.width - defaultW) / 2 / config.gridSize) * config.gridSize,
      y: Math.round((config.height - defaultH) / 2 / config.gridSize) * config.gridSize,
      w: defaultW,
      h: defaultH,
      visible: true,
      locked: false,
      datasetName: datasets[0]?.name || '',
      config: createCompConfig(name),
    };
    setConfig((prev) => ({ ...prev, components: [...prev.components, newComp] }));
    setSelectedId(newComp.id);
    setActiveRightTab('data');
  }, [config.width, config.height, config.gridSize]);

  const deleteComponent = useCallback((id: string) => {
    setConfig((prev) => ({
      ...prev,
      components: prev.components.filter((c) => c.id !== id),
    }));
    setSelectedId((cur) => (cur === id ? null : cur));
  }, []);

  const duplicateComponent = useCallback((id: string) => {
    setConfig((prev) => {
      const target = prev.components.find((c) => c.id === id);
      if (!target) return prev;
      const copy: ScreenComponent = {
        ...target,
        id: generateId('comp'),
        name: `${target.name}_副本`,
        x: target.x + 20,
        y: target.y + 20,
        config: { ...target.config },
      };
      return { ...prev, components: [...prev.components, copy] };
    });
  }, []);

  const handleResolutionChange = useCallback((resolution: string) => {
    const { width, height } = parseResolution(resolution);
    updateConfig({ resolution, width, height });
  }, [updateConfig]);

  const goBack = () => {
    window.location.hash = 'page=data-screen';
  };

  const handleSave = () => {
    // 实际项目中调用 API 保存
    alert('大屏配置已保存（演示）');
  };

  const handlePreview = () => {
    window.open(`${window.location.pathname}#page=data-screen-preview&screenId=${config.id}`, '_blank');
  };

  const onCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#f1f5f9' }}>
      {/* 顶部工具栏 */}
      <div
        style={{
          height: 54,
          background: '#fff',
          borderBottom: '1px solid var(--dae-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          flexShrink: 0,
        }}
      >
        {/* 左侧：返回 + 名称 + 撤销/重做 + 分辨率 */}
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
            value={config.name}
            onChange={(e) => updateConfig({ name: e.target.value })}
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
              style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff', cursor: 'pointer', color: 'var(--dae-ink-secondary)' }}
            >
              <Undo2 size={14} />
            </button>
            <button
              title="重做"
              style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff', cursor: 'pointer', color: 'var(--dae-ink-secondary)' }}
            >
              <Redo2 size={14} />
            </button>
          </div>
          <div style={{ width: 1, height: 20, background: 'var(--dae-border)', margin: '0 4px' }} />
          <select
            className="dae-input"
            style={{ width: 130, fontSize: 13 }}
            value={config.resolution}
            onChange={(e) => handleResolutionChange(e.target.value)}
          >
            {resolutions.map((r) => (
              <option key={r.label} value={r.label}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* 右侧：缩放 + 预览/保存 */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <button className="dae-btn dae-btn-secondary dae-btn-sm" onClick={() => setScale((s) => Math.max(0.2, s - 0.05))}>-</button>
          <span style={{ fontSize: 13, color: 'var(--dae-ink-secondary)', minWidth: 46, textAlign: 'center' }}>{Math.round(scale * 100)}%</span>
          <button className="dae-btn dae-btn-secondary dae-btn-sm" onClick={() => setScale((s) => Math.min(1, s + 0.05))}>+</button>
          <div style={{ width: 1, height: 20, background: 'var(--dae-border)', margin: '0 4px' }} />
          <button className="dae-btn dae-btn-secondary" onClick={handlePreview}>
            <Eye size={16} />
            预览
          </button>
          <button className="dae-btn dae-btn-primary" onClick={handleSave}>
            <Save size={16} />
            保存
          </button>
        </div>
      </div>

      {/* 主体 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 左侧面板 */}
        <div
          style={{
            width: 240,
            background: '#fff',
            borderRight: '1px solid var(--dae-border)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', borderBottom: '1px solid var(--dae-border)' }}>
            <button
              className={`de-screen-tab ${activeLeftTab === 'components' ? 'active' : ''}`}
              onClick={() => setActiveLeftTab('components')}
              style={{ flex: 1, padding: '10px 0', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Grid3X3 size={14} />
              组件
            </button>
            <button
              className={`de-screen-tab ${activeLeftTab === 'layers' ? 'active' : ''}`}
              onClick={() => setActiveLeftTab('layers')}
              style={{ flex: 1, padding: '10px 0', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Layers size={14} />
              图层
            </button>
          </div>

          <div style={{ flex: 1, overflow: 'auto' }} className="dae-scroll">
            {activeLeftTab === 'components' && (
              <div style={{ padding: 12, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {componentLibrary.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      className="de-screen-comp-btn"
                      onClick={() => addComponent(item.key, item.label, item.defaultW, item.defaultH)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                        padding: '14px 8px',
                        border: '1px solid var(--dae-border)',
                        borderRadius: 8,
                        background: '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      <Icon size={20} style={{ color: 'var(--dae-primary)' }} />
                      <span style={{ fontSize: 12, color: 'var(--dae-ink-secondary)' }}>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {activeLeftTab === 'layers' && (
              <div style={{ padding: 8 }}>
                {config.components.length === 0 && (
                  <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)', textAlign: 'center', padding: 20 }}>暂无组件</div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[...config.components].reverse().map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedId(c.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 10px',
                        borderRadius: 6,
                        background: selectedId === c.id ? 'var(--dae-primary-light)' : '#f8fafc',
                        border: selectedId === c.id ? '1px solid var(--dae-primary)' : '1px solid transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <GripVertical size={14} style={{ color: 'var(--dae-ink-muted)' }} />
                      <span style={{ flex: 1, fontSize: 12, color: 'var(--dae-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); updateComponent(c.id, { visible: c.visible === false ? true : false }); }}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 2 }}
                      >
                        {c.visible === false ? <EyeOff size={14} style={{ color: 'var(--dae-ink-muted)' }} /> : <Eye size={14} style={{ color: 'var(--dae-ink-muted)' }} />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); updateComponent(c.id, { locked: !c.locked }); }}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 2 }}
                      >
                        {c.locked ? <Lock size={14} style={{ color: 'var(--dae-primary)' }} /> : <Unlock size={14} style={{ color: 'var(--dae-ink-muted)' }} />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteComponent(c.id); }}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 2 }}
                      >
                        <Trash2 size={14} style={{ color: '#ef4444' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 中间画布 */}
        <div
          style={{
            flex: 1,
            background: '#e2e8f0',
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
          }}
          className="dae-scroll"
        >
          <div
            ref={canvasRef}
            onClick={onCanvasClick}
            style={{
              width: config.width * scale,
              height: config.height * scale,
              background: config.bgColor,
              backgroundImage: config.bgImage ? `url(${config.bgImage})` : undefined,
              backgroundSize: 'cover',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              overflow: 'hidden',
              transformOrigin: 'center center',
            }}
          >
            {config.gridEnabled && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
                  backgroundSize: `${config.gridSize * scale}px ${config.gridSize * scale}px`,
                }}
              />
            )}
            {config.components.filter((c) => c.visible !== false).length === 0 && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', gap: 10, pointerEvents: 'none' }}>
                <Grid3X3 size={40} style={{ opacity: 0.7 }} />
                <div style={{ fontSize: 14 }}>画布为空，点击上方「组件」工具栏添加大屏组件</div>
              </div>
            )}
            {config.components
              .filter((c) => c.visible !== false)
              .map((c) => {
                const cfg = c.config;
                const compBg = cfg.styleSwitches.background
                  ? cfg.bgSettings.gradientEnabled
                    ? `linear-gradient(180deg, ${cfg.bgSettings.gradientFrom}, ${cfg.bgSettings.gradientTo})`
                    : cfg.bgSettings.color
                  : 'transparent';
                const compBorder = cfg.styleSwitches.border
                  ? `${Math.max(1, parseInt(cfg.borderSettings.width, 10) || 0)}px ${cfg.borderSettings.style} ${cfg.borderSettings.color}`
                  : '1px solid rgba(255,255,255,0.15)';
                const showTitle = cfg.styleSwitches.title && cfg.titleSettings.visible;
                return (
                  <div
                    key={c.id}
                    onClick={(e) => { e.stopPropagation(); setSelectedId(c.id); }}
                    style={{
                      position: 'absolute',
                      left: c.x * scale,
                      top: c.y * scale,
                      width: c.w * scale,
                      height: c.h * scale,
                      border: selectedId === c.id ? '2px solid #3b82f6' : compBorder,
                      background: compBg,
                      borderRadius: (parseInt(cfg.borderSettings.radius, 10) || 0) * scale,
                      overflow: 'hidden',
                      cursor: c.locked ? 'default' : 'pointer',
                      boxShadow: selectedId === c.id ? '0 0 0 2px rgba(59,130,246,0.35)' : 'none',
                    }}
                  >
                    <div style={{ padding: (parseInt(cfg.bgSettings.padding, 10) || 0) * scale, color: cfg.cellSettings.textColor, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {showTitle && (
                        <div
                          style={{
                            fontSize: (parseInt(cfg.titleSettings.fontSize, 10) || 14) * scale,
                            fontWeight: parseInt(cfg.titleSettings.fontWeight, 10) || 600,
                            color: cfg.titleSettings.color,
                            textAlign: cfg.titleSettings.align,
                            marginBottom: (parseInt(cfg.titleSettings.marginBottom, 10) || 0) * scale,
                          }}
                        >
                          {cfg.titleSettings.content || c.name}
                        </div>
                      )}
                      <div style={{ flex: 1, minHeight: 0 }}>
                        {c.type === 'card' && (
                          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                            <div style={{ fontSize: 28 * scale, fontWeight: 700, color: cfg.chartPalette }}>1,234</div>
                            <div style={{ fontSize: 12 * scale, opacity: 0.7, marginTop: 4 * scale }}>{cfg.metrics[0]?.alias || cfg.metrics[0]?.name || '实时数值'}</div>
                          </div>
                        )}
                        {c.type === 'text' && (
                          <div style={{ fontSize: 18 * scale, opacity: 0.85 }}>{cfg.titleSettings.content || c.name}</div>
                        )}
                        {['bar', 'line', 'area', 'pie'].includes(c.type) && (
                          <div style={{ width: '100%', height: '100%' }}>
                            <ChartRenderer
                              type={c.type as 'bar' | 'line' | 'area' | 'pie'}
                              data={c.type === 'pie' ? pieSampleData : chartSampleData}
                              xKey="name"
                              yKeys={c.type === 'pie' ? undefined : ['value', 'value2']}
                              height={c.h * scale}
                            />
                          </div>
                        )}
                        {c.type === 'image' && (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.08)', fontSize: 12 * scale, opacity: 0.6 }}>
                            <Image size={24 * scale} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* 右侧面板 */}
        <div
          style={{
            width: 280,
            background: '#fff',
            borderLeft: '1px solid var(--dae-border)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', borderBottom: '1px solid var(--dae-border)' }}>
            {[
              { key: 'property', label: '属性', icon: Settings },
              { key: 'data', label: '数据', icon: BarChart3 },
              { key: 'interaction', label: '交互', icon: Move },
              { key: 'canvas', label: '画布', icon: Maximize },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  className={`de-screen-tab ${activeRightTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveRightTab(tab.key as 'property' | 'data' | 'interaction' | 'canvas')}
                  style={{ flex: 1, padding: '10px 0', fontSize: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div style={{ flex: 1, overflow: 'auto' }} className="dae-scroll">
            {activeRightTab === 'property' && selectedComp && (
              <StyleTabPanel
                key={selectedComp.id}
                comp={selectedComp}
                patchConfig={patchSelectedConfig}
                onOpenConditional={() => setConditionalModalOpen(true)}
                onDuplicate={() => duplicateComponent(selectedComp.id)}
                onDelete={() => deleteComponent(selectedComp.id)}
              />
            )}

            {activeRightTab === 'property' && !selectedComp && (
              <div style={{ fontSize: 13, color: 'var(--dae-ink-muted)', textAlign: 'center', padding: 40 }}>请在画布上选择一个组件</div>
            )}

            {activeRightTab === 'data' && selectedComp && (
              <DataTabPanel
                key={selectedComp.id}
                comp={selectedComp}
                onUpdateComp={updateSelectedComp}
                patchConfig={patchSelectedConfig}
                onOpenFilter={() => setFilterModalOpen(true)}
              />
            )}

            {activeRightTab === 'data' && !selectedComp && (
              <div style={{ fontSize: 13, color: 'var(--dae-ink-muted)', textAlign: 'center', padding: 40 }}>请选择组件后配置数据</div>
            )}

            {activeRightTab === 'interaction' && selectedComp && (
              <>
                <ConfigSection title="交互事件">
                  <div className="dae-form-group" style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 12 }}>触发方式</label>
                    <select className="dae-input" style={{ fontSize: 13 }} defaultValue="click">
                      <option value="click">点击</option>
                      <option value="hover">悬停</option>
                    </select>
                  </div>
                  <div className="dae-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: 12 }}>交互类型</label>
                    <select className="dae-input" style={{ fontSize: 13 }} defaultValue="none">
                      <option value="none">无</option>
                      <option value="link">页面跳转</option>
                      <option value="screen">切换大屏</option>
                      <option value="component">联动组件</option>
                    </select>
                  </div>
                </ConfigSection>

                <ConfigSection title="联动配置">
                  <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)', marginBottom: 10 }}>选择联动目标组件</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {config.components
                      .filter((c) => c.id !== selectedComp.id)
                      .map((c) => (
                        <label key={c.id} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                          <input type="checkbox" />
                          {c.name}
                        </label>
                      ))}
                  </div>
                </ConfigSection>

                <ConfigSection title="动画效果">
                  <div className="dae-form-group" style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 12 }}>入场动画</label>
                    <select className="dae-input" style={{ fontSize: 13 }} defaultValue="fade">
                      <option value="none">无</option>
                      <option value="fade">淡入</option>
                      <option value="scale">缩放</option>
                      <option value="slide">滑入</option>
                    </select>
                  </div>
                  <div className="dae-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: 12 }}>动画时长（秒）</label>
                    <input className="dae-input" type="number" style={{ fontSize: 13 }} defaultValue={0.6} step={0.1} />
                  </div>
                </ConfigSection>
              </>
            )}

            {activeRightTab === 'interaction' && !selectedComp && (
              <div style={{ fontSize: 13, color: 'var(--dae-ink-muted)', textAlign: 'center', padding: 40 }}>请选择组件后配置交互</div>
            )}

            {activeRightTab === 'canvas' && (
              <>
                <ConfigSection title="画布尺寸">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div className="dae-form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: 12 }}>宽度</label>
                      <input className="dae-input" type="number" style={{ fontSize: 13 }} value={config.width} onChange={(e) => updateConfig({ width: parseInt(e.target.value, 10) || 0 })} />
                    </div>
                    <div className="dae-form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: 12 }}>高度</label>
                      <input className="dae-input" type="number" style={{ fontSize: 13 }} value={config.height} onChange={(e) => updateConfig({ height: parseInt(e.target.value, 10) || 0 })} />
                    </div>
                  </div>
                </ConfigSection>

                <ConfigSection title="画布背景">
                  <div className="dae-form-group" style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 12 }}>背景颜色</label>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="color" value={config.bgColor} onChange={(e) => updateConfig({ bgColor: e.target.value })} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
                      <input className="dae-input" value={config.bgColor} onChange={(e) => updateConfig({ bgColor: e.target.value })} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
                    </div>
                  </div>
                  <div className="dae-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: 12 }}>背景图片 URL</label>
                    <input className="dae-input" style={{ fontSize: 13 }} value={config.bgImage} onChange={(e) => updateConfig({ bgImage: e.target.value })} placeholder="请输入图片地址" />
                  </div>
                </ConfigSection>

                <ConfigSection title="网格设置">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <input id="gridEnabled" type="checkbox" checked={config.gridEnabled} onChange={(e) => updateConfig({ gridEnabled: e.target.checked })} />
                    <label htmlFor="gridEnabled" style={{ fontSize: 12, cursor: 'pointer' }}>显示网格</label>
                  </div>
                  <div className="dae-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: 12 }}>网格大小</label>
                    <input className="dae-input" type="number" style={{ fontSize: 13 }} value={config.gridSize} onChange={(e) => updateConfig({ gridSize: parseInt(e.target.value, 10) || 1 })} />
                  </div>
                </ConfigSection>

                <ConfigSection title="全局设置">
                  <div className="dae-form-group" style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 12 }}>大屏标题</label>
                    <input className="dae-input" style={{ fontSize: 13 }} value={config.name} onChange={(e) => updateConfig({ name: e.target.value })} />
                  </div>
                  <div className="dae-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: 12 }}>默认缩放</label>
                    <input className="dae-input" type="number" style={{ fontSize: 13 }} value={Math.round(scale * 100)} onChange={(e) => setScale((parseInt(e.target.value, 10) || 0) / 100)} />
                  </div>
                </ConfigSection>
              </>
            )}
          </div>
        </div>
      </div>

      <FilterModal
        open={filterModalOpen && !!selectedComp}
        onClose={() => setFilterModalOpen(false)}
        dimensions={selectedComp?.config.dimensions || []}
        metrics={selectedComp?.config.metrics || []}
        conditions={selectedComp?.config.filterConditions || []}
        onChange={(v) => patchSelectedConfig((c) => ({ ...c, filterConditions: v }))}
      />
      <ConditionalStyleModal
        open={conditionalModalOpen && !!selectedComp}
        onClose={() => setConditionalModalOpen(false)}
        conditions={selectedComp?.config.conditionalRules || []}
        onChange={(v) => patchSelectedConfig((c) => ({ ...c, conditionalRules: v }))}
      />
    </div>
  );
}
