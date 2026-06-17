import React from 'react';
import { Activity } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCards from '../components/StatCards';
import ChartRenderer from '../components/ChartRenderer';
import { metricsData, qpsTrend } from '../data/mockData';

export default function MetricsPage() {
  return (
    <div>
      <PageHeader title="指标监控" breadcrumb="监控告警 / 指标监控" />
      <StatCards data={metricsData} />
      <div style={{ background: '#fff', borderRadius: 'var(--dae-radius-lg)', border: '1px solid var(--dae-border)', padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 16 }}>查询 QPS 趋势</div>
        <ChartRenderer type="area" data={qpsTrend} xKey="time" yKeys={['qps']} height={360} />
      </div>
    </div>
  );
}
