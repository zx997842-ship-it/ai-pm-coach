import { useMemo } from 'react';
import BrandLogo from '../components/BrandLogo.jsx';
import { Link } from 'react-router-dom';
import { DIMENSIONS, ASSESSMENT_META, TOTAL_TAKERS, validateQuestionBankReady } from '../data/content.js';

export default function AssessmentIntroPage() {
  const bankCheck = useMemo(() => validateQuestionBankReady(), []);
  const isReady = bankCheck.ready;

  return (
    <div className="min-h-screen notion-grid-bg flex flex-col">
      {/* Top nav */}
      <header className="w-full sticky top-0 bg-warm-white/80 backdrop-blur-sm border-b border-ink-100/60 z-10">
        <div className="section-inner py-4 flex items-center justify-between">
          <BrandLogo />
          <Link
            to="/"
            className="text-[13.5px] text-ink-700 hover:text-deep-navy-600 transition-colors inline-flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"/>
              <path d="M12 19l-7-7 7-7"/>
            </svg>
            返回首页
          </Link>
        </div>
      </header>

      {/* Progress step indicator */}
      <div className="section-inner pt-8">
        <div className="flex items-center gap-3 text-[12.5px] text-ink-500">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-deep-navy-600 text-white inline-flex items-center justify-center text-[11px] font-semibold">1</span>
            <span className="text-ink-900 font-medium">测评介绍</span>
          </div>
          <div className="h-px flex-1 max-w-[40px] bg-ink-200" />
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-ink-100 text-ink-500 border border-ink-200 inline-flex items-center justify-center text-[11px] font-medium">2</span>
            <span>开始答题</span>
          </div>
          <div className="h-px flex-1 max-w-[40px] bg-ink-200" />
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-ink-100 text-ink-500 border border-ink-200 inline-flex items-center justify-center text-[11px] font-medium">3</span>
            <span>查看报告</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1">
        <div className="section-inner py-10 sm:py-14 w-full">
          {/* Heading block */}
          <div className="opacity-0 animate-fade-in-up" style={{ animationFillMode: 'forwards' }}>
            <span className="inline-block text-[12.5px] font-medium uppercase tracking-widest text-deep-navy-600 mb-4">
              Step 01 · 了解测评
            </span>
            <h1 className="font-serif text-ink-900 tracking-tightserif leading-[1.15] font-semibold
                           text-[32px] sm:text-[44px] max-w-[22ch]">
              关于这份 AI PM 能力诊断
            </h1>
            <p className="mt-5 text-[16px] text-ink-700 leading-relaxed max-w-2xl">
              测评围绕成为一名合格 AI 产品经理所需的 <strong className="text-ink-900">6 个核心维度</strong>展开，
              共 {ASSESSMENT_META.questionCount} 道题，预计用时 <strong className="text-ink-900">{ASSESSMENT_META.durationMinutes} 分钟</strong>。
              答题结束后你会获得一份专属能力雷达图和针对性的补强建议。
            </p>
          </div>

          {/* Meta card — Notion callout style */}
          <div className="opacity-0 animate-fade-in-up mt-9 rounded-2xl border border-deep-navy-100 bg-deep-navy-50/50 p-5 sm:p-6"
               style={{ animationDelay: '90ms', animationFillMode: 'forwards' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-white shadow-soft border border-ink-100 flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3158" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div>
                  <div className="text-[15px] font-semibold text-ink-900">
                    大概多久完成？
                  </div>
                  <div className="mt-1 text-[13.5px] text-ink-700 leading-relaxed">
                    <strong>{ASSESSMENT_META.durationMinutes} 分钟左右</strong>，
                    建议找一段安静的时间一次性完成。中途关闭页面不会自动保存哦。
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-5 pl-[52px] sm:pl-0">
                <div className="flex flex-col">
                  <span className="text-[11px] text-ink-500 uppercase tracking-widest">题数</span>
                  <span className="font-serif text-[24px] text-deep-navy-700 font-semibold tracking-tightserif">{ASSESSMENT_META.questionCount}</span>
                </div>
                <div className="h-8 w-px bg-deep-navy-200/60" />
                <div className="flex flex-col">
                  <span className="text-[11px] text-ink-500 uppercase tracking-widest">维度</span>
                  <span className="font-serif text-[24px] text-deep-navy-700 font-semibold tracking-tightserif">{ASSESSMENT_META.totalDimensions}</span>
                </div>
                <div className="h-8 w-px bg-deep-navy-200/60 hidden sm:block" />
                <div className="flex-col hidden sm:flex">
                  <span className="text-[11px] text-ink-500 uppercase tracking-widest">累计参与</span>
                  <span className="font-serif text-[24px] text-deep-navy-700 font-semibold tracking-tightserif">{TOTAL_TAKERS.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dimensions list */}
          <section className="opacity-0 animate-fade-in-up mt-12"
                   style={{ animationDelay: '170ms', animationFillMode: 'forwards' }}>
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="font-serif text-ink-900 text-[22px] sm:text-[24px] font-semibold tracking-tightserif">
                6 个核心测评维度
              </h2>
              <span className="text-[12.5px] text-ink-500 hidden sm:inline">
                按权重加权得出最终评分
              </span>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DIMENSIONS.map((d, i) => (
                <li
                  key={d.id}
                  className="card p-5 sm:p-6 hover:border-deep-navy-200 hover:shadow-[0_4px_16px_rgba(15,28,54,0.06)] transition-all duration-200 group"
                  style={{ animationFillMode: 'forwards' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      <div className="w-9 h-9 rounded-xl bg-deep-navy-50 border border-deep-navy-100 flex items-center justify-center
                                      group-hover:bg-deep-navy-600 group-hover:border-deep-navy-600 transition-colors duration-200">
                        <span className="font-serif text-[14px] font-semibold text-deep-navy-600 tracking-tightserif
                                         group-hover:text-white transition-colors duration-200">
                          {d.num}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[16px] font-semibold text-ink-900 tracking-tight">{d.name}</h3>
                      <p className="mt-2 text-[13.5px] text-ink-700 leading-relaxed">{d.desc}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* How it works — short 3 step */}
          <section className="opacity-0 animate-fade-in-up mt-16"
                   style={{ animationDelay: '260ms', animationFillMode: 'forwards' }}>
            <h2 className="font-serif text-ink-900 text-[22px] sm:text-[24px] font-semibold tracking-tightserif mb-6">
              测评流程
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { step: '1', title: '如实作答', desc: '25 道情景与判断题，选择最贴近你的选项。', icon: 'edit' },
                { step: '2', title: '系统评分', desc: '按 6 个维度加权，对标同阶段候选人。', icon: 'chart' },
                { step: '3', title: '拿到报告', desc: '能力雷达图 + 具体学习路径推荐，立刻可行动。', icon: 'flag' },
              ].map((s) => (
                <div key={s.step} className="card p-5">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-deep-navy-600 text-white inline-flex items-center justify-center text-[12px] font-semibold">{s.step}</span>
                    <h3 className="text-[15px] font-semibold text-ink-900">{s.title}</h3>
                  </div>
                  <p className="mt-3 text-[13.5px] text-ink-700 leading-relaxed pl-10">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Bottom CTA */}
          <section className="opacity-0 animate-fade-in-up mt-16 rounded-2xl bg-white border border-ink-100 shadow-card p-7 sm:p-9"
                   style={{ animationDelay: '340ms', animationFillMode: 'forwards' }}>
            {!isReady ? (
              <div className="rounded-xl border border-orange-200 bg-orange-50/60 px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 shrink-0 flex items-center justify-center mt-0.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4956A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[16px] font-semibold text-orange-800">
                      题库未就绪，请联系管理员
                    </h3>
                    <p className="mt-1 text-[13px] text-orange-700/80 leading-relaxed">
                      以下维度题目不足 3 道，无法启动测评：
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {bankCheck.missing.map(m => (
                        <li key={m.id} className="text-[12px] px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-medium">
                          {m.name}（仅 {m.count} 题）
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="max-w-xl">
                  <h3 className="font-serif text-[22px] sm:text-[24px] text-ink-900 font-semibold tracking-tightserif">
                    准备好了吗？
                  </h3>
                  <p className="mt-2 text-[14px] text-ink-700 leading-relaxed">
                    点击下方按钮进入答题页面。答题过程中可以随时切换窗口，但建议一口气做完效果更好。
                  </p>
                </div>
                <Link to="/assessment" className="btn-primary sm:min-w-[180px] shrink-0">
                  开始
                  <svg className="ml-2 w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/>
                    <path d="M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full">
        <div className="section-inner py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12.5px] text-ink-500">
          <span>© {new Date().getFullYear()} AI PM Coach</span>
          <Link to="/" className="hover:text-deep-navy-600 transition-colors">← 返回落地页</Link>
        </div>
      </footer>
    </div>
  );
}
