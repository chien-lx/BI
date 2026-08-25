/**
 * 智能问数引擎（原型阶段：用规则 + 语义层模拟 NL2SQL，不真微调模型）
 *
 * 链路：黑话改写 → 意图识别 → Schema Linking(选表选列) → 生成 SQL/DSL
 *      → 图表自动映射 → 生成 mock 结果 + 文字结论
 *
 * 参考：Quick BI（智能小 Q）实时输出「推理过程+SQL+图表+结论」；
 *      腾讯云 BI（ChatBI）统一语义层消除口径歧义。
 */

import {
  findHitTerms,
  getScopeLinkedComponents,
  getScopeQueryability,
  getScopeDatasetDependencies,
  type DatasetSchema,
  type LinkedComponent,
  type MetricDefinition,
  type QueryChartType,
  type QueryScope,
  type ScopeType,
  type TerminologyItem,
} from '../../data/semanticLayer';

export interface QueryResultCell {
  dim: string;
  value: number;
}

export interface QueryResult {
  /** 黑话改写后的问题 */
  rewrittenQuestion: string;
  /** 命中的语义层术语 */
  hitTerms: TerminologyItem[];
  /** 推理过程（意图识别 + 选表选列） */
  reasoning: string;
  /** 生成的 SQL / DSL */
  sql: string;
  /** 图表类型 */
  chartType: QueryChartType;
  /** 图表类型名 */
  chartTypeName: string;
  /** 维度-数值结果（图表用） */
  data: QueryResultCell[];
  /** 单值（指标卡用） */
  metricValue?: number;
  /** 文字结论 */
  summary: string;
  /** 是否命中语义层 */
  hitSemantic: boolean;
  /** 是否为智能解读（报表/仪表盘/数据大屏，不取数） */
  isInterpretation?: boolean;
  /** 解读资产类型 */
  scopeType?: ScopeType;
  /** 解读模式下联动展示的资产实际图表组件 */
  linkedComponents?: LinkedComponent[];
}

const CHART_NAMES: Record<QueryChartType, string> = {
  line: '折线图',
  bar: '柱状图',
  pie: '饼图',
  metric: '指标卡',
  scatter: '散点图',
  table: '明细表',
};

/* 维度候选，用于 Schema Linking 选列 */
const DIMENSION_HINTS: Record<string, string[]> = {
  date: ['日期', '时间', '月份', '天'],
  region: ['地区', '省份', '城市', '区域', '大区'],
  category: ['类目', '品类', '商品', '产品'],
  city: ['城市', '市'],
};

/* 指标候选 */
const METRIC_HINTS: Record<string, string[]> = {
  gmv: ['成交', 'gmv', '销售额', '金额', '流水'],
  qty: ['销量', '数量', '件数', '件'],
  maoli: ['毛利'],
  dau: ['活跃', 'dau', '用户数'],
};

function classifyIntent(q: string): { chartType: QueryChartType; intent: string } {
  const text = q.toLowerCase();
  if (/相关性|关系|影响因子|相关/.test(text)) return { chartType: 'scatter', intent: '相关性分析' };
  if (/占比|比例|构成|份额|分布|结构/.test(text)) return { chartType: 'pie', intent: '构成占比' };
  if (/排名|top|前\s*\d+|最多|最少|最高|最低|对比|排行榜|榜/.test(text)) return { chartType: 'bar', intent: '排名对比' };
  if (/地区|省份|各市|各省|区域|大区/.test(text)) return { chartType: 'bar', intent: '地区分布' };
  if (/趋势|走势|变化|按月|每日|每天|近\s*\d+\s*天|环比|同比|增长|下降|曲线/.test(text)) return { chartType: 'line', intent: '趋势变化' };
  if (/多少|总计|总和|总额|一共|合计|是多少|多大|几个/.test(text)) return { chartType: 'metric', intent: '单值查询' };
  return { chartType: 'bar', intent: '分组统计' };
}

function pickDimension(dataset: DatasetSchema | undefined, intent: string, q: string): string | undefined {
  if (!dataset) return undefined;
  // 根据意图优先匹配维度
  if (intent === '趋势变化') {
    const f = dataset.fields.find((f) => f.isDimension && f.type === 'date');
    if (f) return f.name;
  }
  if (intent === '地区分布') {
    const f = dataset.fields.find((f) => f.isDimension && /region|地区|省份|城市|区域/.test(f.name + f.alias));
    if (f) return f.name;
  }
  if (intent === '排名对比') {
    const f = dataset.fields.find((f) => f.isDimension && /product|商品|类目|名称/.test(f.name + f.alias));
    if (f) return f.name;
    const f2 = dataset.fields.find((f) => f.isDimension);
    if (f2) return f2.name;
  }
  if (intent === '构成占比') {
    const f = dataset.fields.find((f) => f.isDimension && /region|类别|类目|城市|渠道/.test(f.name + f.alias));
    if (f) return f.name;
  }
  // 查询里出现的具体维度词
  for (const dim of Object.values(DIMENSION_HINTS).flat()) {
    const f = dataset.fields.find((f) => f.isDimension && (f.alias.includes(dim) || f.name.includes(dim)));
    if (f) return f.name;
  }
  return dataset.fields.find((f) => f.isDimension)?.name;
}

function pickMetric(dataset: DatasetSchema | undefined, q: string): { name: string; agg: string; alias: string } | undefined {
  if (!dataset) return undefined;
  for (const [key, hints] of Object.entries(METRIC_HINTS)) {
    if (hints.some((h) => q.includes(h))) {
      const f = dataset.fields.find((f) => f.isMetric && new RegExp(key, 'i').test(f.name + f.alias));
      if (f) return { name: f.name, agg: f.aggregation || 'sum', alias: f.alias };
    }
  }
  const f = dataset.fields.find((f) => f.isMetric);
  return f ? { name: f.name, agg: f.aggregation || 'sum', alias: f.alias } : undefined;
}

/* 生成 mock 结果数据 */
function buildMockData(chartType: QueryChartType, dim?: string, metricAlias = '数值'): QueryResultCell[] {
  const rnd = (min: number, max: number) => Math.round(min + Math.random() * (max - min));
  if (chartType === 'line') {
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    return days.map((d, i) => ({ dim: d, value: rnd(60, 140) + i * 6 }));
  }
  if (chartType === 'pie' || chartType === 'bar') {
    if (dim && /region|地区/.test(dim)) {
      return [
        { dim: '华东', value: rnd(300, 500) },
        { dim: '华南', value: rnd(200, 400) },
        { dim: '华北', value: rnd(150, 350) },
        { dim: '西部', value: rnd(100, 250) },
      ];
    }
    if (dim && /product|商品/.test(dim)) {
      return ['商品A', '商品B', '商品C', '商品D', '商品E', '商品F', '商品G', '商品H', '商品I', '商品J'].slice(0, 10).map((d) => ({ dim: d, value: rnd(20, 200) }));
    }
    return ['类目一', '类目二', '类目三', '类目四', '类目五'].map((d) => ({ dim: d, value: rnd(50, 300) }));
  }
  if (chartType === 'scatter') {
    return Array.from({ length: 12 }).map(() => ({ dim: `点${rnd(1, 12)}`, value: rnd(10, 100) }));
  }
  return [];
}

function buildSql(scope: QueryScope, dim: string | undefined, metric: { name: string; agg: string; alias: string } | undefined, chartType: QueryChartType, q: string): string {
  const table = scope.type === 'dataset' ? (scope.datasetId ? `ds_${scope.datasetId.replace('ds-', '')}` : 'target_table') : 'business_table';
  if (chartType === 'metric') {
    const m = metric || { name: 'amount', agg: 'sum', alias: '指标' };
    return `SELECT ${m.agg.toUpperCase()}(${m.name}) AS ${m.alias} FROM ${table}` + (q.includes('近') ? ' WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)' : '');
  }
  const groupBy = dim ? `GROUP BY ${dim} ORDER BY ${metric?.name || 'v'} DESC` : '';
  const limit = chartType === 'bar' && /top|前/.test(q) ? ' LIMIT 10' : '';
  return `SELECT ${dim || '*'}, ${metric ? `${metric.agg.toUpperCase()}(${metric.name}) AS ${metric.alias}` : 'COUNT(*) AS cnt'}\nFROM ${table}\n${groupBy}${limit}`;
}

/**
 * 执行一次问数（原型：规则 + 语义层模拟）
 */
export function runQuery(
  question: string,
  scope: QueryScope,
  datasets: DatasetSchema[],
  terms: TerminologyItem[],
  metrics: MetricDefinition[],
): QueryResult {
  const q = question.toLowerCase();
  const hitTerms = findHitTerms(question, terms);

  // —— 未训练拦截：数据集/报表/仪表盘/大屏的可问数均依赖数据集训练状态 ——
  const qability = getScopeQueryability(scope);
  if (qability === 'unqueryable') {
    const deps = getScopeDatasetDependencies(scope);
    const untrainedNames = deps
      .map((id) => datasets.find((d) => d.id === id)?.datasetName || id)
      .join('、');
    const typeLabel = scope.type === 'dataset' ? '数据集' : scope.type === 'report' ? '报表' : scope.type === 'dashboard' ? '仪表盘' : '数据大屏';
    return {
      rewrittenQuestion: question,
      hitTerms: [],
      reasoning: `${typeLabel}「${scope.name}」尚未完成训练，无法生成可置信的回答。`,
      sql: `-- 不可问数：${typeLabel}「${scope.name}」依赖的数据集未训练`,
      chartType: 'metric',
      chartTypeName: '指标卡',
      data: [],
      summary: `该${typeLabel}依赖的数据集「${untrainedNames}」未训练，请先到「数据准备 → 数据集」中执行训练。`,
      hitSemantic: false,
    };
  }

  // —— 智能解读模式（报表 / 仪表盘 / 数据大屏）——
  if (scope.type !== 'dataset') {
    const ds = scope.datasetId ? datasets.find((d) => d.id === scope.datasetId) : undefined;
    const linked = getScopeLinkedComponents(scope);
    const typeLabel = scope.type === 'report' ? '报表' : scope.type === 'dashboard' ? '仪表盘' : '数据大屏';
    const summary = `已解读「${scope.name}」：${scope.description || `该${typeLabel}聚合了核心业务指标。`}当前配置 ${linked.length} 个图表组件，核心 KPI 整体稳定，未见明显异常。${
      linked.length ? '已联动展示其实际图表组件，详见下方。' : ''
    }`;
    return {
      rewrittenQuestion: `解读${scope.name}核心指标`,
      hitTerms: [],
      reasoning: `作用域=${typeLabel}（${scope.name}）；智能解读模式，关联数据集「${ds?.datasetName || '—'}」，汇总核心指标并联动展示实际图表组件。`,
      sql: `-- 智能解读：${scope.name}（${typeLabel}）核心 KPI`,
      chartType: 'metric',
      chartTypeName: CHART_NAMES.metric,
      data: [],
      metricValue: undefined,
      summary,
      hitSemantic: true,
      isInterpretation: true,
      scopeType: scope.type,
      linkedComponents: linked,
    };
  }

  // —— 问数模式（数据集）——
  const dataset = datasets.find((d) => d.id === scope.datasetId);
  const { chartType, intent } = classifyIntent(question);
  const dim = pickDimension(dataset, intent, question);
  const metric = pickMetric(dataset, question);
  const data = buildMockData(chartType, dim, metric?.alias);
  const sql = buildSql(scope, dim, metric, chartType, question);

  const termText = hitTerms.map((t) => `命中黑话"${t.term}"→${t.standard}`).join('；');
  const metricText = metric ? `指标=${metric.alias}(${metric.agg})` : '指标=默认计数';
  const dimText = dim ? `维度=${dim}` : '维度=默认';
  const reasoning = `意图=${intent}；${termText ? termText + '；' : ''}选表=${dataset?.tableName || 'target'}；${dimText}；${metricText}。`;

  let summary = '';
  const total = data.reduce((s, d) => s + d.value, 0);
  if (chartType === 'metric') {
    summary = `查询结果为 ${total.toLocaleString()}（${metric?.alias || '指标'}）。`;
  } else if (chartType === 'pie' || chartType === 'bar') {
    const top = [...data].sort((a, b) => b.value - a.value)[0];
    summary = `共 ${data.length} 项，最高为「${top?.dim}」(${top?.value.toLocaleString()})，合计 ${total.toLocaleString()}。`;
  } else if (chartType === 'line') {
    const first = data[0]?.value ?? 0;
    const last = data[data.length - 1]?.value ?? 0;
    const pct = first ? (((last - first) / first) * 100).toFixed(1) : '0';
    summary = `呈现 ${data.length} 个周期变化，由 ${first} 到 ${last}，整体${last >= first ? '上行' : '下行'} ${Math.abs(Number(pct))}%。`;
  } else {
    summary = `共 ${data.length} 条记录，请结合图表查看分布。`;
  }

  return {
    rewrittenQuestion: hitTerms.length ? question : question,
    hitTerms,
    reasoning,
    sql,
    chartType,
    chartTypeName: CHART_NAMES[chartType],
    data,
    metricValue: chartType === 'metric' ? total : undefined,
    summary,
    hitSemantic: hitTerms.length > 0,
  };
}
