import { DIMENSIONS, DIM_COLORS, STRENGTH_THRESHOLD } from '../data/content.js';

// CompareRadarChart: current (solid) vs previous (dashed)
export default function CompareRadarChart({ size = 320, currentScores = {}, previousScores = null }) {
  const padding = 28;
  const viewSize = size + padding * 2;
  const cx = viewSize / 2;
  const cy = viewSize / 2;
  const radius = size * 0.30;
  const levels = 5;

  const angles = DIMENSIONS.map((_, i) => (Math.PI * 2 * i) / 6 - Math.PI / 2);
  const getPoint = (angle, r) => ({
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  });

  const buildPoints = (scores) => DIMENSIONS.map((d, i) => {
    const score = scores?.[d.id] || 0;
    const r = (score / 100) * radius;
    return getPoint(angles[i], r);
  });

  const currPts = buildPoints(currentScores);
  const prevPts = previousScores ? buildPoints(previousScores) : null;
  const currPoly = currPts.map(p => `${p.x},${p.y}`).join(' ');
  const prevPoly = prevPts ? prevPts.map(p => `${p.x},${p.y}`).join(' ') : null;

  const labelRadius = radius + 44;
  const labelPoints = DIMENSIONS.map((_, i) => getPoint(angles[i], labelRadius));
  const STROKE_WIDTH = 2;

  return (
    <svg viewBox={`0 0 ${viewSize} ${viewSize}`} width={viewSize} height={viewSize} className="w-full max-w-[360px] h-auto mx-auto" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="currDataFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(30, 49, 88, 0.30)" />
          <stop offset="100%" stopColor="rgba(30, 49, 88, 0.30)" />
        </linearGradient>
      </defs>
      {Array.from({ length: levels }, (_, i) => {
        const r = (radius / levels) * (i + 1);
        const pts = angles.map(a => getPoint(a, r));
        const d = pts.map((p, j) => (j === 0 ? 'M' : 'L') + `${p.x},${p.y}`).join(' ') + 'Z';
        return <path key={`grid-${i}`} d={d} fill="none" stroke="rgba(15, 28, 54, 0.08)" strokeWidth="1" strokeDasharray={i === levels - 1 ? '0' : '4 3'} />;
      })}
      {angles.map((a, i) => {
        const outer = getPoint(a, radius);
        return <line key={`axis-${i}`} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="rgba(15, 28, 54, 0.10)" strokeWidth="1" />;
      })}
      {prevPts && (
        <>
          <path d={`M${prevPoly}Z`} fill="rgba(196, 159, 157, 0.30)" stroke="#AB8583" strokeWidth={STROKE_WIDTH} strokeDasharray="5 4" strokeLinejoin="round" />
          {prevPts.map((p, i) => <circle key={`prev-dot-${i}`} cx={p.x} cy={p.y} r="3" fill="none" stroke="#AB8583" strokeWidth={STROKE_WIDTH} />)}
        </>
      )}
      <path d={`M${currPoly}Z`} fill="url(#currDataFill)" stroke="rgba(30, 49, 88, 0.65)" strokeWidth={STROKE_WIDTH} strokeLinejoin="round" />
      {currPts.map((p, i) => {
        const dim = DIMENSIONS[i];
        const color = DIM_COLORS[dim.id];
        return <g key={`curr-dot-${i}`}><circle cx={p.x} cy={p.y} r="6" fill={color.fill} opacity="0.3" /><circle cx={p.x} cy={p.y} r="3.5" fill={color.stroke} /><circle cx={p.x} cy={p.y} r="1.5" fill="#fff" /></g>;
      })}
      {labelPoints.map((lp, i) => {
        const dim = DIMENSIONS[i];
        const score = currentScores[dim.id] || 0;
        const isStrong = score >= STRENGTH_THRESHOLD;
        let textAnchor = 'middle';
        if (lp.x < cx - 30) textAnchor = 'end';
        else if (lp.x > cx + 30) textAnchor = 'start';
        const dy = lp.y < cy - 20 ? '-0.3em' : lp.y > cy + 20 ? '1.3em' : '0.5em';
        return <g key={`label-${i}`}><text x={lp.x} y={lp.y} textAnchor={textAnchor} dominantBaseline="middle" dy={dy} style={{ fontSize: '11px', fill: isStrong ? '#5B8C5A' : '#D4956A', fontWeight: 600 }}>{score}</text><text x={lp.x} y={lp.y} textAnchor={textAnchor} dominantBaseline="middle" dy={dy === '-0.3em' ? '-1.6em' : dy === '1.3em' ? '2.6em' : '1.8em'} style={{ fontSize: '11.5px', fill: '#636366', fontWeight: 500 }}>{dim.name}</text></g>;
      })}
    </svg>
  );
}
