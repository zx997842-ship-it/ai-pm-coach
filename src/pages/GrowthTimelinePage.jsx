import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo.jsx';
import {
  DIMENSIONS,
  DIM_COLORS,
  getTotalScore,
  getAllSnapshots,
} from '../data/content.js';

function formatDate(ts) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatFullDate(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * 时间轴节点：左侧节点图标 + 右侧内容（日期 + 总分 + 6维度得分 + 维度得分变化亮点）
 * 每个快照之间绘制连接线
 */
export default function GrowthTimelinePage() {
  const snapshots = useMemo(() => (getAllSnapshots() || []).sort((a, b) => a.takenAt - b.takenAt), []);
  const hasData = snapshots.length > 0;

  // 维度整体趋势（从最早到最新的 delta）
  const dimTrend = useMemo(() => {
    if (snapshots.length < 2) return [];
    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];
    return DIMENSIONS.map((d) => ({
      id: d.id,
      name: d.name,
      start: first.scores?.[d.id] ?? 0,
      end: last.scores?.[d.id] ?? 0,
      delta: (last.scores?.[d.id] ?? 0) - (first.scores?.[d.id] ?? 0),
      color: DIM_COLORS[d.id],
    }));
  }, [snapshots]);

  // 趋势 SVG 迷你图（6条折线，每条代表一个维度）
  const TrendMiniChart = () => {
    if (snapshots.length < 2) return null;
    const w = 520;
    const h = 180;
    const padL = 36;
    const padR = 20;
    const padT = 20;
    const padB = 24;
    const innerW = w - padL - padR;
    const innerH = h - padT - padB;
    const maxX = snapshots.length - 1;

    const toX = (i) => padL + (maxX === 0 ? 0 : (innerW * i) / maxX);
    const toY = (v) => padT + innerH - (innerH * v) / 100;

    return (
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" minWidth="440" height="auto" className="w-full">
          {/* 背景网格 */}
          {[0, 25, 50, 75, 100].map((val) => (
            <g key={val}>
              <line
                x1={padL} x2={w - padR}
                y1={toY(val)} y2={toY(val)}
                stroke="rgba(15,28,54,0.08)" strokeDasharray="3 3"
              />
              <text x={padL - 6} y={toY(val) + 4} style={{ fontSize: '10px', fill: '#8E8E93', textAnchor: 'end' }}>
                {val}
              </text>
            </g>
          ))}
          {/* 6条折线 */}
          {DIMENSIONS.map((d) => {
            const pts = snapshots.map((s, i) => ({
              x: toX(i),
              y: toY(s.scores?.[d.id] || 0),
            }));
            const dpath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
            const color = DIM_COLORS[d.id]?.stroke || '#1E3158';
            return (
              <path
                key={d.id}
                d={dpath}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.85"
              />
            );
          })}
          {/* 每个节点画一个圆点（用总分色） */}
          {snapshots.map((s, i) => (
            <circle
              key={`node-${i}`}
              cx={toX(i)}
              cy={toY(getTotalScore(s.scores || {}))}
              r="3"
              fill="#1E3158"
              stroke="#fff"
              strokeWidth="1.5"
            />
          ))}
          {/* X轴日期标注（等间距抽 3-5 个点） */}
          {snapshots.map((s, i) => {
            const total = snapshots.length;
            const step = Math.max(1, Math.ceil(total / 4));
            if (i !== 0 && i !== total - 1 && i % step !== 0) return null;
            return (
              <text
                key={`lbl-${i}`}
                x={toX(i)}
                y={h - 6}
                style={{ fontSize: '10.5px', fill: '#8E8E93', textAnchor: 'middle' }}
              >
                {formatDate(s.takenAt)}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen notion-grid-bg flex flex-col">
      {/* Top nav */}
      <header className="w-full bg-warm-white/80 backdrop-blur-sm border-b border-ink-100/60 z-10">
        <div className="section-inner py-4 flex items-center justify-between">
          <BrandLogo />
          <Link
            to="/results"
            className="text-[13.5px] text-ink-700 hover:text-deep-navy-600 transition-colors inline-flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"/>
              <path d="M12 19l-7-7 7-7"/>
            </svg>
            返回测评报告
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="section-inner py-10 sm:py-14 w-full">
          {/* 标题 */}
          <div className="text-center mb-10">
            <span className="inline-block text-[12.5px] font-medium uppercase tracking-widest text-deep-navy-600 mb-3">
              Growth Timeline
            </span>
            <h1 className="font-serif text-ink-900 tracking-tightserif font-semibold
                           text-[28px] sm:text-[36px] leading-[1.15]">
              你的<span className="text-deep-navy-600">完整成长曲线</span>
            </h1>
            <p className="mt-4 text-[14px] text-ink-600 max-w-xl mx-auto leading-relaxed">
              共记录了 <strong className="text-ink-900">{snapshots.length}</strong> 次测评，
              从 <strong>{snapshots[0] ? formatFullDate(snapshots[0].takenAt) : '--'}</strong>
              到 <strong>{snapshots[snapshots.length - 1] ? formatFullDate(snapshots[snapshots.length - 1].takenAt) : '--'}</strong>
            </p>
          </div>

          {!hasData ? (
            <div className="card p-10 text-center">
              <p className="text-[14px] text-ink-500">暂无历史记录，完成至少一次测评后即可生成成长曲线。</p>
              <Link to="/assessment" className="btn-primary mt-6 inline-flex items-center">
                开始第一次测评
              </Link>
            </div>
          ) : (
            <>
              {/* 维度整体趋势卡 */}
              {dimTrend.length > 0 && (
                <div className="card p-5 sm:p-7 mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E3158" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3v18h18"/>
                      <path d="M7 14l4-4 4 4 5-5"/>
                    </svg>
                    <h3 className="font-serif text-ink-900 text-[16px] font-semibold tracking-tightserif">
                      整体趋势图 · 各维度随时间变化
                    </h3>
                    <div className="flex flex-wrap gap-3 ml-auto">
                      {DIMENSIONS.map((d) => {
                        const color = DIM_COLORS[d.id];
                        return (
                          <span key={d.id} className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-600">
                            <span className="w-3 h-1 rounded-full" style={{ backgroundColor: color.stroke }} />
                            {d.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <TrendMiniChart />
                </div>
              )}

              {/* 维度累计进步总览 */}
              {dimTrend.length > 0 && (
                <div className="card p-5 sm:p-7 mb-8">
                  <h3 className="font-serif text-ink-900 text-[16px] font-semibold tracking-tightserif mb-4">
                    从首次到最新 · 各维度进步一览
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dimTrend.map((d) => (
                      <div key={d.id} className="rounded-xl border border-ink-100 bg-white/70 p-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: d.color.stroke }}
                          />
                          <h4 className="text-[13.5px] font-semibold text-ink-900">{d.name}</h4>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[13px] text-ink-500 line-through">{d.start}分</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>
                          <span className="text-[18px] font-bold text-ink-900">{d.end}分</span>
                          <span
                            className={`ml-auto px-2 py-0.5 rounded-full text-[11.5px] font-semibold ${
                              d.delta > 0
                                ? 'bg-emerald-50 text-emerald-600'
                                : d.delta < 0
                                ? 'bg-red-50 text-red-500'
                                : 'bg-ink-100 text-ink-600'
                            }`}
                          >
                            {d.delta > 0 ? `+${d.delta}` : d.delta}
                          </span>
                        </div>
                        {/* 进度条 */}
                        <div className="w-full h-2 rounded-full bg-ink-100 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.max(0, Math.min(100, d.end))}%`,
                              backgroundColor: d.color.stroke,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 时间轴节点详情 */}
              <div className="card p-5 sm:p-7">
                <h3 className="font-serif text-ink-900 text-[16px] font-semibold tracking-tightserif mb-6">
                  测评时间轴
                </h3>
                <div className="relative">
                  {/* 纵向连接线 */}
                  <div className="absolute left-[19px] top-2 bottom-2 w-px bg-ink-200" />

                  <div className="flex flex-col gap-6">
                    {[...snapshots].reverse().map((snap, idx) => {
                      const realIdx = snapshots.length - 1 - idx;
                      const prev = realIdx > 0 ? snapshots[realIdx - 1] : null;
                      const deltaTotal = prev ? snap.totalScore - prev.totalScore : null;
                      const isLatest = realIdx === snapshots.length - 1;

                      // 找到进步最大的维度
                      let bestDim = null;
                      let bestDelta = -999;
                      if (prev) {
                        DIMENSIONS.forEach((d) => {
                          const c = snap.scores?.[d.id] ?? 0;
                          const p = prev.scores?.[d.id] ?? 0;
                          if (c - p > bestDelta) {
                            bestDelta = c - p;
                            bestDim = { id: d.id, name: d.name, delta: c - p, curr: c };
                          }
                        });
                      }

                      return (
                        <div key={snap.id} className="flex gap-4 relative">
                          {/* 节点圆点 */}
                          <div
                            className={`shrink-0 w-[38px] h-[38px] rounded-full flex items-center justify-center border-4 ${
                              isLatest
                                ? 'bg-deep-navy-600 border-deep-navy-100'
                                : 'bg-white border-ink-100'
                            }`}
                            style={{ zIndex: 1 }}
                          >
                            <span className={`text-[11.5px] font-bold ${isLatest ? 'text-white' : 'text-ink-700'}`}>
                              #{realIdx + 1}
                            </span>
                          </div>
                          {/* 卡片 */}
                          <div className="flex-1 rounded-xl border border-ink-100 bg-white/80 p-4 sm:p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-[15px] font-semibold text-ink-900">
                                    第 {realIdx + 1} 次测评
                                  </h4>
                                  {isLatest && (
                                    <span className="text-[10.5px] px-1.5 py-0.5 rounded-full bg-deep-navy-600 text-white font-medium">
                                      最新
                                    </span>
                                  )}
                                </div>
                                <p className="text-[12px] text-ink-500">{formatFullDate(snap.takenAt)}</p>
                              </div>
                              <div className="flex flex-col items-end">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-[22px] font-bold text-deep-navy-600">{snap.totalScore}</span>
                                  <span className="text-[12px] text-ink-500">总分</span>
                                </div>
                                {deltaTotal !== null && (
                                  <div
                                    className={`mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11.5px] font-semibold ${
                                      deltaTotal > 0
                                        ? 'bg-emerald-50 text-emerald-600'
                                        : deltaTotal < 0
                                        ? 'bg-red-50 text-red-500'
                                        : 'bg-ink-100 text-ink-600'
                                    }`}
                                  >
                                    {deltaTotal > 0 ? (
                                      <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>+{deltaTotal}</>
                                    ) : deltaTotal < 0 ? (
                                      <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>{deltaTotal}</>
                                    ) : ('持平')}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 6维度得分网格 */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-3">
                              {DIMENSIONS.map((d) => {
                                const sc = snap.scores?.[d.id] ?? 0;
                                const color = DIM_COLORS[d.id];
                                const prevSc = prev ? (prev.scores?.[d.id] ?? 0) : null;
                                const diff = prevSc !== null ? sc - prevSc : null;
                                return (
                                  <div key={d.id} className="rounded-lg border border-ink-100 p-2.5 flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color.stroke }} />
                                      <span className="text-[11px] text-ink-600 font-medium truncate">{d.name}</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                      <span className="text-[15px] font-bold" style={{ color: color.stroke }}>{sc}</span>
                                      {diff !== null && (
                                        <span
                                          className={`text-[10.5px] font-semibold ${
                                            diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-red-500' : 'text-ink-400'
                                          }`}
                                        >
                                          {diff > 0 ? `+${diff}` : diff}
                                        </span>
                                      )}
                                    </div>
                                    <div className="w-full h-1 rounded-full bg-ink-100 overflow-hidden">
                                      <div
                                        className="h-full rounded-full"
                                        style={{
                                          width: `${Math.max(0, Math.min(100, sc))}%`,
                                          backgroundColor: color.stroke,
                                        }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* 亮点一句总结 */}
                            {bestDim && bestDim.delta !== 0 && (
                              <p className="text-[12px] text-ink-500 flex items-center gap-1.5">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polygon points="12 2 15 9 22 9 17 13.5 19 21 12 17 5 21 7 13.5 2 9 9 9"/>
                                </svg>
                                {bestDim.delta > 0
                                  ? `${bestDim.name} 提升最明显（+${bestDim.delta}分）`
                                  : `注意：${bestDim.name} 下滑 ${-bestDim.delta}分，需要针对性加强`
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 返回操作 */}
              <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
                <Link to="/" className="btn-outline min-w-[180px]">
                  回到首页
                </Link>
                <Link to="/assessment" className="btn-primary min-w-[180px]">
                  立即再次测评
                  <svg className="ml-2 w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/>
                    <path d="M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="w-full">
        <div className="section-inner py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12.5px] text-ink-500">
          <span>© {new Date().getFullYear()} AI PM Coach · 记录你成长的每一步</span>
          <Link to="/" className="hover:text-deep-navy-600 transition-colors">← 回到首页</Link>
        </div>
      </footer>
    </div>
  );
}
