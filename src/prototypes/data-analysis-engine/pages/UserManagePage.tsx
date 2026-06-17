import React, { useState, useMemo } from 'react';
import { Plus, Users, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SearchFilter from '../components/SearchFilter';
import Drawer from '../components/Drawer';
import IconAction from '../components/IconAction';
import DeleteConfirm from '../components/DeleteConfirm';
import { users, type UserItem } from '../data/mockData';

export default function UserManagePage() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<UserItem>>({});
  const [delOpen, setDelOpen] = useState(false);
  const [delTarget, setDelTarget] = useState<{ id: string; name: string } | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return users.filter((item) =>
      item.name.includes(search) || item.email.includes(search) || item.role.includes(search) || item.department.includes(search)
    );
  }, [search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const openDelete = (item: UserItem) => {
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
        title="用户管理"
        breadcrumb="系统管理 / 用户管理"
        actions={
          <button className="dae-btn dae-btn-primary" onClick={() => { setForm({}); setModalOpen(true); }}>
            <Plus size={16} />
            新建用户
          </button>
        }
      />
      <SearchFilter placeholder="搜索用户姓名、邮箱、角色、部门..." value={search} onChange={setSearch} />
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
              <th style={{ width: 140 }}>操作</th>
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
                <td><span className="dae-tag dae-tag-blue">{item.role}</span></td>
                <td>{item.department}</td>
                <td>
                  <span className={`dae-tag ${item.status === 'active' ? 'dae-tag-green' : 'dae-tag-gray'}`}>
                    {item.status === 'active' ? '启用' : '禁用'}
                  </span>
                </td>
                <td>{item.createdAt}</td>
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
            <Users size={40} />
            <p>暂无用户，点击「新建用户」创建</p>
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
        title="新建用户"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button className="dae-btn dae-btn-secondary" onClick={() => setModalOpen(false)}>取消</button>
            <button className="dae-btn dae-btn-primary" onClick={() => setModalOpen(false)}>确定</button>
          </>
        }
      >
        <div className="dae-form-group">
          <label>用户姓名</label>
          <input className="dae-input" placeholder="请输入用户姓名" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="dae-form-group">
          <label>邮箱</label>
          <input className="dae-input" placeholder="请输入邮箱" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="dae-form-group">
          <label>角色</label>
          <select className="dae-input" value={form.role || ''} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="">请选择角色</option>
            <option>系统管理员</option>
            <option>数据分析师</option>
            <option>业务人员</option>
            <option>访客</option>
          </select>
        </div>
        <div className="dae-form-group">
          <label>部门</label>
          <input className="dae-input" placeholder="请输入部门" value={form.department || ''} onChange={(e) => setForm({ ...form, department: e.target.value })} />
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
