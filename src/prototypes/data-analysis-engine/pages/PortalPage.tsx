import React, { useState, useMemo } from 'react';
import { Plus, FileBarChart, LayoutDashboard, Monitor, FileText, Eye, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SearchFilter from '../components/SearchFilter';
import Drawer from '../components/Drawer';
import IconAction from '../components/IconAction';
import DeleteConfirm from '../components/DeleteConfirm';
import { portalAssets, type PortalAsset } from '../data/mockData';

const typeOptions = [
  { key: 'all', label: '全部' },
  { key: 'chart', label: '图表' },
  { key: 'dashboard', label: '仪表盘' },
  { key: 'screen', label: '数据大屏' },
  { key: 'report', label: '报表' },
];

const typeIconMap: Record<string, React.ElementType> = {
  chart: FileBarChart,
  dashboard: LayoutDashboard,
  screen: Monitor,
  report: FileText,
};

export default function PortalPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<PortalAsset>>({});
  const [delOpen, setDelOpen] = useState(false);
  const [delTarget, setDelTarget] = useState<{ id: string; name: string } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [jumpPage, setJumpPage] = useState('');

  const filtered = useMemo(() => {
    return portalAssets.filter((item) => {
      const matchSearch = item.name.includes(search) || item.creator.includes(search);
      const matchType = typeFilter === 'all' || item.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [search, typeFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const handleCreate = () => {
    setForm({});
    setModalOpen(true);
  };

  const openDelete = (item: PortalAsset) => {
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
        title="数据门户"
        breadcrumb="首页 / 数据门户"
        actions={
          <button className="dae-btn dae-btn-primary" onClick={handleCreate}>
            <Plus size={16} />
            新建资产
          </button>
        }
      />
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minHeight:0}}>
      <div style={{marginBottom:16}}><SearchFilter
        placeholder="搜索资产名称、创建人..."
        value={search}
        onChange={setSearch}
        extra={
          <div style={{ display: 'flex', gap: 6 }}>
            {typeOptions.map((opt) => (
              <button
                key={opt.key}
                className={`dae-btn dae-btn-sm ${typeFilter === opt.key ? 'dae-btn-primary' : 'dae-btn-secondary'}`}
                onClick={() => setTypeFilter(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        }
      /></div>
      <div style={{flex:1,overflow:'auto',border:'1px solid var(--dae-border)',borderRadius:'var(--dae-radius-lg)',background:'#fff'}}>
        <div style={{overflowX:'auto'}}>
        <table className="dae-table" style={{margin:0}}>
          <thead>
            <tr>
              <th style={{padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>资产名称</th>
              <th style={{padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>类型</th>
              <th style={{padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>创建人</th>
              <th style={{padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>更新时间</th>
              <th style={{padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>状态</th>
              <th style={{width:180,padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>操作</th>
            </tr>
          </thead>
          <tbody>
            {pagedData.map((item) => {
              const Icon = typeIconMap[item.type] || FileBarChart;
              return (
                <tr key={item.id}>
                  <td title={item.name} style={{padding:'9px 14px',fontSize:'12px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon size={16} style={{ color: 'var(--dae-primary)' }} />
                      <span style={{ fontWeight: 500 }}>{item.name}</span>
                    </div>
                  </td>
                  <td style={{padding:'9px 14px',fontSize:'12px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                    <span className="dae-tag dae-tag-blue">{item.typeLabel}</span>
                  </td>
                  <td title={item.creator} style={{padding:'9px 14px',fontSize:'12px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.creator}</td>
                  <td title={item.updatedAt} style={{padding:'9px 14px',fontSize:'12px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.updatedAt}</td>
                  <td style={{padding:'9px 14px',fontSize:'12px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                    <span className={`dae-tag ${item.status === 'published' ? 'dae-tag-green' : 'dae-tag-gray'}`}>
                      {item.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td style={{padding:'9px 14px'}}>
                    <div className="dae-table-actions">
                      <IconAction icon={<Eye size={16} />} label="查看" />
                      <IconAction icon={<Pencil size={16} />} label="编辑" />
                      <IconAction icon={<Trash2 size={16} />} label="删除" onClick={() => openDelete(item)} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        {filtered.length === 0 && (
          <div className="dae-empty">
            <FileBarChart size={40} />
            <p>暂无数据资产，点击「新建资产」创建</p>
          </div>
        )}
      </div>
      {pagedData.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', color: 'var(--dae-ink-secondary)' }}>
            <span>每页</span>
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              style={{ width:60, padding:'4px 6px', border:'1px solid var(--dae-border)', borderRadius:'var(--dae-radius-sm)', fontSize:'13px', background:'#fff', cursor:'pointer' }}>
              {[10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <span>条 / 共 {filtered.length} 条</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ minWidth:28, height:28, padding:'0 6px', borderRadius:'var(--dae-radius-sm)', border:'1px solid var(--dae-border)', background:'#fff',
                color: page===1 ? 'var(--dae-ink-subtle)' : 'var(--dae-ink-secondary)', fontSize:'12px', cursor: page===1?'not-allowed':'pointer' }}
            >&lt;</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pn) => (
              <button key={pn} onClick={() => setPage(pn)} style={{
                minWidth:28, height:28, padding:'0 6px', borderRadius:'var(--dae-radius-sm)',
                border: page===pn ? '1px solid var(--dae-primary)' : '1px solid var(--dae-border)',
                background: page===pn ? 'var(--dae-primary)' : '#fff',
                color: page===pn ? '#fff' : 'var(--dae-ink-secondary)', fontSize:'12px', cursor:'pointer',
              }}>{pn}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ minWidth:28, height:28, padding:'0 6px', borderRadius:'var(--dae-radius-sm)', border:'1px solid var(--dae-border)', background:'#fff',
                color: page===totalPages ? 'var(--dae-ink-subtle)' : 'var(--dae-ink-secondary)', fontSize:'12px', cursor: page===totalPages?'not-allowed':'pointer' }}
            ></button>
            <span style={{fontSize:'13px',color:'var(--dae-ink-secondary)',marginLeft:8}}>跳至</span>
            <input type="text" value={jumpPage} onChange={(e)=>setJumpPage(e.target.value.replace(/\D/g,''))}
              onKeyDown={(e)=>{ if(e.key==='Enter'){ const p=parseInt(jumpPage); if(p>=1&&p<=totalPages)setPage(p); } }}
              style={{ width:44, height:28, padding:'0 6px', textAlign:'center', border:'1px solid var(--dae-border)', borderRadius:'var(--dae-radius-sm)', fontSize:'13px' }} />
            <span style={{ fontSize:'13px', color:'var(--dae-ink-secondary)' }}>页</span>
          </div>
        </div>
      )}
      </div>
      <Drawer
        open={modalOpen}
        title="新建数据资产"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button className="dae-btn dae-btn-secondary" onClick={() => setModalOpen(false)}>取消</button>
            <button className="dae-btn dae-btn-primary" onClick={() => setModalOpen(false)}>确定</button>
          </>
        }
      >
        <div className="dae-form-group">
          <label>资产名称</label>
          <input className="dae-input" placeholder="请输入资产名称" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="dae-form-group">
          <label>资产类型</label>
          <select className="dae-input" value={form.type || 'chart'} onChange={(e) => setForm({ ...form, type: e.target.value as any })}>
            <option value="chart">图表</option>
            <option value="dashboard">仪表盘</option>
            <option value="screen">数据大屏</option>
            <option value="report">报表</option>
          </select>
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
