import React, { useState, useMemo } from 'react';
import {
  FileBarChart, LayoutDashboard, Monitor, FileText,
  ChevronRight, ChevronDown, Search, BarChart3, Table2, Eye
} from 'lucide-react';
import ChartRenderer from '../components/ChartRenderer';
import {
  charts, reports, dashboards, dataScreens,
  chartSampleData, pieSampleData
} from '../data/mockData';

/* ==================== 类型定义 ==================== */

type AssetType = 'chart' | 'report' | 'dashboard' | 'screen';

interface TreeItem {
  id: string;
  name: string;
  type: AssetType;
}

interface TreeGroup {
  key: AssetType;
  label: string;
  icon: React.ElementType;
  items: TreeItem[];
}

/* ==================== 模拟数据：报表详情 ==================== */

interface ReportDetail {
  name: string;
  datasetName: string;
  dimensions: { id: string; name: string; visible: boolean }[];
  metrics: { id: string; name: string; visible: boolean }[];
  filters: { field: string; operator: string; value: string }[];
  rows: Record<string, string>[];
}

const reportDetails: Record<string, ReportDetail> = {
  'RP001': {
    name: '销售日报',
    datasetName: '订单明细数据集',
    dimensions: [
      { id: 'd1', name: '日期', visible: true },
      { id: 'd2', name: '省份', visible: true },
      { id: 'd3', name: '城市', visible: false },
      { id: 'd4', name: '商品品类', visible: true },
    ],
    metrics: [
      { id: 'm1', name: '销售额', visible: true },
      { id: 'm2', name: '订单量', visible: true },
      { id: 'm3', name: '客单价', visible: true },
    ],
    filters: [
      { field: '日期', operator: '=', value: '2026-08-04' },
    ],
    rows: [
      { '日期': '2026-08-04', '省份': '广东省', '商品品类': '电子产品', '销售额': '125,680.00', '订单量': '328', '客单价': '383.17' },
      { '日期': '2026-08-04', '省份': '浙江省', '商品品类': '服装配饰', '销售额': '98,450.00', '订单量': '256', '客单价': '384.57' },
      { '日期': '2026-08-04', '省份': '江苏省', '商品品类': '食品饮料', '销售额': '156,230.00', '订单量': '412', '客单价': '379.20' },
      { '日期': '2026-08-04', '省份': '四川省', '商品品类': '家居用品', '销售额': '87,920.00', '订单量': '198', '客单价': '444.04' },
      { '日期': '2026-08-04', '省份': '湖北省', '商品品类': '电子产品', '销售额': '203,560.00', '订单量': '534', '客单价': '381.20' },
      { '日期': '2026-08-04', '省份': '山东省', '商品品类': '服装配饰', '销售额': '178,340.00', '订单量': '467', '客单价': '381.88' },
      { '日期': '2026-08-04', '省份': '河南省', '商品品类': '食品饮料', '销售额': '145,670.00', '订单量': '389', '客单价': '374.47' },
      { '日期': '2026-08-04', '省份': '福建省', '商品品类': '家居用品', '销售额': '92,340.00', '订单量': '215', '客单价': '429.49' },
    ],
  },
  'RP002': {
    name: '用户增长周报',
    datasetName: '用户画像数据集',
    dimensions: [
      { id: 'd1', name: '日期', visible: true },
      { id: 'd2', name: '渠道', visible: true },
      { id: 'd3', name: '版本', visible: false },
    ],
    metrics: [
      { id: 'm1', name: '新增用户', visible: true },
      { id: 'm2', name: '活跃用户', visible: true },
      { id: 'm3', name: '留存率', visible: true },
    ],
    filters: [
      { field: '日期', operator: 'between', value: '2026-07-28 ~ 2026-08-04' },
    ],
    rows: [
      { '日期': '2026-07-28', '渠道': 'App Store', '新增用户': '1,234', '活跃用户': '45,230', '留存率': '34.5%' },
      { '日期': '2026-07-29', '渠道': '华为应用', '新增用户': '892', '活跃用户': '42,100', '留存率': '32.1%' },
      { '日期': '2026-07-30', '渠道': '小米应用', '新增用户': '756', '活跃用户': '40,890', '留存率': '31.8%' },
      { '日期': '2026-07-31', '渠道': 'OPPO应用', '新增用户': '623', '活跃用户': '38,760', '留存率': '30.2%' },
      { '日期': '2026-08-01', '渠道': 'vivo应用', '新增用户': '534', '活跃用户': '37,450', '留存率': '29.8%' },
      { '日期': '2026-08-02', '渠道': 'App Store', '新增用户': '1,345', '活跃用户': '46,780', '留存率': '35.2%' },
      { '日期': '2026-08-03', '渠道': '华为应用', '新增用户': '967', '活跃用户': '43,560', '留存率': '33.6%' },
      { '日期': '2026-08-04', '渠道': '小米应用', '新增用户': '823', '活跃用户': '41,230', '留存率': '32.4%' },
    ],
  },
};

// 为其他报表生成默认详情
const defaultReportDetail = (name: string, datasetName: string): ReportDetail => ({
  name,
  datasetName,
  dimensions: [
    { id: 'd1', name: '日期', visible: true },
    { id: 'd2', name: '渠道ID', visible: true },
    { id: 'd3', name: '渠道名称', visible: true },
  ],
  metrics: [
    { id: 'm1', name: '月累计用户数', visible: true },
    { id: 'm2', name: '月累计新增用户数', visible: true },
  ],
  filters: [],
  rows: Array.from({ length: 10 }, (_, i) => ({
    '日期': `2026-8-4 10:22:${43 + i}`,
    '渠道ID': 'A001',
    '渠道名称': 'WIFI',
    '月累计用户数': '230',
    '月累计新增用户数': '3000',
  })),
});

/* ==================== 图表类型映射 ==================== */

const chartTypeMap: Record<string, 'bar' | 'line' | 'area' | 'pie'> = {
  '折线图': 'line',
  '柱状图': 'bar',
  '饼图': 'pie',
  '面积图': 'area',
  '漏斗图': 'bar',
  '箱线图': 'bar',
  '堆叠条形图': 'bar',
  '雷达图': 'bar',
  '仪表盘图': 'pie',
  '桑基图': 'bar',
  '环形图': 'pie',
  '词云图': 'pie',
  '关系图': 'bar',
  '指标卡组': 'bar',
  '时间轴': 'line',
  '瀑布图': 'bar',
  '树图': 'bar',
  '散点图': 'bar',
};

/* ==================== 左侧目录树 ==================== */

function DirectoryTree({
  groups,
  selectedId,
  onSelect,
  search,
  onSearchChange,
}: {
  groups: TreeGroup[];
  selectedId: string | null;
  onSelect: (item: TreeItem) => void;
  search: string;
  onSearchChange: (v: string) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    chart: true,
    report: true,
    dashboard: true,
    screen: true,
  });

  const toggleGroup = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groups;
    const s = search.trim().toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((i) => i.name.toLowerCase().includes(s)),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, search]);

  return (
    <div
      style={{
        width: 260,
        minWidth: 260,
        background: '#fff',
        borderRight: '1px solid var(--dae-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* 顶部标题 */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--dae-border)',
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--dae-ink)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Search size={16} style={{ color: 'var(--dae-ink-muted)' }} />
        资产目录
      </div>

      {/* 搜索框 */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--dae-border)' }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--dae-ink-subtle)',
            }}
          />
          <input
            placeholder="搜索资产名称..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 10px 7px 32px',
              fontSize: 13,
              border: '1px solid var(--dae-border)',
              borderRadius: 'var(--dae-radius-md)',
              outline: 'none',
              background: 'var(--dae-surface)',
              color: 'var(--dae-ink)',
            }}
          />
        </div>
      </div>

      {/* 树节点 */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }} className="dae-scroll">
        {filteredGroups.map((group) => {
          const isExpanded = expanded[group.key];
          const Icon = group.icon;
          return (
            <div key={group.key} style={{ marginBottom: 4 }}>
              {/* 分类节点 */}
              <button
                onClick={() => toggleGroup(group.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--dae-ink-secondary)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {isExpanded ? (
                  <ChevronDown size={14} style={{ color: 'var(--dae-ink-muted)' }} />
                ) : (
                  <ChevronRight size={14} style={{ color: 'var(--dae-ink-muted)' }} />
                )}
                <Icon size={16} style={{ color: 'var(--dae-primary)' }} />
                <span style={{ flex: 1 }}>{group.label}</span>
                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--dae-ink-subtle)',
                    fontWeight: 500,
                    background: 'var(--dae-surface)',
                    padding: '1px 6px',
                    borderRadius: 8,
                  }}
                >
                  {group.items.length}
                </span>
              </button>

              {/* 子节点 */}
              {isExpanded && (
                <div style={{ paddingLeft: 12 }}>
                  {group.items.map((item) => {
                    const isActive = selectedId === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onSelect(item)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '7px 12px 7px 28px',
                          fontSize: 13,
                          color: isActive ? 'var(--dae-primary)' : 'var(--dae-ink-secondary)',
                          background: isActive ? 'var(--dae-primary-light)' : 'transparent',
                          border: 'none',
                          borderRadius: 'var(--dae-radius-md)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontWeight: isActive ? 500 : 400,
                          margin: '2px 8px',
                          width: 'calc(100% - 16px)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={item.name}
                      >
                        {group.key === 'chart' && <BarChart3 size={14} style={{ flexShrink: 0 }} />}
                        {group.key === 'report' && <Table2 size={14} style={{ flexShrink: 0 }} />}
                        {group.key === 'dashboard' && <LayoutDashboard size={14} style={{ flexShrink: 0 }} />}
                        {group.key === 'screen' && <Monitor size={14} style={{ flexShrink: 0 }} />}
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ==================== 右侧内容：报表渲染 ==================== */

function ReportContent({ reportId }: { reportId: string }) {
  const report = reports.find((r) => r.id === reportId);
  const detail = reportDetails[reportId] || defaultReportDetail(report?.name || '报表', report?.datasetName || '-');

  const [dims, setDims] = useState(detail.dimensions);
  const [metrics, setMetrics] = useState(detail.metrics);

  const visibleCols = [
    ...dims.filter((d) => d.visible).map((d) => d.name),
    ...metrics.filter((m) => m.visible).map((m) => m.name),
  ];

  const toggleDim = (id: string) => {
    setDims((prev) => prev.map((d) => (d.id === id ? { ...d, visible: !d.visible } : d)));
  };
  const toggleMetric = (id: string) => {
    setMetrics((prev) => prev.map((m) => (m.id === id ? { ...m, visible: !m.visible } : m)));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%', overflow: 'auto' }} className="dae-scroll">
      {/* 标题 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <Table2 size={20} style={{ color: 'var(--dae-primary)' }} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--dae-ink)' }}>{detail.name}</div>
          <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)', marginTop: 2 }}>
            数据集：{detail.datasetName} | 报表 ID：{reportId}
          </div>
        </div>
      </div>

      {/* 可选维度 */}
      <section style={{ background: '#fff', borderRadius: 'var(--dae-radius-md)', border: '1px solid var(--dae-border)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--dae-border)', background: 'var(--dae-surface)' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dae-ink)' }}>可选维度</span>
          <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--dae-ink-muted)', background: 'var(--dae-primary-light)', padding: '1px 6px', borderRadius: 8 }}>
            {dims.filter((d) => d.visible).length}/{dims.length}
          </span>
        </div>
        <div style={{ padding: '10px 16px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {dims.map((dim) => (
            <span
              key={dim.id}
              onClick={() => toggleDim(dim.id)}
              className={`de-pill ${dim.visible ? 'de-pill-dim' : 'de-pill-disabled'}`}
              style={{ cursor: 'pointer' }}
            >
              {dim.name}
              {!dim.visible && <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.6 }}>(已隐藏)</span>}
            </span>
          ))}
        </div>
      </section>

      {/* 可选指标 */}
      <section style={{ background: '#fff', borderRadius: 'var(--dae-radius-md)', border: '1px solid var(--dae-border)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--dae-border)', background: 'var(--dae-surface)' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dae-ink)' }}>可选指标</span>
          <span style={{ marginLeft: 8, fontSize: 11, color: '#15803d', background: '#dcfce7', padding: '1px 6px', borderRadius: 8 }}>
            {metrics.filter((m) => m.visible).length}/{metrics.length}
          </span>
        </div>
        <div style={{ padding: '10px 16px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {metrics.map((metric) => (
            <span
              key={metric.id}
              onClick={() => toggleMetric(metric.id)}
              className={`de-pill ${metric.visible ? 'de-pill-metric' : 'de-pill-disabled'}`}
              style={{ cursor: 'pointer' }}
            >
              {metric.name}
              {!metric.visible && <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.6 }}>(已隐藏)</span>}
            </span>
          ))}
        </div>
      </section>

      {/* 筛选条件 */}
      {detail.filters.length > 0 && (
        <section style={{ background: '#fff', borderRadius: 'var(--dae-radius-md)', border: '1px solid var(--dae-border)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--dae-border)', background: 'var(--dae-surface)' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dae-ink)' }}>筛选条件</span>
          </div>
          <div style={{ padding: '12px 16px', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            {detail.filters.map((filter, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 'var(--dae-radius-sm)', border: '1px solid var(--dae-border)', background: 'var(--dae-surface)' }}>
                <span style={{ padding: '2px 8px', borderRadius: 'var(--dae-radius-sm)', border: '1px solid #bae0ff', background: '#e6f4ff', color: '#1677FF', fontSize: 12, fontWeight: 500 }}>
                  {filter.field}
                </span>
                <span style={{ fontSize: 12, color: 'var(--dae-ink-secondary)' }}>{filter.operator}</span>
                <span style={{ fontSize: 12, color: 'var(--dae-ink)' }}>{filter.value}</span>
              </div>
            ))}
            <button className="dae-btn dae-btn-primary dae-btn-sm" style={{ marginLeft: 'auto' }}>
              查询
            </button>
          </div>
        </section>
      )}

      {/* 数据表格 */}
      <section style={{ background: '#fff', borderRadius: 'var(--dae-radius-md)', border: '1px solid var(--dae-border)', overflow: 'hidden', flex: 1, minHeight: 300 }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--dae-border)', background: 'var(--dae-surface)' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dae-ink)' }}>数据预览</span>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--dae-ink-muted)' }}>共 {detail.rows.length} 条</span>
        </div>
        <div style={{ overflow: 'auto' }}>
          <table className="dae-table" style={{ margin: 0 }}>
            <thead>
              <tr>
                {visibleCols.map((col) => (
                  <th key={col} style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {detail.rows.map((row, idx) => (
                <tr key={idx}>
                  {visibleCols.map((col) => (
                    <td key={col} style={{ padding: '9px 14px', fontSize: 12, whiteSpace: 'nowrap' }}>
                      {row[col] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ==================== 右侧内容：图表渲染 ==================== */

function ChartContent({ chartId }: { chartId: string }) {
  const chart = charts.find((c) => c.id === chartId);
  if (!chart) return <div className="dae-empty"><BarChart3 size={40} /><p>未找到图表</p></div>;

  const type = chartTypeMap[chart.type] || 'bar';
  const isPie = type === 'pie';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflow: 'auto' }} className="dae-scroll">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <BarChart3 size={20} style={{ color: 'var(--dae-primary)' }} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--dae-ink)' }}>{chart.name}</div>
          <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)', marginTop: 2 }}>
            {chart.type} | {chart.datasetName} | 创建人：{chart.creator}
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 'var(--dae-radius-lg)', border: '1px solid var(--dae-border)', padding: 24, flex: 1, minHeight: 400 }}>
        <ChartRenderer
          type={type}
          data={isPie ? pieSampleData : chartSampleData}
          yKeys={isPie ? undefined : ['value', 'value2']}
          height={400}
        />
      </div>
    </div>
  );
}

/* ==================== 右侧内容：仪表盘渲染 ==================== */

function DashboardContent({ dashboardId }: { dashboardId: string }) {
  const dashboard = dashboards.find((d) => d.id === dashboardId);
  if (!dashboard) return <div className="dae-empty"><LayoutDashboard size={40} /><p>未找到仪表盘</p></div>;

  const chartsList = dashboard.charts || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflow: 'auto' }} className="dae-scroll">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <LayoutDashboard size={20} style={{ color: 'var(--dae-primary)' }} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--dae-ink)' }}>{dashboard.name}</div>
          <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)', marginTop: 2 }}>
            共 {chartsList.length} 个图表 | 创建人：{dashboard.creator}
          </div>
        </div>
      </div>

      {chartsList.length === 0 ? (
        <div className="dae-empty" style={{ background: '#fff', borderRadius: 'var(--dae-radius-lg)', border: '1px solid var(--dae-border)' }}>
          <BarChart3 size={48} />
          <p>该仪表盘暂无图表</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {chartsList.map((chart) => {
            const type = chart.type === 'table' ? 'bar' : chart.type;
            const isPie = type === 'pie';
            return (
              <div
                key={chart.id}
                style={{
                  background: '#fff',
                  borderRadius: 'var(--dae-radius-lg)',
                  border: '1px solid var(--dae-border)',
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 12 }}>
                  {chart.name}
                </div>
                <div style={{ flex: 1, minHeight: 260 }}>
                  <ChartRenderer
                    type={type}
                    data={isPie ? pieSampleData : chartSampleData}
                    yKeys={isPie ? undefined : ['value', 'value2']}
                    height={280}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ==================== 右侧内容：数据大屏渲染 ==================== */

function ScreenContent({ screenId }: { screenId: string }) {
  const screen = dataScreens.find((s) => s.id === screenId);
  if (!screen) return <div className="dae-empty"><Monitor size={40} /><p>未找到数据大屏</p></div>;

  // 模拟大屏数据
  const screenMetrics = [
    { label: '实时销售额', value: '¥ 2,345,678', change: '+12.5%', color: '#10b981' },
    { label: '订单数量', value: '12,456', change: '+8.3%', color: '#3b82f6' },
    { label: '访问用户数', value: '89,234', change: '+15.2%', color: '#f59e0b' },
    { label: '转化率', value: '4.56%', change: '-0.8%', color: '#ef4444' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflow: 'auto' }} className="dae-scroll">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Monitor size={20} style={{ color: 'var(--dae-primary)' }} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--dae-ink)' }}>{screen.name}</div>
          <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)', marginTop: 2 }}>
            分辨率：{screen.resolution} | 创建人：{screen.creator} | 状态：{screen.status === 'online' ? '已上线' : screen.status === 'pending' ? '待上线' : '已下线'}
          </div>
        </div>
      </div>

      {/* 模拟大屏预览 */}
      <div
        style={{
          background: '#0b1121',
          borderRadius: 'var(--dae-radius-lg)',
          padding: 24,
          flex: 1,
          minHeight: 500,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* 大屏标题 */}
        <div style={{ textAlign: 'center', padding: '8px 0', borderBottom: '1px solid rgba(59,130,246,0.3)' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#60a5fa', letterSpacing: 2 }}>
            {screen.name}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
            数据更新时间：{new Date().toLocaleString('zh-CN')}
          </div>
        </div>

        {/* 指标卡片 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {screenMetrics.map((metric, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(30,41,59,0.8)',
                border: '1px solid rgba(59,130,246,0.2)',
                borderRadius: 'var(--dae-radius-md)',
                padding: 20,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>{metric.label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: metric.color, marginBottom: 6 }}>
                {metric.value}
              </div>
              <div style={{ fontSize: 12, color: metric.change.startsWith('+') ? '#10b981' : '#ef4444' }}>
                {metric.change} 较昨日
              </div>
            </div>
          ))}
        </div>

        {/* 模拟图表区域 */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, flex: 1 }}>
          <div
            style={{
              background: 'rgba(30,41,59,0.8)',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: 'var(--dae-radius-md)',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: '#cbd5e1', marginBottom: 12 }}>趋势分析</div>
            <div style={{ flex: 1, minHeight: 200 }}>
              <ChartRenderer type="line" data={chartSampleData} yKeys={['value']} height={220} />
            </div>
          </div>
          <div
            style={{
              background: 'rgba(30,41,59,0.8)',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: 'var(--dae-radius-md)',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: '#cbd5e1', marginBottom: 12 }}>占比分布</div>
            <div style={{ flex: 1, minHeight: 200 }}>
              <ChartRenderer type="pie" data={pieSampleData} height={220} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== 内容路由 ==================== */

function ContentRenderer({ selected }: { selected: TreeItem | null }) {
  if (!selected) {
    return (
      <div className="dae-empty" style={{ height: '100%' }}>
        <Search size={48} style={{ color: 'var(--dae-ink-subtle)' }} />
        <p>请在左侧目录树中选择一个资产查看</p>
      </div>
    );
  }

  switch (selected.type) {
    case 'report':
      return <ReportContent reportId={selected.id} />;
    case 'chart':
      return <ChartContent chartId={selected.id} />;
    case 'dashboard':
      return <DashboardContent dashboardId={selected.id} />;
    case 'screen':
      return <ScreenContent screenId={selected.id} />;
    default:
      return null;
  }
}

/* ==================== 主页面 ==================== */

export default function PortalPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<TreeItem | null>(null);

  const groups: TreeGroup[] = useMemo(() => [
    {
      key: 'chart',
      label: '图表',
      icon: FileBarChart,
      items: charts.slice(0, 8).map((c) => ({ id: c.id, name: c.name, type: 'chart' as AssetType })),
    },
    {
      key: 'report',
      label: '报表',
      icon: FileText,
      items: reports.slice(0, 8).map((r) => ({ id: r.id, name: r.name, type: 'report' as AssetType })),
    },
    {
      key: 'dashboard',
      label: '仪表盘',
      icon: LayoutDashboard,
      items: dashboards.slice(0, 8).map((d) => ({ id: d.id, name: d.name, type: 'dashboard' as AssetType })),
    },
    {
      key: 'screen',
      label: '数据大屏',
      icon: Monitor,
      items: dataScreens.slice(0, 8).map((s) => ({ id: s.id, name: s.name, type: 'screen' as AssetType })),
    },
  ], []);

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* 左侧目录树 */}
      <DirectoryTree
        groups={groups}
        selectedId={selected?.id || null}
        onSelect={setSelected}
        search={search}
        onSearchChange={setSearch}
      />

      {/* 右侧内容区 */}
      <div style={{ flex: 1, overflow: 'hidden', padding: 20, background: 'var(--dae-surface)' }}>
        <ContentRenderer selected={selected} />
      </div>
    </div>
  );
}
