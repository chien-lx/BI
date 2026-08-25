/**
 * 表结构 / 数据样例 面板
 * - 展示当前问数/解读资产关联的数据集字段结构
 * - 数据集/报表：单个数据集字段
 * - 仪表盘/数据大屏：多个数据集 Tab 切换展示
 * - 新增「数据样例」Tab，基于字段动态生成样例数据，帮助用户理解如何提问
 * - 参考：阿里 Quick BI 智能小Q 的「字段详情 / 数据预览」弹窗
 */

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Database, FileText, Gauge, Monitor, Search, Hash, Tag, Calendar, Type, Hash as HashIcon, BarChart3, Table as TableIcon, Grid3X3 } from 'lucide-react';
import {
  getDatasets,
  getScopeDatasetDependencies,
  type QueryScope,
  type SemanticField,
  type DatasetSchema,
} from '../data/semanticLayer';

const SCOPE_ICONS: Record<QueryScope['type'], React.ElementType> = {
  dataset: Database,
  report: FileText,
  dashboard: Gauge,
  'data-screen': Monitor,
};

const TYPE_LABELS: Record<QueryScope['type'], string> = {
  dataset: '数据集',
  report: '报表',
  dashboard: '仪表盘',
  'data-screen': '数据大屏',
};

const FIELD_TYPE_ICONS: Record<SemanticField['type'], React.ElementType> = {
  string: Type,
  number: HashIcon,
  date: Calendar,
  datetime: Calendar,
};

const FIELD_TYPE_LABELS: Record<SemanticField['type'], string> = {
  string: '字符串',
  number: '数值',
  date: '日期',
  datetime: '日期时间',
};

interface SchemaPanelProps {
  scope: QueryScope | null;
  open: boolean;
  onClose: () => void;
}

type PanelTab = 'schema' | 'sample';

export function SchemaPanel({ scope, open, onClose }: SchemaPanelProps) {
  const [search, setSearch] = useState('');
  const [activeDatasetId, setActiveDatasetId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<PanelTab>('schema');

  const datasets = useMemo(() => getDatasets(), []);

  const relatedDatasets = useMemo<DatasetSchema[]>(() => {
    if (!scope) return [];
    const depIds = getScopeDatasetDependencies(scope);
    if (depIds.length === 0 && scope.type === 'dataset' && scope.datasetId) {
      depIds.push(scope.datasetId);
    }
    return depIds
      .map((id) => datasets.find((d) => d.id === id))
      .filter((d): d is DatasetSchema => Boolean(d));
  }, [scope, datasets]);

  // 打开时重置搜索、默认选中第一个数据集、默认展示表结构
  useEffect(() => {
    if (open) {
      setSearch('');
      setActiveTab('schema');
      setActiveDatasetId((prev) => {
        if (relatedDatasets.find((d) => d.id === prev)) return prev;
        return relatedDatasets[0]?.id || '';
      });
    }
  }, [open, relatedDatasets]);

  const activeDataset = useMemo(
    () => relatedDatasets.find((d) => d.id === activeDatasetId) || relatedDatasets[0],
    [relatedDatasets, activeDatasetId]
  );

  const sampleRows = useMemo(() => {
    if (!activeDataset) return [];
    return buildSampleRows(activeDataset.fields, 5);
  }, [activeDataset]);

  const filteredFields = useMemo(() => {
    if (activeTab !== 'schema') return [];
    const text = search.trim().toLowerCase();
    if (!activeDataset) return [];
    if (!text) return activeDataset.fields;
    return activeDataset.fields.filter(
      (f) =>
        f.name.toLowerCase().includes(text) ||
        f.alias.toLowerCase().includes(text) ||
        f.description.toLowerCase().includes(text)
    );
  }, [activeDataset, search, activeTab]);

  const filteredSampleRows = useMemo(() => {
    if (activeTab !== 'sample') return [];
    const text = search.trim().toLowerCase();
    if (!text) return sampleRows;
    return sampleRows.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(text))
    );
  }, [sampleRows, search, activeTab]);

  // ESC 关闭
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open || !scope) return null;

  const ScopeIcon = SCOPE_ICONS[scope.type];
  const totalFields = relatedDatasets.reduce((sum, d) => sum + d.fields.length, 0);

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200000,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      {/* 遮罩 */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.35)',
        }}
      />

      {/* 面板：进一步加宽到 680，最大 95vw，让表格与字段信息更舒展 */}
      <div
        style={{
          position: 'relative',
          width: 680,
          maxWidth: '95vw',
          height: '100%',
          background: '#fff',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'schema-slide-in 0.25s ease',
        }}
      >
        <style>{`
          @keyframes schema-slide-in {
            from { transform: translateX(100%); opacity: 0.8; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}</style>

        {/* 头部 */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1677FF',
              flexShrink: 0,
            }}
          >
            <ScopeIcon size={19} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>
              {scope.name} 的数据详情
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
              {TYPE_LABELS[scope.type]} · 关联 {relatedDatasets.length} 个数据集 · 共 {totalFields} 个字段
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 4,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#94a3b8',
              borderRadius: 6,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 多数据集 Tab 栏 */}
        {relatedDatasets.length > 1 && (
          <div
            style={{
              display: 'flex',
              gap: 6,
              padding: '10px 20px 0',
              borderBottom: '1px solid #e2e8f0',
              overflowX: 'auto',
            }}
          >
            {relatedDatasets.map((ds) => (
              <button
                key={ds.id}
                onClick={() => setActiveDatasetId(ds.id)}
                style={{
                  padding: '8px 13px',
                  borderRadius: '8px 8px 0 0',
                  border: '1px solid transparent',
                  borderBottomColor: activeDataset?.id === ds.id ? '#1677FF' : 'transparent',
                  background: activeDataset?.id === ds.id ? '#eff6ff' : 'transparent',
                  color: activeDataset?.id === ds.id ? '#1677FF' : '#475569',
                  fontSize: 12.5,
                  fontWeight: activeDataset?.id === ds.id ? 600 : 400,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <Database size={13} style={{ verticalAlign: -2, marginRight: 5 }} />
                {ds.datasetName}
                <span style={{ marginLeft: 5, color: '#94a3b8' }}>({ds.fields.length})</span>
              </button>
            ))}
          </div>
        )}

        {/* 二级 Tab：表结构 / 数据样例 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 20px 0',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc',
          }}
        >
          <TabButton active={activeTab === 'schema'} onClick={() => setActiveTab('schema')} icon={<TableIcon size={13} />} label="表结构" />
          <TabButton active={activeTab === 'sample'} onClick={() => setActiveTab('sample')} icon={<Grid3X3 size={13} />} label="数据样例" />
        </div>

        {/* 搜索 */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeTab === 'schema' ? '搜索字段名 / 别名 / 说明' : '搜索样例数据'}
              style={{
                width: '100%',
                padding: '8px 10px 8px 30px',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 12.5,
                color: '#334155',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* 内容区 */}
        <div className="dae-scroll" style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
          {relatedDatasets.length === 0 ? (
            <div style={{ padding: 30, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
              该资产暂未关联任何数据集
            </div>
          ) : activeTab === 'schema' ? (
            <SchemaView activeDataset={activeDataset} filteredFields={filteredFields} />
          ) : (
            <SampleView activeDataset={activeDataset} filteredRows={filteredSampleRows} />
          )}
        </div>

        {/* 底部提示 */}
        <div
          style={{
            padding: '10px 20px',
            borderTop: '1px solid #f1f5f9',
            background: '#f8fafc',
            fontSize: 11.5,
            color: '#64748b',
          }}
        >
          提示：字段别名与业务描述会用于 NL2SQL 的语义匹配，提问时可直接使用别名；数据样例仅展示前 5 条模拟数据。
        </div>
      </div>
    </div>,
    document.body
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '8px 14px',
        borderRadius: '8px 8px 0 0',
        border: '1px solid transparent',
        borderBottomColor: active ? '#1677FF' : 'transparent',
        background: active ? '#fff' : 'transparent',
        color: active ? '#1677FF' : '#64748b',
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
      }}
    >
      {icon}
      {label}
    </button>
  );
}

export function SchemaView({
  activeDataset,
  filteredFields,
}: {
  activeDataset?: DatasetSchema;
  filteredFields: SemanticField[];
}) {
  if (!activeDataset) return null;
  return (
    <>
      {(
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, color: '#475569', fontSize: 13 }}>
          <Database size={14} style={{ color: '#1677FF' }} />
          <span style={{ fontWeight: 500 }}>{activeDataset.datasetName}</span>
          <span style={{ color: '#94a3b8' }}>（{activeDataset.fields.length} 个字段）</span>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filteredFields.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>没有匹配的字段</div>
        ) : (
          filteredFields.map((field) => <FieldRow key={field.name} field={field} />)
        )}
      </div>
    </>
  );
}

export function SampleView({
  activeDataset,
  filteredRows,
}: {
  activeDataset?: DatasetSchema;
  filteredRows: Record<string, string | number>[];
}) {
  if (!activeDataset) return null;
  const fields = activeDataset.fields;
  if (fields.length === 0) {
    return <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>暂无字段，无法生成样例</div>;
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, color: '#475569', fontSize: 13 }}>
        <Grid3X3 size={14} style={{ color: '#1677FF' }} />
        <span style={{ fontWeight: 500 }}>{activeDataset.datasetName}</span>
        <span style={{ color: '#94a3b8' }}>数据样例</span>
      </div>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 520 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {fields.map((f) => (
                <th
                  key={f.name}
                  title={f.description}
                  style={{
                    padding: '9px 10px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#334155',
                    borderBottom: '1px solid #e2e8f0',
                    whiteSpace: 'nowrap',
                    minWidth: 90,
                  }}
                >
                  <div>{f.alias || f.name}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 400, marginTop: 2 }}>{f.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={fields.length} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>
                  没有匹配的样例数据
                </td>
              </tr>
            ) : (
              filteredRows.map((row, idx) => (
                <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                  {fields.map((f) => (
                    <td
                      key={f.name}
                      style={{
                        padding: '9px 10px',
                        borderBottom: '1px solid #f1f5f9',
                        color: '#334155',
                        whiteSpace: 'nowrap',
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={String(row[f.name])}
                    >
                      {String(row[f.name])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function FieldRow({ field }: { field: SemanticField }) {
  const TypeIcon = FIELD_TYPE_ICONS[field.type];
  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: 8,
        border: '1px solid #eef2f7',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <TypeIcon size={14} style={{ color: '#64748b', flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{field.alias || field.name}</span>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>{field.name}</span>
        <div style={{ flex: 1 }} />
        {field.isDimension && (
          <span
            style={{
              fontSize: 10,
              padding: '2px 6px',
              borderRadius: 999,
              background: '#e0f2fe',
              color: '#0369a1',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Tag size={10} /> 维度
          </span>
        )}
        {field.isMetric && (
          <span
            style={{
              fontSize: 10,
              padding: '2px 6px',
              borderRadius: 999,
              background: '#dcfce7',
              color: '#15803d',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <BarChart3 size={10} /> 指标
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11.5, color: '#64748b' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          <Hash size={11} />
          {FIELD_TYPE_LABELS[field.type]}
        </span>
        {field.aggregation && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            <BarChart3 size={11} />
            默认聚合：{field.aggregation}
          </span>
        )}
      </div>
      {field.description && (
        <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>{field.description}</div>
      )}
    </div>
  );
}

/** 根据字段语义动态生成样例数据 */
export function buildSampleRows(fields: SemanticField[], count: number): Record<string, string | number>[] {
  const rows: Record<string, string | number>[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const row: Record<string, string | number> = {};
    fields.forEach((f) => {
      row[f.name] = generateSampleValue(f, i, today);
    });
    rows.push(row);
  }
  return rows;
}

function generateSampleValue(field: SemanticField, idx: number, today: Date): string | number {
  const name = field.name.toLowerCase();

  // id
  if (name === 'id') return `${10000001 + idx}`;

  // 日期 / 时间
  if (field.type === 'date' || field.type === 'datetime') {
    const d = new Date(today);
    d.setDate(d.getDate() - idx);
    const dateStr = d.toISOString().slice(0, 10);
    if (field.type === 'datetime') {
      return `${dateStr} ${String(8 + (idx % 12)).padStart(2, '0')}:${String((idx * 7) % 60).padStart(2, '0')}:00`;
    }
    return dateStr;
  }

  // 数值型指标
  if (field.type === 'number') {
    if (name.includes('amount') || name.includes('gmv') || name.includes('debit') || name.includes('credit') || name.includes('profit') || name.includes('cost')) {
      return Math.round((Math.random() * 8000 + 200) * 100) / 100;
    }
    if (name.includes('qty') || name.includes('quantity') || name.includes('count') || name.includes('uv') || name.includes('pv') || name.includes('stock') || name.includes('sales')) {
      return Math.floor(Math.random() * 500) + 1;
    }
    if (name.includes('price')) {
      return Math.round((Math.random() * 500 + 50) * 100) / 100;
    }
    if (name.includes('roi')) {
      return Math.round((Math.random() * 5 + 0.5) * 100) / 100;
    }
    if (name.includes('duration') || name.includes('hour') || name.includes('days') || name.includes('active')) {
      return Math.round((Math.random() * 120 + 5) * 10) / 10;
    }
    if (name.includes('tps') || name.includes('lag')) {
      return Math.floor(Math.random() * 10000);
    }
    return Math.floor(Math.random() * 1000);
  }

  // 字符串维度：根据字段名语义生成
  if (name.includes('region')) {
    const regions = ['华东', '华南', '华北', '华中', '西南', '西北', '东北'];
    return regions[idx % regions.length];
  }
  if (name.includes('province')) {
    const provinces = ['浙江省', '广东省', '江苏省', '四川省', '山东省', '河南省', '湖北省'];
    return provinces[idx % provinces.length];
  }
  if (name.includes('city')) {
    const cities = ['杭州', '深圳', '南京', '成都', '青岛', '郑州', '武汉'];
    return cities[idx % cities.length];
  }
  if (name.includes('product_name') || name.includes('sku')) {
    const products = ['iPhone 15 Pro', 'MacBook Air M3', 'AirPods Pro 2', 'iPad Air', '小米 14', '华为 Mate 60', '戴森吹风机'];
    return products[idx % products.length];
  }
  if (name.includes('category')) {
    const categories = ['数码', '家电', '服饰', '食品', '美妆', '家居', '运动'];
    return categories[idx % categories.length];
  }
  if (name.includes('channel')) {
    const channels = ['APP', '小程序', '官网', '线下门店', '第三方平台'];
    return channels[idx % channels.length];
  }
  if (name.includes('gender')) {
    return ['男', '女', '未知'][idx % 3];
  }
  if (name.includes('level')) {
    const levels = ['普通会员', '银卡会员', '金卡会员', '钻石会员'];
    return levels[idx % levels.length];
  }
  if (name.includes('user_id')) {
    return `U${100000 + idx}`;
  }
  if (name.includes('status')) {
    const statuses = ['已完成', '进行中', '待处理', '已取消'];
    return statuses[idx % statuses.length];
  }
  if (name.includes('page')) {
    const pages = ['首页', '商品详情页', '购物车', '订单确认页', '支付页'];
    return pages[idx % pages.length];
  }
  if (name.includes('event_type')) {
    const events = ['点击', '浏览', '加购', '下单', '支付'];
    return events[idx % events.length];
  }
  if (name.includes('keyword') || name.includes('search')) {
    const keywords = ['手机', '耳机', '连衣裙', '零食', '运动鞋'];
    return keywords[idx % keywords.length];
  }
  if (name.includes('activity_name')) {
    const activities = ['618 大促', '双 11 预售', '品牌日', '新人专享', '会员日'];
    return activities[idx % activities.length];
  }
  if (name.includes('subject')) {
    const subjects = ['营业收入', '营业成本', '销售费用', '管理费用', '财务费用'];
    return subjects[idx % subjects.length];
  }
  if (name.includes('operator') || name.includes('user') || name.includes('creator')) {
    const operators = ['张三', '李四', '王五', '赵六', 'data_team'];
    return operators[idx % operators.length];
  }
  if (name.includes('topic')) {
    return `topic_${String.fromCharCode(97 + (idx % 5))}`;
  }
  if (name.includes('track_no')) {
    return `SF${100000000 + idx}`;
  }
  if (name.includes('rule_id')) {
    return `R${100 + idx}`;
  }
  if (name.includes('risk_level')) {
    return ['低', '中', '高'][idx % 3];
  }
  if (name.includes('is_abnormal')) {
    return ['否', '是'][idx % 2];
  }
  if (name.includes('op_type')) {
    const types = ['新增', '修改', '删除', '查询', '导出'];
    return types[idx % types.length];
  }
  if (name.includes('fence_name')) {
    return `围栏_${idx + 1}`;
  }

  return `样例_${idx + 1}`;
}
