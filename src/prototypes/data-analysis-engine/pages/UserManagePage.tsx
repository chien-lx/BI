import React, { useState, useMemo } from 'react';
import {
  Plus,
  Users,
  Pencil,
  Trash2,
  Eye,
  Shield,
  ScanLine,
  Ban,
  CheckCircle,
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Clock,
  CalendarDays,
  Lock,
  Unlock,
  Search,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SearchFilter from '../components/SearchFilter';
import Drawer from '../components/Drawer';
import IconAction from '../components/IconAction';
import DeleteConfirm from '../components/DeleteConfirm';
import MenuPermissionTree from '../components/MenuPermissionTree';
import PerspectiveNode from '../components/PerspectiveNode';
import {
  users,
  roles,
  resourcePermissionGroups,
  menuTree,
  menuToResourceType,
  type UserItem,
  type ResourcePermission,
  type ResourcePermissionType,
  type MenuPermission,
} from '../data/mockData';

const permBadge = (on: boolean, label: string) => (
  <span
    className={`dae-tag ${on ? 'dae-tag-green' : 'dae-tag-gray'}`}
    style={{ minWidth: 56, textAlign: 'center', opacity: on ? 1 : 0.55 }}
  >
    {on ? `✓ ${label}` : '—'}
  </span>
);

const buildDefaultResourcePerms = (): ResourcePermission[] => {
  const perms: ResourcePermission[] = [];
  resourcePermissionGroups.forEach((g) =>
    g.items.forEach((it) =>
      perms.push({ resourceType: g.key, resourceId: it.id, resourceName: it.name, view: false, manage: false })
    )
  );
  return perms;
};

type ModalType = 'create' | 'edit' | 'detail' | 'permission' | 'perspective' | null;

export default function UserManagePage() {
  const [usersState, setUsersState] = useState<UserItem[]>(users);
  const [search, setSearch] = useState('');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [currentUser, setCurrentUser] = useState<UserItem | null>(null);
  const [form, setForm] = useState<Partial<UserItem>>({});
  const [resourcePerms, setResourcePerms] = useState<ResourcePermission[]>([]);
  const [delOpen, setDelOpen] = useState(false);
  const [delTarget, setDelTarget] = useState<{ id: string; name: string } | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // 数据权限设置
  const [selectedMenuId, setSelectedMenuId] = useState<string>(
    menuTree.map((g) => g.items.find((it) => menuToResourceType[it.id])).find(Boolean)?.id || 'datasource'
  );
  const [permSearch, setPermSearch] = useState('');

  // 权限透视
  const [perspectiveMenuId, setPerspectiveMenuId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return usersState.filter(
      (item) =>
        item.name.includes(search) ||
        item.email.includes(search) ||
        item.role.includes(search) ||
        item.department.includes(search) ||
        (item.phone && item.phone.includes(search))
    );
  }, [usersState, search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const openModal = (type: ModalType, user: UserItem | null = null) => {
    setModalType(type);
    setCurrentUser(user);
    if (user) {
      setForm({ ...user });
      if (type === 'permission') {
        setResourcePerms(
          user.resourcePermissions && user.resourcePermissions.length
            ? [...user.resourcePermissions]
            : buildDefaultResourcePerms()
        );
        const firstResourceMenu = menuTree.map((g) => g.items.find((it) => menuToResourceType[it.id])).find(Boolean);
        setSelectedMenuId(firstResourceMenu?.id || 'datasource');
        setPermSearch('');
      }
      if (type === 'perspective') {
        const role = roles.find((r) => r.id === user.roleId);
        const menuPerms = user.menuPermissions || role?.menuPermissions || [];
        setPerspectiveMenuId(menuPerms[0]?.id || null);
      }
    } else {
      setForm({ status: 'active' });
      setResourcePerms(buildDefaultResourcePerms());
      const firstResourceMenu = menuTree.map((g) => g.items.find((it) => menuToResourceType[it.id])).find(Boolean);
      setSelectedMenuId(firstResourceMenu?.id || 'datasource');
      setPermSearch('');
    }
  };

  const closeModal = () => {
    setModalType(null);
    setCurrentUser(null);
    setForm({});
    setResourcePerms([]);
    setPermSearch('');
    setPerspectiveMenuId(null);
  };

  const openDelete = (item: UserItem) => {
    setDelTarget({ id: item.id, name: item.name });
    setDelOpen(true);
  };

  const confirmDelete = () => {
    if (delTarget) {
      setUsersState((prev) => prev.filter((u) => u.id !== delTarget.id));
    }
    setDelOpen(false);
    setDelTarget(null);
  };

  const toggleStatus = (item: UserItem) => {
    const next: 'active' | 'inactive' = item.status === 'active' ? 'inactive' : 'active';
    setUsersState((prev) => prev.map((u) => (u.id === item.id ? { ...u, status: next } : u)));
  };

  const saveForm = () => {
    if (modalType === 'create') {
      const role = roles.find((r) => r.id === form.roleId);
      const newUser: UserItem = {
        id: 'U' + String(Date.now()).slice(-6),
        name: form.name || '',
        email: form.email || '',
        phone: form.phone,
        role: role?.name || '',
        roleId: form.roleId || '',
        department: form.department || '',
        position: form.position,
        status: (form.status as 'active' | 'inactive') || 'active',
        createdAt: new Date().toISOString().slice(0, 10),
        menuPermissions: role?.menuPermissions || [],
        resourcePermissions: buildDefaultResourcePerms(),
      };
      setUsersState((prev) => [newUser, ...prev]);
    } else if (currentUser) {
      setUsersState((prev) =>
        prev.map((u) =>
          u.id === currentUser.id
            ? { ...u, ...form, status: (form.status as 'active' | 'inactive') || u.status }
            : u
        )
      );
    }
    closeModal();
  };

  const savePermissions = () => {
    if (currentUser) {
      setUsersState((prev) =>
        prev.map((u) => (u.id === currentUser.id ? { ...u, resourcePermissions: resourcePerms } : u))
      );
    }
    closeModal();
  };

  const updateResourcePerm = (type: ResourcePermissionType, id: string, field: 'view' | 'manage', value: boolean) => {
    setResourcePerms((prev) =>
      prev.map((p) => {
        if (p.resourceType === type && p.resourceId === id) {
          if (field === 'manage') {
            return { ...p, manage: value, view: value ? true : p.view };
          }
          return { ...p, view: value, manage: value ? p.manage : false };
        }
        return p;
      })
    );
  };

  const batchResourcePerm = (type: ResourcePermissionType, view: boolean, manage: boolean) => {
    setResourcePerms((prev) =>
      prev.map((p) => (p.resourceType === type ? { ...p, view, manage } : p))
    );
  };

  const roleOf = (user: UserItem) => roles.find((r) => r.id === user.roleId);
  const formRole = useMemo(() => roles.find((r) => r.id === form.roleId), [form.roleId]);

  const renderFormFields = () => (
    <>
      <div className="dae-form-group">
        <label>用户姓名</label>
        <input
          className="dae-input"
          placeholder="请输入用户姓名"
          value={form.name || ''}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div className="dae-form-group">
        <label>邮箱</label>
        <input
          className="dae-input"
          placeholder="请输入邮箱"
          value={form.email || ''}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>
      <div className="dae-form-group">
        <label>手机号</label>
        <input
          className="dae-input"
          placeholder="请输入手机号"
          value={form.phone || ''}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </div>
      <div className="dae-form-group">
        <label>角色</label>
        <select
          className="dae-input"
          value={form.roleId || ''}
          onChange={(e) => {
            const role = roles.find((r) => r.id === e.target.value);
            setForm({ ...form, roleId: e.target.value, role: role?.name || '' });
          }}
        >
          <option value="">请选择角色</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      {formRole && (
        <div className="dae-form-group">
          <label>该角色菜单权限</label>
          <MenuPermissionTree menuPermissions={formRole.menuPermissions || []} />
        </div>
      )}
      <div className="dae-form-group">
        <label>部门</label>
        <input
          className="dae-input"
          placeholder="请输入部门"
          value={form.department || ''}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
        />
      </div>
      <div className="dae-form-group">
        <label>职位</label>
        <input
          className="dae-input"
          placeholder="请输入职位"
          value={form.position || ''}
          onChange={(e) => setForm({ ...form, position: e.target.value })}
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
    </>
  );

  const renderDetail = () => {
    if (!currentUser) return null;
    const role = roleOf(currentUser);
    const menuPerms: MenuPermission[] = currentUser.menuPermissions || role?.menuPermissions || [];

    const infoItem = (icon: React.ReactNode, label: string, value: React.ReactNode) => (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--dae-border)' }}>
        <div style={{ width: 20, display: 'flex', justifyContent: 'center', color: 'var(--dae-primary)', marginTop: 2 }}>{icon}</div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--dae-ink-secondary)', marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: 14, color: 'var(--dae-ink)', fontWeight: 500 }}>{value}</div>
        </div>
      </div>
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <section>
          <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: 'var(--dae-ink)' }}>基本信息</h4>
          <div style={{ background: 'var(--dae-surface)', borderRadius: 8, padding: '0 12px', border: '1px solid var(--dae-border)' }}>
            {infoItem(<User size={18} />, '用户姓名', currentUser.name)}
            {infoItem(<Mail size={18} />, '邮箱', currentUser.email)}
            {infoItem(<Phone size={18} />, '手机号', currentUser.phone || '-')}
            {infoItem(<Briefcase size={18} />, '职位', currentUser.position || '-')}
            {infoItem(<Building2 size={18} />, '部门', currentUser.department)}
            {infoItem(
              currentUser.status === 'active' ? <Unlock size={18} /> : <Lock size={18} />,
              '状态',
              <span className={`dae-tag ${currentUser.status === 'active' ? 'dae-tag-green' : 'dae-tag-gray'}`}>
                {currentUser.status === 'active' ? '启用' : '禁用'}
              </span>
            )}
            {infoItem(<CalendarDays size={18} />, '创建时间', currentUser.createdAt)}
            {infoItem(<Clock size={18} />, '最后登录', currentUser.lastLoginAt || '-')}
          </div>
        </section>

        <section>
          <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: 'var(--dae-ink)' }}>角色信息</h4>
          <div style={{ background: 'var(--dae-surface)', borderRadius: 8, padding: 12, border: '1px solid var(--dae-border)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{currentUser.role}</div>
            <div style={{ fontSize: 13, color: 'var(--dae-ink-secondary)' }}>{role?.description || '-'}</div>
          </div>
        </section>

        <section>
          <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: 'var(--dae-ink)' }}>菜单权限（角色拥有）</h4>
          <MenuPermissionTree menuPermissions={menuPerms} />
        </section>
      </div>
    );
  };

  const renderPermissionSetting = () => {
    const selectedResourceType = menuToResourceType[selectedMenuId];
    const selectedMenuLabel = menuTree
      .flatMap((g) => g.items)
      .find((it) => it.id === selectedMenuId)?.label;
    const resourceGroup = selectedResourceType
      ? resourcePermissionGroups.find((g) => g.key === selectedResourceType)
      : null;
    const filteredItems = resourceGroup
      ? resourceGroup.items.filter((it) => it.name.includes(permSearch))
      : [];

    return (
      <div style={{ display: 'flex', gap: 0, height: '100%', minHeight: 420 }}>
        {/* 左侧菜单树 */}
        <div
          style={{
            width: 180,
            flexShrink: 0,
            borderRight: '1px solid var(--dae-border)',
            overflow: 'auto',
            padding: '12px 0',
          }}
        >
          {menuTree.map((group) => (
            <div key={group.label} style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--dae-ink-secondary)',
                  padding: '0 12px 6px',
                  fontWeight: 500,
                }}
              >
                {group.label}
              </div>
              {group.items.map((item) => {
                const active = item.id === selectedMenuId;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedMenuId(item.id);
                      setPermSearch('');
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      fontSize: 13,
                      border: 'none',
                      background: active ? 'var(--dae-primary-light)' : 'transparent',
                      color: active ? 'var(--dae-primary)' : 'var(--dae-ink)',
                      cursor: 'pointer',
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* 右侧资源权限设置 */}
        <div style={{ flex: 1, padding: '12px 16px', overflow: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h5 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{selectedMenuLabel} 数据内容</h5>
            {resourceGroup && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="dae-btn dae-btn-secondary"
                  style={{ fontSize: 12, padding: '4px 10px' }}
                  onClick={() => batchResourcePerm(selectedResourceType!, true, false)}
                >
                  全部查看
                </button>
                <button
                  className="dae-btn dae-btn-secondary"
                  style={{ fontSize: 12, padding: '4px 10px' }}
                  onClick={() => batchResourcePerm(selectedResourceType!, true, true)}
                >
                  全部管理
                </button>
                <button
                  className="dae-btn dae-btn-secondary"
                  style={{ fontSize: 12, padding: '4px 10px' }}
                  onClick={() => batchResourcePerm(selectedResourceType!, false, false)}
                >
                  全部取消
                </button>
              </div>
            )}
          </div>

          {resourceGroup ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Search size={16} style={{ color: 'var(--dae-ink-secondary)' }} />
                <input
                  className="dae-input"
                  placeholder="搜索数据内容名称..."
                  value={permSearch}
                  onChange={(e) => setPermSearch(e.target.value)}
                  style={{ flex: 1, minWidth: 160 }}
                />
              </div>
              <div style={{ border: '1px solid var(--dae-border)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ maxHeight: 360, overflow: 'auto' }}>
                  <table className="dae-table" style={{ border: 'none' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                      <tr>
                        <th>名称</th>
                        <th style={{ width: 120 }}>查看权限</th>
                        <th style={{ width: 120 }}>管理权限</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => {
                        const perm =
                          resourcePerms.find(
                            (p) => p.resourceType === selectedResourceType && p.resourceId === item.id
                          ) || { view: false, manage: false };
                        return (
                          <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>
                              <input
                                type="checkbox"
                                checked={perm.view}
                                disabled={perm.manage}
                                onChange={(e) =>
                                  updateResourcePerm(selectedResourceType!, item.id, 'view', e.target.checked)
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="checkbox"
                                checked={perm.manage}
                                onChange={(e) =>
                                  updateResourcePerm(selectedResourceType!, item.id, 'manage', e.target.checked)
                                }
                              />
                            </td>
                          </tr>
                        );
                      })}
                      {filteredItems.length === 0 && (
                        <tr>
                          <td colSpan={3} style={{ textAlign: 'center', color: 'var(--dae-ink-secondary)' }}>
                            未找到匹配的数据内容
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--dae-ink-secondary)', marginTop: 8 }}>
                提示：管理权限包含查看权限。勾选「管理」会自动勾选「查看」；取消「查看」会自动取消「管理」。
              </p>
            </>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 200,
                color: 'var(--dae-ink-secondary)',
                border: '1px dashed var(--dae-border)',
                borderRadius: 8,
              }}
            >
              该菜单下无数据内容
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPerspective = () => {
    if (!currentUser) return null;
    const role = roleOf(currentUser);
    const menuPerms: MenuPermission[] = currentUser.menuPermissions || role?.menuPermissions || [];
    const allowedIds = new Set(menuPerms.map((m) => m.id));
    const rps: ResourcePermission[] = currentUser.resourcePermissions || [];

    const selectedResourceType = perspectiveMenuId ? menuToResourceType[perspectiveMenuId] : null;
    const selectedResources = selectedResourceType
      ? rps.filter((p) => p.resourceType === selectedResourceType && (p.view || p.manage))
      : [];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <section>
          <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: 'var(--dae-ink)' }}>用户权限数据血缘</h4>
          <p style={{ fontSize: 13, color: 'var(--dae-ink-secondary)', margin: 0 }}>
            点击菜单节点，查看该用户在该菜单下具有权限的数据内容。
          </p>
        </section>

        <div style={{ display: 'flex', gap: 24, minHeight: 360, alignItems: 'stretch' }}>
          {/* 用户节点 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 160, position: 'relative' }}>
            <PerspectiveNode icon={<User size={30} />} title={currentUser.name} subtitle="用户" />
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

          {/* 菜单节点 */}
          <div style={{ flex: 1, overflow: 'auto', paddingLeft: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--dae-ink-secondary)', marginBottom: 10 }}>菜单</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {menuTree.map((group) => (
                <div key={group.label}>
                  <div style={{ fontSize: 11, color: 'var(--dae-ink-secondary)', marginBottom: 6 }}>{group.label}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {group.items.map((item) => {
                      const allowed = allowedIds.has(item.id);
                      const active = perspectiveMenuId === item.id;
                      return (
                        <button
                          key={item.id}
                          disabled={!allowed}
                          onClick={() => setPerspectiveMenuId(item.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 10px',
                            borderRadius: 6,
                            border: '1px solid var(--dae-border)',
                            background: active ? 'var(--dae-primary-light)' : '#fff',
                            color: allowed ? (active ? 'var(--dae-primary)' : 'var(--dae-ink)') : 'var(--dae-ink-muted)',
                            cursor: allowed ? 'pointer' : 'not-allowed',
                            opacity: allowed ? 1 : 0.55,
                            fontSize: 13,
                          }}
                        >
                          {allowed ? <Unlock size={14} /> : <Lock size={14} />}
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 资源节点 */}
          <div style={{ width: 240, flexShrink: 0, borderLeft: '1px solid var(--dae-border)', paddingLeft: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--dae-ink-secondary)', marginBottom: 10 }}>
              {perspectiveMenuId
                ? `${menuTree.flatMap((g) => g.items).find((it) => it.id === perspectiveMenuId)?.label || ''} 权限内容`
                : '请选择菜单'}
            </div>
            {selectedResourceType ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedResources.length === 0 && (
                  <div style={{ color: 'var(--dae-ink-secondary)', fontSize: 13 }}>该菜单下暂无授权数据内容</div>
                )}
                {selectedResources.map((p) => (
                  <div
                    key={p.resourceId}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: '1px solid var(--dae-border)',
                      background: 'var(--dae-surface)',
                      fontSize: 13,
                    }}
                  >
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>{p.resourceName}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {permBadge(p.view, '查看')}
                      {permBadge(p.manage, '管理')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--dae-ink-secondary)', fontSize: 13 }}>该菜单无数据内容</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        title="用户管理"
        breadcrumb="系统管理 / 用户管理"
        actions={
          <button className="dae-btn dae-btn-primary" onClick={() => openModal('create')}>
            <Plus size={16} />
            新建用户
          </button>
        }
      />
      <SearchFilter placeholder="搜索用户姓名、邮箱、角色、部门、手机号..." value={search} onChange={setSearch} />
      <div style={{ background: '#fff', borderRadius: 'var(--dae-radius-lg)', border: '1px solid var(--dae-border)', overflow: 'hidden' }}>
        <table className="dae-table">
          <thead>
            <tr>
              <th>用户姓名</th>
              <th>邮箱</th>
              <th>角色</th>
              <th>部门</th>
              <th>状态</th>
              <th>创建时间</th>
              <th style={{ width: 280 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {pagedData.map((item) => (
              <tr key={item.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={16} style={{ color: 'var(--dae-primary)' }} />
                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                  </div>
                </td>
                <td>{item.email}</td>
                <td>
                  <span className="dae-tag dae-tag-blue">{item.role}</span>
                </td>
                <td>{item.department}</td>
                <td>
                  <span className={`dae-tag ${item.status === 'active' ? 'dae-tag-green' : 'dae-tag-gray'}`}>
                    {item.status === 'active' ? '启用' : '禁用'}
                  </span>
                </td>
                <td>{item.createdAt}</td>
                <td>
                  <div className="dae-table-actions">
                    <IconAction icon={<Eye size={16} />} label="查看详情" onClick={() => openModal('detail', item)} />
                    <IconAction icon={<Pencil size={16} />} label="编辑" onClick={() => openModal('edit', item)} />
                    <IconAction icon={<Shield size={16} />} label="设置数据权限" onClick={() => openModal('permission', item)} />
                    <IconAction icon={<ScanLine size={16} />} label="数据透视" onClick={() => openModal('perspective', item)} />
                    <IconAction
                      icon={item.status === 'active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                      label={item.status === 'active' ? '禁用用户' : '恢复禁用'}
                      onClick={() => toggleStatus(item)}
                    />
                    <IconAction icon={<Trash2 size={16} />} label="删除" onClick={() => openDelete(item)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="dae-empty">
            <Users size={40} />
            <p>暂无用户，点击「新建用户」创建</p>
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

      {/* 新建/编辑用户 */}
      <Drawer
        open={modalType === 'create' || modalType === 'edit'}
        title={modalType === 'create' ? '新建用户' : '编辑用户信息'}
        onClose={closeModal}
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
      <Drawer open={modalType === 'detail'} title="用户详情" onClose={closeModal}>
        {renderDetail()}
      </Drawer>

      {/* 设置数据权限 */}
      <Drawer
        open={modalType === 'permission'}
        title="设置用户数据权限"
        onClose={closeModal}
        width={720}
        footer={
          <>
            <button className="dae-btn dae-btn-secondary" onClick={closeModal}>
              取消
            </button>
            <button className="dae-btn dae-btn-primary" onClick={savePermissions}>
              保存
            </button>
          </>
        }
      >
        {renderPermissionSetting()}
      </Drawer>

      {/* 数据透视 */}
      <Drawer open={modalType === 'perspective'} title="用户权限数据透视" onClose={closeModal} width={720}>
        {renderPerspective()}
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
