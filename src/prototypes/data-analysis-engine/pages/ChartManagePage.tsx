import React, { useState, useMemo } from 'react';
import { Plus, BarChart3, Eye, Pencil, Trash2, ShieldCheck, Settings, Copy } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SearchFilter from '../components/SearchFilter';
import Drawer from '../components/Drawer';
import PermissionDrawer from '../components/PermissionDrawer';
import IconAction from '../components/IconAction';
import DeleteConfirm from '../components/DeleteConfirm';
import UserPermSelect from '../components/UserPermSelect';
import StatusSwitch from '../components/StatusSwitch';
import ChartRenderer from '../components/ChartRenderer';
import { charts, type ChartItem, chartSampleData, pieSampleData } from '../data/mockData';
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
  const [pageSize, setPageSize] = useState(10);
  const [jumpPage, setJumpPage] = useState('');
  const [viewPerm, setViewPerm] = useState<string[]>([]);
  const [managePerm, setManagePerm] = useState<string[]>([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState<ChartItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<ChartItem | null>(null);
  const [items, setItems] = useState<ChartItem[]>(charts);
  const [copyOpen, setCopyOpen] = useState(false);
  const [copyTarget, setCopyTarget] = useState<ChartItem | null>(null);
  const [copyName, setCopyName] = useState('');
  const [copyViewPerm, setCopyViewPerm] = useState<string[]>([]);
  const [copyManagePerm, setCopyManagePerm] = useState<string[]>([]);

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
    setViewPerm(item.viewPerm || []);
    setManagePerm(item.managePerm || []);
    setModalOpen(true);
  };

  const filtered = useMemo(() => {
    return items.filter((item) =>
      item.name.includes(search) || item.type.includes(search) || item.datasetName.includes(search)
    );
  }, [search, items]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

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

  const toggleStatus = (item: ChartItem) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? { ...i, status: i.status === 'online' ? 'offline' : 'online' }
          : i
      )
    );
  };

  const openCopy = (item: ChartItem) => {
    setCopyTarget(item);
    setCopyName(item.name + '_副本');
    setCopyViewPerm([]);
    setCopyManagePerm([]);
    setCopyOpen(true);
  };

  const confirmCopy = () => {
    if (!copyTarget) return;
    const newItem: ChartItem = {
      ...copyTarget,
      id: 'CH' + String(Date.now()).slice(-3),
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
        title="图表管理"
        breadcrumb="数据分析 / 图表管理"
        actions={
          <button className="dae-btn dae-btn-primary" onClick={() => { setForm({}); setViewPerm([]); setManagePerm([]); setModalOpen(true); }}>
            <Plus size={16} />
            新建图表
          </button>
        }
      />
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minHeight:0}}>
        {/* 搜索框 - 不滚动 */}
        <div style={{marginBottom:16}}>
          <SearchFilter placeholder="搜索图表名称、类型、数据集..." value={search} onChange={setSearch} />
        </div>

        {/* 表格 - 可滚动 */}
        <div style={{flex:1,overflow:'auto',border:'1px solid var(--dae-border)',borderRadius:'var(--dae-radius-lg)',background:'#fff'}}>
          <div style={{overflowX:'auto'}}>
          <table className="dae-table" style={{margin:0}}>
            <thead>
              <tr>
                <th style={{padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>图表名称</th>
                <th style={{padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>图表类型</th>
                <th style={{padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>数据集</th>
                <th style={{padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>创建人</th>
                <th style={{padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>更新人</th>
                <th style={{padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>更新时间</th>
                <th style={{padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>状态</th>
                <th style={{padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>创建时间</th>
                <th style={{width:260,padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>操作</th>
              </tr>
            </thead>
            <tbody>
              {pagedData.map((item) => (
                <tr key={item.id}>
                  <td title={item.name} style={{padding:'9px 14px',fontSize:'12px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <BarChart3 size={16} style={{ color: 'var(--dae-primary)' }} />
                      <span style={{ fontWeight: 500 }}>{item.name}</span>
                    </div>
                  </td>
                  <td title={item.type} style={{padding:'9px 14px',fontSize:'12px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}><span className="dae-tag dae-tag-blue">{item.type}</span></td>
                  <td title={item.datasetName} style={{padding:'9px 14px',fontSize:'12px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.datasetName}</td>
                  <td title={item.creator} style={{padding:'9px 14px',fontSize:'12px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.creator}</td>
                  <td title={item.updater} style={{padding:'9px 14px',fontSize:'12px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.updater}</td>
                  <td title={item.updatedAt} style={{padding:'9px 14px',fontSize:'12px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.updatedAt}</td>
                  <td style={{padding:'9px 14px',fontSize:'12px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                    {item.status === 'pending' && <span className="dae-tag dae-tag-gray" style={{ whiteSpace: 'nowrap' }}>待上线</span>}
                    {item.status === 'online' && <span className="dae-tag dae-tag-green" style={{ whiteSpace: 'nowrap' }}>已上线</span>}
                    {item.status === 'offline' && <span style={{ background:'#fff7ed', color:'#c2410c', border:'1px solid #fed7aa', padding:'2px 10px', borderRadius:999, fontSize:12, whiteSpace:'nowrap' }}>已下线</span>}
                  </td>
                  <td title={item.createdAt} style={{padding:'9px 14px',fontSize:'12px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.createdAt}</td>
                  <td style={{padding:'9px 14px'}}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {/* Switch 开关 */}
                      <StatusSwitch status={item.status} onToggle={() => toggleStatus(item)} />
                      <IconAction icon={<Eye size={16} />} label="预览" onClick={() => openPreview(item)} />
                      <IconAction icon={<Pencil size={16} />} label="编辑" onClick={() => openModal(item)} />
                      <IconAction icon={<Settings size={16} />} label="配置" onClick={() => openConfig(item)} />
                      <IconAction icon={<Copy size={16} />} label="复制" onClick={() => openCopy(item)} />
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
              <BarChart3 size={40} />
              <p>暂无图表，点击「新建图表」创建</p>
            </div>
          )}
        </div>

        {/* 分页 - 不滚动，固定底部 */}
        {pagedData.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 0', borderTop: '1px solid var(--dae-border)',
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
              {/* 上一页 */}
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ minWidth:28, height:28, padding:'0 6px', borderRadius:'var(--dae-radius-sm)', border:'1px solid var(--dae-border)', background:'#fff',
                  color: page===1 ? 'var(--dae-ink-subtle)' : 'var(--dae-ink-secondary)', fontSize:'12px', cursor: page===1?'not-allowed':'pointer' }}
              >&lt;</button>
              {/* 页码按钮 */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button key={pageNum} onClick={() => setPage(pageNum)} style={{
                  minWidth:28, height:28, padding:'0 6px', borderRadius:'var(--dae-radius-sm)',
                  border: page===pageNum ? '1px solid var(--dae-primary)' : '1px solid var(--dae-border)',
                  background: page===pageNum ? 'var(--dae-primary)' : '#fff',
                  color: page===pageNum ? '#fff' : 'var(--dae-ink-secondary)', fontSize:'12px', cursor:'pointer',
                }}>{pageNum}</button>
              ))}
              {/* 下一页 */}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ minWidth:28, height:28, padding:'0 6px', borderRadius:'var(--dae-radius-sm)', border:'1px solid var(--dae-border)', background:'#fff',
                  color: page===totalPages ? 'var(--dae-ink-subtle)' : 'var(--dae-ink-secondary)', fontSize:'12px', cursor: page===totalPages?'not-allowed':'pointer' }}
              >{'>'}</button>
              {/* 跳转 */}
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
        title={form.id ? '编辑图表' : '新建图表'}
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
          <label>图表名称</label>
          <input className="dae-input" placeholder="请输入图表名称" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        {!form.id && (
          <>
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
          </>
        )}
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
      >
        {previewItem && (
          <div style={{ padding: '8px 0' }}>
            {(() => {
              const typeMap: Record<string, 'bar' | 'line' | 'area' | 'pie'> = {
                '折线图': 'line',
                '柱状图': 'bar',
                '饼图': 'pie',
                '面积图': 'area',
                '漏斗图': 'bar',
                '明细表': 'bar',
                '箱线图': 'bar',
                '堆叠条形图': 'bar',
                '雷达图': 'bar',
                '仪表盘图': 'pie',
                '桑基图': 'bar',
                '环形图': 'pie',
                '词云图': 'pie',
                '关系图': 'bar',
                '指标卡组': 'bar',
                '时间轴': 'line',
                '瀑布图': 'bar',
              };
              const chartType = typeMap[previewItem.type] || 'bar';
              const isPie = chartType === 'pie';
              return (
                <ChartRenderer
                  type={chartType}
                  data={isPie ? pieSampleData : chartSampleData}
                  yKeys={isPie ? undefined : ['value', 'value2']}
                  height={380}
                />
              );
            })()}
          </div>
        )}
      </Drawer>

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
        title="复制图表"
        onClose={() => setCopyOpen(false)}
        footer={
          <>
            <button className="dae-btn dae-btn-secondary" onClick={() => setCopyOpen(false)}>取消</button>
            <button className="dae-btn dae-btn-primary" onClick={confirmCopy}>确认</button>
          </>
        }
      >
        <div className="dae-form-group">
          <label>图表名称</label>
          <input className="dae-input" value={copyName} onChange={(e) => setCopyName(e.target.value)} />
        </div>
        <UserPermSelect label="查看权限" selected={copyViewPerm} onChange={setCopyViewPerm} />
        <UserPermSelect label="管理权限" selected={copyManagePerm} onChange={setCopyManagePerm} />
      </Drawer>
    </div>
  );
}
