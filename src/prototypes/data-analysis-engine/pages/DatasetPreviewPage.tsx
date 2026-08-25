/**
 * 数据集预览页（整页）
 * - 由报表 / 仪表盘 / 数据大屏列表的「已使用数据集」展开行点击进入（新开页面）。
 * - 展示该数据集的表结构（字段列表）与数据样例，并提供「返回」按钮回到来源列表。
 */

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Database, Search, Table as TableIcon, Grid3X3 } from 'lucide-react';
import { parseHashParams } from '../../../common/useHashPage';
import { getDatasets, type DatasetSchema } from '../data/semanticLayer';
import { SchemaView, SampleView, buildSampleRows } from '../components/SchemaPanel';
import PageHeader from '../components/PageHeader';

const FROM_LABELS: Record<string, string> = {
  report: '报表',
  dashboard: '仪表盘',
  'data-screen': '数据大屏',
  dataset: '数据集',
};

export default function DatasetPreviewPage() {
  const [params, setParams] = useState(() =>
    typeof window === 'undefined' ? {} : parseHashParams(window.location.hash)
  );
  const [activeTab, setActiveTab] = useState<'schema' | 'sample'>('schema');
  const [search, setSearch] = useState('');

  // 监听 hash 变化（同一页面内若数据集切换，参数会刷新）
  useEffect(() => {
    const onHash = () => setParams(parseHashParams(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const datasetId = params.datasetId || '';
  const from = params.from && FROM_LABELS[params.from] ? params.from : 'dataset';

  const dataset = useMemo<DatasetSchema | null>(
    () => getDatasets().find((d) => d.id === datasetId) || null,
    [datasetId]
  );

  const sampleRows = useMemo(
    () => (dataset ? buildSampleRows(dataset.fields, 5) : []),
    [dataset]
  );

  const filteredFields = useMemo(() => {
    if (!dataset) return [];
    const text = search.trim().toLowerCase();
    if (!text) return dataset.fields;
    return dataset.fields.filter(
      (f) =>
        f.name.toLowerCase().includes(text) ||
        f.alias.toLowerCase().includes(text) ||
        f.description.toLowerCase().includes(text)
    );
  }, [dataset, search]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return sampleRows;
    const text = search.trim().toLowerCase();
    return sampleRows.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(text))
    );
  }, [sampleRows, search]);

  const goBack = () => {
    window.location.hash = `page=${from}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        title={dataset ? `数据集预览：${dataset.datasetName}` : '数据集预览'}
        breadcrumb={`数据准备 / ${FROM_LABELS[from] || '数据集'} / 数据集预览`}
        actions={
          <button
            onClick={goBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '7px 14px',
              borderRadius: 8,
              border: '1px solid var(--dae-border)',
              background: '#fff',
              color: 'var(--dae-ink-secondary)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={15} />
            返回{FROM_LABELS[from] || '列表'}
          </button>
        }
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        {!dataset ? (
          <div className="dae-empty">
            <Database size={40} />
            <p>未找到该数据集（ID：{datasetId || '空'}）</p>
            <button className="dae-btn dae-btn-primary" onClick={goBack}>返回列表</button>
          </div>
        ) : (
          <>
            {/* 二级 Tab：表结构 / 数据样例 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '12px 20px 0',
                borderBottom: '1px solid var(--dae-border)',
                background: '#f8fafc',
              }}
            >
              <TabButton active={activeTab === 'schema'} onClick={() => setActiveTab('schema')} icon={<TableIcon size={13} />} label="表结构" />
              <TabButton active={activeTab === 'sample'} onClick={() => setActiveTab('sample')} icon={<Grid3X3 size={13} />} label="数据样例" />
            </div>

            {/* 搜索 */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={activeTab === 'schema' ? '搜索字段名 / 别名 / 说明' : '搜索样例数据'}
                  style={{
                    width: '100%',
                    padding: '8px 10px 8px 30px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: 12.5,
                    color: '#334155',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* 内容区 */}
            <div className="dae-scroll" style={{ flex: 1, overflowY: 'auto', padding: '14px 20px' }}>
              {activeTab === 'schema' ? (
                <SchemaView activeDataset={dataset} filteredFields={filteredFields} />
              ) : (
                <SampleView activeDataset={dataset} filteredRows={filteredRows} />
              )}
            </div>

            {/* 底部提示 */}
            <div
              style={{
                padding: '10px 20px',
                borderTop: '1px solid #f1f5f9',
                background: '#f8fafc',
                fontSize: 11.5,
                color: '#64748b',
              }}
            >
              提示：字段别名与业务描述会用于 NL2SQL 的语义匹配，提问时可直接使用别名；数据样例仅展示前 5 条模拟数据。
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '8px 14px',
        borderRadius: '8px 8px 0 0',
        border: '1px solid transparent',
        borderBottomColor: active ? '#1677FF' : 'transparent',
        background: active ? '#fff' : 'transparent',
        color: active ? '#1677FF' : '#64748b',
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
      }}
    >
      {icon}
      {label}
    </button>
  );
}
