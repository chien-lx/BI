import React, { useMemo, useState } from 'react';
import {
  Check,
  X,
  Search,
  Eye,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  BarChart3,
  LayoutDashboard,
  FileText,
  Monitor,
  ShieldCheck,
  Send,
  UserPlus,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Drawer from '../components/Drawer';
import ChartRenderer from '../components/ChartRenderer';
import IconAction from '../components/IconAction';
import {
  getPermissionApplications,
  savePermissionApplications,
  permissionApplications,
  chartSampleData,
  pieSampleData,
  users,
  approveAssigneeConfigs,
  appendOperationLog,
  nextOperationLogId,
  type PermissionApplication,
  type PermissionApplyStatus,
  type PermissionApplySource,
  type AssetPermissionLevel,
} from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';

const assetTypeLabel: Record<string, string> = {
  chart: '图表',
  report: '报表',
  dashboard: '仪表盘',
  screen: '数据大屏',
};

type StatusTab = PermissionApplyStatus | 'all';

const assetIcon: Record<string, React.ElementType> = {
  chart: BarChart3,
  report: FileText,
  dashboard: LayoutDashboard,
  screen: Monitor,
};

const assetPreviewData = (assetType: string) =>
  assetType === 'chart' || assetType === 'screen' || assetType === 'dashboard'
    ? pieSampleData
    : chartSampleData;

const statusTabs: { id: StatusTab; label: string; color: string }[] = [
  { id: 'pending', label: '待审核', color: 'orange' },
  { id: 'approved', label: '已通过', color: 'green' },
  { id: 'rejected', label: '已驳回', color: 'red' },
  { id: 'all', label: '全部', color: 'blue' },
];

const statusBadge: Record<PermissionApplyStatus, { label: string; cls: string }> = {
  pending: { label: '待审核', cls: 'dae-tag dae-tag-orange' },
  approved: { label: '已通过', cls: 'dae-tag dae-tag-green' },
  rejected: { label: '已驳回', cls: 'dae-tag dae-tag-red' },
};

const sourceLabel: Record<PermissionApplySource, string> = {
  apply: '权限申请',
  share: '主动分享',
};

const permissionLabel: Record<AssetPermissionLevel, string> = {
  view: '仅查看',
  manage: '查看并管理',
};

const nowStr = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

export default function PermissionApprovePage() {
  const { currentUser, currentTenantId } = useAuth();
  const isSuperAdmin = !!currentUser.isSuperAdmin;

  const [items, setItems] = useState<PermissionApplication[]>(getPermissionApplications());
  const [tab, setTab] = useState<StatusTab>('pending');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<PermissionApplication | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [rejectTarget, setRejectTarget] = useState<PermissionApplication | null>(null);
  const [rejectComment, setRejectComment] = useState('');

  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), []);

  /** 当前用户是否可审核该申请：超管可审核所有；普通用户需是该租户配置的审核人 */
  const canAudit = (item: PermissionApplication): boolean => {
    if (item.status !== 'pending') return false;
    if (isSuperAdmin) return true;
    const cfg = approveAssigneeConfigs.find((c) => c.tenantId === currentTenantId);
    if (!cfg) return false;
    return cfg.assigneeIds.includes(currentUser.id);
  };

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (tab !== 'all' && it.status !== tab) return false;
      if (!search) return true;
      const k = search.toLowerCase();
      return (
        it.assetName.toLowerCase().includes(k) ||
        it.applicantName.toLowerCase().includes(k) ||
        it.id.toLowerCase().includes(k)
      );
    });
  }, [items, tab, search]);

  const pendingCount = useMemo(() => items.filter((i) => i.status === 'pending').length, [items]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const applyAudit = (ids: string[], action: 'approved' | 'rejected', comment?: string) => {
    const time = nowStr();
    setItems((prev) =>
      prev.map((it) => {
        if (!ids.includes(it.id)) return it;
        if (it.status !== 'pending') return it;
        const record = {
          operatorId: currentUser.id,
          operatorName: currentUser.name,
          action,
          comment: comment?.trim() || undefined,
          time,
        };
        const next: PermissionApplication = {
          ...it,
          status: action === 'approved' ? 'approved' : 'rejected',
          auditRecords: [...it.auditRecords, record],
        };
        // 记录操作日志（溯源）
        appendOperationLog({
          id: nextOperationLogId(),
          user: currentUser.name,
          account: currentUser.email,
          module: '权限审核',
          menuId: 'permission-approve',
          action: action === 'approved' ? '审批通过' : '审批驳回',
          actionType: 'update',
          detail: `${sourceLabel[it.source]}「${it.assetName}」权限（${permissionLabel[it.permission]}）${action === 'approved' ? '已通过' : '已驳回'}`,
          assetId: it.assetId,
          assetType: it.assetType,
          ip: '192.168.1.100',
          time,
        });
        return next;
      })
    );
    savePermissionApplications(items);
    setSelectedIds([]);
    setRejectTarget(null);
    setRejectComment('');
    if (detail && ids.includes(detail.id)) {
      setDetail((d) => (d ? { ...d, status: action === 'approved' ? 'approved' : 'rejected' } : d));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader
        title="权限审核"
        breadcrumb="流程审批 / 权限审核"
        actions={
          <span style={{ fontSize: 13, color: 'var(--dae-ink-muted)' }}>
            待审核 <strong style={{ color: 'var(--dae-warning)' }}>{pendingCount}</strong> 条
            {!isSuperAdmin && ' · 仅展示您作为审核人的租户'}
          </span>
        }
      />

      {/* 状态 Tab + 搜索 */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--dae-border)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {statusTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={tab === t.id ? 'dae-btn dae-btn-primary' : 'dae-btn dae-btn-secondary'}
              style={{ padding: '6px 14px' }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', flex: 1, minWidth: 200, marginLeft: 'auto' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--dae-ink-muted)' }} />
          <input
            className="dae-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索资产名称 / 申请人 / 申请编号"
            style={{ paddingLeft: 30 }}
          />
        </div>
      </div>

      {/* 批量操作 */}
      {selectedIds.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--dae-primary-light)', borderRadius: 10, padding: '8px 14px' }}>
          <span style={{ fontSize: 13, color: 'var(--dae-primary)' }}>已选 {selectedIds.length} 条</span>
          <button className="dae-btn dae-btn-primary" style={{ padding: '4px 12px' }} onClick={() => applyAudit(selectedIds, 'approved')}>
            <Check size={14} style={{ marginRight: 4, verticalAlign: '-2px' }} />
            批量通过
          </button>
          <button className="dae-btn dae-btn-secondary" style={{ padding: '4px 12px' }} onClick={() => setSelectedIds([])}>
            取消选择
          </button>
        </div>
      )}

      {/* 列表 */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--dae-border)', overflow: 'hidden' }}>
        <table className="dae-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: 40 }}></th>
              <th>申请编号</th>
              <th>类型</th>
              <th>关联资产</th>
              <th>申请人 / 分享人</th>
              <th>权限</th>
              <th>提交时间</th>
              <th>状态</th>
              <th style={{ width: 140 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: 36, color: 'var(--dae-ink-muted)' }}>
                  <ClipboardCheck size={32} style={{ opacity: 0.4 }} />
                  <div style={{ marginTop: 8 }}>暂无{statusTabs.find((t) => t.id === tab)?.label}的权限申请</div>
                </td>
              </tr>
            ) : (
              filtered.map((it) => {
                const Icon = assetIcon[it.assetType] || BarChart3;
                const targetNames = it.targetUserIds.map((id) => userById.get(id)?.name).filter(Boolean);
                const audit = canAudit(it);
                return (
                  <tr key={it.id}>
                    <td>
                      {audit && (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(it.id)}
                          onChange={() => toggleSelect(it.id)}
                        />
                      )}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--dae-ink-secondary)' }}>{it.id}</td>
                    <td>
                      <span className="dae-tag dae-tag-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {it.source === 'share' ? <Send size={12} /> : <UserPlus size={12} />}
                        {sourceLabel[it.source]}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon size={15} style={{ color: 'var(--dae-primary)' }} />
                        <span style={{ fontWeight: 500 }}>{it.assetName}</span>
                        <span style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>{assetTypeLabel[it.assetType]}</span>
                      </div>
                    </td>
                    <td>
                      <div>{it.applicantName}</div>
                      {it.source === 'share' && targetNames.length > 0 && (
                        <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>
                          分享给：{targetNames.join('、')}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={it.permission === 'manage' ? 'dae-tag dae-tag-purple' : 'dae-tag dae-tag-gray'}>
                        {permissionLabel[it.permission]}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--dae-ink-secondary)' }}>{it.createdAt}</td>
                    <td>
                      <span className={statusBadge[it.status].cls}>{statusBadge[it.status].label}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <IconAction icon={<Eye size={16} />} label="详情" onClick={() => setDetail(it)} />
                        {audit && (
                          <>
                            <IconAction icon={<Check size={16} />} label="通过" onClick={() => applyAudit([it.id], 'approved')} />
                            <IconAction icon={<X size={16} />} label="驳回" onClick={() => setRejectTarget(it)} />
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

      {/* 详情 Drawer */}
      <Drawer open={!!detail} title="权限申请详情" onClose={() => setDetail(null)} width={600}>
        {detail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <section>
              <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: 'var(--dae-ink)' }}>基本信息</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: '10px 16px', fontSize: 14, color: 'var(--dae-ink)' }}>
                <span style={{ color: 'var(--dae-ink-secondary)' }}>申请编号</span>
                <span>{detail.id}</span>
                <span style={{ color: 'var(--dae-ink-secondary)' }}>类型</span>
                <span>{sourceLabel[detail.source]}</span>
                <span style={{ color: 'var(--dae-ink-secondary)' }}>关联资产</span>
                <span>{detail.assetName}（{assetTypeLabel[detail.assetType]}）</span>
                <span style={{ color: 'var(--dae-ink-secondary)' }}>{detail.source === 'share' ? '分享人' : '申请人'}</span>
                <span>{detail.applicantName}</span>
                {detail.source === 'share' && (
                  <>
                    <span style={{ color: 'var(--dae-ink-secondary)' }}>分享给</span>
                    <span>
                      {detail.targetUserIds
                        .map((id) => userById.get(id)?.name)
                        .filter(Boolean)
                        .join('、') || '—'}
                    </span>
                  </>
                )}
                <span style={{ color: 'var(--dae-ink-secondary)' }}>申请权限</span>
                <span>{permissionLabel[detail.permission]}</span>
                <span style={{ color: 'var(--dae-ink-secondary)' }}>申请理由</span>
                <span>{detail.reason || '—'}</span>
                <span style={{ color: 'var(--dae-ink-secondary)' }}>提交时间</span>
                <span>{detail.createdAt}</span>
                <span style={{ color: 'var(--dae-ink-secondary)' }}>状态</span>
                <span className={statusBadge[detail.status].cls}>{statusBadge[detail.status].label}</span>
              </div>
            </section>

            {/* 资产预览 */}
            <section>
              <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: 'var(--dae-ink)' }}>资产预览</h4>
              <div style={{ background: '#fff', borderRadius: 'var(--dae-radius-lg)', border: '1px solid var(--dae-border)', padding: 16 }}>
                {detail.assetType === 'chart' ? (
                  <ChartRenderer type="bar" data={chartSampleData} yKeys={['value', 'value2']} height={220} />
                ) : (
                  <div className="dae-empty" style={{ padding: 24 }}>
                    {React.createElement(assetIcon[detail.assetType] || BarChart3, { size: 36 })}
                    <p style={{ marginTop: 8 }}>「{detail.assetName}」{assetTypeLabel[detail.assetType]}</p>
                  </div>
                )}
              </div>
            </section>

            {detail.auditRecords.length > 0 && (
              <section>
                <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: 'var(--dae-ink)' }}>审核记录</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {detail.auditRecords.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13 }}>
                      {r.action === 'approved' ? (
                        <CheckCircle2 size={16} style={{ color: '#52c41a', marginTop: 2, flexShrink: 0 }} />
                      ) : (
                        <XCircle size={16} style={{ color: '#ff4d4f', marginTop: 2, flexShrink: 0 }} />
                      )}
                      <div>
                        <div>
                          <strong>{r.operatorName}</strong> {r.action === 'approved' ? '通过了申请' : '驳回了申请'}
                          <span style={{ color: 'var(--dae-ink-muted)', marginLeft: 8 }}>{r.time}</span>
                        </div>
                        {r.comment && <div style={{ color: 'var(--dae-ink-secondary)', marginTop: 2 }}>意见：{r.comment}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {canAudit(detail) && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="dae-btn dae-btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => applyAudit([detail.id], 'approved')}>
                  <Check size={16} style={{ marginRight: 4 }} />
                  通过申请
                </button>
                <button className="dae-btn dae-btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setRejectTarget(detail)}>
                  <X size={16} style={{ marginRight: 4 }} />
                  驳回申请
                </button>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* 驳回原因 Modal */}
      <Drawer
        open={!!rejectTarget}
        title="驳回权限申请"
        onClose={() => setRejectTarget(null)}
        width={460}
        footer={
          <>
            <button className="dae-btn dae-btn-secondary" onClick={() => setRejectTarget(null)}>取消</button>
            <button
              className="dae-btn dae-btn-primary"
              disabled={!rejectComment.trim()}
              onClick={() => rejectTarget && applyAudit([rejectTarget.id], 'rejected', rejectComment)}
            >
              确认驳回
            </button>
          </>
        }
      >
        {rejectTarget && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--dae-ink-secondary)' }}>
              驳回：<strong>{rejectTarget.assetName}</strong>（{rejectTarget.applicantName} 的{sourceLabel[rejectTarget.source]}）
            </div>
            <textarea
              className="dae-input"
              rows={4}
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="请填写驳回理由，将反馈给申请人"
              style={{ resize: 'vertical' }}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}
