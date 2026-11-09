import { useMemo } from 'react';
import { DIM_COLORS, STRENGTH_THRESHOLD, REAL_QUESTIONS } from '../data/content.js';

/**
 * G2-4 & G2-1: 维度分数可解释 Modal
 *
 * 显示内容：
 * 1) 答题统计：答了 X 道（高难度 Y 道）、答对 Z 道、答错 W 道
 * 2) 分数构成（按用户要求）：
 *    基础分 50 × 0.5 + 本次贡献 × 0.5 = 当前分数
 * 3) G2-1 评分依据（3-4 个标准，每题映射为一个标准的得分，用选择题数据做合理映射）：
 *    - 思路清晰度 / 关键点覆盖 / 难度挑战 / 基础稳健性
 * 4) 重测这个维度按钮
 * 5) 小字："你的反馈会用于改进评分模型"
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {()=>void} props.onClose
 * @param {string} props.dimId
 * @param {string} props.dimName
 * @param {number} props.score  - 当前维度得分 0-100
 * @param {Array}  props.records - 本维度答题记录（来自全局 answer history，带 questionId）
 * @param {(dimId:string)=>void} [props.onRetakeDimension]
 */
export default function ScoreBreakdownModal({
  open,
  onClose,
  dimId,
  dimName,
  score = 0,
  records = [],
  onRetakeDimension,
}) {
  const color = DIM_COLORS[dimId] || { fill: '#8FA8C4', stroke: '#6E8BAA', bg: '#E8EFF5' };
  const isStrong = score >= STRENGTH_THRESHOLD;

  // ========== 答题统计 ==========
  const stats = useMemo(() => {
    const total = records.length;
    const hardQ = records.filter(r => {
      const q = REAL_QUESTIONS.find(x => x.id === r.questionId);
      return q && q.difficulty >= 4;
    }).length;
    const correct = records.filter(r => r.isCorrect).length;
    const wrong = total - correct;
    return { total, hardQ, correct, wrong };
  }, [records]);

  // ========== 分数构成（按用户要求的公式） ==========
  // 公式：基础分 50 × 0.5 + 本次贡献 × 0.5 = 当前分数
  // 反推出"本次贡献"，并展示给用户
  const scoreBreakdown = useMemo(() => {
    const base = 50;
    const basePart = Math.round(base * 0.5); // 25
    const currentPart = Math.max(0, score - basePart); // 当前分数剩下的来自"本次贡献"
    // 反推出本次贡献值: contribution × 0.5 = currentPart → contribution = currentPart * 2
    const contribution = Math.round(currentPart * 2);
    const recomputed = basePart + Math.round(contribution * 0.5);
    return {
      base,
      basePart,
      contribution,
      contributionPart: Math.round(contribution * 0.5),
      final: recomputed,
    };
  }, [score]);

  // ========== G2-1 评分依据（3-4 个标准，把选择题数据做合理映射） ==========
  // 因为本产品是选择题不是情景题开放问答，所以我们基于实际答题表现构造 4 个评估维度：
  //   1) 基础稳健性（难度≤2 题的正确率）→ 20分
  //   2) 关键点覆盖（中等难度 3 题的正确率）→ 20分
  //   3) 难度挑战（难度≥4 题的正确率）→ 30分
  //   4) 思路清晰度（整体正确率映射）→ 30分
  const criteria = useMemo(() => {
    const byDiff = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    records.forEach(r => {
      const q = REAL_QUESTIONS.find(x => x.id === r.questionId);
      const d = q ? q.difficulty : 3;
      byDiff[Math.min(5, Math.max(1, d))].push(r);
    });
    const acc = (arr) => {
      if (!arr || arr.length === 0) return null; // 没答过这个难度，标记为"—"
      return arr.filter(r => r.isCorrect).length / arr.length;
    };

    // 1. 基础稳健性（难度 1-2）
    const basic = [...(byDiff[1] || []), ...(byDiff[2] || [])];
    const basicAcc = acc(basic);
    const basicScore = basicAcc == null ? 0 : Math.round(basicAcc * 20);
    const basicOutOf = basic.length === 0 ? '—' : `${basicScore}/20`;

    // 2. 关键点覆盖（难度 3）
    const mid = byDiff[3] || [];
    const midAcc = acc(mid);
    const midScore = midAcc == null ? 0 : Math.round(midAcc * 20);
    const midOutOf = mid.length === 0 ? '—' : `${midScore}/20`;

    // 3. 难度挑战（难度 4-5）
    const hard = [...(byDiff[4] || []), ...(byDiff[5] || [])];
    const hardAcc = acc(hard);
    const hardScore = hardAcc == null ? 0 : Math.round(hardAcc * 30);
    const hardOutOf = hard.length === 0 ? '—' : `${hardScore}/30`;

    // 4. 思路清晰度（整体正确率，满分 30）
    const overallAcc = acc(records);
    const overallScore = overallAcc == null ? 0 : Math.round(overallAcc * 30);
    const overallOutOf = records.length === 0 ? '—' : `${overallScore}/30`;

    const totalGot = basicScore + midScore + hardScore + overallScore;
    const totalMax = 100;

    return [
      {
        name: '基础稳健性',
        desc: '简单题（难度1-2）的正确率，代表知识底盘是否扎实',
        score: basicScore,
        max: 20,
        outOf: basicOutOf,
      },
      {
        name: '关键点覆盖',
        desc: '中等难度题（难度3）的正确率，代表是否掌握了核心考点',
        score: midScore,
        max: 20,
        outOf: midOutOf,
      },
      {
        name: '难度挑战',
        desc: '高难度题（难度4-5）的正确率，代表突破能力上限的潜力',
        score: hardScore,
        max: 30,
        outOf: hardOutOf,
      },
      {
        name: '思路清晰度',
        desc: '整体答题正确率，综合反映知识体系的完整性',
        score: overallScore,
        max: 30,
        outOf: overallOutOf,
      },
      {
        name: '评分依据合计',
        desc: '四项加权合计（用于交叉校验 CAT 给出的最终分数）',
        score: totalGot,
        max: totalMax,
        outOf: `${totalGot}/${totalMax}`,
        isTotal: true,
      },
    ];
  }, [records]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6"
      role="dialog"
      aria-modal="true"
    >
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* 弹框 */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-[0_20px_60px_rgba(15,28,54,0.18)] border border-ink-100 overflow-hidden">
        {/* 头部 */}
        <div
          className="px-5 sm:px-6 py-4 border-b border-ink-100 flex items-center justify-between gap-3"
          style={{ background: `linear-gradient(180deg, ${color.bg}, rgba(255,255,255,0))` }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-[16px] font-bold"
              style={{ backgroundColor: isStrong ? '#EAF2EA' : '#FDF0E8', color: isStrong ? '#5B8C5A' : '#D4956A' }}
            >
              {score}
            </div>
            <div className="min-w-0">
              <h3 className="text-[15px] sm:text-[16px] font-semibold text-ink-900 leading-snug truncate">
                {dimName} · 分数构成
              </h3>
              <p className="mt-0.5 text-[11.5px] text-ink-500 leading-relaxed">
                这个分数是怎么算出来的
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg shrink-0 inline-flex items-center justify-center text-ink-500 hover:text-ink-700 hover:bg-ink-50 transition-colors"
            aria-label="关闭"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* 内容区：可滚动 */}
        <div className="max-h-[70vh] overflow-y-auto px-5 sm:px-6 py-5 flex flex-col gap-5">

          {/* ====== 答题统计 ====== */}
          <section>
            <h4 className="text-[12px] font-semibold uppercase tracking-wider text-ink-400 mb-2.5">
              答题统计
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="rounded-lg border border-ink-100 bg-ink-50/30 px-3 py-2.5">
                <div className="text-[18px] font-bold text-deep-navy-600 leading-tight">
                  {stats.total}
                </div>
                <div className="text-[11px] text-ink-500 mt-0.5">答题总数</div>
              </div>
              <div className="rounded-lg border border-ink-100 bg-ink-50/30 px-3 py-2.5">
                <div className="text-[18px] font-bold text-ink-700 leading-tight">
                  {stats.hardQ}
                </div>
                <div className="text-[11px] text-ink-500 mt-0.5">高难度题（4-5星）</div>
              </div>
              <div className="rounded-lg border border-ink-100 bg-ink-50/30 px-3 py-2.5">
                <div className="text-[18px] font-bold leading-tight" style={{ color: '#5B8C5A' }}>
                  {stats.correct}
                </div>
                <div className="text-[11px] text-ink-500 mt-0.5">答对</div>
              </div>
              <div className="rounded-lg border border-ink-100 bg-ink-50/30 px-3 py-2.5">
                <div className="text-[18px] font-bold leading-tight" style={{ color: '#D4956A' }}>
                  {stats.wrong}
                </div>
                <div className="text-[11px] text-ink-500 mt-0.5">答错/跳过</div>
              </div>
            </div>
          </section>

          {/* ====== 分数构成（按用户要求的公式） ====== */}
          <section>
            <h4 className="text-[12px] font-semibold uppercase tracking-wider text-ink-400 mb-2.5">
              分数计算
            </h4>
            <div className="rounded-xl border border-ink-100 bg-deep-navy-50/20 p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3 text-[13px]">
                <span className="text-ink-600">基础分 {scoreBreakdown.base} × 0.5</span>
                <span className="text-ink-800 font-semibold">= {scoreBreakdown.basePart}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[13px]">
                <span className="text-ink-600">本次贡献 {scoreBreakdown.contribution} × 0.5</span>
                <span className="text-ink-800 font-semibold">= {scoreBreakdown.contributionPart}</span>
              </div>
              <div className="h-px bg-ink-100 my-1" />
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13.5px] font-semibold text-ink-800">当前分数</span>
                <span
                  className="text-[20px] font-bold leading-tight"
                  style={{ color: color.stroke }}
                >
                  {score}
                  <span className="text-[12px] text-ink-400 font-normal ml-1">/ 100</span>
                </span>
              </div>
              <p className="text-[11px] text-ink-400 leading-relaxed mt-0.5">
                公式：基础分 50 × 0.5 + 本次贡献 × 0.5
              </p>
            </div>
          </section>

          {/* ====== G2-1 评分依据（3-4 个标准分项） ====== */}
          <section>
            <h4 className="text-[12px] font-semibold uppercase tracking-wider text-ink-400 mb-2.5">
              评分依据
            </h4>
            <div className="rounded-xl border border-ink-100 overflow-hidden">
              {criteria.map((c, i) => {
                const ratio = c.max > 0 ? Math.min(1, c.score / c.max) : 0;
                const barColor = c.isTotal ? color.stroke : '#1E3158';
                return (
                  <div
                    key={c.name}
                    className={`px-4 py-3 flex flex-col gap-1.5 ${i !== 0 ? 'border-t border-ink-100' : ''} ${c.isTotal ? 'bg-ink-50/40' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[13px] ${c.isTotal ? 'font-semibold text-ink-900' : 'font-medium text-ink-700'}`}>
                        {c.name}
                      </span>
                      <span className={`text-[13px] font-semibold ${c.isTotal ? '' : 'text-deep-navy-600'}`}>
                        {c.outOf}
                      </span>
                    </div>
                    {c.desc && (
                      <p className="text-[11.5px] text-ink-500 leading-relaxed">
                        {c.desc}
                      </p>
                    )}
                    <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${ratio * 100}%`, backgroundColor: barColor, opacity: c.isTotal ? 0.85 : 0.75 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 小字：反馈声明 */}
          <p className="text-[11px] text-ink-400 leading-relaxed">
            你的反馈会用于改进评分模型
          </p>
        </div>

        {/* 底部操作 */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-ink-100 bg-ink-50/30 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[13px] font-medium text-ink-600 hover:text-ink-800 hover:bg-white border border-transparent hover:border-ink-200 transition-colors"
          >
            关闭
          </button>
          {onRetakeDimension && (
            <button
              onClick={() => {
                onClose();
                setTimeout(() => onRetakeDimension(dimId), 50);
              }}
              className="btn-primary px-4 py-2 text-[13px] inline-flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              </svg>
              重测这个维度
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
