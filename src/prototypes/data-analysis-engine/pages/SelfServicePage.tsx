import React, { useState, useMemo } from 'react';
import { Download, Search, Plus, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { datasetFields, datasets } from '../data/mockData';

interface SelectedField {
  dataset: string;
  field: string;
}

interface FilterCondition {
  field: string;
  operator: string;
  value: string;
}

export default function SelfServicePage() {
  const [selectedDataset, setSelectedDataset] = useState('订单明细数据集');
  const [selectedFields, setSelectedFields] = useState<SelectedField[]>([]);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [showResult, setShowResult] = useState(false);

  const fields = datasetFields[selectedDataset] || [];

  const toggleField = (field: string) => {
    setSelectedFields((prev) => {
      const exists = prev.find((f) => f.field === field && f.dataset === selectedDataset);
      if (exists) return prev.filter((f) => !(f.field === field && f.dataset === selectedDataset));
      return [...prev, { dataset: selectedDataset, field }];
    });
  };

  const addFilter = () => {
    setFilters((prev) => [...prev, { field: fields[0]?.name || '', operator: '等于', value: '' }]);
  };

  const updateFilter = (index: number, key: keyof FilterCondition, value: string) => {
    setFilters((prev) => prev.map((f, i) => (i === index ? { ...f, [key]: value } : f)));
  };

  const removeFilter = (index: number) => {
    setFilters((prev) => prev.filter((_, i) => i !== index));
  };

  const resultColumns = useMemo(() => {
    const currentFields = selectedFields.filter((f) => f.dataset === selectedDataset).map((f) => f.field);
    return currentFields.length > 0 ? currentFields : fields.filter((f) => f.type === 'dimension').slice(0, 3).map((f) => f.name);
  }, [selectedFields, selectedDataset, fields]);

  const resultData = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => {
      const row: Record<string, string> = {};
      resultColumns.forEach((col) => {
        row[col] = `${col}_示例值_${i + 1}`;
      });
      return row;
    });
  }, [resultColumns]);

  return (
    <div>
      <PageHeader title="自助取数" breadcrumb="数据准备 / 自助取数" />
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20 }}>
        {/* Left: dataset and fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#fff', borderRadius: 'var(--dae-radius-lg)', border: '1px solid var(--dae-border)', padding: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--dae-ink-secondary)', marginBottom: 8, display: 'block' }}>选择数据集</label>
            <select
              className="dae-input"
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
            >
              {datasets.filter((d) => d.status === 'active').map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          <div style={{ background: '#fff', borderRadius: 'var(--dae-radius-lg)', border: '1px solid var(--dae-border)', padding: 16, flex: 1 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--dae-ink-secondary)', marginBottom: 8, display: 'block' }}>字段列表</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {fields.map((f) => {
                const checked = selectedFields.some((s) => s.field === f.name && s.dataset === selectedDataset);
                return (
                  <label key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 'var(--dae-radius-sm)', cursor: 'pointer', fontSize: 13, background: checked ? 'var(--dae-primary-light)' : 'transparent' }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleField(f.name)} />
                    <span style={{ flex: 1 }}>{f.name}</span>
                    <span className={`dae-tag ${f.type === 'dimension' ? 'dae-tag-blue' : 'dae-tag-green'}`} style={{ fontSize: 11, padding: '1px 6px' }}>
                      {f.type === 'dimension' ? '维度' : '指标'}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: config and result */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#fff', borderRadius: 'var(--dae-radius-lg)', border: '1px solid var(--dae-border)', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--dae-ink)' }}>筛选条件</span>
              <button className="dae-btn dae-btn-secondary dae-btn-sm" onClick={addFilter}>
                <Plus size={14} />
                添加条件
              </button>
            </div>
            {filters.length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--dae-ink-muted)', padding: '12px 0' }}>暂无筛选条件，点击「添加条件」配置</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filters.map((filter, index) => (
                <div key={index} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select className="dae-input" style={{ width: 140 }} value={filter.field} onChange={(e) => updateFilter(index, 'field', e.target.value)}>
                    {fields.map((f) => <option key={f.name} value={f.name}>{f.name}</option>)}
                  </select>
                  <select className="dae-input" style={{ width: 120 }} value={filter.operator} onChange={(e) => updateFilter(index, 'operator', e.target.value)}>
                    <option>等于</option>
                    <option>不等于</option>
                    <option>大于</option>
                    <option>小于</option>
                    <option>包含</option>
                  </select>
                  <input className="dae-input" style={{ flex: 1 }} placeholder="输入值" value={filter.value} onChange={(e) => updateFilter(index, 'value', e.target.value)} />
                  <button className="dae-btn dae-btn-danger dae-btn-sm" onClick={() => removeFilter(index)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="dae-btn dae-btn-secondary" onClick={() => { setSelectedFields([]); setFilters([]); setShowResult(false); }}>
              重置
            </button>
            <button className="dae-btn dae-btn-primary" onClick={() => setShowResult(true)}>
              <Search size={16} />
              查询
            </button>
            {showResult && (
              <button className="dae-btn dae-btn-primary">
                <Download size={16} />
                下载 CSV
              </button>
            )}
          </div>

          {showResult && (
            <div style={{ background: '#fff', borderRadius: 'var(--dae-radius-lg)', border: '1px solid var(--dae-border)', overflow: 'hidden' }}>
              <table className="dae-table">
                <thead>
                  <tr>
                    {resultColumns.map((col) => <th key={col}>{col}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {resultData.map((row, i) => (
                    <tr key={i}>
                      {resultColumns.map((col) => <td key={col}>{row[col]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
