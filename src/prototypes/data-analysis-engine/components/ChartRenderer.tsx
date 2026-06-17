import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#1677FF', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];

interface ChartRendererProps {
  type: 'bar' | 'line' | 'area' | 'pie';
  data: any[];
  xKey?: string;
  yKeys?: string[];
  dataKey?: string;
  nameKey?: string;
  height?: number;
}

export default function ChartRenderer({
  type,
  data,
  xKey = 'name',
  yKeys = ['value'],
  dataKey = 'value',
  nameKey = 'name',
  height = 300,
}: ChartRendererProps) {
  if (type === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey={dataKey}
            nameKey={nameKey}
            label
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  const ChartComponent = type === 'bar' ? BarChart : type === 'line' ? LineChart : AreaChart;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ChartComponent data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: '#64748b' }} />
        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
        />
        <Legend />
        {yKeys.map((key, index) => {
          const color = COLORS[index % COLORS.length];
          if (type === 'bar') {
            return <Bar key={key} dataKey={key} fill={color} radius={[4, 4, 0, 0]} />;
          }
          if (type === 'line') {
            return <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={{ r: 3 }} />;
          }
          return (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={color}
              fill={color}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          );
        })}
      </ChartComponent>
    </ResponsiveContainer>
  );
}
