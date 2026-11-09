import { DIMENSIONS, DIM_COLORS, STRENGTH_THRESHOLD } from '../data/content.js';
import { Link } from 'react-router-dom';

/**
 * 六边形雷达图 SVG 组件
 * 低饱和协调色，强项绿底、弱项橙底，不用红色
 * @param {number} size - SVG 画布尺寸
 * @param {object} scores - 各维度分数对象 { dimId: number }
 */
export default function RadarChart({ size = 320, scores = {} }) {
  // 空状态判断：所有维度分数都是 0 或 undefined，视为无数据
  const hasAnyScore = DIMENSIONS.some(d => {
    const s = scores?.[d.id];
    return typeof s === 'number' && s > 0;
  });

  if (!hasAnyScore) {
    return (
      <div
        className="w-full max-w-[360px] mx-auto rounded-2xl border border-dashed border-ink-200 bg-ink-50/40 p-6 sm:p-8 flex flex-col items-center text-center"
        style={{ minHeight: size + 56 }}
      >
        <div className="w-14 h-14 rounded-2xl bg-white border border-ink-100 shadow-soft flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9FA0A5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <h3 className="mt-4 text-[15px] font-semibold text-ink-800 leading-snug">
          完成测评后查看你的能力雷达图
        </h3>
        <p className="mt-1.5 text-[12.5px] text-ink-500 leading-relaxed max-w-[28ch]">
          答完 25 道题，系统会生成六维能力分析和针对性补强建议。
        </p>
        <Link
          to="/assessment-intro"
          className="mt-5 btn-primary text-[13px] px-4 py-2 inline-flex items-center gap-1.5"
        >
          开始测评
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/>
            <path d="M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>
    );
  }

  const padding = 28;
  const viewSize = size + padding * 2;
  const cx = viewSize / 2;
  const cy = viewSize / 2;
  const radius = size * 0.30;
  const levels = 5; // 4 层同心环 + 中心

  // 六边形顶点角度 (从顶部顺时针)
  const angles = DIMENSIONS.map((_, i) => (Math.PI * 2 * i) / 6 - Math.PI / 2);

  // 顶点坐标
  const getPoint = (angle, r) => ({
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  });

  // 数据多边形顶点
  const dataPoints = DIMENSIONS.map((d, i) => {
    const score = scores[d.id] || 0;
    const r = (score / 100) * radius;
    return getPoint(angles[i], r);
  });

  const dataPolygonPoints = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  // 标签位置 (比数据多边形稍远)
  const labelRadius = radius + 44;
  const labelPoints = DIMENSIONS.map((_, i) => getPoint(angles[i], labelRadius));

  return (
    <svg
      viewBox={`0 0 ${viewSize} ${viewSize}`}
      width={viewSize}
      height={viewSize}
      className="w-full max-w-[360px] h-auto mx-auto"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* 数据多边形渐变填充 */}
        <linearGradient id="dataFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(30, 49, 88, 0.10)" />
          <stop offset="100%" stopColor="rgba(30, 49, 88, 0.04)" />
        </linearGradient>
      </defs>

      {/* 同心网格环 */}
      {Array.from({ length: levels }, (_, i) => {
        const r = (radius / levels) * (i + 1);
        const pts = angles.map(a => getPoint(a, r));
        const d = pts.map((p, j) => (j === 0 ? 'M' : 'L') + `${p.x},${p.y}`).join(' ') + 'Z';
        return (
          <path
            key={`grid-${i}`}
            d={d}
            fill="none"
            stroke="rgba(15, 28, 54, 0.08)"
            strokeWidth="1"
            strokeDasharray={i === levels - 1 ? '0' : '4 3'}
          />
        );
      })}

      {/* 轴线 */}
      {angles.map((a, i) => {
        const outer = getPoint(a, radius);
        return (
          <line
            key={`axis-${i}`}
            x1={cx}
            y1={cy}
            x2={outer.x}
            y2={outer.y}
            stroke="rgba(15, 28, 54, 0.10)"
            strokeWidth="1"
          />
        );
      })}

      {/* 数据多边形 - 填充 */}
      <path
        d={`M${dataPolygonPoints}Z`}
        fill="url(#dataFill)"
        stroke="rgba(30, 49, 88, 0.30)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* 数据点 - 每个维度用各自低饱和色 */}
      {dataPoints.map((p, i) => {
        const dim = DIMENSIONS[i];
        const color = DIM_COLORS[dim.id];
        const score = scores[dim.id] || 0;
        const isStrong = score >= STRENGTH_THRESHOLD;

        return (
          <g key={`dot-${i}`}>
            {/* 外环光晕 */}
            <circle
              cx={p.x}
              cy={p.y}
              r="6"
              fill={color.fill}
              opacity="0.25"
            />
            {/* 实心点 */}
            <circle
              cx={p.x}
              cy={p.y}
              r="3.5"
              fill={color.stroke}
            />
            {/* 中心白点 */}
            <circle
              cx={p.x}
              cy={p.y}
              r="1.5"
              fill="#fff"
            />
          </g>
        );
      })}

      {/* 维度标签 */}
      {labelPoints.map((lp, i) => {
        const dim = DIMENSIONS[i];
        const score = scores[dim.id] || 0;
        const color = DIM_COLORS[dim.id];
        const isStrong = score >= STRENGTH_THRESHOLD;

        // 计算文字锚点
        let textAnchor = 'middle';
        if (lp.x < cx - 30) textAnchor = 'end';
        else if (lp.x > cx + 30) textAnchor = 'start';

        const dy = lp.y < cy - 20 ? '-0.3em' : lp.y > cy + 20 ? '1.3em' : '0.5em';

        return (
          <g key={`label-${i}`}>
            {/* 分数标签 */}
            <text
              x={lp.x}
              y={lp.y}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              dy={dy}
              className="font-sans"
              style={{ fontSize: '11px', fill: isStrong ? '#5B8C5A' : '#D4956A', fontWeight: 600 }}
            >
              {score}
            </text>
            {/* 维度名 */}
            <text
              x={lp.x}
              y={lp.y}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              dy={dy === '-0.3em' ? '-1.6em' : dy === '1.3em' ? '2.6em' : '1.8em'}
              className="font-sans"
              style={{ fontSize: '11.5px', fill: '#636366', fontWeight: 500 }}
            >
              {dim.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}