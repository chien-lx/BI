import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Database, ShieldCheck, TestTube, CheckCircle, X, ChevronDown, Eye, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SearchFilter from '../components/SearchFilter';
import Drawer from '../components/Drawer';
import IconAction from '../components/IconAction';
import DeleteConfirm from '../components/DeleteConfirm';
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
  const pageSize = 10;

  const filtered = useMemo(() => {
    return dataSources.filter((item) =>
      item.name.includes(search) || item.type.includes(search) || item.host.includes(search)
    );
  }, [search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

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
      <SearchFilter placeholder="搜索数据源名称、类型、地址..." value={search} onChange={setSearch} />
      <div style={{ background: '#fff', borderRadius: 'var(--dae-radius-lg)', border: '1px solid var(--dae-border)', overflow: 'hidden' }}>
        <table className="dae-table">
          <thead>
            <tr>
              <th>数据源名称</th>
              <th>类型</th>
              <th>连接地址</th>
              <th>数据库</th>
              <th>状态</th>
              <th>创建人</th>
              <th>修改人</th>
              <th>修改时间</th>
              <th style={{ width: 180 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {pagedData.map((item) => (
              <tr key={item.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Database size={16} style={{ color: 'var(--dae-primary)' }} />
                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                  </div>
                </td>
                <td><span className="dae-tag dae-tag-blue">{item.type}</span></td>
                <td>{item.host}</td>
                <td>{item.database}</td>
                <td>{item.status === 'connected' ? '已连接' : '未连接'}</td>
                <td>{item.creator}</td>
                <td>{item.modifier}</td>
                <td>{item.updatedAt}</td>
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
            <Database size={40} />
            <p>暂无数据源，点击「新建数据源」创建</p>
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
              <label>状态</label>
              <div>
                <span className={`dae-tag ${viewItem.status === 'connected' ? 'dae-tag-green' : 'dae-tag-red'}`}>
                  {viewItem.status === 'connected' ? '已连接' : '未连接'}
                </span>
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
        content={delTarget ? `确定要删除「${delTarget.name}」吗？删除后不可恢复。` : ''}
        onClose={() => { setDelOpen(false); setDelTarget(null); }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
