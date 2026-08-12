import React, { useMemo, useState } from 'react';
import {
  Activity, Plus, Search, Eye, Edit2, Trash2, Play, Pause, Bell,
  BarChart3, LayoutDashboard, FileText, Monitor, Database,
  Layers, Ruler, Send, AlertTriangle, ChevronDown,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCards from '../components/StatCards';
import Drawer from '../components/Drawer';
import IconAction from '../components/IconAction';
import {
  monitorTasks, monitorAlerts, pushRules, charts, reports, dashboards, dataScreens,
  resourceTypeLabel, pushChannelLabel, getResourceDatasets, getDatasetFields, getYearMonth,
  type MetricData, type MonitorResourceType, type MonitorTask, type MonitorTaskStatus, type PushRule,
  type MonitorRule, type MonitorCombineType,
} from '../data/mockData';

/* ==================== 类型 ==================== */

interface TaskForm {
  name: string;
  resourceType: MonitorResourceType;
  resourceId: string;
  datasetName: string;
  metricNames: string[];
  dimensionName: string;
  metricRules: Record<string, MonitorRule>;
  combineType: MonitorCombineType;
  pushRuleId: string;
  description: string;
}

const emptyForm: TaskForm = {
  name: '',
  resourceType: 'report',
  resourceId: '',
  datasetName: '',
  metricNames: [],
  dimensionName: '',
  metricRules: {},
  combineType: 'and',
  pushRuleId: '',
  description: '',
};

const resourceOptions: { type: MonitorResourceType; label: string; icon: React.ElementType; items: { id: string; name: string }[] }[] = [
  { type: 'chart', label: '图表', icon: BarChart3, items: charts.map((c) => ({ id: c.id, name: c.name })) },
  { type: 'dashboard', label: '仪表盘', icon: LayoutDashboard, items: dashboards.map((d) => ({ id: d.id, name: d.name })) },
  { type: 'report', label: '报表', icon: FileText, items: reports.map((r) => ({ id: r.id, name: r.name })) },
  { type: 'screen', label: '数据大屏', icon: Monitor, items: dataScreens.map((s) => ({ id: s.id, name: s.name })) },
];

const operatorText: Record<MonitorRule['operator'], string> = {
  '>': '>',
  '<': '<',
  '>=': '≥',
  '<=': '≤',
  '=': '=',
  '!=': '≠',
};

/* ==================== 状态标签 ==================== */

function StatusTag({ status }: { status: MonitorTaskStatus }) {
  const map: Record<MonitorTaskStatus, { cls: string; label: string }> = {
    running: { cls: 'dae-tag-green', label: '运行中' },
    paused: { cls: 'dae-tag-orange', label: '已暂停' },
    disabled: { cls: 'dae-tag-gray', label: '已禁用' },
  };
  const { cls, label } = map[status];
  return <span className={`dae-tag ${cls}`}>{label}</span>;
}

/* ==================== 规则展示 ==================== */

function formatRules(task: Pick<MonitorTask, 'metricNames' | 'metricRules' | 'combineType'>) {
  const parts = task.metricNames.map((m) => {
    const r = task.metricRules[m];
    if (!r) return m;
    return `${m} ${operatorText[r.operator] || r.operator} ${r.threshold}`;
  });
  if (parts.length <= 1) return parts[0] || '-';
  const joiner = task.combineType === 'and' ? ' 且 ' : ' 或 ';
  return parts.join(joiner);
}

/* ==================== 任务详情 ==================== */

function TaskDetail({ task, pushRule }: { task: MonitorTask; pushRule?: PushRule }) {
  const alertCount = monitorAlerts.filter((a) => a.taskId === task.id).length;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <section style={{ background: 'var(--dae-surface)', borderRadius: 'var(--dae-radius-lg)', padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 12 }}>基本信息</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px 24px', fontSize: 13 }}>
          <div><span style={{ color: 'var(--dae-ink-muted)' }}>任务名称：</span>{task.name}</div>
          <div><span style={{ color: 'var(--dae-ink-muted)' }}>监控资源：</span>{resourceTypeLabel[task.resourceType]} / {task.resourceName}</div>
          <div><span style={{ color: 'var(--dae-ink-muted)' }}>数据集：</span>{task.datasetName}</div>
          <div><span style={{ color: 'var(--dae-ink-muted)' }}>监控指标：</span>{task.metricNames.join('、')}</div>
          <div><span style={{ color: 'var(--dae-ink-muted)' }}>监控维度：</span>{task.dimensionName}</div>
          <div><span style={{ color: 'var(--dae-ink-muted)' }}>触发规则：</span>{formatRules(task)}</div>
          <div><span style={{ color: 'var(--dae-ink-muted)' }}>创建人：</span>{task.creator}</div>
          <div><span style={{ color: 'var(--dae-ink-muted)' }}>创建时间：</span>{task.createdAt}</div>
        </div>
        {task.description && (
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--dae-ink-secondary)' }}>{task.description}</div>
        )}
      </section>

      <section style={{ background: 'var(--dae-surface)', borderRadius: 'var(--dae-radius-lg)', padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 12 }}>推送规则</div>
        {pushRule ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px 24px', fontSize: 13 }}>
            <div><span style={{ color: 'var(--dae-ink-muted)' }}>规则名称：</span>{pushRule.name}</div>
            <div><span style={{ color: 'var(--dae-ink-muted)' }}>推送方式：</span>{pushChannelLabel[pushRule.channel]}</div>
            <div><span style={{ color: 'var(--dae-ink-muted)' }}>接收人：</span>{pushRule.receiver}</div>
            {pushRule.cc && <div><span style={{ color: 'var(--dae-ink-muted)' }}>抄送：</span>{pushRule.cc}</div>}
          </div>
        ) : (
          <div style={{ color: 'var(--dae-ink-muted)', fontSize: 13 }}>未配置推送规则</div>
        )}
      </section>

      <section style={{ background: 'var(--dae-surface)', borderRadius: 'var(--dae-radius-lg)', padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 12 }}>预警统计</div>
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--dae-primary)' }}>{alertCount}</div>
            <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>累计预警</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--dae-error)' }}>
              {monitorAlerts.filter((a) => a.taskId === task.id && a.status === 'pending').length}
            </div>
            <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>待处理</div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ==================== 可收起区块（必须定义在 Drawer 外部，避免重渲染时滚动丢失） ==================== */

interface SectionProps {
  title: string;
  sectionKey: string;
  expanded: Record<string, boolean>;
  onToggle: (key: string) => void;
  children: React.ReactNode;
}

function Section({ title, sectionKey, expanded, onToggle, children }: SectionProps) {
  const isExpanded = expanded[sectionKey] !== false;
  return (
    <div style={{ border: '1px solid var(--dae-border)', borderRadius: 'var(--dae-radius-lg)', overflow: 'hidden', background: '#fff' }}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onToggle(sectionKey);
        }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          background: '#fff',
          border: 'none',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--dae-ink)',
        }}
      >
        <span>{title}</span>
        <ChevronDown
          size={18}
          style={{
            color: 'var(--dae-ink-muted)',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>
      {isExpanded && <div style={{ padding: '0 16px 16px' }}>{children}</div>}
    </div>
  );
}

/* ==================== 创建/编辑任务 Drawer ==================== */

function TaskFormDrawer({
  open,
  editing,
  onClose,
  onSave,
}: {
  open: boolean;
  editing: MonitorTask | null;
  onClose: () => void;
  onSave: (task: MonitorTask) => void;
}) {
  const [form, setForm] = useState<TaskForm>(emptyForm);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    base: true,
    resource: true,
    metric: true,
    rule: true,
    push: true,
  });

  React.useEffect(() => {
    if (open) {
      if (editing) {
        // 兼容旧数据：若存在旧 rule 字段但无 metricRules，则按单指标初始化
        const legacyRule = (editing as unknown as { rule?: MonitorRule }).rule;
        const metricRules: Record<string, MonitorRule> =
          editing.metricRules && Object.keys(editing.metricRules).length > 0
            ? { ...editing.metricRules }
            : editing.metricNames.length === 1 && legacyRule
              ? { [editing.metricNames[0]]: { ...legacyRule } }
              : {};
        setForm({
          name: editing.name,
          resourceType: editing.resourceType,
          resourceId: editing.resourceId,
          datasetName: editing.datasetName,
          metricNames: [...editing.metricNames],
          dimensionName: editing.dimensionName,
          metricRules,
          combineType: editing.combineType || 'and',
          pushRuleId: editing.pushRuleId,
          description: editing.description || '',
        });
      } else {
        setForm(emptyForm);
      }
      setExpanded({ base: true, resource: true, metric: true, rule: true, push: true });
    }
  }, [open, editing]);

  const datasets = useMemo(() => getResourceDatasets(form.resourceType, form.resourceId), [form.resourceType, form.resourceId]);
  const fields = useMemo(() => getDatasetFields(form.datasetName), [form.datasetName]);

  const update = <K extends keyof TaskForm>(key: K, value: TaskForm[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value } as TaskForm;
      if (key === 'resourceType' || key === 'resourceId') {
        next.datasetName = '';
        next.metricNames = [];
        next.metricRules = {};
        next.dimensionName = '';
      }
      if (key === 'datasetName') {
        next.metricNames = [];
        next.metricRules = {};
        next.dimensionName = '';
      }
      return next;
    });
  };

  const toggleMetric = (metric: string) => {
    setForm((prev) => {
      const exists = prev.metricNames.includes(metric);
      const nextMetrics = exists ? prev.metricNames.filter((m) => m !== metric) : [...prev.metricNames, metric];
      const nextRules = { ...prev.metricRules };
      if (exists) {
        delete nextRules[metric];
      } else {
        nextRules[metric] = { operator: '<', threshold: 0 };
      }
      return { ...prev, metricNames: nextMetrics, metricRules: nextRules };
    });
  };

  const updateMetricRule = (metric: string, patch: Partial<MonitorRule>) => {
    setForm((prev) => ({
      ...prev,
      metricRules: {
        ...prev.metricRules,
        [metric]: { ...prev.metricRules[metric], ...patch },
      },
    }));
  };

  const handleSave = () => {
    const resourceName = resourceOptions
      .find((g) => g.type === form.resourceType)
      ?.items.find((i) => i.id === form.resourceId)?.name || '';
    onSave({
      id: editing?.id || `MT${String(Date.now()).slice(-5)}`,
      name: form.name.trim(),
      resourceType: form.resourceType,
      resourceId: form.resourceId,
      resourceName,
      datasetName: form.datasetName,
      metricNames: [...form.metricNames],
      dimensionName: form.dimensionName,
      metricRules: { ...form.metricRules },
      combineType: form.combineType,
      pushRuleId: form.pushRuleId,
      status: editing?.status || 'running',
      creator: editing?.creator || '当前用户',
      createdAt: editing?.createdAt || new Date().toLocaleString('zh-CN'),
      updatedAt: new Date().toLocaleString('zh-CN'),
      description: form.description,
    });
  };

  const toggleSection = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allRulesValid = form.metricNames.length > 0 && form.metricNames.every((m) => {
    const r = form.metricRules[m];
    return r && !Number.isNaN(r.threshold);
  });

  const canSave =
    !!form.name.trim() &&
    !!form.resourceId &&
    !!form.datasetName &&
    form.metricNames.length > 0 &&
    !!form.dimensionName &&
    !!form.pushRuleId &&
    allRulesValid;

  return (
    <Drawer
      open={open}
      title={editing ? '编辑监控任务' : '新建监控任务'}
      width={720}
      onClose={onClose}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button type="button" className="dae-btn dae-btn-secondary" onClick={onClose}>
            取消
          </button>
          <button type="button" className="dae-btn dae-btn-primary" disabled={!canSave} onClick={handleSave}>
            保存
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 基本信息 */}
        <Section title="基本信息" sectionKey="base" expanded={expanded} onToggle={toggleSection}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>任务名称</label>
              <input
                className="dae-input"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="请输入监控任务名称"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>任务说明</label>
              <textarea
                className="dae-input"
                rows={3}
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="描述监控任务的业务背景"
                style={{ resize: 'none' }}
              />
            </div>
          </div>
        </Section>

        {/* 监控对象 */}
        <Section title="监控对象" sectionKey="resource" expanded={expanded} onToggle={toggleSection}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>监控资源类型</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {resourceOptions.map((opt) => {
                  const Icon = opt.icon;
                  const active = form.resourceType === opt.type;
                  return (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        update('resourceType', opt.type);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: 12,
                        borderRadius: 'var(--dae-radius-md)',
                        border: `1px solid ${active ? 'var(--dae-primary)' : 'var(--dae-border)'}`,
                        background: active ? 'var(--dae-primary-light)' : '#fff',
                        color: active ? 'var(--dae-primary)' : 'var(--dae-ink)',
                        cursor: 'pointer',
                        fontSize: 13,
                        textAlign: 'left',
                      }}
                    >
                      <Icon size={18} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>选择具体资源</label>
              <select
                className="dae-input"
                value={form.resourceId}
                onChange={(e) => update('resourceId', e.target.value)}
              >
                <option value="">请选择</option>
                {resourceOptions
                  .find((g) => g.type === form.resourceType)
                  ?.items.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
              </select>
            </div>
          </div>
        </Section>

        {/* 监控指标 */}
        <Section title="监控指标" sectionKey="metric" expanded={expanded} onToggle={toggleSection}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>选择数据集</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {datasets.length === 0 && <div className="dae-empty" style={{ padding: 20 }}><p>该资源未关联数据集</p></div>}
                {datasets.map((ds) => {
                  const active = form.datasetName === ds;
                  return (
                    <button
                      key={ds}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        update('datasetName', ds);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: 12,
                        borderRadius: 'var(--dae-radius-md)',
                        border: `1px solid ${active ? 'var(--dae-primary)' : 'var(--dae-border)'}`,
                        background: active ? 'var(--dae-primary-light)' : '#fff',
                        color: active ? 'var(--dae-primary)' : 'var(--dae-ink)',
                        cursor: 'pointer',
                        fontSize: 13,
                        textAlign: 'left',
                      }}
                    >
                      <Database size={16} />
                      {ds}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>监控指标（可多选）</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {fields.metrics.length === 0 && <div className="dae-empty" style={{ padding: 20 }}><p>该数据集下暂无指标字段</p></div>}
                {fields.metrics.map((m) => {
                  const active = form.metricNames.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleMetric(m);
                      }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 'var(--dae-radius-md)',
                        border: `1px solid ${active ? 'var(--dae-primary)' : 'var(--dae-border)'}`,
                        background: active ? 'var(--dae-primary-light)' : '#fff',
                        color: active ? 'var(--dae-primary)' : 'var(--dae-ink)',
                        cursor: 'pointer',
                        fontSize: 13,
                      }}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>监控维度</label>
              <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)', marginBottom: 8 }}>
                选择维度后，系统会按该维度下钻检测每个维度值是否触发规则（例如：按省份检测每个省份的销售额）。
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {fields.dimensions.length === 0 && <div className="dae-empty" style={{ padding: 20 }}><p>该数据集下暂无维度字段</p></div>}
                {fields.dimensions.map((d) => {
                  const active = form.dimensionName === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        update('dimensionName', d);
                      }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 'var(--dae-radius-md)',
                        border: `1px solid ${active ? 'var(--dae-primary)' : 'var(--dae-border)'}`,
                        background: active ? 'var(--dae-primary-light)' : '#fff',
                        color: active ? 'var(--dae-primary)' : 'var(--dae-ink)',
                        cursor: 'pointer',
                        fontSize: 13,
                      }}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Section>

        {/* 触发规则 */}
        <Section title="触发规则" sectionKey="rule" expanded={expanded} onToggle={toggleSection}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 13, color: 'var(--dae-ink-muted)' }}>
              当指标按「{form.dimensionName || '维度'}」下钻后的值满足以下规则时触发预警：
            </div>

            {form.metricNames.length === 0 && (
              <div className="dae-empty" style={{ padding: 20 }}>
                <p>请先在上方的「监控指标」中选择至少一个指标</p>
              </div>
            )}

            {form.metricNames.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
                <span style={{ color: 'var(--dae-ink-secondary)' }}>多指标组合关系：</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['and', 'or'] as MonitorCombineType[]).map((t) => {
                    const active = form.combineType === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          update('combineType', t);
                        }}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--dae-radius-md)',
                          border: `1px solid ${active ? 'var(--dae-primary)' : 'var(--dae-border)'}`,
                          background: active ? 'var(--dae-primary-light)' : '#fff',
                          color: active ? 'var(--dae-primary)' : 'var(--dae-ink)',
                          cursor: 'pointer',
                          fontSize: 13,
                        }}
                      >
                        {t === 'and' ? '满足全部（且）' : '满足任意（或）'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {form.metricNames.map((metric) => {
                const rule = form.metricRules[metric] || { operator: '<', threshold: 0 };
                return (
                  <div
                    key={metric}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 12,
                      background: 'var(--dae-surface)',
                      borderRadius: 'var(--dae-radius-md)',
                      border: '1px solid var(--dae-border)',
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 500, minWidth: 80 }}>{metric}</span>
                    <select
                      className="dae-input"
                      style={{ width: 100 }}
                      value={rule.operator}
                      onChange={(e) => updateMetricRule(metric, { operator: e.target.value as MonitorRule['operator'] })}
                    >
                      <option value=">">&gt;</option>
                      <option value="<">&lt;</option>
                      <option value=">=">&gt;=</option>
                      <option value="<=">&lt;=</option>
                      <option value="=">=</option>
                      <option value="!=">≠</option>
                    </select>
                    <input
                      className="dae-input"
                      type="number"
                      style={{ flex: 1 }}
                      value={rule.threshold}
                      onChange={(e) => updateMetricRule(metric, { threshold: Number(e.target.value) })}
                      placeholder="阈值"
                    />
                  </div>
                );
              })}
            </div>

            {form.metricNames.length > 0 && (
              <div style={{ background: 'var(--dae-primary-light)', borderRadius: 'var(--dae-radius-md)', padding: 12, fontSize: 13, color: 'var(--dae-primary)' }}>
                示例：按「{form.dimensionName || '维度'}」下钻后，
                {formatRules({ metricNames: form.metricNames, metricRules: form.metricRules, combineType: form.combineType })}
                {' '}时发送预警。
              </div>
            )}
          </div>
        </Section>

        {/* 推送规则 */}
        <Section title="推送规则" sectionKey="push" expanded={expanded} onToggle={toggleSection}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 13, color: 'var(--dae-ink-muted)' }}>选择触发预警后的通知规则：</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pushRules.map((rule) => {
                const active = form.pushRuleId === rule.id;
                return (
                  <button
                    key={rule.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      update('pushRuleId', rule.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: 12,
                      borderRadius: 'var(--dae-radius-md)',
                      border: `1px solid ${active ? 'var(--dae-primary)' : 'var(--dae-border)'}`,
                      background: active ? 'var(--dae-primary-light)' : '#fff',
                      color: active ? 'var(--dae-primary)' : 'var(--dae-ink)',
                      cursor: 'pointer',
                      fontSize: 13,
                      textAlign: 'left',
                    }}
                  >
                    <Send size={16} />
                    <span style={{ flex: 1 }}>{rule.name}</span>
                    <span className={`dae-tag ${rule.enabled ? 'dae-tag-green' : 'dae-tag-gray'}`}>
                      {rule.enabled ? '已启用' : '已禁用'}
                    </span>
                    <span style={{ color: 'var(--dae-ink-muted)' }}>{pushChannelLabel[rule.channel]}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>
              提示：如需新增推送规则，可前往「推送规则」页面管理。
            </div>
          </div>
        </Section>
      </div>
    </Drawer>
  );
}

/* ==================== 主页面 ==================== */

export default function MetricsTaskPage() {
  const [tasks, setTasks] = useState<MonitorTask[]>(monitorTasks);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MonitorTaskStatus | 'all'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<MonitorTask | null>(null);
  const [detailTask, setDetailTask] = useState<MonitorTask | null>(null);

  // 看板指标：基于实时任务与预警数据动态计算
  const currentYm = getYearMonth(new Date().toLocaleString('zh-CN'));
  const taskStats = useMemo<MetricData[]>(() => {
    const monthTaskCount = tasks.filter((t) => getYearMonth(t.createdAt) === currentYm).length;
    const monthAlertCount = monitorAlerts.filter((a) => getYearMonth(a.triggeredAt) === currentYm).length;
    const pendingAlertCount = monitorAlerts.filter((a) => a.status === 'pending').length;
    const runningCount = tasks.filter((t) => t.status === 'running').length;
    return [
      { label: '本月监控任务数', value: String(monthTaskCount), unit: '个', trendText: '本月新增' },
      { label: '本月预警数', value: String(monthAlertCount), unit: '条', trendText: '本月触发' },
      { label: '待处理预警', value: String(pendingAlertCount), unit: '条', trendText: pendingAlertCount > 0 ? '需关注' : '已全部处理' },
      { label: '运行中任务', value: String(runningCount), unit: '个', trendText: '实时监测中' },
    ];
  }, [tasks, currentYm]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.resourceName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tasks, search, statusFilter]);

  const handleSave = (task: MonitorTask) => {
    setTasks((prev) => {
      const exists = prev.find((t) => t.id === task.id);
      if (exists) {
        return prev.map((t) => (t.id === task.id ? task : t));
      }
      return [task, ...prev];
    });
    setFormOpen(false);
    setEditingTask(null);
  };

  const toggleStatus = (task: MonitorTask) => {
    const next: MonitorTaskStatus = task.status === 'running' ? 'paused' : 'running';
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: next, updatedAt: new Date().toLocaleString('zh-CN') } : t)));
  };

  const handleDelete = (task: MonitorTask) => {
    if (confirm(`确定删除监控任务「${task.name}」？`)) {
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    }
  };

  return (
    <div>
      <PageHeader
        title="监控任务"
        breadcrumb="监控告警 / 监控任务"
        actions={
          <button type="button" className="dae-btn dae-btn-primary" onClick={() => { setEditingTask(null); setFormOpen(true); }}>
            <Plus size={16} />
            新建监控任务
          </button>
        }
      />

      <StatCards data={taskStats} />

      {/* 筛选栏 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--dae-ink-subtle)',
            }}
          />
          <input
            className="dae-input"
            placeholder="搜索任务名称或资源..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 32 }}
          />
        </div>
        <select
          className="dae-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as MonitorTaskStatus | 'all')}
          style={{ width: 140 }}
        >
          <option value="all">全部状态</option>
          <option value="running">运行中</option>
          <option value="paused">已暂停</option>
          <option value="disabled">已禁用</option>
        </select>
      </div>

      {/* 任务列表 */}
      <div style={{ background: '#fff', borderRadius: 'var(--dae-radius-lg)', border: '1px solid var(--dae-border)', overflow: 'hidden' }}>
        <table className="dae-table">
          <thead>
            <tr>
              <th>任务名称</th>
              <th>监控资源</th>
              <th>数据集</th>
              <th>监控指标</th>
              <th>监控维度</th>
              <th>触发规则</th>
              <th>状态</th>
              <th>创建人</th>
              <th style={{ width: 160 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: 48 }}>
                  <div className="dae-empty">
                    <AlertTriangle size={40} style={{ color: 'var(--dae-ink-subtle)' }} />
                    <p>暂无监控任务</p>
                  </div>
                </td>
              </tr>
            )}
            {filteredTasks.map((task) => (
              <tr key={task.id}>
                <td>
                  <div style={{ fontWeight: 500, color: 'var(--dae-ink)' }}>{task.name}</div>
                  {task.description && <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)', marginTop: 2 }}>{task.description}</div>}
                </td>
                <td>
                  <span className="dae-tag dae-tag-blue">{resourceTypeLabel[task.resourceType]}</span>
                  <div style={{ fontSize: 12, color: 'var(--dae-ink-secondary)', marginTop: 4 }}>{task.resourceName}</div>
                </td>
                <td>{task.datasetName}</td>
                <td>{task.metricNames.join('、')}</td>
                <td>{task.dimensionName}</td>
                <td>{formatRules(task)}</td>
                <td><StatusTag status={task.status} /></td>
                <td>{task.creator}</td>
                <td>
                  <div className="dae-table-actions">
                    <IconAction icon={<Eye size={16} />} label="详情" onClick={() => setDetailTask(task)} />
                    <IconAction
                      icon={<Edit2 size={16} />}
                      label="编辑"
                      onClick={() => { setEditingTask(task); setFormOpen(true); }}
                    />
                    <IconAction
                      icon={task.status === 'running' ? <Pause size={16} /> : <Play size={16} />}
                      label={task.status === 'running' ? '暂停' : '启用'}
                      onClick={() => toggleStatus(task)}
                    />
                    <IconAction icon={<Trash2 size={16} />} label="删除" onClick={() => handleDelete(task)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TaskFormDrawer
        open={formOpen}
        editing={editingTask}
        onClose={() => { setFormOpen(false); setEditingTask(null); }}
        onSave={handleSave}
      />

      <Drawer
        open={!!detailTask}
        title="任务详情"
        width={560}
        onClose={() => setDetailTask(null)}
      >
        {detailTask && <TaskDetail task={detailTask} pushRule={pushRules.find((p) => p.id === detailTask.pushRuleId)} />}
      </Drawer>
    </div>
  );
}
