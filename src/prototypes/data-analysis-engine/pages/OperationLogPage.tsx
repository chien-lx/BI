import React, { useMemo, useState } from 'react';
import { ClipboardList, Download, Eye, FileSpreadsheet, Folder, Search, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Drawer from '../components/Drawer';
import IconAction from '../components/IconAction';
import DatePicker from '../components/DatePicker';
import { operationLogs, menuTree, type OperationLog, type OperationActionType } from '../data/mockData';
import * as XLSX from 'xlsx';

const actionTypeOptions: { value: OperationActionType | ''; label: string }[] = [
  { value: '', label: '全部操作' },
  { value: 'create', label: '创建' },
  { value: 'update', label: '更新' },
  { value: 'delete', label: '删除' },
  { value: 'publish', label: '发布' },
  { value: 'download', label: '下载' },
  { value: 'export', label: '导出' },
  { value: 'login', label: '登录' },
  { value: 'other', label: '其他' },
];

const actionTypeLabel = (type: OperationActionType) =>
  actionTypeOptions.find((o) => o.value === type)?.label || type;

const actionTypeBadgeClass = (type: OperationActionType) => {
  switch (type) {
    case 'create':
      return 'dae-tag-green';
    case 'update':
      return 'dae-tag-blue';
    case 'delete':
      return 'dae-tag-red';
    case 'publish':
      return 'dae-tag-purple';
    case 'download':
    case 'export':
      return 'dae-tag-orange';
    case 'login':
      return 'dae-tag-gray';
    default:
      return 'dae-tag-blue';
  }
};

const formatJson = (value: unknown) => JSON.stringify(value, null, 2);

/** 每个菜单可执行的操作类型（操作类型枚举与具体菜单对齐） */
const menuActionTypeMap: Record<string, OperationActionType[]> = {
  'data-portal': ['login', 'other'],
  'datasource': ['create', 'update', 'delete'],
  'dataset': ['create', 'update', 'delete'],
  'self-service': ['download', 'export'],
  'data-explore': ['create', 'update', 'delete', 'download', 'export'],
  'chart': ['create', 'update', 'delete', 'publish'],
  'report': ['create', 'update', 'delete', 'publish', 'export'],
  'dashboard': ['create', 'update', 'delete', 'publish'],
  'data-screen': ['create', 'update', 'delete', 'publish'],
  'user-manage': ['create', 'update', 'delete'],
  'role-manage': ['create', 'update', 'delete'],
  'operation-log': ['download', 'export'],
  'tenant-manage': ['create', 'update', 'delete'],
  'metric-monitor': ['create', 'update', 'delete'],
};

export default function OperationLogPage() {
  const [userName, setUserName] = useState('');
  const [account, setAccount] = useState('');
  const [actionType, setActionType] = useState<OperationActionType | ''>('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedMenuId, setSelectedMenuId] = useState<string>('');
  const [detailLog, setDetailLog] = useState<OperationLog | null>(null);

  const filtered = useMemo(() => {
    return operationLogs.filter((item) => {
      if (selectedMenuId && item.menuId !== selectedMenuId) return false;
      if (userName && !item.user.includes(userName)) return false;
      if (account && !item.account.toLowerCase().includes(account.toLowerCase())) return false;
      if (actionType && item.actionType !== actionType) return false;
      if (startTime && item.time < `${startTime} 00:00:00`) return false;
      if (endTime && item.time > `${endTime} 23:59:59`) return false;
      return true;
    });
  }, [userName, account, actionType, startTime, endTime, selectedMenuId]);

  const availableActionTypes = useMemo(() => {
    const set = new Set<OperationActionType>();
    if (selectedMenuId) {
      (menuActionTypeMap[selectedMenuId] || []).forEach((t) => set.add(t));
    } else {
      // 未选菜单时展示所有菜单可能涉及的操作类型
      Object.values(menuActionTypeMap).forEach((types) => types.forEach((t) => set.add(t)));
    }
    return Array.from(set);
  }, [selectedMenuId]);

  const handleExport = () => {
    const rows = filtered.map((item) => ({
      用户: item.user,
      账号: item.account,
      模块: item.module,
      操作: item.action,
      操作类型: actionTypeLabel(item.actionType),
      详情: item.detail,
      IP地址: item.ip,
      时间: item.time,
      变更前: item.before ? JSON.stringify(item.before) : '',
      变更后: item.after ? JSON.stringify(item.after) : '',
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '操作日志');
    const filename = `操作日志_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  const resetFilters = () => {
    setUserName('');
    setAccount('');
    setActionType('');
    setStartTime('');
    setEndTime('');
    setSelectedMenuId('');
  };

  return (
    <div>
      <PageHeader
        title="操作日志"
        breadcrumb="系统管理 / 操作日志"
        actions={
          <button className="dae-btn dae-btn-primary" onClick={handleExport}>
            <Download size={16} />
            导出 Excel
          </button>
        }
      />

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {/* 左侧菜单目录树 */}
        <div
          style={{
            width: 220,
            flexShrink: 0,
            background: '#fff',
            borderRadius: 'var(--dae-radius-lg)',
            border: '1px solid var(--dae-border)',
            padding: '16px 12px',
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 12 }}>
            菜单目录
          </div>
          <div
            onClick={() => setSelectedMenuId('')}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 10px',
              borderRadius: 6,
              cursor: 'pointer',
              background: selectedMenuId === '' ? 'var(--dae-primary-light)' : 'transparent',
              color: selectedMenuId === '' ? 'var(--dae-primary)' : 'var(--dae-ink)',
              fontSize: 13,
              fontWeight: selectedMenuId === '' ? 500 : 400,
              marginBottom: 4,
            }}
          >
            <span>全部菜单</span>
          </div>
          {menuTree.map((group) => (
            <div key={group.label} style={{ marginTop: 14 }}>
              {/* 一级目录：不可点击，视觉突出 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  color: 'var(--dae-ink-secondary)',
                  fontWeight: 600,
                  padding: '8px 10px',
                  borderRadius: 6,
                  background: 'var(--dae-surface)',
                  userSelect: 'none',
                }}
              >
                <Folder size={14} style={{ color: 'var(--dae-ink-muted)' }} />
                <span>{group.label}</span>
              </div>
              {/* 二级菜单：缩进、可点击 */}
              <div style={{ position: 'relative', paddingLeft: 14, marginTop: 4 }}>
                {/* 左侧竖向引导线 */}
                <div
                  style={{
                    position: 'absolute',
                    left: 6,
                    top: 0,
                    bottom: 0,
                    width: 1,
                    background: 'var(--dae-border)',
                  }}
                />
                {group.items.map((item) => {
                  const active = selectedMenuId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedMenuId(item.id);
                        setActionType('');
                      }}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '7px 10px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        background: active ? 'var(--dae-primary-light)' : 'transparent',
                        color: active ? 'var(--dae-primary)' : 'var(--dae-ink)',
                        fontSize: 13,
                        marginBottom: 2,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        if (!active) e.currentTarget.style.background = 'var(--dae-surface)';
                      }}
                      onMouseLeave={(e) => {
                        if (!active) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {/* 横向连接短线 */}
                      <div
                        style={{
                          position: 'absolute',
                          left: -8,
                          top: '50%',
                          width: 6,
                          height: 1,
                          background: 'var(--dae-border)',
                        }}
                      />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 右侧主内容 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* 筛选栏 */}
          <div
            style={{
              background: '#fff',
              borderRadius: 'var(--dae-radius-lg)',
              border: '1px solid var(--dae-border)',
              padding: 16,
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 160 }}>
                <Search size={16} style={{ color: 'var(--dae-ink-secondary)' }} />
                <input
                  className="dae-input"
                  placeholder="人员名称"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
              <input
                className="dae-input"
                placeholder="账号名称"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                style={{ flex: 1, minWidth: 160 }}
              />
              <select
                className="dae-input"
                value={actionType}
                onChange={(e) => setActionType(e.target.value as OperationActionType | '')}
                style={{ flex: 1, minWidth: 140 }}
              >
                <option value="">全部操作</option>
                {availableActionTypes.map((t) => (
                  <option key={t} value={t}>
                    {actionTypeLabel(t)}
                  </option>
                ))}
              </select>
              <DatePicker
                value={startTime}
                onChange={setStartTime}
                placeholder="开始时间"
                style={{ flex: 1, minWidth: 140 }}
              />
              <span style={{ color: 'var(--dae-ink-secondary)', fontSize: 13 }}>至</span>
              <DatePicker
                value={endTime}
                onChange={setEndTime}
                placeholder="结束时间"
                style={{ flex: 1, minWidth: 140 }}
              />
              <button
                className="dae-btn dae-btn-secondary"
                onClick={resetFilters}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <X size={14} />
                重置
              </button>
            </div>
          </div>

          {/* 日志表格 */}
          <div style={{ background: '#fff', borderRadius: 'var(--dae-radius-lg)', border: '1px solid var(--dae-border)', overflow: 'hidden' }}>
            <table className="dae-table">
              <thead>
                <tr>
                  <th>用户</th>
                  <th>账号</th>
                  <th>模块</th>
                  <th>操作</th>
                  <th>详情</th>
                  <th>IP 地址</th>
                  <th>时间</th>
                  <th style={{ width: 90 }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ClipboardList size={16} style={{ color: 'var(--dae-primary)' }} />
                        <span style={{ fontWeight: 500 }}>{item.user}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--dae-ink-secondary)' }}>{item.account}</td>
                    <td>
                      <span className="dae-tag dae-tag-blue">{item.module}</span>
                    </td>
                    <td>
                      <span className={`dae-tag ${actionTypeBadgeClass(item.actionType)}`}>{item.action}</span>
                    </td>
                    <td>{item.detail}</td>
                    <td>{item.ip}</td>
                    <td>{item.time}</td>
                    <td>
                      <IconAction icon={<Eye size={16} />} label="详情" onClick={() => setDetailLog(item)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="dae-empty">
                <ClipboardList size={40} />
                <p>暂无操作日志</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 详情 Drawer */}
      <Drawer open={!!detailLog} title="操作日志详情" onClose={() => setDetailLog(null)} width={600}>
        {detailLog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <section>
              <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: 'var(--dae-ink)' }}>基本信息</h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr',
                  gap: '10px 16px',
                  fontSize: 14,
                  color: 'var(--dae-ink)',
                }}
              >
                <span style={{ color: 'var(--dae-ink-secondary)' }}>用户</span>
                <span>{detailLog.user}</span>
                <span style={{ color: 'var(--dae-ink-secondary)' }}>账号</span>
                <span>{detailLog.account}</span>
                <span style={{ color: 'var(--dae-ink-secondary)' }}>模块</span>
                <span>{detailLog.module}</span>
                <span style={{ color: 'var(--dae-ink-secondary)' }}>操作</span>
                <span>
                  <span className={`dae-tag ${actionTypeBadgeClass(detailLog.actionType)}`}>{detailLog.action}</span>
                </span>
                <span style={{ color: 'var(--dae-ink-secondary)' }}>详情</span>
                <span>{detailLog.detail}</span>
                <span style={{ color: 'var(--dae-ink-secondary)' }}>IP 地址</span>
                <span>{detailLog.ip}</span>
                <span style={{ color: 'var(--dae-ink-secondary)' }}>时间</span>
                <span>{detailLog.time}</span>
              </div>
            </section>

            {(detailLog.before || detailLog.after) && (
              <section>
                <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: 'var(--dae-ink)' }}>变更内容</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {detailLog.before && (
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--dae-ink-secondary)', marginBottom: 6 }}>变更前</div>
                      <pre
                        style={{
                          margin: 0,
                          padding: 12,
                          borderRadius: 8,
                          background: 'var(--dae-surface)',
                          border: '1px solid var(--dae-border)',
                          fontSize: 13,
                          color: 'var(--dae-ink)',
                          overflow: 'auto',
                          maxHeight: 240,
                        }}
                      >
                        {formatJson(detailLog.before)}
                      </pre>
                    </div>
                  )}
                  {detailLog.after && (
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--dae-ink-secondary)', marginBottom: 6 }}>变更后</div>
                      <pre
                        style={{
                          margin: 0,
                          padding: 12,
                          borderRadius: 8,
                          background: 'var(--dae-primary-light)',
                          border: '1px solid var(--dae-primary-light)',
                          fontSize: 13,
                          color: 'var(--dae-ink)',
                          overflow: 'auto',
                          maxHeight: 240,
                        }}
                      >
                        {formatJson(detailLog.after)}
                      </pre>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
