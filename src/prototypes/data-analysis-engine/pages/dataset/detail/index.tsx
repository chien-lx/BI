/**
 * @name 数据集详细配置
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  Save,
  RotateCcw,
  Plus,
  Database,
  Table2,
  GripVertical,
  X,
  Search,
  ChevronDown,
  ChevronRight,
  Link2,
  Trash2,
  Eye,
  Type,
  Hash,
  Calendar,
  ToggleLeft,
  FunctionSquare,
} from 'lucide-react';
import { datasets } from '../../../data/mockData';

// ==================== 类型定义 ====================
interface FieldItem {
  id: string;
  name: string;
  alias?: string;
  dataType: 'text' | 'number' | 'date' | 'boolean';
  type: 'dimension' | 'metric';
  tableId: string;
  tableName: string;
  selected: boolean;
}

interface TableItem {
  id: string;
  name: string;
  alias?: string;
  fields: FieldItem[];
  expanded: boolean;
}

interface JoinRelation {
  id: string;
  leftTableId: string;
  leftField: string;
  rightTableId: string;
  rightField: string;
  joinType: 'inner' | 'left' | 'right' | 'full';
}

interface DragItem {
  field: FieldItem;
  source: 'table' | 'dimension' | 'metric';
}

// ==================== Mock 数据 ====================
const mockTables: TableItem[] = [
  {
    id: 'T001',
    name: 'QRTZ_BLOB_TRIGGERS',
    alias: 'Blob触发器',
    expanded: true,
    fields: [
      { id: 'F001', name: 'BLOB_DATA', dataType: 'text', type: 'dimension', tableId: 'T001', tableName: 'QRTZ_BLOB_TRIGGERS', selected: true },
      { id: 'F002', name: 'SCHED_NAME', dataType: 'text', type: 'dimension', tableId: 'T001', tableName: 'QRTZ_BLOB_TRIGGERS', selected: true },
      { id: 'F003', name: 'TRIGGER_GROUP', dataType: 'text', type: 'dimension', tableId: 'T001', tableName: 'QRTZ_BLOB_TRIGGERS', selected: true },
      { id: 'F004', name: 'TRIGGER_NAME', dataType: 'text', type: 'dimension', tableId: 'T001', tableName: 'QRTZ_BLOB_TRIGGERS', selected: true },
    ],
  },
  {
    id: 'T002',
    name: 'QRTZ_CRON_TRIGGERS',
    alias: 'Cron触发器',
    expanded: true,
    fields: [
      { id: 'F005', name: 'CRON_EXPRESSION', dataType: 'text', type: 'dimension', tableId: 'T002', tableName: 'QRTZ_CRON_TRIGGERS', selected: false },
      { id: 'F006', name: 'SCHED_NAME', dataType: 'text', type: 'dimension', tableId: 'T002', tableName: 'QRTZ_CRON_TRIGGERS', selected: false },
      { id: 'F007', name: 'TIME_ZONE_ID', dataType: 'text', type: 'dimension', tableId: 'T002', tableName: 'QRTZ_CRON_TRIGGERS', selected: false },
      { id: 'F008', name: 'TRIGGER_GROUP', dataType: 'text', type: 'dimension', tableId: 'T002', tableName: 'QRTZ_CRON_TRIGGERS', selected: false },
      { id: 'F009', name: 'TRIGGER_NAME', dataType: 'text', type: 'dimension', tableId: 'T002', tableName: 'QRTZ_CRON_TRIGGERS', selected: false },
    ],
  },
  {
    id: 'T003',
    name: 'QRTZ_CALENDARS',
    alias: '日历表',
    expanded: false,
    fields: [
      { id: 'F010', name: 'CALENDAR_NAME', dataType: 'text', type: 'dimension', tableId: 'T003', tableName: 'QRTZ_CALENDARS', selected: false },
      { id: 'F011', name: 'CALENDAR', dataType: 'text', type: 'dimension', tableId: 'T003', tableName: 'QRTZ_CALENDARS', selected: false },
    ],
  },
  {
    id: 'T004',
    name: 'QRTZ_JOB_DETAILS',
    alias: '任务详情',
    expanded: false,
    fields: [
      { id: 'F012', name: 'JOB_NAME', dataType: 'text', type: 'dimension', tableId: 'T004', tableName: 'QRTZ_JOB_DETAILS', selected: false },
      { id: 'F013', name: 'JOB_GROUP', dataType: 'text', type: 'dimension', tableId: 'T004', tableName: 'QRTZ_JOB_DETAILS', selected: false },
      { id: 'F014', name: 'JOB_CLASS_NAME', dataType: 'text', type: 'dimension', tableId: 'T004', tableName: 'QRTZ_JOB_DETAILS', selected: false },
    ],
  },
  {
    id: 'T005',
    name: 'orders',
    alias: '订单表',
    expanded: true,
    fields: [
      { id: 'F015', name: 'order_id', dataType: 'text', type: 'dimension', tableId: 'T005', tableName: 'orders', selected: true },
      { id: 'F016', name: 'order_date', dataType: 'date', type: 'dimension', tableId: 'T005', tableName: 'orders', selected: true },
      { id: 'F017', name: 'customer_id', dataType: 'text', type: 'dimension', tableId: 'T005', tableName: 'orders', selected: true },
      { id: 'F018', name: 'amount', dataType: 'number', type: 'metric', tableId: 'T005', tableName: 'orders', selected: true },
      { id: 'F019', name: 'quantity', dataType: 'number', type: 'metric', tableId: 'T005', tableName: 'orders', selected: true },
      { id: 'F020', name: 'status', dataType: 'text', type: 'dimension', tableId: 'T005', tableName: 'orders', selected: false },
    ],
  },
  {
    id: 'T006',
    name: 'customers',
    alias: '客户表',
    expanded: true,
    fields: [
      { id: 'F021', name: 'customer_id', dataType: 'text', type: 'dimension', tableId: 'T006', tableName: 'customers', selected: true },
      { id: 'F022', name: 'customer_name', dataType: 'text', type: 'dimension', tableId: 'T006', tableName: 'customers', selected: true },
      { id: 'F023', name: 'city', dataType: 'text', type: 'dimension', tableId: 'T006', tableName: 'customers', selected: true },
      { id: 'F024', name: 'region', dataType: 'text', type: 'dimension', tableId: 'T006', tableName: 'customers', selected: false },
      { id: 'F025', name: 'register_date', dataType: 'date', type: 'dimension', tableId: 'T006', tableName: 'customers', selected: false },
    ],
  },
];

// ==================== 工具函数 ====================
function getDataTypeIcon(dataType: string) {
  switch (dataType) {
    case 'number': return <Hash size={12} />;
    case 'date': return <Calendar size={12} />;
    case 'boolean': return <ToggleLeft size={12} />;
    default: return <Type size={12} />;
  }
}

function getDataTypeColor(dataType: string) {
  switch (dataType) {
    case 'number': return '#1677FF';
    case 'date': return '#16a34a';
    case 'boolean': return '#d97706';
    default: return '#64748b';
  }
}

// ==================== 组件 ====================

export default function DatasetDetailConfig() {
  const dataset = datasets[0];

  // 状态
  const [tables, setTables] = useState<TableItem[]>(mockTables);
  const [dimensions, setDimensions] = useState<FieldItem[]>([]);
  const [metrics, setMetrics] = useState<FieldItem[]>([]);
  const [joins, setJoins] = useState<JoinRelation[]>([]);
  const [activeTab, setActiveTab] = useState<'preview' | 'batch'>('preview');
  const [searchTable, setSearchTable] = useState('');
  const [searchField, setSearchField] = useState('');
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dragOverZone, setDragOverZone] = useState<'dimension' | 'metric' | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedField, setSelectedField] = useState<FieldItem | null>(null);
  const [showFieldMenu, setShowFieldMenu] = useState<string | null>(null);

  const dimensionRef = useRef<HTMLDivElement>(null);
  const metricRef = useRef<HTMLDivElement>(null);

  // 切换表展开
  const toggleTable = (tableId: string) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, expanded: !t.expanded } : t))
    );
  };

  // 字段选中切换
  const toggleFieldSelected = (tableId: string, fieldId: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, fields: t.fields.map((f) => (f.id === fieldId ? { ...f, selected: !f.selected } : f)) }
          : t
      )
    );
  };

  // 拖拽开始
  const handleDragStart = (field: FieldItem, source: 'table' | 'dimension' | 'metric') => {
    setDraggedItem({ field, source });
  };

  // 拖拽结束
  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverZone(null);
  };

  // 放置到维度区
  const handleDimensionDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem) return;
    const { field, source } = draggedItem;

    if (source === 'table') {
      const newField = { ...field, type: 'dimension' as const, id: `${field.id}_dim_${Date.now()}` };
      setDimensions((prev) => [...prev, newField]);
    } else if (source === 'metric') {
      setMetrics((prev) => prev.filter((f) => f.id !== field.id));
      setDimensions((prev) => [...prev, { ...field, type: 'dimension' }]);
    }
    setDragOverZone(null);
    setDraggedItem(null);
  };

  // 放置到指标区
  const handleMetricDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem) return;
    const { field, source } = draggedItem;

    if (source === 'table') {
      const newField = { ...field, type: 'metric' as const, id: `${field.id}_metric_${Date.now()}` };
      setMetrics((prev) => [...prev, newField]);
    } else if (source === 'dimension') {
      setDimensions((prev) => prev.filter((f) => f.id !== field.id));
      setMetrics((prev) => [...prev, { ...field, type: 'metric' }]);
    }
    setDragOverZone(null);
    setDraggedItem(null);
  };

  // 移除字段
  const removeDimension = (id: string) => setDimensions((prev) => prev.filter((f) => f.id !== id));
  const removeMetric = (id: string) => setMetrics((prev) => prev.filter((f) => f.id !== id));

  // 添加关联
  const addJoin = () => {
    const newJoin: JoinRelation = {
      id: `join_${Date.now()}`,
      leftTableId: tables[0]?.id || '',
      leftField: '',
      rightTableId: tables[1]?.id || '',
      rightField: '',
      joinType: 'left',
    };
    setJoins((prev) => [...prev, newJoin]);
  };

  // 过滤表和字段
  const filteredTables = useCallback(() => {
    return tables
      .filter((t) => t.name.toLowerCase().includes(searchTable.toLowerCase()) || t.alias?.toLowerCase().includes(searchTable.toLowerCase()))
      .map((t) => ({
        ...t,
        fields: t.fields.filter((f) => f.name.toLowerCase().includes(searchField.toLowerCase())),
      }))
      .filter((t) => t.fields.length > 0 || searchField === '');
  }, [tables, searchTable, searchField]);

  // 返回
  const handleBack = () => {
    window.location.hash = 'page=dataset';
  };

  // 保存
  const handleSave = () => {
    alert('保存成功');
  };

  return (
    <div className="dataset-detail-page" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f5f6f7' }}>
      {/* 顶部导航栏 */}
      <header
        style={{
          height: 52,
          background: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={handleBack}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 4,
              borderRadius: 4,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            <ChevronLeft size={18} />
          </button>
          <span style={{ color: '#fff', fontSize: 15, fontWeight: 500 }}>{dataset.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="dae-btn dae-btn-secondary" style={{ background: 'transparent', color: '#94a3b8', borderColor: '#334155' }} onClick={handleBack}>
            <X size={14} />
            取消
          </button>
          <button className="dae-btn dae-btn-primary" onClick={handleSave}>
            <Save size={14} />
            保存
          </button>
        </div>
      </header>

      {/* 主体内容 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 左侧数据表面板 */}
        <aside
          style={{
            width: 280,
            background: '#fff',
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
          }}
        >
          {/* 数据源选择 */}
          <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>选择数据源</div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                fontSize: 14,
                color: '#0f172a',
              }}
            >
              <Database size={14} style={{ color: '#1677FF' }} />
              <span>Demo</span>
            </div>
          </div>

          {/* 表搜索 */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Table2 size={14} style={{ color: '#64748b' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>数据表</span>
              <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 'auto' }}>{tables.length}</span>
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                className="dae-input"
                style={{ paddingLeft: 32, fontSize: 13 }}
                placeholder="通过表名称搜索"
                value={searchTable}
                onChange={(e) => setSearchTable(e.target.value)}
              />
            </div>
          </div>

          {/* 表列表 */}
          <div style={{ flex: 1, overflow: 'auto' }} className="dae-scroll">
            {filteredTables().map((table) => (
              <div key={table.id}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 16px',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: '#334155',
                    fontWeight: 500,
                    borderBottom: '1px solid #f1f5f9',
                  }}
                  onClick={() => toggleTable(table.id)}
                >
                  {table.expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <Table2 size={14} style={{ color: '#1677FF' }} />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {table.alias || table.name}
                  </span>
                </div>
                {table.expanded && (
                  <div style={{ background: '#f8fafc' }}>
                    {table.fields.map((field) => (
                      <div
                        key={field.id}
                        draggable
                        onDragStart={() => handleDragStart(field, 'table')}
                        onDragEnd={handleDragEnd}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 16px 8px 36px',
                          fontSize: 13,
                          color: '#475569',
                          cursor: 'grab',
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#e2e8f0')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <GripVertical size={12} style={{ color: '#94a3b8', cursor: 'grab' }} />
                        <span style={{ color: getDataTypeColor(field.dataType) }}>{getDataTypeIcon(field.dataType)}</span>
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{field.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* 中间配置区域 */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* 关联关系工具栏 */}
          <div
            style={{
              padding: '12px 20px',
              background: '#fff',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>关联关系</span>
            <button
              className="dae-btn dae-btn-sm"
              style={{ background: '#e6f4ff', color: '#1677FF', border: 'none' }}
              onClick={addJoin}
            >
              <Plus size={14} />
              添加关联
            </button>
            {joins.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                {joins.map((join) => (
                  <div
                    key={join.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 10px',
                      background: '#f1f5f9',
                      borderRadius: 4,
                      fontSize: 12,
                      color: '#475569',
                    }}
                  >
                    <Link2 size={12} style={{ color: '#1677FF' }} />
                    <span>{tables.find((t) => t.id === join.leftTableId)?.alias}</span>
                    <span style={{ color: '#94a3b8' }}>=</span>
                    <span>{tables.find((t) => t.id === join.rightTableId)?.alias}</span>
                    <button
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8' }}
                      onClick={() => setJoins((prev) => prev.filter((j) => j.id !== join.id))}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 字段配置区 */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* 维度区 */}
            <div
              ref={dimensionRef}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverZone('dimension');
              }}
              onDragLeave={() => setDragOverZone(null)}
              onDrop={handleDimensionDrop}
              style={{
                width: '50%',
                background: dragOverZone === 'dimension' ? '#e6f4ff' : '#fff',
                borderRight: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                transition: 'background 0.2s',
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ChevronDown size={14} style={{ color: '#64748b' }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>维度</span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>({dimensions.length})</span>
                </div>
                <button className="dae-btn dae-btn-sm dae-btn-ghost" onClick={() => setDimensions([])}>
                  <Trash2 size={12} />
                </button>
              </div>
              <div style={{ flex: 1, overflow: 'auto', padding: '8px' }} className="dae-scroll">
                {dimensions.length === 0 ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '40px 20px',
                      color: '#94a3b8',
                      fontSize: 13,
                      border: '2px dashed #e2e8f0',
                      borderRadius: 8,
                      margin: 12,
                    }}
                  >
                    <Type size={24} style={{ marginBottom: 8, opacity: 0.5 }} />
                    <p>拖拽字段到此处添加维度</p>
                  </div>
                ) : (
                  dimensions.map((field) => (
                    <div
                      key={field.id}
                      draggable
                      onDragStart={() => handleDragStart(field, 'dimension')}
                      onDragEnd={handleDragEnd}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        margin: '4px 0',
                        background: '#f8fafc',
                        borderRadius: 6,
                        fontSize: 13,
                        color: '#334155',
                        cursor: 'grab',
                        border: '1px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.background = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.background = '#f8fafc';
                      }}
                    >
                      <GripVertical size={12} style={{ color: '#94a3b8' }} />
                      <span style={{ color: getDataTypeColor(field.dataType) }}>{getDataTypeIcon(field.dataType)}</span>
                      <span style={{ flex: 1 }}>{field.name}</span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{field.tableName}</span>
                      <button
                        style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', color: '#94a3b8' }}
                        onClick={() => removeDimension(field.id)}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 指标区 */}
            <div
              ref={metricRef}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverZone('metric');
              }}
              onDragLeave={() => setDragOverZone(null)}
              onDrop={handleMetricDrop}
              style={{
                width: '50%',
                background: dragOverZone === 'metric' ? '#e6f4ff' : '#fff',
                display: 'flex',
                flexDirection: 'column',
                transition: 'background 0.2s',
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ChevronDown size={14} style={{ color: '#64748b' }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>指标</span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>({metrics.length})</span>
                </div>
                <button className="dae-btn dae-btn-sm dae-btn-ghost" onClick={() => setMetrics([])}>
                  <Trash2 size={12} />
                </button>
              </div>
              <div style={{ flex: 1, overflow: 'auto', padding: '8px' }} className="dae-scroll">
                {metrics.length === 0 ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '40px 20px',
                      color: '#94a3b8',
                      fontSize: 13,
                      border: '2px dashed #e2e8f0',
                      borderRadius: 8,
                      margin: 12,
                    }}
                  >
                    <Hash size={24} style={{ marginBottom: 8, opacity: 0.5 }} />
                    <p>拖拽字段到此处添加指标</p>
                  </div>
                ) : (
                  metrics.map((field) => (
                    <div
                      key={field.id}
                      draggable
                      onDragStart={() => handleDragStart(field, 'metric')}
                      onDragEnd={handleDragEnd}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        margin: '4px 0',
                        background: '#f8fafc',
                        borderRadius: 6,
                        fontSize: 13,
                        color: '#334155',
                        cursor: 'grab',
                        border: '1px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.background = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.background = '#f8fafc';
                      }}
                    >
                      <GripVertical size={12} style={{ color: '#94a3b8' }} />
                      <span style={{ color: getDataTypeColor(field.dataType) }}>{getDataTypeIcon(field.dataType)}</span>
                      <span style={{ flex: 1 }}>{field.name}</span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{field.tableName}</span>
                      <button
                        style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', color: '#94a3b8' }}
                        onClick={() => removeMetric(field.id)}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 底部预览区域 */}
          <div style={{ height: '45%', background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            {/* 预览标签 */}
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #e2e8f0', padding: '0 20px' }}>
              <button
                onClick={() => setActiveTab('preview')}
                style={{
                  padding: '12px 20px',
                  fontSize: 14,
                  fontWeight: activeTab === 'preview' ? 600 : 400,
                  color: activeTab === 'preview' ? '#1677FF' : '#64748b',
                  border: 'none',
                  background: 'none',
                  borderBottom: activeTab === 'preview' ? '2px solid #1677FF' : '2px solid transparent',
                  cursor: 'pointer',
                  marginBottom: -1,
                }}
              >
                数据预览
              </button>
              <button
                onClick={() => setActiveTab('batch')}
                style={{
                  padding: '12px 20px',
                  fontSize: 14,
                  fontWeight: activeTab === 'batch' ? 600 : 400,
                  color: activeTab === 'batch' ? '#1677FF' : '#64748b',
                  border: 'none',
                  background: 'none',
                  borderBottom: activeTab === 'batch' ? '2px solid #1677FF' : '2px solid transparent',
                  cursor: 'pointer',
                  marginBottom: -1,
                }}
              >
                批量管理
              </button>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button className="dae-btn dae-btn-sm dae-btn-secondary">
                  <Plus size={14} />
                  新建计算字段
                </button>
                <button className="dae-btn dae-btn-sm dae-btn-secondary">
                  <FunctionSquare size={14} />
                  新建分组字段
                </button>
                <button className="dae-btn dae-btn-sm dae-btn-ghost">
                  <RotateCcw size={14} />
                  刷新数据
                </button>
              </div>
            </div>

            {/* 预览内容 */}
            <div style={{ flex: 1, overflow: 'auto', padding: 16 }} className="dae-scroll">
              {activeTab === 'preview' ? (
                <table className="dae-table" style={{ fontSize: 13 }}>
                  <thead>
                    <tr>
                      {dimensions.map((f) => (
                        <th key={f.id}>{f.name}</th>
                      ))}
                      {metrics.map((f) => (
                        <th key={f.id}>{f.name}</th>
                      ))}
                      {dimensions.length === 0 && metrics.length === 0 && <th style={{ color: '#94a3b8' }}>请先配置维度和指标</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {dimensions.length > 0 || metrics.length > 0 ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          {dimensions.map((f) => (
                            <td key={f.id} style={{ color: '#475569' }}>
                              {f.dataType === 'date'
                                ? '2026-06-0' + (i + 1)
                                : f.dataType === 'number'
                                ? String(1000 + i * 123)
                                : `示例${f.name}_${i + 1}`}
                            </td>
                          ))}
                          {metrics.map((f) => (
                            <td key={f.id} style={{ color: '#1677FF', fontWeight: 500 }}>
                              {(Math.random() * 10000).toFixed(2)}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={100}>
                          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                            <Eye size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                            <p>拖拽左侧字段到维度或指标区域，预览数据</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    <button className="dae-btn dae-btn-sm dae-btn-secondary">批量修改数据类型</button>
                    <button className="dae-btn dae-btn-sm dae-btn-secondary">批量设置别名</button>
                    <button className="dae-btn dae-btn-sm dae-btn-danger">批量删除</button>
                  </div>
                  <table className="dae-table" style={{ fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th>
                          <input type="checkbox" />
                        </th>
                        <th>字段名</th>
                        <th>别名</th>
                        <th>数据类型</th>
                        <th>所属表</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...dimensions, ...metrics].map((field) => (
                        <tr key={field.id}>
                          <td>
                            <input type="checkbox" />
                          </td>
                          <td>{field.name}</td>
                          <td>{field.alias || '-'}</td>
                          <td>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '2px 8px',
                                borderRadius: 4,
                                fontSize: 12,
                                background: '#f1f5f9',
                                color: getDataTypeColor(field.dataType),
                              }}
                            >
                              {getDataTypeIcon(field.dataType)}
                              {field.dataType === 'text' ? '文本' : field.dataType === 'number' ? '数值' : field.dataType === 'date' ? '日期' : '布尔'}
                            </span>
                          </td>
                          <td>{field.tableName}</td>
                          <td>
                            <div className="dae-table-actions">
                              <button style={{ padding: '2px 6px' }}>编辑</button>
                              <button style={{ padding: '2px 6px', color: '#dc2626' }}>删除</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
