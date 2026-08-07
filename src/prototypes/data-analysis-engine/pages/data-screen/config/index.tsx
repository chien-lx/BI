import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Trash2,
  Copy,
  Move,
  Maximize,
  Grid3X3,
  Type,
  Image,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Square,
  Layers,
  Settings,
  ChevronDown,
  ChevronUp,
  Monitor,
  GripVertical,
  Lock,
  Unlock,
  EyeOff,
  Undo2,
  Redo2,
} from 'lucide-react';
import ChartRenderer from '../../../components/ChartRenderer';
import { dataScreens, datasets, chartSampleData, pieSampleData, type DataScreenComponent, type DataScreenItem } from '../../../data/mockData';
import { useHashParams } from '@/common/useHashParams';

/* ========== 组件类型定义 ========== */
export type ScreenCompType = DataScreenComponent['type'];

interface ScreenComponent extends DataScreenComponent {
  visible?: boolean;
  locked?: boolean;
}

interface ScreenConfig {
  id: string;
  name: string;
  resolution: string;
  width: number;
  height: number;
  bgColor: string;
  bgImage: string;
  gridEnabled: boolean;
  gridSize: number;
  components: ScreenComponent[];
}

const resolutions: { label: string; width: number; height: number }[] = [
  { label: '1920×1080', width: 1920, height: 1080 },
  { label: '3840×1080', width: 3840, height: 1080 },
  { label: '2560×1440', width: 2560, height: 1440 },
  { label: '5760×2160', width: 5760, height: 2160 },
];

const componentLibrary: { key: ScreenCompType; label: string; icon: React.ElementType; defaultW: number; defaultH: number }[] = [
  { key: 'card', label: '指标卡', icon: Activity, defaultW: 280, defaultH: 140 },
  { key: 'text', label: '文本标题', icon: Type, defaultW: 400, defaultH: 60 },
  { key: 'bar', label: '柱状图', icon: BarChart3, defaultW: 520, defaultH: 320 },
  { key: 'line', label: '折线图', icon: LineChart, defaultW: 520, defaultH: 320 },
  { key: 'area', label: '面积图', icon: Activity, defaultW: 520, defaultH: 320 },
  { key: 'pie', label: '饼图', icon: PieChart, defaultW: 400, defaultH: 320 },
  { key: 'image', label: '图片', icon: Image, defaultW: 320, defaultH: 200 },
];

function generateId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`;
}

function parseResolution(resolution: string) {
  const [width, height] = resolution.split('×').map((v) => parseInt(v, 10));
  return { width: width || 1920, height: height || 1080 };
}

/* ========== 折叠面板 ========== */
function ConfigSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid var(--dae-border)' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', cursor: 'pointer' }}
        onClick={() => setOpen(!open)}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--dae-ink)' }}>{title}</span>
        {open ? <ChevronUp size={14} style={{ color: 'var(--dae-ink-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--dae-ink-muted)' }} />}
      </div>
      {open && <div style={{ padding: '0 14px 12px' }}>{children}</div>}
    </div>
  );
}

/* ========== 主页面 ========== */
export default function DataScreenConfigPage() {
  const hashParams = useHashParams();
  const screenId = hashParams['screenId'];
  const sourceScreen = useMemo(() => dataScreens.find((s) => s.id === screenId), [screenId]);
  const parsed = parseResolution(sourceScreen?.resolution || '1920×1080');

  const [config, setConfig] = useState<ScreenConfig>(() => {
    const base: ScreenConfig = {
      id: sourceScreen?.id || generateId('screen'),
      name: sourceScreen?.name || '未命名大屏',
      resolution: sourceScreen?.resolution || '1920×1080',
      width: parsed.width,
      height: parsed.height,
      bgColor: sourceScreen?.bgColor || '#0b1121',
      bgImage: sourceScreen?.bgImage || '',
      gridEnabled: true,
      gridSize: 20,
      components: (sourceScreen?.components || []).map((c) => ({ ...c, visible: true, locked: false })),
    };
    return base;
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scale, setScale] = useState(0.42);
  const [activeLeftTab, setActiveLeftTab] = useState<'components' | 'layers'>('components');
  const [activeRightTab, setActiveRightTab] = useState<'property' | 'data' | 'interaction' | 'canvas'>('property');

  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedComp = useMemo(
    () => config.components.find((c) => c.id === selectedId) || null,
    [config.components, selectedId]
  );

  const updateConfig = useCallback((patch: Partial<ScreenConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateComponent = useCallback((id: string, patch: Partial<ScreenComponent>) => {
    setConfig((prev) => ({
      ...prev,
      components: prev.components.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const addComponent = useCallback((type: ScreenCompType, label: string, defaultW: number, defaultH: number) => {
    const newComp: ScreenComponent = {
      id: generateId('comp'),
      name: `新${label}`,
      type,
      x: Math.round((config.width - defaultW) / 2 / config.gridSize) * config.gridSize,
      y: Math.round((config.height - defaultH) / 2 / config.gridSize) * config.gridSize,
      w: defaultW,
      h: defaultH,
      visible: true,
      locked: false,
      datasetName: datasets[0]?.name || '',
      dimensions: [],
      metrics: [],
    };
    setConfig((prev) => ({ ...prev, components: [...prev.components, newComp] }));
    setSelectedId(newComp.id);
    setActiveRightTab('property');
  }, [config.width, config.height, config.gridSize]);

  const deleteComponent = useCallback((id: string) => {
    setConfig((prev) => ({
      ...prev,
      components: prev.components.filter((c) => c.id !== id),
    }));
    setSelectedId((cur) => (cur === id ? null : cur));
  }, []);

  const duplicateComponent = useCallback((id: string) => {
    setConfig((prev) => {
      const target = prev.components.find((c) => c.id === id);
      if (!target) return prev;
      const copy: ScreenComponent = {
        ...target,
        id: generateId('comp'),
        name: `${target.name}_副本`,
        x: target.x + 20,
        y: target.y + 20,
      };
      return { ...prev, components: [...prev.components, copy] };
    });
  }, []);

  const handleResolutionChange = useCallback((resolution: string) => {
    const { width, height } = parseResolution(resolution);
    updateConfig({ resolution, width, height });
  }, [updateConfig]);

  const goBack = () => {
    window.location.hash = 'page=data-screen';
  };

  const handleSave = () => {
    // 实际项目中调用 API 保存
    alert('大屏配置已保存（演示）');
  };

  const handlePreview = () => {
    window.open(`#/page=data-screen-preview&screenId=${config.id}`, '_blank');
  };

  const onCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#f1f5f9' }}>
      {/* 顶部工具栏 */}
      <div
        style={{
          height: 54,
          background: '#fff',
          borderBottom: '1px solid var(--dae-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          flexShrink: 0,
        }}
      >
        {/* 左侧：返回 + 名称 + 撤销/重做 + 分辨率 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <button
            onClick={goBack}
            title="返回"
            style={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              background: '#fff',
              cursor: 'pointer',
              color: 'var(--dae-ink)',
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <input
            value={config.name}
            onChange={(e) => updateConfig({ name: e.target.value })}
            style={{
              width: 180,
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--dae-ink)',
              border: 'none',
              background: 'transparent',
              padding: 0,
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              title="撤销"
              style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff', cursor: 'pointer', color: 'var(--dae-ink-secondary)' }}
            >
              <Undo2 size={14} />
            </button>
            <button
              title="重做"
              style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff', cursor: 'pointer', color: 'var(--dae-ink-secondary)' }}
            >
              <Redo2 size={14} />
            </button>
          </div>
          <div style={{ width: 1, height: 20, background: 'var(--dae-border)', margin: '0 4px' }} />
          <select
            className="dae-input"
            style={{ width: 130, fontSize: 13 }}
            value={config.resolution}
            onChange={(e) => handleResolutionChange(e.target.value)}
          >
            {resolutions.map((r) => (
              <option key={r.label} value={r.label}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* 中间：组件插入工具栏 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center', minWidth: 0, overflow: 'hidden' }}>
          {componentLibrary.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => addComponent(item.key, item.label, item.defaultW, item.defaultH)}
                title={`添加${item.label}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  width: 56,
                  height: 52,
                  border: '1px solid #d9d9d9',
                  borderRadius: 4,
                  background: '#fff',
                  cursor: 'pointer',
                  color: 'var(--dae-ink)',
                  flexShrink: 0,
                }}
              >
                <Icon size={16} />
                <span style={{ fontSize: 11 }}>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* 右侧：缩放 + 预览/保存 */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--dae-ink-secondary)' }}>
            <Monitor size={14} />
            <span>{config.width} × {config.height}</span>
          </div>
          <div style={{ width: 1, height: 20, background: 'var(--dae-border)' }} />
          <button className="dae-btn dae-btn-secondary dae-btn-sm" onClick={() => setScale((s) => Math.max(0.2, s - 0.05))}>-</button>
          <span style={{ fontSize: 13, color: 'var(--dae-ink-secondary)', minWidth: 46, textAlign: 'center' }}>{Math.round(scale * 100)}%</span>
          <button className="dae-btn dae-btn-secondary dae-btn-sm" onClick={() => setScale((s) => Math.min(1, s + 0.05))}>+</button>
          <div style={{ width: 1, height: 20, background: 'var(--dae-border)', margin: '0 4px' }} />
          <button className="dae-btn dae-btn-secondary" onClick={handlePreview}>
            <Eye size={16} />
            预览
          </button>
          <button className="dae-btn dae-btn-primary" onClick={handleSave}>
            <Save size={16} />
            保存
          </button>
        </div>
      </div>

      {/* 主体 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 左侧面板 */}
        <div
          style={{
            width: 240,
            background: '#fff',
            borderRight: '1px solid var(--dae-border)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', borderBottom: '1px solid var(--dae-border)' }}>
            <button
              className={`de-screen-tab ${activeLeftTab === 'components' ? 'active' : ''}`}
              onClick={() => setActiveLeftTab('components')}
              style={{ flex: 1, padding: '10px 0', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Grid3X3 size={14} />
              组件
            </button>
            <button
              className={`de-screen-tab ${activeLeftTab === 'layers' ? 'active' : ''}`}
              onClick={() => setActiveLeftTab('layers')}
              style={{ flex: 1, padding: '10px 0', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Layers size={14} />
              图层
            </button>
          </div>

          <div style={{ flex: 1, overflow: 'auto' }} className="dae-scroll">
            {activeLeftTab === 'components' && (
              <div style={{ padding: 12, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {componentLibrary.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      className="de-screen-comp-btn"
                      onClick={() => addComponent(item.key, item.label, item.defaultW, item.defaultH)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                        padding: '14px 8px',
                        border: '1px solid var(--dae-border)',
                        borderRadius: 8,
                        background: '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      <Icon size={20} style={{ color: 'var(--dae-primary)' }} />
                      <span style={{ fontSize: 12, color: 'var(--dae-ink-secondary)' }}>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {activeLeftTab === 'layers' && (
              <div style={{ padding: 8 }}>
                {config.components.length === 0 && (
                  <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)', textAlign: 'center', padding: 20 }}>暂无组件</div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[...config.components].reverse().map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedId(c.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 10px',
                        borderRadius: 6,
                        background: selectedId === c.id ? 'var(--dae-primary-light)' : '#f8fafc',
                        border: selectedId === c.id ? '1px solid var(--dae-primary)' : '1px solid transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <GripVertical size={14} style={{ color: 'var(--dae-ink-muted)' }} />
                      <span style={{ flex: 1, fontSize: 12, color: 'var(--dae-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); updateComponent(c.id, { visible: c.visible === false ? true : false }); }}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 2 }}
                      >
                        {c.visible === false ? <EyeOff size={14} style={{ color: 'var(--dae-ink-muted)' }} /> : <Eye size={14} style={{ color: 'var(--dae-ink-muted)' }} />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); updateComponent(c.id, { locked: !c.locked }); }}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 2 }}
                      >
                        {c.locked ? <Lock size={14} style={{ color: 'var(--dae-primary)' }} /> : <Unlock size={14} style={{ color: 'var(--dae-ink-muted)' }} />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteComponent(c.id); }}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 2 }}
                      >
                        <Trash2 size={14} style={{ color: '#ef4444' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 中间画布 */}
        <div
          style={{
            flex: 1,
            background: '#e2e8f0',
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
          }}
          className="dae-scroll"
        >
          <div
            ref={canvasRef}
            onClick={onCanvasClick}
            style={{
              width: config.width * scale,
              height: config.height * scale,
              background: config.bgColor,
              backgroundImage: config.bgImage ? `url(${config.bgImage})` : undefined,
              backgroundSize: 'cover',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              overflow: 'hidden',
              transformOrigin: 'center center',
            }}
          >
            {config.gridEnabled && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
                  backgroundSize: `${config.gridSize * scale}px ${config.gridSize * scale}px`,
                }}
              />
            )}
            {config.components.filter((c) => c.visible !== false).length === 0 && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', gap: 10, pointerEvents: 'none' }}>
                <Grid3X3 size={40} style={{ opacity: 0.7 }} />
                <div style={{ fontSize: 14 }}>画布为空，点击上方「组件」工具栏添加大屏组件</div>
              </div>
            )}
            {config.components
              .filter((c) => c.visible !== false)
              .map((c) => (
                <div
                  key={c.id}
                  onClick={(e) => { e.stopPropagation(); setSelectedId(c.id); }}
                  style={{
                    position: 'absolute',
                    left: c.x * scale,
                    top: c.y * scale,
                    width: c.w * scale,
                    height: c.h * scale,
                    border: selectedId === c.id ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.15)',
                    background: c.type === 'card' ? 'rgba(16, 33, 71, 0.72)' : 'rgba(16, 33, 71, 0.55)',
                    borderRadius: 6,
                    overflow: 'hidden',
                    cursor: c.locked ? 'default' : 'pointer',
                    boxShadow: selectedId === c.id ? '0 0 0 2px rgba(59,130,246,0.35)' : 'none',
                  }}
                >
                  <div style={{ padding: 8 * scale, color: '#fff', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 13 * scale, fontWeight: 600, marginBottom: 6 * scale, opacity: 0.9 }}>{c.name}</div>
                    <div style={{ flex: 1, minHeight: 0 }}>
                      {c.type === 'card' && (
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                          <div style={{ fontSize: 28 * scale, fontWeight: 700, color: '#38bdf8' }}>1,234</div>
                          <div style={{ fontSize: 12 * scale, opacity: 0.7, marginTop: 4 * scale }}>实时数值</div>
                        </div>
                      )}
                      {c.type === 'text' && (
                        <div style={{ fontSize: 18 * scale, opacity: 0.85 }}>{c.name}</div>
                      )}
                      {['bar', 'line', 'area', 'pie'].includes(c.type) && (
                        <div style={{ width: '100%', height: '100%' }}>
                          <ChartRenderer
                            type={c.type as 'bar' | 'line' | 'area' | 'pie'}
                            data={c.type === 'pie' ? pieSampleData : chartSampleData}
                            xKey="name"
                            yKeys={c.type === 'pie' ? undefined : ['value', 'value2']}
                            height={c.h * scale}
                          />
                        </div>
                      )}
                      {c.type === 'image' && (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.08)', fontSize: 12 * scale, opacity: 0.6 }}>
                          <Image size={24 * scale} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* 右侧面板 */}
        <div
          style={{
            width: 280,
            background: '#fff',
            borderLeft: '1px solid var(--dae-border)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', borderBottom: '1px solid var(--dae-border)' }}>
            {[
              { key: 'property', label: '属性', icon: Settings },
              { key: 'data', label: '数据', icon: BarChart3 },
              { key: 'interaction', label: '交互', icon: Move },
              { key: 'canvas', label: '画布', icon: Maximize },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  className={`de-screen-tab ${activeRightTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveRightTab(tab.key as any)}
                  style={{ flex: 1, padding: '10px 0', fontSize: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div style={{ flex: 1, overflow: 'auto' }} className="dae-scroll">
            {activeRightTab === 'property' && selectedComp && (
              <>
                <ConfigSection title="基础信息">
                  <div className="dae-form-group" style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 12 }}>组件名称</label>
                    <input
                      className="dae-input"
                      style={{ fontSize: 13 }}
                      value={selectedComp.name}
                      onChange={(e) => updateComponent(selectedComp.id, { name: e.target.value })}
                    />
                  </div>
                  <div className="dae-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: 12 }}>组件类型</label>
                    <select
                      className="dae-input"
                      style={{ fontSize: 13 }}
                      value={selectedComp.type}
                      onChange={(e) => updateComponent(selectedComp.id, { type: e.target.value as ScreenCompType })}
                    >
                      {componentLibrary.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                    </select>
                  </div>
                </ConfigSection>

                <ConfigSection title="位置尺寸">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { label: 'X', key: 'x' },
                      { label: 'Y', key: 'y' },
                      { label: '宽度', key: 'w' },
                      { label: '高度', key: 'h' },
                    ].map((f) => (
                      <div className="dae-form-group" key={f.key} style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: 12 }}>{f.label}</label>
                        <input
                          className="dae-input"
                          type="number"
                          style={{ fontSize: 13 }}
                          value={selectedComp[f.key as keyof ScreenComponent] as number}
                          onChange={(e) => updateComponent(selectedComp.id, { [f.key]: parseInt(e.target.value, 10) || 0 })}
                        />
                      </div>
                    ))}
                  </div>
                </ConfigSection>

                <ConfigSection title="样式">
                  <div className="dae-form-group" style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 12 }}>背景色</label>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        type="color"
                        value="#102147"
                        onChange={() => {}}
                        style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }}
                      />
                      <input className="dae-input" value="#102147" style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} readOnly />
                    </div>
                  </div>
                  <div className="dae-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: 12 }}>圆角</label>
                    <input className="dae-input" type="number" style={{ fontSize: 13 }} defaultValue={6} />
                  </div>
                </ConfigSection>

                <ConfigSection title="操作">
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="dae-btn dae-btn-secondary dae-btn-sm" style={{ flex: 1 }} onClick={() => duplicateComponent(selectedComp.id)}>
                      <Copy size={12} />
                      复制
                    </button>
                    <button className="dae-btn dae-btn-secondary dae-btn-sm" style={{ flex: 1, color: '#ef4444' }} onClick={() => deleteComponent(selectedComp.id)}>
                      <Trash2 size={12} />
                      删除
                    </button>
                  </div>
                </ConfigSection>
              </>
            )}

            {activeRightTab === 'property' && !selectedComp && (
              <div style={{ fontSize: 13, color: 'var(--dae-ink-muted)', textAlign: 'center', padding: 40 }}>请在画布上选择一个组件</div>
            )}

            {activeRightTab === 'data' && selectedComp && (
              <>
                <ConfigSection title="数据源">
                  <div className="dae-form-group" style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 12 }}>数据集</label>
                    <select
                      className="dae-input"
                      style={{ fontSize: 13 }}
                      value={selectedComp.datasetName || ''}
                      onChange={(e) => updateComponent(selectedComp.id, { datasetName: e.target.value })}
                    >
                      {datasets.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="dae-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: 12 }}>数据刷新间隔</label>
                    <select className="dae-input" style={{ fontSize: 13 }} defaultValue="30">
                      <option value="0">手动刷新</option>
                      <option value="5">5 秒</option>
                      <option value="10">10 秒</option>
                      <option value="30">30 秒</option>
                      <option value="60">1 分钟</option>
                      <option value="300">5 分钟</option>
                    </select>
                  </div>
                </ConfigSection>

                <ConfigSection title="字段映射">
                  <div className="dae-form-group" style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 12 }}>维度字段</label>
                    <input className="dae-input" style={{ fontSize: 13 }} placeholder="如：订单日期" defaultValue="订单日期" />
                  </div>
                  <div className="dae-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: 12 }}>指标字段</label>
                    <input className="dae-input" style={{ fontSize: 13 }} placeholder="如：订单金额" defaultValue="订单金额" />
                  </div>
                </ConfigSection>

                <ConfigSection title="数据过滤">
                  <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)', marginBottom: 10 }}>支持按维度、时间等条件过滤数据</div>
                  <button className="dae-btn dae-btn-secondary dae-btn-sm" style={{ width: '100%' }}>
                    <Plus size={12} />
                    添加过滤条件
                  </button>
                </ConfigSection>
              </>
            )}

            {activeRightTab === 'data' && !selectedComp && (
              <div style={{ fontSize: 13, color: 'var(--dae-ink-muted)', textAlign: 'center', padding: 40 }}>请选择组件后配置数据</div>
            )}

            {activeRightTab === 'interaction' && selectedComp && (
              <>
                <ConfigSection title="交互事件">
                  <div className="dae-form-group" style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 12 }}>触发方式</label>
                    <select className="dae-input" style={{ fontSize: 13 }} defaultValue="click">
                      <option value="click">点击</option>
                      <option value="hover">悬停</option>
                    </select>
                  </div>
                  <div className="dae-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: 12 }}>交互类型</label>
                    <select className="dae-input" style={{ fontSize: 13 }} defaultValue="none">
                      <option value="none">无</option>
                      <option value="link">页面跳转</option>
                      <option value="screen">切换大屏</option>
                      <option value="component">联动组件</option>
                    </select>
                  </div>
                </ConfigSection>

                <ConfigSection title="联动配置">
                  <div style={{ fontSize: 12, color: 'var(--dae-ink-muted)', marginBottom: 10 }}>选择联动目标组件</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {config.components
                      .filter((c) => c.id !== selectedComp.id)
                      .map((c) => (
                        <label key={c.id} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                          <input type="checkbox" />
                          {c.name}
                        </label>
                      ))}
                  </div>
                </ConfigSection>

                <ConfigSection title="动画效果">
                  <div className="dae-form-group" style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 12 }}>入场动画</label>
                    <select className="dae-input" style={{ fontSize: 13 }} defaultValue="fade">
                      <option value="none">无</option>
                      <option value="fade">淡入</option>
                      <option value="scale">缩放</option>
                      <option value="slide">滑入</option>
                    </select>
                  </div>
                  <div className="dae-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: 12 }}>动画时长（秒）</label>
                    <input className="dae-input" type="number" style={{ fontSize: 13 }} defaultValue={0.6} step={0.1} />
                  </div>
                </ConfigSection>
              </>
            )}

            {activeRightTab === 'interaction' && !selectedComp && (
              <div style={{ fontSize: 13, color: 'var(--dae-ink-muted)', textAlign: 'center', padding: 40 }}>请选择组件后配置交互</div>
            )}

            {activeRightTab === 'canvas' && (
              <>
                <ConfigSection title="画布尺寸">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div className="dae-form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: 12 }}>宽度</label>
                      <input className="dae-input" type="number" style={{ fontSize: 13 }} value={config.width} onChange={(e) => updateConfig({ width: parseInt(e.target.value, 10) || 0 })} />
                    </div>
                    <div className="dae-form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: 12 }}>高度</label>
                      <input className="dae-input" type="number" style={{ fontSize: 13 }} value={config.height} onChange={(e) => updateConfig({ height: parseInt(e.target.value, 10) || 0 })} />
                    </div>
                  </div>
                </ConfigSection>

                <ConfigSection title="画布背景">
                  <div className="dae-form-group" style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 12 }}>背景颜色</label>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="color" value={config.bgColor} onChange={(e) => updateConfig({ bgColor: e.target.value })} style={{ width: 28, height: 28, border: '1px solid var(--dae-border)', borderRadius: 4, padding: 2, cursor: 'pointer' }} />
                      <input className="dae-input" value={config.bgColor} onChange={(e) => updateConfig({ bgColor: e.target.value })} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
                    </div>
                  </div>
                  <div className="dae-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: 12 }}>背景图片 URL</label>
                    <input className="dae-input" style={{ fontSize: 13 }} value={config.bgImage} onChange={(e) => updateConfig({ bgImage: e.target.value })} placeholder="请输入图片地址" />
                  </div>
                </ConfigSection>

                <ConfigSection title="网格设置">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <input id="gridEnabled" type="checkbox" checked={config.gridEnabled} onChange={(e) => updateConfig({ gridEnabled: e.target.checked })} />
                    <label htmlFor="gridEnabled" style={{ fontSize: 12, cursor: 'pointer' }}>显示网格</label>
                  </div>
                  <div className="dae-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: 12 }}>网格大小</label>
                    <input className="dae-input" type="number" style={{ fontSize: 13 }} value={config.gridSize} onChange={(e) => updateConfig({ gridSize: parseInt(e.target.value, 10) || 1 })} />
                  </div>
                </ConfigSection>

                <ConfigSection title="全局设置">
                  <div className="dae-form-group" style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 12 }}>大屏标题</label>
                    <input className="dae-input" style={{ fontSize: 13 }} value={config.name} onChange={(e) => updateConfig({ name: e.target.value })} />
                  </div>
                  <div className="dae-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: 12 }}>默认缩放</label>
                    <input className="dae-input" type="number" style={{ fontSize: 13 }} value={Math.round(scale * 100)} onChange={(e) => setScale((parseInt(e.target.value, 10) || 0) / 100)} />
                  </div>
                </ConfigSection>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
