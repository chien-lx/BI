import React, { useState, useMemo } from 'react';
import { Plus, FileSpreadsheet, Eye, Pencil, Trash2, ShieldCheck } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SearchFilter from '../components/SearchFilter';
import Drawer from '../components/Drawer';
import IconAction from '../components/IconAction';
import DeleteConfirm from '../components/DeleteConfirm';
import UserPermSelect from '../components/UserPermSelect';
import { datasets, type Dataset } from '../data/mockData';

export default function DatasetPage() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<Dataset>>({});
  const [delOpen, setDelOpen] = useState(false);
  const [delTarget, setDelTarget] = useState<{ id: string; name: string } | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [viewPerm, setViewPerm] = useState<string[]>([]);
  const [managePerm, setManagePerm] = useState<string[]>([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState<Dataset | null>(null);

  const openView = (item: Dataset) => {
    setViewItem(item);
    setViewOpen(true);
  };

  const filtered = useMemo(() => {
    return datasets.filter((item) =>
      item.name.includes(search) || item.sourceName.includes(search)
    );
  }, [search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const openModal = (item?: Dataset) => {
    if (item) {
      setForm({ ...item });
    } else {
      setForm({});
    }
    setViewPerm([]);
    setManagePerm([]);
    setModalOpen(true);
  };

  const openDelete = (item: Dataset) => {
    setDelTarget({ id: item.id, name: item.name });
    setDelOpen(true);
  };

  const confirmDelete = () => {
    setDelOpen(false);
    setDelTarget(null);
  };

  return (
    <div>
      <PageHeader
        title="数据集"
        breadcrumb="数据准备 / 数据集"
        actions={
          <button className="dae-btn dae-btn-primary" onClick={() => openModal()}>
            <Plus size={16} />
            新建数据集
          </button>
        }
      />
      <SearchFilter placeholder="搜索数据集名称、数据源..." value={search} onChange={setSearch} />
      <div style={{ background: '#fff', borderRadius: 'var(--dae-radius-lg)', border: '1px solid var(--dae-border)', overflow: 'hidden' }}>
        <table className="dae-table">
          <thead>
            <tr>
              <th>名称</th>
              <th>创建人</th>
              <th>修改人</th>
              <th>修改时间</th>
              <th>数据源</th>
              <th style={{ width: 140 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {pagedData.map((item) => (
              <tr key={item.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileSpreadsheet size={16} style={{ color: 'var(--dae-primary)' }} />
                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                  </div>
                </td>
                <td>{item.owner}</td>
                <td>{item.modifier}</td>
                <td>{item.updatedAt}</td>
                <td>{item.sourceName}</td>
                <td>
                  <div className="dae-table-actions">
                    <IconAction icon={<Eye size={16} />} label="查看" onClick={() => openView(item)} />
                    <IconAction icon={<Pencil size={16} />} label="编辑" onClick={() => openModal(item)} />
                    <button
                      className="dae-btn dae-btn-sm"
                      style={{ background: '#e6f4ff', color: '#1677FF', border: 'none' }}
                      onClick={() => window.location.hash = 'page=dataset-config&id=' + item.id}
                    >
                      配置
                    </button>
                    <IconAction icon={<Trash2 size={16} />} label="删除" onClick={() => openDelete(item)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="dae-empty">
            <FileSpreadsheet size={40} />
            <p>暂无数据集，点击「新建数据集」创建</p>
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

      {/* 新建/编辑 */}
      <Drawer
        open={modalOpen}
        title={form.id ? '编辑数据集' : '新建数据集'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button className="dae-btn dae-btn-secondary" onClick={() => setModalOpen(false)}>取消</button>
            <button className="dae-btn dae-btn-primary" onClick={() => setModalOpen(false)}>确定</button>
          </>
        }
      >
        <div className="dae-form-group">
          <label>数据集名称</label>
          <input className="dae-input" placeholder="请输入数据集名称" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="dae-form-group">
          <label>创建人</label>
          <input className="dae-input" placeholder="请输入创建人" value={form.owner || ''} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
        </div>
        <div className="dae-form-group">
          <label>数据源</label>
          <select className="dae-input" value={form.sourceId || ''} onChange={(e) => setForm({ ...form, sourceId: e.target.value })}>
            <option value="">请选择数据源</option>
            <option value="DS001">订单数据库</option>
            <option value="DS002">用户数据库</option>
            <option value="DS003">商品数据 Excel</option>
            <option value="DS004">物流 API</option>
            <option value="DS006">日志 ClickHouse</option>
          </select>
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
              <label>名称</label>
              <div className="dae-input" style={{ background: 'var(--dae-surface)', cursor: 'default' }}>{viewItem.name}</div>
            </div>
            <div className="dae-form-group">
              <label>创建人</label>
              <div className="dae-input" style={{ background: 'var(--dae-surface)', cursor: 'default' }}>{viewItem.owner}</div>
            </div>
            <div className="dae-form-group">
              <label>修改人</label>
              <div className="dae-input" style={{ background: 'var(--dae-surface)', cursor: 'default' }}>{viewItem.modifier}</div>
            </div>
            <div className="dae-form-group">
              <label>修改时间</label>
              <div className="dae-input" style={{ background: 'var(--dae-surface)', cursor: 'default' }}>{viewItem.updatedAt}</div>
            </div>
            <div className="dae-form-group">
              <label>数据源</label>
              <div className="dae-input" style={{ background: 'var(--dae-surface)', cursor: 'default' }}>{viewItem.sourceName}</div>
            </div>
          </div>
        )}
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
