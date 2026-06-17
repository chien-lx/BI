import React, { useState, useMemo } from 'react';
import { ClipboardList } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SearchFilter from '../components/SearchFilter';
import { operationLogs } from '../data/mockData';

export default function OperationLogPage() {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return operationLogs.filter((item) =>
      item.user.includes(search) || item.module.includes(search) || item.action.includes(search) || item.detail.includes(search)
    );
  }, [search]);

  return (
    <div>
      <PageHeader title="操作日志" breadcrumb="系统管理 / 操作日志" />
      <SearchFilter placeholder="搜索用户、模块、操作、详情..." value={search} onChange={setSearch} />
      <div style={{ background: '#fff', borderRadius: 'var(--dae-radius-lg)', border: '1px solid var(--dae-border)', overflow: 'hidden' }}>
        <table className="dae-table">
          <thead>
            <tr>
              <th>用户</th>
              <th>模块</th>
              <th>操作</th>
              <th>详情</th>
              <th>IP 地址</th>
              <th>时间</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ClipboardList size={16} style={{ color: 'var(--dae-primary)' }} />
                    <span style={{ fontWeight: 500 }}>{item.user}</span>
                  </div>
                </td>
                <td><span className="dae-tag dae-tag-blue">{item.module}</span></td>
                <td><span className="dae-tag dae-tag-green">{item.action}</span></td>
                <td>{item.detail}</td>
                <td>{item.ip}</td>
                <td>{item.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="dae-empty">
            <ClipboardList size={40} />
            <p>暂无操作日志</p>
          </div>
        )}
      </div>
    </div>
  );
}
