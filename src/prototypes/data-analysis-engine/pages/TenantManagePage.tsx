import React, { useState, useMemo } from 'react';
import { Plus, Building2, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SearchFilter from '../components/SearchFilter';
import Drawer from '../components/Drawer';
import IconAction from '../components/IconAction';
import DeleteConfirm from '../components/DeleteConfirm';
import { tenants, type TenantItem } from '../data/mockData';

export default function TenantManagePage() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<TenantItem>>({});
  const [delOpen, setDelOpen] = useState(false);
  const [delTarget, setDelTarget] = useState<{ id: string; name: string } | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return tenants.filter((item) =>
      item.name.includes(search) || item.code.includes(search) || item.contact.includes(search)
    );
  }, [search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const openDelete = (item: TenantItem) => {
    setDelTarget({ id: item.id, name: item.name });
    setDelOpen(true);
  };

  const confirmDelete = () => {
    // In real app, call API to delete
    setDelOpen(false);
    setDelTarget(null);
  };

  return (
    <div>
      <PageHeader
        title="租户管理"
        breadcrumb="系统管理 / 租户管理"
        actions={
          <button className="dae-btn dae-btn-primary" onClick={() => { setForm({}); setModalOpen(true); }}>
            <Plus size={16} />
            新建租户
          </button>
        }
      />
      <SearchFilter placeholder="搜索租户名称、编码、联系人..." value={search} onChange={setSearch} />
      <div style={{ background: '#fff', borderRadius: 'var(--dae-radius-lg)', border: '1px solid var(--dae-border)', overflow: 'hidden' }}>
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
              <th style={{ width: 140 }}>操作</th>
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
                <td>
                  <span className={`dae-tag ${item.status === 'active' ? 'dae-tag-green' : 'dae-tag-gray'}`}>
                    {item.status === 'active' ? '启用' : '禁用'}
                  </span>
                </td>
                <td>{item.expireAt}</td>
                <td>
                  <div className="dae-table-actions">
                    <IconAction icon={<Pencil size={16} />} label="编辑" />
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
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>&lt;</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>&gt;</button>
        </div>
      )}
      <Drawer
        open={modalOpen}
        title="新建租户"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button className="dae-btn dae-btn-secondary" onClick={() => setModalOpen(false)}>取消</button>
            <button className="dae-btn dae-btn-primary" onClick={() => setModalOpen(false)}>确定</button>
          </>
        }
      >
        <div className="dae-form-group">
          <label>租户名称</label>
          <input className="dae-input" placeholder="请输入租户名称" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="dae-form-group">
          <label>编码</label>
          <input className="dae-input" placeholder="请输入租户编码" value={form.code || ''} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        </div>
        <div className="dae-form-group">
          <label>联系人</label>
          <input className="dae-input" placeholder="请输入联系人" value={form.contact || ''} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
        </div>
        <div className="dae-form-group">
          <label>用户配额</label>
          <input className="dae-input" type="number" placeholder="请输入用户配额" value={form.userQuota || ''} onChange={(e) => setForm({ ...form, userQuota: Number(e.target.value) })} />
        </div>
        <div className="dae-form-group">
          <label>存储配额</label>
          <input className="dae-input" placeholder="如 500GB" value={form.storageQuota || ''} onChange={(e) => setForm({ ...form, storageQuota: e.target.value })} />
        </div>
      </Drawer>

      <DeleteConfirm
        open={delOpen}
        content={delTarget ? `确定要删除「${delTarget.name}」吗？删除后不可恢复。` : ''}
        onClose={() => { setDelOpen(false); setDelTarget(null); }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
