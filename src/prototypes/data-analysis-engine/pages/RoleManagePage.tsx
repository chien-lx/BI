import React, { useState, useMemo } from 'react';
import { Plus, Shield, Pencil, Trash2, Eye, Lock, Unlock, Users, UserPlus, Search, ArrowRight, ArrowLeft } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SearchFilter from '../components/SearchFilter';
import Drawer from '../components/Drawer';
import IconAction from '../components/IconAction';
import DeleteConfirm from '../components/DeleteConfirm';
import MenuPermissionTree from '../components/MenuPermissionTree';
import PerspectiveNode from '../components/PerspectiveNode';
import { roles, users, type RoleItem, type UserItem, type MenuPermission } from '../data/mockData';

const statusBadge = (status: 'active' | 'inactive') => {
  if (status === 'active') {
    return <span className="dae-tag dae-tag-green">启用中</span>;
  }
  return <span className="dae-tag dae-tag-red">已禁用</span>;
};

type ModalType = 'create' | 'edit' | 'detail' | 'perspective' | 'bind' | null;

export default function RoleManagePage() {
  const [rolesState, setRolesState] = useState<RoleItem[]>(roles);
  const [usersState, setUsersState] = useState<UserItem[]>(users);
  const [search, setSearch] = useState('');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [currentRole, setCurrentRole] = useState<RoleItem | null>(null);
  const [form, setForm] = useState<Partial<RoleItem>>({});
  const [allowedMenuIds, setAllowedMenuIds] = useState<Set<string>>(new Set());
  const [delOpen, setDelOpen] = useState(false);
  const [delTarget, setDelTarget] = useState<{ id: string; name: string } | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // 绑定用户
  const [unboundSearch, setUnboundSearch] = useState('');
  const [boundSearch, setBoundSearch] = useState('');
  const [selectedUnbound, setSelectedUnbound] = useState<Set<string>>(new Set());
  const [selectedBound, setSelectedBound] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return rolesState.filter((item) => item.name.includes(search) || item.description.includes(search));
  }, [rolesState, search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const roleUsers = useMemo(() => {
    if (!currentRole) return [];
    return usersState.filter((u) => u.roleId === currentRole.id);
  }, [currentRole, usersState]);

  const unboundUsers = useMemo(() => {
    if (!currentRole) return [];
    return usersState.filter(
      (u) =>
        u.roleId !== currentRole.id &&
        (u.name.includes(unboundSearch) || u.department.includes(unboundSearch) || u.email.includes(unboundSearch))
    );
  }, [currentRole, usersState, unboundSearch]);

  const boundUsers = useMemo(() => {
    if (!currentRole) return [];
    return roleUsers.filter(
      (u) =>
        u.name.includes(boundSearch) || u.department.includes(boundSearch) || u.email.includes(boundSearch)
    );
  }, [roleUsers, boundSearch]);

  const openModal = (type: ModalType, role: RoleItem | null = null) => {
    setModalType(type);
    setCurrentRole(role);
    if (role) {
      setForm({ ...role });
      setAllowedMenuIds(new Set((role.menuPermissions || []).map((m) => m.id)));
    } else {
      setForm({ status: 'active' });
      setAllowedMenuIds(new Set());
    }
    // reset bind state
    setUnboundSearch('');
    setBoundSearch('');
    setSelectedUnbound(new Set());
    setSelectedBound(new Set());
  };

  const closeModal = () => {
    setModalType(null);
    setCurrentRole(null);
    setForm({});
    setAllowedMenuIds(new Set());
    setUnboundSearch('');
    setBoundSearch('');
    setSelectedUnbound(new Set());
    setSelectedBound(new Set());
  };

  const syncRoleUserCount = (roleId: string, nextUsers: UserItem[]) => {
    const count = nextUsers.filter((u) => u.roleId === roleId).length;
    setRolesState((prev) => prev.map((r) => (r.id === roleId ? { ...r, userCount: count } : r)));
  };

  const saveForm = () => {
    const name = (form.name || '').trim();
    const description = (form.description || '').trim();
    if (!name) {
      alert('请输入角色名称');
      return;
    }
    const menuPermissions: MenuPermission[] = [];
    const permissionSet = new Set<string>();
    const pushPerm = (label: string) => {
      if (label) permissionSet.add(label);
    };
    allowedMenuIds.forEach((id) => {
      if (id === 'data-portal') {
        menuPermissions.push({ id, name: '数据门户', permissions: ['view', 'manage'] });
        pushPerm('数据门户');
      } else if (['datasource', 'dataset', 'self-service'].includes(id)) {
        const label = id === 'datasource' ? '数据源' : id === 'dataset' ? '数据集' : '自助取数';
        menuPermissions.push({ id, name: label, permissions: ['view', 'manage'] });
        pushPerm('数据准备');
      } else if (['data-explore', 'chart', 'report', 'dashboard', 'data-screen'].includes(id)) {
        const label =
          id === 'data-explore'
            ? '数据探查'
            : id === 'chart'
              ? '图表管理'
              : id === 'report'
                ? '报表'
                : id === 'dashboard'
                  ? '仪表盘'
                  : '数据大屏';
        menuPermissions.push({ id, name: label, permissions: ['view', 'manage'] });
        pushPerm('数据分析');
      } else if (['user-manage', 'role-manage', 'operation-log', 'tenant-manage'].includes(id)) {
        const label =
          id === 'user-manage'
            ? '用户管理'
            : id === 'role-manage'
              ? '角色管理'
              : id === 'operation-log'
                ? '操作日志'
                : '租户管理';
        menuPermissions.push({ id, name: label, permissions: ['view', 'manage'] });
        pushPerm('系统管理');
      } else if (id === 'metric-monitor') {
        menuPermissions.push({ id, name: '指标监控', permissions: ['view', 'manage'] });
        pushPerm('监控告警');
      }
    });
    const permissions = Array.from(permissionSet);

    if (modalType === 'edit' && currentRole) {
      setRolesState((prev) =>
        prev.map((r) =>
          r.id === currentRole.id
            ? {
                ...r,
                name,
                description,
                status: form.status || r.status,
                permissions,
                menuPermissions,
              }
            : r
        )
      );
    } else {
      const newRole: RoleItem = {
        id: `R${String(rolesState.length + 1).padStart(3, '0')}`,
        name,
        description,
        userCount: 0,
        status: (form.status as 'active' | 'inactive') || 'active',
        permissions,
        menuPermissions,
      };
      setRolesState((prev) => [...prev, newRole]);
    }
    closeModal();
  };

  const toggleStatus = (role: RoleItem) => {
    const next = role.status === 'active' ? 'inactive' : 'active';
    setRolesState((prev) => prev.map((r) => (r.id === role.id ? { ...r, status: next } : r)));
  };

  const openDelete = (item: RoleItem) => {
    setDelTarget({ id: item.id, name: item.name });
    setDelOpen(true);
  };

  const confirmDelete = () => {
    if (delTarget) {
      setRolesState((prev) => prev.filter((r) => r.id !== delTarget.id));
    }
    setDelOpen(false);
    setDelTarget(null);
  };

  const toggleMenu = (id: string) => {
    setAllowedMenuIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const bindUsers = () => {
    if (!currentRole || selectedUnbound.size === 0) return;
    const nextUsers = usersState.map((u) => (selectedUnbound.has(u.id) ? { ...u, roleId: currentRole.id, role: currentRole.name } : u));
    setUsersState(nextUsers);
    syncRoleUserCount(currentRole.id, nextUsers);
    setSelectedUnbound(new Set());
  };

  const unbindUsers = () => {
    if (!currentRole || selectedBound.size === 0) return;
    const nextUsers = usersState.map((u) =>
      selectedBound.has(u.id) ? { ...u, roleId: '', role: '' } : u
    );
    setUsersState(nextUsers);
    syncRoleUserCount(currentRole.id, nextUsers);
    setSelectedBound(new Set());
  };

  const toggleSelection = (set: Set<string>, updater: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) => {
    const next = new Set(set);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    updater(next);
  };

  const renderFormFields = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="dae-form-group">
        <label>角色名称</label>
        <input
          className="dae-input"
          placeholder="请输入角色名称"
          value={form.name || ''}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div className="dae-form-group">
        <label>描述</label>
        <input
          className="dae-input"
          placeholder="请输入角色描述"
          value={form.description || ''}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <div className="dae-form-group">
        <label>状态</label>
        <select
          className="dae-input"
          value={form.status || 'active'}
          onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
        >
          <option value="active">启用</option>
          <option value="inactive">禁用</option>
        </select>
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--dae-ink)' }}>菜单权限</div>
        <MenuPermissionTree menuPermissions={Array.from(allowedMenuIds).map((id) => ({ id, name: id, permissions: ['view', 'manage'] }))} onToggle={toggleMenu} />
      </div>
    </div>
  );

  const renderDetail = () => {
    if (!currentRole) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <section>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--dae-ink)' }}>基本信息</div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', rowGap: 10, fontSize: 14 }}>
            <span style={{ color: 'var(--dae-ink-secondary)' }}>角色名称</span>
            <span style={{ color: 'var(--dae-ink)', fontWeight: 500 }}>{currentRole.name}</span>
            <span style={{ color: 'var(--dae-ink-secondary)' }}>描述</span>
            <span style={{ color: 'var(--dae-ink)' }}>{currentRole.description}</span>
            <span style={{ color: 'var(--dae-ink-secondary)' }}>状态</span>
            <span>{statusBadge(currentRole.status)}</span>
            <span style={{ color: 'var(--dae-ink-secondary)' }}>用户数量</span>
            <span style={{ color: 'var(--dae-ink)' }}>{roleUsers.length} 人</span>
          </div>
        </section>

        <section>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--dae-ink)' }}>菜单权限</div>
          <MenuPermissionTree menuPermissions={currentRole.menuPermissions || []} />
        </section>

        <section>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--dae-ink)' }}>
            角色用户（{roleUsers.length} 人）
          </div>
          {roleUsers.length === 0 ? (
            <div style={{ color: 'var(--dae-ink-secondary)', fontSize: 13 }}>暂无用户</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {roleUsers.map((u) => (
                <div
                  key={u.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--dae-border)',
                    background: 'var(--dae-surface)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={16} style={{ color: 'var(--dae-primary)' }} />
                    <span style={{ fontSize: 14, color: 'var(--dae-ink)' }}>{u.name}</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--dae-ink-secondary)' }}>{u.department}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  };

  const renderPerspective = () => {
    if (!currentRole) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <section>
          <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: 'var(--dae-ink)' }}>角色用户数据透视</h4>
          <p style={{ fontSize: 13, color: 'var(--dae-ink-secondary)', margin: 0 }}>
            展示该角色下的所有用户，便于快速了解角色的人员覆盖情况。
          </p>
        </section>

        <div style={{ display: 'flex', gap: 24, minHeight: 360, alignItems: 'stretch' }}>
          {/* 角色节点 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 160, position: 'relative' }}>
            <PerspectiveNode icon={<Users size={30} />} title={currentRole.name} subtitle="角色" />
            <div
              style={{
                position: 'absolute',
                right: -12,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 24,
                height: 2,
                background: 'var(--dae-border)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: -16,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 0,
                height: 0,
                borderTop: '5px solid transparent',
                borderBottom: '5px solid transparent',
                borderLeft: '6px solid var(--dae-border)',
              }}
            />
          </div>

          {/* 用户列表 */}
          <div style={{ flex: 1, paddingLeft: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--dae-ink-secondary)', marginBottom: 10 }}>
              用户（{roleUsers.length} 人）
            </div>
            {roleUsers.length === 0 ? (
              <div style={{ color: 'var(--dae-ink-secondary)', fontSize: 13 }}>该角色下暂无用户</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {roleUsers.map((u) => (
                  <div
                    key={u.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--dae-border)',
                      background: 'var(--dae-surface)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Users size={16} style={{ color: 'var(--dae-primary)' }} />
                      <span style={{ fontSize: 14, color: 'var(--dae-ink)', fontWeight: 500 }}>{u.name}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--dae-ink-secondary)' }}>
                      {u.department} · {u.status === 'active' ? '启用' : '禁用'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderBindUsers = () => {
    if (!currentRole) return null;

    const unboundAll = unboundUsers.length > 0 && unboundUsers.every((u) => selectedUnbound.has(u.id));
    const boundAll = boundUsers.length > 0 && boundUsers.every((u) => selectedBound.has(u.id));

    const toggleUnboundAll = () => {
      if (unboundAll) {
        setSelectedUnbound(new Set());
      } else {
        setSelectedUnbound(new Set(unboundUsers.map((u) => u.id)));
      }
    };

    const toggleBoundAll = () => {
      if (boundAll) {
        setSelectedBound(new Set());
      } else {
        setSelectedBound(new Set(boundUsers.map((u) => u.id)));
      }
    };

    const userRow = (
      u: UserItem,
      selected: Set<string>,
      onToggle: (id: string) => void,
      showUnbind?: boolean
    ) => (
      <label
        key={u.id}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 12px',
          borderRadius: 8,
          border: '1px solid var(--dae-border)',
          background: 'var(--dae-surface)',
          cursor: 'pointer',
          marginBottom: 8,
        }}
      >
        <input
          type="checkbox"
          checked={selected.has(u.id)}
          onChange={() => onToggle(u.id)}
          style={{ cursor: 'pointer' }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, color: 'var(--dae-ink)', fontWeight: 500 }}>{u.name}</div>
          <div style={{ fontSize: 12, color: 'var(--dae-ink-secondary)' }}>
            {u.department} · {u.email}
          </div>
        </div>
        {showUnbind && (
          <button
            className="dae-btn-ghost"
            onClick={(e) => {
              e.preventDefault();
              const nextUsers = usersState.map((x) => (x.id === u.id ? { ...x, roleId: '', role: '' } : x));
              setUsersState(nextUsers);
              syncRoleUserCount(currentRole.id, nextUsers);
            }}
            style={{ fontSize: 12, color: 'var(--dae-ink-secondary)', padding: '4px 8px' }}
          >
            取消绑定
          </button>
        )}
      </label>
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 420 }}>
        <div style={{ display: 'flex', gap: 16, flex: 1 }}>
          {/* 未绑定用户 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dae-ink)' }}>
                未绑定用户（{unboundUsers.length}）
              </div>
              <button className="dae-btn-ghost" onClick={toggleUnboundAll} style={{ fontSize: 12, padding: '4px 8px' }}>
                {unboundAll ? '取消全选' : '全选'}
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--dae-ink-muted)' }} />
              <input
                className="dae-input"
                placeholder="搜索姓名、部门、邮箱"
                value={unboundSearch}
                onChange={(e) => setUnboundSearch(e.target.value)}
                style={{ paddingLeft: 34 }}
              />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', maxHeight: 360 }}>
              {unboundUsers.length === 0 ? (
                <div style={{ color: 'var(--dae-ink-secondary)', fontSize: 13, textAlign: 'center', paddingTop: 40 }}>
                  暂无未绑定用户
                </div>
              ) : (
                unboundUsers.map((u) =>
                  userRow(u, selectedUnbound, (id) => toggleSelection(selectedUnbound, setSelectedUnbound, id))
                )
              )}
            </div>
            <button
              className="dae-btn dae-btn-primary"
              disabled={selectedUnbound.size === 0}
              onClick={bindUsers}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <ArrowRight size={16} />
              批量绑定（{selectedUnbound.size}）
            </button>
          </div>

          {/* 已绑定用户 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dae-ink)' }}>
                已绑定用户（{boundUsers.length}）
              </div>
              <button className="dae-btn-ghost" onClick={toggleBoundAll} style={{ fontSize: 12, padding: '4px 8px' }}>
                {boundAll ? '取消全选' : '全选'}
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--dae-ink-muted)' }} />
              <input
                className="dae-input"
                placeholder="搜索姓名、部门、邮箱"
                value={boundSearch}
                onChange={(e) => setBoundSearch(e.target.value)}
                style={{ paddingLeft: 34 }}
              />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', maxHeight: 360 }}>
              {boundUsers.length === 0 ? (
                <div style={{ color: 'var(--dae-ink-secondary)', fontSize: 13, textAlign: 'center', paddingTop: 40 }}>
                  该角色暂无绑定用户
                </div>
              ) : (
                boundUsers.map((u) =>
                  userRow(
                    u,
                    selectedBound,
                    (id) => toggleSelection(selectedBound, setSelectedBound, id),
                    true
                  )
                )
              )}
            </div>
            <button
              className="dae-btn dae-btn-secondary"
              disabled={selectedBound.size === 0}
              onClick={unbindUsers}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <ArrowLeft size={16} />
              批量取消绑定（{selectedBound.size}）
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        title="角色管理"
        breadcrumb="系统管理 / 角色管理"
        actions={
          <button className="dae-btn dae-btn-primary" onClick={() => openModal('create')}>
            <Plus size={16} />
            新建角色
          </button>
        }
      />
      <SearchFilter placeholder="搜索角色名称、描述..." value={search} onChange={setSearch} />
      <div
        style={{
          background: '#fff',
          borderRadius: 'var(--dae-radius-lg)',
          border: '1px solid var(--dae-border)',
          overflow: 'hidden',
        }}
      >
        <table className="dae-table">
          <thead>
            <tr>
              <th>角色名称</th>
              <th>描述</th>
              <th>用户数量</th>
              <th>权限范围</th>
              <th>状态</th>
              <th style={{ width: 220 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {pagedData.map((item) => {
              const count = usersState.filter((u) => u.roleId === item.id).length;
              return (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Shield size={16} style={{ color: 'var(--dae-primary)' }} />
                      <span style={{ fontWeight: 500 }}>{item.name}</span>
                    </div>
                  </td>
                  <td>{item.description}</td>
                  <td>{count} 人</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {item.permissions.map((p) => (
                        <span key={p} className="dae-tag dae-tag-blue">
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{statusBadge(item.status)}</td>
                  <td>
                    <div className="dae-table-actions">
                      <IconAction icon={<Eye size={16} />} label="查看" onClick={() => openModal('detail', item)} />
                      <IconAction icon={<Pencil size={16} />} label="编辑" onClick={() => openModal('edit', item)} />
                      <IconAction
                        icon={<Users size={16} />}
                        label="数据透视"
                        onClick={() => openModal('perspective', item)}
                      />
                      <IconAction
                        icon={<UserPlus size={16} />}
                        label="绑定用户"
                        onClick={() => openModal('bind', item)}
                      />
                      <IconAction
                        icon={item.status === 'active' ? <Lock size={16} /> : <Unlock size={16} />}
                        label={item.status === 'active' ? '禁用角色' : '恢复角色'}
                        onClick={() => toggleStatus(item)}
                      />
                      <IconAction icon={<Trash2 size={16} />} label="删除" onClick={() => openDelete(item)} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="dae-empty">
            <Shield size={40} />
            <p>暂无角色，点击「新建角色」创建</p>
          </div>
        )}
      </div>
      {pagedData.length > 0 && (
        <div className="dae-pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>
              {p}
            </button>
          ))}
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            &gt;
          </button>
        </div>
      )}

      {/* 新建/编辑角色 */}
      <Drawer
        open={modalType === 'create' || modalType === 'edit'}
        title={modalType === 'create' ? '新建角色' : '编辑角色信息'}
        onClose={closeModal}
        width={560}
        footer={
          <>
            <button className="dae-btn dae-btn-secondary" onClick={closeModal}>
              取消
            </button>
            <button className="dae-btn dae-btn-primary" onClick={saveForm}>
              确定
            </button>
          </>
        }
      >
        {renderFormFields()}
      </Drawer>

      {/* 查看详情 */}
      <Drawer open={modalType === 'detail'} title="角色详情" onClose={closeModal} width={560}>
        {renderDetail()}
      </Drawer>

      {/* 数据透视 */}
      <Drawer open={modalType === 'perspective'} title="角色用户数据透视" onClose={closeModal} width={640}>
        {renderPerspective()}
      </Drawer>

      {/* 绑定用户 */}
      <Drawer
        open={modalType === 'bind'}
        title={currentRole ? `绑定用户 - ${currentRole.name}` : '绑定用户'}
        onClose={closeModal}
        width={720}
        footer={
          <>
            <button className="dae-btn dae-btn-secondary" onClick={closeModal}>
              关闭
            </button>
          </>
        }
      >
        {renderBindUsers()}
      </Drawer>

      <DeleteConfirm
        open={delOpen}
        content={delTarget ? `确定要删除「${delTarget.name}」吗？删除后不可恢复。` : ''}
        onClose={() => {
          setDelOpen(false);
          setDelTarget(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
