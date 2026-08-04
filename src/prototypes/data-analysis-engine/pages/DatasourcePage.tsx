import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Database, ShieldCheck, TestTube, CheckCircle, X, ChevronDown, Eye, Pencil, Trash2, Copy } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SearchFilter from '../components/SearchFilter';
import Drawer from '../components/Drawer';
import IconAction from '../components/IconAction';
import DeleteConfirm from '../components/DeleteConfirm';
import StatusSwitch from '../components/StatusSwitch';
import { dataSources, type DataSource } from '../data/mockData';

type ConnStatus = 'idle' | 'testing' | 'success' | 'error';

const DB_TYPES = ['MySQL', 'PostgreSQL', 'ClickHouse', 'Oracle', 'SQLServer'];
const FILE_TYPES = ['Excel', 'CSV'];
const API_TYPES = ['API', 'Webhook'];
const ALL_TYPES = [...DB_TYPES, ...FILE_TYPES, ...API_TYPES];

const mockUsers = ['admin', 'zhangsan', 'lisi', 'wangwu', 'data_team'];

function UserPermSelect({
  label,
  selected,
  onChange,
}: {
  label: string;
  selected: string[];
  onChange: (users: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const addUser = (user: string) => {
    if (!selected.includes(user)) {
      onChange([...selected, user]);
    }
    setOpen(false);
  };

  const removeUser = (user: string) => {
    onChange(selected.filter((u) => u !== user));
  };

  const available = mockUsers.filter((u) => !selected.includes(u));

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--dae-ink-secondary)', marginBottom: 8, display: 'block' }}>
        {label}
      </label>
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="dae-input"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            background: '#fff',
            minHeight: 44,
            height: 'auto',
            padding: selected.length > 0 ? '6px 12px' : '8px 12px',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', flex: 1 }}>
            {selected.map((user) => (
              <span
                key={user}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 8px',
                  fontSize: 13,
                  borderRadius: 'var(--dae-radius-sm)',
                  border: '1px solid var(--dae-primary)',
                  background: 'var(--dae-primary-light)',
                  color: 'var(--dae-primary)',
                }}
              >
                {user}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeUser(user); }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--dae-primary)',
                    cursor: 'pointer',
                    marginLeft: 2,
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {selected.length === 0 && (
              <span style={{ color: 'var(--dae-ink-subtle)', fontSize: 14 }}>选择用户添加...</span>
            )}
          </div>
          <ChevronDown size={16} style={{ color: 'var(--dae-ink-muted)', flexShrink: 0, marginLeft: 8 }} />
        </button>
        {open && available.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              background: '#fff',
              border: '1px solid var(--dae-border)',
              borderRadius: 'var(--dae-radius-md)',
              boxShadow: 'var(--dae-shadow-md)',
              zIndex: 10,
              maxHeight: 200,
              overflowY: 'auto',
            }}
          >
            {available.map((user) => (
              <button
                key={user}
                type="button"
                onClick={() => addUser(user)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  fontSize: 13,
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--dae-ink)',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--dae-border)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dae-surface-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {user}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DatasourcePage() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState<DataSource | null>(null);
  const [form, setForm] = useState<Partial<DataSource>>({ type: 'MySQL' });
  const [connStatus, setConnStatus] = useState<ConnStatus>('idle');
  const [viewPerm, setViewPerm] = useState<string[]>([]);
  const [managePerm, setManagePerm] = useState<string[]>([]);
  const [delOpen, setDelOpen] = useState(false);
  const [delTarget, setDelTarget] = useState<{ id: string; name: string } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [jumpPage, setJumpPage] = useState('');
  const [items, setItems] = useState<DataSource[]>(dataSources);
  const [copyOpen, setCopyOpen] = useState(false);
  const [copyTarget, setCopyTarget] = useState<DataSource | null>(null);
  const [copyName, setCopyName] = useState('');
  const [copyViewPerm, setCopyViewPerm] = useState<string[]>([]);
  const [copyManagePerm, setCopyManagePerm] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return items.filter((item) =>
      item.name.includes(search) || item.type.includes(search) || item.host.includes(search)
    );
  }, [search, items]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const typeCategory = useMemo(() => {
    const t = form.type || 'MySQL';
    if (DB_TYPES.includes(t)) return 'db';
    if (FILE_TYPES.includes(t)) return 'file';
    return 'api';
  }, [form.type]);

  const canSave = useMemo(() => {
    if (!form.name) return false;
    if (typeCategory === 'db') {
      return connStatus === 'success' && form.host && form.database;
    }
    if (typeCategory === 'file') {
      return !!form.database;
    }
    return !!form.host;
  }, [form, typeCategory, connStatus]);

  const handleTest = () => {
    setConnStatus('testing');
    setTimeout(() => {
      if (form.host || form.database) {
        setConnStatus('success');
      } else {
        setConnStatus('error');
      }
    }, 1200);
  };

  const openModal = (item?: DataSource) => {
    if (item) {
      setForm({ ...item });
    } else {
      setForm({ type: 'MySQL' });
    }
    setConnStatus('idle');
    setViewPerm([]);
    setManagePerm([]);
    setModalOpen(true);
  };

  const openView = (item: DataSource) => {
    setViewItem(item);
    setViewOpen(true);
  };

  const openDelete = (item: DataSource) => {
    setDelTarget({ id: item.id, name: item.name });
    setDelOpen(true);
  };

  const confirmDelete = () => {
    // In real app, call API to delete
    setDelOpen(false);
    setDelTarget(null);
  };

  const toggleStatus = (item: DataSource) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? { ...i, status: i.status === 'offline' ? 'online' : 'offline' }
          : i
      )
    );
  };

  const openCopy = (item: DataSource) => {
    setCopyTarget(item);
    setCopyName(item.name + '_副本');
    setCopyViewPerm([]);
    setCopyManagePerm([]);
    setCopyOpen(true);
  };

  const confirmCopy = () => {
    if (!copyTarget) return;
    const newItem: DataSource = {
      ...copyTarget,
      id: 'DS' + String(Date.now()).slice(-3),
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
        title="数据源"
        breadcrumb="数据准备 / 数据源"
        actions={
          <button className="dae-btn dae-btn-primary" onClick={() => openModal()}>
            <Plus size={16} />
            新建数据源
          </button>
        }
      />
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minHeight:0}}>
        {/* 搜索框 - 不滚动 */}
        <div style={{marginBottom:16}}>
          <SearchFilter placeholder="搜索数据源名称、类型、地址..." value={search} onChange={setSearch} />
        </div>

        {/* 表格 - 可滚动 */}
        <div style={{flex:1,overflow:'auto',border:'1px solid var(--dae-border)',borderRadius:'var(--dae-radius-lg)',background:'#fff'}}>
          <div style={{overflowX:'auto'}}>
          <table className="dae-table" style={{margin:0}}>
            <thead>
              <tr>
                <th style={{padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>数据源名称</th>
                <th style={{padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>类型</th>
                <th style={{padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>连接地址</th>
                <th style={{padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>数据库</th>
                <th style={{padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>连接状态</th>
                <th style={{padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>状态</th>
                <th style={{padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>创建人</th>
                <th style={{padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>修改人</th>
                <th style={{padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>修改时间</th>
                <th style={{width:220,padding:'10px 14px',fontSize:'12px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>操作</th>
              </tr>
            </thead>
            <tbody>
              {pagedData.map((item) => (
                <tr key={item.id}>
                  <td title={item.name} style={{padding:'9px 14px',fontSize:'12px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Database size={16} style={{ color: 'var(--dae-primary)' }} />
                      <span style={{ fontWeight: 500 }}>{item.name}</span>
                    </div>
                  </td>
                  <td title={item.type} style={{padding:'9px 14px',fontSize:'12px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}><span className="dae-tag dae-tag-blue">{item.type}</span></td>
                  <td title={item.host} style={{padding:'9px 14px',fontSize:'12px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.host}</td>
                  <td title={item.database || ''} style={{padding:'9px 14px',fontSize:'12px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.database}</td>
                  <td title={item.connStatus === 'connected' ? '已连接' : '未连接'} style={{padding:'9px 14px',fontSize:'12px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.connStatus === 'connected' ? '已连接' : '未连接'}</td>
                  <td style={{padding:'9px 14px',fontSize:'12px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                    {item.status === 'pending' && <span className="dae-tag dae-tag-gray" style={{ whiteSpace: 'nowrap' }}>待上线</span>}
                    {item.status === 'online' && <span className="dae-tag dae-tag-green" style={{ whiteSpace: 'nowrap' }}>已上线</span>}
                    {item.status === 'offline' && <span style={{ background:'#fff7ed', color:'#c2410c', border:'1px solid #fed7aa', padding:'2px 10px', borderRadius:999, fontSize:12, whiteSpace:'nowrap' }}>已下线</span>}
                  </td>
                  <td title={item.creator} style={{padding:'9px 14px',fontSize:'12px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.creator}</td>
                  <td title={item.modifier} style={{padding:'9px 14px',fontSize:'12px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.modifier}</td>
                  <td title={item.updatedAt} style={{padding:'9px 14px',fontSize:'12px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.updatedAt}</td>
                  <td style={{padding:'9px 14px'}}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {/* Switch 开关 */}
                      <StatusSwitch status={item.status} onToggle={() => toggleStatus(item)} />
                      <IconAction icon={<Eye size={16} />} label="查看" onClick={() => openView(item)} />
                      <IconAction icon={<Pencil size={16} />} label="编辑" onClick={() => openModal(item)} />
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
              <Database size={40} />
              <p>暂无数据源，点击「新建数据源」创建</p>
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
        title={form.id ? '编辑数据源' : '新建数据源'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button className="dae-btn dae-btn-secondary" onClick={() => setModalOpen(false)}>取消</button>
            <button className="dae-btn dae-btn-primary" disabled={!canSave} onClick={() => setModalOpen(false)}>
              {form.id ? '保存' : '确定'}
            </button>
          </>
        }
      >
        {form.id && form.status === 'online' && (
          <div style={{background:'#fef3c7',color:'#92400e',padding:'8px 12px',borderRadius:6,fontSize:13,marginBottom:12}}>
            当前为已上线状态，编辑保存后将自动变为待上线
          </div>
        )}
        {/* 基础信息 */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 12 }}>基础信息</h4>
          <div className="dae-form-group">
            <label>数据源名称</label>
            <input className="dae-input" placeholder="请输入数据源名称" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="dae-form-group">
            <label>数据源类型</label>
            <select className="dae-input" value={form.type || 'MySQL'} onChange={(e) => { setForm({ ...form, type: e.target.value, host: '', database: '' }); setConnStatus('idle'); }}>
              {ALL_TYPES.map((t) => (<option key={t}>{t}</option>))}
            </select>
          </div>
        </div>

        {/* 动态配置 */}
        <div style={{ marginBottom: 20, paddingTop: 16, borderTop: '1px solid var(--dae-border)' }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 12 }}>连接配置</h4>

          {typeCategory === 'db' && (
            <>
              <div className="dae-form-group">
                <label>连接地址</label>
                <input className="dae-input" placeholder="host:port 或 URL" value={form.host || ''} onChange={(e) => { setForm({ ...form, host: e.target.value }); setConnStatus('idle'); }} />
              </div>
              <div className="dae-form-group">
                <label>数据库名</label>
                <input className="dae-input" placeholder="数据库名" value={form.database || ''} onChange={(e) => { setForm({ ...form, database: e.target.value }); setConnStatus('idle'); }} />
              </div>
              <div className="dae-form-group">
                <label>用户名</label>
                <input className="dae-input" placeholder="用户名" onChange={() => setConnStatus('idle')} />
              </div>
              <div className="dae-form-group">
                <label>密码</label>
                <input className="dae-input" type="password" placeholder="密码" onChange={() => setConnStatus('idle')} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                <button
                  className="dae-btn dae-btn-secondary"
                  style={{ gap: 6 }}
                  onClick={handleTest}
                  disabled={connStatus === 'testing'}
                >
                  {connStatus === 'testing' ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="dae-spinner" /> 测试中...
                    </span>
                  ) : connStatus === 'success' ? (
                    <>
                      <CheckCircle size={16} style={{ color: 'var(--dae-success)' }} />
                      连接成功
                    </>
                  ) : (
                    <>
                      <TestTube size={16} />
                      连接测试
                    </>
                  )}
                </button>
                {connStatus === 'error' && (
                  <span style={{ color: 'var(--dae-error)', fontSize: 13 }}>连接失败，请检查配置</span>
                )}
              </div>
            </>
          )}

          {typeCategory === 'file' && (
            <>
              <div className="dae-form-group">
                <label>文件路径</label>
                <input className="dae-input" placeholder="/path/to/file.xlsx 或上传文件" value={form.database || ''} onChange={(e) => setForm({ ...form, database: e.target.value })} />
              </div>
              <div className="dae-form-group">
                <label>工作表 / 分隔符</label>
                <input className="dae-input" placeholder={form.type === 'Excel' ? 'Sheet1' : ','} />
              </div>
            </>
          )}

          {typeCategory === 'api' && (
            <>
              <div className="dae-form-group">
                <label>请求地址</label>
                <input className="dae-input" placeholder="https://api.example.com/data" value={form.host || ''} onChange={(e) => setForm({ ...form, host: e.target.value })} />
              </div>
              <div className="dae-form-group">
                <label>请求方法</label>
                <select className="dae-input">
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                </select>
              </div>
              <div className="dae-form-group">
                <label>认证方式</label>
                <select className="dae-input">
                  <option>无</option>
                  <option>API Key</option>
                  <option>OAuth 2.0</option>
                  <option>Basic Auth</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* 权限设置 */}
        <div style={{ paddingTop: 16, borderTop: '1px solid var(--dae-border)' }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={16} style={{ color: 'var(--dae-primary)' }} />
            权限设置
          </h4>

          <UserPermSelect
            label="查看权限"
            selected={viewPerm}
            onChange={setViewPerm}
          />

          <UserPermSelect
            label="管理权限"
            selected={managePerm}
            onChange={setManagePerm}
          />
        </div>
      </Drawer>

      {/* 查看数据源 */}
      <Drawer
        open={viewOpen}
        title="查看数据源"
        onClose={() => setViewOpen(false)}
        footer={
          <button className="dae-btn dae-btn-secondary" onClick={() => setViewOpen(false)}>关闭</button>
        }
      >
        {viewItem && (
          <div>
            <div className="dae-form-group">
              <label>数据源名称</label>
              <div className="dae-input" style={{ background: 'var(--dae-surface)', cursor: 'default' }}>{viewItem.name}</div>
            </div>
            <div className="dae-form-group">
              <label>数据源类型</label>
              <div className="dae-input" style={{ background: 'var(--dae-surface)', cursor: 'default' }}>{viewItem.type}</div>
            </div>
            <div className="dae-form-group">
              <label>连接地址</label>
              <div className="dae-input" style={{ background: 'var(--dae-surface)', cursor: 'default' }}>{viewItem.host || '-'}</div>
            </div>
            <div className="dae-form-group">
              <label>数据库 / 文件</label>
              <div className="dae-input" style={{ background: 'var(--dae-surface)', cursor: 'default' }}>{viewItem.database || '-'}</div>
            </div>
            <div className="dae-form-group">
              <label>连接状态</label>
              <div>
                <span className={`dae-tag ${viewItem.connStatus === 'connected' ? 'dae-tag-green' : 'dae-tag-red'}`}>
                  {viewItem.connStatus === 'connected' ? '已连接' : '未连接'}
                </span>
              </div>
            </div>
            <div className="dae-form-group">
              <label>状态</label>
              <div>
                {viewItem.status === 'pending' && <span className="dae-tag dae-tag-gray" style={{ whiteSpace: 'nowrap' }}>待上线</span>}
                {viewItem.status === 'online' && <span className="dae-tag dae-tag-green" style={{ whiteSpace: 'nowrap' }}>已上线</span>}
                {viewItem.status === 'offline' && <span style={{ background:'#fff7ed', color:'#c2410c', border:'1px solid #fed7aa', padding:'2px 10px', borderRadius:999, fontSize:12, whiteSpace:'nowrap' }}>已下线</span>}
              </div>
            </div>
            <div className="dae-form-group">
              <label>创建人</label>
              <div className="dae-input" style={{ background: 'var(--dae-surface)', cursor: 'default' }}>{viewItem.creator}</div>
            </div>
            <div className="dae-form-group">
              <label>修改人</label>
              <div className="dae-input" style={{ background: 'var(--dae-surface)', cursor: 'default' }}>{viewItem.modifier}</div>
            </div>
            <div className="dae-form-group">
              <label>修改时间</label>
              <div className="dae-input" style={{ background: 'var(--dae-surface)', cursor: 'default' }}>{viewItem.updatedAt}</div>
            </div>
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
        title="复制数据源"
        onClose={() => setCopyOpen(false)}
        footer={
          <>
            <button className="dae-btn dae-btn-secondary" onClick={() => setCopyOpen(false)}>取消</button>
            <button className="dae-btn dae-btn-primary" onClick={confirmCopy}>确认</button>
          </>
        }
      >
        <div className="dae-form-group">
          <label>数据源名称</label>
          <input className="dae-input" value={copyName} onChange={(e) => setCopyName(e.target.value)} />
        </div>
        <UserPermSelect label="查看权限" selected={copyViewPerm} onChange={setCopyViewPerm} />
        <UserPermSelect label="管理权限" selected={copyManagePerm} onChange={setCopyManagePerm} />
      </Drawer>
    </div>
  );
}
