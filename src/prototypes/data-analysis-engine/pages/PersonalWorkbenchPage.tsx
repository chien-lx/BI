import React, { useEffect, useMemo, useState } from 'react';
import {
  Star,
  Bell,
  Download,
  Clock,
  Eye,
  BarChart3,
  LayoutDashboard,
  Monitor,
  FileText,
  PauseCircle,
  FileSpreadsheet,
  Trash2,
  RefreshCw,
  History,
  Table2,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SearchFilter from '../components/SearchFilter';
import IconAction from '../components/IconAction';
import ChartRenderer from '../components/ChartRenderer';
import Modal from '../components/Modal';
import {
  charts,
  reports,
  dashboards,
  dataScreens,
  chartSampleData,
  pieSampleData,
} from '../data/mockData';

/* ==================== 类型定义 ==================== */

type AssetType = 'chart' | 'report' | 'dashboard' | 'screen';

interface WorkbenchAsset {
  id: string;
  name: string;
  type: AssetType;
  typeLabel: string;
  creator: string;
  updatedAt: string;
}

type SubscriptionCycle = 'daily' | 'weekly' | 'monthly';
type SubscriptionStatus = 'running' | 'paused' | 'disabled' | 'success' | 'failed';

interface SubscriptionTask {
  id: string;
  name: string;
  resourceType: AssetType;
  resourceName: string;
  cycle: SubscriptionCycle;
  nextRunAt?: string;
  lastRunAt?: string;
  status: SubscriptionStatus;
}

type DownloadStatus = 'ready' | 'generating' | 'expired';

interface DownloadRecord {
  id: string;
  fileName: string;
  resourceName: string;
  subscriptionName?: string;
  createdAt: string;
  size: string;
  status: DownloadStatus;
}

interface RecentView {
  id: string;
  assetType: AssetType;
  assetName: string;
  viewedAt: string;
}

/* ==================== 常量与辅助函数 ==================== */

const ASSET_TYPE_META: Record<AssetType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  chart: { label: '图表', icon: BarChart3, color: '#1677FF', bg: '#e6f4ff' },
  report: { label: '报表', icon: FileText, color: '#0891b2', bg: '#cffafe' },
  dashboard: { label: '仪表盘', icon: LayoutDashboard, color: '#7c3aed', bg: '#ede9fe' },
  screen: { label: '数据大屏', icon: Monitor, color: '#db2777', bg: '#fce7f3' },
};

const CYCLE_LABEL: Record<SubscriptionCycle, string> = {
  daily: '每天',
  weekly: '每周',
  monthly: '每月',
};

const STATUS_META: Record<SubscriptionStatus, { label: string; className: string }> = {
  running: { label: '运行中', className: 'dae-tag-green' },
  paused: { label: '已暂停', className: 'dae-tag-orange' },
  disabled: { label: '已停用', className: 'dae-tag-gray' },
  success: { label: '成功', className: 'dae-tag-green' },
  failed: { label: '失败', className: 'dae-tag-red' },
};

const DOWNLOAD_ICON = FileSpreadsheet;
const DOWNLOAD_LABEL = 'Excel';

function formatDateTime(d?: string) {
  if (!d) return '-';
  return d;
}

/* ==================== 模拟数据 ==================== */

const allAssets: WorkbenchAsset[] = [
  ...charts.map((c) => ({ id: c.id, name: c.name, type: 'chart' as AssetType, typeLabel: '图表', creator: c.creator, updatedAt: c.updatedAt })),
  ...reports.map((r) => ({ id: r.id, name: r.name, type: 'report' as AssetType, typeLabel: '报表', creator: r.creator, updatedAt: r.updatedAt })),
  ...dashboards.map((d) => ({ id: d.id, name: d.name, type: 'dashboard' as AssetType, typeLabel: '仪表盘', creator: d.creator, updatedAt: d.updatedAt })),
  ...dataScreens.map((s) => ({ id: s.id, name: s.name, type: 'screen' as AssetType, typeLabel: '数据大屏', creator: s.creator, updatedAt: s.updatedAt })),
];

const subscriptionTasks: SubscriptionTask[] = [
  { id: 'SUB001', name: '月度销售趋势日报', resourceType: 'chart', resourceName: '月度销售额趋势', cycle: 'daily', nextRunAt: '2026-08-13 08:00', lastRunAt: '2026-08-12 08:00', status: 'running' },
  { id: 'SUB002', name: '运营核心指标周报', resourceType: 'dashboard', resourceName: '运营核心指标', cycle: 'weekly', nextRunAt: '2026-08-17 09:00', lastRunAt: '2026-08-10 09:00', status: 'running' },
  { id: 'SUB003', name: '618 大促大屏监控', resourceType: 'screen', resourceName: '618 大促实时大屏', cycle: 'daily', nextRunAt: '2026-08-13 00:00', lastRunAt: '2026-08-12 00:00', status: 'paused' },
  { id: 'SUB004', name: '销售日报订阅', resourceType: 'report', resourceName: '销售日报', cycle: 'monthly', nextRunAt: '2026-09-01 08:00', lastRunAt: '2026-08-01 08:00', status: 'disabled' },
  { id: 'SUB005', name: '用户增长周报', resourceType: 'report', resourceName: '用户增长周报', cycle: 'weekly', nextRunAt: '2026-08-17 09:00', lastRunAt: '2026-08-10 09:05', status: 'failed' },
];

const downloadRecords: DownloadRecord[] = [
  { id: 'DL001', fileName: '月度销售额趋势_20260812.xlsx', resourceName: '月度销售额趋势', subscriptionName: '月度销售趋势日报', createdAt: '2026-08-12 08:02', size: '128 KB', status: 'ready' },
  { id: 'DL002', fileName: '运营核心指标_20260810.xlsx', resourceName: '运营核心指标', subscriptionName: '运营核心指标周报', createdAt: '2026-08-10 09:01', size: '2.4 MB', status: 'ready' },
  { id: 'DL003', fileName: '销售日报_20260801.xlsx', resourceName: '销售日报', subscriptionName: '销售日报订阅', createdAt: '2026-08-01 08:03', size: '856 KB', status: 'expired' },
  { id: 'DL004', fileName: '品类销售占比_20260811.xlsx', resourceName: '品类销售占比', createdAt: '2026-08-11 15:30', size: '320 KB', status: 'ready' },
  { id: 'DL005', fileName: '用户增长周报_20260810.xlsx', resourceName: '用户增长周报', subscriptionName: '用户增长周报', createdAt: '2026-08-10 09:06', size: '1.1 MB', status: 'ready' },
];

const recentViews: RecentView[] = [
  { id: 'RV001', assetType: 'chart', assetName: '月度销售额趋势', viewedAt: '2026-08-12 14:32' },
  { id: 'RV002', assetType: 'dashboard', assetName: '运营核心指标', viewedAt: '2026-08-12 11:05' },
  { id: 'RV003', assetType: 'report', assetName: '销售日报', viewedAt: '2026-08-11 17:48' },
  { id: 'RV004', assetType: 'screen', assetName: '618 大促实时大屏', viewedAt: '2026-08-11 09:15' },
  { id: 'RV005', assetType: 'chart', assetName: '品类销售占比', viewedAt: '2026-08-10 16:20' },
];

/* ==================== 收藏状态（复用数据门户的 localStorage key） ==================== */

function useFavorites() {
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem('dae-portal-favorites');
      setFavorites(raw ? JSON.parse(raw) : {});
    } catch {
      setFavorites({});
    }

    const handler = (e: StorageEvent) => {
      if (e.key === 'dae-portal-favorites') {
        try {
          setFavorites(e.newValue ? JSON.parse(e.newValue) : {});
        } catch {
          setFavorites({});
        }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const toggle = (key: string) => {
    setFavorites((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('dae-portal-favorites', JSON.stringify(next));
      return next;
    });
  };

  return { favorites, toggle };
}

/* ==================== 子组件 ==================== */

function TypeTag({ type }: { type: AssetType }) {
  const meta = ASSET_TYPE_META[type];
  const Icon = meta.icon;
  return (
    <span
      className="dae-tag"
      style={{ background: meta.bg, color: meta.color, gap: 4 }}
    >
      <Icon size={12} />
      {meta.label}
    </span>
  );
}

function StatCards({ stats }: { stats: { label: string; value: number; icon: React.ElementType }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="dae-stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="dae-stat-label">{s.label}</span>
              <Icon size={18} style={{ color: 'var(--dae-primary)' }} />
            </div>
            <div className="dae-stat-value">{s.value}</div>
          </div>
        );
      })}
    </div>
  );
}

function Empty({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="dae-empty" style={{ padding: '48px 24px' }}>
      <Icon size={40} style={{ color: 'var(--dae-ink-subtle)' }} />
      <p>{text}</p>
    </div>
  );
}

/* ==================== 收藏内容预览 ==================== */

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

function generateReportRows(name: string, count = 8): Record<string, string>[] {
  const provinces = ['广东省', '浙江省', '江苏省', '四川省', '湖北省', '山东省', '河南省', '福建省'];
  const categories = ['电子产品', '服装配饰', '食品饮料', '家居用品'];
  return Array.from({ length: count }, (_, i) => ({
    '日期': '2026-08-04',
    '省份': provinces[i % provinces.length],
    '商品品类': categories[i % categories.length],
    '销售额': `${(80 + Math.round(Math.random() * 160) * 1000).toLocaleString()}.00`,
    '订单量': `${(150 + Math.round(Math.random() * 500))}`,
    '客单价': `${(350 + Math.round(Math.random() * 100)).toFixed(2)}`,
  }));
}

function CompactChartPreview({ chartId }: { chartId: string }) {
  const chart = charts.find((c) => c.id === chartId);
  if (!chart) return <div className="dae-empty"><BarChart3 size={28} /><p>未找到图表</p></div>;
  const type = chartTypeMap[chart.type] || 'bar';
  const isPie = type === 'pie';
  return (
    <div style={{ padding: 8, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', height: 180 }}>
        <ChartRenderer
          type={type}
          data={isPie ? pieSampleData : chartSampleData}
          yKeys={isPie ? undefined : ['value', 'value2']}
          height={180}
        />
      </div>
    </div>
  );
}

function CompactReportPreview({ reportId }: { reportId: string }) {
  const report = reports.find((r) => r.id === reportId);
  if (!report) return <div className="dae-empty"><Table2 size={28} /><p>未找到报表</p></div>;
  const rows = generateReportRows(report.name, 8);
  const cols = ['日期', '省份', '商品品类', '销售额', '订单量', '客单价'];
  return (
    <div style={{ overflow: 'auto', height: '100%' }} className="dae-scroll">
      <table className="dae-table" style={{ margin: 0, minWidth: 420 }}>
        <thead>
          <tr>
            {cols.map((col) => (
              <th key={col} style={{ padding: '8px 10px', fontSize: 11, whiteSpace: 'nowrap' }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              {cols.map((col) => (
                <td key={col} style={{ padding: '7px 10px', fontSize: 11, whiteSpace: 'nowrap' }}>{row[col] ?? '-'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CompactDashboardPreview({ dashboardId }: { dashboardId: string }) {
  const dashboard = dashboards.find((d) => d.id === dashboardId);
  if (!dashboard) return <div className="dae-empty"><LayoutDashboard size={28} /><p>未找到仪表盘</p></div>;
  const list = dashboard.charts || [];
  return (
    <div style={{ overflow: 'auto', height: '100%', padding: 10 }} className="dae-scroll">
      {list.length === 0 ? (
        <div className="dae-empty" style={{ height: 'auto', padding: 24 }}>
          <BarChart3 size={32} />
          <p>该仪表盘暂无图表</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {list.filter((chart) => ['bar', 'line', 'area', 'pie', 'table'].includes(chart.type)).slice(0, 6).map((chart) => {
            const type = chart.type === 'table' ? 'bar' : chart.type as 'bar' | 'line' | 'area' | 'pie';
            const isPie = type === 'pie';
            return (
              <div
                key={chart.id}
                style={{
                  background: '#fff',
                  border: '1px solid var(--dae-border)',
                  borderRadius: 'var(--dae-radius-md)',
                  padding: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--dae-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {chart.name}
                </div>
                <div style={{ height: 120 }}>
                  <ChartRenderer
                    type={type}
                    data={isPie ? pieSampleData : chartSampleData}
                    yKeys={isPie ? undefined : ['value']}
                    height={120}
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

function CompactScreenPreview({ screenId }: { screenId: string }) {
  const screen = dataScreens.find((s) => s.id === screenId);
  if (!screen) return <div className="dae-empty"><Monitor size={28} /><p>未找到数据大屏</p></div>;
  const metrics = [
    { label: '实时销售额', value: '¥234.6万', change: '+12.5%', color: '#10b981' },
    { label: '订单数量', value: '12,456', change: '+8.3%', color: '#3b82f6' },
    { label: '访问用户数', value: '89,234', change: '+15.2%', color: '#f59e0b' },
    { label: '转化率', value: '4.56%', change: '-0.8%', color: '#ef4444' },
  ];
  return (
    <div
      style={{
        overflow: 'auto',
        height: '100%',
        background: '#0b1121',
        borderRadius: 'calc(var(--dae-radius-lg) - 1px)',
        padding: 12,
      }}
      className="dae-scroll"
    >
      <div style={{ textAlign: 'center', padding: '6px 0', borderBottom: '1px solid rgba(59,130,246,0.25)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#60a5fa', letterSpacing: 1 }}>{screen.name}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, margin: '10px 0' }}>
        {metrics.map((m, idx) => (
          <div
            key={idx}
            style={{
              background: 'rgba(30,41,59,0.8)',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: 'var(--dae-radius-md)',
              padding: 10,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{m.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: m.color, margin: '4px 0' }}>{m.value}</div>
            <div style={{ fontSize: 10, color: m.change.startsWith('+') ? '#10b981' : '#ef4444' }}>{m.change} 较昨日</div>
          </div>
        ))}
      </div>
      <div style={{ height: 100 }}>
        <ChartRenderer type="line" data={chartSampleData} yKeys={['value']} height={100} />
      </div>
    </div>
  );
}

function AssetPreviewCard({ asset, onToggleFav, extraLabel }: { asset: WorkbenchAsset; onToggleFav?: (key: string) => void; extraLabel?: string }) {
  return (
    <div
      key={`${asset.type}:${asset.id}`}
      style={{
        background: '#fff',
        border: '1px solid var(--dae-border)',
        borderRadius: 'var(--dae-radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'box-shadow 0.15s ease',
      }}
      className="dae-card-hover"
    >
      {/* 卡片头部 */}
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid var(--dae-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
          <TypeTag type={asset.type} />
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--dae-ink)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={asset.name}
          >
            {asset.name}
          </span>
        </div>
        {onToggleFav && (
          <IconAction
            icon={<Star size={16} style={{ color: '#f59e0b', fill: '#f59e0b' }} />}
            label="取消收藏"
            onClick={() => onToggleFav(`${asset.type}:${asset.id}`)}
          />
        )}
      </div>

      {/* 预览区：固定高度，内部滚动 */}
      <div style={{ height: 220, minHeight: 220, background: 'var(--dae-surface)', overflow: 'hidden' }}>
        {asset.type === 'chart' && <CompactChartPreview chartId={asset.id} />}
        {asset.type === 'report' && <CompactReportPreview reportId={asset.id} />}
        {asset.type === 'dashboard' && <CompactDashboardPreview dashboardId={asset.id} />}
        {asset.type === 'screen' && <CompactScreenPreview screenId={asset.id} />}
      </div>

      {/* 底部元数据 */}
      <div
        style={{
          padding: '10px 14px',
          borderTop: '1px solid var(--dae-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 12, color: 'var(--dae-ink-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {extraLabel ?? `${asset.creator} · ${asset.updatedAt}`}
        </span>
        <button
          className="dae-btn dae-btn-secondary dae-btn-sm"
          onClick={() => { window.location.hash = `page=portal&assetType=${asset.type}&assetId=${asset.id}`; }}
        >
          <Eye size={14} />
          去门户查看
        </button>
      </div>
    </div>
  );
}

function FavoritesSection({ search }: { search: string }) {
  const { favorites, toggle } = useFavorites();
  const [activeCategory, setActiveCategory] = useState<'all' | AssetType>('all');

  const categoryOrder: { key: AssetType; label: string }[] = [
    { key: 'chart', label: '图表' },
    { key: 'report', label: '报表' },
    { key: 'dashboard', label: '仪表盘' },
    { key: 'screen', label: '数据大屏' },
  ];

  const filteredAssets = useMemo(() => {
    return allAssets
      .filter((a) => favorites[`${a.type}:${a.id}`])
      .filter((a) => activeCategory === 'all' || a.type === activeCategory)
      .filter((a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.typeLabel.includes(search));
  }, [favorites, activeCategory, search]);

  const grouped = useMemo(() => {
    const map: Record<AssetType, WorkbenchAsset[]> = { chart: [], report: [], dashboard: [], screen: [] };
    filteredAssets.forEach((a) => map[a.type].push(a));
    return map;
  }, [filteredAssets]);

  const hasAnyFavorite = Object.keys(favorites).some((k) => favorites[k]);
  const visibleCategories = categoryOrder.filter((c) => grouped[c.key].length > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 二级分类过滤 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          className={`de-tab ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          全部
        </button>
        {categoryOrder.map((c) => (
          <button
            key={c.key}
            className={`de-tab ${activeCategory === c.key ? 'active' : ''}`}
            onClick={() => setActiveCategory(c.key)}
          >
            {c.label}
            <span
              style={{
                marginLeft: 6,
                fontSize: 11,
                padding: '1px 6px',
                borderRadius: 10,
                background: activeCategory === c.key ? 'rgba(22,119,255,0.12)' : 'var(--dae-surface)',
                color: activeCategory === c.key ? 'var(--dae-primary)' : 'var(--dae-ink-muted)',
              }}
            >
              {grouped[c.key].length}
            </span>
          </button>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <Empty icon={Star} text={hasAnyFavorite ? '没有匹配的收藏内容' : '暂无收藏，前往数据门户收藏图表、仪表盘等内容'} />
      )}

      {activeCategory === 'all'
        ? visibleCategories.map((cat) => (
            <section key={cat.key}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12,
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--dae-ink)',
                }}
              >
                {React.createElement(ASSET_TYPE_META[cat.key].icon, { size: 16, color: ASSET_TYPE_META[cat.key].color })}
                {cat.label}
                <span style={{ fontSize: 12, color: 'var(--dae-ink-muted)', fontWeight: 400 }}>
                  （{grouped[cat.key].length}）
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                {grouped[cat.key].map((asset) => (
                  <AssetPreviewCard key={`${asset.type}:${asset.id}`} asset={asset} onToggleFav={toggle} />
                ))}
              </div>
            </section>
          ))
        : grouped[activeCategory].length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
              {grouped[activeCategory].map((asset) => (
                <AssetPreviewCard key={`${asset.type}:${asset.id}`} asset={asset} onToggleFav={toggle} />
              ))}
            </div>
          )}
    </div>
  );
}

function SubscriptionsSection({ search }: { search: string }) {
  const [items, setItems] = useState(subscriptionTasks);
  const [detailTask, setDetailTask] = useState<SubscriptionTask | null>(null);

  const filtered = useMemo(() => {
    return items.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.resourceName.toLowerCase().includes(search.toLowerCase()) ||
      ASSET_TYPE_META[s.resourceType].label.includes(search)
    );
  }, [items, search]);

  const toggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        if (s.status === 'running') return { ...s, status: 'paused' };
        if (s.status === 'paused') return { ...s, status: 'running' };
        return { ...s, status: 'running' };
      })
    );
  };

  if (filtered.length === 0) {
    return <Empty icon={Bell} text="暂无订阅任务" />;
  }

  return (
    <>
      <div style={{ background: '#fff', border: '1px solid var(--dae-border)', borderRadius: 'var(--dae-radius-lg)', overflow: 'hidden' }}>
        <table className="dae-table" style={{ margin: 0 }}>
          <thead>
            <tr>
              <th>订阅名称</th>
              <th>资源类型</th>
              <th>订阅对象</th>
              <th>周期</th>
              <th>最近执行 / 下次执行</th>
              <th>状态</th>
              <th style={{ width: 180 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 500 }}>{s.name}</td>
                <td><TypeTag type={s.resourceType} /></td>
                <td>{s.resourceName}</td>
                <td>{CYCLE_LABEL[s.cycle]}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 12 }}>
                    <span style={{ color: 'var(--dae-ink-muted)' }}>最近：{formatDateTime(s.lastRunAt)}</span>
                    <span style={{ color: 'var(--dae-ink-muted)' }}>下次：{formatDateTime(s.nextRunAt)}</span>
                  </div>
                </td>
                <td><span className={`dae-tag ${STATUS_META[s.status].className}`}>{STATUS_META[s.status].label}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                  <IconAction
                    icon={<Eye size={16} />}
                    label="查看"
                    onClick={() => {
                      const target = allAssets.find((a) => a.type === s.resourceType && a.name === s.resourceName);
                      if (target) {
                        const url = new URL(window.location.href);
                        url.hash = `page=portal&assetType=${target.type}&assetId=${target.id}`;
                        window.open(url.toString(), '_blank');
                      }
                    }}
                  />
                  <IconAction icon={<FileText size={16} />} label="查看详情" onClick={() => setDetailTask(s)} />
                    <IconAction
                      icon={s.status === 'running' ? <PauseCircle size={16} /> : <RefreshCw size={16} />}
                      label={s.status === 'running' ? '暂停' : '启用'}
                      onClick={() => toggleStatus(s.id)}
                    />
                    <IconAction icon={<Download size={16} />} label="下载最新数据" onClick={() => {}} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 查看详情弹窗 */}
      <Modal
        open={!!detailTask}
        title="订阅任务详情"
        onClose={() => setDetailTask(null)}
      >
        {detailTask && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 13 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px 16px' }}>
              <span style={{ color: 'var(--dae-ink-muted)' }}>订阅名称</span>
              <span style={{ fontWeight: 500, color: 'var(--dae-ink)' }}>{detailTask.name}</span>

              <span style={{ color: 'var(--dae-ink-muted)' }}>资源类型</span>
              <span><TypeTag type={detailTask.resourceType} /></span>

              <span style={{ color: 'var(--dae-ink-muted)' }}>订阅对象</span>
              <span style={{ color: 'var(--dae-ink)' }}>{detailTask.resourceName}</span>

              <span style={{ color: 'var(--dae-ink-muted)' }}>订阅周期</span>
              <span style={{ color: 'var(--dae-ink)' }}>{CYCLE_LABEL[detailTask.cycle]}</span>

              <span style={{ color: 'var(--dae-ink-muted)' }}>任务状态</span>
              <span><span className={`dae-tag ${STATUS_META[detailTask.status].className}`}>{STATUS_META[detailTask.status].label}</span></span>

              <span style={{ color: 'var(--dae-ink-muted)' }}>最近执行</span>
              <span style={{ color: 'var(--dae-ink)' }}>{formatDateTime(detailTask.lastRunAt)}</span>

              <span style={{ color: 'var(--dae-ink-muted)' }}>下次执行</span>
              <span style={{ color: 'var(--dae-ink)' }}>{formatDateTime(detailTask.nextRunAt)}</span>

              <span style={{ color: 'var(--dae-ink-muted)' }}>任务编号</span>
              <span style={{ color: 'var(--dae-ink-muted)' }}>{detailTask.id}</span>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function DownloadsSection({ search }: { search: string }) {
  const [items, setItems] = useState(downloadRecords);

  const filtered = useMemo(() => {
    return items.filter((d) =>
      d.fileName.toLowerCase().includes(search.toLowerCase()) ||
      d.resourceName.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const remove = (id: string) => setItems((prev) => prev.filter((d) => d.id !== id));

  if (filtered.length === 0) {
    return <Empty icon={Download} text="暂无下载记录" />;
  }

  return (
    <div style={{ background: '#fff', border: '1px solid var(--dae-border)', borderRadius: 'var(--dae-radius-lg)', overflow: 'hidden' }}>
      <table className="dae-table" style={{ margin: 0 }}>
        <thead>
          <tr>
            <th>文件名</th>
            <th>关联资源</th>
            <th>生成时间</th>
            <th>大小</th>
            <th>格式</th>
            <th>状态</th>
            <th style={{ width: 120 }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((d) => (
            <tr key={d.id}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DOWNLOAD_ICON size={16} style={{ color: 'var(--dae-primary)' }} />
                  <span style={{ fontWeight: 500 }}>{d.fileName}</span>
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span>{d.resourceName}</span>
                  {d.subscriptionName && <span style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>来自：{d.subscriptionName}</span>}
                </div>
              </td>
              <td>{d.createdAt}</td>
              <td>{d.size}</td>
              <td><span className="dae-tag dae-tag-blue">{DOWNLOAD_LABEL}</span></td>
              <td>
                {d.status === 'ready' && <span className="dae-tag dae-tag-green">可下载</span>}
                {d.status === 'generating' && <span className="dae-tag dae-tag-orange">生成中</span>}
                {d.status === 'expired' && <span className="dae-tag dae-tag-gray">已过期</span>}
              </td>
              <td>
                <div style={{ display: 'flex', gap: 6 }}>
                  <IconAction icon={<Download size={16} />} label="下载" onClick={() => {}} disabled={d.status !== 'ready'} />
                  <IconAction icon={<Trash2 size={16} />} label="删除记录" onClick={() => remove(d.id)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecentSection({ search }: { search: string }) {
  const [activeCategory, setActiveCategory] = useState<'all' | AssetType>('all');

  const categoryOrder: { key: AssetType; label: string }[] = [
    { key: 'chart', label: '图表' },
    { key: 'report', label: '报表' },
    { key: 'dashboard', label: '仪表盘' },
    { key: 'screen', label: '数据大屏' },
  ];

  // 把最近浏览记录映射为 WorkbenchAsset（找不到对应资产的记录保留为 null，用于统计/兜底）
  const matchedAssets = useMemo(() => {
    return recentViews
      .map((r) => {
        const asset = allAssets.find((a) => a.type === r.assetType && a.name === r.assetName);
        return asset ? { ...asset, viewedAt: r.viewedAt } : null;
      })
      .filter(Boolean) as (WorkbenchAsset & { viewedAt: string })[];
  }, []);

  const filtered = useMemo(() => {
    return matchedAssets.filter(
      (a) =>
        (activeCategory === 'all' || a.type === activeCategory) &&
        (a.name.toLowerCase().includes(search.toLowerCase()) || a.typeLabel.includes(search))
    );
  }, [matchedAssets, activeCategory, search]);

  const grouped = useMemo(() => {
    const map: Record<AssetType, (WorkbenchAsset & { viewedAt: string })[]> = { chart: [], report: [], dashboard: [], screen: [] };
    filtered.forEach((a) => map[a.type].push(a));
    return map;
  }, [filtered]);

  const visibleCategories = categoryOrder.filter((c) => grouped[c.key].length > 0);

  if (matchedAssets.length === 0) {
    return <Empty icon={History} text="暂无最近浏览记录" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 二级分类过滤 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          className={`de-tab ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          全部
        </button>
        {categoryOrder.map((c) => (
          <button
            key={c.key}
            className={`de-tab ${activeCategory === c.key ? 'active' : ''}`}
            onClick={() => setActiveCategory(c.key)}
          >
            {c.label}
            <span
              style={{
                marginLeft: 6,
                fontSize: 11,
                padding: '1px 6px',
                borderRadius: 10,
                background: activeCategory === c.key ? 'rgba(22,119,255,0.12)' : 'var(--dae-surface)',
                color: activeCategory === c.key ? 'var(--dae-primary)' : 'var(--dae-ink-muted)',
              }}
            >
              {grouped[c.key].length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && <Empty icon={History} text="没有匹配的最近浏览记录" />}

      {activeCategory === 'all'
        ? visibleCategories.map((cat) => (
            <section key={cat.key}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12,
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--dae-ink)',
                }}
              >
                {React.createElement(ASSET_TYPE_META[cat.key].icon, { size: 16, color: ASSET_TYPE_META[cat.key].color })}
                {cat.label}
                <span style={{ fontSize: 12, color: 'var(--dae-ink-muted)', fontWeight: 400 }}>
                  （{grouped[cat.key].length}）
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                {grouped[cat.key].map((asset) => (
                  <AssetPreviewCard key={`recent-${asset.type}:${asset.id}`} asset={asset} extraLabel={`浏览于 ${asset.viewedAt}`} />
                ))}
              </div>
            </section>
          ))
        : grouped[activeCategory].length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
              {grouped[activeCategory].map((asset) => (
                <AssetPreviewCard key={`recent-${asset.type}:${asset.id}`} asset={asset} extraLabel={`浏览于 ${asset.viewedAt}`} />
              ))}
            </div>
          )}
    </div>
  );
}

/* ==================== 主页面 ==================== */

export default function PersonalWorkbenchPage() {
  const [activeTab, setActiveTab] = useState<'favorites' | 'subscriptions' | 'downloads' | 'recent'>('favorites');
  const [search, setSearch] = useState('');
  const { favorites } = useFavorites();

  const favoriteCount = useMemo(() => Object.values(favorites).filter(Boolean).length, [favorites]);

  const stats = [
    { label: '我的收藏', value: favoriteCount, icon: Star },
    { label: '订阅任务', value: subscriptionTasks.length, icon: Bell },
    { label: '可下载数据', value: downloadRecords.filter((d) => d.status === 'ready').length, icon: Download },
    { label: '最近浏览', value: recentViews.length, icon: Clock },
  ];

  const tabs: { key: typeof activeTab; label: string; icon: React.ElementType }[] = [
    { key: 'favorites', label: '我的收藏', icon: Star },
    { key: 'subscriptions', label: '我的订阅', icon: Bell },
    { key: 'downloads', label: '下载记录', icon: Download },
    { key: 'recent', label: '最近浏览', icon: History },
  ];

  return (
    <div>
      <PageHeader title="个人工作台" breadcrumb="个人工作台" />
      <StatCards stats={stats} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                className={`de-tab ${active ? 'active' : ''}`}
                onClick={() => { setActiveTab(t.key); setSearch(''); }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>
        <div style={{ minWidth: 280, flex: 1, maxWidth: 400 }}>
          <SearchFilter
            placeholder="搜索名称、资源类型..."
            value={search}
            onChange={setSearch}
          />
        </div>
      </div>

      {activeTab === 'favorites' && <FavoritesSection search={search} />}
      {activeTab === 'subscriptions' && <SubscriptionsSection search={search} />}
      {activeTab === 'downloads' && <DownloadsSection search={search} />}
      {activeTab === 'recent' && <RecentSection search={search} />}
    </div>
  );
}
