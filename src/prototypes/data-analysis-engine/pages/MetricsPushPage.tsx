import React, { useMemo, useState } from 'react';
import {
  Send, Plus, Search, Edit2, Trash2, Mail, MessageSquare,
  MessageCircle, Check, X, TestTube,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import IconAction from '../components/IconAction';
import {
  pushRules, pushChannelLabel, type PushRule, type PushChannel,
} from '../data/mockData';

const channelOptions: { key: PushChannel; label: string; icon: React.ElementType }[] = [
  { key: 'email', label: '邮件', icon: Mail },
  { key: 'message', label: '站内信', icon: MessageSquare },
  { key: 'wecom', label: '企业微信', icon: MessageCircle },
];

export default function MetricsPushPage() {
  const [rules, setRules] = useState<PushRule[]>(pushRules);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PushRule | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; msg: string } | null>(null);

  const [form, setForm] = useState<{
    name: string;
    channel: PushChannel;
    receiver: string;
    cc: string;
    enabled: boolean;
  }>({ name: '', channel: 'email', receiver: '', cc: '', enabled: true });

  const filteredRules = useMemo(() => {
    return rules.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.receiver.toLowerCase().includes(search.toLowerCase()));
  }, [rules, search]);

  const resetForm = () => {
    setForm({ name: '', channel: 'email', receiver: '', cc: '', enabled: true });
  };

  const openCreate = () => {
    resetForm();
    setEditingRule(null);
    setFormOpen(true);
  };

  const openEdit = (rule: PushRule) => {
    setForm({
      name: rule.name,
      channel: rule.channel,
      receiver: rule.receiver,
      cc: rule.cc || '',
      enabled: rule.enabled,
    });
    setEditingRule(rule);
    setFormOpen(true);
  };

  const handleSave = () => {
    const now = new Date().toLocaleString('zh-CN');
    if (editingRule) {
      setRules((prev) => prev.map((r) => (r.id === editingRule.id ? { ...r, ...form, updatedAt: now } : r)));
    } else {
      const newRule: PushRule = {
        id: `PR${String(Date.now()).slice(-5)}`,
        ...form,
        creator: '当前用户',
        createdAt: now,
        updatedAt: now,
      };
      setRules((prev) => [newRule, ...prev]);
    }
    setFormOpen(false);
  };

  const handleDelete = (rule: PushRule) => {
    if (confirm(`确定删除推送规则「${rule.name}」？`)) {
      setRules((prev) => prev.filter((r) => r.id !== rule.id));
    }
  };

  const handleTest = (rule: PushRule) => {
    setTestResult({ id: rule.id, msg: `已向 ${rule.receiver} 发送一条${pushChannelLabel[rule.channel]}测试消息` });
    setTimeout(() => setTestResult((prev) => (prev?.id === rule.id ? null : prev)), 3000);
  };

  const toggleEnable = (rule: PushRule) => {
    setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, enabled: !r.enabled, updatedAt: new Date().toLocaleString('zh-CN') } : r)));
  };

  return (
    <div>
      <PageHeader
        title="推送规则"
        breadcrumb="监控告警 / 推送规则"
        actions={
          <button className="dae-btn dae-btn-primary" onClick={openCreate}>
            <Plus size={16} />
            新建推送规则
          </button>
        }
      />

      {/* 看板 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="dae-stat-card">
          <div className="dae-stat-label">规则总数</div>
          <div className="dae-stat-value">{rules.length}</div>
        </div>
        <div className="dae-stat-card">
          <div className="dae-stat-label">已启用</div>
          <div className="dae-stat-value" style={{ color: 'var(--dae-success)' }}>{rules.filter((r) => r.enabled).length}</div>
        </div>
        <div className="dae-stat-card">
          <div className="dae-stat-label">已禁用</div>
          <div className="dae-stat-value" style={{ color: 'var(--dae-ink-muted)' }}>{rules.filter((r) => !r.enabled).length}</div>
        </div>
      </div>

      {/* 筛选 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--dae-ink-subtle)' }} />
          <input
            className="dae-input"
            placeholder="搜索规则名称或接收人..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 32 }}
          />
        </div>
      </div>

      {/* 规则卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {filteredRules.length === 0 && (
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="dae-empty" style={{ background: '#fff', borderRadius: 'var(--dae-radius-lg)', border: '1px solid var(--dae-border)', padding: 48 }}>
              <Send size={40} style={{ color: 'var(--dae-ink-subtle)' }} />
              <p>暂无推送规则</p>
            </div>
          </div>
        )}
        {filteredRules.map((rule) => {
          const ChannelIcon = channelOptions.find((c) => c.key === rule.channel)?.icon || Send;
          return (
            <div
              key={rule.id}
              style={{
                background: '#fff',
                borderRadius: 'var(--dae-radius-lg)',
                border: '1px solid var(--dae-border)',
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                opacity: rule.enabled ? 1 : 0.7,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--dae-primary-light)', color: 'var(--dae-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChannelIcon size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--dae-ink)' }}>{rule.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)', marginTop: 2 }}>{pushChannelLabel[rule.channel]}</div>
                  </div>
                </div>
                <span className={`dae-tag ${rule.enabled ? 'dae-tag-green' : 'dae-tag-gray'}`}>{rule.enabled ? '已启用' : '已禁用'}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <div><span style={{ color: 'var(--dae-ink-muted)' }}>接收人：</span>{rule.receiver}</div>
                {rule.cc && <div><span style={{ color: 'var(--dae-ink-muted)' }}>抄送：</span>{rule.cc}</div>}
                <div><span style={{ color: 'var(--dae-ink-muted)' }}>创建人：</span>{rule.creator}</div>
                <div><span style={{ color: 'var(--dae-ink-muted)' }}>更新时间：</span>{rule.updatedAt}</div>
              </div>

              {testResult?.id === rule.id && (
                <div style={{ padding: 10, background: 'var(--dae-primary-light)', borderRadius: 'var(--dae-radius-md)', fontSize: 12, color: 'var(--dae-primary)' }}>
                  {testResult.msg}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--dae-border)' }}>
                <button className="dae-btn dae-btn-secondary dae-btn-sm" onClick={() => openEdit(rule)}>
                  <Edit2 size={14} /> 编辑
                </button>
                <button className="dae-btn dae-btn-secondary dae-btn-sm" onClick={() => handleTest(rule)}>
                  <TestTube size={14} /> 测试
                </button>
                <button className="dae-btn dae-btn-secondary dae-btn-sm" onClick={() => toggleEnable(rule)}>
                  {rule.enabled ? <><X size={14} /> 禁用</> : <><Check size={14} /> 启用</>}
                </button>
                <button className="dae-btn dae-btn-danger dae-btn-sm" style={{ marginLeft: 'auto' }} onClick={() => handleDelete(rule)}>
                  <Trash2 size={14} /> 删除
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={formOpen}
        title={editingRule ? '编辑推送规则' : '新建推送规则'}
        onClose={() => setFormOpen(false)}
        footer={
          <>
            <button className="dae-btn dae-btn-secondary" onClick={() => setFormOpen(false)}>取消</button>
            <button className="dae-btn dae-btn-primary" disabled={!form.name.trim() || !form.receiver.trim()} onClick={handleSave}>
              保存
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>规则名称</label>
            <input
              className="dae-input"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="如：销售团队邮件通知"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>推送方式</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {channelOptions.map((opt) => {
                const Icon = opt.icon;
                const active = form.channel === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setForm((prev) => ({ ...prev, channel: opt.key }))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '10px 0',
                      borderRadius: 'var(--dae-radius-md)',
                      border: `1px solid ${active ? 'var(--dae-primary)' : 'var(--dae-border)'}`,
                      background: active ? 'var(--dae-primary-light)' : '#fff',
                      color: active ? 'var(--dae-primary)' : 'var(--dae-ink)',
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    <Icon size={16} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>接收人</label>
            <input
              className="dae-input"
              value={form.receiver}
              onChange={(e) => setForm((prev) => ({ ...prev, receiver: e.target.value }))}
              placeholder={form.channel === 'email' ? '邮箱地址' : form.channel === 'wecom' ? '企业微信群ID' : '站内信账号'}
            />
          </div>

          {form.channel === 'email' && (
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>抄送（可选）</label>
              <input
                className="dae-input"
                value={form.cc}
                onChange={(e) => setForm((prev) => ({ ...prev, cc: e.target.value }))}
                placeholder="多个邮箱用逗号分隔"
              />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
            <input
              type="checkbox"
              id="rule-enabled"
              checked={form.enabled}
              onChange={(e) => setForm((prev) => ({ ...prev, enabled: e.target.checked }))}
            />
            <label htmlFor="rule-enabled" style={{ cursor: 'pointer' }}>创建后立即启用</label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
