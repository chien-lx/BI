/**
 * 智能问数 · 语义层与问数记录数据层
 *
 * 语义层（Semantic Layer）= 业务术语↔物理字段映射 + 指标口径定义 + 示例问数，
 * 是问数准确率的关键（竞品：无语义层 ~60-70%，完整语义层 90%+）。
 *
 * 2026-08-20 新增：
 *  - 行业黑话 / 同义词词典（TerminologyItem）
 *  - 指标口径定义（MetricDefinition）
 *  - 示例问数（ExampleQuery，few-shot 提升准确率）
 *  - 数据集字段语义层（DatasetSchema，可手动导入或自动解析字段业务含义）
 *  - 问数记录（QueryLog，供管理员评估并迭代语义层 / 模型策略）
 *
 * 存储优先使用 localStorage，未写入时回退到种子数据。
 */

/* 接入系统现有资产：数据集 / 报表 / 仪表盘 / 数据大屏 / 图表（来自 data/mockData） */
import {
  datasets as systemDatasets,
  reports as systemReports,
  dashboards as systemDashboards,
  dataScreens as systemDataScreens,
  datasetFields as dataSourceFields,
  charts as systemCharts,
  type DatasetField,
} from './mockData';

/* 作用域类型展示顺序与名称（用于选择器分组） */
export const SCOPE_TYPE_LABELS: Record<ScopeType, string> = {
  dataset: '数据集',
  report: '报表',
  dashboard: '仪表盘',
  'data-screen': '数据大屏',
};
export const SCOPE_TYPE_ORDER: ScopeType[] = ['dataset', 'report', 'dashboard', 'data-screen'];

/**
 * 根据数据集名称推断其字段语义（原型：无真实表结构，按业务域生成可用默认字段，
 * 后续可在「语义层 → 数据集字段」中导入/修正）。保证问数引擎能选到维度与指标。
 */
function inferFields(name: string): SemanticField[] {
  const f: SemanticField[] = [
    { name: 'id', alias: '记录ID', type: 'string', description: '记录唯一标识', isDimension: true, isMetric: false },
    { name: 'date', alias: '日期', type: 'date', description: '业务日期', isDimension: true, isMetric: false },
  ];
  const push = (field: SemanticField) => f.push(field);
  if (/订单|销售|交易|支付|成交|流水/.test(name)) {
    push({ name: 'region', alias: '地区', type: 'string', description: '销售大区', isDimension: true, isMetric: false });
    push({ name: 'province', alias: '省份', type: 'string', description: '省份', isDimension: true, isMetric: false });
    push({ name: 'product_name', alias: '商品名称', type: 'string', description: '商品名称', isDimension: true, isMetric: false });
    push({ name: 'category', alias: '商品类目', type: 'string', description: '商品类目', isDimension: true, isMetric: false });
    push({ name: 'channel', alias: '渠道', type: 'string', description: '销售渠道', isDimension: true, isMetric: false });
    push({ name: 'user_id', alias: '用户ID', type: 'string', description: '下单用户', isDimension: true, isMetric: false });
    push({ name: 'amount', alias: '成交金额', type: 'number', description: '成交金额(GMV)', isDimension: false, isMetric: true, aggregation: 'sum' });
    push({ name: 'quantity', alias: '销售数量', type: 'number', description: '销售数量', isDimension: false, isMetric: true, aggregation: 'sum' });
    push({ name: 'cost', alias: '商品成本', type: 'number', description: '商品成本', isDimension: false, isMetric: true, aggregation: 'sum' });
  } else if (/用户|画像|会员|客户|crm/i.test(name)) {
    push({ name: 'city', alias: '城市', type: 'string', description: '所在城市', isDimension: true, isMetric: false });
    push({ name: 'gender', alias: '性别', type: 'string', description: '性别', isDimension: true, isMetric: false });
    push({ name: 'level', alias: '会员等级', type: 'string', description: '会员等级', isDimension: true, isMetric: false });
    push({ name: 'channel', alias: '注册渠道', type: 'string', description: '注册渠道', isDimension: true, isMetric: false });
    push({ name: 'consume_amount', alias: '消费总额', type: 'number', description: '消费总额', isDimension: false, isMetric: true, aggregation: 'sum' });
    push({ name: 'order_count', alias: '订单数', type: 'number', description: '订单数', isDimension: false, isMetric: true, aggregation: 'sum' });
    push({ name: 'active_days', alias: '活跃天数', type: 'number', description: '活跃天数', isDimension: false, isMetric: true, aggregation: 'avg' });
  } else if (/商品|库存|货品/.test(name)) {
    push({ name: 'sku', alias: '商品SKU', type: 'string', description: '商品SKU', isDimension: true, isMetric: false });
    push({ name: 'category', alias: '类目', type: 'string', description: '商品类目', isDimension: true, isMetric: false });
    push({ name: 'stock_qty', alias: '库存数量', type: 'number', description: '库存数量', isDimension: false, isMetric: true, aggregation: 'sum' });
    push({ name: 'sales_qty', alias: '销售数量', type: 'number', description: '销售数量', isDimension: false, isMetric: true, aggregation: 'sum' });
    push({ name: 'price', alias: '售价', type: 'number', description: '售价', isDimension: false, isMetric: true, aggregation: 'avg' });
  } else if (/物流|供应链|配送|运输/.test(name)) {
    push({ name: 'track_no', alias: '运单号', type: 'string', description: '运单号', isDimension: true, isMetric: false });
    push({ name: 'region', alias: '地区', type: 'string', description: '地区', isDimension: true, isMetric: false });
    push({ name: 'status', alias: '状态', type: 'string', description: '状态', isDimension: true, isMetric: false });
    push({ name: 'delivery_hours', alias: '时效小时', type: 'number', description: '配送时效(小时)', isDimension: false, isMetric: true, aggregation: 'avg' });
    push({ name: 'order_qty', alias: '订单数', type: 'number', description: '订单数', isDimension: false, isMetric: true, aggregation: 'sum' });
  } else if (/财务|报表|利润|收支/.test(name)) {
    push({ name: 'subject', alias: '会计科目', type: 'string', description: '会计科目', isDimension: true, isMetric: false });
    push({ name: 'debit', alias: '借方金额', type: 'number', description: '借方金额', isDimension: false, isMetric: true, aggregation: 'sum' });
    push({ name: 'credit', alias: '贷方金额', type: 'number', description: '贷方金额', isDimension: false, isMetric: true, aggregation: 'sum' });
    push({ name: 'profit', alias: '利润', type: 'number', description: '利润', isDimension: false, isMetric: true, aggregation: 'sum' });
  } else if (/营销|活动|推广/.test(name)) {
    push({ name: 'activity_name', alias: '活动名称', type: 'string', description: '活动名称', isDimension: true, isMetric: false });
    push({ name: 'channel', alias: '渠道', type: 'string', description: '渠道', isDimension: true, isMetric: false });
    push({ name: 'cost', alias: '投入成本', type: 'number', description: '投入成本', isDimension: false, isMetric: true, aggregation: 'sum' });
    push({ name: 'gmv', alias: '带来GMV', type: 'number', description: '活动带来GMV', isDimension: false, isMetric: true, aggregation: 'sum' });
    push({ name: 'roi', alias: 'ROI', type: 'number', description: '投资回报率', isDimension: false, isMetric: true, aggregation: 'avg' });
  } else if (/访问|日志|埋点|流量|点击|浏览/.test(name)) {
    push({ name: 'page', alias: '页面', type: 'string', description: '页面', isDimension: true, isMetric: false });
    push({ name: 'event_type', alias: '事件类型', type: 'string', description: '事件类型', isDimension: true, isMetric: false });
    push({ name: 'pv', alias: '访问量', type: 'number', description: '页面访问量', isDimension: false, isMetric: true, aggregation: 'sum' });
    push({ name: 'uv', alias: '独立访客', type: 'number', description: '独立访客', isDimension: false, isMetric: true, aggregation: 'count_distinct' });
    push({ name: 'duration', alias: '停留时长', type: 'number', description: '停留时长(秒)', isDimension: false, isMetric: true, aggregation: 'avg' });
  } else if (/风控|风险|异常/.test(name)) {
    push({ name: 'rule_id', alias: '规则ID', type: 'string', description: '规则ID', isDimension: true, isMetric: false });
    push({ name: 'risk_level', alias: '风险等级', type: 'string', description: '风险等级', isDimension: true, isMetric: false });
    push({ name: 'amount', alias: '交易金额', type: 'number', description: '交易金额', isDimension: false, isMetric: true, aggregation: 'sum' });
    push({ name: 'is_abnormal', alias: '是否异常', type: 'string', description: '是否异常', isDimension: true, isMetric: false });
  } else if (/审计|操作|配置|变更/.test(name)) {
    push({ name: 'op_type', alias: '操作类型', type: 'string', description: '操作类型', isDimension: true, isMetric: false });
    push({ name: 'operator', alias: '操作人', type: 'string', description: '操作人', isDimension: true, isMetric: false });
    push({ name: 'count', alias: '次数', type: 'number', description: '操作次数', isDimension: false, isMetric: true, aggregation: 'sum' });
  } else if (/搜索|检索/.test(name)) {
    push({ name: 'keyword', alias: '搜索词', type: 'string', description: '搜索词', isDimension: true, isMetric: false });
    push({ name: 'city', alias: '城市', type: 'string', description: '城市', isDimension: true, isMetric: false });
    push({ name: 'search_cnt', alias: '搜索次数', type: 'number', description: '搜索次数', isDimension: false, isMetric: true, aggregation: 'sum' });
    push({ name: 'click_cnt', alias: '点击次数', type: 'number', description: '点击次数', isDimension: false, isMetric: true, aggregation: 'sum' });
  } else if (/消息|队列/i.test(name)) {
    push({ name: 'topic', alias: '队列主题', type: 'string', description: '队列主题', isDimension: true, isMetric: false });
    push({ name: 'lag', alias: '积压量', type: 'number', description: '消息积压量', isDimension: false, isMetric: true, aggregation: 'sum' });
    push({ name: 'tps', alias: '吞吐量', type: 'number', description: '吞吐量', isDimension: false, isMetric: true, aggregation: 'avg' });
  } else if (/地理|围栏|区域|地图/.test(name)) {
    push({ name: 'region', alias: '地区', type: 'string', description: '地区', isDimension: true, isMetric: false });
    push({ name: 'fence_name', alias: '围栏名称', type: 'string', description: '围栏名称', isDimension: true, isMetric: false });
    push({ name: 'value', alias: '指标值', type: 'number', description: '指标值', isDimension: false, isMetric: true, aggregation: 'sum' });
  } else {
    push({ name: 'region', alias: '地区', type: 'string', description: '地区', isDimension: true, isMetric: false });
    push({ name: 'category', alias: '类目', type: 'string', description: '类目', isDimension: true, isMetric: false });
    push({ name: 'metric_value', alias: '指标值', type: 'number', description: '指标值', isDimension: false, isMetric: true, aggregation: 'sum' });
    push({ name: 'record_count', alias: '记录数', type: 'number', description: '记录数', isDimension: false, isMetric: true, aggregation: 'count' });
  }
  return f;
}

/** 将系统数据源的真实列（mockData.datasetFields）转换为语义层字段 */
function datasetFieldToSemantic(f: DatasetField): SemanticField {
  const isMetric = f.type === 'metric';
  const t: SemanticField['type'] = f.dataType.includes('数值')
    ? 'number'
    : f.dataType.includes('时间') && !f.dataType.includes('日期')
      ? 'datetime'
      : f.dataType.includes('日期')
        ? 'date'
        : 'string';
  return {
    name: f.name,
    alias: f.name,
    type: t,
    description: f.name,
    isDimension: !isMetric,
    isMetric,
    aggregation: isMetric ? 'sum' : undefined,
  };
}

/** 取某数据集在数据源侧的真实列（若存在），供「从数据源导入真实字段」 */
export function getRealFieldsFromSource(datasetName: string): SemanticField[] | null {
  const real = dataSourceFields[datasetName];
  if (!real || real.length === 0) return null;
  return real.map(datasetFieldToSemantic);
}

/** 将数据集字段同步为数据源真实列（语义层「从数据源导入真实字段」调用） */
export function syncDatasetFromSource(ds: DatasetSchema): DatasetSchema {
  const real = getRealFieldsFromSource(ds.datasetName);
  if (!real) return ds;
  return { ...ds, fields: real, fieldSource: 'real', updatedAt: new Date().toISOString().slice(0, 10) };
}

const TRAINED_BY_DEFAULT = new Set([
  'DT001','DT002','DT003','DT007','DT008','DT010','DT011','DT013','DT014','DT016','DT018','DT019','DT021',
]);

function buildSeedDatasets(): DatasetSchema[] {
  return systemDatasets.map((d) => ({
    id: d.id,
    datasetName: d.name,
    tableName: `dwd_${d.id.toLowerCase()}`,
    updatedAt: d.updatedAt.slice(0, 10),
    // 默认用业务域推断列（待完善）；真实列需「从数据源导入真实字段」
    fields: inferFields(d.name),
    fieldSource: 'inferred' as const,
    trainingStatus: TRAINED_BY_DEFAULT.has(d.id) ? ('trained' as const) : ('untrained' as const),
    trainingStrategy: 'incremental' as const,
    trainingContent: { fields: true, terms: true, metrics: true, examples: true },
    trainingSchedule: 'manual' as const,
    trainedAt: TRAINED_BY_DEFAULT.has(d.id) ? new Date().toISOString() : undefined,
  }));
}

function buildSeedScopes(): QueryScope[] {
  const dsScopes: QueryScope[] = systemDatasets.map((d) => ({
    type: 'dataset',
    id: d.id,
    name: d.name,
    datasetId: d.id,
    description: `数据集「${d.name}」（来源：${d.sourceName}）`,
  }));
  const rpScopes: QueryScope[] = systemReports.map((r) => ({
    type: 'report',
    id: r.id,
    name: r.name,
    description: `报表「${r.name}」（关联数据集：${r.datasetName}）`,
  }));
  const dbScopes: QueryScope[] = systemDashboards.map((d) => ({
    type: 'dashboard',
    id: d.id,
    name: d.name,
    description: `仪表盘「${d.name}」`,
  }));
  const scScopes: QueryScope[] = systemDataScreens.map((s) => ({
    type: 'data-screen',
    id: s.id,
    name: s.name,
    description: `数据大屏「${s.name}」（${s.resolution}）`,
  }));
  return [...dsScopes, ...rpScopes, ...dbScopes, ...scScopes];
}

/** 按作用域类型分组（供选择器渲染） */
export function groupScopes(scopes: QueryScope[]): { type: ScopeType; label: string; items: QueryScope[] }[] {
  return SCOPE_TYPE_ORDER.map((type) => ({
    type,
    label: SCOPE_TYPE_LABELS[type],
    items: scopes.filter((s) => s.type === type),
  })).filter((g) => g.items.length > 0);
}

/* ============================ 训练状态与作用域可问数 ============================ */

const trainingStatusOrder: Record<TrainingStatus, number> = {
  untrained: 0,
  failed: 1,
  training: 2,
  trained: 3,
};

/** 取数据集训练状态（可读） */
export function getDatasetTrainingStatus(datasetId: string): TrainingStatus {
  const ds = getDatasets().find((d) => d.id === datasetId);
  return ds?.trainingStatus || 'untrained';
}

/** 数据集是否已训练 */
export function isDatasetTrained(datasetId: string): boolean {
  return getDatasetTrainingStatus(datasetId) === 'trained';
}

/** 按数据集名称查找系统数据集 */
function findSystemDatasetByName(name: string) {
  return systemDatasets.find((d) => d.name === name);
}

/** 取某作用域依赖的数据集 ID 列表（报表/仪表盘/大屏均基于数据集） */
export function getScopeDatasetDependencies(scope: QueryScope): string[] {
  if (scope.type === 'dataset') {
    return scope.datasetId ? [scope.datasetId] : [];
  }
  if (scope.type === 'report') {
    const r = systemReports.find((x) => x.id === scope.id);
    if (!r) return [];
    const ds = findSystemDatasetByName(r.datasetName);
    return ds ? [ds.id] : [];
  }
  if (scope.type === 'dashboard') {
    const d = systemDashboards.find((x) => x.id === scope.id);
    if (!d?.charts) return [];
    const names = Array.from(new Set(d.charts.map((c) => c.datasetName).filter(Boolean) as string[]));
    return names.map((n) => findSystemDatasetByName(n)?.id).filter(Boolean) as string[];
  }
  if (scope.type === 'data-screen') {
    const s = systemDataScreens.find((x) => x.id === scope.id);
    if (!s?.components) return [];
    const names = Array.from(new Set(s.components.map((c) => c.datasetName).filter(Boolean) as string[]));
    return names.map((n) => findSystemDatasetByName(n)?.id).filter(Boolean) as string[];
  }
  return [];
}

export type ScopeQueryability = 'queryable' | 'partial' | 'unqueryable' | 'na';

/** 计算作用域可问数状态：数据集直接看训练状态；报表/仪表盘/大屏看依赖数据集是否全部已训练 */
export function getScopeQueryability(scope: QueryScope): ScopeQueryability {
  const deps = getScopeDatasetDependencies(scope);
  if (deps.length === 0) return 'na';
  const trained = deps.filter((id) => isDatasetTrained(id)).length;
  if (trained === deps.length) return 'queryable';
  if (trained === 0) return 'unqueryable';
  return 'partial';
}

/** 更新数据集训练状态（DatasetPage 训练按钮调用） */
export function updateDatasetTrainingStatus(
  datasetId: string,
  patch: Partial<Pick<DatasetSchema, 'trainingStatus' | 'trainingStrategy' | 'trainingContent' | 'trainingSchedule' | 'trainedAt' | 'trainingFailedReason'>>
): DatasetSchema | null {
  const items = getDatasets();
  const idx = items.findIndex((d) => d.id === datasetId);
  if (idx === -1) return null;
  const updated = { ...items[idx], ...patch };
  items[idx] = updated;
  saveDatasets(items);
  return updated;
}

/** 标记数据集训练中 */
export function markDatasetTraining(datasetId: string): DatasetSchema | null {
  return updateDatasetTrainingStatus(datasetId, { trainingStatus: 'training' });
}

/** 完成训练：状态改为 trained 并写入时间 */
export function finishDatasetTraining(
  datasetId: string,
  options: { strategy: 'full' | 'incremental'; content: TrainingContent; schedule: TrainingSchedule }
): DatasetSchema | null {
  const items = getDatasets();
  const idx = items.findIndex((d) => d.id === datasetId);
  if (idx === -1) return null;
  let ds = items[idx];
  // 若训练内容包含字段语义，自动把字段同步为数据源真实列
  if (options.content.fields) {
    ds = syncDatasetFromSource(ds);
  }
  const updated: DatasetSchema = {
    ...ds,
    trainingStatus: 'trained',
    trainingStrategy: options.strategy,
    trainingContent: options.content,
    trainingSchedule: options.schedule,
    trainedAt: new Date().toISOString(),
  };
  items[idx] = updated;
  saveDatasets(items);
  return updated;
}

/** 训练失败 */
export function failDatasetTraining(datasetId: string, reason: string): DatasetSchema | null {
  return updateDatasetTrainingStatus(datasetId, { trainingStatus: 'failed', trainingFailedReason: reason });
}

/** 训练状态中文标签 */
export function trainingStatusLabel(status?: TrainingStatus): string {
  switch (status) {
    case 'trained':
      return '已训练';
    case 'training':
      return '训练中';
    case 'failed':
      return '训练失败';
    default:
      return '未训练';
  }
}

/** 可问数状态中文标签 */
export function queryabilityLabel(q: ScopeQueryability): string {
  switch (q) {
    case 'queryable':
      return '可问数';
    case 'partial':
      return '部分可问数';
    case 'unqueryable':
      return '不可问数';
    default:
      return '—';
  }
}

/** 可问数徽标颜色 */
export function queryabilityColor(q: ScopeQueryability): { bg: string; color: string; border: string } {
  switch (q) {
    case 'queryable':
      return { bg: '#dcfce7', color: '#15803d', border: '#86efac' };
    case 'partial':
      return { bg: '#fef9c3', color: '#a16207', border: '#fde047' };
    case 'unqueryable':
      return { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' };
    default:
      return { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' };
  }
}

/** 解读模式下联动展示的资产实际图表组件 */
export interface LinkedComponent {
  id: string;
  name: string;
  type: string;
  datasetName?: string;
  dimensions?: string[];
  metrics?: string[];
}

/** 解读模式下，返回该资产在系统中实际已配置的图表组件（联动展示） */
export function getScopeLinkedComponents(scope: QueryScope): LinkedComponent[] {
  if (scope.type === 'report') {
    // 报表本身是一张表格，没有关联的可视化组件，解读时只给结论
    return [];
  }
  if (scope.type === 'dashboard') {
    const d = systemDashboards.find((x) => x.id === scope.id);
    return (d?.charts || []).map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      datasetName: c.datasetName,
      dimensions: c.dimensions,
      metrics: c.metrics,
    }));
  }
  if (scope.type === 'data-screen') {
    const s = systemDataScreens.find((x) => x.id === scope.id);
    return (s?.components || []).map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      datasetName: c.datasetName,
      dimensions: c.dimensions,
      metrics: c.metrics,
    }));
  }
  return [];
}

/* ============================ 语义层：行业黑话 / 同义词 ============================ */

export interface TerminologyItem {
  id: string;
  /** 行业黑话 / 用户口语说法 */
  term: string;
  /** 标准业务术语（映射到字段或口径） */
  standard: string;
  /** 关联字段（可空） */
  field?: string;
  /** 解释 */
  description: string;
}

/* ============================ 语义层：指标口径 ============================ */

export type Aggregation = 'sum' | 'avg' | 'count' | 'count_distinct' | 'max' | 'min';

export interface MetricDefinition {
  id: string;
  /** 指标名称 */
  name: string;
  /** 口径定义（表达式 / 说明） */
  expression: string;
  /** 单位 */
  unit: string;
  /** 聚合方式 */
  aggregation: Aggregation;
  /** 关联维度（可选） */
  relatedDimension?: string;
  /** 业务说明 */
  description: string;
  /** 数据质量 / 口径状态 */
  status: 'enabled' | 'draft';
}

/* ============================ 语义层：示例问数（few-shot） ============================ */

export interface ExampleQuery {
  id: string;
  /** 标准问题表述 */
  question: string;
  /** 关联数据集 */
  datasetId: string;
  datasetName: string;
  /** 期望 SQL */
  sql: string;
  /** 推荐图表类型 */
  chartType: string;
}

/* ============================ 语义层：数据集字段 ============================ */

export interface SemanticField {
  /** 物理字段名 */
  name: string;
  /** 业务别名（展示给用户） */
  alias: string;
  /** 字段类型 */
  type: 'string' | 'number' | 'date' | 'datetime';
  /** 字段说明 */
  description: string;
  /** 是否维度 */
  isDimension: boolean;
  /** 是否指标 */
  isMetric: boolean;
  /** 指标聚合方式（仅指标） */
  aggregation?: Aggregation;
}

export interface DatasetSchema {
  id: string;
  /** 数据集名称 */
  datasetName: string;
  /** 来源表 */
  tableName: string;
  /** 字段语义 */
  fields: SemanticField[];
  /** 字段来源：real=已从数据源同步真实列，inferred=业务域推断（待完善） */
  fieldSource?: 'real' | 'inferred';
  /** 更新时间 */
  updatedAt: string;
  /** 训练状态 */
  trainingStatus?: TrainingStatus;
  /** 训练策略：全量 / 增量 */
  trainingStrategy?: 'full' | 'incremental';
  /** 训练内容：字段语义 / 行业黑话 / 指标口径 / 示例问数 */
  trainingContent?: TrainingContent;
  /** 训练触发方式：手动 / 每日 / 每周 */
  trainingSchedule?: TrainingSchedule;
  /** 最近一次训练成功时间 */
  trainedAt?: string;
  /** 训练失败原因 */
  trainingFailedReason?: string;
}

export type TrainingStatus = 'untrained' | 'training' | 'trained' | 'failed';
export type TrainingSchedule = 'manual' | 'daily' | 'weekly';

export interface TrainingContent {
  fields: boolean;
  terms: boolean;
  metrics: boolean;
  examples: boolean;
}

/* ============================ 作用域（问数 / 解读） ============================ */

export type ScopeType = 'dataset' | 'report' | 'dashboard' | 'data-screen';

export interface QueryScope {
  type: ScopeType;
  id: string;
  name: string;
  /** 关联数据集（问数时用于 Schema Linking） */
  datasetId?: string;
  /** 解读模式下展示的资产说明 */
  description?: string;
}

/* ============================ 问数记录 ============================ */

export type QueryChartType = 'line' | 'bar' | 'pie' | 'metric' | 'scatter' | 'table';

export interface QueryResultCell {
  dim: string;
  value: number;
}

export interface QueryLog {
  id: string;
  /** 提问用户 */
  userId?: string;
  userName?: string;
  /** 用户原始问题 */
  question: string;
  /** 黑话改写后的问题 */
  rewrittenQuestion: string;
  /** 作用域 */
  scopeType: ScopeType;
  scopeName: string;
  /** 命中的数据集（Schema Linking 结果） */
  datasetId?: string;
  datasetName?: string;
  /** 命中的语义层术语 */
  hitTerms: string[];
  /** 推理（意图识别 + 选表选列过程） */
  reasoning: string;
  /** 生成的 SQL / DSL */
  sql: string;
  /** 图表类型 */
  chartType: QueryChartType;
  /** 图表类型名称 */
  chartTypeName: string;
  /** 结果摘要文字 */
  resultSummary: string;
  /** 是否命中语义层（使用了黑话/口径） */
  hitSemantic: boolean;
  /** 用户反馈 */
  feedback: 'up' | 'down' | null;
  /** 反馈原因 */
  feedbackReason?: string;
  /** 管理员修正后的标准 SQL */
  correctedSql?: string;
  /** 响应耗时 ms */
  responseTimeMs: number;
  /** 记录时间 */
  createdAt: number;
}

/* ============================ 种子：行业黑话 ============================ */

export const SEED_TERMS: TerminologyItem[] = [
  { id: 't-gmv', term: 'GMV', standard: '成交总额', field: 'amount', description: 'Gross Merchandise Volume，平台一定周期内的成交总金额。' },
  { id: 't-xiaoliang', term: '销量', standard: '销售数量', field: 'quantity', description: '用户口语中的"销量"通常指已售出的商品件数（quantity）。' },
  { id: 't-maoli', term: '毛利', standard: '收入−成本', description: '毛利 = 销售额 − 商品成本，反映基础盈利空间。' },
  { id: 't-kedanjia', term: '客单价', standard: '销售额 / 订单数', description: '平均每笔订单的金额，衡量用户消费水平。' },
  { id: 't-fugou', term: '复购率', standard: '重复购买用户占比', description: '周期内购买 2 次及以上的用户数 / 总用户数。' },
  { id: 't-dau', term: 'DAU', standard: '日活跃用户数', field: 'user_id', description: 'Daily Active Users，当日有活跃行为的去重用户数。' },
  { id: 't-xinzeng', term: '新增用户', standard: '首次注册用户', field: 'user_id', description: '当日首次完成注册的用户。' },
  { id: 't-liushui', term: '流水', standard: '交易流水额', field: 'amount', description: '所有交易产生的金额汇总，含未成交部分时需注意口径。' },
];

/* ============================ 种子：指标口径 ============================ */

export const SEED_METRICS: MetricDefinition[] = [
  { id: 'm-gmv', name: '成交总额(GMV)', expression: 'SUM(amount)', unit: '元', aggregation: 'sum', relatedDimension: '日期', description: '周期内所有订单的成交金额汇总。', status: 'enabled' },
  { id: 'm-qty', name: '销售数量', expression: 'SUM(quantity)', unit: '件', aggregation: 'sum', relatedDimension: '商品', description: '周期内售出的商品总件数。', status: 'enabled' },
  { id: 'm-maoli', name: '毛利', expression: 'SUM(amount) − SUM(cost)', unit: '元', aggregation: 'sum', relatedDimension: '日期', description: '销售额减去商品成本。', status: 'enabled' },
  { id: 'm-kedanjia', name: '客单价', expression: 'SUM(amount) / COUNT(DISTINCT order_id)', unit: '元', aggregation: 'avg', relatedDimension: '日期', description: '每笔订单的平均成交金额。', status: 'enabled' },
  { id: 'm-dau', name: '日活跃用户', expression: 'COUNT(DISTINCT user_id)', unit: '人', aggregation: 'count_distinct', relatedDimension: '日期', description: '当日有活跃行为的去重用户数。', status: 'enabled' },
  { id: 'm-fugou', name: '复购率', expression: 'COUNT(DISTINCT repeat_user) / COUNT(DISTINCT user_id)', unit: '%', aggregation: 'avg', relatedDimension: '日期', description: '重复购买用户占全部用户的比例。', status: 'draft' },
];

/* ============================ 种子：示例问数 ============================ */

export const SEED_EXAMPLES: ExampleQuery[] = [
  {
    id: 'e-1',
    question: '最近 7 天的成交额是多少？',
    datasetId: 'DT001',
    datasetName: '订单明细数据集',
    sql: "SELECT date, SUM(amount) AS gmv FROM dwd_dt001 WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) GROUP BY date ORDER BY date",
    chartType: 'line',
  },
  {
    id: 'e-2',
    question: '各地区的销量占比',
    datasetId: 'DT001',
    datasetName: '订单明细数据集',
    sql: "SELECT region, SUM(quantity) AS qty FROM dwd_dt001 GROUP BY region ORDER BY qty DESC",
    chartType: 'pie',
  },
  {
    id: 'e-3',
    question: '销售额 Top 10 的商品',
    datasetId: 'DT001',
    datasetName: '订单明细数据集',
    sql: "SELECT product_name, SUM(amount) AS gmv FROM dwd_dt001 GROUP BY product_name ORDER BY gmv DESC LIMIT 10",
    chartType: 'bar',
  },
];

/* ============================ 种子：数据集字段语义层（来自系统现有数据集） ============================ */

export const SEED_DATASETS: DatasetSchema[] = buildSeedDatasets();

/* ============================ 种子：作用域（来自系统现有数据集/报表/仪表盘/数据大屏） ============================ */

export const SEED_SCOPES: QueryScope[] = buildSeedScopes();

/* ============================ 种子：问数记录 ============================ */

export const SEED_QUERY_LOGS: QueryLog[] = [
  {
    id: 'q-good-001',
    userId: 'zhangsan',
    userName: '张三',
    question: '最近 7 天的 GMV 趋势怎么样？',
    rewrittenQuestion: '最近 7 天的成交总额(GMV)趋势',
    scopeType: 'dataset',
    scopeName: '订单明细数据集',
    datasetId: 'DT001',
    datasetName: '订单明细数据集',
    hitTerms: ['GMV'],
    reasoning: '意图=趋势；命中黑话"GMV"→成交总额(amount)；按日期维度聚合 SUM(amount)，时间窗口近 7 天。',
    sql: "SELECT date, SUM(amount) AS gmv FROM dwd_dt001 WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) GROUP BY date ORDER BY date",
    chartType: 'line',
    chartTypeName: '折线图',
    resultSummary: '近 7 天 GMV 整体上行，第 5 天达峰值 128.6 万元，环比 +18%。',
    hitSemantic: true,
    feedback: 'up',
    responseTimeMs: 820,
    createdAt: new Date('2026-08-19T10:12:00+08:00').getTime(),
  },
  {
    id: 'q-good-002',
    userId: 'lisi',
    userName: '李四',
    question: '各地区的销量占比是多少？',
    rewrittenQuestion: '各地区的销售数量占比',
    scopeType: 'dataset',
    scopeName: '订单明细数据集',
    datasetId: 'DT001',
    datasetName: '订单明细数据集',
    hitTerms: ['销量'],
    reasoning: '意图=占比；命中黑话"销量"→销售数量(quantity)；按地区维度聚合 SUM(quantity)。',
    sql: "SELECT region, SUM(quantity) AS qty FROM dwd_dt001 GROUP BY region ORDER BY qty DESC",
    chartType: 'pie',
    chartTypeName: '饼图',
    resultSummary: '华东占比 34% 最高，华南 27%，华北 21%，西部 18%。',
    hitSemantic: true,
    feedback: 'up',
    responseTimeMs: 760,
    createdAt: new Date('2026-08-19T14:35:00+08:00').getTime(),
  },
  {
    id: 'q-bad-001',
    userId: 'wangwu',
    userName: '王五',
    question: '毛利率是多少？',
    rewrittenQuestion: '毛利率是多少？',
    scopeType: 'dataset',
    scopeName: '订单明细数据集',
    datasetId: 'DT001',
    datasetName: '订单明细数据集',
    hitTerms: [],
    reasoning: '意图=单值指标；"毛利率"在语义层中无口径定义，按默认 (SUM(amount)-SUM(cost))/SUM(amount) 估算，结果置信度低。',
    sql: "SELECT SUM(amount) - SUM(cost) AS maoli, SUM(amount) AS gmv, (SUM(amount)-SUM(cost))/SUM(amount) AS rate FROM dwd_dt001",
    chartType: 'metric',
    chartTypeName: '指标卡',
    resultSummary: '估算毛利率约 38.2%（语义层缺少"毛利率"标准口径，建议补充）。',
    hitSemantic: false,
    feedback: 'down',
    feedbackReason: '未命中语义层，"毛利率"无标准口径，结果与业务定义可能不符，应在语义层补充指标口径。',
    correctedSql: "SELECT SUM(amount) - SUM(cost) AS gross_profit, SUM(amount) AS revenue, ROUND((SUM(amount)-SUM(cost))/NULLIF(SUM(amount),0),4) AS gross_margin FROM dwd_dt001",
    responseTimeMs: 690,
    createdAt: new Date('2026-08-19T16:02:00+08:00').getTime(),
  },
  {
    id: 'q-good-003',
    userId: 'zhaoliu',
    userName: '赵六',
    question: '帮我把运营驾驶舱解读一下',
    rewrittenQuestion: '解读运营驾驶舱核心指标',
    scopeType: 'dashboard',
    scopeName: '运营核心指标',
    datasetId: 'DT001',
    datasetName: '订单明细数据集',
    hitTerms: [],
    reasoning: '作用域=仪表盘(运营核心指标)；智能解读模式，关联数据集订单明细数据集，汇总核心指标并给出结论。',
    sql: '-- 智能解读：聚合运营核心指标核心 KPI（GMV / DAU / 转化漏斗）',
    chartType: 'metric',
    chartTypeName: '指标卡',
    resultSummary: '运营驾驶舱当前 GMV 1,286 万元，DAU 4.2 万，转化率 3.8%，较上周 +0.4pp，无异常预警。',
    hitSemantic: true,
    feedback: null,
    responseTimeMs: 910,
    createdAt: new Date('2026-08-20T09:20:00+08:00').getTime(),
  },
];

/* ============================ 存储 helper ============================ */

const TERMS_KEY = 'dae-semantic-terms';
const METRICS_KEY = 'dae-semantic-metrics';
const EXAMPLES_KEY = 'dae-semantic-examples';
const DATASETS_KEY = 'dae-semantic-datasets-v5';
const QUERY_LOGS_KEY = 'dae-query-logs';

export function getTerms(): TerminologyItem[] {
  return readList(TERMS_KEY, SEED_TERMS);
}
export function saveTerms(items: TerminologyItem[]): void {
  writeList(TERMS_KEY, items);
}
export function getMetrics(): MetricDefinition[] {
  return readList(METRICS_KEY, SEED_METRICS);
}
export function saveMetrics(items: MetricDefinition[]): void {
  writeList(METRICS_KEY, items);
}
export function getExamples(): ExampleQuery[] {
  return readList(EXAMPLES_KEY, SEED_EXAMPLES);
}
export function saveExamples(items: ExampleQuery[]): void {
  writeList(EXAMPLES_KEY, items);
}
export function getDatasets(): DatasetSchema[] {
  return readList(DATASETS_KEY, SEED_DATASETS);
}
export function saveDatasets(items: DatasetSchema[]): void {
  writeList(DATASETS_KEY, items);
}
export function getScopes(): QueryScope[] {
  return SEED_SCOPES;
}

export function getQueryLogs(): QueryLog[] {
  // 内置示例长期保留，与用户真实记录合并（按时间倒序）
  const seedMap = new Map(SEED_QUERY_LOGS.map((l) => [l.id, l]));
  let stored: QueryLog[] = [];
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(QUERY_LOGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as QueryLog[];
        stored = Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      stored = [];
    }
  }
  stored.forEach((l) => seedMap.set(l.id, l));
  return Array.from(seedMap.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export function saveQueryLogs(logs: QueryLog[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(QUERY_LOGS_KEY, JSON.stringify(logs));
  }
}

export function appendQueryLog(log: QueryLog): void {
  if (typeof window === 'undefined') return;
  const logs = getQueryLogs();
  logs.unshift(log);
  saveQueryLogs(logs.slice(0, 500));
}

export function updateQueryLog(logId: string, patch: Partial<QueryLog>): QueryLog | null {
  if (typeof window === 'undefined') return null;
  const logs = getQueryLogs();
  const idx = logs.findIndex((l) => l.id === logId);
  if (idx === -1) return null;
  const updated = { ...logs[idx], ...patch };
  logs[idx] = updated;
  saveQueryLogs(logs);
  return updated;
}

/* 黑话命中检测（供引擎调用） */
export function findHitTerms(question: string, terms: TerminologyItem[]): TerminologyItem[] {
  const q = question.toLowerCase();
  return terms.filter((t) => q.includes(t.term.toLowerCase()) || q.includes(t.standard.toLowerCase()));
}

function readList<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T[];
  } catch {
    /* ignore */
  }
  return fallback;
}

function writeList<T>(key: string, items: T[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(items));
  }
}
