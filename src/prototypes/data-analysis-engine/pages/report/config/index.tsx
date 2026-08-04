import React, { useState, useRef, useEffect, useCallback } from 'react';
import '../../../style.css';

/* ---------- 类型定义 ---------- */

interface DatasetOption {
  id: string;
  name: string;
  dimensions: string[];
  metrics: string[];
}

interface DimensionConfig {
  id: string;
  fieldName: string;
  alias: string;
  sortOrder: 'none' | 'asc' | 'desc';
  dateDisplay: 'year-month-day' | 'year-month' | 'year';
  dateFormat: string;
  visible: boolean;
}

interface MetricConfig {
  id: string;
  fieldName: string;
  alias: string;
  aggregation: 'sum' | 'avg' | 'max' | 'min' | 'count';
  numberFormat: string;
  decimals: number;
  visible: boolean;
}

interface FilterCondition {
  id: string;
  field: string;
  operator: '=' | '!=' | 'contains' | '>' | '<' | 'between';
  value: string;
  valueTo?: string;
}

interface ActiveMenuState {
  type: 'dimension' | 'metric';
  fieldId: string;
  triggerRect: DOMRect;
}

interface EditNameModalState {
  type: 'dimension' | 'metric';
  fieldId: string;
  originalName: string;
  currentAlias: string;
}

/* ---------- 模拟数据 ---------- */

const datasetOptions: DatasetOption[] = [
  {
    id: 'ds1',
    name: '订单明细数据集',
    dimensions: ['订单日期', '省份', '城市', '商品品类', '商品名称'],
    metrics: ['订单金额', '订单数量', '优惠金额', '实付金额'],
  },
  {
    id: 'ds2',
    name: '用户画像数据集',
    dimensions: ['注册日期', '性别', '年龄段', '所在城市', '会员等级'],
    metrics: ['消费总额', '订单次数'],
  },
  {
    id: 'ds3',
    name: '商品信息数据集',
    dimensions: ['商品名称', '商品品类', '品牌', '上架日期'],
    metrics: ['库存数量', '单价', '销量', '评分'],
  },
  {
    id: 'ds4',
    name: '物流轨迹数据集',
    dimensions: ['物流单号', '发货城市', '收货城市', '承运商', '状态'],
    metrics: ['运输时长(小时)', '运费', '签收率'],
  },
  {
    id: 'ds5',
    name: '财务报表数据集',
    dimensions: ['会计期间', '科目名称', '部门', '币种'],
    metrics: ['期初余额', '本期发生额', '期末余额', '累计发生额'],
  },
];

const previewData = [
  { 订单日期: '2026-01', 省份: '广东省', 商品品类: '电子产品', 订单金额: '125,680', 订单数量: '328' },
  { 订单日期: '2026-02', 省份: '浙江省', 商品品类: '服装配饰', 订单金额: '98,450', 订单数量: '256' },
  { 订单日期: '2026-03', 省份: '江苏省', 商品品类: '食品饮料', 订单金额: '156,230', 订单数量: '412' },
  { 订单日期: '2026-04', 省份: '四川省', 商品品类: '家居用品', 订单金额: '87,920', 订单数量: '198' },
  { 订单日期: '2026-05', 省份: '湖北省', 商品品类: '电子产品', 订单金额: '203,560', 订单数量: '534' },
  { 订单日期: '2026-06', 省份: '山东省', 商品品类: '服装配饰', 订单金额: '178,340', 订单数量: '467' },
];

const operatorLabels: Record<FilterCondition['operator'], string> = {
  '=': '等于',
  '!=': '不等于',
  contains: '包含',
  '>': '大于',
  '<': '小于',
  between: '介于',
};

const fieldOptions = ['订单日期', '省份', '城市', '商品品类', '商品名称', '销售额', '订单量'];

const aggregationLabels: Record<MetricConfig['aggregation'], string> = {
  sum: '求和',
  avg: '平均',
  max: '最大值',
  min: '最小值',
  count: '计数',
};

const sortLabels: Record<DimensionConfig['sortOrder'], string> = {
  none: '无',
  asc: '升序',
  desc: '降序',
};

const dateDisplayLabels: Record<DimensionConfig['dateDisplay'], string> = {
  'year-month-day': '年月日',
  'year-month': '年月',
  'year': '年',
};

const dateFormatOptions = [
  { value: 'yyyy-MM-dd', label: 'yyyy-MM-dd' },
  { value: 'yyyy/MM/dd', label: 'yyyy/MM/dd' },
  { value: 'yyyy年MM月dd日', label: 'yyyy年MM月dd日' },
  { value: 'MM/dd/yyyy', label: 'MM/dd/yyyy' },
  { value: 'dd/MM/yyyy', label: 'dd/MM/yyyy' },
];

const numberFormatOptions = [
  { value: '千分位', label: '千分位' },
  { value: '整数', label: '整数' },
  { value: '百分比', label: '百分比' },
  { value: '科学计数', label: '科学计数' },
];

/** 根据数据集维度列表生成默认配置 */
function buildDefaultDimensions(fields: string[]): DimensionConfig[] {
  return fields.map((f, i) => ({
    id: `d${Date.now()}_${i}`,
    fieldName: f,
    alias: f,
    sortOrder: 'none' as const,
    dateDisplay: 'year-month-day' as const,
    dateFormat: 'yyyy-MM-dd',
    visible: true,
  }));
}

function buildDefaultMetrics(fields: string[]): MetricConfig[] {
  return fields.map((f, i) => ({
    id: `m${Date.now()}_${i}`,
    fieldName: f,
    alias: f,
    aggregation: 'sum' as const,
    numberFormat: '千分位',
    decimals: 2,
    visible: true,
  }));
}

/* ========== 主组件 ========== */

export default function ReportConfigPage() {
  // 基础信息
  const [reportName, setReportName] = useState('月度销售分析报表');
  const [reportDesc, setReportDesc] = useState('按月份统计各维度的销售额与订单量趋势');

  // 数据集选择
  const [selectedDatasetId, setSelectedDatasetId] = useState('ds1');
  const selectedDataset = datasetOptions.find(d => d.id === selectedDatasetId)!;

  // 维度配置
  const [dimensions, setDimensions] = useState<DimensionConfig[]>(() =>
    buildDefaultDimensions(datasetOptions[0].dimensions)
  );

  // 指标配置
  const [metrics, setMetrics] = useState<MetricConfig[]>(() =>
    buildDefaultMetrics(datasetOptions[0].metrics)
  );

  // 下拉菜单状态
  const [activeMenu, setActiveMenu] = useState<ActiveMenuState | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // 编辑显示名称弹窗
  const [editNameModal, setEditNameModal] = useState<EditNameModalState | null>(null);
  const [editNameInput, setEditNameInput] = useState('');

  // 筛选条件
  const [filters, setFilters] = useState<FilterCondition[]>([
    { id: 'f1', field: '订单日期', operator: '>', value: '2025-01-01' },
  ]);
  const [filterEditing, setFilterEditing] = useState<string | null>(null);
  const [tempFilter, setTempFilter] = useState<{ field: string; operator: string; value: string }>({ field: '', operator: '=', value: '' });

  // 弹窗状态
  const [showAddDimModal, setShowAddDimModal] = useState(false);
  const [showAddMetricModal, setShowAddMetricModal] = useState(false);
  const [showAddFilterModal, setShowAddFilterModal] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  // 保存状态
  const [saveSuccess, setSaveSuccess] = useState(false);
  const pendingActionRef = useRef<'back' | 'cancel' | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  /* ---------- 菜单关闭逻辑 ---------- */

  useEffect(() => {
    if (!activeMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [activeMenu]);

  const closeMenu = useCallback(() => {
    setActiveMenu(null);
    setOpenSubmenu(null);
  }, []);

  /* ---------- 操作方法 ---------- */

  /** 切换数据集时自动加载所有维度和指标 */
  const handleDatasetChange = (datasetId: string) => {
    setSelectedDatasetId(datasetId);
    const ds = datasetOptions.find(d => d.id === datasetId)!;
    setDimensions(buildDefaultDimensions(ds.dimensions));
    setMetrics(buildDefaultMetrics(ds.metrics));
    setFilters([]);
    closeMenu();
  };

  /** 点击维度标签 */
  const handleTagClick = (e: React.MouseEvent, type: 'dimension' | 'metric', fieldId: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setActiveMenu({ type, fieldId, triggerRect: rect });
    setOpenSubmenu(null);
  };

  /** 更新维度属性 */
  const updateDimension = (id: string, key: keyof DimensionConfig, value: string | boolean) => {
    setDimensions(prev =>
      prev.map(d => (d.id === id ? { ...d, [key]: value } : d))
    );
  };

  /** 添加维度 */
  const handleAddDimension = (fieldName: string) => {
    setDimensions(prev => [
      ...prev,
      {
        id: `d${Date.now()}`,
        fieldName,
        alias: fieldName,
        sortOrder: 'none',
        dateDisplay: 'year-month-day',
        dateFormat: 'yyyy-MM-dd',
        visible: true,
      },
    ]);
    setShowAddDimModal(false);
  };

  /** 删除全部维度 */
  const handleRemoveAllDimensions = () => {
    setDimensions([]);
    closeMenu();
  };

  /** 删除单个维度 */
  const handleRemoveDimension = (id: string) => {
    setDimensions(prev => prev.filter(d => d.id !== id));
    closeMenu();
  };

  /** 切换维度显示隐藏 */
  const toggleDimension = (id: string) => {
    setDimensions(prev => prev.map(d =>
      d.id === id ? { ...d, visible: !d.visible } : d
    ));
  };

  /** 更新指标属性 */
  const updateMetric = (id: string, key: keyof MetricConfig, value: string | number | boolean) => {
    setMetrics(prev =>
      prev.map(m => (m.id === id ? { ...m, [key]: value } : m))
    );
  };

  /** 添加指标 */
  const handleAddMetric = (fieldName: string) => {
    setMetrics(prev => [
      ...prev,
      {
        id: `m${Date.now()}`,
        fieldName,
        alias: fieldName,
        aggregation: 'sum',
        numberFormat: '千分位',
        decimals: 2,
        visible: true,
      },
    ]);
    setShowAddMetricModal(false);
  };

  /** 删除全部指标 */
  const handleRemoveAllMetrics = () => {
    setMetrics([]);
    closeMenu();
  };

  /** 删除单个指标 */
  const handleRemoveMetric = (id: string) => {
    setMetrics(prev => prev.filter(m => m.id !== id));
    closeMenu();
  };

  /** 切换指标显示隐藏 */
  const toggleMetric = (id: string) => {
    setMetrics(prev => prev.map(m =>
      m.id === id ? { ...m, visible: !m.visible } : m
    ));
  };

  /** 打开编辑名称弹窗 */
  const openEditNameModal = (type: 'dimension' | 'metric', fieldId: string, originalName: string, currentAlias: string) => {
    setEditNameModal({ type, fieldId, originalName, currentAlias });
    setEditNameInput(currentAlias);
    closeMenu();
  };

  /** 确认编辑名称 */
  const confirmEditName = () => {
    if (!editNameModal || !editNameInput.trim()) return;
    if (editNameModal.type === 'dimension') {
      updateDimension(editNameModal.fieldId, 'alias', editNameInput.trim());
    } else {
      updateMetric(editNameModal.fieldId, 'alias', editNameInput.trim());
    }
    setEditNameModal(null);
  };

  /** 添加筛选条件 */
  const handleAddFilter = (filter: FilterCondition) => {
    setFilters(prev => [...prev, filter]);
    setShowAddFilterModal(false);
  };

  /** 删除筛选条件 */
  const handleRemoveFilter = (id: string) => {
    setFilters(prev => prev.filter(f => f.id !== id));
  };

  /** 开始编辑筛选条件 */
  const startEditFilter = (filter: FilterCondition) => {
    setFilterEditing(filter.id);
    setTempFilter({ field: filter.field, operator: filter.operator, value: filter.value });
  };

  /** 保存筛选条件 */
  const saveFilter = () => {
    if (!tempFilter.field) return;
    setFilters(prev => prev.map(f =>
      f.id === filterEditing ? { ...f, ...tempFilter } : f
    ));
    setFilterEditing(null);
  };

  /** 取消筛选编辑 */
  const cancelEditFilter = () => {
    setFilterEditing(null);
  };

  /** 未保存检测 */
  const hasUnsavedChanges =
    reportName !== '月度销售分析报表' ||
    reportDesc !== '按月份统计各维度的销售额与订单量趋势' ||
    filters.length > 1;

  /** 检查未保存变更 */
  const checkUnsavedThen = (action: 'back' | 'cancel') => {
    if (hasUnsavedChanges) {
      pendingActionRef.current = action;
      setShowUnsavedDialog(true);
    } else {
      goBack();
    }
  };

  const goBack = () => {
    window.location.hash = '#page=report';
  };

  /** 保存配置（模拟） */
  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  /** 未保存确认弹窗 - 保存并离开 */
  const handleSaveAndLeave = () => {
    handleSave();
    setShowUnsavedDialog(false);
    setTimeout(goBack, 300);
  };

  /** 未保存确认弹窗 - 不保存直接离开 */
  const handleDiscardAndLeave = () => {
    setShowUnsavedDialog(false);
    goBack();
  };

  /* ========== 渲染 ========== */

  // 当前操作的维度/指标对象
  const currentDim = activeMenu?.type === 'dimension'
    ? dimensions.find(d => d.id === activeMenu.fieldId)
    : null;
  const currentMetric = activeMenu?.type === 'metric'
    ? metrics.find(m => m.id === activeMenu.fieldId)
    : null;

  return (
    <div className="dae-page" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* ====== 顶部标题栏 ====== */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px', borderBottom: '1px solid var(--dae-border)',
        background: '#fff', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="dae-btn dae-btn-ghost dae-btn-sm" onClick={() => checkUnsavedThen('back')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--dae-ink)', margin: 0 }}>报表配置</h1>
          {saveSuccess && (
            <span style={{
              fontSize: '12px', color: 'var(--dae-success)', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 4,
              animation: 'fadeIn 0.3s ease',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              已保存
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="dae-btn dae-btn-secondary dae-btn-sm" onClick={() => checkUnsavedThen('cancel')}>关闭</button>
          <button className="dae-btn dae-btn-primary dae-btn-sm" onClick={handleSave}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            保存
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ====== 左侧面板：基础信息 + 数据集选择 + 可用字段 ====== */}
        <aside style={{ width: 300, borderRight: '1px solid var(--dae-border)', display: 'flex', flexDirection: 'column', background: '#fff', flexShrink: 0, overflow: 'auto' }}>

          {/* 基础信息区 */}
          <div style={{ padding: '16px', borderBottom: '1px solid var(--dae-border)' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--dae-ink-secondary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              基础信息
            </div>

            <div className="dae-form-group">
              <label>报表名称</label>
              <input
                className="dae-input"
                placeholder="请输入报表名称"
                value={reportName}
                onChange={e => setReportName(e.target.value)}
              />
            </div>

            <div className="dae-form-group" style={{ marginBottom: 0 }}>
              <label>报表描述</label>
              <textarea
                className="dae-input"
                rows={3}
                placeholder="简要描述该报表的用途和内容"
                value={reportDesc}
                onChange={e => setReportDesc(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          {/* 数据集选择区 */}
          <div style={{ padding: '16px', borderBottom: '1px solid var(--dae-border)' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--dae-ink-secondary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
              数据集选择
            </div>

            <select
              className="dae-input"
              value={selectedDatasetId}
              onChange={e => handleDatasetChange(e.target.value)}
            >
              {datasetOptions.map(ds => (
                <option key={ds.id} value={ds.id}>{ds.name}</option>
              ))}
            </select>
          </div>

          {/* 可用字段列表 */}
          <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--dae-ink-secondary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
              可用字段
            </div>

            {/* 维度字段 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--dae-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, paddingLeft: 2 }}>
                维度 ({selectedDataset.dimensions.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {selectedDataset.dimensions.map((field) => (
                  <div key={field} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 8px', borderRadius: 4,
                    fontSize: '12px', color: 'var(--dae-ink-secondary)',
                    background: dimensions.some(d => d.fieldName === field) ? 'var(--dae-surface)' : 'transparent',
                  }}>
                    <span className="de-field-icon de-field-dim">D</span>
                    <span>{field}</span>
                    {dimensions.some(d => d.fieldName === field) && (
                      <span style={{ fontSize: '10px', color: 'var(--dae-ink-muted)', marginLeft: 'auto' }}>已添加</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 指标字段 */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, paddingLeft: 2 }}>
                指标 ({selectedDataset.metrics.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {selectedDataset.metrics.map((field) => (
                  <div key={field} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 8px', borderRadius: 4,
                    fontSize: '12px', color: 'var(--dae-ink-secondary)',
                    background: metrics.some(m => m.fieldName === field) ? 'var(--dae-surface)' : 'transparent',
                  }}>
                    <span className="de-field-icon de-field-metric">#</span>
                    <span>{field}</span>
                    {metrics.some(m => m.fieldName === field) && (
                      <span style={{ fontSize: '10px', color: 'var(--dae-ink-muted)', marginLeft: 'auto' }}>已添加</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </aside>

        {/* ====== 右侧主区域（紧凑行式布局） ====== */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', background: 'var(--dae-surface)', padding: '16px 24px', gap: 12 }}>

          {/* ========== 区域 A：维度配置（行式标签布局） ========== */}
          <section style={{ background: '#fff', borderRadius: 'var(--dae-radius-md)', border: '1px solid var(--dae-border)', overflow: 'hidden' }}>
            {/* 标题栏 */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px', borderBottom: '1px solid var(--dae-border)',
              background: 'var(--dae-surface)',
            }}>
              <h2 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dae-ink)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--dae-primary)" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                维度配置
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--dae-ink-muted)', background: 'var(--dae-primary-light)', padding: '2px 8px', borderRadius: 10 }}>
                  {dimensions.length}
                </span>
              </h2>
              <button
                className="dae-btn dae-btn-secondary dae-btn-sm"
                onClick={() => setShowAddDimModal(true)}
                disabled={!selectedDataset || selectedDataset.dimensions.length === 0}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                添加维度
              </button>
            </div>

            {/* 维度标签行 */}
            {dimensions.length === 0 ? (
              <div className="dae-empty" style={{ padding: '28px 24px' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--dae-border-strong)" strokeWidth="1.5" opacity="0.5">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                </svg>
                <p>暂未配置维度，点击「添加维度」从数据集中选择</p>
              </div>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 16px',
                borderBottom: dimensions.length > 0 ? '1px solid var(--dae-border)' : 'none',
              }}>
                {/* 操作图标（删除全部） */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <button
                    title="删除"
                    onClick={handleRemoveAllDimensions}
                    style={{
                      width: 26, height: 26, borderRadius: 'var(--dae-radius-sm)', border: '1px solid var(--dae-border)',
                      background: '#fff', cursor: 'pointer', display: 'inline-flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: 'var(--dae-ink-muted)', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--dae-error)'; e.currentTarget.style.color = 'var(--dae-error)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--dae-border)'; e.currentTarget.style.color = 'var(--dae-ink-muted)'; }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                </div>

                {/* 标签列表（横向排列，点击打开配置弹框） */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, flex: 1, alignItems: 'center' }}>
                  {dimensions.map(dim => (
                    <div
                      key={dim.id}
                      onClick={(e) => handleTagClick(e, 'dimension', dim.id)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px',
                        borderRadius: 'var(--dae-radius-md)',
                        border: `1px solid ${dim.visible ? '#bae0ff' : 'var(--dae-border)'}`,
                        background: dim.visible ? '#e6f4ff' : 'var(--dae-surface)',
                        color: dim.visible ? '#1677FF' : 'var(--dae-ink-subtle)',
                        fontSize: '12px', fontWeight: 500,
                        cursor: 'pointer',
                        userSelect: 'none',
                        opacity: dim.visible ? 1 : 0.55,
                        transition: 'all 0.12s',
                      }}
                      onMouseEnter={e => {
                        if (dim.visible) {
                          e.currentTarget.style.borderColor = '#91caff';
                          e.currentTarget.style.boxShadow = '0 0 0 2px rgba(22,119,255,0.08)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (dim.visible) {
                          e.currentTarget.style.borderColor = dim.visible ? '#bae0ff' : 'var(--dae-border)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                      title="点击配置"
                    >
                      {/* 日历图标 */}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span>{dim.alias}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ========== 区域 B：指标配置（行式标签布局） ========== */}
          <section style={{ background: '#fff', borderRadius: 'var(--dae-radius-md)', border: '1px solid var(--dae-border)', overflow: 'hidden' }}>
            {/* 标题栏 */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px', borderBottom: '1px solid var(--dae-border)',
              background: 'var(--dae-surface)',
            }}>
              <h2 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dae-ink)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                指标配置
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#15803d', background: '#dcfce7', padding: '2px 8px', borderRadius: 10 }}>
                  {metrics.length}
                </span>
              </h2>
              <button
                className="dae-btn dae-btn-secondary dae-btn-sm"
                onClick={() => setShowAddMetricModal(true)}
                disabled={!selectedDataset || selectedDataset.metrics.length === 0}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                添加指标
              </button>
            </div>

            {/* 指标标签行 */}
            {metrics.length === 0 ? (
              <div className="dae-empty" style={{ padding: '28px 24px' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--dae-border-strong)" strokeWidth="1.5" opacity="0.5">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>
                <p>暂未配置指标，点击「添加指标」从数据集中选择</p>
              </div>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 16px',
              }}>
                {/* 操作图标（删除全部） */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <button
                    title="删除"
                    onClick={handleRemoveAllMetrics}
                    style={{
                      width: 26, height: 26, borderRadius: 'var(--dae-radius-sm)', border: '1px solid var(--dae-border)',
                      background: '#fff', cursor: 'pointer', display: 'inline-flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: 'var(--dae-ink-muted)', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--dae-error)'; e.currentTarget.style.color = 'var(--dae-error)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--dae-border)'; e.currentTarget.style.color = 'var(--dae-ink-muted)'; }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                </div>

                {/* 标签列表（横向排列，点击打开配置弹框） */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, flex: 1, alignItems: 'center' }}>
                  {metrics.map(metric => (
                    <div
                      key={metric.id}
                      onClick={(e) => handleTagClick(e, 'metric', metric.id)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px',
                        borderRadius: 'var(--dae-radius-md)',
                        border: `1px solid ${metric.visible ? '#bbf7d0' : 'var(--dae-border)'}`,
                        background: metric.visible ? '#dcfce7' : 'var(--dae-surface)',
                        color: metric.visible ? '#15803d' : 'var(--dae-ink-subtle)',
                        fontSize: '12px', fontWeight: 500,
                        cursor: 'pointer',
                        userSelect: 'none',
                        opacity: metric.visible ? 1 : 0.55,
                        transition: 'all 0.12s',
                      }}
                      onMouseEnter={e => {
                        if (metric.visible) {
                          e.currentTarget.style.borderColor = '#86efac';
                          e.currentTarget.style.boxShadow = '0 0 0 2px rgba(22,163,74,0.08)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (metric.visible) {
                          e.currentTarget.style.borderColor = metric.visible ? '#bbf7d0' : 'var(--dae-border)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                      title="点击配置"
                    >
                      {/* # 图标 */}
                      <span style={{
                        width: 14, height: 14, borderRadius: 3,
                        background: metric.visible ? 'rgba(22,163,74,0.15)' : 'transparent',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '10px', fontWeight: 700, flexShrink: 0,
                        color: 'inherit',
                      }}>#</span>
                      <span>{metric.alias}({aggregationLabels[metric.aggregation]})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ========== 区域 C：筛选条件 ========== */}
          <section style={{ background: '#fff', borderRadius: 'var(--dae-radius-md)', border: '1px solid var(--dae-border)', overflow: 'hidden' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px', borderBottom: filters.length > 0 ? '1px solid var(--dae-border)' : 'none',
              background: 'var(--dae-surface)',
            }}>
              <h2 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dae-ink)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                筛选条件
                <span style={{ fontSize: '11px', fontWeight: 500, color: '#92400e', background: '#fef3c7', padding: '1px 6px', borderRadius: 10 }}>
                  {filters.length}
                </span>
              </h2>
              <button
                className="dae-btn dae-btn-secondary dae-btn-sm"
                onClick={() => setShowAddFilterModal(true)}
                disabled={!selectedDataset}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                添加筛选
              </button>
            </div>

          <div style={{ padding: '12px 16px' }}>
            {/* 流式容器：所有筛选条件 + 新增行 + 查询按钮 在同一行 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>

              {/* 已有筛选条件 */}
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

                    {/* 删除按钮 */}
                    <span
                      onClick={() => handleRemoveFilter(filter.id)}
                      title="移除"
                      style={{
                        width: 18, height: 18, borderRadius: '50%',
                        cursor: 'pointer', display: 'inline-flex',
                        alignItems: 'center', justifyContent: 'center',
                        color: 'var(--dae-ink-muted)', flexShrink: 0,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--dae-error)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--dae-ink-muted)'; }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </span>
                  </div>
                );
              })}

              {/* 新增行（虚线框） */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 10px', borderRadius: 'var(--dae-radius-sm)',
                border: '1px dashed var(--dae-border-strong)', background: 'transparent',
              }}>
                <span style={{ fontSize: '13px', color: 'var(--dae-ink-secondary)', whiteSpace: 'nowrap' }}>未命名</span>
                <div style={{ position: 'relative' }}>
                  <input
                    className="dae-input"
                    style={{ width: 140, padding: '4px 24px 4px 6px', fontSize: '12px' }}
                    type="text"
                    value=""
                    onChange={() => {}}
                    placeholder="选择或输入值"
                  />
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" style={{
                    position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none',
                  }}>
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                {/* + 按钮 */}
                <button
                  className="dae-btn dae-btn-primary dae-btn-sm"
                  style={{ width: 26, height: 26, padding: 0, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => setFilters([...filters, { id: `f${Date.now()}`, field: '订单日期', operator: '=', value: '' }])}
                  title="添加筛选条件"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>

              {/* 查询按钮（始终靠右，只有一个） */}
              <button
                className="dae-btn dae-btn-primary dae-btn-sm"
                style={{ marginLeft: 'auto', padding: '5px 16px', fontSize: '12px', whiteSpace: 'nowrap' }}
                onClick={() => saveFilter()}
              >查询</button>

            </div>
          </div>
          </section>

          {/* ========== 区域 D：数据预览 ========== */}
          <section style={{ background: '#fff', borderRadius: 'var(--dae-radius-md)', border: '1px solid var(--dae-border)', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px', borderBottom: '1px solid var(--dae-border)',
              background: 'var(--dae-surface)', flexShrink: 0,
            }}>
              <h2 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dae-ink)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--dae-primary)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>
                数据预览
              </h2>
            </div>

            <div style={{ overflow: 'auto' }}>
              <table className="dae-table">
                <thead>
                  <tr>
                    {previewData.length > 0 && Object.keys(previewData[0]).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, j) => (
                        <td key={j}>{String(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </main>
      </div>

      {/* ==================== 下拉菜单面板 ==================== */}

      {activeMenu && currentDim && activeMenu.type === 'dimension' && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: activeMenu.triggerRect.bottom + 4,
            left: activeMenu.triggerRect.left,
            zIndex: 1000,
            background: '#fff',
            border: '1px solid var(--dae-border)',
            borderRadius: 'var(--dae-radius-md)',
            boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
            minWidth: 220,
            padding: '4px 0',
          }}
        >
          {/* 排序 */}
          <MenuItemWithSubmenu
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M11 5h10"/><path d="M11 9h7"/><path d="M11 13h4"/></svg>}
            label={`排序（${sortLabels[currentDim.sortOrder]}）`}
            isOpen={openSubmenu === 'sort'}
            onToggle={() => setOpenSubmenu(openSubmenu === 'sort' ? null : 'sort')}
            onSelect={(value) => {
              updateDimension(currentDim.id, 'sortOrder', value as DimensionConfig['sortOrder']);
              closeMenu();
            }}
            options={[
              { value: 'none', label: '无' },
              { value: 'asc', label: '升序' },
              { value: 'desc', label: '降序' },
            ]}
          />

          {/* 日期显示 */}
          <MenuItemWithSubmenu
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
            label={`日期显示（${dateDisplayLabels[currentDim.dateDisplay]}）`}
            isOpen={openSubmenu === 'dateDisplay'}
            onToggle={() => setOpenSubmenu(openSubmenu === 'dateDisplay' ? null : 'dateDisplay')}
            onSelect={(value) => {
              updateDimension(currentDim.id, 'dateDisplay', value as DimensionConfig['dateDisplay']);
              closeMenu();
            }}
            options={[
              { value: 'year-month-day', label: '年月日' },
              { value: 'year-month', label: '年月' },
              { value: 'year', label: '年' },
            ]}
          />

          {/* 日期格式 */}
          <MenuItemWithSubmenu
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
            label={`日期格式（${currentDim.dateFormat}）`}
            isOpen={openSubmenu === 'dateFormat'}
            onToggle={() => setOpenSubmenu(openSubmenu === 'dateFormat' ? null : 'dateFormat')}
            onSelect={(value) => {
              updateDimension(currentDim.id, 'dateFormat', value);
              closeMenu();
            }}
            options={dateFormatOptions}
          />

          {/* 分隔线 */}
          <div style={{ height: 1, margin: '4px 8px', background: 'var(--dae-border)' }} />

          {/* 编辑显示名称 */}
          <MenuItem
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>}
            label="编辑显示名称"
            onClick={() => openEditNameModal('dimension', currentDim.id, currentDim.fieldName, currentDim.alias)}
          />

          {/* 隐藏 / 显示 */}
          <MenuItem
            icon={
              currentDim.visible
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            }
            label={currentDim.visible ? '隐藏' : '显示'}
            onClick={() => updateDimension(currentDim.id, 'visible', !currentDim.visible)}
          />

          {/* 分隔线 */}
          <div style={{ height: 1, margin: '4px 8px', background: 'var(--dae-border)' }} />

          {/* 删除 */}
          <MenuItem
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>}
            label="删除"
            onClick={() => handleRemoveDimension(currentDim.id)}
            danger
          />
        </div>
      )}

      {activeMenu && currentMetric && activeMenu.type === 'metric' && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: activeMenu.triggerRect.bottom + 4,
            left: activeMenu.triggerRect.left,
            zIndex: 1000,
            background: '#fff',
            border: '1px solid var(--dae-border)',
            borderRadius: 'var(--dae-radius-md)',
            boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
            minWidth: 220,
            padding: '4px 0',
          }}
        >
          {/* 聚合方式 */}
          <MenuItemWithSubmenu
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>}
            label={`聚合方式（${aggregationLabels[currentMetric.aggregation]}）`}
            isOpen={openSubmenu === 'aggregation'}
            onToggle={() => setOpenSubmenu(openSubmenu === 'aggregation' ? null : 'aggregation')}
            onSelect={(value) => {
              updateMetric(currentMetric.id, 'aggregation', value as MetricConfig['aggregation']);
              closeMenu();
            }}
            options={[
              { value: 'sum', label: '求和' },
              { value: 'avg', label: '平均' },
              { value: 'max', label: '最大值' },
              { value: 'min', label: '最小值' },
              { value: 'count', label: '计数' },
            ]}
          />

          {/* 数字格式 */}
          <MenuItemWithSubmenu
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
            label={`数字格式（${currentMetric.numberFormat}）`}
            isOpen={openSubmenu === 'numberFormat'}
            onToggle={() => setOpenSubmenu(openSubmenu === 'numberFormat' ? null : 'numberFormat')}
            onSelect={(value) => {
              updateMetric(currentMetric.id, 'numberFormat', value);
              closeMenu();
            }}
            options={numberFormatOptions}
          />

          {/* 小数位 */}
          <MenuItemWithSubmenu
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>}
            label={`小数位（${currentMetric.decimals}）`}
            isOpen={openSubmenu === 'decimals'}
            onToggle={() => setOpenSubmenu(openSubmenu === 'decimals' ? null : 'decimals')}
            onSelect={(value) => {
              updateMetric(currentMetric.id, 'decimals', Number(value));
              closeMenu();
            }}
            options={[
              { value: '0', label: '0' },
              { value: '1', label: '1' },
              { value: '2', label: '2' },
              { value: '3', label: '3' },
              { value: '4', label: '4' },
            ]}
          />

          {/* 分隔线 */}
          <div style={{ height: 1, margin: '4px 8px', background: 'var(--dae-border)' }} />

          {/* 编辑显示名称 */}
          <MenuItem
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>}
            label="编辑显示名称"
            onClick={() => openEditNameModal('metric', currentMetric.id, currentMetric.fieldName, currentMetric.alias)}
          />

          {/* 隐藏 / 显示 */}
          <MenuItem
            icon={
              currentMetric.visible
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            }
            label={currentMetric.visible ? '隐藏' : '显示'}
            onClick={() => updateMetric(currentMetric.id, 'visible', !currentMetric.visible)}
          />

          {/* 分隔线 */}
          <div style={{ height: 1, margin: '4px 8px', background: 'var(--dae-border)' }} />

          {/* 删除 */}
          <MenuItem
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>}
            label="删除"
            onClick={() => handleRemoveMetric(currentMetric.id)}
            danger
          />
        </div>
      )}

      {/* ==================== 编辑显示名称 Modal 弹窗 ==================== */}

      {editNameModal && (
        <div className="dae-modal-overlay" onClick={() => setEditNameModal(null)}>
          <div className="dae-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="dae-modal-header">
              <h3>编辑显示名称</h3>
              <button className="dae-icon-action" onClick={() => setEditNameModal(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="dae-modal-body">
              <div className="dae-form-group">
                <label>原始名称</label>
                <div style={{
                  padding: '8px 12px', borderRadius: 'var(--dae-radius-md)',
                  background: 'var(--dae-surface)', fontSize: '14px',
                  color: 'var(--dae-ink-secondary)', border: '1px solid var(--dae-border)',
                }}>
                  {editNameModal.originalName}
                </div>
              </div>

              <div className="dae-form-group" style={{ marginBottom: 0 }}>
                <label>显示名称 *</label>
                <input
                  className="dae-input"
                  autoFocus
                  value={editNameInput}
                  onChange={e => setEditNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmEditName();
                    if (e.key === 'Escape') setEditNameModal(null);
                  }}
                  placeholder="请输入显示名称"
                  maxLength={32}
                />
                <div style={{
                  textAlign: 'right', fontSize: '12px', color: 'var(--dae-ink-muted)',
                  marginTop: 4,
                }}>
                  {editNameInput.length}/32
                </div>
              </div>
            </div>
            <div className="dae-modal-footer">
              <button className="dae-btn dae-btn-secondary" onClick={() => setEditNameModal(null)}>取消</button>
              <button
                className="dae-btn dae-btn-primary"
                onClick={confirmEditName}
                disabled={!editNameInput.trim()}
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 弹窗区域 ==================== */}

      {/* ----- 添加维度弹窗 ----- */}
      {showAddDimModal && selectedDataset && (
        <AddFieldModal
          title="添加维度"
          fields={selectedDataset.dimensions.filter(f => !dimensions.some(d => d.fieldName === f))}
          onClose={() => setShowAddDimModal(false)}
          onConfirm={(fieldName) => handleAddDimension(fieldName)}
        />
      )}

      {/* ----- 添加指标弹窗 ----- */}
      {showAddMetricModal && selectedDataset && (
        <AddFieldModal
          title="添加指标"
          fields={selectedDataset.metrics.filter(f => !metrics.some(m => m.fieldName === f))}
          onClose={() => setShowAddMetricModal(false)}
          onConfirm={(fieldName) => handleAddMetric(fieldName)}
        />
      )}

      {/* ----- 添加筛选条件弹窗 ----- */}
      {showAddFilterModal && selectedDataset && (
        <AddFilterModal
          availableFields={[...selectedDataset.dimensions, ...selectedDataset.metrics]}
          onClose={() => setShowAddFilterModal(false)}
          onConfirm={(filter) => handleAddFilter(filter)}
        />
      )}

      {/* ----- 未保存变更确认弹窗 ----- */}
      {showUnsavedDialog && (
        <div className="dae-modal-overlay" onClick={() => setShowUnsavedDialog(false)}>
          <div className="dae-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="dae-modal-header">
              <h3>未保存的更改</h3>
              <button className="dae-icon-action" onClick={() => setShowUnsavedDialog(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="dae-modal-body">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '8px 0' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--dae-ink)', margin: '0 0 6px' }}>
                    当前报表配置有未保存的更改
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--dae-ink-secondary)', margin: 0, lineHeight: 1.5 }}>
                    如果离开，这些修改将会丢失。你可以选择保存后再离开，或直接放弃更改。
                  </p>
                </div>
              </div>
            </div>
            <div className="dae-modal-footer">
              <button className="dae-btn dae-btn-secondary" onClick={handleDiscardAndLeave}>放弃更改</button>
              <button className="dae-btn dae-btn-primary" onClick={handleSaveAndLeave}>保存并离开</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
 * 下拉菜单子组件
 * ================================================================ */

/** 普通菜单项 */
function MenuItem({ icon, label, onClick, danger }: {
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        width: '100%', padding: '8px 12px',
        border: 'none', background: 'transparent',
        cursor: 'pointer', fontSize: '13px',
        color: danger ? 'var(--dae-error)' : 'var(--dae-ink)',
        textAlign: 'left',
        transition: 'background 0.12s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--dae-surface)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {icon && <span style={{ display: 'flex', flexShrink: 0 }}>{icon}</span>}
      <span>{label}</span>
    </button>
  );
}

/** 带子菜单的菜单项 */
function MenuItemWithSubmenu({ icon, label, isOpen, onToggle, onSelect, options }: {
  icon?: React.ReactNode;
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '8px 12px',
          border: 'none', background: 'transparent',
          cursor: 'pointer', fontSize: '13px',
          color: 'var(--dae-ink)',
          textAlign: 'left',
          transition: 'background 0.12s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--dae-surface)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon && <span style={{ display: 'flex', flexShrink: 0 }}>{icon}</span>}
          <span>{label}</span>
        </span>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s', flexShrink: 0, color: 'var(--dae-ink-muted)' }}
        >
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          left: '100%',
          top: 0,
          marginLeft: 4,
          background: '#fff',
          border: '1px solid var(--dae-border)',
          borderRadius: 'var(--dae-radius-md)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          minWidth: 120,
          padding: '4px 0',
          zIndex: 1001,
        }}>
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              style={{
                display: 'block', width: '100%',
                padding: '7px 14px',
                border: 'none', background: 'transparent',
                cursor: 'pointer', fontSize: '13px',
                color: 'var(--dae-ink)',
                textAlign: 'left',
                whiteSpace: 'nowrap',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--dae-primary-light)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================
 * 弹窗子组件
 * ================================================================ */

/** 通用字段选择弹窗（用于添加维度/指标） */
function AddFieldModal({ title, fields, onClose, onConfirm }: {
  title: string;
  fields: string[];
  onClose: () => void;
  onConfirm: (fieldName: string) => void;
}) {
  return (
    <div className="dae-drawer-overlay" onClick={onClose}>
      <div className="dae-drawer" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="dae-drawer-header">
          <h3>{title}</h3>
          <button className="dae-icon-action" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="dae-drawer-body">
          {fields.length === 0 ? (
            <div className="dae-empty" style={{ padding: '32px 24px' }}>
              <p>所有可用字段已添加完毕</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {fields.map((field) => (
                <button
                  key={field}
                  onClick={() => onConfirm(field)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '12px 14px',
                    border: '1px solid var(--dae-border)', borderRadius: 'var(--dae-radius-md)',
                    background: '#fff', cursor: 'pointer',
                    transition: 'all 0.12s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--dae-primary)';
                    e.currentTarget.style.background = 'var(--dae-primary-light)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--dae-border)';
                    e.currentTarget.style.background = '#fff';
                  }}
                >
                  <span className={`de-field-icon ${title.includes('维度') ? 'de-field-dim' : 'de-field-metric'}`}>
                    {title.includes('维度') ? 'D' : '#'}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--dae-ink)' }}>{field}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--dae-primary)" strokeWidth="2" style={{ marginLeft: 'auto', opacity: 0.5 }}>
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="dae-drawer-footer">
          <button className="dae-btn dae-btn-secondary" onClick={onClose}>取消</button>
        </div>
      </div>
    </div>
  );
}

/** 添加筛选条件弹窗 */
function AddFilterModal({ availableFields, onClose, onConfirm }: {
  availableFields: string[];
  onClose: () => void;
  onConfirm: (filter: FilterCondition) => void;
}) {
  const [field, setField] = useState('');
  const [operator, setOperator] = useState<FilterCondition['operator']>('=');
  const [value, setValue] = useState('');
  const [valueTo, setValueTo] = useState('');

  const operators: { value: FilterCondition['operator']; label: string }[] = [
    { value: '=', label: '等于' },
    { value: '!=', label: '不等于' },
    { value: 'contains', label: '包含' },
    { value: '>', label: '大于' },
    { value: '<', label: '小于' },
    { value: 'between', label: '介于' },
  ];

  const handleConfirm = () => {
    if (!field || !value) return;
    onConfirm({
      id: `f${Date.now()}`,
      field,
      operator,
      value,
      ...(operator === 'between' && valueTo ? { valueTo } : {}),
    });
  };

  return (
    <div className="dae-drawer-overlay" onClick={onClose}>
      <div className="dae-drawer" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="dae-drawer-header">
          <h3>添加筛选条件</h3>
          <button className="dae-icon-action" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="dae-drawer-body">
          <div className="dae-form-group">
            <label>选择字段 *</label>
            <select className="dae-input" value={field} onChange={e => setField(e.target.value)}>
              <option value="">-- 请选择字段 --</option>
              {availableFields.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="dae-form-group">
            <label>操作符 *</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {operators.map(op => (
                <button
                  key={op.value}
                  onClick={() => setOperator(op.value)}
                  style={{
                    padding: '7px 14px', borderRadius: 'var(--dae-radius-md)',
                    border: `1px solid ${operator === op.value ? 'var(--dae-primary)' : 'var(--dae-border-strong)'}`,
                    background: operator === op.value ? 'var(--dae-primary-light)' : '#fff',
                    color: operator === op.value ? 'var(--dae-primary)' : 'var(--dae-ink-secondary)',
                    cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                    transition: 'all 0.12s',
                  }}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          <div className="dae-form-group">
            <label>值 *</label>
            <input
              className="dae-input"
              placeholder="输入筛选值"
              value={value}
              onChange={e => setValue(e.target.value)}
            />
          </div>

          {operator === 'between' && (
            <div className="dae-form-group">
              <label>结束值</label>
              <input
                className="dae-input"
                placeholder="输入结束值"
                value={valueTo}
                onChange={e => setValueTo(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="dae-drawer-footer">
          <button className="dae-btn dae-btn-secondary" onClick={onClose}>取消</button>
          <button
            className="dae-btn dae-btn-primary"
            onClick={handleConfirm}
            disabled={!field || !value}
          >
            确认添加
          </button>
        </div>
      </div>
    </div>
  );
}
