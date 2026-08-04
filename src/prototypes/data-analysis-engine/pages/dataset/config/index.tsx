import React, { useState, useRef } from 'react';
import '../../../style.css';

/* ---------- 类型定义 ---------- */

interface DataSource {
  id: string;
  name: string;
  type: string;
}

interface TableItem {
  id: string;
  name: string;
  alias?: string;
  fields: FieldItem[];
}

interface FieldItem {
  id: string;
  name: string;
  alias?: string;
  dataType: 'text' | 'number' | 'date' | 'boolean' | 'json';
  tableName: string;
  tableId: string;
  selected?: boolean;
  calculated?: boolean;
  grouped?: boolean;
}

interface JoinRelation {
  id: string;
  leftTableId: string;
  rightTableId: string;
  leftField: string;
  rightField: string;
  type: 'inner' | 'left' | 'right' | 'full';
  alias?: string;
}

interface CalculatedField {
  id: string;
  name: string;
  alias: string;
  expression: string;
  dataType: 'text' | 'number' | 'date';
  description?: string;
}

interface GroupedField {
  id: string;
  name: string;
  alias: string;
  sourceFieldId: string;
  rules: GroupRule[];
}

interface GroupRule {
  condition: string;
  label: string;
  order: number;
}

/* ---------- 模拟数据 ---------- */

const mockDataSources: DataSource[] = [
  { id: 'ds1', name: 'Demo', type: 'MySQL' },
  { id: 'ds2', name: '生产数据库', type: 'PostgreSQL' },
];

const mockTables: TableItem[] = [
  {
    id: 'T001', name: 'Blob触发器', alias: 'BLOB_TRIGGERS',
    fields: [
      { id: 'F001', name: 'BLOB_DATA', dataType: 'text', tableName: 'BLOB_TRIGGERS', tableId: 'T001' },
      { id: 'F002', name: 'SCHED_NAME', dataType: 'text', tableName: 'BLOB_TRIGGERS', tableId: 'T001' },
      { id: 'F003', name: 'TRIGGER_GROUP', dataType: 'text', tableName: 'BLOB_TRIGGERS', tableId: 'T001' },
      { id: 'F004', name: 'TRIGGER_NAME', dataType: 'text', tableName: 'BLOB_TRIGGERS', tableId: 'T001' },
      { id: 'F005', name: 'TRIGGER_STATE', dataType: 'text', tableName: 'BLOB_TRIGGERS', tableId: 'T001' },
    ],
  },
  {
    id: 'T002', name: 'Cron触发器', alias: 'CRON_TRIGGERS',
    fields: [
      { id: 'F006', name: 'CRON_EXPRESSION', dataType: 'text', tableName: 'CRON_TRIGGERS', tableId: 'T002' },
      { id: 'F007', name: 'SCHED_NAME', dataType: 'text', tableName: 'CRON_TRIGGERS', tableId: 'T002' },
      { id: 'F008', name: 'TIME_ZONE_ID', dataType: 'text', tableName: 'CRON_TRIGGERS', tableId: 'T002' },
      { id: 'F009', name: 'TRIGGER_GROUP', dataType: 'text', tableName: 'CRON_TRIGGERS', tableId: 'T002' },
      { id: 'F010', name: 'TRIGGER_NAME', dataType: 'text', tableName: 'CRON_TRIGGERS', tableId: 'T002' },
    ],
  },
  {
    id: 'T003', name: '日历表', alias: 'QRTZ_CALENDARS',
    fields: [
      { id: 'F011', name: 'CALENDAR_NAME', dataType: 'text', tableName: 'QRTZ_CALENDARS', tableId: 'T003' },
      { id: 'F012', name: 'SCHED_NAME', dataType: 'text', tableName: 'QRTZ_CALENDARS', tableId: 'T003' },
      { id: 'F013', name: 'CALENDAR', dataType: 'json', tableName: 'QRTZ_CALENDARS', tableId: 'T003' },
    ],
  },
  {
    id: 'T004', name: '任务详情', alias: 'QRTZ_JOB_DETAILS',
    fields: [
      { id: 'F014', name: 'JOB_NAME', dataType: 'text', tableName: 'QRTZ_JOB_DETAILS', tableId: 'T004' },
      { id: 'F015', name: 'JOB_GROUP', dataType: 'text', tableName: 'QRTZ_JOB_DETAILS', tableId: 'T004' },
      { id: 'F016', name: 'JOB_CLASS_NAME', dataType: 'text', tableName: 'QRTZ_JOB_DETAILS', tableId: 'T004' },
      { id: 'F017', name: 'IS_DURABLE', dataType: 'boolean', tableName: 'QRTZ_JOB_DETAILS', tableId: 'T004' },
      { id: 'F018', name: 'IS_NONCONCURRENT', dataType: 'boolean', tableName: 'QRTZ_JOB_DETAILS', tableId: 'T004' },
      { id: 'F019', name: 'IS_UPDATE_DATA', dataType: 'boolean', tableName: 'QRTZ_JOB_DETAILS', tableId: 'T004' },
    ],
  },
  {
    id: 'T005', name: '订单表', alias: 'ORDERS',
    fields: [
      { id: 'F020', name: 'ORDER_ID', dataType: 'number', tableName: 'ORDERS', tableId: 'T005' },
      { id: 'F021', name: 'CUSTOMER_ID', dataType: 'number', tableName: 'ORDERS', tableId: 'T005' },
      { id: 'F022', name: 'ORDER_DATE', dataType: 'date', tableName: 'ORDERS', tableId: 'T005' },
      { id: 'F023', name: 'AMOUNT', dataType: 'number', tableName: 'ORDERS', tableId: 'T005' },
      { id: 'F024', name: 'STATUS', dataType: 'text', tableName: 'ORDERS', tableId: 'T005' },
    ],
  },
  {
    id: 'T006', name: '客户表', alias: 'CUSTOMERS',
    fields: [
      { id: 'F025', name: 'CUSTOMER_ID', dataType: 'number', tableName: 'CUSTOMERS', tableId: 'T006' },
      { id: 'F026', name: 'CUSTOMER_NAME', dataType: 'text', tableName: 'CUSTOMERS', tableId: 'T006' },
      { id: 'F027', name: 'EMAIL', dataType: 'text', tableName: 'CUSTOMERS', tableId: 'T006' },
      { id: 'F028', name: 'REGION', dataType: 'text', tableName: 'CUSTOMERS', tableId: 'T006' },
      { id: 'F029', name: 'CREATE_TIME', dataType: 'date', tableName: 'CUSTOMERS', tableId: 'T006' },
    ],
  },
];

const previewData = [
  { CALENDAR_NAME: '示例CALENDAR_NAME_1', JOB_GROUP: '3492.75' },
  { CALENDAR_NAME: '示例CALENDAR_NAME_2', JOB_GROUP: '4207.86' },
  { CALENDAR_NAME: '示例CALENDAR_NAME_3', JOB_GROUP: '5441.70' },
  { CALENDAR_NAME: '示例CALENDAR_NAME_4', JOB_GROUP: '6185.78' },
  { CALENDAR_NAME: '示例CALENDAR_NAME_5', JOB_GROUP: '2931.42' },
  { CALENDAR_NAME: '示例CALENDAR_NAME_6', JOB_GROUP: '4728.19' },
  { CALENDAR_NAME: '示例CALENDAR_NAME_7', JOB_GROUP: '3856.04' },
  { CALENDAR_NAME: '示例CALENDAR_NAME_8', JOB_GROUP: '5123.67' },
];

/* ========== 主组件 ========== */

export default function DatasetConfigPage() {
  // 基础状态
  const [selectedDsId] = useState('ds1');
  const [tableSearch, setTableSearch] = useState('');
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>(['T003', 'T004']);
  const [expandedTables, setExpandedTables] = useState<string[]>([]);
  const [joins, setJoins] = useState<JoinRelation[]>([
    {
      id: 'J001',
      leftTableId: 'T003',
      rightTableId: 'T004',
      leftField: 'SCHED_NAME',
      rightField: 'SCHED_NAME',
      type: 'left',
      alias: '日历_任务关联',
    },
  ]);
  const [calculatedFields, setCalculatedFields] = useState<CalculatedField[]>([]);
  const [groupedFields, setGroupedFields] = useState<GroupedField[]>([]);
  const [fieldOverrides, setFieldOverrides] = useState<Record<string, { alias?: string; dataType?: FieldItem['dataType'] }>>({});

  // 弹窗状态
  const [showAddJoinModal, setShowAddJoinModal] = useState(false);
  const [showEditJoinModal, setShowEditJoinModal] = useState(false);
  const [showCalcFieldModal, setShowCalcFieldModal] = useState(false);
  const [showGroupFieldModal, setShowGroupFieldModal] = useState(false);
  const [showBatchTypeModal, setShowBatchTypeModal] = useState(false);
  const [showBatchAliasModal, setShowBatchAliasModal] = useState(false);

  // 未保存提示 & 保存状态
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const pendingActionRef = useRef<'back' | 'cancel' | null>(null);

  // 编辑状态
  const [editingJoin, setEditingJoin] = useState<JoinRelation | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'batch'>('preview');

  /* ---------- 过滤后的表列表 ---------- */
  const filteredTables = mockTables.filter(t =>
    t.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
    t.alias?.toLowerCase().includes(tableSearch.toLowerCase())
  );

  /* ---------- 表选择操作 ---------- */
  const toggleTableSelect = (tableId: string) => {
    setSelectedTableIds(prev =>
      prev.includes(tableId) ? prev.filter(id => id !== tableId) : [...prev, tableId]
    );
  };

  const toggleTableExpand = (tableId: string) => {
    setExpandedTables(prev =>
      prev.includes(tableId) ? prev.filter(id => id !== tableId) : [...prev, tableId]
    );
  };

  const getSelectedTable = (id: string) => mockTables.find(t => t.id === id)!;

  /* ---------- 关联关系操作 ---------- */
  const handleAddJoin = (join: JoinRelation) => {
    setJoins(prev => [...prev, join]);
    setShowAddJoinModal(false);
  };

  const handleUpdateJoin = (join: JoinRelation) => {
    setJoins(prev => prev.map(j => j.id === join.id ? join : j));
    setShowEditJoinModal(false);
    setEditingJoin(null);
  };

  const handleDeleteJoin = (joinId: string) => {
    setJoins(prev => prev.filter(j => j.id !== joinId));
  };

  /* ---------- 计算字段操作 ---------- */
  const handleAddCalcField = (field: CalculatedField) => {
    setCalculatedFields(prev => [...prev, field]);
    setShowCalcFieldModal(false);
  };

  /* ---------- 分组字段操作 ---------- */
  const handleAddGroupField = (field: GroupedField) => {
    setGroupedFields(prev => [...prev, field]);
    setShowGroupFieldModal(false);
  };

  /* ---------- 获取已选表的全部字段 ---------- */
  const getAllSelectedFields = (): FieldItem[] => {
    const fields: FieldItem[] = [];
    selectedTableIds.forEach(tid => {
      const table = mockTables.find(t => t.id === tid);
      if (table) {
        fields.push(...table.fields.map(f => ({ ...f, selected: true })));
      }
    });
    return fields;
  };

  /* ---------- 未保存检测 ---------- */
  const initialSnapshotRef = useRef({
    selectedTableIds: ['T003', 'T004'],
    joins: JSON.stringify([{
      id: 'J001',
      leftTableId: 'T003',
      rightTableId: 'T004',
      leftField: 'SCHED_NAME',
      rightField: 'SCHED_NAME',
      type: 'left',
      alias: '日历_任务关联',
    }]),
    calculatedFields: '',
    groupedFields: '',
    fieldOverrides: '{}',
  });

  const hasUnsavedChanges =
    JSON.stringify(selectedTableIds) !== initialSnapshotRef.current.selectedTableIds ||
    JSON.stringify(joins) !== initialSnapshotRef.current.joins ||
    JSON.stringify(calculatedFields) !== initialSnapshotRef.current.calculatedFields ||
    JSON.stringify(groupedFields) !== initialSnapshotRef.current.groupedFields ||
    JSON.stringify(fieldOverrides) !== initialSnapshotRef.current.fieldOverrides;

  /* ---------- 导航 & 保存操作 ---------- */

  /** 检查未保存变更，有则弹窗，无则直接执行动作 */
  const checkUnsavedThen = (action: 'back' | 'cancel') => {
    if (hasUnsavedChanges) {
      pendingActionRef.current = action;
      setShowUnsavedDialog(true);
    } else {
      goBack();
    }
  };

  /** 返回数据集列表页 */
  const goBack = () => {
    window.location.hash = '#page=dataset';
  };

  /** 保存配置（模拟） */
  const handleSave = () => {
    // 模拟保存：记录当前状态为已保存快照
    initialSnapshotRef.current = {
      selectedTableIds: [...selectedTableIds],
      joins: JSON.stringify(joins),
      calculatedFields: JSON.stringify(calculatedFields),
      groupedFields: JSON.stringify(groupedFields),
      fieldOverrides: JSON.stringify(fieldOverrides),
    };
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
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--dae-ink)', margin: 0 }}>数据集配置</h1>
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
        {/* ====== 左侧面板：数据源 + 表选择 ====== */}
        <aside style={{ width: 300, borderRight: '1px solid var(--dae-border)', display: 'flex', flexDirection: 'column', background: '#fff', flexShrink: 0 }}>

          {/* 数据源选择 */}
          <div style={{ padding: '16px', borderBottom: '1px solid var(--dae-border)' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--dae-ink-secondary)', marginBottom: 8 }}>选择数据源</div>
            <div style={{
              padding: '10px 12px', borderRadius: 'var(--dae-radius-md)',
              border: '1px solid var(--dae-border-strong)',
              display: 'flex', alignItems: 'center', gap: 8,
              cursor: 'pointer', background: '#fff',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--dae-primary)" strokeWidth="2">
                <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
              </svg>
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--dae-ink)' }}>Demo</span>
              <span style={{ fontSize: '12px', color: 'var(--dae-ink-muted)', marginLeft: 'auto' }}>MySQL</span>
            </div>
          </div>

          {/* 表列表 */}
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--dae-ink-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>
                数据表
                <span style={{ fontSize: '12px', color: 'var(--dae-ink-subtle)', fontWeight: 400 }}>{mockTables.length}</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--dae-primary)', fontWeight: 500 }}>已选 {selectedTableIds.length}</span>
            </div>

            {/* 搜索框 */}
            <div style={{ padding: '0 12px 8px' }}>
              <div style={{ position: 'relative' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--dae-ink-subtle)" strokeWidth="2"
                  style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  className="dae-input"
                  placeholder="通过表名称搜索"
                  value={tableSearch}
                  onChange={e => setTableSearch(e.target.value)}
                  style={{ paddingLeft: 32 }}
                />
              </div>
            </div>

            {/* 表项 */}
            <div style={{ padding: '0 8px', flex: 1, overflow: 'auto' }}>
              {filteredTables.map(table => (
                <div key={table.id}>
                  {/* 表行 */}
                  <div
                    onClick={() => toggleTableExpand(table.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 10px', borderRadius: 'var(--dae-radius-md)',
                      cursor: 'pointer', transition: 'background 0.12s',
                      background: expandedTables.includes(table.id) ? 'var(--dae-surface-hover)' : 'transparent',
                      ':hover': { background: 'var(--dae-surface-hover)' },
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTableIds.includes(table.id)}
                      onChange={(e) => { e.stopPropagation(); toggleTableSelect(table.id); }}
                      style={{ accentColor: 'var(--dae-primary)', width: 15, height: 15, cursor: 'pointer' }}
                    />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--dae-ink-muted)" strokeWidth="2"
                      style={{
                        transition: 'transform 0.15s',
                        transform: expandedTables.includes(table.id) ? 'rotate(90deg)' : 'rotate(0deg)',
                        flexShrink: 0,
                      }}>
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--dae-primary)" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
                    </svg>
                    <span style={{ fontSize: '13px', color: 'var(--dae-ink)', flex: 1 }}>{table.name}</span>
                  </div>

                  {/* 展开的字段列表 */}
                  {expandedTables.includes(table.id) && (
                    <div style={{ paddingLeft: 30, paddingRight: 4, paddingBottom: 4 }}>
                      {table.fields.map(field => (
                        <div key={field.id} style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '4px 8px', borderRadius: 4,
                          fontSize: '12px', color: 'var(--dae-ink-secondary)',
                        }}>
                          <span style={{
                            width: 14, textAlign: 'center', fontSize: 10, fontWeight: 700,
                            background: field.dataType === 'number' ? '#dcfce7' :
                                      field.dataType === 'date' ? '#fef3c7' :
                                      field.dataType === 'boolean' ? '#e0e7ff' : '#e6f4ff',
                            borderRadius: 3, padding: '1px 3px',
                            color: field.dataType === 'number' ? '#15803d' :
                                  field.dataType === 'date' ? '#92400e' :
                                  field.dataType === 'boolean' ? '#3730a3' : '#1677FF',
                          }}>
                            {field.dataType === 'number' ? '#' : field.dataType === 'date' ? 'D' : field.dataType === 'boolean' ? 'B' : 'T'}
                          </span>
                          <span>{field.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </aside>

        {/* ====== 右侧主区域：关联 + 预览 ====== */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--dae-surface)' }}>

          {/* --- 关联关系区域 --- */}
          <section style={{ padding: '20px 24px', borderBottom: '1px solid var(--dae-border)', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--dae-ink)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                关联关系
                {joins.length > 0 && (
                  <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--dae-ink-muted)', background: 'var(--dae-surface)', padding: '2px 8px', borderRadius: 10 }}>
                    {joins.length}
                  </span>
                )}
              </h2>
              <button
                className="dae-btn dae-btn-secondary dae-btn-sm"
                disabled={selectedTableIds.length < 2}
                onClick={() => setShowAddJoinModal(true)}
                title={selectedTableIds.length < 2 ? '请先至少选择两张表' : ''}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                添加关联
              </button>
            </div>

            {/* 已选表卡片 + 关联线可视化 */}
            {selectedTableIds.length === 0 ? (
              <div className="dae-empty" style={{ padding: '40px 24px' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--dae-border-strong)" strokeWidth="1.5" opacity="0.5">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
                <p>请在左侧选择需要关联的数据表</p>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {/* 已选表卡片 */}
                {selectedTableIds.map((tid, idx) => {
                  const table = getSelectedTable(tid);
                  const relatedJoins = joins.filter(j => j.leftTableId === tid || j.rightTableId === tid);
                  return (
                    <div key={tid} style={{
                      minWidth: 220, maxWidth: 280,
                      border: '1px solid var(--dae-border)',
                      borderRadius: 'var(--dae-radius-lg)',
                      background: '#fff',
                      overflow: 'hidden',
                    }}>
                      {/* 卡片头 */}
                      <div style={{
                        padding: '12px 14px', borderBottom: '1px solid var(--dae-border)',
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'var(--dae-surface)',
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--dae-primary)" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
                        </svg>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dae-ink)' }}>{table.name}</span>
                        <span className="dae-tag dae-tag-gray" style={{ marginLeft: 'auto' }}>{table.fields.length} 字段</span>
                      </div>
                      {/* 字段预览 */}
                      <div style={{ padding: '10px 14px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--dae-ink-muted)', marginBottom: 6 }}>可用字段</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          {table.fields.slice(0, 5).map(f => (
                            <div key={f.id} style={{
                              display: 'flex', alignItems: 'center', gap: 6,
                              padding: '3px 6px', borderRadius: 4, fontSize: '12px', color: 'var(--dae-ink-secondary)',
                            }}>
                              <span className={`de-field-icon ${f.dataType === 'number' ? 'de-field-metric' : 'de-field-dim'}`}>
                                {f.dataType === 'number' ? '#' : f.dataType === 'date' ? 'D' : 'T'}
                              </span>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                            </div>
                          ))}
                          {table.fields.length > 5 && (
                            <span style={{ fontSize: '11px', color: 'var(--dae-ink-subtle)', paddingLeft: 22 }}>
                              +{table.fields.length - 5} 更多字段
                            </span>
                          )}
                        </div>
                      </div>
                      {/* 关联信息 */}
                      {relatedJoins.length > 0 && (
                        <div style={{
                          padding: '8px 14px', borderTop: '1px solid var(--dae-border)',
                          background: 'var(--dae-primary-light)',
                        }}>
                          <div style={{ fontSize: '11px', color: 'var(--dae-primary)', fontWeight: 500, marginBottom: 4 }}>
                            关联 ({relatedJoins.length})
                          </div>
                          {relatedJoins.map(j => {
                            const otherTableId = j.leftTableId === tid ? j.rightTableId : j.leftTableId;
                            const otherTable = getSelectedTable(otherTableId);
                            const joinTypeLabel = { inner: '内连接', left: '左连接', right: '右连接', full: '全连接' };
                            return (
                              <div key={j.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '4px 6px', marginTop: 2, borderRadius: 4,
                                background: 'rgba(255,255,255,0.7)', fontSize: '11px',
                              }}>
                                <span style={{ color: 'var(--dae-ink-secondary)' }}>
                                  → {otherTable.name}.{j.leftTableId === tid ? j.rightField : j.leftField}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <span className="dae-tag dae-tag-blue">{joinTypeLabel[j.type]}</span>
                                  <button
                                    onClick={() => { setEditingJoin(j); setShowEditJoinModal(true); }}
                                    style={{ border: 'none', background: 'transparent', color: 'var(--dae-primary)', cursor: 'pointer', fontSize: 12 }}
                                    title="编辑关联"
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteJoin(j.id)}
                                    style={{ border: 'none', background: 'transparent', color: 'var(--dae-error)', cursor: 'pointer', fontSize: 12 }}
                                    title="删除关联"
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                                  </button>
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 无关联提示 */}
            {selectedTableIds.length >= 2 && joins.length === 0 && (
              <div style={{
                marginTop: 12, padding: '12px 16px', borderRadius: 'var(--dae-radius-md)',
                background: '#fefce8', border: '1px solid #fde68a',
                fontSize: '13px', color: '#92400e', display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                已选择多张表但尚未设置关联，点击「添加关联」建立表间连接
              </div>
            )}
          </section>

          {/* --- 底部 Tab 区域：预览 / 批量管理 / 操作按钮 --- */}
          <section style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Tab 栏 + 操作按钮 */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 24px', borderBottom: '1px solid var(--dae-border)',
              background: '#fff', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', gap: 2 }}>
                <button
                  className={`de-tab ${activeTab === 'preview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('preview')}
                >
                  数据预览
                </button>
                <button
                  className={`de-tab ${activeTab === 'batch' ? 'active' : ''}`}
                  onClick={() => setActiveTab('batch')}
                >
                  批量管理
                </button>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="dae-btn dae-btn-secondary dae-btn-sm" onClick={() => setShowCalcFieldModal(true)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  新建计算字段
                </button>
                <button className="dae-btn dae-btn-secondary dae-btn-sm" onClick={() => setShowGroupFieldModal(true)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                  新建分组字段
                </button>
                <button className="dae-btn dae-btn-ghost dae-btn-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
                  刷新数据
                </button>
              </div>
            </div>

            {/* Tab 内容区 */}
            <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
              {activeTab === 'preview' ? (
                /* ====== 数据预览 Tab ====== */
                <div style={{ background: '#fff', borderRadius: 'var(--dae-radius-lg)', border: '1px solid var(--dae-border)', overflow: 'hidden' }}>
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
              ) : (
                /* ====== 批量管理 Tab ====== */
                <div style={{ background: '#fff', borderRadius: 'var(--dae-radius-lg)', border: '1px solid var(--dae-border)', overflow: 'hidden' }}>
                  {/* 批量操作工具栏 */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 16px', borderBottom: '1px solid var(--dae-border)',
                    background: 'var(--dae-surface)',
                  }}>
                    <button className="dae-btn dae-btn-secondary dae-btn-sm" onClick={() => setShowBatchTypeModal(true)}>
                      批量修改数据类型
                    </button>
                    <button className="dae-btn dae-btn-secondary dae-btn-sm" onClick={() => setShowBatchAliasModal(true)}>
                      批量设置别名
                    </button>
                    <button className="dae-btn dae-btn-danger dae-btn-sm">
                      批量删除
                    </button>
                  </div>
                  {/* 字段列表表格 */}
                  <table className="dae-table">
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}>
                          <input type="checkbox" style={{ accentColor: 'var(--dae-primary)', width: 15, height: 15 }} />
                        </th>
                        <th>字段名</th>
                        <th>别名</th>
                        <th>数据类型</th>
                        <th>所属表</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getAllSelectedFields().map((field, i) => {
                        const override = fieldOverrides[field.id] || {};
                        const displayAlias = override.alias ?? field.alias ?? '';
                        const displayType = override.dataType ?? field.dataType;
                        return (
                          <tr key={i}>
                            <td><input type="checkbox" defaultChecked style={{ accentColor: 'var(--dae-primary)', width: 15, height: 15 }} /></td>
                            <td><code style={{ fontSize: '13px', background: 'var(--dae-surface)', padding: '2px 6px', borderRadius: 4 }}>{field.name}</code></td>
                            <td>
                              <input
                                className="dae-input"
                                value={displayAlias}
                                onChange={e => setFieldOverrides(prev => ({
                                  ...prev,
                                  [field.id]: { ...prev[field.id], alias: e.target.value },
                                }))}
                                placeholder="设置别名"
                                style={{ padding: '4px 8px', fontSize: '13px' }}
                              />
                            </td>
                            <td>
                              <select
                                className="dae-input"
                                value={displayType}
                                onChange={e => setFieldOverrides(prev => ({
                                  ...prev,
                                  [field.id]: { ...prev[field.id], dataType: e.target.value as FieldItem['dataType'] },
                                }))}
                                style={{ padding: '4px 8px', fontSize: '13px', width: 'auto', minWidth: 100 }}
                              >
                                <option value="text">TEXT</option>
                                <option value="number">NUMBER</option>
                                <option value="date">DATE</option>
                                <option value="boolean">BOOLEAN</option>
                                <option value="json">JSON</option>
                              </select>
                            </td>
                            <td style={{ color: 'var(--dae-ink-muted)', fontSize: '13px' }}>{field.tableName}</td>
                            <td>
                              <div className="dae-table-actions">
                                <button style={{ color: 'var(--dae-error)' }}>删除</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* ==================== 弹窗区域 ==================== */}

      {/* ----- 添加关联弹窗 ----- */}
      {showAddJoinModal && (
        <AddJoinModal
          tables={mockTables.filter(t => selectedTableIds.includes(t.id))}
          existingJoins={joins}
          onClose={() => setShowAddJoinModal(false)}
          onConfirm={handleAddJoin}
        />
      )}

      {/* ----- 编辑关联弹窗 ----- */}
      {showEditJoinModal && editingJoin && (
        <EditJoinModal
          join={editingJoin}
          tables={mockTables.filter(t => selectedTableIds.includes(t.id))}
          onClose={() => { setShowEditJoinModal(false); setEditingJoin(null); }}
          onConfirm={handleUpdateJoin}
        />
      )}

      {/* ----- 新建计算字段弹窗 ----- */}
      {showCalcFieldModal && (
        <CalcFieldModal
          availableFields={getAllSelectedFields()}
          onClose={() => setShowCalcFieldModal(false)}
          onConfirm={handleAddCalcField}
        />
      )}

      {/* ----- 新建分组字段弹窗 ----- */}
      {showGroupFieldModal && (
        <GroupFieldModal
          availableFields={getAllSelectedFields()}
          onClose={() => setShowGroupFieldModal(false)}
          onConfirm={handleAddGroupField}
        />
      )}

      {/* ----- 批量修改数据类型弹窗 ----- */}
      {showBatchTypeModal && (
        <BatchTypeModal
          fields={getAllSelectedFields()}
          onClose={() => setShowBatchTypeModal(false)}
        />
      )}

      {/* ----- 批量设置别名弹窗 ----- */}
      {showBatchAliasModal && (
        <BatchAliasModal
          fields={getAllSelectedFields()}
          onClose={() => setShowBatchAliasModal(false)}
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
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, padding: '8px 0',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--dae-ink)', margin: '0 0 6px' }}>
                    当前配置有未保存的更改
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--dae-ink-secondary)', margin: 0, lineHeight: 1.5 }}>
                    如果离开，这些修改将会丢失。你可以选择保存后再离开，或直接放弃更改。
                  </p>
                </div>
              </div>
            </div>
            <div className="dae-modal-footer">
              <button className="dae-btn dae-btn-secondary" onClick={handleDiscardAndLeave}>
                放弃更改
              </button>
              <button className="dae-btn dae-btn-primary" onClick={handleSaveAndLeave}>
                保存并离开
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
 * 弹窗子组件
 * ================================================================ */

/** 添加关联弹窗 */
function AddJoinModal({ tables, existingJoins, onClose, onConfirm }: {
  tables: TableItem[];
  existingJoins: JoinRelation[];
  onClose: () => void;
  onConfirm: (join: JoinRelation) => void;
}) {
  const [leftTableId, setLeftTableId] = useState(tables[0]?.id || '');
  const [rightTableId, setRightTableId] = useState(tables[1]?.id || '');
  const [leftField, setLeftField] = useState('');
  const [rightField, setRightField] = useState('');
  const [joinType, setJoinType] = useState<JoinRelation['type']>('inner');
  const [alias, setAlias] = useState('');

  const leftTable = tables.find(t => t.id === leftTableId);
  const rightTable = tables.find(t => t.id === rightTableId);

  const handleConfirm = () => {
    if (!leftTableId || !rightTableId || !leftField || !rightField) return;
    onConfirm({
      id: `J${Date.now()}`,
      leftTableId, rightTableId, leftField, rightField, type: joinType,
      alias: alias || undefined,
    });
  };

  const joinTypes: { value: JoinRelation['type']; label: string; desc: string }[] = [
    { value: 'inner', label: '内连接 (INNER)', desc: '只返回两边都匹配的记录' },
    { value: 'left', label: '左连接 (LEFT)', desc: '返回左表所有记录，匹配不到为 NULL' },
    { value: 'right', label: '右连接 (RIGHT)', desc: '返回右表所有记录，匹配不到为 NULL' },
    { value: 'full', label: '全连接 (FULL)', desc: '返回两表所有记录，匹配不到为 NULL' },
  ];

  return (
    <div className="dae-drawer-overlay" onClick={onClose}>
      <div className="dae-drawer" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="dae-drawer-header">
          <h3>添加关联关系</h3>
          <button className="dae-icon-action" onClick={onClose}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div className="dae-drawer-body">
          {/* 左表 */}
          <div className="dae-form-group">
            <label>左表（主表）</label>
            <select className="dae-input" value={leftTableId} onChange={e => { setLeftTableId(e.target.value); setLeftField(''); }}>
              {tables.map(t => <option key={t.id} value={t.id}>{t.name} ({t.alias})</option>)}
            </select>
          </div>
          {leftTable && (
            <div className="dae-form-group">
              <label>左表关联字段</label>
              <select className="dae-input" value={leftField} onChange={e => setLeftField(e.target.value)}>
                <option value="">-- 选择字段 --</option>
                {leftTable.fields.map(f => <option key={f.id} value={f.name}>{f.name} ({f.dataType})</option>)}
              </select>
            </div>
          )}

          {/* 右表 */}
          <div className="dae-form-group">
            <label>右表（从表）</label>
            <select className="dae-input" value={rightTableId} onChange={e => { setRightTableId(e.target.value); setRightField(''); }}>
              {tables.map(t => <option key={t.id} value={t.id}>{t.name} ({t.alias})</option>)}
            </select>
          </div>
          {rightTable && (
            <div className="dae-form-group">
              <label>右表关联字段</label>
              <select className="dae-input" value={rightField} onChange={e => setRightField(e.target.value)}>
                <option value="">-- 选择字段 --</option>
                {rightTable.fields.map(f => <option key={f.id} value={f.name}>{f.name} ({f.dataType})</option>)}
              </select>
            </div>
          )}

          {/* 连接类型 */}
          <div className="dae-form-group">
            <label>连接方式</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {joinTypes.map(jt => (
                <label key={jt.value} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  border: `1px solid ${joinType === jt.value ? 'var(--dae-primary)' : 'var(--dae-border)'}`,
                  borderRadius: 'var(--dae-radius-md)', cursor: 'pointer',
                  background: joinType === jt.value ? 'var(--dae-primary-light)' : '#fff',
                  transition: 'all 0.12s',
                }}>
                  <input type="radio" name="joinType" value={jt.value} checked={joinType === jt.value}
                    onChange={() => setJoinType(jt.value)} style={{ accentColor: 'var(--dae-primary)' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--dae-ink)' }}>{jt.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--dae-ink-muted)' }}>{jt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 别名 */}
          <div className="dae-form-group">
            <label>关联别名 <span style={{ fontWeight: 400, color: 'var(--dae-ink-muted)' }}>(可选)</span></label>
            <input className="dae-input" placeholder="如：订单_客户关联" value={alias} onChange={e => setAlias(e.target.value)} />
            <div className="dae-form-hint">用于在复杂查询中标识此关联关系的用途</div>
          </div>
        </div>
        <div className="dae-drawer-footer">
          <button className="dae-btn dae-btn-secondary" onClick={onClose}>取消</button>
          <button className="dae-btn dae-btn-primary" onClick={handleConfirm}
            disabled={!leftField || !rightField || !leftTableId || !rightTableId}>确认添加</button>
        </div>
      </div>
    </div>
  );
}

/** 编辑关联弹窗 */
function EditJoinModal({ join, tables, onClose, onConfirm }: {
  join: JoinRelation;
  tables: TableItem[];
  onClose: () => void;
  onConfirm: (join: JoinRelation) => void;
}) {
  const [leftField, setLeftField] = useState(join.leftField);
  const [rightField, setRightField] = useState(join.rightField);
  const [joinType, setJoinType] = useState<JoinRelation['type']>(join.type);
  const [alias, setAlias] = useState(join.alias || '');

  const leftTable = tables.find(t => t.id === join.leftTableId);
  const rightTable = tables.find(t => t.id === join.rightTableId);

  return (
    <div className="dae-drawer-overlay" onClick={onClose}>
      <div className="dae-drawer" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="dae-drawer-header">
          <h3>编辑关联关系</h3>
          <button className="dae-icon-action" onClick={onClose}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div className="dae-drawer-body">
          <div style={{ padding: '10px 14px', borderRadius: 'var(--dae-radius-md)', background: 'var(--dae-surface)', marginBottom: 16, fontSize: '13px', color: 'var(--dae-ink-secondary)' }}>
            <strong>{leftTable?.name}</strong>.{leftField} ↔ <strong>{rightTable?.name}</strong>.{rightField}
          </div>

          <div className="dae-form-group">
            <label>左表关联字段</label>
            <select className="dae-input" value={leftField} onChange={e => setLeftField(e.target.value)}>
              {leftTable?.fields.map(f => <option key={f.id} value={f.name}>{f.name} ({f.dataType})</option>)}
            </select>
          </div>
          <div className="dae-form-group">
            <label>右表关联字段</label>
            <select className="dae-input" value={rightField} onChange={e => setRightField(e.target.value)}>
              {rightTable?.fields.map(f => <option key={f.id} value={f.name}>{f.name} ({f.dataType})</option>)}
            </select>
          </div>
          <div className="dae-form-group">
            <label>连接方式</label>
            <select className="dae-input" value={joinType} onChange={e => setJoinType(e.target.value as JoinRelation['type'])}>
              <option value="inner">内连接 (INNER)</option>
              <option value="left">左连接 (LEFT)</option>
              <option value="right">右连接 (RIGHT)</option>
              <option value="full">全连接 (FULL)</option>
            </select>
          </div>
          <div className="dae-form-group">
            <label>关联别名</label>
            <input className="dae-input" value={alias} onChange={e => setAlias(e.target.value)} />
          </div>
        </div>
        <div className="dae-drawer-footer">
          <button className="dae-btn dae-btn-secondary" onClick={onClose}>取消</button>
          <button className="dae-btn dae-btn-primary" onClick={() => onConfirm({ ...join, leftField, rightField, type: joinType, alias: alias || undefined })}>保存修改</button>
        </div>
      </div>
    </div>
  );
}

/** 新建计算字段弹窗 */
function CalcFieldModal({ availableFields, onClose, onConfirm }: {
  availableFields: FieldItem[];
  onClose: () => void;
  onConfirm: (field: CalculatedField) => void;
}) {
  const [name, setName] = useState('');
  const [alias, setAlias] = useState('');
  const [expression, setExpression] = useState('');
  const [dataType, setDataType] = useState<CalculatedField['dataType']>('number');
  const [description, setDescription] = useState('');
  const [showFieldPanel, setShowFieldPanel] = useState(true);
  const expressionRef = useRef<HTMLTextAreaElement>(null);

  // 按表名分组可用字段
  const fieldsByTable = availableFields.reduce<Record<string, FieldItem[]>>((acc, f) => {
    const key = f.tableName;
    if (!acc[key]) acc[key] = [];
    acc[key].push(f);
    return acc;
  }, {});

  // 获取字段类型图标
  const getTypeIcon = (type: FieldItem['dataType']) => {
    switch (type) {
      case 'number': return '#';
      case 'date': return 'D';
      case 'boolean': return 'B';
      default: return 'T';
    }
  };

  // 获取字段类型颜色
  const getTypeColor = (type: FieldItem['dataType']) => {
    switch (type) {
      case 'number': return { bg: '#dcfce7', color: '#15803d' };
      case 'date': return { bg: '#fef3c7', color: '#92400e' };
      case 'boolean': return { bg: '#e0e7ff', color: '#3730a3' };
      default: return { bg: '#e6f4ff', color: '#1677FF' };
    }
  };

  // 在光标位置插入字段引用
  const insertAtCursor = (fieldName: string) => {
    const textarea = expressionRef.current;
    if (!textarea) return;
    const insertText = `{${fieldName}}`;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newExpression = expression.substring(0, start) + insertText + expression.substring(end);
    setExpression(newExpression);
    // 恢复光标到插入内容之后
    requestAnimationFrame(() => {
      if (textarea) {
        const newPos = start + insertText.length;
        textarea.focus();
        textarea.setSelectionRange(newPos, newPos);
      }
    });
  };

  const sampleExpressions = [
    { label: '金额 × 数量', expr: '{AMOUNT} * {QUANTITY}' },
    { label: '日期差（天）', expr: 'DATEDIFF({END_DATE}, {START_DATE})' },
    { label: '条件判断', expr: 'IF({STATUS} = \'已完成\', 1, 0)' },
    { label: '字符串拼接', expr: 'CONCAT({FIRST_NAME}, \' \', {LAST_NAME})' },
  ];

  return (
    <div className="dae-drawer-overlay" onClick={onClose}>
      <div className="dae-drawer" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="dae-drawer-header">
          <h3>新建计算字段</h3>
          <button className="dae-icon-action" onClick={onClose}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div className="dae-drawer-body">
          <div className="dae-form-group">
            <label>字段名称 *</label>
            <input className="dae-input" placeholder="如：total_amount" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="dae-form-group">
            <label>显示别名 *</label>
            <input className="dae-input" placeholder="如：总金额" value={alias} onChange={e => setAlias(e.target.value)} />
          </div>
          <div className="dae-form-group">
            <label>计算表达式 *</label>
            <textarea
              ref={expressionRef}
              className="dae-input"
              rows={4}
              placeholder="输入计算表达式，如: {AMOUNT} * {QUANTITY}"
              value={expression}
              onChange={e => setExpression(e.target.value)}
              style={{ fontFamily: 'monospace', fontSize: '13px' }}
            />
            <div className="dae-form-hint">使用 {'{字段名}'} 引用已有字段，支持 SQL 函数</div>

            {/* 可用字段选择面板 */}
            {availableFields.length > 0 && (
              <div style={{
                border: '1px solid var(--dae-border)',
                borderRadius: 'var(--dae-radius-md)',
                overflow: 'hidden',
                marginTop: 4,
              }}>
                {/* 折叠标题栏 */}
                <div
                  onClick={() => setShowFieldPanel(!showFieldPanel)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'var(--dae-surface)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    fontSize: '13px', fontWeight: 500, color: 'var(--dae-ink)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      style={{ transition: 'transform 0.15s', transform: showFieldPanel ? 'rotate(90deg)' : 'rotate(0deg)' }}
                    >
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                    可用字段 ({availableFields.length})
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--dae-ink-muted)', fontWeight: 400 }}>
                    点击字段插入到表达式
                  </span>
                </div>
                {/* 字段列表（可折叠） */}
                {showFieldPanel && (
                  <div style={{ maxHeight: 200, overflow: 'auto', padding: '4px 0' }}>
                    {Object.entries(fieldsByTable).map(([tableName, fields]) => (
                      <div key={tableName}>
                        {/* 表名分组头 */}
                        <div style={{
                          padding: '4px 12px', fontSize: '11px', fontWeight: 600,
                          color: 'var(--dae-ink-muted)', background: 'var(--dae-surface)',
                          borderTop: '1px solid var(--dae-border)',
                          letterSpacing: '0.3px',
                        }}>
                          {tableName}
                        </div>
                        {/* 字段项 */}
                        {fields.map(field => {
                          const tc = getTypeColor(field.dataType);
                          return (
                            <button
                              key={field.id}
                              onClick={() => insertAtCursor(field.name)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                width: '100%', padding: '5px 12px',
                                border: 'none', background: 'transparent',
                                cursor: 'pointer', textAlign: 'left',
                                fontSize: '12px', color: 'var(--dae-ink-secondary)',
                                transition: 'background 0.1s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--dae-surface-hover)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <span style={{
                                width: 16, height: 16, borderRadius: 3,
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '10px', fontWeight: 700,
                                background: tc.bg, color: tc.color,
                                flexShrink: 0,
                              }}>
                                {getTypeIcon(field.dataType)}
                              </span>
                              <code style={{
                                fontSize: '12px', color: 'var(--dae-ink)',
                                background: 'transparent', padding: 0,
                              }}>
                                {field.name}
                              </code>
                              <span style={{ fontSize: '11px', color: 'var(--dae-ink-subtle)', marginLeft: 'auto' }}>
                                {field.alias || tableName}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 快捷表达式模板 */}
          <div className="dae-form-group">
            <label>快捷模板</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sampleExpressions.map((se, i) => (
                <button
                  key={i}
                  onClick={() => setExpression(se.expr)}
                  style={{
                    padding: '8px 12px', borderRadius: 'var(--dae-radius-md)',
                    border: '1px dashed var(--dae-border-strong)', background: '#fff',
                    textAlign: 'left', fontSize: '12px', cursor: 'pointer',
                    color: 'var(--dae-ink-secondary)',
                    transition: 'border-color 0.12s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--dae-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--dae-border-strong)')}
                >
                  <span style={{ fontWeight: 500, color: 'var(--dae-ink)' }}>{se.label}</span>
                  <code style={{ marginLeft: 8, fontSize: '11px', color: 'var(--dae-primary)', background: 'var(--dae-primary-light)', padding: '1px 4px', borderRadius: 3 }}>{se.expr}</code>
                </button>
              ))}
            </div>
          </div>

          <div className="dae-form-group">
            <label>返回数据类型</label>
            <select className="dae-input" value={dataType} onChange={e => setDataType(e.target.value as CalculatedField['dataType'])}>
              <option value="number">数值型</option>
              <option value="text">文本型</option>
              <option value="date">日期型</option>
            </select>
          </div>
          <div className="dae-form-group">
            <label>描述说明</label>
            <input className="dae-input" placeholder="简要描述该字段的用途" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
        </div>
        <div className="dae-drawer-footer">
          <button className="dae-btn dae-btn-secondary" onClick={onClose}>取消</button>
          <button className="dae-btn dae-btn-primary" onClick={() => {
            if (!name || !alias || !expression) return;
            onConfirm({ id: `CF${Date.now()}`, name, alias, expression, dataType, description });
          }} disabled={!name || !alias || !expression}>确认创建</button>
        </div>
      </div>
    </div>
  );
}

/** 新建分组字段弹窗 */
function GroupFieldModal({ availableFields, onClose, onConfirm }: {
  availableFields: FieldItem[];
  onClose: () => void;
  onConfirm: (field: GroupedField) => void;
}) {
  const [name, setName] = useState('');
  const [alias, setAlias] = useState('');
  const [sourceFieldId, setSourceFieldId] = useState('');
  const [rules, setRules] = useState<GroupRule[]>([
    { condition: '', label: '', order: 0 },
    { condition: '', label: '', order: 1 },
  ]);

  const addRule = () => {
    setRules([...rules, { condition: '', label: '', order: rules.length }]);
  };

  const updateRule = (index: number, key: keyof GroupRule, value: string) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [key]: value };
    setRules(newRules);
  };

  const removeRule = (index: number) => {
    if (rules.length <= 2) return;
    setRules(rules.filter((_, i) => i !== index).map((r, i) => ({ ...r, order: i })));
  };

  return (
    <div className="dae-drawer-overlay" onClick={onClose}>
      <div className="dae-drawer" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="dae-drawer-header">
          <h3>新建分组字段</h3>
          <button className="dae-icon-action" onClick={onClose}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div className="dae-drawer-body">
          <div className="dae-form-group">
            <label>字段名称 *</label>
            <input className="dae-input" placeholder="如：amount_tier" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="dae-form-group">
            <label>显示别名 *</label>
            <input className="dae-input" placeholder="如：金额区间" value={alias} onChange={e => setAlias(e.target.value)} />
          </div>
          <div className="dae-form-group">
            <label>来源字段 *</label>
            <select className="dae-input" value={sourceFieldId} onChange={e => setSourceFieldId(e.target.value)}>
              <option value="">-- 选择要分组的字段 --</option>
              {availableFields.map(f => <option key={f.id} value={f.id}>{f.tableName}.{f.name} ({f.dataType})</option>)}
            </select>
          </div>

          <div className="dae-form-group">
            <label>分组规则</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rules.map((rule, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 12px', borderRadius: 'var(--dae-radius-md)',
                  border: '1px solid var(--dae-border)', background: 'var(--dae-surface)',
                }}>
                  <span style={{ fontSize: '12px', color: 'var(--dae-ink-muted)', fontWeight: 600, width: 20 }}>#{i + 1}</span>
                  <input
                    className="dae-input" style={{ flex: 1 }}
                    placeholder="条件，如: >= 1000 或 = '已完成'"
                    value={rule.condition}
                    onChange={e => updateRule(i, 'condition', e.target.value)}
                  />
                  <span style={{ color: 'var(--dae-ink-muted)', fontSize: 12 }}>→</span>
                  <input
                    className="dae-input" style={{ width: 120 }}
                    placeholder="标签名"
                    value={rule.label}
                    onChange={e => updateRule(i, 'label', e.target.value)}
                  />
                  {rules.length > 2 && (
                    <button
                      onClick={() => removeRule(i)}
                      style={{ border: 'none', background: 'transparent', color: 'var(--dae-error)', cursor: 'pointer', fontSize: 16 }}
                    >&times;</button>
                  )}
                </div>
              ))}
              <button className="dae-btn dae-btn-ghost dae-btn-sm" onClick={addRule} style={{ alignSelf: 'flex-start' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                添加规则
              </button>
            </div>
            <div className="dae-form-hint">按顺序匹配，未命中的值归入「其他」组</div>
          </div>
        </div>
        <div className="dae-drawer-footer">
          <button className="dae-btn dae-btn-secondary" onClick={onClose}>取消</button>
          <button className="dae-btn dae-btn-primary" onClick={() => {
            if (!name || !alias || !sourceFieldId) return;
            onConfirm({ id: `GF${Date.now()}`, name, alias, sourceFieldId, rules });
          }} disabled={!name || !alias || !sourceFieldId}>确认创建</button>
        </div>
      </div>
    </div>
  );
}

/** 批量修改数据类型弹窗 */
function BatchTypeModal({ fields, onClose }: {
  fields: FieldItem[];
  onClose: () => void;
}) {
  const [targetType, setTargetType] = useState<FieldItem['dataType']>('text');

  return (
    <div className="dae-drawer-overlay" onClick={onClose}>
      <div className="dae-drawer" onClick={e => e.stopPropagation()}>
        <div className="dae-drawer-header">
          <h3>批量修改数据类型</h3>
          <button className="dae-icon-action" onClick={onClose}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div className="dae-drawer-body">
          <div style={{ padding: '10px 14px', borderRadius: 'var(--dae-radius-md)', background: 'var(--dae-surface)', marginBottom: 16, fontSize: '13px', color: 'var(--dae-ink-secondary)' }}>
            将对 <strong>{fields.length}</strong> 个选中字段进行批量修改
          </div>
          <div className="dae-form-group">
            <label>目标数据类型</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(['text', 'number', 'date', 'boolean', 'json'] as const).map(dt => (
                <button
                  key={dt}
                  onClick={() => setTargetType(dt)}
                  style={{
                    padding: '8px 16px', borderRadius: 'var(--dae-radius-md)',
                    border: `1px solid ${targetType === dt ? 'var(--dae-primary)' : 'var(--dae-border-strong)'}`,
                    background: targetType === dt ? 'var(--dae-primary-light)' : '#fff',
                    color: targetType === dt ? 'var(--dae-primary)' : 'var(--dae-ink-secondary)',
                    cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                    transition: 'all 0.12s',
                  }}
                >
                  {{ text: '文本', number: '数值', date: '日期', boolean: '布尔', json: 'JSON' }[dt]}
                </button>
              ))}
            </div>
          </div>
          <div className="dae-form-group">
            <label>受影响字段预览</label>
            <div style={{ maxHeight: 160, overflow: 'auto', border: '1px solid var(--dae-border)', borderRadius: 'var(--dae-radius-md)' }}>
              {fields.slice(0, 10).map((f, i) => (
                <div key={i} style={{ padding: '6px 12px', borderBottom: '1px solid var(--dae-border)', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span><code>{f.name}</code> <span style={{ color: 'var(--dae-ink-muted)' }}>({f.tableName})</span></span>
                  <span className="dae-tag dae-tag-gray">{f.dataType} → {{ text: '文本', number: '数值', date: '日期', boolean: '布尔', json: 'JSON' }[targetType]}</span>
                </div>
              ))}
              {fields.length > 10 && (
                <div style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--dae-ink-muted)', textAlign: 'center' }}>
                  ...还有 {fields.length - 10} 个字段
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="dae-drawer-footer">
          <button className="dae-btn dae-btn-secondary" onClick={onClose}>取消</button>
          <button className="dae-btn dae-btn-primary" onClick={onClose}>确认修改</button>
        </div>
      </div>
    </div>
  );
}

/** 批量设置别名弹窗 */
function BatchAliasModal({ fields, onClose }: {
  fields: FieldItem[];
  onClose: () => void;
}) {
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [mode, setMode] = useState<'replace' | 'append'>('append');

  return (
    <div className="dae-drawer-overlay" onClick={onClose}>
      <div className="dae-drawer" onClick={e => e.stopPropagation()}>
        <div className="dae-drawer-header">
          <h3>批量设置别名</h3>
          <button className="dae-icon-action" onClick={onClose}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div className="dae-drawer-body">
          <div style={{ padding: '10px 14px', borderRadius: 'var(--dae-radius-md)', background: 'var(--dae-surface)', marginBottom: 16, fontSize: '13px', color: 'var(--dae-ink-secondary)' }}>
            将对 <strong>{fields.length}</strong> 个选中字段进行批量命名
          </div>
          <div className="dae-form-group">
            <label>命名模式</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setMode('append')}
                style={{
                  padding: '8px 16px', borderRadius: 'var(--dae-radius-md)',
                  border: `1px solid ${mode === 'append' ? 'var(--dae-primary)' : 'var(--dae-border-strong)'}`,
                  background: mode === 'append' ? 'var(--dae-primary-light)' : '#fff',
                  color: mode === 'append' ? 'var(--dae-primary)' : 'var(--dae-ink-secondary)',
                  cursor: 'pointer', fontSize: '13px',
                }}
              >
                追加前后缀
              </button>
              <button
                onClick={() => setMode('replace')}
                style={{
                  padding: '8px 16px', borderRadius: 'var(--dae-radius-md)',
                  border: `1px solid ${mode === 'replace' ? 'var(--dae-primary)' : 'var(--dae-border-strong)'}`,
                  background: mode === 'replace' ? 'var(--dae-primary-light)' : '#fff',
                  color: mode === 'replace' ? 'var(--dae-primary)' : 'var(--dae-ink-secondary)',
                  cursor: 'pointer', fontSize: '13px',
                }}
              >
                替换原名
              </button>
            </div>
          </div>
          {mode === 'append' ? (
            <>
              <div className="dae-form-group">
                <label>前缀</label>
                <input className="dae-input" placeholder="如：维度_" value={prefix} onChange={e => setPrefix(e.target.value)} />
              </div>
              <div className="dae-form-group">
                <label>后缀</label>
                <input className="dae-input" placeholder="如：_raw" value={suffix} onChange={e => setSuffix(e.target.value)} />
              </div>
            </>
          ) : (
            <div className="dae-form-group">
              <label>替换表达式</label>
              <input className="dae-input" placeholder="使用正则或字符串替换规则" />
              <div className="dae-form-hint">支持正则表达式替换，如将 snake_case 转为中文别名</div>
            </div>
          )}

          <div className="dae-form-group">
            <label>预览效果</label>
            <div style={{ maxHeight: 160, overflow: 'auto', border: '1px solid var(--dae-border)', borderRadius: 'var(--dae-radius-md)' }}>
              {fields.slice(0, 8).map((f, i) => (
                <div key={i} style={{ padding: '6px 12px', borderBottom: '1px solid var(--dae-border)', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span><code>{f.name}</code></span>
                  <span style={{ color: 'var(--dae-primary)' }}>
                    → {mode === 'append' ? `${prefix}${f.name}${suffix}` : `[新别名]`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="dae-drawer-footer">
          <button className="dae-btn dae-btn-secondary" onClick={onClose}>取消</button>
          <button className="dae-btn dae-btn-primary" onClick={onClose}>确认应用</button>
        </div>
      </div>
    </div>
  );
}
