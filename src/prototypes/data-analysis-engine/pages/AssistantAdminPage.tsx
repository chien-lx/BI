/**
 * AI 助手管理后台（仅超级管理员可访问）
 * 参考 Dify / Coze / 飞书智能伙伴 的知识库设计：
 *  - 知识库：操作手册文档的查看 / 搜索 / 新建 / 编辑 / 删除 / 预览
 *  - 文档上传：拖拽上传本地文件（PDF/Word/TXT/Markdown），自动切分为 chunk
 *  - 切分策略：自动分段 / 自定义分段（分隔符、chunk 长度、重叠长度）
 *  - 在线预览：原始内容 + 分块列表双栏展示（放大）
 *  - 在线编辑：支持修改文档原始内容并重新切分
 *  - 发布管理：列表「发布 / 下线」开关，仅「已发布」文档可被助手调用
 *  - 手动录入：最小化配置——只填标题、分类、操作步骤，关键词自动提取、
 *    操作路径从步骤内容自动识别，操作步骤支持插入图片
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  X,
  Save,
  RotateCcw,
  Bot,
  Image as ImageIcon,
  Upload,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Filter,
} from 'lucide-react';
import { parseHashParams } from '../../../common/useHashPage';
import { useAuth } from '../contexts/AuthContext';
import {
  countDocumentStats,
  DEFAULT_CHUNK_STRATEGY,
  extractKeywords,
  getAssistantConfig,
  getConversationLogs,
  getManualDocs,
  MODEL_PROVIDERS,
  saveAssistantConfig,
  saveManualDocs,
  SEED_CONFIG,
  SEED_MANUAL,
  splitContentIntoChunks,
  titleFromFileName,
  toStepItems,
  type AssistantConfig,
  type AssistantDocCategory,
  type ChunkStrategy,
  type ConversationLog,
  type DocChunk,
  type ManualDoc,
  type ParamPreset,
} from '../data/assistantManual';

const CATEGORIES: AssistantDocCategory[] = [
  '入门引导',
  '数据准备',
  '数据分析',
  '门户与权限',
  '监控告警',
  '系统管理',
];

const EMPTY_DOC: ManualDoc = {
  id: '',
  title: '',
  category: '入门引导',
  keywords: [],
  steps: [''],
  updatedAt: new Date().toISOString().slice(0, 10),
  status: 'draft',
  sourceType: 'manual',
  stepImages: {},
};

const SUPPORTED_FILE_TYPES = '.pdf,.doc,.docx,.txt,.md,.markdown,.csv,.xlsx,.xls,.html,.htm';
const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/html',
];

export default function AssistantAdminPage({ defaultTab }: { defaultTab?: string } = {}) {
  const { currentUser } = useAuth();

  // 权限护栏：仅超级管理员可访问 AI 助手管理后台（与 Layout 下拉入口双重保险）
  if (!currentUser?.isSuperAdmin) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          color: 'var(--dae-ink-muted)',
          textAlign: 'center',
          padding: 40,
        }}
      >
        <Bot size={40} style={{ color: 'var(--dae-ink-subtle)' }} />
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--dae-ink)' }}>无访问权限</div>
        <div style={{ fontSize: 13, maxWidth: 360, lineHeight: 1.6 }}>
          「AI 助手管理」仅对系统超级管理员开放，用于维护产品操作手册与助手参数配置。
          <br />
          如需使用，请联系超级管理员开通权限。
        </div>
      </div>
    );
  }

  const initialTab: 'docs' | 'config' | 'logs' =
    defaultTab === 'config' || defaultTab === 'logs' ? defaultTab : 'docs';
  const [tab, setTab] = useState<'docs' | 'config' | 'logs'>(initialTab);
  const [docs, setDocs] = useState<ManualDoc[]>(() => migrateDocs(getManualDocs()));

  // 当左侧菜单切换（defaultTab 变化）时同步 tab 状态；同一组件复用不会自动重置 state
  useEffect(() => {
    const nextTab = defaultTab === 'config' || defaultTab === 'logs' ? defaultTab : 'docs';
    setTab(nextTab);
  }, [defaultTab]);
  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState<ManualDoc | null>(null);
  const [viewerDoc, setViewerDoc] = useState<ManualDoc | null>(null);
  const [config, setConfig] = useState<AssistantConfig>(() => getAssistantConfig());
  const [toast, setToast] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  // 从助手面板「查看完整文档」跳转进来时，自动打开文档预览
  useEffect(() => {
    const openDocById = (id?: string) => {
      if (!id) return;
      const found = getManualDocs().find((d) => d.id === id);
      if (found) setViewerDoc(found);
    };
    openDocById(parseHashParams(window.location.hash).docId);
    const onHash = () => openDocById(parseHashParams(window.location.hash).docId);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const filteredDocs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.keywords.some((k) => k.toLowerCase().includes(q)) ||
        (d.sourceName && d.sourceName.toLowerCase().includes(q)),
    );
  }, [docs, search]);

  const persistDocs = (next: ManualDoc[]) => {
    setDocs(next);
    saveManualDocs(next);
  };

  const handleDelete = (doc: ManualDoc) => {
    if (!window.confirm(`确认删除文档「${doc.title}」？`)) return;
    persistDocs(docs.filter((d) => d.id !== doc.id));
    showToast('已删除文档');
  };

  // 列表「发布 / 下线」开关
  const handleToggleStatus = (doc: ManualDoc) => {
    const next = docs.map((d): ManualDoc =>
      d.id === doc.id ? { ...d, status: d.status === 'published' ? 'draft' : 'published' } : d,
    );
    persistDocs(next);
    showToast(doc.status === 'published' ? '已下线，助手将不再调用该文档' : '已发布，助手可调用该文档');
  };

  const handleEditorSave = (doc: ManualDoc) => {
    const id = doc.id || `doc-${Date.now()}`;
    const filled: ManualDoc = {
      ...doc,
      id,
      updatedAt: new Date().toISOString().slice(0, 10),
      // 关键词自动提取，操作路径从步骤自动识别（手动录入）
      keywords: extractKeywords(doc.title, doc.steps),
      path: doc.sourceType === 'manual' ? extractPathFromStepsLocal(doc.steps) : doc.path,
      stepImages: doc.stepImages || {},
    };
    const exists = docs.some((d) => d.id === id);
    const next = exists ? docs.map((d) => (d.id === id ? filled : d)) : [...docs, filled];
    persistDocs(next);
    setEditor(null);
    showToast('文档已保存');
  };

  const handleUploadSave = (doc: ManualDoc) => {
    const id = doc.id || `doc-${Date.now()}`;
    const filled: ManualDoc = {
      ...doc,
      id,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    persistDocs([filled, ...docs]);
    setUploadOpen(false);
    showToast('文档已上传（草稿），可在列表发布后供助手调用');
  };

  const handleConfigSave = () => {
    saveAssistantConfig(config);
    showToast('配置已保存');
  };

  const handleConfigReset = () => {
    setConfig(SEED_CONFIG);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 520 }}>
      {/* 页头 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <PageHeaderAvatar config={config} />
        <div>
          <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--dae-ink)' }}>AI 助手管理</div>
          <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>维护操作手册知识库与助手参数配置</div>
        </div>
      </div>

      <section style={{ flex: 1, minHeight: 0, border: '1px solid var(--dae-border)', borderRadius: 'var(--dae-radius-lg)', background: '#fff', padding: 18, overflow: 'auto' }} className="dae-scroll">
        {tab === 'docs' ? (
          <DocsTab
            docs={filteredDocs}
            search={search}
            onSearch={setSearch}
            onNew={() => setEditor({ ...EMPTY_DOC })}
            onUpload={() => setUploadOpen(true)}
            onEdit={setEditor}
            onPreview={setViewerDoc}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        ) : tab === 'config' ? (
          <ConfigTab
            config={config}
            onChange={setConfig}
            onSave={handleConfigSave}
            onReset={handleConfigReset}
          />
        ) : (
          <LogsTab />
        )}
      </section>

      {/* 文档编辑器 */}
      {editor && (
        <DocEditor
          doc={editor}
          onClose={() => setEditor(null)}
          onSave={handleEditorSave}
        />
      )}

      {/* 文档上传 */}
      {uploadOpen && (
        <DocUploader
          onClose={() => setUploadOpen(false)}
          onSave={handleUploadSave}
        />
      )}

      {/* 文档预览 */}
      {viewerDoc && <DocViewer doc={viewerDoc} onClose={() => setViewerDoc(null)} />}

      {/* 轻提示 */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 28,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--dae-ink)',
            color: '#fff',
            padding: '9px 16px',
            borderRadius: 10,
            fontSize: 13,
            zIndex: 100002,
            boxShadow: 'var(--dae-shadow-lg)',
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

/* 本地副本：避免与数据层循环依赖时显式解耦（实际复用数据层实现） */
function extractPathFromStepsLocal(steps: string[]): string {
  const text = steps.join('\n');
  const quoted = text.match(/[「『]([^」』]*[→\-—>][^」』]*)[」』]/);
  if (quoted) return quoted[1].trim();
  const nav = text.match(/(?:进入|打开|切换到|前往|返回)\s*[「『]?([^「『」』\n，。、]{2,20})[」』]?/);
  if (nav) return nav[1].trim();
  return '';
}

/* ============================ 数据迁移 ============================ */

function migrateDocs(docs: ManualDoc[]): ManualDoc[] {
  return docs.map((d) => ({
    ...d,
    sourceType: d.sourceType || 'manual',
    keywords: d.keywords && d.keywords.length ? d.keywords : extractKeywords(d.title, d.steps || []),
    stepImages: d.stepImages || {},
    charCount: d.charCount ?? (d.content ? d.content.length : undefined),
    wordCount: d.wordCount ?? undefined,
    chunks: d.chunks ?? (d.content ? splitContentIntoChunks(d.content) : undefined),
    chunkStrategy: d.chunkStrategy ?? DEFAULT_CHUNK_STRATEGY,
    path: d.path ?? (d.sourceType === 'manual' ? extractPathFromStepsLocal(d.steps || []) : undefined),
  }));
}

/* ============================ 子组件 ============================ */

function DocsTab({
  docs,
  search,
  onSearch,
  onNew,
  onUpload,
  onEdit,
  onPreview,
  onDelete,
  onToggleStatus,
}: {
  docs: ManualDoc[];
  search: string;
  onSearch: (v: string) => void;
  onNew: () => void;
  onUpload: () => void;
  onEdit: (d: ManualDoc) => void;
  onPreview: (d: ManualDoc) => void;
  onDelete: (d: ManualDoc) => void;
  onToggleStatus: (d: ManualDoc) => void;
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--dae-ink)' }}>知识库文档（{docs.length}）</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onUpload}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              border: '1px solid var(--dae-primary)',
              background: '#fff',
              color: 'var(--dae-primary)',
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            <Upload size={15} /> 上传文档
          </button>
          <button
            onClick={onNew}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--dae-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            <Plus size={15} /> 手动录入
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: 14, maxWidth: 360 }}>
        <Search size={15} style={{ position: 'absolute', left: 11, top: 10, color: 'var(--dae-ink-subtle)' }} />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="搜索标题 / 分类 / 关键词 / 文件名"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '9px 12px 9px 34px',
            border: '1px solid var(--dae-border)',
            borderRadius: 8,
            fontSize: 13,
            outline: 'none',
          }}
        />
      </div>

      <table className="dae-table">
        <thead>
          <tr>
            <th style={{ width: 40 }}>#</th>
            <th>标题</th>
            <th style={{ width: 110 }}>分类</th>
            <th style={{ width: 90 }}>来源</th>
            <th style={{ width: 130 }}>状态（发布 / 下线）</th>
            <th style={{ width: 130 }}>分块 / 字符</th>
            <th style={{ width: 120 }}>更新时间</th>
            <th style={{ width: 120 }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {docs.length === 0 && (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', color: 'var(--dae-ink-muted)', padding: 28 }}>暂无匹配的文档</td>
            </tr>
          )}
          {docs.map((d, i) => (
            <tr key={d.id}>
              <td>{i + 1}</td>
              <td>
                <div style={{ fontWeight: 500, color: 'var(--dae-ink)' }}>{d.title}</div>
                <div style={{ fontSize: 11, color: 'var(--dae-ink-subtle)', marginTop: 2 }}>
                  {d.keywords.slice(0, 4).join('、')}
                  {d.sourceName && <span style={{ marginLeft: 8 }}>📎 {d.sourceName}</span>}
                </div>
              </td>
              <td>{d.category}</td>
              <td>
                <SourceTag sourceType={d.sourceType} sourceName={d.sourceName} />
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Switch checked={d.status === 'published'} onChange={() => onToggleStatus(d)} />
                  <span style={{ fontSize: 12, color: d.status === 'published' ? '#16a34a' : '#64748b' }}>
                    {d.status === 'published' ? '已发布' : '已下线'}
                  </span>
                </div>
              </td>
              <td style={{ color: 'var(--dae-ink-muted)', fontSize: 12 }}>
                <div>{(d.chunks?.length || 0)} 个分块</div>
                <div>{d.charCount ?? '-'} 字符</div>
              </td>
              <td style={{ color: 'var(--dae-ink-muted)' }}>{d.updatedAt}</td>
              <td>
                <div style={{ display: 'flex', gap: 8 }}>
                  <IconBtn title="预览" onClick={() => onPreview(d)}><Eye size={14} /></IconBtn>
                  <IconBtn title="编辑" onClick={() => onEdit(d)}><Pencil size={14} /></IconBtn>
                  <IconBtn title="删除" danger onClick={() => onDelete(d)}><Trash2 size={14} /></IconBtn>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SourceTag({ sourceType, sourceName }: { sourceType: ManualDoc['sourceType']; sourceName?: string }) {
  if (sourceType === 'upload') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '2px 8px', borderRadius: 999, background: '#e0f2fe', color: '#0369a1' }}>
        <Upload size={12} /> 上传
      </span>
    );
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '2px 8px', borderRadius: 999, background: '#f1f5f9', color: '#64748b' }}>
      <Pencil size={12} /> 手动
    </span>
  );
}

function IconBtn({
  children,
  title,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 30,
        height: 30,
        borderRadius: 7,
        border: '1px solid var(--dae-border)',
        background: '#fff',
        color: danger ? 'var(--dae-error)' : 'var(--dae-ink-secondary)',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

const PRESETS: Record<ParamPreset, Partial<AssistantConfig>> = {
  precise: {
    temperature: 0.2,
    topP: 0.5,
    maxTokens: 1024,
    presencePenalty: 0.2,
    frequencyPenalty: 0.3,
    responseFormat: 'text',
  },
  balanced: {
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 2048,
    presencePenalty: 0,
    frequencyPenalty: 0,
    responseFormat: 'markdown',
  },
  creative: {
    temperature: 1.2,
    topP: 1,
    maxTokens: 4096,
    presencePenalty: 0.5,
    frequencyPenalty: 0.6,
    responseFormat: 'markdown',
  },
};

function ConfigTab({
  config,
  onChange,
  onSave,
  onReset,
}: {
  config: AssistantConfig;
  onChange: (c: AssistantConfig) => void;
  onSave: () => void;
  onReset: () => void;
}) {
  const set = <K extends keyof AssistantConfig>(key: K, value: AssistantConfig[K]) =>
    onChange({ ...config, [key]: value });

  const provider = MODEL_PROVIDERS.find((p) => p.id === config.modelProvider) || MODEL_PROVIDERS[0];

  const setProvider = (providerId: string) => {
    const p = MODEL_PROVIDERS.find((x) => x.id === providerId) || MODEL_PROVIDERS[0];
    onChange({ ...config, modelProvider: p.id, model: p.models[0] });
  };

  const applyPreset = (preset: ParamPreset) => {
    onChange({ ...config, ...PRESETS[preset] });
  };

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--dae-ink)' }}>助手参数配置</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onReset}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid var(--dae-border)', background: '#fff', borderRadius: 8, padding: '8px 12px', fontSize: 13, cursor: 'pointer', color: 'var(--dae-ink-secondary)' }}
          >
            <RotateCcw size={14} /> 恢复默认
          </button>
          <button
            onClick={onSave}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--dae-primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}
          >
            <Save size={14} /> 保存配置
          </button>
        </div>
      </div>

      {/* 基础信息 */}
      <SectionTitle>基础信息</SectionTitle>
      <Field label="助手名称">
        <input style={inputStyle} value={config.name} onChange={(e) => set('name', e.target.value)} />
      </Field>
      <Field label="助手头像">
        <AvatarUpload value={config.avatarUrl} onChange={(url) => set('avatarUrl', url)} />
      </Field>
      <Field label="启用助手">
        <Switch checked={config.enabled} onChange={(v) => set('enabled', v)} />
      </Field>
      <Field label="欢迎语">
        <textarea style={{ ...inputStyle, minHeight: 84 }} value={config.welcomeMessage} onChange={(e) => set('welcomeMessage', e.target.value)} />
      </Field>
      <Field label="角色设定 / System Prompt">
        <textarea style={{ ...inputStyle, minHeight: 100 }} value={config.systemPrompt} onChange={(e) => set('systemPrompt', e.target.value)} />
      </Field>

      {/* 模型设置 */}
      <SectionTitle>模型设置</SectionTitle>
      <Field label="模型供应商">
        <select style={inputStyle} value={config.modelProvider} onChange={(e) => setProvider(e.target.value)}>
          {MODEL_PROVIDERS.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </Field>
      <Field label="模型">
        <select style={inputStyle} value={config.model} onChange={(e) => set('model', e.target.value)}>
          {provider.models.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </Field>

      {/* 参数预设 */}
      <SectionTitle>参数预设</SectionTitle>
      <Field label="快捷模板">
        <div style={{ display: 'flex', gap: 10 }}>
          <PresetButton active={false} onClick={() => applyPreset('precise')}>精确模式</PresetButton>
          <PresetButton active={false} onClick={() => applyPreset('balanced')}>平衡模式</PresetButton>
          <PresetButton active={false} onClick={() => applyPreset('creative')}>创意模式</PresetButton>
        </div>
        <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)', marginTop: 6 }}>
          一键切换 Temperature / Top P / 最大 Token / 惩罚系数 / 响应格式组合。
        </div>
      </Field>

      {/* 模型调用参数 */}
      <SectionTitle>模型调用参数</SectionTitle>
      <RangeField
        label="生成随机性 (Temperature)"
        value={config.temperature}
        min={0}
        max={2}
        step={0.1}
        onChange={(v) => set('temperature', v)}
        hint="值越低回答越严谨确定，值越高越有创意和多样性"
      />
      <RangeField
        label="Top P（累计概率）"
        value={config.topP}
        min={0}
        max={1}
        step={0.05}
        onChange={(v) => set('topP', v)}
        hint="控制候选词范围；通常保持 0.9 即可"
      />
      <Field label="最大回复长度 (Max Tokens)">
        <input
          type="number"
          min={256}
          max={8192}
          step={256}
          style={{ ...inputStyle, width: 120 }}
          value={config.maxTokens}
          onChange={(e) => set('maxTokens', Math.max(256, Number(e.target.value) || 256))}
        />
        <span style={{ fontSize: 12, color: 'var(--dae-ink-muted)', marginLeft: 10 }}>限制单次回复最大 Token 数，控制响应长度与成本</span>
      </Field>
      <Field label="上下文轮数">
        <input
          type="number"
          min={0}
          max={30}
          style={{ ...inputStyle, width: 100 }}
          value={config.contextRound}
          onChange={(e) => set('contextRound', Math.max(0, Number(e.target.value) || 0))}
        />
        <span style={{ fontSize: 12, color: 'var(--dae-ink-muted)', marginLeft: 10 }}>多轮对话时携带的历史问答轮数</span>
      </Field>
      <Field label="响应格式">
        <div style={{ display: 'flex', gap: 10, paddingTop: 6 }}>
          {(['text', 'markdown', 'json'] as const).map((fmt) => (
            <label key={fmt} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--dae-ink-secondary)', cursor: 'pointer' }}>
              <input
                type="radio"
                name="responseFormat"
                checked={config.responseFormat === fmt}
                onChange={() => set('responseFormat', fmt)}
              />
              {fmt === 'text' && '纯文本'}
              {fmt === 'markdown' && 'Markdown'}
              {fmt === 'json' && 'JSON'}
            </label>
          ))}
        </div>
      </Field>
      <RangeField
        label="重复主题惩罚 (Presence Penalty)"
        value={config.presencePenalty}
        min={0}
        max={2}
        step={0.1}
        onChange={(v) => set('presencePenalty', v)}
        hint="抑制模型重复讨论同一主题"
      />
      <RangeField
        label="重复语句惩罚 (Frequency Penalty)"
        value={config.frequencyPenalty}
        min={0}
        max={2}
        step={0.1}
        onChange={(v) => set('frequencyPenalty', v)}
        hint="降低高频词重复出现的概率"
      />

      {/* 回复设置 */}
      <SectionTitle>回复设置</SectionTitle>
      <Field label="回复语言">
        <input style={inputStyle} value={config.responseLanguage} onChange={(e) => set('responseLanguage', e.target.value)} />
      </Field>
      <Field label="无匹配兜底回复">
        <textarea style={{ ...inputStyle, minHeight: 64 }} value={config.fallbackReply} onChange={(e) => set('fallbackReply', e.target.value)} />
      </Field>

      {/* 高级 */}
      <SectionTitle>高级</SectionTitle>
      <RangeField
        label={`知识库匹配阈值（当前 ${config.matchThreshold}）`}
        value={config.matchThreshold}
        min={0}
        max={5}
        step={1}
        onChange={(v) => set('matchThreshold', v)}
        hint="分数低于该值视为未命中，建议 1"
      />
      <Field label="最大召回文档数">
        <input
          type="number"
          min={1}
          max={6}
          style={{ ...inputStyle, width: 100 }}
          value={config.topK}
          onChange={(e) => set('topK', Math.max(1, Number(e.target.value) || 1))}
        />
      </Field>

      <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
        <button onClick={onSave} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--dae-primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, cursor: 'pointer' }}>
          <Save size={14} /> 保存配置
        </button>
        <button onClick={onReset} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid var(--dae-border)', background: '#fff', borderRadius: 8, padding: '9px 14px', fontSize: 13, cursor: 'pointer', color: 'var(--dae-ink-secondary)' }}>
          <RotateCcw size={14} /> 恢复默认
        </button>
      </div>
    </div>
  );
}

function LogsTab() {
  const [logs, setLogs] = useState<ConversationLog[]>(() => getConversationLogs());
  const [query, setQuery] = useState('');
  const [feedbackFilter, setFeedbackFilter] = useState<'all' | 'up' | 'down' | 'none'>('all');
  const [detail, setDetail] = useState<ConversationLog | null>(null);

  const refresh = () => setLogs(getConversationLogs());

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const matchesFeedback =
        feedbackFilter === 'all' ? true : feedbackFilter === 'none' ? log.feedback === null : log.feedback === feedbackFilter;
      if (!query.trim()) return matchesFeedback;
      const q = query.toLowerCase();
      const text = `${log.question} ${log.answerText} ${log.userName || ''}`.toLowerCase();
      return matchesFeedback && text.includes(q);
    });
  }, [logs, query, feedbackFilter]);

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--dae-ink)' }}>对话记录（{filtered.length}）</div>
      </div>

      {/* 筛选 */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--dae-ink-muted)' }} />
          <input
            style={{ ...inputStyle, paddingLeft: 30 }}
            placeholder="搜索问题 / 回答 / 用户"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select style={{ ...inputStyle, width: 140 }} value={feedbackFilter} onChange={(e) => setFeedbackFilter(e.target.value as typeof feedbackFilter)}>
          <option value="all">全部反馈</option>
          <option value="up">点赞</option>
          <option value="down">点踩</option>
          <option value="none">未反馈</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 50, color: 'var(--dae-ink-muted)', fontSize: 13 }}>
          暂无对话记录
        </div>
      ) : (
        <div style={{ border: '1px solid var(--dae-border)', borderRadius: 'var(--dae-radius-lg)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--dae-ink)', borderBottom: '1px solid var(--dae-border)', width: 120 }}>时间</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--dae-ink)', borderBottom: '1px solid var(--dae-border)' }}>用户问题</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--dae-ink)', borderBottom: '1px solid var(--dae-border)', width: 90 }}>命中</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--dae-ink)', borderBottom: '1px solid var(--dae-border)', width: 90 }}>得分</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--dae-ink)', borderBottom: '1px solid var(--dae-border)', width: 80 }}>反馈</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--dae-ink)', borderBottom: '1px solid var(--dae-border)', width: 70 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--dae-border)' }}>
                  <td style={{ padding: '10px 12px', color: 'var(--dae-ink-secondary)' }}>{formatDate(log.createdAt)}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 500, color: 'var(--dae-ink)', marginBottom: 4 }}>{log.question}</div>
                    <div style={{ color: 'var(--dae-ink-muted)', fontSize: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{log.answerText}</div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 999, background: log.hit ? '#dcfce7' : '#f1f5f9', color: log.hit ? '#16a34a' : '#64748b' }}>
                      {log.hit ? '已命中' : '未命中'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--dae-ink-secondary)' }}>{log.matchScore.toFixed(1)}</td>
                  <td style={{ padding: '10px 12px' }}>
                    {log.feedback === 'up' && <ThumbsUp size={16} style={{ color: '#16a34a' }} />}
                    {log.feedback === 'down' && <ThumbsDown size={16} style={{ color: '#ef4444' }} />}
                    {log.feedback === null && <span style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>-</span>}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <button
                      onClick={() => setDetail(log)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, border: 'none', background: 'transparent', color: 'var(--dae-primary)', cursor: 'pointer', fontSize: 13 }}
                    >
                      <Eye size={14} /> 详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && <LogDetailDrawer log={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

function LogDetailDrawer({ log, onClose }: { log: ConversationLog; onClose: () => void }) {
  return (
    <Drawer title="对话详情" onClose={onClose} width={560}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 13 }}>
        <InfoBlock label="提问时间" value={new Date(log.createdAt).toLocaleString('zh-CN')} />
        <InfoBlock label="用户" value={log.userName || log.userId || '匿名用户'} />
        <InfoBlock label="响应耗时" value={`${log.responseTimeMs} ms`} />
        <InfoBlock label="是否命中" value={log.hit ? `已命中（得分 ${log.matchScore.toFixed(1)}）` : '未命中'} />

        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 6 }}>用户问题</div>
          <div style={{ padding: 10, background: '#f8fafc', borderRadius: 8, color: 'var(--dae-ink-secondary)', lineHeight: 1.6 }}>{log.question}</div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 6 }}>助手回答</div>
          <div style={{ padding: 10, background: '#f8fafc', borderRadius: 8, color: 'var(--dae-ink-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{log.answerText}</div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 6 }}>召回文档</div>
          {log.retrievedDocs.length === 0 ? (
            <div style={{ color: 'var(--dae-ink-muted)', fontSize: 12 }}>无召回文档</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {log.retrievedDocs.map((d) => (
                <div key={d.docId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#fff', border: '1px solid var(--dae-border)', borderRadius: 8 }}>
                  <span style={{ color: 'var(--dae-ink-secondary)' }}>{d.title}</span>
                  <span style={{ fontSize: 12, color: 'var(--dae-primary)', fontWeight: 500 }}>{d.score.toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 6 }}>模型调用参数</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <ParamItem label="供应商" value={log.modelParams.provider} />
            <ParamItem label="模型" value={log.modelParams.model} />
            <ParamItem label="Temperature" value={String(log.modelParams.temperature)} />
            <ParamItem label="Top P" value={String(log.modelParams.topP)} />
            <ParamItem label="Max Tokens" value={String(log.modelParams.maxTokens)} />
            <ParamItem label="上下文轮数" value={String(log.modelParams.contextRound)} />
            <ParamItem label="响应格式" value={log.modelParams.responseFormat} />
            <ParamItem label="惩罚系数" value={`P=${log.modelParams.presencePenalty} / F=${log.modelParams.frequencyPenalty}`} />
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 6 }}>用户反馈</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {log.feedback === 'up' && <><ThumbsUp size={16} style={{ color: '#16a34a' }} /><span style={{ color: '#16a34a' }}>有帮助</span></>}
            {log.feedback === 'down' && <><ThumbsDown size={16} style={{ color: '#ef4444' }} /><span style={{ color: '#ef4444' }}>没帮助</span></>}
            {log.feedback === null && <span style={{ color: 'var(--dae-ink-muted)' }}>未反馈</span>}
          </div>
          {log.feedbackReason && (
            <div style={{ marginTop: 6, padding: 8, background: '#fef2f2', borderRadius: 6, color: '#991b1b', fontSize: 12 }}>{log.feedbackReason}</div>
          )}
        </div>
      </div>
    </Drawer>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
      <span style={{ fontSize: 12, color: 'var(--dae-ink-muted)', width: 70, flexShrink: 0 }}>{label}</span>
      <span style={{ color: 'var(--dae-ink-secondary)' }}>{value}</span>
    </div>
  );
}

function ParamItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: 6 }}>
      <div style={{ fontSize: 11, color: 'var(--dae-ink-muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ color: 'var(--dae-ink-secondary)', fontWeight: 500 }}>{value}</div>
    </div>
  );
}

function PresetButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 16px',
        borderRadius: 8,
        border: `1px solid ${active ? 'var(--dae-primary)' : 'var(--dae-border)'}`,
        background: active ? 'var(--dae-primary-light)' : '#fff',
        color: active ? 'var(--dae-primary)' : 'var(--dae-ink-secondary)',
        fontSize: 13,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <Field label={`${label}：${value}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ width: 240 }}
        />
        {hint && <span style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>{hint}</span>}
      </div>
    </Field>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '9px 12px',
  border: '1px solid var(--dae-border)',
  borderRadius: 8,
  fontSize: 13,
  outline: 'none',
  fontFamily: 'inherit',
};

function PageHeaderAvatar({ config }: { config: AssistantConfig }) {
  if (config.avatarUrl) {
    return (
      <img
        src={config.avatarUrl}
        alt=""
        style={{ width: 38, height: 38, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        background: 'linear-gradient(135deg,#1677FF,#0ea5e9)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        flexShrink: 0,
      }}
    >
      🤖
    </div>
  );
}

function AvatarUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      window.alert('请上传图片文件（jpg / png / gif / webp）');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange(String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {value ? (
        <div style={{ position: 'relative' }}>
          <img
            src={value}
            alt=""
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              objectFit: 'cover',
              border: '1px solid var(--dae-border)',
            }}
          />
          <button
            onClick={() => onChange('')}
            title="删除头像"
            style={{
              position: 'absolute',
              top: -6,
              right: -6,
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: 'none',
              background: '#ef4444',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            ×
          </button>
        </div>
      ) : null}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        style={{
          width: 64,
          height: 64,
          borderRadius: 12,
          border: `1px dashed ${dragOver ? 'var(--dae-primary)' : 'var(--dae-border)'}`,
          background: dragOver ? 'var(--dae-primary-light)' : '#fafafa',
          color: 'var(--dae-ink-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          cursor: 'pointer',
          fontSize: 12,
        }}
      >
        <Upload size={18} />
        <span>{value ? '替换头像' : '上传头像'}</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          if (e.target) e.target.value = '';
        }}
      />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dae-ink)', margin: '18px 0 10px', paddingBottom: 6, borderBottom: '1px dashed var(--dae-border)' }}>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 12 }}>
      <div style={{ width: 200, flexShrink: 0, fontSize: 13, color: 'var(--dae-ink-secondary)', paddingTop: 9 }}>{label}</div>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 999,
        border: 'none',
        cursor: 'pointer',
        background: checked ? 'var(--dae-primary)' : 'var(--dae-border-strong)',
        position: 'relative',
        transition: 'background 0.15s ease',
        marginTop: 6,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: checked ? 22 : 2,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.15s ease',
        }}
      />
    </button>
  );
}

/* ============================ 右侧抽屉 ============================ */

function Drawer({
  title,
  width = 880,
  onClose,
  children,
  footer,
}: {
  title: string;
  width?: number;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setShown(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.35)',
          zIndex: 100003,
          opacity: shown ? 1 : 0,
          transition: 'opacity 0.25s ease',
        }}
      />
      <div
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          height: '100vh',
          width,
          maxWidth: '96vw',
          background: '#fff',
          boxShadow: '-8px 0 30px rgba(15,23,42,0.15)',
          transform: shown ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.22,1,0.36,1)',
          zIndex: 100004,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--dae-border)' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--dae-ink)' }}>{title}</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--dae-ink-muted)', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>
        <div className="dae-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 20 }}>{children}</div>
        {footer && (
          <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '12px 20px', borderTop: '1px solid var(--dae-border)', background: '#fff' }}>
            {footer}
          </div>
        )}
      </div>
    </>
  );
}

/* ============================ 文档上传（右侧抽屉） ============================ */

function DocUploader({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (d: ManualDoc) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [category, setCategory] = useState<AssistantDocCategory>('入门引导');
  const [strategy, setStrategy] = useState<ChunkStrategy>({ ...DEFAULT_CHUNK_STRATEGY });
  const [chunks, setChunks] = useState<DocChunk[]>([]);
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!content) {
      setChunks([]);
      return;
    }
    setProcessing(true);
    const timer = window.setTimeout(() => {
      setChunks(splitContentIntoChunks(content, strategy));
      setProcessing(false);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [content, strategy]);

  const handleFile = async (f: File) => {
    if (!SUPPORTED_MIME_TYPES.includes(f.type) && !f.name.match(/\.(txt|md|markdown|csv|html|htm)$/i)) {
      window.alert('暂不支持的文件格式，请上传 PDF、Word、TXT、Markdown、CSV、Excel、HTML 等文本类文件。');
      return;
    }
    setFile(f);
    setProcessing(true);
    try {
      const text = await readFileAsText(f);
      setContent(text);
      setChunks(splitContentIntoChunks(text, strategy));
      setProcessing(false);
    } catch (e) {
      setProcessing(false);
      window.alert('文件读取失败，请重试');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleSave = () => {
    if (!file || !content.trim()) {
      window.alert('请先上传文档');
      return;
    }
    const stats = countDocumentStats(content);
    const doc: ManualDoc = {
      ...EMPTY_DOC,
      title: titleFromFileName(file.name),
      category,
      sourceType: 'upload',
      sourceName: file.name,
      content,
      chunks,
      chunkStrategy: strategy,
      charCount: stats.charCount,
      wordCount: stats.wordCount,
      keywords: extractKeywords(titleFromFileName(file.name), [content]),
      status: 'draft',
    };
    onSave(doc);
  };

  return (
    <Drawer title="上传文档到知识库" width={940} onClose={onClose} footer={
      <>
        <button onClick={onClose} style={{ border: '1px solid var(--dae-border)', background: '#fff', borderRadius: 8, padding: '9px 16px', fontSize: 13, cursor: 'pointer', color: 'var(--dae-ink-secondary)' }}>取消</button>
        <button
          onClick={handleSave}
          disabled={!file || processing}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: !file || processing ? '#cbd5e1' : 'var(--dae-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '9px 18px',
            fontSize: 13,
            cursor: !file || processing ? 'not-allowed' : 'pointer',
          }}
        >
          <Save size={14} /> 保存为草稿
        </button>
      </>
    }>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, minHeight: 420 }}>
        {/* 左侧：上传区 + 预览 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!file ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => inputRef.current?.click()}
              style={{
                border: `2px dashed ${dragActive ? 'var(--dae-primary)' : 'var(--dae-border)'}`,
                borderRadius: 12,
                padding: 36,
                textAlign: 'center',
                cursor: 'pointer',
                background: dragActive ? 'var(--dae-primary-light)' : '#fafafa',
                transition: 'all 0.15s ease',
              }}
            >
              <Upload size={36} style={{ color: 'var(--dae-primary)', marginBottom: 12 }} />
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dae-ink)' }}>点击或拖拽文件到此处上传</div>
              <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)', marginTop: 6 }}>
                支持 PDF、Word、TXT、Markdown、CSV、Excel、HTML
              </div>
              <input
                ref={inputRef}
                type="file"
                accept={SUPPORTED_FILE_TYPES}
                style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  border: '1px solid var(--dae-border)',
                  borderRadius: 10,
                  background: '#f8fafc',
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 8, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1677FF' }}>
                  <FileText size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--dae-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--dae-ink-muted)', marginTop: 2 }}>
                    {(file.size / 1024).toFixed(1)} KB · {chunks.length} 个分块 · {countDocumentStats(content).charCount} 字符
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setContent('');
                    setChunks([]);
                  }}
                  style={{ border: 'none', background: 'transparent', color: 'var(--dae-ink-muted)', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--dae-ink)' }}>原始内容预览（可编辑）</div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                  flex: 1,
                  minHeight: 320,
                  border: '1px solid var(--dae-border)',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 12.5,
                  lineHeight: 1.6,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none',
                }}
              />
              <div style={{ fontSize: 11, color: 'var(--dae-ink-muted)' }}>编辑内容后，右侧分块会实时重新生成。</div>
            </div>
          )}
        </div>

        {/* 右侧：配置 + 分块预览（加大） */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderLeft: '1px solid var(--dae-border)', paddingLeft: 20 }}>
          <Labeled label="分类">
            <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value as AssistantDocCategory)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Labeled>

          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dae-ink)' }}>切分策略</div>
          <Labeled label="切分模式">
            <div style={{ display: 'flex', gap: 8 }}>
              <SegmentModeButton active={strategy.mode === 'auto'} onClick={() => setStrategy({ ...strategy, mode: 'auto' })}>自动分段</SegmentModeButton>
              <SegmentModeButton active={strategy.mode === 'custom'} onClick={() => setStrategy({ ...strategy, mode: 'custom' })}>自定义</SegmentModeButton>
            </div>
          </Labeled>
          {strategy.mode === 'custom' && (
            <>
              <Labeled label="分隔符（如 \\n\\n、###）">
                <input style={inputStyle} value={strategy.separator} onChange={(e) => setStrategy({ ...strategy, separator: e.target.value })} />
              </Labeled>
              <Labeled label="最大分段长度（字符）">
                <input type="number" min={100} max={3000} style={inputStyle} value={strategy.chunkSize} onChange={(e) => setStrategy({ ...strategy, chunkSize: Math.max(100, Number(e.target.value) || 800) })} />
              </Labeled>
              <Labeled label="重叠长度（字符）">
                <input type="number" min={0} max={500} style={inputStyle} value={strategy.chunkOverlap} onChange={(e) => setStrategy({ ...strategy, chunkOverlap: Math.max(0, Number(e.target.value) || 0) })} />
              </Labeled>
            </>
          )}
          <Labeled label="保留标题层级">
            <Switch checked={strategy.preserveTitle} onChange={(v) => setStrategy({ ...strategy, preserveTitle: v })} />
          </Labeled>

          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dae-ink)', marginTop: 4 }}>分块预览（{chunks.length}）</div>
          <div className="dae-scroll" style={{ flex: 1, minHeight: 360, maxHeight: 'none', overflowY: 'auto', border: '1px solid var(--dae-border)', borderRadius: 8, padding: 10, background: '#f8fafc' }}>
            {processing ? (
              <div style={{ textAlign: 'center', color: 'var(--dae-ink-muted)', fontSize: 12, padding: 20 }}>处理中…</div>
            ) : chunks.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--dae-ink-muted)', fontSize: 12, padding: 20 }}>上传文档后预览分块</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {chunks.map((chunk, idx) => (
                  <div key={chunk.id} style={{ padding: 10, borderRadius: 6, background: '#fff', border: '1px solid var(--dae-border)', fontSize: 12, color: 'var(--dae-ink-secondary)', lineHeight: 1.6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 4, background: '#dbeafe', color: '#1677FF' }}>#{idx + 1}</span>
                      <span style={{ color: 'var(--dae-ink-muted)' }}>{chunk.content.length} 字符</span>
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{chunk.content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
}

function SegmentModeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '7px 0',
        borderRadius: 6,
        border: `1px solid ${active ? 'var(--dae-primary)' : 'var(--dae-border)'}`,
        background: active ? 'var(--dae-primary-light)' : '#fff',
        color: active ? 'var(--dae-primary)' : 'var(--dae-ink-secondary)',
        fontSize: 12.5,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/* ============================ 文档编辑器（右侧抽屉） ============================ */

function DocEditor({
  doc,
  onClose,
  onSave,
}: {
  doc: ManualDoc;
  onClose: () => void;
  onSave: (d: ManualDoc) => void;
}) {
  const isUpload = doc.sourceType === 'upload';
  const [draft, setDraft] = useState<ManualDoc>(doc);
  const [strategy, setStrategy] = useState<ChunkStrategy>(doc.chunkStrategy || DEFAULT_CHUNK_STRATEGY);
  const [chunks, setChunks] = useState<DocChunk[]>(doc.chunks || []);
  const [processing, setProcessing] = useState(false);
  const [imgTarget, setImgTarget] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof ManualDoc>(key: K, value: ManualDoc[K]) =>
    setDraft((p) => ({ ...p, [key]: value }));

  // 上传文档：编辑原始内容时实时重新切分
  useEffect(() => {
    if (!isUpload || !draft.content) return;
    setProcessing(true);
    const timer = window.setTimeout(() => {
      const newChunks = splitContentIntoChunks(draft.content || '', strategy);
      setChunks(newChunks);
      const stats = countDocumentStats(draft.content || '');
      setDraft((p) => ({ ...p, charCount: stats.charCount, wordCount: stats.wordCount }));
      setProcessing(false);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [draft.content, strategy, isUpload]);

  const updateStep = (i: number, val: string) =>
    setDraft((p) => ({ ...p, steps: p.steps.map((s, idx) => (idx === i ? val : s)) }));
  const addStep = () => setDraft((p) => ({ ...p, steps: [...p.steps, ''] }));
  const removeStep = (i: number) =>
    setDraft((p) => {
      const steps = p.steps.filter((_, idx) => idx !== i);
      const raw = p.stepImages || {};
      const reindexed: Record<number, string> = {};
      Object.entries(raw).forEach(([k, v]) => {
        const n = Number(k);
        if (n === i) return;
        reindexed[n > i ? n - 1 : n] = v;
      });
      return { ...p, steps: steps.length ? steps : [''], stepImages: reindexed };
    });
  const setStepImage = (i: number, dataUrl: string) =>
    setDraft((p) => ({ ...p, stepImages: { ...(p.stepImages || {}), [i]: dataUrl } }));
  const removeImage = (i: number) =>
    setDraft((p) => {
      const next = { ...(p.stepImages || {}) };
      delete next[i];
      return { ...p, stepImages: next };
    });

  const onPickImage = (i: number) => {
    setImgTarget(i);
    fileInputRef.current?.click();
  };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || imgTarget === null) return;
    if (file.size > 1024 * 1024) {
      window.alert('图片较大（>1MB），预览可正常显示，但保存后可能超出本地存储上限，建议压缩后再插入。');
    }
    const reader = new FileReader();
    reader.onload = () => setStepImage(imgTarget, String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const liveKeywords = extractKeywords(draft.title, draft.steps);

  const handleSave = () => {
    if (!draft.title.trim()) {
      window.alert('请填写标题');
      return;
    }
    onSave({
      ...draft,
      chunks: isUpload ? chunks : draft.chunks,
      chunkStrategy: isUpload ? strategy : draft.chunkStrategy,
      keywords: isUpload ? (draft.keywords.length ? draft.keywords : extractKeywords(draft.title, draft.steps)) : liveKeywords,
      stepImages: draft.stepImages || {},
    });
  };

  return (
    <Drawer
      title={draft.id ? '编辑文档' : '新建文档'}
      width={isUpload ? 940 : 760}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} style={{ border: '1px solid var(--dae-border)', background: '#fff', borderRadius: 8, padding: '9px 16px', fontSize: 13, cursor: 'pointer', color: 'var(--dae-ink-secondary)' }}>取消</button>
          <button
            onClick={handleSave}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--dae-primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, cursor: 'pointer' }}
          >
            <Save size={14} /> 保存
          </button>
        </>
      }
    >
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />

      <div style={{ display: 'grid', gridTemplateColumns: isUpload ? '1fr 380px' : '1fr', gap: 20 }}>
        {/* 主区 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Labeled label="标题">
              <input style={inputStyle} value={draft.title} onChange={(e) => set('title', e.target.value)} />
            </Labeled>
            <Labeled label="分类">
              <select style={inputStyle} value={draft.category} onChange={(e) => set('category', e.target.value as AssistantDocCategory)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Labeled>
          </div>

          {isUpload ? (
            <Labeled label="原始内容（可编辑，编辑后自动重新切分）">
              <textarea
                value={draft.content || ''}
                onChange={(e) => set('content', e.target.value)}
                style={{ ...inputStyle, minHeight: 320, resize: 'vertical', fontSize: 12.5, lineHeight: 1.6 }}
              />
            </Labeled>
          ) : (
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dae-ink)' }}>操作步骤（支持插入图片，操作路径将自动识别）</div>
              {draft.steps.map((step, i) => (
                <div key={i} style={{ border: '1px solid var(--dae-border)', borderRadius: 8, padding: 10, background: '#f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--dae-primary)', color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>第 {i + 1} 步</span>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => onPickImage(i)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, border: '1px solid var(--dae-border)', background: '#fff', borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer', color: 'var(--dae-ink-secondary)' }}
                      >
                        <ImageIcon size={13} /> 插入图片
                      </button>
                      <button
                        onClick={() => removeStep(i)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, border: '1px solid var(--dae-border)', background: '#fff', borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer', color: 'var(--dae-error)' }}
                      >
                        <Trash2 size={13} /> 删除
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={step}
                    onChange={(e) => updateStep(i, e.target.value)}
                    rows={2}
                    placeholder="描述这一步要做的事，例如：进入「数据分析 → 仪表盘」"
                    style={{ ...inputStyle, minHeight: 44, resize: 'vertical', fontSize: 13, lineHeight: 1.6 }}
                  />
                  {(draft.stepImages?.[i]) && (
                    <div style={{ position: 'relative', display: 'inline-block', marginTop: 8 }}>
                      <img src={draft.stepImages[i]} alt="步骤图片" style={{ maxWidth: 260, maxHeight: 180, borderRadius: 6, border: '1px solid var(--dae-border)', display: 'block' }} />
                      <button
                        onClick={() => removeImage(i)}
                        style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: '50%', background: '#fff', border: '1px solid var(--dae-border)', boxShadow: '0 2px 6px rgba(0,0,0,0.12)', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={addStep}
                style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px dashed var(--dae-primary)', background: 'var(--dae-primary-light)', color: 'var(--dae-primary)', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}
              >
                <Plus size={14} /> 添加步骤
              </button>

              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dae-ink)', marginTop: 4 }}>自动提取（无需填写）</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {liveKeywords.length === 0 ? (
                  <span style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>填写标题与步骤后自动生成关键词</span>
                ) : (
                  liveKeywords.map((k) => (
                    <span key={k} style={{ fontSize: 12, padding: '3px 9px', borderRadius: 999, background: '#f1f5f9', color: '#475569', border: '1px solid var(--dae-border)' }}>{k}</span>
                  ))
                )}
              </div>
              <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)' }}>
                操作路径（自动识别）：{extractPathFromStepsLocal(draft.steps) || '—'}
              </div>
            </>
          )}
        </div>

        {/* 上传文档：切分策略 + 分块预览（加大） */}
        {isUpload && (
          <div style={{ borderLeft: '1px solid var(--dae-border)', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dae-ink)' }}>切分策略</div>
            <Labeled label="切分模式">
              <div style={{ display: 'flex', gap: 8 }}>
                <SegmentModeButton active={strategy.mode === 'auto'} onClick={() => setStrategy({ ...strategy, mode: 'auto' })}>自动分段</SegmentModeButton>
                <SegmentModeButton active={strategy.mode === 'custom'} onClick={() => setStrategy({ ...strategy, mode: 'custom' })}>自定义</SegmentModeButton>
              </div>
            </Labeled>
            {strategy.mode === 'custom' && (
              <>
                <Labeled label="分隔符">
                  <input style={inputStyle} value={strategy.separator} onChange={(e) => setStrategy({ ...strategy, separator: e.target.value })} />
                </Labeled>
                <Labeled label="最大分段长度">
                  <input type="number" min={100} max={3000} style={inputStyle} value={strategy.chunkSize} onChange={(e) => setStrategy({ ...strategy, chunkSize: Math.max(100, Number(e.target.value) || 800) })} />
                </Labeled>
                <Labeled label="重叠长度">
                  <input type="number" min={0} max={500} style={inputStyle} value={strategy.chunkOverlap} onChange={(e) => setStrategy({ ...strategy, chunkOverlap: Math.max(0, Number(e.target.value) || 0) })} />
                </Labeled>
              </>
            )}
            <Labeled label="保留标题层级">
              <Switch checked={strategy.preserveTitle} onChange={(v) => setStrategy({ ...strategy, preserveTitle: v })} />
            </Labeled>

            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dae-ink)' }}>分块预览（{chunks.length}）</div>
            <div className="dae-scroll" style={{ flex: 1, minHeight: 360, maxHeight: 'none', overflowY: 'auto', border: '1px solid var(--dae-border)', borderRadius: 8, padding: 10, background: '#f8fafc' }}>
              {processing ? (
                <div style={{ textAlign: 'center', color: 'var(--dae-ink-muted)', fontSize: 12, padding: 20 }}>重新切分中…</div>
              ) : (
                chunks.map((chunk, idx) => (
                  <div key={chunk.id} style={{ padding: 10, borderRadius: 6, background: '#fff', border: '1px solid var(--dae-border)', fontSize: 12, color: 'var(--dae-ink-secondary)', lineHeight: 1.6, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 4, background: '#dbeafe', color: '#1677FF' }}>#{idx + 1}</span>
                      <span style={{ fontSize: 11, color: 'var(--dae-ink-muted)' }}>{chunk.content.length} 字符</span>
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{chunk.content}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}

/* ============================ 文档预览（右侧抽屉，加大） ============================ */

function DocViewer({ doc, onClose }: { doc: ManualDoc; onClose: () => void }) {
  const isUpload = doc.sourceType === 'upload';
  const stepItems = toStepItems(doc);
  const pathParts = (doc.path || '').split('→').map((p) => p.trim()).filter(Boolean);
  return (
    <Drawer title="文档预览" width={960} onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'var(--dae-primary-light)', color: 'var(--dae-primary)' }}>{doc.category}</span>
        <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--dae-ink)' }}>{doc.title}</span>
        <SourceTag sourceType={doc.sourceType} sourceName={doc.sourceName} />
        <span style={{ fontSize: 12, color: 'var(--dae-ink-subtle)', marginLeft: 'auto' }}>更新于 {doc.updatedAt}</span>
      </div>

      {/* 自动提取关键词 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {doc.keywords.map((k) => (
          <span key={k} style={{ fontSize: 12, padding: '3px 9px', borderRadius: 999, background: '#f1f5f9', color: '#475569', border: '1px solid var(--dae-border)' }}>{k}</span>
        ))}
      </div>

      {isUpload && doc.content ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, minHeight: 360 }}>
          {/* 原始内容 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dae-ink)' }}>原始内容</div>
            <div className="dae-scroll" style={{ flex: 1, minHeight: 480, maxHeight: '70vh', overflowY: 'auto', border: '1px solid var(--dae-border)', borderRadius: 8, padding: 14, background: '#f8fafc', fontSize: 13, lineHeight: 1.7, color: 'var(--dae-ink-secondary)', whiteSpace: 'pre-wrap' }}>
              {doc.content}
            </div>
            <div style={{ fontSize: 11, color: 'var(--dae-ink-muted)' }}>
              共 {doc.charCount} 字符 · {doc.wordCount} 字 · 切分策略：{doc.chunkStrategy?.mode === 'auto' ? '自动分段' : '自定义'}
            </div>
          </div>

          {/* 分块列表 */}
          <div style={{ borderLeft: '1px solid var(--dae-border)', paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dae-ink)' }}>分块列表（{doc.chunks?.length || 0}）</div>
            <div className="dae-scroll" style={{ flex: 1, minHeight: 480, maxHeight: '70vh', overflowY: 'auto' }}>
              {doc.chunks?.map((chunk, idx) => (
                <div key={chunk.id} style={{ padding: 10, borderRadius: 8, background: '#fff', border: '1px solid var(--dae-border)', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 4, background: '#dbeafe', color: '#1677FF' }}>Chunk #{idx + 1}</span>
                    <span style={{ fontSize: 11, color: 'var(--dae-ink-muted)' }}>{chunk.content.length} 字符</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--dae-ink-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{chunk.content}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 操作步骤（含图片） */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 8 }}>操作步骤</div>
            <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.8, color: 'var(--dae-ink-secondary)' }}>
              {stepItems.map((s, i) => (
                <li key={i} style={{ marginBottom: s.image ? 10 : 4 }}>
                  <div>{s.text}</div>
                  {s.image && (
                    <img
                      src={s.image}
                      alt="步骤示意图"
                      style={{ marginTop: 6, maxWidth: '100%', maxHeight: 320, borderRadius: 8, border: '1px solid var(--dae-border)', display: 'block' }}
                    />
                  )}
                </li>
              ))}
            </ol>
          </div>

          {/* 操作路径 */}
          {pathParts.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dae-ink)', marginBottom: 6 }}>操作路径</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
                {pathParts.map((p, i) => (
                  <React.Fragment key={i}>
                    <span style={{ fontSize: 12, padding: '3px 9px', borderRadius: 6, background: 'var(--dae-surface)', border: '1px solid var(--dae-border)', color: 'var(--dae-ink-secondary)' }}>{p}</span>
                    {i < pathParts.length - 1 && <span style={{ color: 'var(--dae-ink-subtle)' }}>›</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
        <button onClick={onClose} style={{ background: 'var(--dae-primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, cursor: 'pointer' }}>关闭</button>
      </div>
    </Drawer>
  );
}

/* ============================ 通用 ============================ */

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12.5, color: 'var(--dae-ink-secondary)', marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}
