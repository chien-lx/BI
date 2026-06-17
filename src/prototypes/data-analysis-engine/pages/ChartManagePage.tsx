import React, { useState, useMemo } from 'react';
import { Plus, BarChart3, Eye, Pencil, Trash2, ShieldCheck, Settings } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SearchFilter from '../components/SearchFilter';
import Drawer from '../components/Drawer';
import PermissionDrawer from '../components/PermissionDrawer';
import IconAction from '../components/IconAction';
import DeleteConfirm from '../components/DeleteConfirm';
import UserPermSelect from '../components/UserPermSelect';
import { charts, type ChartItem } from '../data/mockData';
import { useNavigate } from '../../../common/useNavigate';

export default function ChartManagePage() {
  const { navigate } = useNavigate();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [permOpen, setPermOpen] = useState(false);
  const [permTarget, setPermTarget] = useState('');
  const [form, setForm] = useState<Partial<ChartItem>>({});
  const [delOpen, setDelOpen] = useState(false);
  const [delTarget, setDelTarget] = useState<{ id: string; name: string } | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [viewPerm, setViewPerm] = useState<string[]>([]);
  const [managePerm, setManagePerm] = useState<string[]>([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState<ChartItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<ChartItem | null>(null);

  const openView = (item: ChartItem) => {
    setViewItem(item);
    setViewOpen(true);
  };

  const openConfig = (item: ChartItem) => {
    navigate('data-explore', { chartId: item.id });
  };

  const openPreview = (item: ChartItem) => {
    setPreviewItem(item);
    setPreviewOpen(true);
  };

  const openModal = (item: ChartItem) => {
    setForm(item);
    setModalOpen(true);
  };

  const filtered = useMemo(() => {
    return charts.filter((item) =>
      item.name.includes(search) || item.type.includes(search) || item.datasetName.includes(search)
    );
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

  const openDelete = (item: ChartItem) => {
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
        title="图表管理"
        breadcrumb="数据分析 / 图表管理"
        actions={
          <button className="dae-btn dae-btn-primary" onClick={() => { setForm({}); setViewPerm([]); setManagePerm([]); setModalOpen(true); }}>
            <Plus size={16} />
            新建图表
          </button>
        }
      />
      <SearchFilter placeholder="搜索图表名称、类型、数据集..." value={search} onChange={setSearch} />
      <div style={{ background: '#fff', borderRadius: 'var(--dae-radius-lg)', border: '1px solid var(--dae-border)', overflow: 'hidden' }}>
        <table className="dae-table">
          <thead>
            <tr>
              <th>图表名称</th>
              <th>图表类型</th>
              <th>数据集</th>
              <th>创建人</th>
              <th>更新人</th>
              <th>更新时间</th>
              <th style={{ width: 220 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {pagedData.map((item) => (
              <tr key={item.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BarChart3 size={16} style={{ color: 'var(--dae-primary)' }} />
                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                  </div>
                </td>
                <td><span className="dae-tag dae-tag-blue">{item.type}</span></td>
                <td>{item.datasetName}</td>
                <td>{item.creator}</td>
                <td>{item.updater}</td>
                <td>{item.updatedAt}</td>
                <td>
                  <div className="dae-table-actions">
                    <IconAction icon={<Eye size={16} />} label="预览" onClick={() => openPreview(item)} />
                    <IconAction icon={<Settings size={16} />} label="配置" onClick={() => openConfig(item)} />
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
            <BarChart3 size={40} />
            <p>暂无图表，点击「新建图表」创建</p>
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
        title={form.id ? '编辑图表' : '新建图表'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button className="dae-btn dae-btn-secondary" onClick={() => setModalOpen(false)}>取消</button>
            <button className="dae-btn dae-btn-primary" onClick={() => setModalOpen(false)}>确定</button>
          </>
        }
      >
        <div className="dae-form-group">
          <label>图表名称</label>
          <input className="dae-input" placeholder="请输入图表名称" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="dae-form-group">
          <label>图表类型</label>
          <select className="dae-input" value={form.type || '折线图'} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option>折线图</option>
            <option>柱状图</option>
            <option>饼图</option>
            <option>面积图</option>
            <option>漏斗图</option>
          </select>
        </div>
        <div className="dae-form-group">
          <label>数据集</label>
          <select className="dae-input" value={form.datasetName || ''} onChange={(e) => setForm({ ...form, datasetName: e.target.value })}>
            <option value="">请选择数据集</option>
            <option>订单明细数据集</option>
            <option>用户画像数据集</option>
            <option>商品信息数据集</option>
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
              <label>图表名称</label>
              <div className="dae-input" style={{ background: 'var(--dae-surface)', cursor: 'default' }}>{viewItem.name}</div>
            </div>
            <div className="dae-form-group">
              <label>图表类型</label>
              <div className="dae-input" style={{ background: 'var(--dae-surface)', cursor: 'default' }}>{viewItem.type}</div>
            </div>
            <div className="dae-form-group">
              <label>数据集</label>
              <div className="dae-input" style={{ background: 'var(--dae-surface)', cursor: 'default' }}>{viewItem.datasetName}</div>
            </div>
            <div className="dae-form-group">
              <label>创建人</label>
              <div className="dae-input" style={{ background: 'var(--dae-surface)', cursor: 'default' }}>{viewItem.creator}</div>
            </div>
            <div className="dae-form-group">
              <label>更新时间</label>
              <div className="dae-input" style={{ background: 'var(--dae-surface)', cursor: 'default' }}>{viewItem.updatedAt}</div>
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

      {/* 预览 */}
      <Drawer
        open={previewOpen}
        title={`图表预览 - ${previewItem?.name || ''}`}
        onClose={() => setPreviewOpen(false)}
        footer={
          <button className="dae-btn dae-btn-secondary" onClick={() => setPreviewOpen(false)}>关闭</button>
        }
        size="large"
      >
        {previewItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--dae-surface)', borderRadius: 'var(--dae-radius)', padding: 16, border: '1px solid var(--dae-border)' }}>
              <h4 style={{ fontSize: 16, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 12 }}>{previewItem.name}</h4>
              <div style={{ background: '#fff', borderRadius: 'var(--dae-radius)', padding: 24, minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--dae-border)' }}>
                <div style={{ textAlign: 'center', color: 'var(--dae-text-secondary)' }}>
                  <BarChart3 size={64} style={{ color: 'var(--dae-primary)', marginBottom: 16 }} />
                  <p style={{ fontSize: 14, marginBottom: 8 }}>图表类型：{previewItem.type}</p>
                  <p style={{ fontSize: 14, marginBottom: 8 }}>数据集：{previewItem.datasetName}</p>
                  <p style={{ fontSize: 12, color: 'var(--dae-text-tertiary)' }}>（此处展示实际图表渲染效果）</p>
                </div>
              </div>
            </div>
            <div style={{ background: 'var(--dae-surface)', borderRadius: 'var(--dae-radius)', padding: 16, border: '1px solid var(--dae-border)' }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 12 }}>图表信息</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <span style={{ fontSize: 12, color: 'var(--dae-text-secondary)' }}>创建人</span>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{previewItem.creator}</p>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: 'var(--dae-text-secondary)' }}>更新人</span>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{previewItem.updater}</p>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: 'var(--dae-text-secondary)' }}>更新时间</span>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{previewItem.updatedAt}</p>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: 'var(--dae-text-secondary)' }}>状态</span>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>
                    <span className="dae-tag dae-tag-blue">已发布</span>
                  </p>
                </div>
              </div>
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
