/**
 * AI 助手检索与答案生成
 * 原型阶段不调用真实大模型，采用「关键词 + 同义词」召回操作手册，
 * 再构建结构化答案（摘要 / 步骤 / 路径 / 示意图 / 文档链接）。
 * 2026-08-19 更新：同时支持基于 chunk 的上传文档检索。
 */

import type {
  AssistantConfig,
  DocChunk,
  ManualDoc,
  StepItem,
} from '../../data/assistantManual';
import { extractPathFromSteps, toStepItems } from '../../data/assistantManual';

/** 同义词扩展，提升口语化问题的召回率 */
const SYNONYMS: Record<string, string[]> = {
  登录: ['账号', '密码', '登入', '进入系统', '退出'],
  看不了: ['权限', '申请', '无权限', '看不到', '没权限'],
  看不到: ['权限', '申请', '无权限', '看不了', '没权限'],
  没权限: ['权限', '申请', '无权限', '看不了', '看不到'],
  申请: ['权限', '审批', '查看权限', '申请权限'],
  上线: ['发布', '公开', '可见', '门户可见', '开关'],
  发布: ['上线', '公开'],
  图表: ['可视化', '柱状图', '折线图', '饼图'],
  报表: ['表格', '明细', '统计表'],
  仪表盘: ['看板', 'dashboard', '指标卡'],
  大屏: ['数据大屏', 'screen', '可视化大屏', '指挥中心'],
  门户: ['数据门户', '查看', '资产'],
  订阅: ['定时', '推送', '关注'],
  分享: ['共享', '协作'],
  监控: ['指标', '阈值', '告警'],
  预警: ['告警', '推送', '通知'],
  日志: ['溯源', '审计', '记录'],
  用户: ['角色', '权限分配'],
  租户: ['空间', '隔离', '多租户'],
  助手: ['ai', '智能助手', '帮助', '机器人', '提问'],
};

export interface ScoredDoc {
  doc: ManualDoc;
  score: number;
  matchedChunk?: DocChunk;
}

export interface RetrieveResult {
  matched: ScoredDoc[];
  bestScore: number;
}

/** 将查询拆分为候选词，并展开同义词 */
function expandTerms(query: string): string[] {
  const raw = query
    .toLowerCase()
    .split(/[\s,，。、？?！!；;：:·\-_]+/u)
    .filter((t) => t.length > 0);
  const terms = new Set<string>(raw);
  raw.forEach((t) => {
    Object.entries(SYNONYMS).forEach(([key, subs]) => {
      if (t.includes(key) || key.includes(t)) {
        subs.forEach((s) => terms.add(s.toLowerCase()));
      }
    });
  });
  return Array.from(terms);
}

function scoreText(query: string, terms: string[], text: string, titleWeight = 0): number {
  let score = 0;
  const q = query.toLowerCase();
  const haystack = text.toLowerCase();
  if (haystack.includes(q)) score += 3 + titleWeight;
  terms.forEach((t) => {
    if (t && haystack.includes(t)) score += 1;
  });
  return score;
}

export function retrieveDocs(
  query: string,
  docs: ManualDoc[],
  topK = 3,
): RetrieveResult {
  const terms = expandTerms(query);
  const q = query.toLowerCase();

  const scored: ScoredDoc[] = docs.map((doc) => {
    let score = 0;
    const title = doc.title.toLowerCase();

    // 关键词命中（加权最高）
    doc.keywords.forEach((k) => {
      const kl = k.toLowerCase();
      if (q.includes(kl)) score += 4;
      if (terms.some((t) => t && kl.includes(t))) score += 1;
    });

    // 标题直接命中
    if (q.includes(title)) score += 3;
    if (title.includes(q)) score += 3;

    // 通用结构化字段命中
    const haystack = [
      doc.title,
      doc.category,
      ...doc.keywords,
      ...doc.steps,
      doc.path,
    ]
      .join(' ')
      .toLowerCase();
    terms.forEach((t) => {
      if (t && haystack.includes(t)) score += 1;
    });

    // 上传文档：在 chunks 中检索最佳片段
    let matchedChunk: DocChunk | undefined;
    if (doc.sourceType === 'upload' && doc.chunks && doc.chunks.length > 0) {
      let bestChunkScore = 0;
      doc.chunks.forEach((chunk) => {
        const chunkScore = scoreText(q, terms, chunk.content);
        // chunk 标题额外加权
        if (chunk.title) {
          const ct = chunk.title.toLowerCase();
          if (q.includes(ct) || ct.includes(q)) score += 2;
        }
        if (chunkScore > bestChunkScore) {
          bestChunkScore = chunkScore;
          matchedChunk = chunk;
        }
      });
      score += bestChunkScore;
    }

    return { doc, score, matchedChunk };
  });

  const sorted = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
  return {
    matched: sorted.slice(0, topK),
    bestScore: sorted[0]?.score ?? 0,
  };
}

/** 结构化答案，供对话面板渲染 */
export interface AssistantAnswer {
  docId: string;
  title: string;
  category: string;
  summary: string;
  steps: StepItem[];
  path: string;
  screenshot: string;
  docLink: string;
}

export interface RetrievedDocInfo {
  doc: ManualDoc;
  score: number;
}

export interface AnswerResult {
  /** 主答案（命中最佳文档） */
  answer?: AssistantAnswer;
  /** 相关文档（命中的其他文档，作为快捷入口） */
  related: ManualDoc[];
  /** 召回文档及得分（用于后台日志分析） */
  retrieved: RetrievedDocInfo[];
  /** 最佳匹配得分 */
  bestScore: number;
  hit: boolean;
}

export function buildAnswer(query: string, docs: ManualDoc[], config: AssistantConfig): AnswerResult {
  const { matched, bestScore } = retrieveDocs(query, docs, config.topK);
  if (matched.length === 0 || bestScore < config.matchThreshold) {
    return { related: [], retrieved: [], bestScore: 0, hit: false };
  }
  const [primary, ...rest] = matched;
  const retrieved: RetrievedDocInfo[] = matched.map((s) => ({ doc: s.doc, score: s.score }));

  const primaryDoc = primary.doc;
  const relatedDocs = rest.map((s) => s.doc);

  // 上传文档：尝试从最佳 chunk 生成结构化答案
  if (primaryDoc.sourceType === 'upload' && primaryDoc.chunks && primaryDoc.chunks.length > 0) {
    const q = query.toLowerCase();
    const terms = expandTerms(query);
    let bestChunk = primaryDoc.chunks[0];
    let bestChunkScore = 0;
    primaryDoc.chunks.forEach((chunk) => {
      const score = scoreText(q, terms, chunk.content);
      if (score > bestChunkScore) {
        bestChunkScore = score;
        bestChunk = chunk;
      }
    });

    const chunkTitle = bestChunk.title || extractChunkHeading(bestChunk.content) || primaryDoc.title;
    const chunkSteps = extractSteps(bestChunk.content);
    const answer: AssistantAnswer = {
      docId: primaryDoc.id,
      title: chunkTitle,
      category: primaryDoc.category,
      summary: bestChunk.content.slice(0, 160) + (bestChunk.content.length > 160 ? '…' : ''),
      steps: chunkSteps.length ? chunkSteps.map((t) => ({ text: t })) : [{ text: '查看文档详情获取完整操作步骤' }],
      path: primaryDoc.sourceName || primaryDoc.title,
      screenshot: '',
      docLink: primaryDoc.sourceName || primaryDoc.title,
    };
    return { answer, related: relatedDocs, retrieved, bestScore, hit: true };
  }

  const answer: AssistantAnswer = {
    docId: primaryDoc.id,
    title: primaryDoc.title,
    category: primaryDoc.category,
    summary: primaryDoc.steps[0] || primaryDoc.title,
    steps: toStepItems(primaryDoc),
    path: primaryDoc.path || extractPathFromSteps(primaryDoc.steps),
    screenshot: '',
    docLink: primaryDoc.title,
  };
  return { answer, related: relatedDocs, retrieved, bestScore, hit: true };
}

function extractChunkHeading(content: string): string {
  const lines = content.split(/\n/).map((s) => s.trim()).filter(Boolean);
  const heading = lines.find((l) => /^#{1,3}\s+/.test(l) || /^\d+[\.\、]/.test(l));
  return heading ? heading.replace(/^#+\s*/, '').slice(0, 40) : '';
}

function extractSteps(content: string): string[] {
  const lines = content.split(/\n/)
    .map((s) => s.trim())
    .filter((s) => /^\d+[\.\、\)]\s+/.test(s) || /^[\-\*]\s+/.test(s));
  return lines.slice(0, 6).map((s) => s.replace(/^\d+[\.\、\)]\s+|^[\-\*]\s+/, ''));
}

/** 无匹配时的建议文档（按关键词部分命中兜底推荐） */
export function suggestDocs(query: string, docs: ManualDoc[], limit = 4): ManualDoc[] {
  const q = query.toLowerCase();
  return docs
    .map((doc) => {
      let hit = 0;
      if (doc.keywords.some((k) => q.includes(k.toLowerCase()))) hit += 1;
      if (doc.sourceType === 'upload' && doc.chunks) {
        const chunkHit = doc.chunks.some((c) =>
          expandTerms(query).some((t) => t && c.content.toLowerCase().includes(t)),
        );
        if (chunkHit) hit += 1;
      }
      return { doc, hit };
    })
    .filter((x) => x.hit > 0)
    .slice(0, limit)
    .map((x) => x.doc);
}
