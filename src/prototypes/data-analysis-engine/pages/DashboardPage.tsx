import React, { useState, useMemo } from 'react';
import { Plus, Gauge, Eye, Pencil, Trash2, ShieldCheck } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SearchFilter from '../components/SearchFilter';
import Drawer from '../components/Drawer';
import PermissionDrawer from '../components/PermissionDrawer';
import IconAction from '../components/IconAction';
import DeleteConfirm from '../components/DeleteConfirm';
import UserPermSelect from '../components/UserPermSelect';
import { dashboards, type DashboardItem } from '../data/mockData';

export default function DashboardPage() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [permOpen, setPermOpen] = useState(false);
  const [permTarget, setPermTarget] = useState('');
  const [form, setForm] = useState<Partial<DashboardItem>>({});
  const [delOpen, setDelOpen] = useState(false);
  const [delTarget, setDelTarget] = useState<{ id: string; name: string } | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [viewPerm, setViewPerm] = useState<string[]>([]);
  const [managePerm, setManagePerm] = useState<string[]>([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState<DashboardItem | null>(null);

  const openView = (item: DashboardItem) => {
    setViewItem(item);
    setViewOpen(true);
  };

  const openModal = (item: DashboardItem) => {
    setForm(item);
    setModalOpen(true);
  };

  const filtered = useMemo(() => {
    return dashboards.filter((item) => item.name.includes(search) || item.creator.includes(search));
  }, [search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const openPerm = (name: string) => {
    setPermTarget(name);
    setPermOpen(true);
  };

  const openDelete = (item: DashboardItem) => {
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
        title="仪表盘"
        breadcrumb="数据分析 / 仪表盘"
        actions={
          <button className="dae-btn dae-btn-primary" onClick={() => { setForm({}); setViewPerm([]); setManagePerm([]); setModalOpen(true); }}>
            <Plus size={16} />
            新建仪表盘
          </button>
        }
      />
      <SearchFilter placeholder="搜索仪表盘名称、创建人..." value={search} onChange={setSearch} />
      <div style={{ background: '#fff', borderRadius: 'var(--dae-radius-lg)', border: '1px solid var(--dae-border)', overflow: 'hidden' }}>
        <table className="dae-table">
          <thead>
            <tr>
              <th>仪表盘名称</th>
              <th>图表数量</th>
              <th>创建人</th>
              <th>更新时间</th>
              <th>状态</th>
              <th style={{ width: 180 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {pagedData.map((item) => (
              <tr key={item.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Gauge size={16} style={{ color: 'var(--dae-primary)' }} />
                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                  </div>
                </td>
                <td>{item.chartCount} 个</td>
                <td>{item.creator}</td>
                <td>{item.updatedAt}</td>
                <td>
                  <span className={`dae-tag ${item.status === 'published' ? 'dae-tag-green' : 'dae-tag-gray'}`}>
                    {item.status === 'published' ? '已发布' : '草稿'}
                  </span>
                </td>
                <td>
                  <div className="dae-table-actions">
                    <IconAction icon={<Eye size={16} />} label="查看" onClick={() => openView(item)} />
                    <IconAction icon={<Pencil size={16} />} label="编辑" onClick={() => openModal(item)} />
                    <IconAction icon={<Trash2 size={16} />} label="删除" onClick={() => openDelete(item)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="dae-empty">
            <Gauge size={40} />
            <p>暂无仪表盘，点击「新建仪表盘」创建</p>
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
        title="新建仪表盘"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button className="dae-btn dae-btn-secondary" onClick={() => setModalOpen(false)}>取消</button>
            <button className="dae-btn dae-btn-primary" onClick={() => setModalOpen(false)}>确定</button>
          </>
        }
      >
        <div className="dae-form-group">
          <label>仪表盘名称</label>
          <input className="dae-input" placeholder="请输入仪表盘名称" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        {/* 权限设置 */}
        <div style={{ paddingTop: 16, borderTop: '1px solid var(--dae-border)' }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={16} style={{ color: 'var(--dae-primary)' }} />
            权限设置
          </h4>
          <UserPermSelect label="查看权限" selected={viewPerm} onChange={setViewPerm} />
          <UserPermSelect label="管理权限" selected={managePerm} onChange={setManagePerm} />
        </div>
      </Drawer>
      {/* 查看 */}
      <Drawer
        open={viewOpen}
        title="查看详情"
        onClose={() => setViewOpen(false)}
        footer={
          <button className="dae-btn dae-btn-secondary" onClick={() => setViewOpen(false)}>关闭</button>
        }
      >
        {viewItem && (
          <div>
            <div className="dae-form-group">
              <label>仪表盘名称</label>
              <div className="dae-input" style={{ background: 'var(--dae-surface)', cursor: 'default' }}>{viewItem.name}</div>
            </div>
            <div className="dae-form-group">
              <label>图表数量</label>
              <div className="dae-input" style={{ background: 'var(--dae-surface)', cursor: 'default' }}>{viewItem.chartCount} 个</div>
            </div>
            <div className="dae-form-group">
              <label>创建人</label>
              <div className="dae-input" style={{ background: 'var(--dae-surface)', cursor: 'default' }}>{viewItem.creator}</div>
            </div>
            <div className="dae-form-group">
              <label>更新时间</label>
              <div className="dae-input" style={{ background: 'var(--dae-surface)', cursor: 'default' }}>{viewItem.updatedAt}</div>
            </div>
            <div className="dae-form-group">
              <label>状态</label>
              <div className="dae-input" style={{ background: 'var(--dae-surface)', cursor: 'default' }}>{viewItem.status === 'published' ? '已发布' : '草稿'}</div>
            </div>
          </div>
        )}
      </Drawer>
      <PermissionDrawer
        open={permOpen}
        title={`权限设置 - ${permTarget}`}
        onClose={() => setPermOpen(false)}
        onSave={() => setPermOpen(false)}
      />

      <DeleteConfirm
        open={delOpen}
        content={delTarget ? `确定要删除「${delTarget.name}」吗？删除后不可恢复。` : ''}
        onClose={() => { setDelOpen(false); setDelTarget(null); }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
