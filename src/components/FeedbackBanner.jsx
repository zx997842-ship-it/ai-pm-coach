import { useState } from 'react';
import { REAL_QUESTIONS } from '../data/content.js';

/**
 * 复测反馈卡片：根据 feedbackState.type 渲染不同样式和文案
 * - bigImprove: 总分提升10+ → 主色背景白字庆祝
 * - dimBreakthrough: 维度单项提升15+ → 单独庆祝该维度
 * - decline: 总分下降 → 建设性话术 + 查看本次错题入口（橙色）
 * - stable: 总分持平 → 稳定反馈 + 针对最弱维度建议
 */
export default function FeedbackBanner({ feedbackState, records }) {
  // ========== Hooks 必须在任何 early return 之前（React Rules of Hooks） ==========
  const [showWrongAnswers, setShowWrongAnswers] = useState(false);

  if (!feedbackState) return null;
  const { type } = feedbackState;

  // 本次答错的题
  const wrongRecords = (records || []).filter((r) => !r.isCorrect);

  if (type === 'bigImprove') {
    const { daysDelta, deltaTotal, breakthroughDim } = feedbackState;
    return (
      <div className="opacity-0 animate-fade-in-up mt-6"
           style={{ animationDelay: '80ms', animationFillMode: 'forwards' }}>
        <div className="rounded-xl px-6 py-5" style={{ background: 'linear-gradient(135deg, #1E3158 0%, #2A4A7F 100%)' }}>
          <div className="flex items-center gap-3">
            <div className="shrink-0 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                <polyline points="16 7 22 7 22 13"/>
              </svg>
            </div>
            <div className="text-white">
              <p className="text-[16px] font-semibold leading-snug">
                你在 {daysDelta} 天里提升了 {deltaTotal} 分！
              </p>
              {breakthroughDim && breakthroughDim.delta >= 15 && (
                <p className="text-[12.5px] text-white/70 mt-0.5">
                  其中「{breakthroughDim.name}」维度突破性提升了 {breakthroughDim.delta} 分
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'dimBreakthrough') {
    const { breakthroughDim, daysDelta } = feedbackState;
    return (
      <div className="opacity-0 animate-fade-in-up mt-6"
           style={{ animationDelay: '80ms', animationFillMode: 'forwards' }}>
        <div className="rounded-xl px-6 py-5 border-2" style={{ borderColor: '#5B8C5A', background: 'rgba(91, 140, 90, 0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(91, 140, 90, 0.15)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B8C5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15 9 22 9 17 13.5 19 21 12 17 5 21 7 13.5 2 9 9 9"/>
              </svg>
            </div>
            <div>
              <p className="text-[16px] font-semibold leading-snug" style={{ color: '#3F6B3E' }}>
                你的「{breakthroughDim?.name}」维度突破了！
              </p>
              <p className="text-[12.5px] mt-0.5" style={{ color: '#5B8C5A' }}>
                过去 {daysDelta} 天里，这个维度提升了 {breakthroughDim?.delta} 分（{breakthroughDim?.prev} → {breakthroughDim?.curr}）
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'decline') {
    const { deltaTotal } = feedbackState;
    return (
      <div className="opacity-0 animate-fade-in-up mt-6"
           style={{ animationDelay: '80ms', animationFillMode: 'forwards' }}>
        {/* 建设性反馈卡片（橙色，不用红色） */}
        <div className="rounded-xl px-6 py-5 border" style={{ borderColor: '#E8A87C', background: 'rgba(232, 168, 124, 0.08)' }}>
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(232, 168, 124, 0.18)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4956A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4"/>
                <path d="M12 17h.01"/>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-semibold leading-snug" style={{ color: '#B5703F' }}>
                今天的表现可能不在最佳状态。
              </p>
              <p className="text-[13px] mt-1 leading-relaxed" style={{ color: '#8B6444' }}>
                总分变化 <span className="font-semibold">{deltaTotal}</span> 分。我们一起回顾这次答错的题，看看是哪里出了问题。
              </p>
              {/* 查看本次错题入口 */}
              {wrongRecords.length > 0 && (
                <button
                  onClick={() => setShowWrongAnswers(!showWrongAnswers)}
                  className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium px-3 py-1.5 rounded-lg transition-colors"
                  style={{ color: '#B5703F', background: 'rgba(232, 168, 124, 0.15)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                  {showWrongAnswers ? '收起错题' : `查看本次错题（${wrongRecords.length}题）`}
                  <svg className={`w-3 h-3 transition-transform ${showWrongAnswers ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 错题展开列表 */}
        {showWrongAnswers && wrongRecords.length > 0 && (
          <div className="mt-3 rounded-xl border border-ink-100 bg-white/80 p-4 flex flex-col gap-3">
            {wrongRecords.map((r, i) => {
              const q = REAL_QUESTIONS.find((q) => q.id === r.questionId);
              return (
                <div key={i} className="border-l-2 pl-3" style={{ borderColor: '#E8A87C' }}>
                  <p className="text-[13px] font-medium text-ink-800 leading-snug">
                    {i + 1}. {q?.question || '(题目缺失)'}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-[11.5px]">
                    <span className="text-ink-500">
                      正确答案：<span className="font-semibold text-emerald-600">{q?.correctAnswer || '--'}</span>
                    </span>
                    <span className="text-ink-500">
                      你的选择：<span className="font-semibold" style={{ color: '#D4956A' }}>{r.userAnswer || '跳过'}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // stable
  const { weakestDim } = feedbackState;
  return (
    <div className="opacity-0 animate-fade-in-up mt-6"
         style={{ animationDelay: '80ms', animationFillMode: 'forwards' }}>
      <div className="rounded-xl px-6 py-5 border border-ink-200 bg-ink-50/30">
        <div className="flex items-center gap-3">
          <div className="shrink-0 w-10 h-10 rounded-full bg-ink-100 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#636366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
              <path d="M12 8v4"/>
              <path d="M12 16h.01"/>
            </svg>
          </div>
          <div>
            <p className="text-[15px] font-semibold leading-snug text-ink-700">
              本次表现稳定。
            </p>
            {weakestDim && (
              <p className="text-[12.5px] text-ink-500 mt-0.5">
                建议针对「{weakestDim.name}」做专项练习，下次会有突破。
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
