import React, { useMemo, useState } from 'react';
import {
  Plus,
  Building2,
  UserCog,
  Search,
  X,
  Check,
  AlertTriangle,
  Trash2,
  Shield,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Drawer from '../components/Drawer';
import {
  tenants,
  users,
  approveAssigneeConfigs as initialConfigs,
  type ApproveAssigneeConfig,
} from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';

export default function ApproveAssigneePage() {
  const { currentUser } = useAuth();
  const isSuperAdmin = !!currentUser.isSuperAdmin;

  const [configs, setConfigs] = useState<ApproveAssigneeConfig[]>(initialConfigs);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<{ tenant: typeof tenants[number]; selectedIds: string[] } | null>(null);

  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), []);

  const rows = useMemo(() => {
    return tenants.map((tenant) => {
      const cfg = configs.find((c) => c.tenantId === tenant.id);
      const assignees = cfg ? cfg.assigneeIds.map((id) => userById.get(id)).filter(Boolean) : [];
      return {
        tenant,
        assignees,
        updatedAt: cfg?.updatedAt || '—',
        updatedBy: cfg?.updatedById ? userById.get(cfg.updatedById) : null,
        configured: !!cfg,
      };
    });
  }, [configs, userById]);

  const filtered = useMemo(() => {
    if (!search) return rows;
    const k = search.toLowerCase();
    return rows.filter(
      (r) =>
        r.tenant.name.toLowerCase().includes(k) ||
        r.tenant.code.toLowerCase().includes(k) ||
        r.assignees.some((u) => u?.name.toLowerCase().includes(k))
    );
  }, [rows, search]);

  const openEdit = (tenant: typeof tenants[number]) => {
    const cfg = configs.find((c) => c.tenantId === tenant.id);
    setEditing({ tenant, selectedIds: cfg ? [...cfg.assigneeIds] : [] });
  };

  const toggleAssignee = (id: string) => {
    if (!editing) return;
    setEditing({
      ...editing,
      selectedIds: editing.selectedIds.includes(id)
        ? editing.selectedIds.filter((x) => x !== id)
        : [...editing.selectedIds, id],
    });
  };

  const handleSave = () => {
    if (!editing) return;
    setConfigs((prev) => {
      const filtered = prev.filter((c) => c.tenantId !== editing.tenant.id);
      return [
        ...filtered,
        {
          tenantId: editing.tenant.id,
          assigneeIds: editing.selectedIds,
          updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
          updatedById: currentUser.id,
        },
      ];
    });
    setEditing(null);
  };

  const handleClear = () => {
    if (!editing) return;
    setEditing({ ...editing, selectedIds: [] });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader
        title="审核人配置"
        actions={
          <>
            <span style={{ fontSize: 13, color: 'var(--dae-ink-muted)', marginRight: 8 }}>
              为每个租户配置订阅审核人员 · 仅管理员可设置
            </span>
            <span
              style={{
                fontSize: 13,
                color: isSuperAdmin ? 'var(--dae-primary)' : 'var(--dae-ink-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Shield size={14} />
              {isSuperAdmin ? '当前为管理员，已开启编辑权限' : '当前账号无编辑权限，仅可查看'}
            </span>
          </>
        }
      />

      {/* 权限与说明 */}
      {!isSuperAdmin && (
        <div
          style={{
            background: 'rgba(250,140,22,0.08)',
            border: '1px solid rgba(250,140,22,0.25)',
            borderRadius: 10,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}
        >
          <AlertTriangle size={18} style={{ color: '#fa8c16', flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 13, color: 'var(--dae-ink-secondary)' }}>
            <strong>权限说明：</strong>
            为避免管理员一人承担所有租户审核压力，仅超级管理员可以配置租户的审核人列表；普通用户如需调整，请联系管理员。
          </div>
        </div>
      )}

      {/* 主表格 */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--dae-border)' }}>
        {/* 筛选栏 */}
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', flex: '0 0 280px' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--dae-ink-muted)' }} />
            <input
              className="dae-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索租户名称、编码、审核人"
              style={{ paddingLeft: 30 }}
            />
          </div>
          <span style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>共 {filtered.length} 个租户</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="dae-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: 220 }}>租户空间</th>
                <th>审核人</th>
                <th style={{ width: 160 }}>最后修改</th>
                <th style={{ width: 120 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--dae-ink-muted)' }}>
                    没有匹配的租户
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.tenant.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: 'var(--dae-primary-light)',
                            color: 'var(--dae-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Building2 size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{row.tenant.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--dae-ink-muted)' }}>{row.tenant.code}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {row.assignees.length === 0 ? (
                        <span style={{ color: '#fa8c16', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <AlertTriangle size={12} />
                          暂未配置，新申请将需要管理员处理
                        </span>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {row.assignees.map(
                            (u) =>
                              u && (
                                <span
                                  key={u.id}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '2px 10px',
                                    borderRadius: 12,
                                    background: 'var(--dae-primary-light)',
                                    color: 'var(--dae-primary)',
                                    fontSize: 12,
                                  }}
                                >
                                  <span
                                    style={{
                                      width: 16, height: 16, borderRadius: '50%',
                                      background: '#fff', color: 'var(--dae-primary)',
                                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                      fontSize: 10, fontWeight: 600,
                                    }}
                                  >
                                    {u.name.slice(0, 1)}
                                  </span>
                                  {u.name}
                                </span>
                              )
                          )}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>
                      <div>{row.updatedAt}</div>
                      {row.updatedBy && (
                        <div style={{ marginTop: 2 }}>by {row.updatedBy.name}</div>
                      )}
                    </td>
                    <td>
                      {isSuperAdmin ? (
                        <button
                          className="dae-btn dae-btn-secondary"
                          style={{ padding: '4px 10px' }}
                          onClick={() => openEdit(row.tenant)}
                        >
                          {row.configured ? '编辑' : <><Plus size={12} style={{ verticalAlign: '-1px', marginRight: 2 }} /> 配置</>}
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>无权限</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 说明卡片 */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--dae-border)', padding: 16 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, marginBottom: 8 }}>配置规则</h4>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--dae-ink-secondary)', lineHeight: 1.8 }}>
          <li>每个租户可配置 0 个或多个审核人；0 个时新申请默认为管理员处理。</li>
          <li>仅系统超级管理员可修改配置，避免权限过度下放。</li>
          <li>当租户配置了多个审核人时，对每个申请人 <strong>任一审核人</strong> 处理即可流转到下一节点。</li>
          <li>管理员统一指派审核人，避免管理员一人处理全部租户的工单。</li>
        </ul>
      </div>

      {/* 编辑 Drawer */}
      <Drawer
        open={!!editing}
        title={`${editing?.tenant.name || ''} · 审核人配置`}
        onClose={() => setEditing(null)}
        width={520}
        footer={
          <>
            <button className="dae-btn dae-btn-secondary" onClick={() => setEditing(null)}>
              取消
            </button>
            <button className="dae-btn dae-btn-primary" onClick={handleSave}>
              <Check size={14} style={{ marginRight: 4, verticalAlign: '-2px' }} />
              保存配置
            </button>
          </>
        }
      >
        {editing && <AssigneeEditor editing={editing} onToggle={toggleAssignee} onClear={handleClear} />}
      </Drawer>
    </div>
  );
}

/* ========== 编辑器子组件 ========== */

function AssigneeEditor({
  editing,
  onToggle,
  onClear,
}: {
  editing: { tenant: typeof tenants[number]; selectedIds: string[] };
  onToggle: (id: string) => void;
  onClear: () => void;
}) {
  const [keyword, setKeyword] = useState('');
  const [dept, setDept] = useState('all');
  const departments = useMemo(
    () => Array.from(new Set(users.map((u) => u.department))).filter(Boolean),
    []
  );
  const candidates = useMemo(() => {
    return users.filter((u) => {
      if (u.status !== 'active') return false;
      if (dept !== 'all' && u.department !== dept) return false;
      if (!keyword) return true;
      const k = keyword.toLowerCase();
      return u.name.toLowerCase().includes(k) || u.email.toLowerCase().includes(k);
    });
  }, [keyword, dept]);

  const selected = editing.selectedIds.map((id) => users.find((u) => u.id === id)).filter(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 已选预览 */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--dae-ink)' }}>
            已选审核人（{selected.length}）
          </span>
          {selected.length > 0 && (
            <button
              className="dae-btn dae-btn-secondary"
              style={{ padding: '2px 8px', fontSize: 12 }}
              onClick={onClear}
            >
              <Trash2 size={12} style={{ marginRight: 2, verticalAlign: '-2px' }} />
              清空
            </button>
          )}
        </div>
        {selected.length === 0 ? (
          <div
            style={{
              padding: 16,
              background: 'var(--dae-surface)',
              borderRadius: 8,
              color: 'var(--dae-ink-muted)',
              fontSize: 13,
              textAlign: 'center',
            }}
          >
            暂未选择，新申请将默认交由超级管理员处理
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {selected.map(
              (u) =>
                u && (
                  <span
                    key={u.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 10px',
                      borderRadius: 14,
                      background: 'var(--dae-primary-light)',
                      color: 'var(--dae-primary)',
                      fontSize: 13,
                    }}
                  >
                    <UserCog size={12} />
                    {u.name}
                    <span style={{ fontSize: 11, color: 'var(--dae-ink-muted)' }}>· {u.department}</span>
                    <button
                      onClick={() => onToggle(u.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                )
            )}
          </div>
        )}
      </div>

      {/* 选择器 */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--dae-ink)', marginBottom: 8 }}>可选用户</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--dae-ink-muted)' }} />
            <input
              className="dae-input"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索用户名 / 邮箱"
              style={{ paddingLeft: 30 }}
            />
          </div>
          <select className="dae-input" value={dept} onChange={(e) => setDept(e.target.value)} style={{ flex: '0 0 140px' }}>
            <option value="all">全部部门</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div
          style={{
            maxHeight: 320,
            overflowY: 'auto',
            border: '1px solid var(--dae-border)',
            borderRadius: 8,
          }}
          className="dae-scroll"
        >
          {candidates.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--dae-ink-muted)', fontSize: 13 }}>
              没有匹配的用户
            </div>
          ) : (
            candidates.map((u) => {
              const checked = editing.selectedIds.includes(u.id);
              return (
                <label
                  key={u.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--dae-border)',
                    background: checked ? 'var(--dae-primary-light)' : '#fff',
                    cursor: 'pointer',
                  }}
                  onClick={() => onToggle(u.id)}
                >
                  <input type="checkbox" checked={checked} onChange={() => onToggle(u.id)} style={{ marginRight: 12 }} />
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'var(--dae-primary-light)',
                      color: 'var(--dae-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 600,
                      marginRight: 10,
                    }}
                  >
                    {u.name.slice(0, 1)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>
                      {u.email} · {u.department} · {u.role}
                    </div>
                  </div>
                </label>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
