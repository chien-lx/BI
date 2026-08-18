import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FileBarChart, LayoutDashboard, Monitor, FileText,
  Search, BarChart3, Table2, Eye,
  Bell, Download, Star, StarOff, Lock, ShieldCheck, Clock, CalendarDays, FileImage,
  Send, Share2,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import ChartRenderer from '../components/ChartRenderer';
import Modal from '../components/Modal';
import Drawer from '../components/Drawer';
import IconAction from '../components/IconAction';
import { useAuth } from '../contexts/AuthContext';
import { parseHashParams } from '../../../common/useHashPage';
import {
  charts, reports, dashboards, dataScreens,
  chartSampleData, pieSampleData, currentUser, getAssetPermission, getAssetPermissionApplyStatus,
  resourceTypeLabel, pushChannelLabel, subscribeCycleLabel,
  appendSubscribeApproval, nextSubscribeId, recordRecentView,
  users, appendPermissionApplication, nextPermissionApplyId,
  appendOperationLog, nextOperationLogId,
  type SubscribeApproval, type SubscribeCycle, type SubscribeScope,
  type PermissionApplication,
  type ChartItem, type Report, type UserItem,
} from '../data/mockData';

/* ==================== 类型定义 ==================== */

type AssetType = 'chart' | 'report' | 'dashboard' | 'screen';

interface TreeItem {
  id: string;
  name: string;
  type: AssetType;
  status?: 'online' | 'offline' | 'pending';
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

const assetTypeLabel: Record<AssetType, string> = {
  chart: '图表',
  report: '报表',
  dashboard: '仪表盘',
  screen: '数据大屏',
};

/* ==================== 收藏状态 ==================== */

function useFavorites() {
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem('dae-portal-favorites');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('dae-portal-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggle = (key: string) => {
    setFavorites((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return { favorites, toggle };
}

/* ==================== 左侧资产目录（页签切换） ==================== */

function DirectoryTree({
  groups,
  selectedId,
  onSelect,
  search,
  onSearchChange,
  favorites,
  activeTab,
  onActiveTabChange,
  currentUser,
}: {
  groups: TreeGroup[];
  selectedId: string | null;
  onSelect: (item: TreeItem) => void;
  search: string;
  onSearchChange: (v: string) => void;
  favorites: Record<string, boolean>;
  activeTab: AssetType;
  onActiveTabChange: (tab: AssetType) => void;
  currentUser: UserItem;
}) {

  // 搜索时跨分类过滤；无搜索时只展示当前页签
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

  // 当前要展示的 items：搜索模式下展示所有匹配项，否则只展示当前页签
  const displayItems = useMemo(() => {
    if (search.trim()) {
      return filteredGroups.flatMap((g) =>
        g.items.map((item) => ({ ...item, _groupKey: g.key }))
      );
    }
    const active = groups.find((g) => g.key === activeTab);
    return (active?.items ?? []).map((item) => ({ ...item, _groupKey: activeTab }));
  }, [filteredGroups, groups, activeTab, search]);

  return (
    <div
      style={{
        width: 280,
        minWidth: 280,
        background: '#fff',
        border: '1px solid var(--dae-border)',
        borderRadius: 'var(--dae-radius-lg) 0 0 var(--dae-radius-lg)',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* 标题栏 */}
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

      {/* 分类切换 — 分段控制器风格 */}
      {!search.trim() && (
        <div
          style={{
            padding: '8px 10px',
            borderBottom: '1px solid var(--dae-border)',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 0,
              background: 'var(--dae-surface)',
              borderRadius: 'var(--dae-radius-md)',
              padding: 2,
            }}
          >
            {groups.map((group) => {
              const Icon = group.icon;
              const isActive = activeTab === group.key;
              return (
                <button
                  key={group.key}
                  onClick={() => onActiveTabChange(group.key)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 3,
                    padding: '6px 4px',
                    fontSize: 12,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--dae-primary)' : 'var(--dae-ink-muted)',
                    background: isActive ? '#fff' : 'transparent',
                    border: 'none',
                    borderRadius: 'calc(var(--dae-radius-md) - 1px)',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 0.5px 2px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}
                  title={`${group.label}（${group.items.length}）`}
                >
                  <Icon size={13} />
                  <span>{group.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 资产列表 */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }} className="dae-scroll">
        {displayItems.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              color: 'var(--dae-ink-subtle)',
              fontSize: 13,
              padding: '24px 16px',
            }}
          >
            {search.trim() ? '未找到匹配的资产' : '暂无资产'}
          </div>
        ) : (
          displayItems.map((item) => {
            const groupKey = item._groupKey as AssetType;
            const isActive = selectedId === item.id;
            const favKey = `${groupKey}:${item.id}`;
            const isFav = favorites[favKey];
            const permission = getAssetPermission(currentUser, groupKey, item.id);
            const noView = !permission.view;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item as TreeItem)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 16px',
                  fontSize: 13,
                  color: isActive ? 'var(--dae-primary)' : noView ? 'var(--dae-ink-muted)' : 'var(--dae-ink-secondary)',
                  background: isActive ? 'var(--dae-primary-light)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontWeight: isActive ? 500 : 400,
                  margin: '2px 8px',
                  width: 'calc(100% - 16px)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  borderRadius: 'var(--dae-radius-md)',
                  transition: 'background 0.1s ease',
                }}
                title={`${item.name}${noView ? '（暂无查看权限，可申请）' : ''}`}
              >
                {groupKey === 'chart' && <BarChart3 size={14} style={{ flexShrink: 0, opacity: noView ? 0.6 : 1 }} />}
                {groupKey === 'report' && <Table2 size={14} style={{ flexShrink: 0, opacity: noView ? 0.6 : 1 }} />}
                {groupKey === 'dashboard' && <LayoutDashboard size={14} style={{ flexShrink: 0, opacity: noView ? 0.6 : 1 }} />}
                {groupKey === 'screen' && <Monitor size={14} style={{ flexShrink: 0, opacity: noView ? 0.6 : 1 }} />}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, opacity: noView ? 0.7 : 1 }}>
                  {item.name}
                </span>
                {noView && (
                  <span title="无查看权限" style={{ display: 'inline-flex', flexShrink: 0 }}>
                    <Lock size={12} style={{ color: 'var(--dae-ink-subtle)' }} />
                  </span>
                )}
                {item.status === 'online' && (
                  <span style={{ fontSize: 10, lineHeight: 1, padding: '2px 5px', borderRadius: 4, background: '#dcfce7', color: '#16a34a', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    已上线
                  </span>
                )}
                {item.status === 'pending' && (
                  <span style={{ fontSize: 10, lineHeight: 1, padding: '2px 5px', borderRadius: 4, background: '#f1f5f9', color: '#64748b', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    待上线
                  </span>
                )}
                {item.status === 'offline' && (
                  <span style={{ fontSize: 10, lineHeight: 1, padding: '2px 5px', borderRadius: 4, background: '#ffedd5', color: '#c2410c', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    已下线
                  </span>
                )}
                {isFav && <Star size={12} style={{ color: '#f59e0b', flexShrink: 0 }} />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ==================== 无权限安全遮罩（模糊预览 + 申请提示） ==================== */

function AssetPermissionOverlay({
  asset,
  applyStatus,
  onApply,
}: {
  asset: TreeItem;
  applyStatus: 'none' | 'pending' | 'approved' | 'rejected';
  onApply: () => void;
}) {
  const isPending = applyStatus === 'pending';
  const isRejected = applyStatus === 'rejected';
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 40,
        textAlign: 'center',
        background: 'rgba(248, 250, 252, 0.78)',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isPending ? (
          <Clock size={28} style={{ color: 'var(--dae-primary)' }} />
        ) : (
          <Lock size={28} style={{ color: 'var(--dae-ink-subtle)' }} />
        )}
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 8 }}>
          {isPending ? '权限申请审核中' : '暂无查看权限'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--dae-ink-muted)', maxWidth: 420, lineHeight: 1.6 }}>
          {isPending
            ? `您已提交对“${asset.name}”的查看申请，审核通过后即可查看完整数据。`
            : isRejected
            ? `您对“${asset.name}”的查看申请已被驳回，仍无法查看具体数据，可重新提交申请。`
            : `“${asset.name}”已上线至数据门户，但您当前未被授权查看具体数据，系统已做安全模糊处理。`}
        </div>
      </div>
      {!isPending && (
        <button className="dae-btn dae-btn-primary" onClick={onApply}>
          <ShieldCheck size={16} />
          {isRejected ? '重新申请权限' : '申请查看权限'}
        </button>
      )}
      {isPending && (
        <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={14} />
          请等待审核结果
        </div>
      )}
    </div>
  );
}

/* ==================== 右侧内容：报表渲染 ==================== */

function ReportContent({
  reportId,
}: {
  reportId: string;
}) {
  const report = reports.find((r) => r.id === reportId);
  const detail = reportDetails[reportId] || defaultReportDetail(report?.name || '报表', report?.datasetName || '-');

  const [dims, setDims] = useState(detail.dimensions);
  const [metrics, setMetrics] = useState(detail.metrics);

  useEffect(() => {
    setDims(detail.dimensions);
    setMetrics(detail.metrics);
  }, [reportId]);

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
    <div style={{ width: '100%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <Table2 size={20} style={{ color: 'var(--dae-primary)' }} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--dae-ink)' }}>{detail.name}</div>
          <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)', marginTop: 2 }}>
            数据集：{detail.datasetName} | 报表 ID：{reportId}
          </div>
        </div>
      </div>

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

function ChartContent({
  chartId,
  compact = false,
}: {
  chartId: string;
  compact?: boolean;
}) {
  const chart = charts.find((c) => c.id === chartId);
  if (!chart) return <div className="dae-empty"><BarChart3 size={40} /><p>未找到图表</p></div>;

  const type = chartTypeMap[chart.type] || 'bar';
  const isPie = type === 'pie';

  /* compact 模式：标题已在统一卡片头部，只渲染图表卡片 */
  if (compact) {
    return (
      <div style={{ width: '100%', minWidth: 0, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 900, background: '#fff', borderRadius: 'var(--dae-radius-lg)', border: '1px solid var(--dae-border)', padding: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <BarChart3 size={20} style={{ color: 'var(--dae-primary)' }} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--dae-ink)' }}>{chart.name}</div>
          <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)', marginTop: 2 }}>
            {chart.type} | {chart.datasetName} | 创建人：{chart.creator}
          </div>
        </div>
      </div>

      <div style={{ width: '100%', minWidth: 0, background: '#fff', borderRadius: 'var(--dae-radius-lg)', border: '1px solid var(--dae-border)', padding: 24, flex: 1, minHeight: 400 }}>
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

function DashboardContent({
  dashboardId,
  compact = false,
}: {
  dashboardId: string;
  compact?: boolean;
}) {
  const dashboard = dashboards.find((d) => d.id === dashboardId);
  if (!dashboard) return <div className="dae-empty"><LayoutDashboard size={40} /><p>未找到仪表盘</p></div>;

  const chartsList = dashboard.charts || [];

  if (compact) {
    return (
      <div style={{ width: '100%', minWidth: 0, padding: 20 }}>
        {chartsList.length === 0 ? (
          <div className="dae-empty" style={{ background: '#fff', borderRadius: 'var(--dae-radius-lg)', border: '1px solid var(--dae-border)' }}>
            <BarChart3 size={48} />
            <p>该仪表盘暂无图表</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, maxWidth: 1100, margin: '0 auto' }}>
            {chartsList.filter((chart) => ['bar', 'line', 'area', 'pie', 'table'].includes(chart.type)).map((chart) => {
              const type = chart.type === 'table' ? 'bar' : chart.type as 'bar' | 'line' | 'area' | 'pie';
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

  return (
    <div style={{ width: '100%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
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
          {chartsList.filter((chart) => ['bar', 'line', 'area', 'pie', 'table'].includes(chart.type)).map((chart) => {
            const type = chart.type === 'table' ? 'bar' : chart.type as 'bar' | 'line' | 'area' | 'pie';
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

function ScreenContent({
  screenId,
}: {
  screenId: string;
}) {
  const screen = dataScreens.find((s) => s.id === screenId);
  if (!screen) return <div className="dae-empty"><Monitor size={40} /><p>未找到数据大屏</p></div>;

  const screenMetrics = [
    { label: '实时销售额', value: '¥ 2,345,678', change: '+12.5%', color: '#10b981' },
    { label: '订单数量', value: '12,456', change: '+8.3%', color: '#3b82f6' },
    { label: '访问用户数', value: '89,234', change: '+15.2%', color: '#f59e0b' },
    { label: '转化率', value: '4.56%', change: '-0.8%', color: '#ef4444' },
  ];

  return (
    <div style={{ width: '100%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Monitor size={20} style={{ color: 'var(--dae-primary)' }} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--dae-ink)' }}>{screen.name}</div>
          <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)', marginTop: 2 }}>
            分辨率：{screen.resolution} | 创建人：{screen.creator} | 状态：{screen.status === 'online' ? '已上线' : screen.status === 'pending' ? '待上线' : '已下线'}
          </div>
        </div>
      </div>

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
        <div style={{ textAlign: 'center', padding: '8px 0', borderBottom: '1px solid rgba(59,130,246,0.3)' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#60a5fa', letterSpacing: 2 }}>
            {screen.name}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
            数据更新时间：{new Date().toLocaleString('zh-CN')}
          </div>
        </div>

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

/* ==================== 数据订阅 Drawer ==================== */

function SubscribeDrawer({
  open,
  asset,
  onClose,
}: {
  open: boolean;
  asset: TreeItem | null;
  onClose: () => void;
}) {
  const { currentUser: user, currentTenantId } = useAuth();
  const [name, setName] = useState('');
  const [cycle, setCycle] = useState<SubscribeCycle>('daily');
  const [scope, setScope] = useState<SubscribeScope>('full');
  const [channel, setChannel] = useState<keyof typeof pushChannelLabel>('email');
  const [receiver, setReceiver] = useState('');
  const [reason, setReason] = useState('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(asset ? `${asset.name}订阅` : '');
      setChannel('email');
      setReceiver(user.email || '');
      setReason('');
      setSubmittedId(null);
    }
  }, [open, asset, user.email]);

  if (!asset) return null;

  const handleSubmit = () => {
    if (!name.trim() || submittedId) return;
    const id = nextSubscribeId();
    const item: SubscribeApproval = {
      id,
      title: name.trim(),
      applicantId: user.id,
      applicantName: user.name,
      applicantDept: (user as { department?: string }).department || '未指定部门',
      tenantId: currentTenantId,
      resourceType: asset.type,
      resourceId: asset.id,
      resourceName: asset.name,
      cycle,
      scope,
      channel,
      receiver: receiver.trim() || user.email || user.name,
      reason: reason.trim() || undefined,
      status: 'pending',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      auditRecords: [],
    };
    appendSubscribeApproval(item);
    appendOperationLog({
      id: nextOperationLogId(),
      user: user.name,
      account: user.email,
      module: '数据门户',
      menuId: 'data-portal',
      action: '提交订阅申请',
      actionType: 'other',
      detail: `订阅「${asset.name}」(${resourceTypeLabel[asset.type]})，周期 ${subscribeCycleLabel[cycle]}`,
      assetId: asset.id,
      assetType: asset.type,
      ip: '192.168.1.100',
      time: item.createdAt,
    });
    setSubmittedId(id);
  };

  return (
    <Drawer
      open={open}
      title="数据订阅"
      onClose={onClose}
      width={480}
      footer={
        <>
          <button className="dae-btn dae-btn-secondary" onClick={onClose}>
            {submittedId ? '关闭' : '取消'}
          </button>
          {!submittedId && (
            <button
              className="dae-btn dae-btn-primary"
              onClick={handleSubmit}
              disabled={!name.trim() || !receiver.trim()}
            >
              提交订阅申请
            </button>
          )}
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {submittedId ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              padding: 20,
              background: 'var(--dae-primary-light)',
              borderRadius: 12,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--dae-primary)' }}>
              订阅申请已提交，等待审核
            </div>
            <div style={{ fontSize: 13, color: 'var(--dae-ink-secondary)' }}>
              申请编号：{submittedId}。审核人（管理员授权）通过后将按订阅周期推送数据。
            </div>
            <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>
              可前往「流程审批 → 任务审核」查看进度
            </div>
          </div>
        ) : null}

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--dae-ink)' }}>订阅对象</label>
          <div className="dae-input" style={{ background: 'var(--dae-surface)', color: 'var(--dae-ink-muted)' }}>
            {resourceTypeLabel[asset.type as keyof typeof resourceTypeLabel] || assetTypeLabel[asset.type]}：{asset.name}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--dae-ink)' }}>
            订阅名称<span style={{ color: '#ff4d4f' }}> *</span>
          </label>
          <input className="dae-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入订阅任务名称" disabled={!!submittedId} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--dae-ink)' }}>
            订阅周期<span style={{ color: '#ff4d4f' }}> *</span>
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { key: 'daily', label: '每天' },
              { key: 'weekly', label: '每周' },
              { key: 'monthly', label: '每月' },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setCycle(opt.key as SubscribeCycle)}
                disabled={!!submittedId}
                className={cycle === opt.key ? 'dae-btn dae-btn-primary' : 'dae-btn dae-btn-secondary'}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--dae-ink)' }}>数据范围</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { key: 'current', label: '当前查询条件所见数据' },
              { key: 'full', label: '全量数据' },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setScope(opt.key as SubscribeScope)}
                disabled={!!submittedId}
                className={scope === opt.key ? 'dae-btn dae-btn-primary' : 'dae-btn dae-btn-secondary'}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)', marginTop: 6 }}>
            {scope === 'current'
              ? '按当前页面筛选条件生成订阅数据，后续若调整查询条件需重新创建订阅。'
              : '不受页面筛选条件影响，始终推送该资产的完整可用数据。'}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--dae-ink)' }}>
            推送方式<span style={{ color: '#ff4d4f' }}> *</span>
          </label>
          <select className="dae-input" value={channel} onChange={(e) => setChannel(e.target.value as keyof typeof pushChannelLabel)} disabled={!!submittedId}>
            {Object.entries(pushChannelLabel).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--dae-ink)' }}>
            接收方<span style={{ color: '#ff4d4f' }}> *</span>
          </label>
          <input className="dae-input" value={receiver} onChange={(e) => setReceiver(e.target.value)} placeholder="邮箱 / 站内信接收人 / 群名" disabled={!!submittedId} />
          <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)', marginTop: 6 }}>
            按推送方式填写：邮件填邮箱、企业微信填群名、站内信填接收人姓名。
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--dae-ink)' }}>
            申请理由<span style={{ color: 'var(--dae-ink-muted)', fontWeight: 400 }}>（选填，便于审核）</span>
          </label>
          <textarea
            className="dae-input"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="简要说明订阅用途，将展示给审核人"
            disabled={!!submittedId}
            rows={3}
            style={{ resize: 'vertical', minHeight: 60 }}
          />
        </div>
      </div>
    </Drawer>
  );
}

/* ==================== 权限申请 Modal ==================== */

function ApplyPermissionModal({
  open,
  asset,
  onClose,
}: {
  open: boolean;
  asset: TreeItem | null;
  onClose: () => void;
}) {
  const { currentUser: applicant } = useAuth();
  const [level, setLevel] = useState<'view' | 'manage'>('view');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) {
      setReason('');
      setLevel('view');
    }
  }, [open]);

  if (!asset) return null;

  const handleSubmit = () => {
    if (!reason.trim()) return;
    const now = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    const time = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())} ${p(now.getHours())}:${p(now.getMinutes())}`;
    const app: PermissionApplication = {
      id: nextPermissionApplyId(),
      source: 'apply',
      assetId: asset.id,
      assetType: asset.type,
      assetName: asset.name,
      applicantId: applicant.id,
      applicantName: applicant.name,
      targetUserIds: [],
      permission: level,
      reason: reason.trim(),
      status: 'pending',
      createdAt: time,
      auditRecords: [],
    };
    appendPermissionApplication(app);
    appendOperationLog({
      id: nextOperationLogId(),
      user: applicant.name,
      account: applicant.email,
      module: '数据门户',
      menuId: 'data-portal',
      action: '提交权限申请',
      actionType: 'other',
      detail: `申请查看「${asset.name}」的${level === 'manage' ? '查看并管理' : '查看'}权限`,
      assetId: asset.id,
      assetType: asset.type,
      ip: '192.168.1.100',
      time,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      title="申请查看权限"
      onClose={onClose}
      footer={
        <>
          <button className="dae-btn dae-btn-secondary" onClick={onClose}>取消</button>
          <button
            className="dae-btn dae-btn-primary"
            onClick={handleSubmit}
            disabled={!reason.trim()}
          >
            提交申请
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--dae-ink)' }}>申请对象</label>
          <div className="dae-input" style={{ background: 'var(--dae-surface)', color: 'var(--dae-ink-muted)' }}>
            {assetTypeLabel[asset.type]}：{asset.name}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--dae-ink)' }}>申请权限</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setLevel('view')}
              className={level === 'view' ? 'dae-btn dae-btn-primary' : 'dae-btn dae-btn-secondary'}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              仅查看
            </button>
            <button
              onClick={() => setLevel('manage')}
              className={level === 'manage' ? 'dae-btn dae-btn-primary' : 'dae-btn dae-btn-secondary'}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              查看并管理
            </button>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--dae-ink)' }}>申请理由</label>
          <textarea
            className="dae-input"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="请说明访问该数据的业务场景及用途..."
            style={{ resize: 'none' }}
          />
        </div>

        <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)', lineHeight: 1.6, background: 'var(--dae-surface)', padding: 10, borderRadius: 'var(--dae-radius-md)' }}>
          <strong>权限策略说明：</strong>数据门户中已上线但您无权限的资产将默认不可见，避免敏感数据形态泄露；审批通过后将按授权级别开放查看或管理。
        </div>
      </div>
    </Modal>
  );
}

/* ==================== 分享资产 Modal ==================== */

function ShareAssetModal({
  open,
  asset,
  onClose,
}: {
  open: boolean;
  asset: TreeItem | null;
  onClose: () => void;
}) {
  const { currentUser: sharer } = useAuth();
  const [targetUserIds, setTargetUserIds] = useState<string[]>([]);
  const [permission, setPermission] = useState<'view' | 'manage'>('view');
  const [reason, setReason] = useState('');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    if (open) {
      setTargetUserIds([]);
      setPermission('view');
      setReason('');
      setKeyword('');
    }
  }, [open]);

  if (!asset) return null;

  const candidates = users.filter(
    (u) =>
      u.id !== sharer.id &&
      u.status === 'active' &&
      (!keyword ||
        u.name.toLowerCase().includes(keyword.toLowerCase()) ||
        u.email.toLowerCase().includes(keyword.toLowerCase()))
  );

  const toggle = (id: string) =>
    setTargetUserIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSubmit = () => {
    if (targetUserIds.length === 0) return;
    const now = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    const time = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())} ${p(now.getHours())}:${p(now.getMinutes())}`;
    const app: PermissionApplication = {
      id: nextPermissionApplyId(),
      source: 'share',
      assetId: asset.id,
      assetType: asset.type,
      assetName: asset.name,
      applicantId: sharer.id,
      applicantName: sharer.name,
      targetUserIds,
      permission,
      reason: reason.trim() || undefined,
      status: 'pending',
      createdAt: time,
      auditRecords: [],
    };
    appendPermissionApplication(app);
    appendOperationLog({
      id: nextOperationLogId(),
      user: sharer.name,
      account: sharer.email,
      module: '数据门户',
      menuId: 'data-portal',
      action: '分享资产',
      actionType: 'other',
      detail: `将「${asset.name}」分享给 ${targetUserIds.length} 位成员（${permission === 'manage' ? '查看并管理' : '查看'}权限）`,
      assetId: asset.id,
      assetType: asset.type,
      ip: '192.168.1.100',
      time,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      title="分享资产"
      onClose={onClose}
      footer={
        <>
          <button className="dae-btn dae-btn-secondary" onClick={onClose}>取消</button>
          <button
            className="dae-btn dae-btn-primary"
            onClick={handleSubmit}
            disabled={targetUserIds.length === 0}
          >
            {targetUserIds.length > 0 ? `分享给 ${targetUserIds.length} 人` : '请选择分享对象'}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--dae-ink)' }}>分享资产</label>
          <div className="dae-input" style={{ background: 'var(--dae-surface)', color: 'var(--dae-ink-muted)' }}>
            {assetTypeLabel[asset.type]}：{asset.name}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--dae-ink)' }}>分享权限</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setPermission('view')} className={permission === 'view' ? 'dae-btn dae-btn-primary' : 'dae-btn dae-btn-secondary'} style={{ flex: 1, justifyContent: 'center' }}>仅查看</button>
            <button onClick={() => setPermission('manage')} className={permission === 'manage' ? 'dae-btn dae-btn-primary' : 'dae-btn dae-btn-secondary'} style={{ flex: 1, justifyContent: 'center' }}>查看并管理</button>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--dae-ink)' }}>分享对象<span style={{ color: 'var(--dae-ink-muted)', fontWeight: 400 }}>（多选）</span></label>
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--dae-ink-muted)' }} />
            <input className="dae-input" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索成员姓名 / 邮箱" style={{ paddingLeft: 30 }} />
          </div>
          <div style={{ maxHeight: 240, overflowY: 'auto', border: '1px solid var(--dae-border)', borderRadius: 8 }} className="dae-scroll">
            {candidates.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--dae-ink-muted)', fontSize: 13 }}>没有匹配的成员</div>
            ) : (
              candidates.map((u) => {
                const checked = targetUserIds.includes(u.id);
                return (
                  <label
                    key={u.id}
                    style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid var(--dae-border)', background: checked ? 'var(--dae-primary-light)' : '#fff', cursor: 'pointer' }}
                    onClick={() => toggle(u.id)}
                  >
                    <input type="checkbox" checked={checked} onChange={() => toggle(u.id)} style={{ marginRight: 12 }} />
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--dae-primary-light)', color: 'var(--dae-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, marginRight: 10 }}>{u.name.slice(0, 1)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>{u.department} · {u.role}</div>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--dae-ink)' }}>分享说明</label>
          <textarea className="dae-input" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="选填，说明分享用途" style={{ resize: 'vertical', minHeight: 56 }} />
        </div>
      </div>
    </Modal>
  );
}

/* ==================== 内容路由 ==================== */

function ContentRenderer({
  selected,
  favorites,
  onToggleFav,
  onSubscribe,
  onApply,
  onShare,
}: {
  selected: TreeItem | null;
  favorites: Record<string, boolean>;
  onToggleFav: (key: string) => void;
  onSubscribe: () => void;
  onApply: () => void;
  onShare: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  /* 资产元数据描述（必须放在早期 return 之前调用，遵守 hooks 规则） */
  const assetMeta = useMemo(() => {
    if (!selected) return { icon: BarChart3, extra: null };
    switch (selected.type) {
      case 'chart':
        return { icon: BarChart3, extra: charts.find((c) => c.id === selected.id) };
      case 'report':
        return { icon: Table2, extra: reports.find((r) => r.id === selected.id) };
      case 'dashboard':
        return { icon: LayoutDashboard, extra: dashboards.find((d) => d.id === selected.id) };
      case 'screen':
        return { icon: Monitor, extra: dataScreens.find((s) => s.id === selected.id) };
      default:
        return { icon: BarChart3, extra: null };
    }
  }, [selected]);

  if (!selected) {
    return (
      <div className="dae-empty" style={{ height: '100%' }}>
        <Search size={48} style={{ color: 'var(--dae-ink-subtle)' }} />
        <p>请在左侧目录中选择一个资产查看</p>
      </div>
    );
  }

  const permission = getAssetPermission(currentUser, selected.type, selected.id);
  const applyStatus = getAssetPermissionApplyStatus(currentUser, selected.type, selected.id);
  const favKey = `${selected.type}:${selected.id}`;
  const isFav = favorites[favKey];

  const MetaIcon = assetMeta.icon;
  const extra = assetMeta.extra;

  const handleExportImage = async () => {
    if (!contentRef.current || !selected) return;
    setExporting(true);
    const node = contentRef.current;
    const original = {
      width: node.style.width, minWidth: node.style.minWidth,
      height: node.style.height, overflow: node.style.overflow,
      position: node.style.position, left: node.style.left, top: node.style.top,
      zIndex: node.style.zIndex, backgroundColor: node.style.backgroundColor,
    };
    try {
      const width = node.scrollWidth;
      const height = node.scrollHeight;
      node.style.position = 'fixed'; node.style.top = '-9999px'; node.style.left = '-9999px';
      node.style.zIndex = '-1'; node.style.width = `${width}px`; node.style.minWidth = `${width}px`;
      node.style.height = `${height}px`; node.style.overflow = 'visible';
      node.style.backgroundColor = '#ffffff';
      await new Promise((resolve) => setTimeout(resolve, 250));
      const dataUrl = await toPng(node, { backgroundColor: '#ffffff', pixelRatio: 2, cacheBust: true, skipFonts: true, width, height });
      const link = document.createElement('a');
      link.download = `${selected.name}.png`;
      link.href = dataUrl; link.click();
    } catch (e) {
      console.error('导出图片失败', e); alert('导出图片失败，请重试');
    } finally {
      Object.assign(node.style, original); setExporting(false);
    }
  };

  return (
    <div
      ref={contentRef}
      style={{
        width: '100%', minWidth: 0, height: '100%',
        display: 'flex', flexDirection: 'column',
        background: '#fff',
        overflow: 'hidden',
      }}
    >
      {/* 统一卡片头部：类型标签 | 标题+元数据 | 操作按钮 */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 20px',
          borderBottom: '1px solid var(--dae-border)',
          background: '#fff',
          flexShrink: 0,
        }}
      >
        {/* 左侧：类型标签 */}
        <span
          className="dae-tag"
          style={{
            background: 'var(--dae-primary-light)',
            color: 'var(--dae-primary)',
            flexShrink: 0,
          }}
        >
          {assetTypeLabel[selected.type]}
        </span>

        {/* 中间：图标 + 标题 + 元数据 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <MetaIcon size={18} style={{ color: 'var(--dae-primary)', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--dae-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selected.name}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--dae-ink-muted)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selected.type === 'chart' && `${(extra as ChartItem | null)?.type ?? ''} | ${(extra as ChartItem | null)?.datasetName ?? ''} | 创建人：${(extra as ChartItem | null)?.creator ?? ''}`}
              {selected.type === 'report' && `数据集：${(extra as Report | null)?.datasetName ?? ''} | 报表 ID：${selected.id}`}
              {selected.type === 'dashboard' && `共 ${(extra as any)?.charts?.length ?? 0} 个图表 | 创建人：${extra?.creator ?? ''}`}
              {selected.type === 'screen' && `分辨率：${(extra as any)?.resolution ?? ''} | 创建人：${extra?.creator ?? ''}`}
            </div>
          </div>
        </div>

        {/* 右侧：操作按钮 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <IconAction icon={<Bell size={17} />} label="数据订阅" onClick={onSubscribe} />
          <IconAction
            icon={exporting ? <Clock size={17} /> : <FileImage size={17} />}
            label={exporting ? '导出中...' : '图片导出'}
            onClick={exporting ? undefined : handleExportImage}
          />
          <IconAction
            icon={isFav ? <Star size={17} style={{ color: '#f59e0b', fill: '#f59e0b' }} /> : <StarOff size={17} />}
            label={isFav ? '取消收藏' : '收藏'}
            onClick={() => onToggleFav(favKey)}
          />
          <IconAction icon={<Share2 size={17} />} label="分享" onClick={onShare} />
        </div>
      </div>

      {/* 卡片主体内容区 */}
      <div
        style={{
          position: 'relative',
          flex: 1, minHeight: 0, overflow: 'auto',
          background: 'var(--dae-surface)',
        }}
        className="dae-scroll"
      >
        <div
          style={{
            filter: permission.view ? undefined : 'blur(8px)',
            pointerEvents: permission.view ? undefined : 'none',
            userSelect: permission.view ? undefined : 'none',
            height: permission.view ? undefined : '100%',
            minHeight: permission.view ? undefined : '100%',
            overflow: permission.view ? undefined : 'hidden',
          }}
        >
          {selected.type === 'report' && <ReportContent reportId={selected.id} />}
          {selected.type === 'chart' && <ChartContent chartId={selected.id} compact />}
          {selected.type === 'dashboard' && <DashboardContent dashboardId={selected.id} compact />}
          {selected.type === 'screen' && <ScreenContent screenId={selected.id} />}
        </div>
        {!permission.view && (
          <AssetPermissionOverlay
            asset={selected}
            applyStatus={applyStatus}
            onApply={onApply}
          />
        )}
      </div>
    </div>
  );
}

/* ==================== 主页面 ==================== */

function findAssetById(type: AssetType, id: string): TreeItem | null {
  if (type === 'chart') {
    const c = charts.find((item) => item.id === id);
    return c ? { id: c.id, name: c.name, type: 'chart' } : null;
  }
  if (type === 'report') {
    const r = reports.find((item) => item.id === id);
    return r ? { id: r.id, name: r.name, type: 'report' } : null;
  }
  if (type === 'dashboard') {
    const d = dashboards.find((item) => item.id === id);
    return d ? { id: d.id, name: d.name, type: 'dashboard' } : null;
  }
  if (type === 'screen') {
    const s = dataScreens.find((item) => item.id === id);
    return s ? { id: s.id, name: s.name, type: 'screen' } : null;
  }
  return null;
}

export default function PortalPage() {
  const { currentUser: user } = useAuth();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<TreeItem | null>(null);
  const [activeTab, setActiveTab] = useState<AssetType>('chart');
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const { favorites, toggle } = useFavorites();

  // 从 hash 参数恢复选中的资产（支持从个人工作台跳转过来）
  useEffect(() => {
    const params = parseHashParams(window.location.hash);
    const assetType = params.assetType as AssetType | undefined;
    const assetId = params.assetId;
    if (assetType && assetId) {
      const asset = findAssetById(assetType, assetId);
      if (asset) {
        setSelected(asset);
        setActiveTab(assetType);
        recordRecentView(assetType, assetId, asset.name);
      }
    }
  }, []);

  const handleSelect = (item: TreeItem) => {
    setSelected(item);
    recordRecentView(item.type, item.id, item.name);
  };

  const groups: TreeGroup[] = useMemo(() => [
    {
      key: 'chart',
      label: '图表',
      icon: FileBarChart,
      items: charts.filter((c) => c.status === 'online').map((c) => ({ id: c.id, name: c.name, type: 'chart' as AssetType, status: c.status })),
    },
    {
      key: 'report',
      label: '报表',
      icon: FileText,
      items: reports.filter((r) => r.status === 'online').map((r) => ({ id: r.id, name: r.name, type: 'report' as AssetType, status: r.status })),
    },
    {
      key: 'dashboard',
      label: '仪表盘',
      icon: LayoutDashboard,
      items: dashboards.filter((d) => d.status === 'online').map((d) => ({ id: d.id, name: d.name, type: 'dashboard' as AssetType, status: d.status })),
    },
    {
      key: 'screen',
      label: '数据大屏',
      icon: Monitor,
      items: dataScreens.filter((s) => s.status === 'online').map((s) => ({ id: s.id, name: s.name, type: 'screen' as AssetType, status: s.status })),
    },
  ], []);

  // 若当前选中资产被过滤掉（如下线），清空选中态
  useEffect(() => {
    if (!selected) return;
    const exists = groups.some((g) => g.items.some((item) => item.id === selected.id && item.type === selected.type));
    if (!exists) {
      setSelected(null);
    }
  }, [groups, selected]);

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden', padding: 10, gap: 0 }}>
      <DirectoryTree
        groups={groups}
        selectedId={selected?.id || null}
        onSelect={handleSelect}
        search={search}
        onSearchChange={setSearch}
        favorites={favorites}
        activeTab={activeTab}
        onActiveTabChange={setActiveTab}
        currentUser={currentUser}
      />

      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', background: 'var(--dae-surface)', borderRadius: '0 var(--dae-radius-lg) var(--dae-radius-lg) 0', border: '1px solid var(--dae-border)', borderLeft: 'none', boxSizing: 'border-box' }}>
        <ContentRenderer
          selected={selected}
          favorites={favorites}
          onToggleFav={toggle}
          onSubscribe={() => setSubscribeOpen(true)}
          onApply={() => setApplyOpen(true)}
          onShare={() => setShareOpen(true)}
        />
      </div>

      <SubscribeDrawer
        open={subscribeOpen}
        asset={selected}
        onClose={() => setSubscribeOpen(false)}
      />
      <ApplyPermissionModal
        open={applyOpen}
        asset={selected}
        onClose={() => setApplyOpen(false)}
      />
      <ShareAssetModal
        open={shareOpen}
        asset={selected}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}
