import React, { useState, useMemo } from 'react';
import { Plus, Gauge, Eye, Pencil, Trash2, ShieldCheck, Copy, Settings, Train, ChevronRight, ChevronDown } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SearchFilter from '../components/SearchFilter';
import Drawer from '../components/Drawer';
import PermissionDrawer from '../components/PermissionDrawer';
import IconAction from '../components/IconAction';
import DeleteConfirm from '../components/DeleteConfirm';
import UserPermSelect from '../components/UserPermSelect';
import StatusSwitch from '../components/StatusSwitch';
import { QueryabilityBadge } from '../components/QueryabilityBadge';
import { ScopeTrainingDrawer } from '../components/ScopeTrainingDrawer';
import { getDatasets } from '../data/semanticLayer';
import { dashboards, setAssetStatus, appendOperationLog, nextOperationLogId, currentUser, type DashboardItem } from '../data/mockData';

export default function DashboardPage() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [permOpen, setPermOpen] = useState(false);
  const [permTarget, setPermTarget] = useState('');
  const [form, setForm] = useState<Partial<DashboardItem>>({});
  const [delOpen, setDelOpen] = useState(false);
  const [delTarget, setDelTarget] = useState<{ id: string; name: string } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [jumpPage, setJumpPage] = useState('');
  const [viewPerm, setViewPerm] = useState<string[]>([]);
  const [managePerm, setManagePerm] = useState<string[]>([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState<DashboardItem | null>(null);
  const [items, setItems] = useState<DashboardItem[]>(dashboards);
  const [copyOpen, setCopyOpen] = useState(false);
  const [copyTarget, setCopyTarget] = useState<DashboardItem | null>(null);
  const [copyName, setCopyName] = useState('');
  const [copyViewPerm, setCopyViewPerm] = useState<string[]>([]);
  const [copyManagePerm, setCopyManagePerm] = useState<string[]>([]);

  // 反向训练入口：在仪表盘列表直接训练其依赖的数据集
  const [trainOpen, setTrainOpen] = useState(false);
  const [trainTarget, setTrainTarget] = useState<{ id: string; name: string } | null>(null);
  const [queryRefresh, setQueryRefresh] = useState(0);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const datasetMap = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    getDatasets().forEach((d) => map.set(d.datasetName, { id: d.id, name: d.datasetName }));
    return map;
  }, [queryRefresh]);
  const openTrain = (item: DashboardItem) => {
    setTrainTarget({ id: item.id, name: item.name });
    setTrainOpen(true);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openView = (item: DashboardItem) => {
    setViewItem(item);
    setViewOpen(true);
  };

  const openModal = (item: DashboardItem) => {
    setForm(item);
    setModalOpen(true);
  };

  const filtered = useMemo(() => {
    return items.filter((item) => item.name.includes(search) || item.creator.includes(search));
  }, [search, items]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedItems = filtered.slice((page - 1) * pageSize, page * pageSize);

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

  const toggleStatus = (item: DashboardItem) => {
    const newStatus = item.status === 'online' ? 'offline' : 'online';
    setAssetStatus('dashboard', item.id, newStatus);
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i))
    );
    appendOperationLog({
      id: nextOperationLogId(),
      user: currentUser.name,
      account: currentUser.email,
      module: '仪表盘',
      menuId: 'dashboard',
      action: newStatus === 'online' ? '上线' : '下线',
      actionType: 'publish',
      detail: `将仪表盘「${item.name}」${newStatus === 'online' ? '上线' : '下线'}`,
      assetId: item.id,
      assetType: 'dashboard',
      ip: '192.168.1.100',
      time: new Date().toISOString().slice(0, 16).replace('T', ' '),
    });
  };

  const openCopy = (item: DashboardItem) => {
    setCopyTarget(item);
    setCopyName(item.name + '_副本');
    setCopyViewPerm([]);
    setCopyManagePerm([]);
    setCopyOpen(true);
  };

  const confirmCopy = () => {
    if (!copyTarget) return;
    const newItem: DashboardItem = {
      ...copyTarget,
      id: 'DB' + String(Date.now()).slice(-3),
      name: copyName,
      status: 'pending',
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\//g, '-'),
    };
    setItems((prev) => [newItem, ...prev]);
    setCopyOpen(false);
    setCopyTarget(null);
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
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minHeight:0}}>
      <div style={{marginBottom:16}}><SearchFilter placeholder="搜索仪表盘名称、创建人..." value={search} onChange={setSearch} /></div>
      <div style={{flex:1,overflow:'auto',border:'1px solid var(--dae-border)',borderRadius:'var(--dae-radius-lg)',background:'#fff'}}>
        <div style={{overflowX:'auto'}}>
        <table className="dae-table" style={{margin:0}}>
          <thead>
            <tr>
              <th style={{padding:'10px 8px',fontSize:'12px',fontWeight:600,width:36}}></th>
              <th style={{padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>仪表盘名称</th>
              <th style={{padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>图表数量</th>
              <th style={{padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>创建人</th>
              <th style={{padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>更新时间</th>
              <th style={{padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>状态</th>
              <th style={{padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>创建时间</th>
              <th style={{padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>可问数</th>
              <th style={{width:220,padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>操作</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item) => {
              const expanded = expandedIds.has(item.id);
              const datasetNames = Array.from(new Set((item.charts || []).map((c) => c.datasetName).filter((n): n is string => Boolean(n))));
              return (
                <React.Fragment key={item.id}>
                  <tr>
                    <td style={{padding:'9px 8px',fontSize:'12px',whiteSpace:'nowrap',textAlign:'center'}}>
                      <button
                        onClick={() => toggleExpand(item.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 22,
                          height: 22,
                          borderRadius: 5,
                          border: '1px solid var(--dae-border)',
                          background: '#fff',
                          color: 'var(--dae-ink-secondary)',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    </td>
                    <td title={item.name} style={{padding:'9px 14px',fontSize:'12px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Gauge size={16} style={{ color: 'var(--dae-primary)' }} />
                        <span style={{ fontWeight: 500 }}>{item.name}</span>
                      </div>
                    </td>
                    <td title={`${item.chartCount} 个`} style={{padding:'9px 14px',fontSize:'12px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.chartCount} 个</td>
                    <td title={item.creator} style={{padding:'9px 14px',fontSize:'12px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.creator}</td>
                    <td title={item.updatedAt} style={{padding:'9px 14px',fontSize:'12px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.updatedAt}</td>
                    <td style={{padding:'9px 14px',fontSize:'12px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                      {item.status === 'pending' && <span className="dae-tag dae-tag-gray" style={{ whiteSpace: 'nowrap' }}>待上线</span>}
                      {item.status === 'online' && <span className="dae-tag dae-tag-green" style={{ whiteSpace: 'nowrap' }}>已上线</span>}
                      {item.status === 'offline' && <span style={{ background:'#fff7ed', color:'#c2410c', border:'1px solid #fed7aa', padding:'2px 10px', borderRadius:999, fontSize:12, whiteSpace:'nowrap' }}>已下线</span>}
                    </td>
                    <td title={item.createdAt} style={{padding:'9px 14px',fontSize:'12px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.createdAt}</td>
                    <td style={{padding:'9px 14px',fontSize:'12px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                      <QueryabilityBadge type="dashboard" id={item.id} name={item.name} refreshKey={queryRefresh} />
                    </td>
                    <td style={{padding:'9px 14px'}}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <StatusSwitch status={item.status} onToggle={() => toggleStatus(item)} />
                        <IconAction icon={<Eye size={16} />} label="查看" onClick={() => { window.location.hash = `page=dashboard-preview&dashboardId=${item.id}`; }} />
                        <IconAction icon={<Settings size={16} />} label="配置" onClick={() => { window.location.hash = `page=dashboard-config&dashboardId=${item.id}`; }} />
                        <IconAction icon={<Train size={16} />} label="训练" onClick={() => openTrain(item)} />
                        <IconAction icon={<Pencil size={16} />} label="编辑" onClick={() => openModal(item)} />
                        <IconAction icon={<Copy size={16} />} label="复制" onClick={() => openCopy(item)} />
                        <IconAction icon={<Trash2 size={16} />} label="删除" onClick={() => openDelete(item)} />
                      </div>
                    </td>
                  </tr>
                  {expanded && (
                    <tr>
                      <td colSpan={9} style={{ padding: 0 }}>
                        <div style={{ padding: '10px 16px 10px 54px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: 12 }}>
                          <div style={{ color: '#64748b', marginBottom: 6 }}>已使用数据集：</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {datasetNames.length === 0 && <span style={{ color: '#94a3b8' }}>未关联数据集</span>}
                            {datasetNames.map((name) => {
                              const ds = datasetMap.get(name);
                              return (
                                <button
                                  key={name}
                                  onClick={() => { if (ds) window.location.hash = `page=dataset-preview&datasetId=${ds.id}&from=dashboard`; }}
                                  disabled={!ds}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    padding: '4px 10px',
                                    borderRadius: 999,
                                    border: '1px solid #bfdbfe',
                                    background: ds ? '#eff6ff' : '#f1f5f9',
                                    color: ds ? '#1677FF' : '#94a3b8',
                                    fontSize: 12,
                                    cursor: ds ? 'pointer' : 'not-allowed',
                                  }}
                                >
                                  {name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        </div>
        {filtered.length === 0 && (
          <div className="dae-empty">
            <Gauge size={40} />
            <p>暂无仪表盘，点击「新建仪表盘」创建</p>
          </div>
        )}
      </div>
      {paginatedItems.length > 0 && (
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button key={pageNum} onClick={() => setPage(pageNum)} style={{
                minWidth:28, height:28, padding:'0 6px', borderRadius:'var(--dae-radius-sm)',
                border: page===pageNum ? '1px solid var(--dae-primary)' : '1px solid var(--dae-border)',
                background: page===pageNum ? 'var(--dae-primary)' : '#fff',
                color: page===pageNum ? '#fff' : 'var(--dae-ink-secondary)', fontSize:'12px', cursor:'pointer',
              }}>{pageNum}</button>
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
        title="新建仪表盘"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button className="dae-btn dae-btn-secondary" onClick={() => setModalOpen(false)}>取消</button>
            <button className="dae-btn dae-btn-primary" onClick={() => setModalOpen(false)}>确定</button>
          </>
        }
      >
        {form.id && form.status === 'online' && (
          <div style={{background:'#fef3c7',color:'#92400e',padding:'8px 12px',borderRadius:6,fontSize:13,marginBottom:12}}>
            当前为已上线状态，编辑保存后将自动变为待上线
          </div>
        )}
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
              <div className="dae-input" style={{ background: 'var(--dae-surface)', cursor: 'default' }}>
                {viewItem.status === 'pending' && <span className="dae-tag dae-tag-gray" style={{ whiteSpace: 'nowrap' }}>待上线</span>}
                {viewItem.status === 'online' && <span className="dae-tag dae-tag-green" style={{ whiteSpace: 'nowrap' }}>已上线</span>}
                {viewItem.status === 'offline' && <span style={{ background:'#fff7ed', color:'#c2410c', border:'1px solid #fed7aa', padding:'2px 10px', borderRadius:999, fontSize:12, whiteSpace:'nowrap' }}>已下线</span>}
              </div>
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
        content={delTarget
          ? (items.find((i) => i.id === delTarget.id)?.status === 'online'
            ? `「${delTarget.name}」当前为已上线状态，请先下线后再删除。`
            : `确定要删除「${delTarget.name}」吗？删除后不可恢复。`)
          : ''
        }
        onClose={() => { setDelOpen(false); setDelTarget(null); }}
        onConfirm={confirmDelete}
      />

      {/* 复制弹窗 */}
      <Drawer
        open={copyOpen}
        title="复制仪表盘"
        onClose={() => setCopyOpen(false)}
        footer={
          <>
            <button className="dae-btn dae-btn-secondary" onClick={() => setCopyOpen(false)}>取消</button>
            <button className="dae-btn dae-btn-primary" onClick={confirmCopy}>确认</button>
          </>
        }
      >
        <div className="dae-form-group">
          <label>仪表盘名称</label>
          <input className="dae-input" value={copyName} onChange={(e) => setCopyName(e.target.value)} />
        </div>
        <UserPermSelect label="查看权限" selected={copyViewPerm} onChange={setCopyViewPerm} />
        <UserPermSelect label="管理权限" selected={copyManagePerm} onChange={setCopyManagePerm} />
      </Drawer>

      {/* 反向训练：在仪表盘列表直接训练其依赖的数据集 */}
      <ScopeTrainingDrawer
        open={trainOpen}
        type="dashboard"
        id={trainTarget?.id || ''}
        name={trainTarget?.name || ''}
        onClose={() => setTrainOpen(false)}
        onTrained={() => setQueryRefresh((n) => n + 1)}
      />
    </div>
  );
}
