import React, { useEffect, useMemo, useState } from 'react';
import { Train, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import Drawer from './Drawer';
import {
  getScopeDatasetDependencies,
  getDatasets,
  getScopeQueryability,
  markDatasetTraining,
  finishDatasetTraining,
  trainingStatusLabel,
  queryabilityLabel,
  queryabilityColor,
  type ScopeType,
  type TrainingContent,
} from '../data/semanticLayer';

const TYPE_LABEL: Record<ScopeType, string> = {
  dataset: '数据集',
  report: '报表',
  dashboard: '仪表盘',
  'data-screen': '数据大屏',
};

/**
 * 反向数据训练抽屉：在报表 / 仪表盘 / 数据大屏列表页直接训练该资产依赖的数据集，
 * 避免用户先记住数据集名称、回到数据集菜单训练再返回。
 */
export function ScopeTrainingDrawer({
  open,
  type,
  id,
  name,
  onClose,
  onTrained,
}: {
  open: boolean;
  type: ScopeType;
  id: string;
  name: string;
  onClose: () => void;
  onTrained?: () => void;
}) {
  const scope = useMemo(() => ({ type, id, name }), [type, id, name]);
  const depIds = useMemo(() => getScopeDatasetDependencies(scope), [scope]);
  const datasets = useMemo(() => getDatasets(), [open]);
  const queryability = useMemo(() => getScopeQueryability(scope), [scope, open]);
  const depDatasets = useMemo(
    () => depIds.map((dsId) => datasets.find((d) => d.id === dsId)).filter(Boolean) as NonNullable<
      ReturnType<typeof getDatasets>
    >[number][],
    [depIds, datasets]
  );

  const [strategy, setStrategy] = useState<'full' | 'incremental'>('incremental');
  const [content, setContent] = useState<TrainingContent>({
    fields: true,
    terms: true,
    metrics: true,
    examples: true,
  });
  const [schedule, setSchedule] = useState<'manual' | 'daily' | 'weekly'>('manual');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [training, setTraining] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);

  // 打开时，默认勾选所有未训练的数据集
  useEffect(() => {
    if (!open) return;
    const untrained = new Set(depDatasets.filter((d) => d.trainingStatus !== 'trained').map((d) => d.id));
    setSelected(untrained);
    setTraining(new Set());
    setDone(false);
    setStrategy('incremental');
    setContent({ fields: true, terms: true, metrics: true, examples: true });
    setSchedule('manual');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggleSelect = (dsId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(dsId)) next.delete(dsId);
      else next.add(dsId);
      return next;
    });
  };

  const startTrain = () => {
    const targets = Array.from(selected).filter((dsId) => !training.has(dsId));
    if (targets.length === 0) return;
    targets.forEach((dsId) => {
      markDatasetTraining(dsId);
      setTraining((prev) => new Set(prev).add(dsId));
    });
    const opts = { strategy, content, schedule };
    window.setTimeout(() => {
      targets.forEach((dsId) => {
        finishDatasetTraining(dsId, opts);
      });
      setTraining(new Set());
      setSelected(new Set());
      setDone(true);
      onTrained?.();
    }, 1600 + Math.random() * 800);
  };

  const color = queryabilityColor(queryability);
  const trainedCount = depDatasets.filter((d) => d.trainingStatus === 'trained').length;
  const allTrained = depDatasets.length > 0 && trainedCount === depDatasets.length;

  return (
    <Drawer
      open={open}
      title={`训练 ${TYPE_LABEL[type]}：${name}`}
      onClose={onClose}
      footer={
        <>
          <button className="dae-btn dae-btn-secondary" onClick={onClose}>
            关闭
          </button>
          <button
            className="dae-btn dae-btn-primary"
            onClick={startTrain}
            disabled={selected.size === 0 || training.size > 0}
          >
            {training.size > 0 ? (
              <>
                <Loader2 size={16} className="dae-spin" />
                训练中…
              </>
            ) : (
              <>
                <Train size={16} />
                开始训练（{selected.size} 个数据集）
              </>
            )}
          </button>
        </>
      }
    >
      {depDatasets.length === 0 ? (
        <div
          style={{
            background: '#fff7ed',
            border: '1px solid #fed7aa',
            color: '#c2410c',
            borderRadius: 8,
            padding: '10px 12px',
            fontSize: 13,
          }}
        >
          该{TYPE_LABEL[type]}未关联任何数据集，无法训练。请先在配置中指定数据集。
        </div>
      ) : (
        <div>
          {/* 资产可问数现状 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '10px 12px',
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            <span>当前可问数状态：</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 10px',
                borderRadius: 999,
                fontSize: 12,
                background: color.bg,
                color: color.color,
                border: `1px solid ${color.border}`,
              }}
            >
              {queryabilityLabel(queryability)}
            </span>
            <span style={{ color: '#64748b' }}>
              依赖 {depDatasets.length} 个数据集，已训练 {trainedCount} 个
            </span>
          </div>

          <div
            style={{
              background: '#eff6ff',
              color: '#1d4ed8',
              padding: '10px 12px',
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 16,
              lineHeight: 1.5,
            }}
          >
            训练会把语义层设置（字段语义、行业黑话、指标口径、示例问数）应用到以下数据集，使其可被智能问数识别。训练完成后，本
            {TYPE_LABEL[type]}即可直接问数，无需回到数据集菜单。
          </div>

          {/* 依赖数据集列表（可勾选） */}
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 10 }}>
            涉及的数据集
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
            {depDatasets.map((d) => {
              const isTrained = d.trainingStatus === 'trained';
              const isTraining = training.has(d.id);
              const isSelected = selected.has(d.id) || isTrained;
              return (
                <label
                  key={d.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    border: '1px solid var(--dae-border)',
                    borderRadius: 8,
                    cursor: isTrained ? 'default' : 'pointer',
                    background: isSelected ? '#f0f9ff' : '#fff',
                    opacity: isTrained ? 0.85 : 1,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isTrained || isTraining}
                    onChange={() => toggleSelect(d.id)}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--dae-ink)' }}>{d.datasetName}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {d.fieldSource === 'real' ? '来源：已同步数据源真实列' : '来源：业务域推断（待完善）'}
                    </div>
                  </div>
                  {isTraining ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#1677FF', whiteSpace: 'nowrap' }}>
                      <Loader2 size={13} className="dae-spin" />
                      训练中
                    </span>
                  ) : isTrained ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#15803d', whiteSpace: 'nowrap' }}>
                      <CheckCircle2 size={13} />
                      已训练
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, color: '#b91c1c', whiteSpace: 'nowrap' }}>
                      {trainingStatusLabel(d.trainingStatus)}
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          {/* 训练设置 */}
          <div className="dae-form-group">
            <label>训练策略</label>
            <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="r-strategy"
                  checked={strategy === 'incremental'}
                  onChange={() => setStrategy('incremental')}
                />
                增量训练（仅更新变化部分，资源占用低）
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input type="radio" name="r-strategy" checked={strategy === 'full'} onChange={() => setStrategy('full')} />
                全量训练（重建完整语义，资源占用高）
              </label>
            </div>
          </div>
          <div className="dae-form-group">
            <label>训练内容（直接应用语义层设置，无需额外关联）</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={content.fields} onChange={(e) => setContent({ ...content, fields: e.target.checked })} />
                字段语义（必须）
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={content.terms} onChange={(e) => setContent({ ...content, terms: e.target.checked })} />
                行业黑话 / 同义词
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={content.metrics} onChange={(e) => setContent({ ...content, metrics: e.target.checked })} />
                指标口径
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={content.examples} onChange={(e) => setContent({ ...content, examples: e.target.checked })} />
                示例问数
              </label>
            </div>
          </div>
          <div className="dae-form-group">
            <label>触发方式</label>
            <select
              className="dae-input"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value as 'manual' | 'daily' | 'weekly')}
              style={{ marginTop: 6 }}
            >
              <option value="manual">手动触发（本次立即执行）</option>
              <option value="daily">每日自动增量训练</option>
              <option value="weekly">每周自动增量训练</option>
            </select>
          </div>

          {done && allTrained && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                background: '#dcfce7',
                border: '1px solid #86efac',
                color: '#15803d',
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: 13,
                marginTop: 4,
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} />
                训练完成，本{TYPE_LABEL[type]}现在可直接问数。
              </span>
              <button
                className="dae-btn dae-btn-primary"
                style={{ padding: '4px 12px', fontSize: 12 }}
                onClick={() => {
                  onClose();
                  window.location.hash = '#page=query';
                }}
              >
                去问数
              </button>
            </div>
          )}
          {done && !allTrained && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#fef9c3',
                border: '1px solid #fde047',
                color: '#a16207',
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: 13,
                marginTop: 4,
              }}
            >
              <AlertCircle size={16} />
              训练完成，但仍有部分数据集未训练，本{TYPE_LABEL[type]}为「部分可问数」。
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
