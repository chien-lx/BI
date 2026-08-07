import React, { useMemo } from 'react';
import { ArrowLeft, Monitor, Maximize, BarChart3 } from 'lucide-react';
import ChartRenderer from '../../../components/ChartRenderer';
import { dataScreens, chartSampleData, pieSampleData, type DataScreenComponent } from '../../../data/mockData';
import { useHashParams } from '@/common/useHashParams';

function parseResolution(resolution: string) {
  const [width, height] = resolution.split('×').map((v) => parseInt(v, 10));
  return { width: width || 1920, height: height || 1080 };
}

function PreviewCard({ name, scale }: { name: string; scale: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', padding: 12 * scale }}>
      <div style={{ fontSize: 14 * scale, opacity: 0.8, marginBottom: 6 * scale }}>{name}</div>
      <div style={{ fontSize: 32 * scale, fontWeight: 700, color: '#38bdf8', marginBottom: 4 * scale }}>1,234</div>
      <div style={{ fontSize: 12 * scale, opacity: 0.6 }}>较昨日 +12.5%</div>
    </div>
  );
}

function PreviewComponent({ comp, scale }: { comp: DataScreenComponent; scale: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: comp.x * scale,
        top: comp.y * scale,
        width: comp.w * scale,
        height: comp.h * scale,
        background: comp.type === 'card' ? 'rgba(16, 33, 71, 0.72)' : 'rgba(16, 33, 71, 0.55)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 6,
        overflow: 'hidden',
        color: '#fff',
      }}
    >
      {comp.type === 'card' && <PreviewCard name={comp.name} scale={scale} />}
      {comp.type === 'text' && (
        <div style={{ padding: 12 * scale, fontSize: 18 * scale, fontWeight: 600, opacity: 0.9 }}>{comp.name}</div>
      )}
      {['bar', 'line', 'area', 'pie'].includes(comp.type) && (
        <div style={{ width: '100%', height: '100%', padding: 8 * scale }}>
          <div style={{ fontSize: 13 * scale, fontWeight: 600, marginBottom: 6 * scale, opacity: 0.9 }}>{comp.name}</div>
          <ChartRenderer
            type={comp.type as 'bar' | 'line' | 'area' | 'pie'}
            data={comp.type === 'pie' ? pieSampleData : chartSampleData}
            xKey="name"
            yKeys={comp.type === 'pie' ? undefined : ['value', 'value2']}
            height={comp.h * scale - 28 * scale}
          />
        </div>
      )}
      {comp.type === 'image' && (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.08)', fontSize: 12 * scale, opacity: 0.6 }}>
          图片占位
        </div>
      )}
    </div>
  );
}

export default function DataScreenPreviewPage() {
  const hashParams = useHashParams();
  const screenId = hashParams['screenId'];
  const screen = useMemo(() => dataScreens.find((s) => s.id === screenId) || dataScreens[0], [screenId]);
  const { width, height } = parseResolution(screen.resolution);

  // 根据容器尺寸自动计算缩放，保持比例并留边距
  const scale = 0.55;

  const goBack = () => {
    window.location.hash = 'page=data-screen';
  };

  const components = screen.components || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#0f172a' }}>
      {/* 顶部栏 */}
      <div
        style={{
          height: 54,
          background: 'rgba(11, 17, 33, 0.95)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={goBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'transparent',
              color: '#fff',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={14} />
            返回列表
          </button>
          <h1 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: 0 }}>{screen.name}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Monitor size={14} />
            <span>{screen.resolution}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Maximize size={14} />
            <span>{Math.round(scale * 100)}%</span>
          </div>
        </div>
      </div>

      {/* 画布区 */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 30,
        }}
        className="dae-scroll"
      >
        {components.length === 0 ? (
          <div className="dae-empty" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <BarChart3 size={48} />
            <p>该大屏暂无组件</p>
          </div>
        ) : (
          <div
            style={{
              width: width * scale,
              height: height * scale,
              background: screen.bgColor || '#0b1121',
              backgroundImage: screen.bgImage ? `url(${screen.bgImage})` : undefined,
              backgroundSize: 'cover',
              position: 'relative',
              boxShadow: '0 20px 80px rgba(0,0,0,0.6)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                backgroundSize: `${20 * scale}px ${20 * scale}px`,
              }}
            />
            {components.map((comp) => (
              <PreviewComponent key={comp.id} comp={comp} scale={scale} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
