import { useMemo, useState } from 'react';
import BrandLogo from '../components/BrandLogo.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { TOTAL_TAKERS, getLatestSnapshot, getTotalScore, validateQuestionBankReady, loadInProgress, clearInProgress, clearAnswerHistory } from '../data/content.js';
import { saveCATState, clearCATState, loadCATState } from '../utils/catEngine.js';

function daysBetween(ts) {
  if (!ts) return Infinity;
  return Math.floor((Date.now() - ts) / (24 * 60 * 60 * 1000));
}

export default function LandingPage() {
  const navigate = useNavigate();
  // 读取最近一次快照，判断复测按钮状态
  const latestSnap = useMemo(() => getLatestSnapshot(), []);
  const lastScore = latestSnap ? latestSnap.totalScore : null;
  const lastDays = latestSnap ? daysBetween(latestSnap.takenAt) : null;

  // 题库校验
  const bankCheck = useMemo(() => validateQuestionBankReady(), []);
  const isBankReady = bankCheck.ready;

  // 未完成测评状态
  const [inProgress, setInProgress] = useState(() => loadInProgress());
  const [dismissedResume, setDismissedResume] = useState(false);

  // 继续作答：把进度写入 localStorage 并跳转到 assessment，由 AssessmentPage 读取
  const handleContinue = () => {
    if (!inProgress) return;
    try {
      // 恢复 CAT state
      if (inProgress.catState) saveCATState(inProgress.catState);
      // 恢复答题记录
      if (Array.isArray(inProgress.records)) {
        try { localStorage.setItem('ai_pm_coach_assessment', JSON.stringify(inProgress.records)); } catch (e) {}
      }
      // 跳转到测评页并附带 resume 参数
      navigate('/assessment?resume=1');
    } catch (e) {
      console.warn('恢复失败:', e);
    }
  };

  // 放弃重来：清空进度
  const handleAbandon = () => {
    clearInProgress();
    clearAnswerHistory();
    clearCATState();
    setInProgress(null);
    setDismissedResume(true);
  };

  // 按钮状态：
  //   - 无历史记录 → 标准开始测评按钮（不显示复测提示）
  //   - <3天 → 浅色弱化 + 提示文字
  //   - 3-14天 → 正常样式 + 提示文字
  //   - >14天 → 高亮（强调色） + 提示文字
  const retakeState = useMemo(() => {
    if (!latestSnap) return null;
    if (lastDays < 3) return { variant: 'faded', hint: `建议再过几天复测，让学习有时间发挥作用。(距上次${lastDays}天)` };
    if (lastDays <= 14) return { variant: 'normal', hint: `距离上次测评 ${lastDays} 天，来复测一次看看进步。` };
    return { variant: 'highlighted', hint: `已经 ${lastDays} 天没测评了，回来看看自己的水平吧。` };
  }, [latestSnap, lastDays]);

  const RetakeButton = () => {
    if (!retakeState) return null;
    const { variant, hint } = retakeState;
    let cls = 'inline-flex items-center gap-1 px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 border shadow-sm';
    if (variant === 'faded') {
      cls += ' bg-ink-50 border-ink-200 text-ink-500 hover:bg-ink-100 hover:text-ink-700';
    } else if (variant === 'highlighted') {
      cls += ' bg-deep-navy-600 border-deep-navy-600 text-white hover:bg-deep-navy-700 shadow-md hover:shadow-lg';
    } else {
      cls += ' bg-white border-deep-navy-200 text-deep-navy-700 hover:border-deep-navy-400 hover:text-deep-navy-800 hover:bg-deep-navy-50';
    }
    return (
      <div className="flex flex-col items-end gap-1.5">
        <Link to="/assessment" className={cls}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
          </svg>
          立即复测
          {lastScore !== null && (
            <span className={`ml-1.5 text-[11.5px] font-semibold ${variant === 'highlighted' ? 'text-warm-white/90' : 'text-ink-500'}`}>
              上次{lastScore}分
            </span>
          )}
        </Link>
        <p
          className={`text-[11.5px] ${
            variant === 'faded' ? 'text-ink-400' : variant === 'highlighted' ? 'text-deep-navy-500 font-medium' : 'text-ink-500'
          } max-w-[260px] text-right leading-snug`}
        >
          {hint}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen notion-grid-bg flex flex-col">
      {/* Top nav */}
      <header className="w-full">
        <div className="section-inner pt-6 pb-4 flex items-center justify-between">
          <BrandLogo />
          <div className="flex items-center gap-6">
            <nav className="hidden sm:flex items-center gap-7 text-[14px] text-ink-700">
              <a href="#about" className="hover:text-deep-navy-600 transition-colors">关于测评</a>
              <a href="#how" className="hover:text-deep-navy-600 transition-colors">测评方式</a>
            </nav>
            <RetakeButton />
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center">
        <div className="section-inner py-16 sm:py-24 w-full">
          <div className="flex flex-col items-center text-center">
            {/* Badge */}
            <div
              className="opacity-0 animate-fade-in-up inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-ink-100 shadow-soft text-[12.5px] text-ink-700 mb-8"
              style={{ animationDelay: '60ms', animationFillMode: 'forwards' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-deep-navy-500 animate-pulse" />
              专为想转型 AI 产品经理的你设计
            </div>

            {/* Headline */}
            <h1
              className="opacity-0 animate-fade-in-up font-serif text-ink-900 tracking-tightserif leading-[1.1]
                         text-[40px] sm:text-[56px] md:text-[64px]
                         max-w-[16ch] font-semibold"
              style={{ animationDelay: '140ms', animationFillMode: 'forwards' }}
            >
              测出你的 <span className="text-deep-navy-600">AI PM</span><br className="hidden sm:block" />
              能力短板
            </h1>

            {/* Subtitle */}
            <p
              className="opacity-0 animate-fade-in-up mt-7 text-ink-700
                         text-[16px] sm:text-[18px] leading-relaxed
                         max-w-xl"
              style={{ animationDelay: '220ms', animationFillMode: 'forwards' }}
            >
              <span className="font-semibold text-ink-900">15 分钟 · 6 个维度</span>，
              告诉你该补什么、从哪下手、离 offer 还差多少。
            </p>

            {/* 未完成测评恢复卡片 */}
            {inProgress && !dismissedResume && (
              <div
                className="opacity-0 animate-fade-in-up w-full max-w-2xl mt-6 mb-2"
                style={{ animationDelay: '260ms', animationFillMode: 'forwards' }}
              >
                <div className="rounded-2xl border border-deep-navy-200 bg-deep-navy-50/70 shadow-card px-5 py-4 sm:px-6 sm:py-5">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-9 h-9 rounded-xl bg-white border border-deep-navy-100 shadow-soft shrink-0 flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3158" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        <polyline points="1 4 1 10 7 10"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] sm:text-[16px] font-semibold text-deep-navy-800">
                        你有一次未完成的测评，继续作答？
                      </h3>
                      <p className="mt-1 text-[12.5px] sm:text-[13px] text-deep-navy-600/80 leading-relaxed">
                        已答 <strong>{inProgress.records?.length || 0}</strong> 题，进度已自动保存。
                      </p>
                      <div className="mt-3.5 flex flex-col sm:flex-row gap-2.5">
                        <button
                          onClick={handleContinue}
                          className="btn-primary px-4 py-2 text-[13px] sm:text-[13.5px]"
                        >
                          继续作答
                          <svg className="ml-1.5 w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14"/>
                            <path d="M12 5l7 7-7 7"/>
                          </svg>
                        </button>
                        <button
                          onClick={handleAbandon}
                          className="px-4 py-2 rounded-lg text-[13px] sm:text-[13.5px] font-medium border border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50 transition-colors"
                        >
                          放弃重来
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            <div
              className="opacity-0 animate-fade-in-up mt-11 w-full flex flex-col items-center"
              style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
            >
              {!isBankReady ? (
                <div className="rounded-xl border border-orange-200 bg-orange-50/60 px-5 py-4 sm:px-6 max-w-xl w-full">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-orange-100 shrink-0 flex items-center justify-center mt-0.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4956A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-orange-800 leading-snug">
                        题库未就绪，请联系管理员
                      </p>
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {bankCheck.missing.map(m => (
                          <li key={m.id} className="text-[11px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">
                            {m.name}（仅 {m.count} 题）
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <Link to="/assessment-intro" className="btn-primary sm:min-w-[240px] group">
                  开始测评
                  <svg className="ml-2 w-[18px] h-[18px] transition-transform duration-200 group-hover:translate-x-0.5 group-active:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/>
                    <path d="M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              )}

              {/* Social proof small */}
              <div className="mt-9 flex items-center gap-3 text-[13px] text-ink-500">
                <div className="flex -space-x-2">
                  {['#1E3158', '#526A95', '#7E92B5', '#2E4472'].map((c, i) => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-warm-white" style={{ backgroundColor: c, opacity: 0.85 }} />
                  ))}
                </div>
                <span>已有 <strong className="text-ink-700 font-semibold">{TOTAL_TAKERS.toLocaleString()}</strong> 人完成测评</span>
              </div>
            </div>

            {/* Divider */}
            <div
              className="opacity-0 animate-fade-in hairline-divider w-full max-w-md mt-20"
              style={{ animationDelay: '420ms', animationFillMode: 'forwards' }}
            />

            {/* Secondary info row — Notion-like meta */}
            <div
              id="how"
              className="opacity-0 animate-fade-in-up mt-12 w-full grid grid-cols-3 gap-4 sm:gap-10 max-w-2xl text-left"
              style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}
            >
              {[
                { k: '用时', v: '15 分钟', sub: '一次做完，无需注册' },
                { k: '维度', v: '6 大能力', sub: '覆盖技术 / 策略 / 协作' },
                { k: '产出', v: '能力雷达 + 建议', sub: '告诉你具体该补什么' },
              ].map((it) => (
                <div key={it.k} className="flex flex-col">
                  <span className="text-[12px] uppercase tracking-widest text-ink-400 font-medium">{it.k}</span>
                  <span className="mt-2 font-serif text-ink-900 text-[20px] sm:text-[22px] font-semibold tracking-tightserif">{it.v}</span>
                  <span className="mt-1 text-[13px] text-ink-500 leading-snug">{it.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full">
        <div className="section-inner py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12.5px] text-ink-500">
          <span>© {new Date().getFullYear()} AI PM Coach · 专注 AI 产品经理成长</span>
          <span>made for those who want to ship great AI products</span>
        </div>
      </footer>
    </div>
  );
}
