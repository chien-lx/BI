import React, { useState, useMemo } from 'react';
import { Plus, FileText, Pencil, Trash2, Eye, Settings, Copy, Train, ChevronRight, ChevronDown } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SearchFilter from '../components/SearchFilter';
import Drawer from '../components/Drawer';
import IconAction from '../components/IconAction';
import DeleteConfirm from '../components/DeleteConfirm';
import { reports, setAssetStatus, appendOperationLog, nextOperationLogId, currentUser, type Report } from '../data/mockData';
import UserPermSelect from '../components/UserPermSelect';
import StatusSwitch from '../components/StatusSwitch';
import { QueryabilityBadge } from '../components/QueryabilityBadge';
import { ScopeTrainingDrawer } from '../components/ScopeTrainingDrawer';
import { getDatasets } from '../data/semanticLayer';

const thStyle = {
  padding: '10px 14px', fontSize: '12px', fontWeight: 600,
  whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis',
};

const tdStyle = {
  padding: '9px 14px', fontSize: '12px',
  whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis',
};

export default function ReportPage() {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<Report[]>(reports);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<Report>>({});
  const [viewPerm, setViewPerm] = useState<string[]>([]);
  const [managePerm, setManagePerm] = useState<string[]>([]);
  const [delOpen, setDelOpen] = useState(false);
  const [delTarget, setDelTarget] = useState<{ id: string; name: string } | null>(null);
  const [copyOpen, setCopyOpen] = useState(false);
  const [copyTarget, setCopyTarget] = useState<Report | null>(null);
  const [copyName, setCopyName] = useState('');
  const [copyViewPerm, setCopyViewPerm] = useState<string[]>([]);
  const [copyManagePerm, setCopyManagePerm] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [jumpPage, setJumpPage] = useState('');

  // 反向训练入口：在报表列表直接训练其依赖的数据集
  const [trainOpen, setTrainOpen] = useState(false);
  const [trainTarget, setTrainTarget] = useState<{ id: string; name: string } | null>(null);
  const [queryRefresh, setQueryRefresh] = useState(0);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const datasetMap = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    getDatasets().forEach((d) => map.set(d.datasetName, { id: d.id, name: d.datasetName }));
    return map;
  }, [queryRefresh]);
  const openTrain = (item: Report) => {
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

  const filtered = useMemo(() => {
    return items.filter((item) =>
      item.name.includes(search) || item.datasetName.includes(search) || item.creator.includes(search)
    );
  }, [search, items]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const openDelete = (item: Report) => {
    if (item.status === 'online') {
      setDelTarget({ id: item.id, name: item.name });
      setDelOpen(true);
      return;
    }
    setDelTarget({ id: item.id, name: item.name });
    setDelOpen(true);
  };

  const confirmDelete = () => {
    // In real app, call API to delete
    setItems(items.filter((i) => i.id !== delTarget?.id));
    setDelOpen(false);
    setDelTarget(null);
  };

  const toggleOnlineStatus = (item: Report) => {
    const newStatus = item.status === 'online' ? 'offline' : 'online';
    if (!window.confirm(`确定要将「${item.name}」${item.status === 'online' ? '下线' : '上线'}吗？`)) return;
    // 同步到共享数据，保证数据门户能看到最新上线状态
    setAssetStatus('report', item.id, newStatus);
    setItems(items.map((i) => i.id === item.id ? { ...i, status: newStatus } : i));
    appendOperationLog({
      id: nextOperationLogId(),
      user: currentUser.name,
      account: currentUser.email,
      module: '报表',
      menuId: 'report',
      action: newStatus === 'online' ? '上线' : '下线',
      actionType: 'publish',
      detail: `将报表「${item.name}」${newStatus === 'online' ? '上线' : '下线'}`,
      assetId: item.id,
      assetType: 'report',
      ip: '192.168.1.100',
      time: new Date().toISOString().slice(0, 16).replace('T', ' '),
    });
  };

  const openEdit = (item: Report) => {
    setForm(item);
    setViewPerm(item.viewPerm || []);
    setManagePerm(item.managePerm || []);
    setModalOpen(true);
  };

  const openCopy = (item: Report) => {
    setCopyTarget(item);
    setCopyName(item.name + '_副本');
    setCopyViewPerm([]);
    setCopyManagePerm([]);
    setCopyOpen(true);
  };

  const confirmCopy = () => {
    // In real app, call API to copy
    setCopyOpen(false);
    setCopyTarget(null);
    setCopyName('');
    setCopyViewPerm([]);
    setCopyManagePerm([]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        title="报表"
        breadcrumb="数据分析 / 报表"
        actions={
          <button className="dae-btn dae-btn-primary" onClick={() => { setForm({ status: 'pending' }); setViewPerm([]); setManagePerm([]); setModalOpen(true); }}>
            <Plus size={16} />
            新建报表
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
          <SearchFilter placeholder="搜索报表名称、数据集、创建人..." value={search} onChange={setSearch} />
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
                <th style={{ ...thStyle, width: 36, padding: '10px 8px' }}></th>
                <th style={thStyle}>报表名称</th>
                <th style={thStyle}>数据集</th>
                <th style={thStyle}>创建人</th>
                <th style={thStyle}>更新人</th>
                <th style={thStyle}>更新时间</th>
                <th style={thStyle}>状态</th>
                <th style={thStyle}>可问数</th>
                <th style={{ ...thStyle, width: 200 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {pagedData.map((item) => {
                const expanded = expandedIds.has(item.id);
                const ds = datasetMap.get(item.datasetName);
                return (
                  <React.Fragment key={item.id}>
                    <tr>
                      <td style={{ ...tdStyle, width: 36, padding: '9px 8px', textAlign: 'center' }}>
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
                      <td title={item.name} style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FileText size={16} style={{ color: 'var(--dae-primary)', minWidth: 16 }} />
                          <span style={{ fontWeight: 500 }}>{item.name}</span>
                        </div>
                      </td>
                      <td title={item.datasetName} style={tdStyle}>{item.datasetName}</td>
                      <td title={item.creator} style={tdStyle}>{item.creator}</td>
                      <td title={item.updater} style={tdStyle}>{item.updater}</td>
                      <td title={item.updatedAt} style={tdStyle}>{item.updatedAt}</td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                        {item.status === 'online' && (
                          <span className="dae-tag dae-tag-green">已上线</span>
                        )}
                        {item.status === 'pending' && (
                          <span className="dae-tag dae-tag-gray">待上线</span>
                        )}
                        {item.status === 'offline' && (
                          <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 4, fontSize: 12, lineHeight: '20px', background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>已下线</span>
                        )}
                      </td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                        <QueryabilityBadge type="report" id={item.id} name={item.name} refreshKey={queryRefresh} />
                      </td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                        <div className="dae-table-actions">
                          {/* Switch 开关：上下线切换 */}
                          <StatusSwitch status={item.status} onToggle={() => toggleOnlineStatus(item)} />
                          <IconAction icon={<Eye size={16} />} label="预览" onClick={() => { window.location.hash = '#page=report-preview'; }} />
                          <IconAction icon={<Pencil size={16} />} label="编辑" onClick={() => openEdit(item)} />
                          <IconAction icon={<Settings size={16} />} label="配置" onClick={() => { window.location.hash = '#page=report-config'; }} />
                          <IconAction icon={<Train size={16} />} label="训练" onClick={() => openTrain(item)} />
                          <IconAction icon={<Copy size={16} />} label="复制" onClick={() => openCopy(item)} />
                          <IconAction icon={<Trash2 size={16} />} label="删除" onClick={() => {
                            if (item.status === 'online') {
                              alert('该报表已上线，请先下线后再删除');
                              return;
                            }
                            openDelete(item);
                          }} />
                        </div>
                      </td>
                    </tr>
                    {expanded && (
                      <tr>
                        <td colSpan={9} style={{ padding: 0 }}>
                          <div style={{ padding: '10px 16px 10px 54px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: 12 }}>
                            <div style={{ color: '#64748b', marginBottom: 6 }}>已使用数据集：</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                              {ds ? (
                                <button
                                  onClick={() => { window.location.hash = `page=dataset-preview&datasetId=${ds.id}&from=report`; }}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    padding: '4px 10px',
                                    borderRadius: 999,
                                    border: '1px solid #bfdbfe',
                                    background: '#eff6ff',
                                    color: '#1677FF',
                                    fontSize: 12,
                                    cursor: 'pointer',
                                  }}
                                >
                                  {ds.name}
                                </button>
                              ) : (
                                <span style={{ color: '#94a3b8' }}>未关联数据集</span>
                              )}
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
              <FileText size={40} />
              <p>暂无报表，点击「新建报表」创建</p>
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
      <Drawer
        open={modalOpen}
        title={form.id ? '编辑报表' : '新建报表'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button className="dae-btn dae-btn-secondary" onClick={() => setModalOpen(false)}>取消</button>
            <button className="dae-btn dae-btn-primary" onClick={() => setModalOpen(false)}>确定</button>
          </>
        }
      >
        <div className="dae-form-group">
          <label>报表名称</label>
          <input className="dae-input" placeholder="请输入报表名称" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="dae-form-group">
          <label>数据集</label>
          <select className="dae-input" value={form.datasetName || ''} onChange={(e) => setForm({ ...form, datasetName: e.target.value })}>
            <option value="">请选择数据集</option>
            <option>订单明细数据集</option>
            <option>用户画像数据集</option>
            <option>商品信息数据集</option>
            <option>物流轨迹数据集</option>
            <option>财务报表数据集</option>
          </select>
        </div>

        {/* 权限设置 */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--dae-border)' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--dae-primary)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            权限设置
          </div>

          <UserPermSelect label="查看权限" selected={viewPerm} onChange={setViewPerm} />
          <UserPermSelect label="管理权限" selected={managePerm} onChange={setManagePerm} />
        </div>
      </Drawer>

      <DeleteConfirm
        open={delOpen}
        content={delTarget ? `确定要删除「${delTarget.name}」吗？删除后不可恢复。` : ''}
        onClose={() => { setDelOpen(false); setDelTarget(null); }}
        onConfirm={confirmDelete}
      />

      <Drawer
        open={copyOpen}
        title="复制报表"
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
          <input className="dae-input" placeholder="请输入报表名称" value={copyName} onChange={(e) => setCopyName(e.target.value)} />
        </div>
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--dae-border)' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--dae-primary)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            权限设置
          </div>
          <UserPermSelect label="查看权限" selected={copyViewPerm} onChange={setCopyViewPerm} />
          <UserPermSelect label="管理权限" selected={copyManagePerm} onChange={setCopyManagePerm} />
        </div>
      </Drawer>

      {/* 反向训练：在报表列表直接训练其依赖的数据集 */}
      <ScopeTrainingDrawer
        open={trainOpen}
        type="report"
        id={trainTarget?.id || ''}
        name={trainTarget?.name || ''}
        onClose={() => setTrainOpen(false)}
        onTrained={() => setQueryRefresh((n) => n + 1)}
      />
    </div>
  );
}
