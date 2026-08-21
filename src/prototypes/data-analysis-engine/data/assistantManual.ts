/**
 * AI 助手知识库与配置数据层
 * - ManualDoc：产品操作手册单篇文档（可被管理后台持续更新）
 * - AssistantConfig：助手参数配置（名称 / 欢迎语 / 角色设定 / 回复开关等）
 * 存储优先使用 localStorage，未写入时回退到种子数据，便于演示「持续更新」。
 *
 * 2026-08-19 重构：
 *  - 手动录入取消「摘要 / 操作路径 / 示意图说明 / 文档链接」配置项，最小化用户配置
 *  - 关键词改为保存时自动提取；操作路径由步骤内容自动识别
 *  - 操作步骤支持插入图片（stepImages：步骤序号 -> dataURL）
 */

export type AssistantDocCategory =
  | '入门引导'
  | '数据准备'
  | '数据分析'
  | '门户与权限'
  | '监控告警'
  | '系统管理';

/** 文档分片（Chunk） */
export interface DocChunk {
  id: string;
  /** 分片原始文本 */
  content: string;
  /** 分片标题（取首行，可选） */
  title?: string;
  /** 在原文中的起始位置 */
  startIndex?: number;
  /** 在原文中的结束位置 */
  endIndex?: number;
}

/** 渲染用步骤项（文本 + 可选图片） */
export interface StepItem {
  text: string;
  image?: string;
}

/** 文档切分策略 */
export interface ChunkStrategy {
  /** 切分模式 */
  mode: 'auto' | 'custom';
  /** 分段标识符（仅在 custom 下生效，如 \n\n、###、第X条） */
  separator: string;
  /** 每个 chunk 最大字符数 */
  chunkSize: number;
  /** 相邻 chunk 重叠字符数 */
  chunkOverlap: number;
  /** 是否保留标题层级作为语义锚点 */
  preserveTitle: boolean;
}

export const DEFAULT_CHUNK_STRATEGY: ChunkStrategy = {
  mode: 'auto',
  separator: '\\n\\n',
  chunkSize: 800,
  chunkOverlap: 100,
  preserveTitle: true,
};

export interface ManualDoc {
  id: string;
  title: string;
  category: AssistantDocCategory;
  /** 检索关键词（保存时自动提取，命中加权最高） */
  keywords: string[];
  /** 明确操作步骤（纯文本，图片单独存于 stepImages） */
  steps: string[];
  /** 每步插入的图片，key=步骤序号，value=dataURL */
  stepImages?: Record<number, string>;
  updatedAt: string;
  status: 'published' | 'draft';

  /** 文档来源类型：manual=后台手动录入；upload=上传本地文档 */
  sourceType: 'manual' | 'upload';
  /** 原始文件名（upload 时展示） */
  sourceName?: string;
  /** 文档原始文本/Markdown 内容（upload 时用于预览、编辑、重新切分） */
  content?: string;
  /** 文档切分后的片段列表 */
  chunks?: DocChunk[];
  /** 切分策略 */
  chunkStrategy?: ChunkStrategy;
  /** 字符数统计 */
  charCount?: number;
  /** 字数统计（近似） */
  wordCount?: number;
  /** 自动识别的操作路径（手动录入时由步骤内容识别，无需配置） */
  path?: string;
}

export interface AssistantConfig {
  /** 是否启用助手（停用后点击按钮提示已停用） */
  enabled: boolean;
  name: string;
  /** 头像图片 URL / dataURL，为空时回退显示默认机器人 */
  avatarUrl: string;
  welcomeMessage: string;
  /** 角色设定 / system prompt */
  systemPrompt: string;
  /** 无匹配时的兜底回复 */
  fallbackReply: string;
  responseLanguage: string;
  /** 知识库匹配阈值 0~1，低于此分视为未命中 */
  matchThreshold: number;
  /** 最大召回文档数 */
  topK: number;

  /* ---------- 模型调用参数（参考 Coze / Dify） ---------- */
  /** 模型供应商标识 */
  modelProvider: string;
  /** 模型名称 */
  model: string;
  /** 生成随机性 temperature（0~2） */
  temperature: number;
  /** 累计概率 top_p（0~1） */
  topP: number;
  /** 单次回复最大 token 数 */
  maxTokens: number;
  /** 携带上下文轮数 */
  contextRound: number;
  /** 响应格式：text / markdown / json */
  responseFormat: 'text' | 'markdown' | 'json';
  /** 重复主题惩罚 presence_penalty（≥0） */
  presencePenalty: number;
  /** 重复语句惩罚 frequency_penalty（≥0） */
  frequencyPenalty: number;
}

/** 参数预设模板 */
export type ParamPreset = 'precise' | 'balanced' | 'creative';

export interface ModelProvider {
  id: string;
  name: string;
  models: string[];
}

/* ---------- 对话记录与反馈（用于管理员评估回答质量） ---------- */

export interface LogRetrievedDoc {
  docId: string;
  title: string;
  /** 检索得分 */
  score: number;
  /** 文档状态 */
  status: 'published' | 'draft';
}

export interface LogAnswerSnapshot {
  docId?: string;
  title?: string;
  category?: string;
  summary: string;
  steps: string[];
  path: string;
}

export interface LogModelParams {
  provider: string;
  model: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  contextRound: number;
  responseFormat: string;
  presencePenalty: number;
  frequencyPenalty: number;
}

export type LogFeedback = 'up' | 'down' | null;

export interface ConversationLog {
  id: string;
  /** 所属会话 */
  sessionId: string;
  /** 提问用户 */
  userId?: string;
  userName?: string;
  /** 用户问题 */
  question: string;
  /** 助手最终展示的文本 */
  answerText: string;
  /** 命中的答案快照 */
  answerSnapshot?: LogAnswerSnapshot;
  /** 召回的文档及得分 */
  retrievedDocs: LogRetrievedDoc[];
  /** 最佳匹配得分 */
  matchScore: number;
  /** 是否命中知识库 */
  hit: boolean;
  /** 当前模型调用参数快照 */
  modelParams: LogModelParams;
  /** 用户反馈：点赞 / 点踩 */
  feedback: LogFeedback;
  /** 反馈原因 */
  feedbackReason?: string;
  /** 管理员/用户修正后的标准答案 */
  correctedAnswer?: string;
  /** 响应耗时 ms */
  responseTimeMs: number;
  /** 记录时间 */
  createdAt: number;
}

const MANUAL_KEY = 'dae-assistant-manual';
const CONFIG_KEY = 'dae-assistant-config';
const LOGS_KEY = 'dae-assistant-logs';

/* ---------- 内置示例对话记录（用于演示评估，长期保留） ---------- */

export const SEED_LOGS: ConversationLog[] = [
  {
    id: 'seed-good-001',
    sessionId: 'seed-session-a',
    userId: 'zhangsan',
    userName: '张三',
    question: '如何创建数据集？',
    answerText:
      '你可以按以下步骤创建数据集：\n1. 进入「数据分析引擎 → 数据准备 → 数据集」。\n2. 点击「新建数据集」，选择所属数据源。\n3. 勾选需要的物理表/视图，配置关联与字段映射。\n4. 设置数据集名称与所属目录，点击「保存」。',
    answerSnapshot: {
      docId: 'dataset',
      title: '创建数据集',
      category: '数据准备',
      summary: '在数据准备模块新建数据集并配置关联与字段映射。',
      steps: [
        '进入「数据分析引擎 → 数据准备 → 数据集」。',
        '点击「新建数据集」，选择所属数据源。',
        '勾选需要的物理表/视图，配置关联与字段映射。',
        '设置数据集名称与所属目录，点击「保存」。',
      ],
      path: '数据分析引擎 → 数据准备 → 数据集',
    },
    retrievedDocs: [
      { docId: 'dataset', title: '创建数据集', score: 4.5, status: 'published' },
      { docId: 'self-service', title: '创建自助取数任务', score: 2.1, status: 'published' },
    ],
    matchScore: 4.5,
    hit: true,
    modelParams: {
      provider: 'doubao',
      model: 'Doubao-pro-32k',
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 1024,
      contextRound: 3,
      responseFormat: 'markdown',
      presencePenalty: 0,
      frequencyPenalty: 0,
    },
    feedback: 'up',
    responseTimeMs: 680,
    createdAt: new Date('2026-08-18T09:23:00+08:00').getTime(),
  },
  {
    id: 'seed-good-002',
    sessionId: 'seed-session-b',
    userId: 'lisi',
    userName: '李四',
    question: '怎么给同事授权查看报表？',
    answerText:
      '给同事授权查看报表可通过「分享资产给他人」实现：\n1. 在数据门户打开目标报表，点击右上角「分享」。\n2. 选择要共享的成员与权限级别。\n3. 填写分享说明，点击「发送」。\n4. 对方在「我的申请」中查看，审核人通过后生效。',
    answerSnapshot: {
      docId: 'share',
      title: '分享资产给他人',
      category: '门户与权限',
      summary: '在数据门户将资产分享给指定成员并走审核流程。',
      steps: [
        '在数据门户打开目标资产，点击右上角「分享」。',
        '选择要共享的成员（可多选）与权限级别。',
        '填写分享说明，点击「发送」。',
        '对方在「我的申请」中看到该记录，审核人于「权限审核」通过后生效。',
      ],
      path: '数据门户 → 资产详情 → 分享',
    },
    retrievedDocs: [
      { docId: 'share', title: '分享资产给他人', score: 4.8, status: 'published' },
      { docId: 'permission-apply', title: '申请数据查看权限', score: 2.5, status: 'published' },
    ],
    matchScore: 4.8,
    hit: true,
    modelParams: {
      provider: 'deepseek',
      model: 'DeepSeek-V3',
      temperature: 0.6,
      topP: 0.85,
      maxTokens: 1024,
      contextRound: 3,
      responseFormat: 'markdown',
      presencePenalty: 0.2,
      frequencyPenalty: 0.1,
    },
    feedback: 'up',
    responseTimeMs: 720,
    createdAt: new Date('2026-08-18T10:45:00+08:00').getTime(),
  },
  {
    id: 'seed-good-003',
    sessionId: 'seed-session-c',
    userId: 'wangwu',
    userName: '王五',
    question: '数据大屏上线后在哪里看？',
    answerText:
      '数据大屏上线后会在「数据门户」中展示。\n1. 进入「数据分析引擎 → 数据门户」。\n2. 在左侧目录选择「数据大屏」分类。\n3. 点击已上线的数据大屏名称即可查看。',
    answerSnapshot: {
      docId: 'screen',
      title: '制作数据大屏',
      category: '数据分析',
      summary: '数据大屏保存后打开上线开关，门户即可访问。',
      steps: [
        '进入「数据分析引擎 → 数据分析 → 数据大屏」。',
        '点击「新建大屏」，选择模板或空白画布。',
        '拖入图表、地图、轮播等组件并适配分辨率。',
        '保存后打开「上线」开关，门户即可访问该大屏。',
      ],
      path: '数据分析引擎 → 数据分析 → 数据大屏',
    },
    retrievedDocs: [
      { docId: 'screen', title: '制作数据大屏', score: 4.2, status: 'published' },
      { docId: 'portal', title: '使用数据门户', score: 3.8, status: 'published' },
    ],
    matchScore: 4.2,
    hit: true,
    modelParams: {
      provider: 'moonshot',
      model: 'Moonshot-v1-32k',
      temperature: 0.5,
      topP: 0.8,
      maxTokens: 1024,
      contextRound: 3,
      responseFormat: 'markdown',
      presencePenalty: 0,
      frequencyPenalty: 0,
    },
    feedback: null,
    responseTimeMs: 590,
    createdAt: new Date('2026-08-18T14:12:00+08:00').getTime(),
  },
  {
    id: 'seed-bad-001',
    sessionId: 'seed-session-d',
    userId: 'zhaoliu',
    userName: '赵六',
    question: '怎么报销差旅费？',
    answerText:
      '抱歉，我在当前操作手册中没有找到完全匹配的内容。你可以试试换一种说法，或联系管理员在「AI 助手管理 → 知识库」中补充相关文档。',
    answerSnapshot: {
      summary: '未命中知识库，返回兜底回复。',
      steps: ['返回兜底回复'],
      path: '—',
    },
    retrievedDocs: [],
    matchScore: 0,
    hit: false,
    modelParams: {
      provider: 'doubao',
      model: 'Doubao-pro-32k',
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 1024,
      contextRound: 3,
      responseFormat: 'markdown',
      presencePenalty: 0,
      frequencyPenalty: 0,
    },
    feedback: 'down',
    feedbackReason: '完全未命中，产品是数据分析平台，不含报销流程，应明确告知用户不在服务范围。',
    responseTimeMs: 340,
    createdAt: new Date('2026-08-18T11:05:00+08:00').getTime(),
  },
  {
    id: 'seed-bad-002',
    sessionId: 'seed-session-e',
    userId: 'qianqi',
    userName: '钱七',
    question: '数据大屏可以分享给外部用户吗？',
    answerText:
      '你可以将数据大屏分享给他人：\n1. 在数据门户打开目标大屏，点击右上角「分享」。\n2. 选择要共享的成员与权限级别。\n3. 填写分享说明，点击「发送」。',
    answerSnapshot: {
      docId: 'share',
      title: '分享资产给他人',
      category: '门户与权限',
      summary: '在数据门户将资产分享给指定成员并走审核流程。',
      steps: [
        '在数据门户打开目标资产，点击右上角「分享」。',
        '选择要共享的成员（可多选）与权限级别。',
        '填写分享说明，点击「发送」。',
      ],
      path: '数据门户 → 资产详情 → 分享',
    },
    retrievedDocs: [
      { docId: 'share', title: '分享资产给他人', score: 1.2, status: 'published' },
      { docId: 'screen', title: '制作数据大屏', score: 0.8, status: 'published' },
    ],
    matchScore: 1.2,
    hit: true,
    modelParams: {
      provider: 'deepseek',
      model: 'DeepSeek-V3',
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 1024,
      contextRound: 3,
      responseFormat: 'markdown',
      presencePenalty: 0,
      frequencyPenalty: 0,
    },
    feedback: 'down',
    feedbackReason: '回答只说了内部分享，没有说明是否支持外部用户；应补充外部用户分享策略或明确限制。',
    responseTimeMs: 610,
    createdAt: new Date('2026-08-18T15:38:00+08:00').getTime(),
  },
  {
    id: 'seed-bad-003',
    sessionId: 'seed-session-f',
    userId: 'sunba',
    userName: '孙八',
    question: '系统支持接入哪些数据库？',
    answerText:
      '你可以按以下步骤创建图表：\n1. 进入「数据分析引擎 → 数据分析 → 图表管理」。\n2. 点击「新建图表」，选择数据集与图表类型。\n3. 拖拽字段到维度/度量区，配置颜色、标签与筛选。',
    answerSnapshot: {
      docId: 'chart',
      title: '创建图表',
      category: '数据分析',
      summary: '在图表管理中选择数据集与图表类型创建图表。',
      steps: [
        '进入「数据分析引擎 → 数据分析 → 图表管理」。',
        '点击「新建图表」，选择数据集与图表类型（柱状/折线/饼图等）。',
        '拖拽字段到维度/度量区，配置颜色、标签与筛选。',
        '点击「保存」；如需对外提供，在图表列表打开「上线」开关。',
      ],
      path: '数据分析引擎 → 数据分析 → 图表管理',
    },
    retrievedDocs: [
      { docId: 'chart', title: '创建图表', score: 2.1, status: 'published' },
      { docId: 'datasource', title: '连接 MySQL 数据源', score: 1.5, status: 'published' },
    ],
    matchScore: 2.1,
    hit: true,
    modelParams: {
      provider: 'moonshot',
      model: 'Moonshot-v1-32k',
      temperature: 1.0,
      topP: 0.95,
      maxTokens: 1024,
      contextRound: 3,
      responseFormat: 'markdown',
      presencePenalty: 0,
      frequencyPenalty: 0,
    },
    feedback: 'down',
    feedbackReason: '答非所问，用户问的是支持哪些数据库，却返回了创建图表的步骤；应整理数据源支持清单。',
    correctedAnswer:
      '目前系统支持 MySQL、PostgreSQL、ClickHouse、SQL Server、Oracle 等关系型数据库，以及通过 JDBC/ODBC 扩展的其他数据源。',
    responseTimeMs: 560,
    createdAt: new Date('2026-08-18T16:50:00+08:00').getTime(),
  },
];

/* ============================ Chunk 切分工具 ============================ */

/**
 * 将原始文本按策略切分为 chunk 列表。
 * 原型阶段在前端完成，便于管理后台实时预览与编辑。
 */
export function splitContentIntoChunks(
  content: string,
  strategy: ChunkStrategy = DEFAULT_CHUNK_STRATEGY,
): DocChunk[] {
  if (!content.trim()) return [];

  const { mode, separator, chunkSize, chunkOverlap, preserveTitle } = strategy;
  const normalizedSep = separator.replace(/\\n/g, '\n');

  // 1. 自动模式：优先按结构（标题/段落）切分，超大块再按字数二次切分
  if (mode === 'auto') {
    const structuralBlocks = splitByStructure(content, preserveTitle);
    const chunks: DocChunk[] = [];
    structuralBlocks.forEach((block, idx) => {
      if (block.text.length <= chunkSize) {
        chunks.push(createChunk(block.text, block.start, block.end, idx));
      } else {
        // 大块按字数二次切分
        const sub = splitByFixedLength(block.text, chunkSize, chunkOverlap);
        sub.forEach((s, sIdx) => {
          const start = block.start + s.start;
          const end = block.start + s.end;
          chunks.push(createChunk(s.text, start, end, `${idx}-${sIdx}`));
        });
      }
    });
    return reindexChunks(chunks);
  }

  // 2. 自定义模式：优先按 separator 切分，若切分结果仍超过 chunkSize 则二次切分
  const parts = content.split(normalizedSep).filter((p) => p.trim());
  const chunks: DocChunk[] = [];
  let cursor = 0;
  parts.forEach((part, idx) => {
    const start = content.indexOf(part, cursor);
    const end = start + part.length;
    cursor = end;
    if (part.length <= chunkSize) {
      chunks.push(createChunk(part, start, end, idx));
    } else {
      const sub = splitByFixedLength(part, chunkSize, chunkOverlap);
      sub.forEach((s, sIdx) => {
        chunks.push(createChunk(s.text, start + s.start, start + s.end, `${idx}-${sIdx}`));
      });
    }
  });
  return reindexChunks(chunks);
}

function splitByStructure(content: string, preserveTitle: boolean): { text: string; start: number; end: number }[] {
  // 按 markdown 标题、空行、编号段落等语义边界切分
  const headingPattern = preserveTitle
    ? /^(#{1,3}\s+|\d+[\.\、]\s*\S|^第[一二三四五六七八九十百千零\d]+[章节条]|^（[一二三四五六七八九十]）|^\([\d一二三四五六七八九十]+\))/m
    : /^\n\s*\n/;

  const blocks: { text: string; start: number; end: number }[] = [];
  let cursor = 0;

  // 先按双换行分段
  const paragraphs = content.split(/\n\s*\n/);
  for (const para of paragraphs) {
    const start = content.indexOf(para, cursor);
    const end = start + para.length;
    cursor = end;
    blocks.push({ text: para.trim(), start, end });
  }

  // 若保留标题，尝试把相邻短段落合并到同一个小标题下
  if (preserveTitle) {
    const merged: { text: string; start: number; end: number }[] = [];
    let current: { text: string; start: number; end: number } | null = null;
    blocks.forEach((b) => {
      const isHeading = headingPattern.test(b.text);
      if (isHeading || !current) {
        if (current) merged.push(current);
        current = { ...b };
      } else {
        current.text += '\n\n' + b.text;
        current.end = b.end;
      }
    });
    if (current) merged.push(current);
    return merged.filter((m) => m.text.trim());
  }

  return blocks.filter((b) => b.text.trim());
}

function splitByFixedLength(
  text: string,
  chunkSize: number,
  overlap: number,
): { text: string; start: number; end: number }[] {
  const result: { text: string; start: number; end: number }[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    result.push({ text: text.slice(start, end), start, end });
    if (end === text.length) break;
    start = Math.max(end - overlap, start + 1);
  }
  return result;
}

function createChunk(text: string, start: number, end: number, idSeed: string | number): DocChunk {
  return {
    id: `c-${typeof idSeed === 'number' ? idSeed : idSeed.replace(/[^a-z0-9-]/gi, '')}-${start}`,
    content: text.trim(),
    startIndex: start,
    endIndex: end,
  };
}

function reindexChunks(chunks: DocChunk[]): DocChunk[] {
  return chunks
    .filter((c) => c.content.trim())
    .map((c, i) => ({ ...c, id: `c-${i}` }));
}

/** 统计字符数与中文字数 */
export function countDocumentStats(content: string): { charCount: number; wordCount: number } {
  const charCount = content.length;
  // 中文字符 + 英文单词近似数
  const cnCount = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
  const enWords = (content.match(/[a-zA-Z0-9_]+/g) || []).length;
  return { charCount, wordCount: cnCount + enWords };
}

/* ============================ 自动提取工具 ============================ */

/**
 * 从标题 + 步骤内容中自动提取检索关键词（取词频前 6）。
 * 手动录入不再要求用户手工填写关键词。
 */
export function extractKeywords(title: string, steps: string[]): string[] {
  const raw = `${title} ${steps.join(' ')}`.toLowerCase();
  const words: Record<string, number> = {};
  const cn = raw.match(/[一-龥]{2,5}/g) || [];
  const en = raw.match(/[a-z]{3,}/g) || [];
  [...cn, ...en].forEach((w) => {
    words[w] = (words[w] || 0) + 1;
  });
  return Object.entries(words)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([w]) => w);
}

/**
 * 从操作步骤文本中自动识别操作路径。
 * 优先识别「A → B → C」式引用；其次识别「进入/打开 X」等导航动作。
 */
export function extractPathFromSteps(steps: string[]): string {
  const text = steps.join('\n');
  const quoted = text.match(/[「『]([^」』]*[→\-—>][^」』]*)[」』]/);
  if (quoted) return quoted[1].trim();
  const nav = text.match(/(?:进入|打开|切换到|前往|返回)\s*[「『]?([^「『」』\n，。、]{2,20})[」』]?/);
  if (nav) return nav[1].trim();
  return '';
}

/** 将 ManualDoc 的步骤转为渲染用的 StepItem[]（文本 + 对应图片） */
export function toStepItems(doc: ManualDoc): StepItem[] {
  return (doc.steps || []).map((text, i) => ({
    text,
    image: doc.stepImages?.[i],
  }));
}

/** 根据文件名生成默认文档标题 */
export function titleFromFileName(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '').slice(0, 50);
}

/* ============================ 种子操作手册 ============================ */

export const SEED_MANUAL: ManualDoc[] = [
  {
    id: 'login',
    title: '登录系统与账号密码',
    category: '入门引导',
    keywords: ['登录', '账号', '密码', '登入', '进入系统', '退出'],
    steps: [
      '打开系统入口，进入「登录」页。',
      '在账号输入框填写 zhangsan（或 zhangsan@company.com）。',
      '在密码输入框填写 123456。',
      '点击「登录」按钮，登录成功后自动进入「个人工作台」。',
      '如需退出，点击右上角头像 →「退出登录」。',
    ],
    path: '系统入口 → 登录',
    updatedAt: '2026-08-15',
    status: 'published',
    sourceType: 'manual',
  },
  {
    id: 'workbench',
    title: '个人工作台概览',
    category: '入门引导',
    keywords: ['工作台', '个人工作台', '收藏', '最近浏览', '订阅', '我的申请', '下载'],
    steps: [
      '登录后默认进入「个人工作台」。',
      '「我的收藏」：在门户/资产上点星标后归集于此，点击可直接跳转。',
      '「我的订阅」：查看已订阅资产，支持「下载最新数据」。',
      '「最近浏览」：系统自动记录你最近打开过的资产。',
      '「我的申请」：查看你提交的权限/分享申请及审核状态。',
    ],
    path: '数据分析引擎 → 个人工作台',
    updatedAt: '2026-08-16',
    status: 'published',
    sourceType: 'manual',
  },
  {
    id: 'datasource',
    title: '连接 MySQL 数据源',
    category: '数据准备',
    keywords: ['数据源', '连接', 'mysql', '数据库', '接入'],
    steps: [
      '进入「数据分析引擎 → 数据准备 → 数据源」。',
      '点击「新建数据源」，类型选择 MySQL。',
      '填写连接名、主机地址、端口（默认 3306）、数据库名、账号与密码。',
      '点击「测试连接」确认可达，通过后点击「保存」。',
      '保存后在数据源列表即可看到该连接，供后续建数据集使用。',
    ],
    path: '数据分析引擎 → 数据准备 → 数据源',
    updatedAt: '2026-08-12',
    status: 'published',
    sourceType: 'manual',
  },
  {
    id: 'dataset',
    title: '创建数据集',
    category: '数据准备',
    keywords: ['数据集', '建数据集', '建模', '表', '字段'],
    steps: [
      '进入「数据分析引擎 → 数据准备 → 数据集」。',
      '点击「新建数据集」，选择所属数据源。',
      '勾选需要的物理表/视图，配置关联与字段映射。',
      '设置数据集名称与所属目录，点击「保存」。',
      '保存后在数据集列表可发起「自助取数」或用于后续分析。',
    ],
    path: '数据分析引擎 → 数据准备 → 数据集',
    updatedAt: '2026-08-12',
    status: 'published',
    sourceType: 'manual',
  },
  {
    id: 'self-service',
    title: '创建自助取数任务',
    category: '数据准备',
    keywords: ['自助取数', '取数', '导出', '查询', 'sql'],
    steps: [
      '进入「数据分析引擎 → 数据准备 → 自助取数」。',
      '点击「新建任务」，选择数据集并配置筛选/分组字段。',
      '设置输出字段与排序，预览结果是否符合预期。',
      '保存任务并「运行」，运行完成后可下载结果文件。',
    ],
    path: '数据分析引擎 → 数据准备 → 自助取数',
    updatedAt: '2026-08-12',
    status: 'published',
    sourceType: 'manual',
  },
  {
    id: 'explore',
    title: '数据探查',
    category: '数据分析',
    keywords: ['数据探查', '探查', '预览', '分布', '画像'],
    steps: [
      '进入「数据分析引擎 → 数据分析 → 数据探查」。',
      '选择目标数据集，系统自动生成字段概览。',
      '点击字段查看分布图、极值与空值比例。',
      '可将探查结论一键转为图表或加入数据集。',
    ],
    path: '数据分析引擎 → 数据分析 → 数据探查',
    updatedAt: '2026-08-12',
    status: 'published',
    sourceType: 'manual',
  },
  {
    id: 'chart',
    title: '创建图表',
    category: '数据分析',
    keywords: ['图表', '可视化', '柱状图', '折线图', '饼图', '新建图表'],
    steps: [
      '进入「数据分析引擎 → 数据分析 → 图表管理」。',
      '点击「新建图表」，选择数据集与图表类型（柱状/折线/饼图等）。',
      '拖拽字段到维度/度量区，配置颜色、标签与筛选。',
      '点击「保存」；如需对外提供，在图表列表打开「上线」开关。',
    ],
    path: '数据分析引擎 → 数据分析 → 图表管理',
    updatedAt: '2026-08-13',
    status: 'published',
    sourceType: 'manual',
  },
  {
    id: 'report',
    title: '制作报表',
    category: '数据分析',
    keywords: ['报表', '表格', '明细', '统计表', '新建报表'],
    steps: [
      '进入「数据分析引擎 → 数据分析 → 报表」。',
      '点击「新建报表」，选择数据集并添加报表区块。',
      '配置列、分组、合计与样式。',
      '保存后在报表列表可「预览」；对外提供需打开「上线」开关。',
    ],
    path: '数据分析引擎 → 数据分析 → 报表',
    updatedAt: '2026-08-13',
    status: 'published',
    sourceType: 'manual',
  },
  {
    id: 'dashboard',
    title: '搭建仪表盘',
    category: '数据分析',
    keywords: ['仪表盘', '看板', 'dashboard', '指标卡', '新建仪表盘'],
    steps: [
      '进入「数据分析引擎 → 数据分析 → 仪表盘」。',
      '点击「新建仪表盘」，进入画布编辑。',
      '从右侧组件库拖入图表/指标卡/筛选器并布局。',
      '保存后在仪表盘列表打开「上线」开关即可在门户访问。',
    ],
    path: '数据分析引擎 → 数据分析 → 仪表盘',
    updatedAt: '2026-08-13',
    status: 'published',
    sourceType: 'manual',
  },
  {
    id: 'screen',
    title: '制作数据大屏',
    category: '数据分析',
    keywords: ['数据大屏', '大屏', 'screen', '可视化大屏', '指挥中心'],
    steps: [
      '进入「数据分析引擎 → 数据分析 → 数据大屏」。',
      '点击「新建大屏」，选择模板或空白画布。',
      '拖入图表、地图、轮播等组件并适配分辨率。',
      '保存后打开「上线」开关，门户即可访问该大屏。',
    ],
    path: '数据分析引擎 → 数据分析 → 数据大屏',
    updatedAt: '2026-08-13',
    status: 'published',
    sourceType: 'manual',
  },
  {
    id: 'publish',
    title: '上线 / 发布资产',
    category: '数据分析',
    keywords: ['上线', '发布', '公开', '可见', '门户可见', '开关'],
    steps: [
      '进入对应管理页（图表管理 / 报表 / 仪表盘 / 数据大屏）。',
      '在资产列表中找到目标资产，点击「上线」开关。',
      '开关变绿即表示已上线，状态徽标显示「已上线」。',
      '仅「已上线」的资产会展示在数据门户对应分类下。',
      '如需下线，再次点击开关即可（状态变为「已下线」）。',
    ],
    path: '数据分析引擎 → 数据分析 → （对应管理页）',
    updatedAt: '2026-08-14',
    status: 'published',
    sourceType: 'manual',
  },
  {
    id: 'portal',
    title: '使用数据门户',
    category: '门户与权限',
    keywords: ['数据门户', '门户', '查看', '资产', '看数据', '目录'],
    steps: [
      '进入「数据分析引擎 → 数据门户」。',
      '在左侧目录选择资产分类（图表/报表/仪表盘/数据大屏）。',
      '点击资产名称，右侧展示内容与操作区（收藏/订阅/分享/申请）。',
      '带锁图标的资产表示你暂无查看权限，内容会被模糊化。',
      '有「已上线」徽标的资产才对有权限的用户可见。',
    ],
    path: '数据分析引擎 → 数据门户',
    updatedAt: '2026-08-16',
    status: 'published',
    sourceType: 'manual',
  },
  {
    id: 'permission-apply',
    title: '申请数据查看权限',
    category: '门户与权限',
    keywords: ['申请', '权限', '申请权限', '无权限', '看不了', '看不到', '没权限', '审批'],
    steps: [
      '在数据门户打开一个带锁（无权限）的资产。',
      '右侧内容区已模糊，点击「申请查看权限」。',
      '在弹窗中选择所需权限（查看/管理），填写申请理由，提交。',
      '提交后状态变为「审核中」，按钮隐藏，等待审核。',
      '审核人进入「流程审批 → 权限审核」通过，门户即时生效，模糊解除。',
    ],
    path: '数据门户 → 资产详情 → 申请查看权限',
    updatedAt: '2026-08-17',
    status: 'published',
    sourceType: 'manual',
  },
  {
    id: 'share',
    title: '分享资产给他人',
    category: '门户与权限',
    keywords: ['分享', '共享', '发给', '协作', 'share'],
    steps: [
      '在数据门户打开目标资产，点击右上角「分享」。',
      '选择要共享的成员（可多选）与权限级别。',
      '填写分享说明，点击「发送」。',
      '对方在「我的申请」中看到该记录，审核人于「权限审核」通过后生效。',
    ],
    path: '数据门户 → 资产详情 → 分享',
    updatedAt: '2026-08-17',
    status: 'published',
    sourceType: 'manual',
  },
  {
    id: 'subscribe',
    title: '订阅数据资产',
    category: '门户与权限',
    keywords: ['订阅', '订阅数据', '定时', '推送', '关注'],
    steps: [
      '在数据门户打开目标资产，点击「订阅」。',
      '选择订阅周期与接收方式，提交订阅申请。',
      '审核人于「流程审批 → 任务审核」通过后生效。',
      '进入「个人工作台 → 我的订阅」，可查看订阅内容并「下载最新数据」。',
    ],
    path: '数据门户 → 资产详情 → 订阅',
    updatedAt: '2026-08-16',
    status: 'published',
    sourceType: 'manual',
  },
  {
    id: 'my-applications',
    title: '查看我的申请记录',
    category: '门户与权限',
    keywords: ['我的申请', '申请记录', '审核状态', '进度'],
    steps: [
      '进入「数据分析引擎 → 个人工作台」。',
      '切换到「我的申请」标签页。',
      '列表展示资产名、类型、权限、状态（审核中/已通过/已驳回）、申请时间与理由。',
      '已通过的申请对应的资产，在门户中将不再显示申请入口。',
    ],
    path: '数据分析引擎 → 个人工作台 → 我的申请',
    updatedAt: '2026-08-17',
    status: 'published',
    sourceType: 'manual',
  },
  {
    id: 'metrics-task',
    title: '创建指标监控任务',
    category: '监控告警',
    keywords: ['指标监控', '监控任务', '监控', '阈值', '指标'],
    steps: [
      '进入「数据分析引擎 → 监控告警 → 监控任务」。',
      '点击「新建任务」，选择监控对象（图表/指标）与统计口径。',
      '设置触发条件（如大于/小于某阈值）与监控频率。',
      '保存并启用任务，系统按频率检测并在命中时推送预警。',
    ],
    path: '数据分析引擎 → 监控告警 → 监控任务',
    updatedAt: '2026-08-14',
    status: 'published',
    sourceType: 'manual',
  },
  {
    id: 'alerts',
    title: '预警记录与推送',
    category: '监控告警',
    keywords: ['预警', '告警', '推送', '通知', '提醒'],
    steps: [
      '进入「数据分析引擎 → 监控告警 → 预警记录」查看历史预警。',
      '进入「推送规则」配置通知渠道（如站内信/邮件）与接收人。',
      '命中条件的预警会按规则推送，可在「预警记录」查看详情与处理状态。',
    ],
    path: '数据分析引擎 → 监控告警 → 预警记录 / 推送规则',
    updatedAt: '2026-08-14',
    status: 'published',
    sourceType: 'manual',
  },
  {
    id: 'operation-log',
    title: '操作日志溯源',
    category: '系统管理',
    keywords: ['操作日志', '日志', '溯源', '审计', '记录'],
    steps: [
      '进入「数据分析引擎 → 系统管理 → 操作日志」。',
      '按时间、模块、操作人、动作类型筛选。',
      '支持按资产定位（从门户/资产跳转时带入 assetId）。',
      '点击「关联资产」可跳回数据门户查看对应资产。',
    ],
    path: '数据分析引擎 → 系统管理 → 操作日志',
    updatedAt: '2026-08-17',
    status: 'published',
    sourceType: 'manual',
  },
  {
    id: 'user-role',
    title: '用户与角色管理',
    category: '系统管理',
    keywords: ['用户管理', '角色', '权限分配', '新增用户', '角色管理'],
    steps: [
      '进入「数据分析引擎 → 系统管理 → 用户管理」新增/停用用户并分配角色。',
      '进入「数据分析引擎 → 系统管理 → 角色管理」配置角色的资源权限（查看/管理）。',
      '资源权限会决定数据门户中资产是否可见（无权限将模糊处理）。',
    ],
    path: '数据分析引擎 → 系统管理 → 用户管理 / 角色管理',
    updatedAt: '2026-08-15',
    status: 'published',
    sourceType: 'manual',
  },
  {
    id: 'tenant',
    title: '租户管理',
    category: '系统管理',
    keywords: ['租户', '租户管理', '空间', '隔离', '多租户'],
    steps: [
      '以超级管理员进入「数据分析引擎 → 系统管理 → 租户管理」。',
      '新建/编辑租户空间，配置状态与归属。',
      '普通用户登录后只能切换并访问自己所属的租户空间。',
    ],
    path: '数据分析引擎 → 系统管理 → 租户管理',
    updatedAt: '2026-08-15',
    status: 'published',
    sourceType: 'manual',
  },
  {
    id: 'assistant-help',
    title: 'AI 智能助手使用说明',
    category: '入门引导',
    keywords: ['ai', '助手', '智能助手', '帮助', '提问', '机器人'],
    steps: [
      '点击右下角可拖拽的「AI 助手」悬浮按钮。',
      '面板从右侧滑出，在输入框描述你的问题（如「怎么申请数据权限？」）。',
      '助手会检索操作手册，返回操作步骤与操作路径。',
      '点击回答中的「查看完整文档」可在管理后台打开原文。',
    ],
    path: '全局悬浮按钮 → AI 助手',
    updatedAt: '2026-08-18',
    status: 'published',
    sourceType: 'manual',
  },
];

/* ============================ 种子配置 ============================ */

export const SEED_CONFIG: AssistantConfig = {
  enabled: true,
  name: '数据助手',
  avatarUrl: '',
  welcomeMessage:
    '你好，我是数据分析引擎的智能助手 🤖\n可以帮你解答功能使用问题、查询操作手册。\n试试问我：如何申请数据查看权限？怎样把图表上线？',
  systemPrompt:
    '你是数据分析引擎产品的智能使用助手，负责帮助用户解决功能使用问题。回答必须基于产品操作手册，给出明确可操作的操作步骤、操作路径。语气专业、友好、简洁。',
  fallbackReply:
    '抱歉，我在当前操作手册中没有找到完全匹配的内容。你可以试试换一种说法，或联系管理员在「AI 助手管理 → 知识库」中补充相关文档。',
  responseLanguage: '中文',
  matchThreshold: 1,
  topK: 3,

  // 模型调用参数：默认使用豆包 / 平衡模式
  modelProvider: 'doubao',
  model: 'Doubao-pro-32k',
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 2048,
  contextRound: 10,
  responseFormat: 'markdown',
  presencePenalty: 0,
  frequencyPenalty: 0,
};

export const MODEL_PROVIDERS: ModelProvider[] = [
  { id: 'doubao', name: '豆包', models: ['Doubao-pro-32k', 'Doubao-lite-32k', 'Doubao-vision'] },
  { id: 'deepseek', name: 'DeepSeek', models: ['DeepSeek-V3', 'DeepSeek-R1'] },
  { id: 'moonshot', name: 'Moonshot', models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'] },
  { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'] },
  { id: 'anthropic', name: 'Anthropic', models: ['claude-3-5-sonnet', 'claude-3-opus'] },
];

/* ============================ 存储 helper ============================ */

export function getManualDocs(): ManualDoc[] {
  if (typeof window === 'undefined') return SEED_MANUAL;
  try {
    const raw = localStorage.getItem(MANUAL_KEY);
    if (raw) return JSON.parse(raw) as ManualDoc[];
  } catch {
    /* ignore */
  }
  return SEED_MANUAL;
}

export function saveManualDocs(docs: ManualDoc[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MANUAL_KEY, JSON.stringify(docs));
  }
}

export function getAssistantConfig(): AssistantConfig {
  if (typeof window === 'undefined') return SEED_CONFIG;
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return { ...SEED_CONFIG, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return SEED_CONFIG;
}

export function saveAssistantConfig(cfg: AssistantConfig): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
  }
}

/* ============================ 对话记录 helper ============================ */

export function getConversationLogs(): ConversationLog[] {
  // 内置示例记录长期保留，与用户真实记录合并展示（按时间倒序）
  const seedMap = new Map(SEED_LOGS.map((l) => [l.id, l]));
  let stored: ConversationLog[] = [];
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ConversationLog[];
        stored = Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      stored = [];
    }
  }
  // 用户记录优先（同名 ID 覆盖种子），再按时间倒序
  stored.forEach((l) => seedMap.set(l.id, l));
  return Array.from(seedMap.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export function saveConversationLogs(logs: ConversationLog[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  }
}

export function appendConversationLog(log: ConversationLog): void {
  if (typeof window === 'undefined') return;
  const logs = getConversationLogs();
  logs.unshift(log);
  // 原型阶段限制最大记录数，避免 localStorage 膨胀
  saveConversationLogs(logs.slice(0, 500));
}

export function updateConversationLog(logId: string, patch: Partial<ConversationLog>): ConversationLog | null {
  if (typeof window === 'undefined') return null;
  const logs = getConversationLogs();
  const idx = logs.findIndex((l) => l.id === logId);
  if (idx === -1) return null;
  const updated = { ...logs[idx], ...patch };
  logs[idx] = updated;
  saveConversationLogs(logs);
  return updated;
}

export function clearConversationLogs(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOGS_KEY);
  }
}
