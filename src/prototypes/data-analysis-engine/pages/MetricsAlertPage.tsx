import React, { useMemo, useState } from 'react';
import {
  Bell, Search, Eye, CheckCircle2, Mail, MessageSquare, Send,
  AlertTriangle, RefreshCw,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Drawer from '../components/Drawer';
import IconAction from '../components/IconAction';
import {
  monitorAlerts, pushChannelLabel, resourceTypeLabel,
  type MonitorAlert, type MonitorAlertStatus, type PushChannel,
} from '../data/mockData';

function StatusTag({ status }: { status: MonitorAlertStatus }) {
  if (status === 'pending') return <span className="dae-tag dae-tag-red">待处理</span>;
  return <span className="dae-tag dae-tag-green">已处理</span>;
}

function PushTag({ status, channel }: { status: MonitorAlert['pushStatus']; channel: PushChannel }) {
  const label = `${pushChannelLabel[channel]}${status === 'success' ? '已推送' : status === 'failed' ? '推送失败' : '待推送'}`;
  const cls = status === 'success' ? 'dae-tag-green' : status === 'failed' ? 'dae-tag-red' : 'dae-tag-orange';
  return <span className={`dae-tag ${cls}`}>{label}</span>;
}

export default function MetricsAlertPage() {
  const [alerts, setAlerts] = useState<MonitorAlert[]>(monitorAlerts);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MonitorAlertStatus | 'all'>('all');
  const [detailAlert, setDetailAlert] = useState<MonitorAlert | null>(null);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const matchSearch = a.taskName.toLowerCase().includes(search.toLowerCase()) || a.resourceName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [alerts, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: alerts.length,
      pending: alerts.filter((a) => a.status === 'pending').length,
      processed: alerts.filter((a) => a.status === 'processed').length,
      pushFailed: alerts.filter((a) => a.pushStatus === 'failed').length,
    };
  }, [alerts]);

  const handleProcess = (alert: MonitorAlert) => {
    setAlerts((prev) => prev.map((a) => (a.id === alert.id ? { ...a, status: 'processed' as MonitorAlertStatus } : a)));
  };

  const handleRetryPush = (alert: MonitorAlert) => {
    setAlerts((prev) => prev.map((a) => (a.id === alert.id ? { ...a, pushStatus: 'success' as MonitorAlert['pushStatus'] } : a)));
  };

  return (
    <div>
      <PageHeader title="预警记录" breadcrumb="监控告警 / 预警记录" />

      {/* 看板 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="dae-stat-card">
          <div className="dae-stat-label">累计预警</div>
          <div className="dae-stat-value">{stats.total}</div>
        </div>
        <div className="dae-stat-card">
          <div className="dae-stat-label">待处理</div>
          <div className="dae-stat-value" style={{ color: 'var(--dae-error)' }}>{stats.pending}</div>
        </div>
        <div className="dae-stat-card">
          <div className="dae-stat-label">已处理</div>
          <div className="dae-stat-value" style={{ color: 'var(--dae-success)' }}>{stats.processed}</div>
        </div>
        <div className="dae-stat-card">
          <div className="dae-stat-label">推送失败</div>
          <div className="dae-stat-value" style={{ color: 'var(--dae-warning)' }}>{stats.pushFailed}</div>
        </div>
      </div>

      {/* 筛选 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--dae-ink-subtle)' }} />
          <input
            className="dae-input"
            placeholder="搜索任务或资源名称..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 32 }}
          />
        </div>
        <select
          className="dae-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as MonitorAlertStatus | 'all')}
          style={{ width: 140 }}
        >
          <option value="all">全部状态</option>
          <option value="pending">待处理</option>
          <option value="processed">已处理</option>
        </select>
      </div>

      {/* 列表 */}
      <div style={{ background: '#fff', borderRadius: 'var(--dae-radius-lg)', border: '1px solid var(--dae-border)', overflow: 'hidden' }}>
        <table className="dae-table">
          <thead>
            <tr>
              <th>预警任务</th>
              <th>监控资源</th>
              <th>异常维度值</th>
              <th>实际值 / 阈值</th>
              <th>触发时间</th>
              <th>处理状态</th>
              <th>推送状态</th>
              <th style={{ width: 140 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 48 }}>
                  <div className="dae-empty">
                    <Bell size={40} style={{ color: 'var(--dae-ink-subtle)' }} />
                    <p>暂无预警记录</p>
                  </div>
                </td>
              </tr>
            )}
            {filteredAlerts.map((alert) => (
              <tr key={alert.id}>
                <td>
                  <div style={{ fontWeight: 500, color: 'var(--dae-ink)' }}>{alert.taskName}</div>
                  <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)', marginTop: 2 }}>{alert.metricName}</div>
                </td>
                <td>
                  <span className="dae-tag dae-tag-blue">{resourceTypeLabel[alert.resourceType]}</span>
                  <div style={{ fontSize: 12, color: 'var(--dae-ink-secondary)', marginTop: 4 }}>{alert.resourceName}</div>
                </td>
                <td>{alert.dimensionName} = {alert.dimensionValue}</td>
                <td>
                  <span style={{ color: 'var(--dae-error)', fontWeight: 600 }}>{alert.actualValue.toLocaleString()}</span>
                  <span style={{ color: 'var(--dae-ink-muted)', margin: '0 6px' }}>/</span>
                  <span>{alert.threshold.toLocaleString()}</span>
                </td>
                <td>{alert.triggeredAt}</td>
                <td><StatusTag status={alert.status} /></td>
                <td><PushTag status={alert.pushStatus} channel={alert.pushChannel} /></td>
                <td>
                  <div className="dae-table-actions">
                    <IconAction icon={<Eye size={16} />} label="详情" onClick={() => setDetailAlert(alert)} />
                    {alert.status === 'pending' && (
                      <IconAction icon={<CheckCircle2 size={16} />} label="标记已处理" onClick={() => handleProcess(alert)} />
                    )}
                    {alert.pushStatus === 'failed' && (
                      <IconAction icon={<RefreshCw size={16} />} label="重试推送" onClick={() => handleRetryPush(alert)} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Drawer open={!!detailAlert} title="预警详情" width={520} onClose={() => setDetailAlert(null)}>
        {detailAlert && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <section style={{ background: 'var(--dae-surface)', borderRadius: 'var(--dae-radius-lg)', padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 12 }}>预警信息</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px 24px', fontSize: 13 }}>
                <div><span style={{ color: 'var(--dae-ink-muted)' }}>任务：</span>{detailAlert.taskName}</div>
                <div><span style={{ color: 'var(--dae-ink-muted)' }}>资源：</span>{resourceTypeLabel[detailAlert.resourceType]} / {detailAlert.resourceName}</div>
                <div><span style={{ color: 'var(--dae-ink-muted)' }}>指标：</span>{detailAlert.metricName}</div>
                <div><span style={{ color: 'var(--dae-ink-muted)' }}>维度：</span>{detailAlert.dimensionName}</div>
                <div><span style={{ color: 'var(--dae-ink-muted)' }}>维度值：</span>{detailAlert.dimensionValue}</div>
                <div><span style={{ color: 'var(--dae-ink-muted)' }}>触发时间：</span>{detailAlert.triggeredAt}</div>
              </div>
            </section>

            <section style={{ background: 'var(--dae-surface)', borderRadius: 'var(--dae-radius-lg)', padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 12 }}>规则触发</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
                <span>{detailAlert.metricName}</span>
                <span className="dae-tag dae-tag-orange">{detailAlert.operator}</span>
                <span>{detailAlert.threshold.toLocaleString()}</span>
              </div>
              <div style={{ marginTop: 12, padding: 12, background: '#fff', borderRadius: 'var(--dae-radius-md)', border: '1px solid var(--dae-border)' }}>
                <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>实际值</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--dae-error)' }}>{detailAlert.actualValue.toLocaleString()}</div>
              </div>
            </section>

            <section style={{ background: 'var(--dae-surface)', borderRadius: 'var(--dae-radius-lg)', padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 12 }}>推送情况</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px 24px', fontSize: 13 }}>
                <div><span style={{ color: 'var(--dae-ink-muted)' }}>推送方式：</span>{pushChannelLabel[detailAlert.pushChannel]}</div>
                <div><span style={{ color: 'var(--dae-ink-muted)' }}>接收人：</span>{detailAlert.receiver}</div>
                <div><span style={{ color: 'var(--dae-ink-muted)' }}>推送状态：</span><PushTag status={detailAlert.pushStatus} channel={detailAlert.pushChannel} /></div>
              </div>
            </section>

            <div style={{ display: 'flex', gap: 10 }}>
              {detailAlert.status === 'pending' && (
                <button className="dae-btn dae-btn-primary" onClick={() => { handleProcess(detailAlert); setDetailAlert(null); }}>
                  <CheckCircle2 size={16} />
                  标记为已处理
                </button>
              )}
              {detailAlert.pushStatus === 'failed' && (
                <button className="dae-btn dae-btn-secondary" onClick={() => handleRetryPush(detailAlert)}>
                  <RefreshCw size={16} />
                  重试推送
                </button>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
