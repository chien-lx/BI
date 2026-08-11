import React, { useMemo, useState } from 'react';
import {
  Plus,
  Building2,
  Pencil,
  Trash2,
  Eye,
  Ban,
  RotateCcw,
  Users,
  UserCog,
  Search,
  X,
  Check,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SearchFilter from '../components/SearchFilter';
import Drawer from '../components/Drawer';
import IconAction from '../components/IconAction';
import DeleteConfirm from '../components/DeleteConfirm';
import DatePicker from '../components/DatePicker';
import {
  tenants as initialTenants,
  users,
  type TenantItem,
  type UserItem,
  getTenantMembers,
} from '../data/mockData';

const emptyForm: Partial<TenantItem> = {
  name: '',
  code: '',
  contact: '',
  contactPhone: '',
  userQuota: undefined,
  storageQuota: '',
  status: 'active',
  expireAt: '',
  description: '',
  adminUserId: '',
};

export default function TenantManagePage() {
  const [search, setSearch] = useState('');
  const [tenantsState, setTenantsState] = useState<TenantItem[]>(initialTenants);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [form, setForm] = useState<Partial<TenantItem>>(emptyForm);
  const [delOpen, setDelOpen] = useState(false);
  const [delTarget, setDelTarget] = useState<{ id: string; name: string } | null>(null);
  const [detailTenant, setDetailTenant] = useState<TenantItem | null>(null);
  const [adminDrawerOpen, setAdminDrawerOpen] = useState(false);
  const [adminTenant, setAdminTenant] = useState<TenantItem | null>(null);
  const [adminSearch, setAdminSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return tenantsState.filter(
      (item) =>
        item.name.includes(search) ||
        item.code.toLowerCase().includes(search.toLowerCase()) ||
        item.contact.includes(search)
    );
  }, [tenantsState, search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const adminUser = useMemo(() => {
    if (!adminTenant?.adminUserId) return null;
    return users.find((u) => u.id === adminTenant.adminUserId) || null;
  }, [adminTenant]);

  const candidateAdmins = useMemo(() => {
    return users.filter(
      (u) =>
        u.status === 'active' &&
        (u.name.includes(adminSearch) || u.email.toLowerCase().includes(adminSearch.toLowerCase()))
    );
  }, [adminSearch]);

  const openCreate = () => {
    setModalMode('create');
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item: TenantItem) => {
    setModalMode('edit');
    setForm({ ...item });
    setModalOpen(true);
  };

  const openDetail = (item: TenantItem) => {
    setDetailTenant(item);
  };

  const openAdminDrawer = (item: TenantItem) => {
    setAdminTenant(item);
    setAdminSearch('');
    setAdminDrawerOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.code) return;
    if (modalMode === 'create') {
      const newTenant: TenantItem = {
        id: `T${String(tenantsState.length + 1).padStart(3, '0')}`,
        name: form.name,
        code: form.code,
        contact: form.contact || '',
        contactPhone: form.contactPhone || '',
        userQuota: Number(form.userQuota) || 0,
        storageQuota: form.storageQuota || '',
        status: form.status || 'active',
        expireAt: form.expireAt || '',
        createdAt: new Date().toISOString().slice(0, 10),
        description: form.description || '',
        adminUserId: form.adminUserId || '',
      };
      setTenantsState((prev) => [...prev, newTenant]);
    } else if (form.id) {
      setTenantsState((prev) =>
        prev.map((t) =>
          t.id === form.id
            ? ({
                ...t,
                name: form.name || t.name,
                code: form.code || t.code,
                contact: form.contact ?? t.contact,
                contactPhone: form.contactPhone ?? t.contactPhone,
                userQuota: Number(form.userQuota) || t.userQuota,
                storageQuota: form.storageQuota ?? t.storageQuota,
                status: form.status ?? t.status,
                expireAt: form.expireAt ?? t.expireAt,
                description: form.description ?? t.description,
                adminUserId: form.adminUserId ?? t.adminUserId,
              } as TenantItem)
            : t
        )
      );
      // 同步详情/管理员抽屉中的数据
      if (detailTenant?.id === form.id) setDetailTenant({ ...detailTenant, ...form } as TenantItem);
      if (adminTenant?.id === form.id) setAdminTenant({ ...adminTenant, ...form } as TenantItem);
    }
    setModalOpen(false);
  };

  const openDelete = (item: TenantItem) => {
    setDelTarget({ id: item.id, name: item.name });
    setDelOpen(true);
  };

  const confirmDelete = () => {
    if (!delTarget) return;
    setTenantsState((prev) => prev.filter((t) => t.id !== delTarget.id));
    setDelOpen(false);
    setDelTarget(null);
  };

  const toggleStatus = (item: TenantItem) => {
    const next = item.status === 'active' ? 'inactive' : 'active';
    setTenantsState((prev) => prev.map((t) => (t.id === item.id ? { ...t, status: next } : t)));
  };

  const setAdmin = (user: UserItem) => {
    if (!adminTenant) return;
    setTenantsState((prev) =>
      prev.map((t) =>
        t.id === adminTenant.id
          ? { ...t, adminUserId: user.id, contact: user.name, contactPhone: user.phone || t.contactPhone }
          : t
      )
    );
    setAdminTenant((prev) => (prev ? { ...prev, adminUserId: user.id } : null));
    if (detailTenant?.id === adminTenant.id) {
      setDetailTenant((prev) => (prev ? { ...prev, adminUserId: user.id } : null));
    }
    setAdminDrawerOpen(false);
  };

  const statusBadge = (status: TenantItem['status']) => {
    return status === 'active' ? (
      <span className="dae-tag dae-tag-green">启用</span>
    ) : (
      <span className="dae-tag dae-tag-gray">禁用</span>
    );
  };

  return (
    <div>
      <PageHeader
        title="租户管理"
        breadcrumb="系统管理 / 租户管理"
        actions={
          <button className="dae-btn dae-btn-primary" onClick={openCreate}>
            <Plus size={16} />
            新建租户
          </button>
        }
      />
      <SearchFilter placeholder="搜索租户名称、编码、联系人..." value={search} onChange={setSearch} />
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
              <th>租户名称</th>
              <th>编码</th>
              <th>联系人</th>
              <th>用户配额</th>
              <th>存储配额</th>
              <th>状态</th>
              <th>到期时间</th>
              <th style={{ width: 220 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {pagedData.map((item) => (
              <tr key={item.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Building2 size={16} style={{ color: 'var(--dae-primary)' }} />
                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                  </div>
                </td>
                <td>{item.code}</td>
                <td>{item.contact}</td>
                <td>{item.userQuota} 人</td>
                <td>{item.storageQuota}</td>
                <td>{statusBadge(item.status)}</td>
                <td>{item.expireAt}</td>
                <td>
                  <div className="dae-table-actions">
                    <IconAction icon={<Eye size={16} />} label="查看" onClick={() => openDetail(item)} />
                    <IconAction icon={<Pencil size={16} />} label="编辑" onClick={() => openEdit(item)} />
                    <IconAction
                      icon={item.status === 'active' ? <Ban size={16} /> : <RotateCcw size={16} />}
                      label={item.status === 'active' ? '禁用' : '恢复'}
                      onClick={() => toggleStatus(item)}
                    />
                    <IconAction icon={<UserCog size={16} />} label="管理员" onClick={() => openAdminDrawer(item)} />
                    <IconAction icon={<Trash2 size={16} />} label="删除" onClick={() => openDelete(item)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="dae-empty">
            <Building2 size={40} />
            <p>暂无租户，点击「新建租户」创建</p>
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

      {/* 新建 / 编辑 Drawer */}
      <Drawer
        open={modalOpen}
        title={modalMode === 'create' ? '新建租户' : '编辑租户'}
        onClose={() => setModalOpen(false)}
        width={560}
        footer={
          <>
            <button className="dae-btn dae-btn-secondary" onClick={() => setModalOpen(false)}>
              取消
            </button>
            <button className="dae-btn dae-btn-primary" onClick={handleSave}>
              确定
            </button>
          </>
        }
      >
        <div className="dae-form-group">
          <label>租户名称</label>
          <input
            className="dae-input"
            placeholder="请输入租户名称"
            value={form.name || ''}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="dae-form-group">
          <label>编码</label>
          <input
            className="dae-input"
            placeholder="请输入租户编码"
            value={form.code || ''}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
        </div>
        <div className="dae-form-group">
          <label>联系人</label>
          <input
            className="dae-input"
            placeholder="请输入联系人姓名"
            value={form.contact || ''}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
          />
        </div>
        <div className="dae-form-group">
          <label>联系电话</label>
          <input
            className="dae-input"
            placeholder="请输入联系电话"
            value={form.contactPhone || ''}
            onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
          />
        </div>
        <div className="dae-form-group">
          <label>用户配额</label>
          <input
            className="dae-input"
            type="number"
            placeholder="请输入用户配额"
            value={form.userQuota || ''}
            onChange={(e) => setForm({ ...form, userQuota: Number(e.target.value) })}
          />
        </div>
        <div className="dae-form-group">
          <label>存储配额</label>
          <input
            className="dae-input"
            placeholder="如 500GB"
            value={form.storageQuota || ''}
            onChange={(e) => setForm({ ...form, storageQuota: e.target.value })}
          />
        </div>
        <div className="dae-form-group">
          <label>到期时间</label>
          <DatePicker
            value={form.expireAt || ''}
            onChange={(v) => setForm({ ...form, expireAt: v })}
            placeholder="选择到期日期"
          />
        </div>
        <div className="dae-form-group">
          <label>租户管理员</label>
          <select
            className="dae-input"
            value={form.adminUserId || ''}
            onChange={(e) => setForm({ ...form, adminUserId: e.target.value })}
          >
            <option value="">请选择租户管理员</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}（{u.email}）
              </option>
            ))}
          </select>
        </div>
        <div className="dae-form-group">
          <label>状态</label>
          <select
            className="dae-input"
            value={form.status || 'active'}
            onChange={(e) => setForm({ ...form, status: e.target.value as TenantItem['status'] })}
          >
            <option value="active">启用</option>
            <option value="inactive">禁用</option>
          </select>
        </div>
        <div className="dae-form-group">
          <label>租户描述</label>
          <textarea
            className="dae-input"
            rows={3}
            placeholder="请输入租户描述"
            value={form.description || ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{ resize: 'vertical' }}
          />
        </div>
      </Drawer>

      {/* 详情 Drawer */}
      <Drawer open={!!detailTenant} title="租户详情" onClose={() => setDetailTenant(null)} width={600}>
        {detailTenant && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <section>
              <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: 'var(--dae-ink)' }}>
                基本信息
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr',
                  gap: '10px 16px',
                  fontSize: 14,
                  color: 'var(--dae-ink)',
                }}
              >
                <span style={{ color: 'var(--dae-ink-secondary)' }}>租户名称</span>
                <span>{detailTenant.name}</span>
                <span style={{ color: 'var(--dae-ink-secondary)' }}>编码</span>
                <span>{detailTenant.code}</span>
                <span style={{ color: 'var(--dae-ink-secondary)' }}>状态</span>
                <span>{statusBadge(detailTenant.status)}</span>
                <span style={{ color: 'var(--dae-ink-secondary)' }}>联系人</span>
                <span>{detailTenant.contact}</span>
                <span style={{ color: 'var(--dae-ink-secondary)' }}>联系电话</span>
                <span>{detailTenant.contactPhone || '-'}</span>
                <span style={{ color: 'var(--dae-ink-secondary)' }}>用户配额</span>
                <span>{detailTenant.userQuota} 人</span>
                <span style={{ color: 'var(--dae-ink-secondary)' }}>存储配额</span>
                <span>{detailTenant.storageQuota}</span>
                <span style={{ color: 'var(--dae-ink-secondary)' }}>到期时间</span>
                <span>{detailTenant.expireAt}</span>
                <span style={{ color: 'var(--dae-ink-secondary)' }}>创建时间</span>
                <span>{detailTenant.createdAt || '-'}</span>
                <span style={{ color: 'var(--dae-ink-secondary)' }}>描述</span>
                <span>{detailTenant.description || '-'}</span>
              </div>
            </section>

            <section>
              <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: 'var(--dae-ink)' }}>
                租户管理员
              </h4>
              {adminUser ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 12,
                    background: 'var(--dae-surface)',
                    borderRadius: 8,
                    border: '1px solid var(--dae-border)',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'var(--dae-primary-light)',
                      color: 'var(--dae-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                    }}
                  >
                    {adminUser.name.slice(0, 1)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500 }}>{adminUser.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--dae-ink-secondary)' }}>{adminUser.email}</div>
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--dae-ink-muted)', fontSize: 14 }}>未设置管理员</div>
              )}
            </section>

            <section>
              <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: 'var(--dae-ink)' }}>
                租户成员
              </h4>
              {getTenantMembers(detailTenant.id).length > 0 ? (
                <table className="dae-table">
                  <thead>
                    <tr>
                      <th>姓名</th>
                      <th>账号</th>
                      <th>角色</th>
                      <th>租户内身份</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getTenantMembers(detailTenant.id).map((u) => {
                      const membership = u.tenantMemberships?.find((m) => m.tenantId === detailTenant.id);
                      return (
                        <tr key={u.id}>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>{u.role}</td>
                          <td>
                            {membership?.role === 'admin' ? (
                              <span className="dae-tag dae-tag-blue">租户管理员</span>
                            ) : (
                              <span className="dae-tag dae-tag-gray">成员</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div style={{ color: 'var(--dae-ink-muted)', fontSize: 14 }}>暂无成员</div>
              )}
            </section>
          </div>
        )}
      </Drawer>

      {/* 设置管理员 Drawer */}
      <Drawer
        open={adminDrawerOpen}
        title={adminTenant ? `设置管理员 - ${adminTenant.name}` : '设置管理员'}
        onClose={() => setAdminDrawerOpen(false)}
        width={480}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Search size={16} style={{ color: 'var(--dae-ink-secondary)' }} />
            <input
              className="dae-input"
              placeholder="搜索姓名、邮箱"
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
            />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {candidateAdmins.map((u) => {
            const selected = adminTenant?.adminUserId === u.id;
            return (
              <button
                key={u.id}
                onClick={() => setAdmin(u)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 12,
                  borderRadius: 8,
                  border: '1px solid var(--dae-border)',
                  background: selected ? 'var(--dae-primary-light)' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'var(--dae-primary-light)',
                      color: 'var(--dae-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {u.name.slice(0, 1)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, color: 'var(--dae-ink)' }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--dae-ink-secondary)' }}>{u.email}</div>
                  </div>
                </div>
                {selected ? (
                  <Check size={18} style={{ color: 'var(--dae-primary)' }} />
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>设为管理员</span>
                )}
              </button>
            );
          })}
          {candidateAdmins.length === 0 && (
            <div className="dae-empty" style={{ padding: 24 }}>
              <Users size={32} />
              <p>未找到匹配用户</p>
            </div>
          )}
        </div>
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
