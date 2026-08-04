import React, { useState, useMemo } from 'react';
import { Plus, FileSpreadsheet, Eye, Pencil, Trash2, ShieldCheck, Copy, Settings } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SearchFilter from '../components/SearchFilter';
import Drawer from '../components/Drawer';
import IconAction from '../components/IconAction';
import DeleteConfirm from '../components/DeleteConfirm';
import UserPermSelect from '../components/UserPermSelect';
import StatusSwitch from '../components/StatusSwitch';
import { datasets, type Dataset } from '../data/mockData';

const thStyle = {
  padding: '10px 14px', fontSize: '12px', fontWeight: 600,
  whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis',
};

const tdStyle = {
  padding: '9px 14px', fontSize: '12px',
  whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis',
};

export default function DatasetPage() {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<Dataset[]>(datasets);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<Dataset>>({});
  const [delOpen, setDelOpen] = useState(false);
  const [delTarget, setDelTarget] = useState<{ id: string; name: string; status: string } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [jumpPage, setJumpPage] = useState('');
  const [viewPerm, setViewPerm] = useState<string[]>([]);
  const [managePerm, setManagePerm] = useState<string[]>([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState<Dataset | null>(null);
  const [copyOpen, setCopyOpen] = useState(false);
  const [copyTarget, setCopyTarget] = useState<Dataset | null>(null);
  const [copyName, setCopyName] = useState('');
  const [copyViewPerm, setCopyViewPerm] = useState<string[]>([]);
  const [copyManagePerm, setCopyManagePerm] = useState<string[]>([]);

  const openView = (item: Dataset) => {
    setViewItem(item);
    setViewOpen(true);
  };

  const filtered = useMemo(() => {
    return items.filter((item) =>
      item.name.includes(search) || item.sourceName.includes(search)
    );
  }, [search, items]);

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
    setDelTarget({ id: item.id, name: item.name, status: item.status });
    setDelOpen(true);
  };

  const confirmDelete = () => {
    setDelOpen(false);
    setDelTarget(null);
  };

  const toggleStatus = (item: Dataset) => {
    setItems((prev) =>
      prev.map((d) =>
        d.id === item.id
          ? { ...d, status: d.status === 'offline' ? ('online' as const) : ('offline' as const) }
          : d
      )
    );
  };

  const openCopy = (item: Dataset) => {
    setCopyTarget(item);
    setCopyName(item.name + '_副本');
    setCopyViewPerm([]);
    setCopyManagePerm([]);
    setCopyOpen(true);
  };

  const confirmCopy = () => {
    if (copyTarget) {
      const newId = 'DT' + String(Date.now()).slice(-3);
      setItems((prev) => [
        ...prev,
        {
          ...copyTarget,
          id: newId,
          name: copyName || copyTarget.name + '_副本',
          status: 'pending',
        },
      ]);
    }
    setCopyOpen(false);
    setCopyTarget(null);
    setCopyName('');
    setCopyViewPerm([]);
    setCopyManagePerm([]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
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
      {/* 内容区 - 固定高度，内部可滚动 */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        overflow: 'hidden', minHeight: 0,
      }}>
        {/* 搜索框区域 - 不滚动 */}
        <div style={{ marginBottom: 16 }}>
          <SearchFilter placeholder="搜索数据集名称、数据源..." value={search} onChange={setSearch} />
        </div>

        {/* 表格区域 - 可垂直滚动 */}
        <div style={{
          flex: 1, overflow: 'auto',
          border: '1px solid var(--dae-border)', borderRadius: 'var(--dae-radius-lg)',
          background: '#fff',
        }}>
          <div style={{ overflowX: 'auto' }}>
          <table className="dae-table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th style={thStyle}>数据集名称</th>
                <th style={thStyle}>数据源</th>
                <th style={thStyle}>所有者</th>
                <th style={thStyle}>创建人</th>
                <th style={thStyle}>更新人</th>
                <th style={thStyle}>更新时间</th>
                <th style={thStyle}>状态</th>
                <th style={thStyle}>创建时间</th>
                <th style={{ ...thStyle, width: 200 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {pagedData.map((item) => (
                <tr key={item.id}>
                  <td title={item.name} style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FileSpreadsheet size={16} style={{ color: 'var(--dae-primary)', minWidth: 16 }} />
                      <span style={{ fontWeight: 500 }}>{item.name}</span>
                    </div>
                  </td>
                  <td title={item.sourceName} style={tdStyle}>{item.sourceName}</td>
                  <td title={item.owner} style={tdStyle}>{item.owner}</td>
                  <td title={item.creator || item.owner} style={tdStyle}>{item.creator || item.owner}</td>
                  <td title={item.modifier} style={tdStyle}>{item.modifier}</td>
                  <td title={item.updatedAt} style={tdStyle}>{item.updatedAt}</td>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                    {item.status === 'pending' && <span className="dae-tag dae-tag-gray">待上线</span>}
                    {item.status === 'online' && <span className="dae-tag dae-tag-green">已上线</span>}
                    {item.status === 'offline' && (
                      <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 'var(--dae-radius-sm)', fontSize: 12, lineHeight: '20px', background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>
                        已下线
                      </span>
                    )}
                  </td>
                  <td title={item.createdAt} style={tdStyle}>{item.createdAt}</td>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                    <div className="dae-table-actions">
                      {/* Switch 开关：上下线切换 */}
                      <StatusSwitch status={item.status} onToggle={() => toggleStatus(item)} />
                      <IconAction icon={<Eye size={16} />} label="查看" onClick={() => openView(item)} />
                      <IconAction icon={<Pencil size={16} />} label="编辑" onClick={() => openModal(item)} />
                      <IconAction icon={<Copy size={16} />} label="复制" onClick={() => openCopy(item)} />
                      <IconAction icon={<Settings size={16} />} label="数据集配置" onClick={() => { window.location.hash = '#page=dataset-config'; }} />
                      <IconAction icon={<Trash2 size={16} />} label="删除" onClick={() => openDelete(item)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {filtered.length === 0 && (
            <div className="dae-empty">
              <FileSpreadsheet size={40} />
              <p>暂无数据集，点击「新建数据集」创建</p>
            </div>
          )}
        </div>

        {/* 分页区域 - 不滚动，固定在底部 */}
        {pagedData.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 0', borderTop: '1px solid var(--dae-border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', color: 'var(--dae-ink-secondary)' }}>
              <span>每页</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                style={{
                  width: 60, padding: '4px 6px', border: '1px solid var(--dae-border)',
                  borderRadius: 'var(--dae-radius-sm)', fontSize: '13px', background: '#fff',
                  cursor: 'pointer',
                }}
              >
                {[10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <span>条 / 共 {filtered.length} 条</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* 上一页按钮 */}
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  minWidth:28, height:28, padding:'0 6px', borderRadius:'var(--dae-radius-sm)',
                  border:'1px solid var(--dae-border)', background:'#fff',
                  color: page===1 ? 'var(--dae-ink-subtle)' : 'var(--dae-ink-secondary)',
                  fontSize:'12px', cursor: page===1 ? 'not-allowed' : 'pointer',
                }}
              >&lt;</button>

              {/* 页码按钮 */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  style={{
                    minWidth:28, height:28, padding:'0 6px', borderRadius:'var(--dae-radius-sm)',
                    border: page===pageNum ? '1px solid var(--dae-primary)' : '1px solid var(--dae-border)',
                    background: page===pageNum ? 'var(--dae-primary)' : '#fff',
                    color: page===pageNum ? '#fff' : 'var(--dae-ink-secondary)', fontSize:'12px', cursor:'pointer',
                  }}
                >{pageNum}</button>
              ))}

              {/* 下一页按钮 */}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  minWidth:28, height:28, padding:'0 6px', borderRadius:'var(--dae-radius-sm)',
                  border:'1px solid var(--dae-border)', background:'#fff',
                  color: page===totalPages ? 'var(--dae-ink-subtle)' : 'var(--dae-ink-secondary)',
                  fontSize:'12px', cursor: page===totalPages ? 'not-allowed' : 'pointer',
                }}
              ></button>

              {/* 跳转输入 */}
              <span style={{ fontSize:'13px', color:'var(--dae-ink-secondary)', marginLeft:8 }}>跳至</span>
              <input type="text" value={jumpPage} onChange={(e)=>setJumpPage(e.target.value.replace(/\D/g,''))}
                onKeyDown={(e)=>{ if(e.key==='Enter'){ const p=parseInt(jumpPage); if(p>=1&&p<=totalPages)setPage(p); } }}
                style={{ width:44, height:28, padding:'0 6px', textAlign:'center', border:'1px solid var(--dae-border)', borderRadius:'var(--dae-radius-sm)', fontSize:'13px' }} />
              <span style={{ fontSize:'13px', color:'var(--dae-ink-secondary)' }}>页</span>
            </div>
          </div>
        )}
      </div>

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
        {form.status === 'online' && (
          <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 'var(--dae-radius-sm)', padding: '8px 12px', fontSize: 13, color: '#d48806', marginBottom: 16 }}>
            已上线状态，编辑后将变为待上线
          </div>
        )}
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

      {/* 复制数据集 */}
      <Drawer
        open={copyOpen}
        title="复制数据集"
        onClose={() => { setCopyOpen(false); setCopyTarget(null); }}
        footer={
          <>
            <button className="dae-btn dae-btn-secondary" onClick={() => { setCopyOpen(false); setCopyTarget(null); }}>取消</button>
            <button className="dae-btn dae-btn-primary" onClick={confirmCopy}>确认复制</button>
          </>
        }
      >
        <div className="dae-form-group">
          <label>名称</label>
          <input className="dae-input" value={copyName} onChange={(e) => setCopyName(e.target.value)} />
        </div>
        <UserPermSelect label="查看权限" selected={copyViewPerm} onChange={setCopyViewPerm} />
        <UserPermSelect label="管理权限" selected={copyManagePerm} onChange={setCopyManagePerm} />
      </Drawer>

      <DeleteConfirm
        open={delOpen}
        content={delTarget
          ? delTarget.status === 'online'
            ? `该数据集已上线且被引用，请先下线后再删除`
            : `确定要删除「${delTarget.name}」吗？删除后不可恢复。`
          : ''
        }
        onClose={() => { setDelOpen(false); setDelTarget(null); }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
