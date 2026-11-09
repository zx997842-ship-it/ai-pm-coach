import { useState } from 'react';

/**
 * 总分历史趋势折线图
 * 使用纯 SVG 实现，风格与项目其他图表组件保持一致
 * @param {array} snapshots - 快照数组 [{ totalScore: number, takenAt: number }]
 * @param {number} width - SVG 宽度
 * @param {number} height - SVG 高度
 */
export default function ScoreTrendChart({ snapshots = [], width = 600, height = 180 }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // 只有 1 条快照时不绘制折线图（无法展示趋势）
  if (!snapshots || snapshots.length < 2) {
    return (
      <div className="w-full max-w-[600px] mx-auto rounded-2xl border border-dashed border-ink-200 bg-ink-50/40 p-6 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-xl bg-white border border-ink-100 shadow-soft flex items-center justify-center mb-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9FA0A5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <h3 className="text-[14px] font-semibold text-ink-800 leading-snug">
          完成更多测评后查看你的进步趋势
        </h3>
        <p className="mt-1 text-[12px] text-ink-500 leading-relaxed">
          再次完成测评，这里会展示你每次的总分变化。
        </p>
      </div>
    );
  }

  // 按时间排序（确保从左到右递增）
  const sortedSnapshots = [...snapshots].sort((a, b) => a.takenAt - b.takenAt);
  
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // Y 轴范围（0 - 100）
  const yMin = 0;
  const yMax = 100;
  
  // 计算每个数据点的坐标
  const dataPoints = sortedSnapshots.map((snap, index) => {
    const x = padding.left + (index / (sortedSnapshots.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - ((snap.totalScore - yMin) / (yMax - yMin)) * chartHeight;
    return {
      x,
      y,
      score: snap.totalScore,
      date: new Date(snap.takenAt),
      takenAt: snap.takenAt,
    };
  });

  // 生成折线路径
  const pathData = dataPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Y 轴刻度（0, 25, 50, 75, 100）
  const yTicks = [0, 25, 50, 75, 100];

  // 格式化日期（MM/DD）
  const formatDate = (date) => {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return `${m}/${d}`;
  };

  return (
    <div className="w-full max-w-[640px] mx-auto rounded-2xl border border-ink-100 bg-white/70 p-5 sm:p-6">
      <h3 className="font-serif text-ink-900 text-[16px] font-semibold tracking-tightserif mb-3">
        你的能力成长轨迹
      </h3>
      
      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height={height}
          className="overflow-visible"
        >
          {/* 背景网格线 */}
          {yTicks.map((tick) => {
            const y = padding.top + chartHeight - ((tick - yMin) / (yMax - yMin)) * chartHeight;
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#F0F0F2"
                  strokeWidth="1"
                  strokeDasharray={tick === 50 ? '4 4' : '0'}
                />
                <text
                  x={padding.left - 8}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fill="#9FA0A5"
                  fontSize="10"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Y 轴标签 */}
          <text
            x={padding.left - 8}
            y={padding.top - 8}
            textAnchor="end"
            fill="#636366"
            fontSize="10"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="500"
          >
            分数
          </text>

          {/* 折线 */}
          <path
            d={pathData}
            fill="none"
            stroke="#1E3158"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 渐变填充区域（可选，增加视觉层次） */}
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E3158" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#1E3158" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`${pathData} L ${dataPoints[dataPoints.length - 1].x} ${padding.top + chartHeight} L ${dataPoints[0].x} ${padding.top + chartHeight} Z`}
            fill="url(#trendGradient)"
          />

          {/* 数据点 */}
          {dataPoints.map((p, i) => (
            <g
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* 外圈白色描边 */}
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === i ? 7 : 5}
                fill="white"
                stroke="#1E3158"
                strokeWidth="2"
                className="transition-all duration-150"
              />
              
              {/* 悬浮提示框 */}
              {hoveredIndex === i && (
                <g>
                  {/* 连接线 */}
                  <line
                    x1={p.x}
                    y1={p.y}
                    x2={p.x}
                    y2={p.y - 40}
                    stroke="#1E3158"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  
                  {/* 提示框背景 */}
                  <rect
                    x={p.x - 40}
                    y={p.y - 68}
                    width="80"
                    height="52"
                    rx="8"
                    ry="8"
                    fill="#1E3158"
                  />
                  
                  {/* 日期文字 */}
                  <text
                    x={p.x}
                    y={p.y - 52}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.7)"
                    fontSize="10"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {formatDate(p.date)}
                  </text>
                  
                  {/* 分数文字 */}
                  <text
                    x={p.x}
                    y={p.y - 34}
                    textAnchor="middle"
                    fill="white"
                    fontSize="16"
                    fontWeight="bold"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {p.score} 分
                  </text>
                </g>
              )}
            </g>
          ))}

          {/* X 轴日期标签（取首尾和中间点） */}
          {dataPoints.map((p, i) => {
            // 显示第一个、最后一个和中间的日期，避免拥挤
            const isFirst = i === 0;
            const isLast = i === dataPoints.length - 1;
            const isMiddle = i === Math.floor(dataPoints.length / 2);
            
            if (!isFirst && !isLast && !isMiddle) return null;
            
            return (
              <text
                key={`date-${i}`}
                x={p.x}
                y={height - 8}
                textAnchor="middle"
                fill="#636366"
                fontSize="10"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {formatDate(p.date)}
              </text>
            );
          })}
        </svg>
      </div>

      {/* 底部统计信息 */}
      <div className="mt-4 pt-3 border-t border-ink-100/60 flex items-center justify-between text-[12px]">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-ink-500">测评次数</span>
            <span className="ml-1.5 font-semibold text-ink-800">{snapshots.length}</span>
          </div>
          {snapshots.length >= 2 && (
            <div className="flex items-center gap-1.5">
              <span className="text-ink-500">进步幅度</span>
              <span className={`font-semibold ${snapshots[snapshots.length - 1].totalScore >= snapshots[0].totalScore ? 'text-green-600' : 'text-orange-500'}`}>
                {snapshots[snapshots.length - 1].totalScore >= snapshots[0].totalScore ? '+' : ''}
                {snapshots[snapshots.length - 1].totalScore - snapshots[0].totalScore} 分
              </span>
            </div>
          )}
        </div>
        <div className="text-ink-400">
          当前最高分：{Math.max(...snapshots.map(s => s.totalScore))} 分
        </div>
      </div>
    </div>
  );
}
