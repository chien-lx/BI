import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { MetricData } from '../data/mockData';

interface StatCardsProps {
  data: MetricData[];
}

export default function StatCards({ data }: StatCardsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
      {data.map((item) => (
        <div key={item.label} className="dae-stat-card">
          <div className="dae-stat-label">{item.label}</div>
          <div className="dae-stat-value">
            {item.value}
            {item.unit ? <span className="dae-stat-unit">{item.unit}</span> : null}
          </div>
          {item.change !== undefined ? (
            <div className={`dae-stat-change ${item.change >= 0 ? 'up' : 'down'}`}>
              {item.change >= 0 ? <TrendingUp size={12} style={{ display: 'inline', marginRight: 4 }} /> : <TrendingDown size={12} style={{ display: 'inline', marginRight: 4 }} />}
              {item.change >= 0 ? '+' : ''}{item.change}% 较昨日
            </div>
          ) : item.trendText ? (
            <div className="dae-stat-change neutral">{item.trendText}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
