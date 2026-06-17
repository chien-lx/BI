import React, { useState, useMemo } from 'react';
import { Plus, Shield, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SearchFilter from '../components/SearchFilter';
import Drawer from '../components/Drawer';
import IconAction from '../components/IconAction';
import DeleteConfirm from '../components/DeleteConfirm';
import { roles, type RoleItem } from '../data/mockData';

export default function RoleManagePage() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<RoleItem>>({});
  const [delOpen, setDelOpen] = useState(false);
  const [delTarget, setDelTarget] = useState<{ id: string; name: string } | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return roles.filter((item) =>
      item.name.includes(search) || item.description.includes(search)
    );
  }, [search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const openDelete = (item: RoleItem) => {
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
        title="角色管理"
        breadcrumb="系统管理 / 角色管理"
        actions={
          <button className="dae-btn dae-btn-primary" onClick={() => { setForm({}); setModalOpen(true); }}>
            <Plus size={16} />
            新建角色
          </button>
        }
      />
      <SearchFilter placeholder="搜索角色名称、描述..." value={search} onChange={setSearch} />
      <div style={{ background: '#fff', borderRadius: 'var(--dae-radius-lg)', border: '1px solid var(--dae-border)', overflow: 'hidden' }}>
        <table className="dae-table">
          <thead>
            <tr>
              <th>角色名称</th>
              <th>描述</th>
              <th>用户数量</th>
              <th>权限范围</th>
              <th style={{ width: 140 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {pagedData.map((item) => (
              <tr key={item.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Shield size={16} style={{ color: 'var(--dae-primary)' }} />
                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                  </div>
                </td>
                <td>{item.description}</td>
                <td>{item.userCount} 人</td>
                <td>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {item.permissions.map((p) => (
                      <span key={p} className="dae-tag dae-tag-blue">{p}</span>
                    ))}
                  </div>
                </td>
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
            <Shield size={40} />
            <p>暂无角色，点击「新建角色」创建</p>
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
        title="新建角色"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button className="dae-btn dae-btn-secondary" onClick={() => setModalOpen(false)}>取消</button>
            <button className="dae-btn dae-btn-primary" onClick={() => setModalOpen(false)}>确定</button>
          </>
        }
      >
        <div className="dae-form-group">
          <label>角色名称</label>
          <input className="dae-input" placeholder="请输入角色名称" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="dae-form-group">
          <label>描述</label>
          <input className="dae-input" placeholder="请输入角色描述" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
