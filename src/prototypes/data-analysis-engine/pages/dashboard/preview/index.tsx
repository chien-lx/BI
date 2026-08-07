import React from 'react';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import PageHeader from '../../../components/PageHeader';
import ChartRenderer from '../../../components/ChartRenderer';
import { dashboards, chartSampleData, pieSampleData } from '../../../data/mockData';
import { useHashParams } from '@/common/useHashParams';

export default function DashboardPreviewPage() {
  const hashParams = useHashParams();
  const dashboardId = hashParams['dashboardId'];
  // 找不到时自动使用第一个仪表盘兜底，确保始终能渲染出来
  const dashboard = dashboards.find((d) => d.id === dashboardId) || dashboards[0];

  const goBack = () => {
    window.location.hash = 'page=dashboard';
  };

  const charts = dashboard?.charts || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '16px 24px 0' }}>
        <PageHeader
          title={dashboard.name}
          breadcrumb="数据分析 / 仪表盘 / 预览"
          actions={
            <button
              className="dae-btn"
              onClick={goBack}
              style={{
                background: '#fff',
                color: 'var(--dae-primary)',
                border: '1px solid var(--dae-border)',
                boxShadow: 'var(--dae-shadow-sm)',
                padding: '8px 20px',
              }}
            >
              <ArrowLeft size={16} />
              返回
            </button>
          }
        />
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 16px' }} className="dae-scroll">
        {charts.length === 0 ? (
          <div className="dae-empty" style={{ minHeight: 400 }}>
            <BarChart3 size={48} />
            <p>该仪表盘暂无图表</p>
          </div>
        ) : (
          <div
            style={{
              position: 'relative',
              width: 1200,
              height: 800,
              background: '#fff',
              border: '1px solid var(--dae-border)',
              borderRadius: 'var(--dae-radius-lg)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            {charts.map((chart) => (
              <div
                key={chart.id}
                style={{
                  position: 'absolute',
                  left: chart.x || 0,
                  top: chart.y || 0,
                  width: chart.w || 376,
                  height: chart.h || 280,
                  border: '1px solid var(--dae-border)',
                  borderRadius: 'var(--dae-radius-lg)',
                  background: '#fff',
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 12 }}>
                  {chart.name}
                </div>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ChartRenderer
                    type={chart.type === 'table' ? 'bar' : chart.type}
                    data={chart.type === 'pie' ? pieSampleData : chartSampleData}
                    yKeys={chart.type === 'pie' ? undefined : ['value', 'value2']}
                    height={Math.max(120, (chart.h || 280) - 90)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
