/**
 * AI 助手悬浮组件
 * - 可拖拽悬浮按钮（固定在视口右侧，层级高于所有页面与弹窗）
 * - 点击从右侧滑出对话面板
 * - 左侧边栏展示历史会话，右侧为消息对话区
 * - 支持多会话：新建 / 删除 / 重命名 / 切换 / 置顶
 * - 基于操作手册检索，返回结构化答案（步骤 / 路径 / 示意图 / 文档链接）
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  Send,
  X,
  Minus,
  CornerDownLeft,
  Image as ImageIcon,
  BookOpen,
  Link2,
  Sparkles,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Pin,
  Pencil,
  Trash2,
  Search,
  MessageSquare,
  PanelRight,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import {
  appendConversationLog,
  getAssistantConfig,
  getManualDocs,
  updateConversationLog,
  type AssistantConfig,
  type ConversationLog,
  type ManualDoc,
} from '../../data/assistantManual';
import {
  getDatasets,
  getScopes,
  getTerms,
  getMetrics,
  appendQueryLog,
  groupScopes,
  type QueryChartType,
  type QueryScope,
} from '../../data/semanticLayer';
import { runQuery, type QueryResult } from './queryEngine';
import { QueryResultView } from './QueryResultView';
import {
  buildAnswer,
  suggestDocs,
  type AssistantAnswer,
} from './retrieve';
import { useAuth } from '../../contexts/AuthContext';

export interface AIAssistantWidgetProps {
  setPage: (page: string, params?: Record<string, string>) => void;
}

type ChatMessage =
  | { id: string; role: 'user'; text: string }
  | {
      id: string;
      role: 'assistant';
      text?: string;
      answer?: AssistantAnswer;
      related?: ManualDoc[];
      suggestions?: ManualDoc[];
      /** 关联后台对话记录 ID，用于反馈 */
      logId?: string;
      /** 用户反馈 */
      feedback?: 'up' | 'down' | null;
      /** 问数模式：结果可视化 */
      query?: QueryResult;
      queryChartType?: QueryChartType;
      /** 关联后台问数记录 ID */
      queryLogId?: string;
    };

interface Session {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
}

const SESSIONS_KEY = 'dae-assistant-sessions-v1';
const COLLAPSED_KEY = 'dae-assistant-button-collapsed';
const SIDEBAR_WIDTH = 240;

const QUICK_PROMPTS = [
  '如何申请数据查看权限？',
  '怎样把图表上线到门户？',
  '数据门户为什么看不到某些数据？',
  '怎么创建指标监控任务？',
];

let msgSeq = 0;
const nextId = () => `m${Date.now()}_${msgSeq++}`;

/* ==================== localStorage helpers ==================== */

function loadSessions(): Session[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Session[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {}
  return [];
}

function saveSessions(sessions: Session[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {}
}

function loadCollapsed(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(COLLAPSED_KEY) === '1';
}

function saveCollapsed(collapsed: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0');
}

function createSession(title?: string): Session {
  const now = Date.now();
  return {
    id: `s-${now}`,
    title: title || '新的对话',
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

function generateTitleFromMessages(messages: ChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === 'user');
  if (firstUser) {
    const text = (firstUser as { text: string }).text.slice(0, 18);
    return text + ((firstUser as { text: string }).text.length > 18 ? '…' : '');
  }
  return '新的对话';
}

/* ==================== Main ==================== */

export default function AIAssistantWidget({ setPage }: AIAssistantWidgetProps) {
  const config: AssistantConfig = getAssistantConfig();
  const { currentUser } = useAuth();

  const [open, setOpen] = useState(false);
  const [buttonCollapsed, setButtonCollapsed] = useState<boolean>(() => loadCollapsed());
  const [sessions, setSessions] = useState<Session[]>(() => {
    const existing = loadSessions();
    return existing.length ? existing : [createSession()];
  });
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const existing = loadSessions();
    return existing.length ? existing[0].id : sessions[0]?.id;
  });

  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  // 能力切换：解答助手 / 问数助手
  const [mode, setMode] = useState<'qa' | 'query'>('qa');
  const scopes = getScopes();
  const scopeGroups = useMemo(() => groupScopes(scopes), [scopes]);
  const datasets = getDatasets();
  const terms = getTerms();
  const metrics = getMetrics();
  const [scopeId, setScopeId] = useState<string>(scopes[0]?.id || '');
  const activeScope: QueryScope | undefined = scopes.find((s) => s.id === scopeId) || scopes[0];
  const isQueryMode = mode === 'query';

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [buttonHover, setButtonHover] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 当前会话派生
  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) || sessions[0] || createSession(),
    [sessions, activeSessionId],
  );

  // 悬浮按钮位置（拖拽）—— 初始在右侧
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    if (typeof window === 'undefined') return { x: 1200, y: 400 };
    return { x: window.innerWidth - 88, y: Math.max(120, window.innerHeight / 2 - 100) };
  });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // 持久化会话
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    saveCollapsed(buttonCollapsed);
  }, [buttonCollapsed]);

  // 新消息 / 思考态变化时滚动到底部
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [activeSession.messages, thinking, open]);

  // 点击外部关闭会话菜单
  useEffect(() => {
    const onDocClick = () => setMenuOpenId(null);
    if (menuOpenId) {
      document.addEventListener('click', onDocClick);
      return () => document.removeEventListener('click', onDocClick);
    }
  }, [menuOpenId]);

  /* ==================== 拖拽逻辑 ==================== */
  const onPointerMove = useCallback((e: PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true;
    const w = buttonCollapsed ? 34 : 56;
    const h = buttonCollapsed ? 62 : 56;
    const nx = Math.max(8, Math.min(window.innerWidth - w - 8, d.originX + dx));
    const ny = Math.max(8, Math.min(window.innerHeight - h - 8, d.originY + dy));
    setPos({ x: nx, y: ny });
  }, [buttonCollapsed]);

  const onPointerUp = useCallback(
    (e: PointerEvent) => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      const moved = dragRef.current?.moved;
      const action = (e.target as HTMLElement | null)?.closest('[data-action]')?.getAttribute('data-action');
      dragRef.current = null;
      setDragging(false);
      if (moved) return;

      if (buttonCollapsed) {
        setButtonCollapsed(false);
        return;
      }
      if (action === 'toggle') {
        setOpen((v) => !v);
      }
    },
    [buttonCollapsed, onPointerMove],
  );

  const onButtonDown = (e: React.PointerEvent) => {
    e.preventDefault();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: pos.x,
      originY: pos.y,
      moved: false,
    };
    setDragging(true);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [onPointerMove, onPointerUp]);

  /* ==================== 会话操作 ==================== */
  const updateSession = (sessionId: string, updater: (s: Session) => Session) => {
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? updater({ ...s }) : s)));
  };

  const handleNewSession = () => {
    const s = createSession();
    setSessions((prev) => [s, ...prev]);
    setActiveSessionId(s.id);
    setOpen(true);
    setSearchQuery('');
  };

  const handleDeleteSession = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (activeSessionId === id) {
        const fallback = next[0]?.id;
        if (fallback) setActiveSessionId(fallback);
      }
      if (next.length === 0) {
        const fresh = createSession();
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      return next;
    });
    setMenuOpenId(null);
  };

  const handleRenameStart = (s: Session, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingId(s.id);
    setEditingTitle(s.title);
    setMenuOpenId(null);
  };

  const handleRenameSubmit = () => {
    if (!editingId) return;
    const t = editingTitle.trim();
    if (t) updateSession(editingId, (s) => ({ ...s, title: t, updatedAt: Date.now() }));
    setEditingId(null);
  };

  const handlePin = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    updateSession(id, (s) => ({ ...s, pinned: !s.pinned, updatedAt: Date.now() }));
    setMenuOpenId(null);
  };

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.updatedAt - a.updatedAt;
    });
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sortedSessions;
    const q = searchQuery.toLowerCase();
    return sortedSessions.filter((s) => s.title.toLowerCase().includes(q));
  }, [sortedSessions, searchQuery]);

  /* ==================== 消息发送 ==================== */
  const handleSend = (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || thinking) return;
    if (isQueryMode) {
      handleQuerySend(text);
      return;
    }

    const userMsg: ChatMessage = { id: nextId(), role: 'user', text };
    setInput('');
    setThinking(true);

    setSessions((prev) => {
      const target = prev.find((s) => s.id === activeSessionId) || prev[0];
      if (!target) return prev;
      const nextMessages = [...target.messages, userMsg];
      const nextTitle = target.title === '新的对话' ? generateTitleFromMessages(nextMessages) : target.title;
      return prev.map((s) =>
        s.id === target.id
          ? { ...s, messages: nextMessages, title: nextTitle, updatedAt: Date.now() }
          : s,
      );
    });

    const startAt = Date.now();
    window.setTimeout(() => {
      const allDocs = getManualDocs();
      // 仅「已发布」的文档才能被助手调用
      const docs = allDocs.filter((d) => d.status === 'published');
      const cfg = getAssistantConfig();
      const res = buildAnswer(text, docs, cfg);
      const responseTimeMs = Date.now() - startAt;

      const logId = `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const answerText = res.hit && res.answer
        ? `${res.answer.title}\n${res.answer.summary}\n${res.answer.steps.map((s) => s.text).join('\n')}`
        : cfg.fallbackReply;

      const log: ConversationLog = {
        id: logId,
        sessionId: activeSessionId,
        userId: currentUser?.id,
        userName: currentUser?.name,
        question: text,
        answerText,
        answerSnapshot: res.hit && res.answer
          ? {
              docId: res.answer.docId,
              title: res.answer.title,
              category: res.answer.category,
              summary: res.answer.summary,
              steps: res.answer.steps.map((s) => s.text),
              path: res.answer.path,
            }
          : undefined,
        retrievedDocs: res.retrieved.map((r) => ({
          docId: r.doc.id,
          title: r.doc.title,
          score: r.score,
          status: r.doc.status,
        })),
        matchScore: res.bestScore,
        hit: res.hit,
        modelParams: {
          provider: cfg.modelProvider,
          model: cfg.model,
          temperature: cfg.temperature,
          topP: cfg.topP,
          maxTokens: cfg.maxTokens,
          contextRound: cfg.contextRound,
          responseFormat: cfg.responseFormat,
          presencePenalty: cfg.presencePenalty,
          frequencyPenalty: cfg.frequencyPenalty,
        },
        feedback: null,
        responseTimeMs,
        createdAt: Date.now(),
      };
      appendConversationLog(log);

      const assistantMsg: ChatMessage =
        res.hit && res.answer
          ? { id: nextId(), role: 'assistant', answer: res.answer, related: res.related, logId }
          : {
              id: nextId(),
              role: 'assistant',
              text: cfg.fallbackReply,
              suggestions: suggestDocs(text, docs),
              logId,
            };

      setSessions((prev) => {
        const target = prev.find((s) => s.id === activeSessionId) || prev[0];
        if (!target) return prev;
        return prev.map((s) =>
          s.id === target.id
            ? { ...s, messages: [...s.messages, assistantMsg], updatedAt: Date.now() }
            : s,
        );
      });
      setThinking(false);
    }, 620 + Math.random() * 480);
  };

  /* ==================== 问数模式发送 ==================== */
  const handleQuerySend = (text: string) => {
    if (!activeScope) return;
    const scope = activeScope;
    const userMsg: ChatMessage = { id: nextId(), role: 'user', text };
    const startAt = Date.now();

    setSessions((prev) => {
      const target = prev.find((s) => s.id === activeSessionId) || prev[0];
      if (!target) return prev;
      const nextMessages = [...target.messages, userMsg];
      const nextTitle = target.title === '新的对话' ? generateTitleFromMessages(nextMessages) : target.title;
      return prev.map((s) => (s.id === target.id ? { ...s, messages: nextMessages, title: nextTitle, updatedAt: Date.now() } : s));
    });
    setThinking(true);

    window.setTimeout(() => {
      const res = runQuery(text, scope, datasets, terms, metrics);
      const responseTimeMs = Date.now() - startAt;
      const queryLogId = `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      appendQueryLog({
        id: queryLogId,
        userId: currentUser?.id,
        userName: currentUser?.name,
        question: text,
        rewrittenQuestion: res.rewrittenQuestion,
        scopeType: scope.type,
        scopeName: scope.name,
        datasetId: scope.datasetId,
        datasetName: scope.datasetId ? datasets.find((d) => d.id === scope.datasetId)?.datasetName : undefined,
        hitTerms: res.hitTerms.map((t) => t.term),
        reasoning: res.reasoning,
        sql: res.sql,
        chartType: res.chartType,
        chartTypeName: res.chartTypeName,
        resultSummary: res.summary,
        hitSemantic: res.hitSemantic,
        feedback: null,
        responseTimeMs,
        createdAt: Date.now(),
      });

      const assistantMsg: ChatMessage = {
        id: nextId(),
        role: 'assistant',
        query: res,
        queryChartType: res.chartType,
        queryLogId,
      };

      setSessions((prev) => {
        const target = prev.find((s) => s.id === activeSessionId) || prev[0];
        if (!target) return prev;
        return prev.map((s) => (s.id === target.id ? { ...s, messages: [...s.messages, assistantMsg], updatedAt: Date.now() } : s));
      });
      setThinking(false);
    }, 650 + Math.random() * 450);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFeedback = (msgId: string, logId: string | undefined, feedback: 'up' | 'down') => {
    if (!logId) return;
    updateConversationLog(logId, { feedback });
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        messages: s.messages.map((m) => (m.id === msgId && m.role === 'assistant' ? { ...m, feedback } : m)),
      })),
    );
  };

  // 问数模式：切换图表类型（更新会话中的消息）
  const handleChartTypeChange = (msgId: string, t: QueryChartType) => {
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        messages: s.messages.map((m) => (m.id === msgId ? { ...m, queryChartType: t } : m)),
      })),
    );
  };

  // 问数模式：反馈同步到问数记录
  const handleQueryFeedback = (msgId: string, logId: string | undefined, feedback: 'up' | 'down') => {
    if (logId) {
      import('../../data/semanticLayer').then((m) => {
        const logs = m.getQueryLogs();
        m.saveQueryLogs(logs.map((l) => (l.id === logId ? { ...l, feedback } : l)));
      });
    }
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        messages: s.messages.map((m) => (m.id === msgId ? { ...m, feedback } : m)),
      })),
    );
  };

  const openDoc = (docId: string) => {
    setOpen(false);
    setPage('assistant-admin', { docId });
  };

  /* ==================== 渲染：收起态（贴边小胶囊） ==================== */
  if (buttonCollapsed) {
    return (
      <div
        onPointerDown={onButtonDown}
        onMouseEnter={() => setButtonHover(true)}
        onMouseLeave={() => setButtonHover(false)}
        title={config.name}
        style={{
          position: 'fixed',
          left: pos.x,
          top: pos.y,
          width: 34,
          height: 62,
          borderRadius: '18px 0 0 18px',
          border: 'none',
          cursor: dragging ? 'grabbing' : 'pointer',
          background: 'linear-gradient(180deg, #3b82f6 0%, #0ea5e9 100%)',
          boxShadow: '0 4px 18px rgba(14,165,233,0.28)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          touchAction: 'none',
          transition: dragging ? 'none' : 'transform 0.18s ease, box-shadow 0.18s ease',
        }}
      >
        <Bot size={18} strokeWidth={1.8} />
        {buttonHover && (
          <div
            style={{
              position: 'absolute',
              left: -12,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PanelRight size={12} />
          </div>
        )}
      </div>
    );
  }

  /* ==================== 渲染：展开态（单个机器人按钮） ==================== */
  return (
    <>
      <div
        onPointerDown={onButtonDown}
        onMouseEnter={() => setButtonHover(true)}
        onMouseLeave={() => setButtonHover(false)}
        style={{
          position: 'fixed',
          left: pos.x,
          top: pos.y,
          width: 56,
          height: 56,
          zIndex: 99999,
          touchAction: 'none',
          cursor: dragging ? 'grabbing' : 'default',
          userSelect: 'none',
        }}
      >
        {/* 机器人主按钮 */}
        <div
          data-action="toggle"
          title={config.name}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)',
            boxShadow: '0 6px 20px rgba(14,165,233,0.32)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '2px solid #fff',
            transition: 'transform 0.15s ease',
          }}
        >
          <Bot size={26} strokeWidth={1.7} />
        </div>

        {/* hover 显示的收起小按钮 */}
        {buttonHover && !dragging && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setButtonCollapsed(true);
              setOpen(false);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            title="收起助手"
            style={{
              position: 'absolute',
              right: -4,
              top: -4,
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#fff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              zIndex: 2,
            }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* 右侧对话面板 */}
      <div
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          height: '100vh',
          width: 900,
          maxWidth: '96vw',
          background: '#fff',
          borderLeft: '1px solid #e2e8f0',
          boxShadow: '-8px 0 30px rgba(15,23,42,0.12)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.22,1,0.36,1)',
          zIndex: 100001,
          display: 'flex',
        }}
      >
        {/* 左侧会话列表 */}
        <SessionSidebar
          config={config}
          sessions={filteredSessions}
          activeSessionId={activeSessionId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNewSession={handleNewSession}
          onSelectSession={setActiveSessionId}
          onPin={handlePin}
          onRenameStart={handleRenameStart}
          onRenameSubmit={handleRenameSubmit}
          onDelete={handleDeleteSession}
          editingId={editingId}
          editingTitle={editingTitle}
          setEditingTitle={setEditingTitle}
          menuOpenId={menuOpenId}
          setMenuOpenId={setMenuOpenId}
        />

        {/* 右侧对话主区域 */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* 头部 */}
          <div
            style={{
              flexShrink: 0,
              padding: '14px 18px',
              background: 'linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <BotAvatar config={config} size={40} style={{ boxShadow: '0 4px 14px rgba(14,165,233,0.22)' }} />
            <div style={{ flex: 1, lineHeight: 1.25 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{config.name}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                {isQueryMode ? '智能问数助手' : '产品使用智能助手'}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => setOpen(false)}
                title="最小化"
                style={headerActionBtnStyle}
              >
                <Minus size={18} />
              </button>
              <button
                onClick={() => setOpen(false)}
                title="关闭"
                style={headerActionBtnStyle}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* 能力切换：解答助手 / 问数助手 */}
          <div
            style={{
              flexShrink: 0,
              display: 'flex',
              gap: 6,
              padding: '8px 14px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <ModeTab active={!isQueryMode} icon={<MessageSquare size={14} />} label="解答助手" onClick={() => setMode('qa')} />
            <ModeTab active={isQueryMode} icon={<Sparkles size={14} />} label="问数助手" onClick={() => setMode('query')} />
          </div>

          {/* 问数模式：作用域选择器（按类型分组下拉） */}
          {isQueryMode && (
            <div
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                background: '#fff',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <span style={{ fontSize: 12, color: '#64748b', flexShrink: 0 }}>作用域</span>
              <select
                value={scopeId}
                onChange={(e) => setScopeId(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: '6px 8px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  color: '#0f172a',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {scopeGroups.map((g) => (
                  <optgroup key={g.type} label={g.label}>
                    {g.items.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}

          {/* 消息区 */}
          <div ref={listRef} className="dae-scroll" style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#f8fafc' }}>
            {!config.enabled ? (
              <div style={noticeStyle}>助手已停用，请联系管理员在「AI 助手管理」中启用。</div>
            ) : activeSession.messages.length === 0 ? (
              <WelcomeCard config={config} onPick={handleSend} queryMode={isQueryMode} />
            ) : (
              activeSession.messages.map((m) => (
                <div key={m.id} style={{ marginBottom: 16 }}>
                  {m.role === 'user' ? (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <div
                        style={{
                          maxWidth: '82%',
                          background: 'linear-gradient(135deg, #1677FF 0%, #0ea5e9 100%)',
                          color: '#fff',
                          borderRadius: '14px 14px 4px 14px',
                          padding: '9px 13px',
                          fontSize: 13.5,
                          lineHeight: 1.55,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {m.text}
                      </div>
                    </div>
                  ) : (
                    <AssistantBubble
                      message={m}
                      config={config}
                      onOpenDoc={openDoc}
                      onPick={handleSend}
                      onFeedback={handleFeedback}
                      onChartTypeChange={handleChartTypeChange}
                      onQueryFeedback={handleQueryFeedback}
                    />
                  )}
                </div>
              ))
            )}

            {thinking && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 13 }}>
                <BotAvatar config={config} size={30} />
                <span>助手正在输入</span>
                <TypingDots />
              </div>
            )}
          </div>

          {/* 输入区 */}
          {config.enabled && (
            <div style={{ borderTop: '1px solid #e2e8f0', padding: 12, flexShrink: 0, background: '#fff' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder={isQueryMode ? '描述你想查的数据，例如：各地区的销量占比' : '您希望 AI 助手回答您什么问题？请直接输入'}
                  rows={1}
                  style={{
                    flex: 1,
                    resize: 'none',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: '10px 12px',
                    fontSize: 13.5,
                    lineHeight: 1.5,
                    fontFamily: 'inherit',
                    outline: 'none',
                    maxHeight: 120,
                  }}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || thinking}
                  style={{
                    height: 40,
                    width: 40,
                    borderRadius: 10,
                    border: 'none',
                    background: input.trim() && !thinking ? 'linear-gradient(135deg, #1677FF 0%, #0ea5e9 100%)' : '#cbd5e1',
                    color: '#fff',
                    cursor: input.trim() && !thinking ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: input.trim() && !thinking ? '0 4px 12px rgba(22,119,255,0.25)' : 'none',
                  }}
                >
                  <Send size={18} />
                </button>
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CornerDownLeft size={12} /> 回车发送，Shift+回车换行
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ============================ 子组件 ============================ */

const headerActionBtnStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 8,
  border: '1px solid #dbeafe',
  background: '#fff',
  color: '#64748b',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

function SessionSidebar({
  config,
  sessions,
  activeSessionId,
  searchQuery,
  onSearchChange,
  onNewSession,
  onSelectSession,
  onPin,
  onRenameStart,
  onRenameSubmit,
  onDelete,
  editingId,
  editingTitle,
  setEditingTitle,
  menuOpenId,
  setMenuOpenId,
}: {
  config: AssistantConfig;
  sessions: Session[];
  activeSessionId: string;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  onNewSession: () => void;
  onSelectSession: (id: string) => void;
  onPin: (id: string, e?: React.MouseEvent) => void;
  onRenameStart: (s: Session, e?: React.MouseEvent) => void;
  onRenameSubmit: () => void;
  onDelete: (id: string, e?: React.MouseEvent) => void;
  editingId: string | null;
  editingTitle: string;
  setEditingTitle: (v: string) => void;
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
}) {
  return (
    <div
      style={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        borderRight: '1px solid #e2e8f0',
        background: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 顶部 Logo 区 */}
      <div
        style={{
          padding: '16px 14px 12px',
          borderBottom: '1px solid #e2e8f0',
          background: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <BotAvatar config={config} size={32} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{config.name}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>产品使用智能助手</div>
          </div>
        </div>

        {/* 新建对话按钮 */}
        <button
          onClick={onNewSession}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '9px 0',
            borderRadius: 10,
            border: '1px dashed #bfdbfe',
            background: '#eff6ff',
            color: '#1677FF',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <Plus size={15} />
          开启新对话
        </button>
      </div>

      {/* 搜索框 */}
      <div style={{ padding: '10px 12px', background: '#f8fafc' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 10px',
            borderRadius: 8,
            background: '#fff',
            border: '1px solid #e2e8f0',
          }}
        >
          <Search size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索会话"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 12.5,
              color: '#334155',
              background: 'transparent',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              style={{
                border: 'none',
                background: 'transparent',
                padding: 0,
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* 会话列表 */}
      <div className="dae-scroll" style={{ flex: 1, overflowY: 'auto', padding: '4px 10px 12px' }}>
        {sessions.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
            <MessageSquare size={28} style={{ marginBottom: 8, opacity: 0.6 }} />
            <div>暂无会话</div>
            <button
              onClick={onNewSession}
              style={{
                marginTop: 10,
                color: '#1677FF',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              开启新对话
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                fontSize: 11,
                color: '#94a3b8',
                fontWeight: 500,
                padding: '8px 4px 6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>最近会话</span>
              <span>{sessions.length} 个</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {sessions.map((s) => {
                const active = s.id === activeSessionId;
                const isEditing = editingId === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={(e) => {
                      // 点击菜单或编辑框时不切换
                      if ((e.target as HTMLElement).closest('[data-stop-propagation]')) return;
                      onSelectSession(s.id);
                      setMenuOpenId(null);
                    }}
                    style={{
                      position: 'relative',
                      padding: '8px 10px',
                      borderRadius: 8,
                      background: active ? '#eff6ff' : 'transparent',
                      border: active ? '1px solid #bfdbfe' : '1px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.background = '#f1f5f9';
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <MessageSquare
                      size={14}
                      style={{
                        color: active ? '#1677FF' : '#94a3b8',
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    />
                    {isEditing ? (
                      <input
                        autoFocus
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={onRenameSubmit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') onRenameSubmit();
                          if (e.key === 'Escape') {
                            setEditingTitle('');
                            setMenuOpenId(null);
                          }
                          e.stopPropagation();
                        }}
                        onClick={(e) => e.stopPropagation()}
                        data-stop-propagation
                        style={{
                          flex: 1,
                          border: '1px solid #bfdbfe',
                          borderRadius: 4,
                          padding: '2px 5px',
                          fontSize: 12,
                          outline: 'none',
                          background: '#fff',
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: 12.5,
                          color: active ? '#075985' : '#475569',
                          fontWeight: active ? 500 : 400,
                        }}
                      >
                        {s.title}
                      </span>
                    )}

                    {/* 置顶标记 */}
                    {s.pinned && !isEditing && (
                      <Pin size={11} style={{ color: '#1677FF', flexShrink: 0 }} />
                    )}

                    {/* 更多操作 */}
                    {!isEditing && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === s.id ? null : s.id);
                        }}
                        data-stop-propagation
                        style={{
                          flexShrink: 0,
                          background: 'transparent',
                          border: 'none',
                          color: active ? '#075985' : '#94a3b8',
                          cursor: 'pointer',
                          padding: 2,
                          borderRadius: 4,
                          display: 'flex',
                          opacity: active ? 1 : 0.7,
                        }}
                      >
                        <MoreHorizontal size={14} />
                      </button>
                    )}

                    {menuOpenId === s.id && !isEditing && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        data-stop-propagation
                        style={{
                          position: 'absolute',
                          right: 8,
                          top: 32,
                          background: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                          zIndex: 30,
                          minWidth: 96,
                          padding: '4px 0',
                        }}
                      >
                        <MenuItem onClick={(e) => onPin(s.id, e)} icon={<Pin size={13} />} label={s.pinned ? '取消置顶' : '置顶'} />
                        <MenuItem onClick={(e) => onRenameStart(s, e)} icon={<Pencil size={13} />} label="重命名" />
                        <MenuItem onClick={(e) => onDelete(s.id, e)} icon={<Trash2 size={13} />} label="删除" danger />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MenuItem({
  onClick,
  icon,
  label,
  danger,
}: {
  onClick: (e: React.MouseEvent) => void;
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        border: 'none',
        background: 'transparent',
        color: danger ? '#dc2626' : '#334155',
        fontSize: 12.5,
        padding: '7px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        cursor: 'pointer',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {icon}
      {label}
    </button>
  );
}

function ModeTab({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: '7px 0',
        borderRadius: 8,
        border: active ? '1px solid #1677FF' : '1px solid transparent',
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

const noticeStyle: React.CSSProperties = {
  margin: '40px 8px',
  padding: 16,
  borderRadius: 12,
  background: '#fff',
  color: '#64748b',
  fontSize: 13.5,
  lineHeight: 1.6,
  textAlign: 'center',
};

function BotAvatar({ config, size = 30, style }: { config: AssistantConfig; size?: number; style?: React.CSSProperties }) {
  const base: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    flexShrink: 0,
    ...style,
  };
  if (config.avatarUrl) {
    return <img src={config.avatarUrl} alt="" style={{ ...base, objectFit: 'cover' }} />;
  }
  return (
    <div
      style={{
        ...base,
        background: 'linear-gradient(135deg, #1677FF 0%, #0ea5e9 100%)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
      }}
    >
      <Bot size={size * 0.5} />
    </div>
  );
}

function WelcomeCard({ config, onPick, queryMode }: { config: AssistantConfig; onPick: (t: string) => void; queryMode?: boolean }) {
  const prompts = queryMode
    ? ['最近 7 天的 GMV 趋势', '各地区的销量占比', '销售额 Top 10 商品', '本月客单价是多少']
    : QUICK_PROMPTS;
  const welcome = queryMode
    ? '你好，我是智能问数助手 📊\n选择作用域（数据集 / 报表 / 大屏）后，用自然语言即可取数并自动生成图表。\n试试问我：各地区的销量占比？'
    : config.welcomeMessage;
  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <BotAvatar config={config} size={30} />
        <div
          style={{
            background: '#fff',
            borderRadius: '14px 14px 14px 4px',
            padding: '12px 14px',
            fontSize: 13.5,
            lineHeight: 1.7,
            color: '#334155',
            whiteSpace: 'pre-wrap',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            maxWidth: '88%',
          }}
        >
          {welcome}
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#64748b', margin: '6px 0 10px 2px', fontWeight: 500 }}>
        {queryMode ? '试试这样问' : '热门问题'}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {prompts.map((q) => (
          <button
            key={q}
            onClick={() => onPick(q)}
            style={{
              border: '1px solid #bfdbfe',
              background: '#fff',
              borderRadius: 999,
              padding: '7px 13px',
              fontSize: 12.5,
              color: '#1677FF',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function AssistantBubble({
  message,
  config,
  onOpenDoc,
  onPick,
  onFeedback,
  onChartTypeChange,
  onQueryFeedback,
}: {
  message: Extract<ChatMessage, { role: 'assistant' }>;
  config: AssistantConfig;
  onOpenDoc: (docId: string) => void;
  onPick: (t: string) => void;
  onFeedback: (msgId: string, logId: string | undefined, feedback: 'up' | 'down') => void;
  onChartTypeChange: (msgId: string, t: QueryChartType) => void;
  onQueryFeedback: (msgId: string, logId: string | undefined, feedback: 'up' | 'down') => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <BotAvatar config={config} size={30} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* 问数结果 */}
        {message.query && (
          <QueryResultView
            result={message.query}
            chartType={message.queryChartType || message.query.chartType}
            onChartTypeChange={(t) => onChartTypeChange(message.id, t)}
            onFeedback={(f) => onQueryFeedback(message.id, message.queryLogId, f)}
            feedback={message.feedback}
          />
        )}
        {message.text && (
          <div
            style={{
              background: '#fff',
              borderRadius: '14px 14px 14px 4px',
              padding: '11px 14px',
              fontSize: 13.5,
              lineHeight: 1.6,
              color: '#334155',
              whiteSpace: 'pre-wrap',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              maxWidth: '92%',
            }}
          >
            {message.text}
          </div>
        )}
        {message.answer && <AnswerCard answer={message.answer} config={config} onOpenDoc={onOpenDoc} />}
        {message.related && message.related.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>相关文档</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {message.related.map((d) => (
                <button key={d.id} onClick={() => onOpenDoc(d.id)} style={relatedBtnStyle}>
                  <BookOpen size={13} style={{ color: '#1677FF', flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</span>
                  <ChevronRight size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        )}
        {message.suggestions && message.suggestions.length > 0 && (
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {message.suggestions.map((d) => (
              <button
                key={d.id}
                onClick={() => onPick(d.title)}
                style={{
                  border: '1px solid #bfdbfe',
                  background: '#fff',
                  borderRadius: 999,
                  padding: '5px 10px',
                  fontSize: 12,
                  color: '#1677FF',
                  cursor: 'pointer',
                }}
              >
                {d.title}
              </button>
            ))}
          </div>
        )}

        {/* 答案反馈 */}
        {message.logId && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>这个回答有帮助吗？</span>
            <button
              onClick={() => onFeedback(message.id, message.logId, 'up')}
              title="有帮助"
              style={feedbackBtnStyle(message.feedback === 'up')}
            >
              <ThumbsUp size={13} />
            </button>
            <button
              onClick={() => onFeedback(message.id, message.logId, 'down')}
              title="没帮助"
              style={feedbackBtnStyle(message.feedback === 'down')}
            >
              <ThumbsDown size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function feedbackBtnStyle(active: boolean): React.CSSProperties {
  return {
    width: 26,
    height: 26,
    borderRadius: '50%',
    border: '1px solid var(--dae-border)',
    background: active ? 'var(--dae-primary-light)' : '#fff',
    color: active ? 'var(--dae-primary)' : '#64748b',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  };
}

const relatedBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  maxWidth: 420,
  textAlign: 'left',
  border: '1px solid #e2e8f0',
  background: '#fff',
  borderRadius: 8,
  padding: '8px 10px',
  fontSize: 12.5,
  color: '#475569',
  cursor: 'pointer',
};

function AnswerCard({
  answer,
  config,
  onOpenDoc,
}: {
  answer: AssistantAnswer;
  config: AssistantConfig;
  onOpenDoc: (docId: string) => void;
}) {
  const pathParts = answer.path.split('→').map((p) => p.trim());
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px 14px 14px 4px',
        padding: 14,
        marginTop: 2,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        maxWidth: '92%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span
          style={{
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 999,
            background: '#dbeafe',
            color: '#1677FF',
          }}
        >
          {answer.category}
        </span>
        <span style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{answer.title}</span>
      </div>

      <div style={{ fontSize: 13.5, lineHeight: 1.6, color: '#475569', marginBottom: 10 }}>{answer.summary}</div>

      {/* 操作步骤（支持步骤内插入图片） */}
      <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>操作步骤</div>
      <ol style={{ margin: 0, paddingLeft: 18, color: '#475569', fontSize: 13, lineHeight: 1.7 }}>
        {answer.steps.map((s, i) => (
          <li key={i} style={{ marginBottom: s.image ? 8 : 2 }}>
            <div>{s.text}</div>
            {s.image && (
              <img
                src={s.image}
                alt="步骤示意图"
                style={{
                  marginTop: 6,
                  maxWidth: '100%',
                  maxHeight: 200,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  display: 'block',
                }}
              />
            )}
          </li>
        ))}
      </ol>

      {/* 操作路径（由步骤内容自动识别） */}
      {answer.path.trim() && (
        <>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', margin: '12px 0 6px' }}>操作路径</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
            {pathParts.map((p, i) => (
              <React.Fragment key={i}>
                <span
                  style={{
                    fontSize: 12,
                    padding: '3px 9px',
                    borderRadius: 6,
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    color: '#475569',
                  }}
                >
                  {p}
                </span>
                {i < pathParts.length - 1 && <span style={{ color: '#94a3b8' }}>›</span>}
              </React.Fragment>
            ))}
          </div>
        </>
      )}

      {/* 文档链接 */}
      <button
        onClick={() => onOpenDoc(answer.docId)}
        style={{
          marginTop: 12,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          border: '1px solid #1677FF',
          color: '#1677FF',
          background: '#eff6ff',
          borderRadius: 8,
          padding: '7px 12px',
          fontSize: 12.5,
          cursor: 'pointer',
        }}
      >
        <Link2 size={14} />
        查看完整文档
      </button>
    </div>
  );
}

function TypingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 3 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: '#94a3b8',
            animation: `dae-blink 1.2s ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`@keyframes dae-blink{0%,80%,100%{opacity:0.25}40%{opacity:1}}`}</style>
    </span>
  );
}
