import React, { useMemo, useState } from 'react';
import {
  Check,
  X,
  Search,
  Filter,
  Eye,
  ClipboardCheck,
  Bell,
  CheckCircle2,
  XCircle,
  BarChart3,
  LayoutDashboard,
  FileText,
  Monitor,
  Mail,
  MessageSquare,
  MessageCircle,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Drawer from '../components/Drawer';
import ChartRenderer from '../components/ChartRenderer';
import IconAction from '../components/IconAction';
import {
  getSubscribeApprovals,
  saveSubscribeApprovals,
  appendOperationLog,
  nextOperationLogId,
  tenants,
  users,
  resourceTypeLabel,
  pushChannelLabel,
  subscribeCycleLabel,
  subscribeScopeLabel,
  subscribeAuditStatusLabel,
  subscribeAuditStatusColor,
  chartSampleData,
  pieSampleData,
  approveAssigneeConfigs,
  type SubscribeApproval,
  type SubscribeAuditStatus,
} from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';

type StatusTab = SubscribeAuditStatus | 'all';

/** 判断当前用户是否可审核该订阅：超管可审核所有；普通用户需是该租户的指定审核人 */
function canAudit(item: SubscribeApproval, currentUserId: string, isSuperAdmin: boolean, tenantId: string): boolean {
  if (item.status !== 'pending') return false;
  if (isSuperAdmin) return true;
  // 普通用户：必须是该租户的审核人
  const cfg = approveAssigneeConfigs.find((c) => c.tenantId === tenantId);
  if (!cfg) return false;
  return cfg.assigneeIds.includes(currentUserId);
}

const statusTabs: { id: StatusTab; label: string; color: string }[] = [
  { id: 'pending', label: '待审核', color: 'orange' },
  { id: 'approved', label: '已通过', color: 'green' },
  { id: 'rejected', label: '已驳回', color: 'red' },
  { id: 'all', label: '全部', color: 'blue' },
];

const cycleColor: Record<string, string> = {
  daily: '#1677FF',
  weekly: '#722ED1',
  monthly: '#13C2C2',
};

const channelIcon = {
  email: <Mail size={12} />,
  message: <MessageSquare size={12} />,
  wecom: <MessageCircle size={12} />,
};

export default function SubscribeApprovePage() {
  const { currentUser, currentTenantId } = useAuth();
  const isSuperAdmin = !!currentUser.isSuperAdmin;
  const [activeTab, setActiveTab] = useState<StatusTab>('pending');
  const [keyword, setKeyword] = useState('');
  const [filterTenant, setFilterTenant] = useState('all');
  const [filterApplicant, setFilterApplicant] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detail, setDetail] = useState<SubscribeApproval | null>(null);
  const [rejectTarget, setRejectTarget] = useState<SubscribeApproval | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  // 用本地 state 接管 mock 列表（与数据门户、个人工作台共享同一份 localStorage 数据），便于触发刷新
  const [items, setItems] = useState<SubscribeApproval[]>(getSubscribeApprovals());

  const tenantName = (id: string) => tenants.find((t) => t.id === id)?.name || id;
  const userName = (id: string) => users.find((u) => u.id === id)?.name || id;

  const visibleItems = useMemo(() => {
    // 普通用户只能看到「自己作为审核人的租户」以及「自己申请的」
    const visible = isSuperAdmin
      ? items
      : items.filter((it) => {
          if (it.applicantId === currentUser.id) return true;
          const cf = approveAssigneeConfigs.find((c) => c.tenantId === it.tenantId);
          return cf?.assigneeIds.includes(currentUser.id);
        });
    return visible.filter((it) => {
      if (activeTab !== 'all' && it.status !== activeTab) return false;
      if (filterTenant !== 'all' && it.tenantId !== filterTenant) return false;
      if (filterApplicant !== 'all' && it.applicantId !== filterApplicant) return false;
      if (keyword) {
        const k = keyword.toLowerCase();
        if (
          !it.title.toLowerCase().includes(k) &&
          !it.id.toLowerCase().includes(k) &&
          !it.resourceName.toLowerCase().includes(k) &&
          !it.applicantName.toLowerCase().includes(k)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [items, activeTab, filterTenant, filterApplicant, keyword, isSuperAdmin, currentUser.id]);

  const stats = useMemo(() => {
    const pending = items.filter((i) => i.status === 'pending').length;
    const today = new Date().toISOString().slice(0, 10);
    const approvedToday = items.filter(
      (i) => i.status === 'approved' && i.auditRecords.some((r) => r.time.startsWith(today))
    ).length;
    const rejectedToday = items.filter(
      (i) => i.status === 'rejected' && i.auditRecords.some((r) => r.time.startsWith(today))
    ).length;
    return { pending, approvedToday, rejectedToday, total: items.length };
  }, [items]);

  // 当前列表中可批量审核的项
  const pendingInView = visibleItems.filter((i) => i.status === 'pending');
  const selectableIds = pendingInView.filter((i) => canAudit(i, currentUser.id, isSuperAdmin, i.tenantId)).map((i) => i.id);

  const toggleSelectAll = () => {
    if (selectedIds.length === selectableIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(selectableIds);
    }
  };
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const applyAudit = (ids: string[], action: 'approved' | 'rejected', comment?: string) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setItems((prev) => {
      const next = prev.map((it) => {
        if (!ids.includes(it.id)) return it;
        if (it.status !== 'pending') return it;
        const record = {
          operatorId: currentUser.id,
          operatorName: currentUser.name,
          action,
          comment: comment?.trim() || undefined,
          time: now,
        };
        return {
          ...it,
          status: (action === 'approved' ? 'approved' : 'rejected') as SubscribeApproval['status'],
          auditRecords: [...it.auditRecords, record],
        };
      });
      // 持久化，确保审核结果同步到个人工作台的订阅任务
      saveSubscribeApprovals(next);
      return next;
    });
    // 记录操作日志（溯源）：对每条从待审核变为已处理的申请写日志
    ids.forEach((id) => {
      const it = items.find((x) => x.id === id);
      if (it && it.status === 'pending') {
        appendOperationLog({
          id: nextOperationLogId(),
          user: currentUser.name,
          account: currentUser.email,
          module: '任务审核',
          menuId: 'subscribe-approve',
          action: action === 'approved' ? '审批通过' : '审批驳回',
          actionType: 'update',
          detail: `订阅申请「${it.resourceName}」${action === 'approved' ? '已通过' : '已驳回'}`,
          assetId: it.resourceId,
          assetType: it.resourceType as 'chart' | 'report' | 'dashboard' | 'screen',
          ip: '192.168.1.100',
          time: now,
        });
      }
    });
    setSelectedIds([]);
    setRejectTarget(null);
    setRejectComment('');
    if (detail && ids.includes(detail.id)) {
      setDetail((d) => (d ? { ...d, status: action === 'approved' ? 'approved' : 'rejected' } : d));
    }
  };

  const handleBatchApprove = () => {
    if (selectedIds.length === 0) return;
    applyAudit(selectedIds, 'approved');
  };

  const handleOpenDetail = (item: SubscribeApproval) => {
    setDetail(item);
  };

  const handleSingleApprove = () => {
    if (!detail) return;
    applyAudit([detail.id], 'approved');
  };

  const handleSingleReject = () => {
    if (!detail) return;
    setRejectTarget(detail);
  };

  const handleConfirmReject = () => {
    if (!rejectTarget) return;
    applyAudit([rejectTarget.id], 'rejected', rejectComment);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader
        title="任务审核"
        actions={
          <>
            <span style={{ fontSize: 13, color: 'var(--dae-ink-muted)', marginRight: 8 }}>
              处理租户内订阅、数据申请等需要审核的业务工单 · 仅管理员和审核人可处理
            </span>
            <span style={{ fontSize: 13, color: 'var(--dae-ink-muted)' }}>
              <ClipboardCheck size={14} style={{ verticalAlign: '-2px', marginRight: 4, color: 'var(--dae-primary)' }} />
              {stats.pending} 个待办
            </span>
          </>
        }
      />

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          {
            label: '待审核',
            value: stats.pending,
            color: '#fa8c16',
            icon: <Bell size={18} />,
          },
          { label: '今日通过', value: stats.approvedToday, color: '#16a34a', icon: <CheckCircle2 size={18} /> },
          { label: '今日驳回', value: stats.rejectedToday, color: '#dc2626', icon: <XCircle size={18} /> },
          { label: '累计工单', value: stats.total, color: '#1677ff', icon: <ClipboardCheck size={18} /> },
        ].map((c) => (
          <div
            key={c.label}
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: '16px 20px',
              border: '1px solid var(--dae-border)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: `${c.color}15`,
                color: c.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {c.icon}
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>{c.label}</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--dae-ink)', lineHeight: 1.4 }}>{c.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 状态 Tabs */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--dae-border)' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--dae-border)', padding: '0 20px' }}>
          {statusTabs.map((tab) => {
            const count =
              tab.id === 'all'
                ? items.length
                : items.filter((i) => i.status === tab.id).length;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedIds([]);
                }}
                style={{
                  padding: '14px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: active ? '2px solid var(--dae-primary)' : '2px solid transparent',
                  color: active ? 'var(--dae-primary)' : 'var(--dae-ink-secondary)',
                  fontWeight: active ? 600 : 400,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: -1,
                }}
              >
                {tab.label}
                <span
                  style={{
                    fontSize: 12,
                    background: active ? 'var(--dae-primary-light)' : 'var(--dae-surface-hover)',
                    color: active ? 'var(--dae-primary)' : 'var(--dae-ink-muted)',
                    borderRadius: 10,
                    padding: '1px 8px',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 筛选栏 */}
        <div style={{ padding: '14px 20px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '0 0 260px' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--dae-ink-muted)' }} />
            <input
              className="dae-input"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索申请编号 / 标题 / 申请人 / 资产名"
              style={{ paddingLeft: 30 }}
            />
          </div>
          <select className="dae-input" value={filterTenant} onChange={(e) => setFilterTenant(e.target.value)} style={{ flex: '0 0 160px' }}>
            <option value="all">全部租户</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select className="dae-input" value={filterApplicant} onChange={(e) => setFilterApplicant(e.target.value)} style={{ flex: '0 0 160px' }}>
            <option value="all">全部申请人</option>
            {Array.from(new Set(items.map((i) => i.applicantId))).map((id) => (
              <option key={id} value={id}>
                {userName(id)}
              </option>
            ))}
          </select>
          <span style={{ fontSize: 12, color: 'var(--dae-ink-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Filter size={12} /> 共 {visibleItems.length} 条
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button
              className="dae-btn dae-btn-primary"
              onClick={handleBatchApprove}
              disabled={selectedIds.length === 0}
              style={selectedIds.length === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
            >
              <Check size={14} style={{ marginRight: 4, verticalAlign: '-2px' }} />
              批量通过（{selectedIds.length}）
            </button>
          </div>
        </div>

        {/* 表格 */}
        <div style={{ overflowX: 'auto' }}>
          <table className="dae-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    checked={selectableIds.length > 0 && selectedIds.length === selectableIds.length}
                    onChange={toggleSelectAll}
                    disabled={selectableIds.length === 0}
                  />
                </th>
                <th>申请编号</th>
                <th>订阅名称</th>
                <th>订阅对象</th>
                <th>申请人</th>
                <th>租户</th>
                <th>订阅周期</th>
                <th>推送方式</th>
                <th>申请时间</th>
                <th>状态</th>
                <th style={{ width: 140 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: 32, color: 'var(--dae-ink-muted)' }}>
                    当前状态下暂无任务
                  </td>
                </tr>
              ) : (
                visibleItems.map((item) => {
                  const audit = canAudit(item, currentUser.id, isSuperAdmin, item.tenantId);
                  const selected = selectedIds.includes(item.id);
                  return (
                    <tr key={item.id} style={{ background: selected ? 'var(--dae-primary-light)' : undefined }}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selected}
                          disabled={!audit}
                          onChange={() => toggleSelect(item.id)}
                        />
                      </td>
                      <td style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: 'var(--dae-ink-muted)' }}>{item.id}</td>
                      <td>
                        <span style={{ fontWeight: 500 }}>{item.title}</span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <ResourceTypeIcon type={item.resourceType} />
                          {item.resourceName}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              width: 24, height: 24, borderRadius: '50%',
                              background: 'var(--dae-primary-light)', color: 'var(--dae-primary)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 12, fontWeight: 600,
                            }}
                          >
                            {item.applicantName.slice(0, 1)}
                          </span>
                          <div>
                            <div style={{ fontSize: 13 }}>{item.applicantName}</div>
                            <div style={{ fontSize: 11, color: 'var(--dae-ink-muted)' }}>{item.applicantDept}</div>
                          </div>
                        </div>
                      </td>
                      <td>{tenantName(item.tenantId)}</td>
                      <td>
                        <span
                          style={{
                            fontSize: 12,
                            color: cycleColor[item.cycle],
                            padding: '2px 8px',
                            borderRadius: 10,
                            background: `${cycleColor[item.cycle]}15`,
                          }}
                        >
                          {subscribeCycleLabel[item.cycle]}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                          {channelIcon[item.channel]}
                          {pushChannelLabel[item.channel]}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>{item.createdAt}</td>
                      <td>
                        <span
                          className={`dae-tag dae-tag-${subscribeAuditStatusColor[item.status]}`}
                          style={{ fontSize: 12 }}
                        >
                          {subscribeAuditStatusLabel[item.status]}
                        </span>
                      </td>
                      <td>
                        <div className="dae-table-actions">
                          <IconAction icon={<Eye size={16} />} label="查看详情" onClick={() => handleOpenDetail(item)} />
                          {audit && (
                            <>
                              <IconAction
                                icon={<Check size={16} />}
                                label="通过"
                                onClick={() => applyAudit([item.id], 'approved')}
                              />
                              <IconAction
                                icon={<X size={16} />}
                                label="驳回"
                                onClick={() => {
                                  setDetail(item);
                                  setRejectTarget(item);
                                }}
                              />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 详情 Drawer */}
      <Drawer
        open={!!detail}
        title={`订阅审核详情 · ${detail?.id || ''}`}
        onClose={() => setDetail(null)}
        width={720}
        footer={
          detail && detail.status === 'pending' && canAudit(detail, currentUser.id, isSuperAdmin, detail.tenantId) ? (
            <>
              <button
                className="dae-btn"
                style={{ color: '#dc2626', borderColor: '#dc2626' }}
                onClick={handleSingleReject}
              >
                <X size={14} style={{ marginRight: 4, verticalAlign: '-2px' }} />
                驳回
              </button>
              <button className="dae-btn dae-btn-primary" onClick={handleSingleApprove}>
                <Check size={14} style={{ marginRight: 4, verticalAlign: '-2px' }} />
                通过
              </button>
            </>
          ) : null
        }
      >
        {detail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* 基本信息 */}
            <Section title="基本信息">
              <InfoGrid
                items={[
                  { label: '申请编号', value: detail.id, mono: true },
                  { label: '订阅名称', value: detail.title },
                  { label: '申请人', value: detail.applicantName },
                  { label: '申请人部门', value: detail.applicantDept },
                  { label: '所属租户', value: tenantName(detail.tenantId) },
                  { label: '申请时间', value: detail.createdAt },
                  {
                    label: '当前状态',
                    value: (
                      <span className={`dae-tag dae-tag-${subscribeAuditStatusColor[detail.status]}`}>
                        {subscribeAuditStatusLabel[detail.status]}
                      </span>
                    ),
                  },
                ]}
              />
              {detail.reason && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)', marginBottom: 4 }}>申请理由</div>
                  <div
                    style={{
                      padding: 12,
                      background: 'var(--dae-surface)',
                      borderRadius: 8,
                      fontSize: 13,
                      color: 'var(--dae-ink)',
                      borderLeft: '3px solid var(--dae-primary)',
                    }}
                  >
                    {detail.reason}
                  </div>
                </div>
              )}
            </Section>

            {/* 订阅配置 */}
            <Section title="订阅配置">
              <InfoGrid
                items={[
                  {
                    label: '订阅对象',
                    value: (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <ResourceTypeIcon type={detail.resourceType} />
                        {resourceTypeLabel[detail.resourceType]} · {detail.resourceName}
                      </span>
                    ),
                  },
                  { label: '订阅周期', value: subscribeCycleLabel[detail.cycle] },
                  { label: '数据范围', value: subscribeScopeLabel[detail.scope] },
                  { label: '推送方式', value: pushChannelLabel[detail.channel] },
                  { label: '接收方', value: detail.receiver, copyable: true },
                ]}
              />
            </Section>

            {/* 数据样例 */}
            <Section title="数据样例" extra="帮助审核人判断订阅内容是否符合预期">
              <SamplePreview resourceType={detail.resourceType} />
            </Section>

            {/* 审核记录 */}
            <Section title="审核记录">
              {detail.auditRecords.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--dae-ink-muted)', padding: '12px 0' }}>暂无审核记录</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {detail.auditRecords.map((r, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        gap: 10,
                        padding: '10px 12px',
                        background: r.action === 'approved' ? 'rgba(22,163,74,0.06)' : 'rgba(220,38,38,0.06)',
                        borderLeft: `3px solid ${r.action === 'approved' ? '#16a34a' : '#dc2626'}`,
                        borderRadius: 6,
                      }}
                    >
                      {r.action === 'approved' ? (
                        <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
                      ) : (
                        <XCircle size={16} style={{ color: '#dc2626', flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13 }}>
                          <strong>{r.operatorName}</strong>
                          <span style={{ color: 'var(--dae-ink-muted)', margin: '0 6px' }}>·</span>
                          <span style={{ color: r.action === 'approved' ? '#16a34a' : '#dc2626' }}>
                            {r.action === 'approved' ? '审核通过' : '驳回'}
                          </span>
                          <span style={{ color: 'var(--dae-ink-muted)', margin: '0 6px' }}>·</span>
                          <span style={{ color: 'var(--dae-ink-muted)', fontSize: 12 }}>{r.time}</span>
                        </div>
                        {r.comment && (
                          <div style={{ fontSize: 13, color: 'var(--dae-ink-secondary)', marginTop: 4 }}>
                            {r.comment}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>
        )}
      </Drawer>

      {/* 驳回弹窗（共用 Modal） */}
      <RejectModal
        open={!!rejectTarget}
        target={rejectTarget}
        comment={rejectComment}
        onCommentChange={setRejectComment}
        onConfirm={handleConfirmReject}
        onClose={() => {
          setRejectTarget(null);
          setRejectComment('');
        }}
      />
    </div>
  );
}

/* ========== 内部小组件 ========== */

function ResourceTypeIcon({ type }: { type: 'chart' | 'dashboard' | 'report' | 'screen' }) {
  const cls = 'var(--dae-primary)';
  if (type === 'chart') return <BarChart3 size={14} style={{ color: cls }} />;
  if (type === 'dashboard') return <LayoutDashboard size={14} style={{ color: cls }} />;
  if (type === 'report') return <FileText size={14} style={{ color: cls }} />;
  return <Monitor size={14} style={{ color: cls }} />;
}

function Section({ title, extra, children }: { title: string; extra?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--dae-surface)', borderRadius: 10, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--dae-ink)' }}>{title}</h4>
        {extra && <span style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>{extra}</span>}
      </div>
      {children}
    </div>
  );
}

function InfoGrid({ items }: { items: { label: string; value: React.ReactNode; mono?: boolean; copyable?: boolean }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>{it.label}</span>
          <span style={{ fontSize: 13, fontFamily: it.mono ? 'ui-monospace, monospace' : undefined, wordBreak: 'break-all' }}>
            {it.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/** 数据样例：按订阅资产类型渲染「可视化预览 + 底层数据表」 */
function SamplePreview({ resourceType }: { resourceType: 'chart' | 'dashboard' | 'report' | 'screen' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* 1. 可视化预览 */}
      {resourceType === 'chart' && (
        <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid var(--dae-border)' }}>
          <div style={{ fontSize: 13, color: 'var(--dae-ink-muted)', marginBottom: 8 }}>
            可视化预览（订阅周期推送时附带的图表）
          </div>
          <ChartRenderer type="bar" data={chartSampleData} xKey="name" yKeys={['value']} height={220} />
        </div>
      )}
      {resourceType === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {['累计销售额', '新增用户', '订单数'].map((name, i) => (
              <div key={name} style={{ background: '#fff', borderRadius: 8, padding: 12, border: '1px solid var(--dae-border)' }}>
                <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>{name}</div>
                <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--dae-primary)', marginTop: 4 }}>
                  {([128400, 1268, 3820])[i]}
                </div>
                <div style={{ fontSize: 11, color: '#16a34a', marginTop: 2 }}>+{([12.4, 8.6, 4.2])[i]}% 较上周期</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#fff', borderRadius: 8, padding: 12, border: '1px solid var(--dae-border)' }}>
            <ChartRenderer type="line" data={chartSampleData} xKey="name" yKeys={['value', 'value2']} height={180} />
          </div>
        </div>
      )}
      {resourceType === 'report' && (
        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid var(--dae-border)', overflow: 'hidden' }}>
          <div style={{ fontSize: 13, color: 'var(--dae-ink-muted)', padding: 12, borderBottom: '1px solid var(--dae-border)' }}>
            报表示例（区域透视）
          </div>
          <ChartRenderer type="bar" data={chartSampleData} xKey="name" yKeys={['value']} height={180} />
        </div>
      )}
      {resourceType === 'screen' && (
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
            borderRadius: 8,
            padding: 24,
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600 }}>618 大促数据大屏预览</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: '实时销售额', value: '¥ 8,245,320' },
              { label: '实时订单数', value: '52,148' },
              { label: '在线用户', value: '124,560' },
              { label: '转化率', value: '4.62%' },
            ].map((m) => (
              <div key={m.label} style={{ background: 'rgba(255,255,255,0.08)', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 11, opacity: 0.7 }}>{m.label}</div>
                <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4 }}>{m.value}</div>
              </div>
            ))}
          </div>
          <ChartRenderer type="area" data={chartSampleData} xKey="name" yKeys={['value']} height={180} />
        </div>
      )}

      {/* 2. 底层数据样例（按订阅对象类型展示字段表 + 前 N 行） */}
      <DataPreviewTable resourceType={resourceType} />
    </div>
  );
}

/** 底层数据表：按资产类型给出"审核人会收到的"字段+若干行示例数据 */
function DataPreviewTable({ resourceType }: { resourceType: 'chart' | 'dashboard' | 'report' | 'screen' }) {
  if (resourceType === 'chart') {
    // 图表对应：分类 / 上周期值 / 本周期值 / 环比
    const cols = [
      { key: 'name', title: '类别' },
      { key: 'prev', title: '上周期值' },
      { key: 'curr', title: '本周期值' },
      { key: 'growth', title: '环比' },
    ];
    const rows = chartSampleData.map((d) => {
      const prev = d.value2;
      const curr = d.value;
      const delta = ((curr - prev) / prev) * 100;
      return {
        name: d.name,
        prev: prev.toLocaleString(),
        curr: curr.toLocaleString(),
        growth: `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`,
        positive: delta >= 0,
      };
    });
    return (
      <PreviewTableView
        title="底层数据（每个订阅周期附带推送的字段示例）"
        columns={cols}
        rows={rows}
        extraTag="柱状图原始数据"
      />
    );
  }

  if (resourceType === 'dashboard') {
    // 仪表盘对应：指标 / 累计值 / 较上周期 / 趋势
    const cols = [
      { key: 'name', title: '指标模块' },
      { key: 'value', title: '累计值' },
      { key: 'target', title: '目标值' },
      { key: 'rate', title: '完成率' },
    ];
    const metrics = [
      { name: '累计销售额', value: '¥ 1,284,000', target: '¥ 1,500,000', rate: 85.6 },
      { name: '新增用户', value: '1,268', target: '1,500', rate: 84.5 },
      { name: '订单数', value: '3,820', target: '4,000', rate: 95.5 },
      { name: '客单价', value: '¥ 336', target: '¥ 350', rate: 96.0 },
      { name: '复购率', value: '32.4%', target: '30.0%', rate: 108.0 },
    ];
    return (
      <PreviewTableView
        title="底层数据（仪表盘各指标对应数据行）"
        columns={cols}
        rows={metrics}
        extraTag="仪表盘数据"
      />
    );
  }

  if (resourceType === 'report') {
    // 报表对应：地区 / 销售额 / 订单数 / 同比增长
    const cols = [
      { key: 'region', title: '地区' },
      { key: 'orderNum', title: '订单数' },
      { key: 'amount', title: '销售额' },
      { key: 'growth', title: '同比' },
    ];
    const rows = [
      { region: '华东', orderNum: 1280, amount: '¥ 385,200', growth: '+12.4%' },
      { region: '华北', orderNum: 980, amount: '¥ 268,400', growth: '+8.2%' },
      { region: '华南', orderNum: 1620, amount: '¥ 472,000', growth: '+15.1%' },
      { region: '西南', orderNum: 540, amount: '¥ 138,600', growth: '-2.1%' },
      { region: '东北', orderNum: 410, amount: '¥ 102,300', growth: '+4.0%' },
      { region: '西北', orderNum: 320, amount: '¥ 86,500', growth: '+6.8%' },
      { region: '中部', orderNum: 760, amount: '¥ 198,200', growth: '+10.5%' },
    ];
    return (
      <PreviewTableView
        title="底层数据（报表前若干行 + 全部字段）"
        columns={cols}
        rows={rows}
        extraTag={`共 ${rows.length} 行示例`}
      />
    );
  }

  // screen
  const cols = [
    { key: 'name', title: '指标' },
    { key: 'value', title: '实时值' },
    { key: 'yesterday', title: '昨日同期' },
    { key: 'change', title: '变化' },
  ];
  const rows = [
    { name: '实时销售额', value: '¥ 8,245,320', yesterday: '¥ 7,860,200', change: '+4.9%', positive: true },
    { name: '实时订单数', value: '52,148', yesterday: '49,820', change: '+4.7%', positive: true },
    { name: '在线用户', value: '124,560', yesterday: '118,300', change: '+5.3%', positive: true },
    { name: '转化率', value: '4.62%', yesterday: '4.81%', change: '-3.9%', positive: false },
    { name: '客单价', value: '¥ 158.20', yesterday: '¥ 157.80', change: '+0.3%', positive: true },
  ];
  return (
    <PreviewTableView
      title="底层数据（大屏指标对应数据行 · 实时刷新）"
      columns={cols}
      rows={rows}
      extraTag="数据大屏字段"
    />
  );
}

/** 通用：底层数据表格视图 */
function PreviewTableView({
  title,
  extraTag,
  columns,
  rows,
}: {
  title: string;
  extraTag?: string;
  columns: { key: string; title: string }[];
  rows: Record<string, any>[];
}) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 8,
        border: '1px solid var(--dae-border)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          borderBottom: '1px solid var(--dae-border)',
          background: 'var(--dae-surface)',
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--dae-ink)' }}>
          {title}
        </div>
        {extraTag && (
          <span
            style={{
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 10,
              background: 'var(--dae-primary-light)',
              color: 'var(--dae-primary)',
            }}
          >
            {extraTag}
          </span>
        )}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="dae-table" style={{ width: '100%', margin: 0 }}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key}>{c.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {columns.map((c) => {
                  const v = r[c.key];
                  let styled: React.CSSProperties | undefined;
                  let display: React.ReactNode = v;
                  if (c.key === 'growth' || c.key === 'rate' || c.key === 'change') {
                    const isNegative =
                      typeof v === 'number' ? v < 0 : typeof v === 'string' ? v.startsWith('-') : false;
                    styled = { color: isNegative ? '#dc2626' : '#16a34a' };
                    if (c.key === 'rate' && typeof v === 'number') display = `${v}%`;
                  }
                  return (
                    <td key={c.key} style={styled}>
                      {display}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** 简单的驳回二次确认弹窗 */
function RejectModal({
  open,
  target,
  comment,
  onCommentChange,
  onConfirm,
  onClose,
}: {
  open: boolean;
  target: SubscribeApproval | null;
  comment: string;
  onCommentChange: (v: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open || !target) return null;
  return (
    <>
      <div className="dae-drawer-overlay" onClick={onClose} style={{ zIndex: 1100 }} />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 460,
          background: '#fff',
          borderRadius: 12,
          boxShadow: 'var(--dae-shadow-lg)',
          zIndex: 1101,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--dae-border)' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>驳回订阅申请</h3>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ fontSize: 13, color: 'var(--dae-ink-secondary)', marginBottom: 16 }}>
            将驳回 <strong>{target.title}</strong>（{target.id}）。理由会展示给申请人，便于其修改后重新提交。
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--dae-ink)' }}>
              驳回原因<span style={{ color: 'var(--dae-ink-muted)', fontWeight: 400 }}>（可选）</span>
            </label>
            <textarea
              className="dae-input"
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder="简要说明驳回原因"
              rows={4}
              style={{ resize: 'vertical', minHeight: 80 }}
            />
          </div>
        </div>
        <div style={{ padding: '12px 24px', borderTop: '1px solid var(--dae-border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="dae-btn dae-btn-secondary" onClick={onClose}>
            取消
          </button>
          <button
            className="dae-btn"
            style={{ color: '#dc2626', borderColor: '#dc2626' }}
            onClick={onConfirm}
          >
            <X size={14} style={{ marginRight: 4, verticalAlign: '-2px' }} />
            确认驳回
          </button>
        </div>
      </div>
    </>
  );
}
