import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo.jsx';
import {
  DIM_COLORS,
  DIMENSIONS,
  saveAnswerHistory,
  loadAnswerHistory,
  clearAnswerHistory,
  validateQuestionBankReady,
  saveInProgress,
  loadInProgress,
  clearInProgress,
} from '../data/content.js';
import {
  initCATState,
  selectNextDimension,
  selectQuestion,
  updateDifficultyAndScore,
  checkTermination,
  saveCATState,
  loadCATState,
  clearCATState,
} from '../utils/catEngine.js';

export default function AssessmentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeFromQuery = searchParams.get('resume') === '1';

  // 题库校验
  const bankCheck = useMemo(() => validateQuestionBankReady(), []);
  const isBankReady = bankCheck.ready;

  // CAT 状态
  const catStateRef = useRef(null);

  // 当前题目
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  // 答题记录（用于结果页展示）
  const answerRecordsRef = useRef([]);

  // 计时
  const questionStartRef = useRef(Date.now());

  // G1-7: 提交中状态（防止用户快速重复点击"下一题"）
  const [submitting, setSubmitting] = useState(false);

  // G1-3: 如果从 landing 直接进入（没带resume）但检测到有未完成进度，
  //       显示一个继续/放弃卡片让用户先选择
  const inProgressData = useMemo(() => {
    if (resumeFromQuery) return null; // resume=1 直接走恢复逻辑，不弹卡片
    return loadInProgress();
  }, [resumeFromQuery]);
  const [showResumeCard, setShowResumeCard] = useState(!!inProgressData);

  // 恢复已保存的进度（从 localStorage 读取 CAT state + records）
  const restoreFromSaved = useCallback(() => {
    let records = [];
    let catState = null;

    // 优先从 in-progress 存储读取（更准确）
    const inProg = loadInProgress();
    if (inProg && inProg.catState && Array.isArray(inProg.records)) {
      catState = inProg.catState;
      records = inProg.records;
    } else {
      // 兜底：从 CAT_STORAGE_KEY + answer history 读取
      try { catState = loadCATState(); } catch (e) { catState = null; }
      try { records = loadAnswerHistory() || []; } catch (e) { records = []; }
    }

    // 合法性校验
    if (!catState || !catState.dims || !Array.isArray(records)) {
      console.warn('[测评恢复] 存储数据异常，将开始全新测评');
      clearInProgress();
      return null;
    }

    // 如果 records 已经 >= 25，则视为已完成，直接跳结果页
    if (records.length >= 25) {
      saveAnswerHistory(records);
      saveCATState(catState);
      clearInProgress();
      navigate('/results');
      return null;
    }

    return { catState, records };
  }, [navigate]);

  // 从恢复状态/全新状态开始进入答题流程（准备好 CAT state、records、currentQuestion）
  const startAnswering = useCallback((restoreData) => {
    let state;
    let records;

    if (restoreData) {
      state = restoreData.catState;
      records = restoreData.records;
    } else {
      // 全新测评
      clearInProgress();
      clearAnswerHistory();
      clearCATState();
      state = initCATState();
      records = [];
    }

    catStateRef.current = state;
    answerRecordsRef.current = records;

    console.log('===== CAT 简化版自适应测试 开始' + (restoreData ? '（恢复进度）' : '') + ' =====');
    console.log('初始状态: dims=', Object.fromEntries(
      Object.entries(state.dims).map(([id, d]) => [id, { difficulty: d.difficulty, score: d.score, count: d.questionCount }])
    ));
    console.log('已答题数（恢复的话）：', records.length);

    // 选下一题（CAT 决定维度+题目）
    const dimId = selectNextDimension(state);
    const q = selectQuestion(state, dimId);
    if (q) {
      state.dims[dimId].usedQuestionIds.push(q.id);
      setCurrentQuestion(q);
    } else {
      console.warn('[CAT] 第一题就抽不到，立即终止测评');
      setFinished(true);
      saveCATState(state);
      saveAnswerHistory(records);
      clearInProgress();
      navigate('/results');
      return;
    }

    setCurrentIndex(records.length); // 当前"下一题"的序号 = 已答题数
    setSelectedAnswer(null);
    setShowResumeCard(false);
    questionStartRef.current = Date.now();
  }, [navigate]);

  // 初始化
  useEffect(() => {
    if (!isBankReady) return; // 题库未就绪，不初始化

    if (showResumeCard && !resumeFromQuery) {
      // 有未完成进度，等用户选"继续"还是"放弃"，不启动答题
      return;
    }

    if (resumeFromQuery || showResumeCard === false) {
      // resume=1 或用户已经选完了（showResumeCard 被设成 false）
      // 注意：showResumeCard=false 且 !resumeFromQuery 表示用户点击了"放弃重来"
      const needRestore = resumeFromQuery && inProgressData;
      if (needRestore) {
        const data = restoreFromSaved();
        if (data) startAnswering(data);
        else startAnswering(null);
      } else if (resumeFromQuery) {
        // 带了 resume=1 但没有可用数据 → 全新
        const data = restoreFromSaved(); // 再试一次
        startAnswering(data || null);
      } else {
        // 全新开始（用户可能点了"放弃重来"）
        startAnswering(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBankReady, resumeFromQuery, showResumeCard]);

  // 切题时重置计时
  useEffect(() => {
    questionStartRef.current = Date.now();
  }, [currentIndex]);

  const recordTime = useCallback(() => {
    return Math.round((Date.now() - questionStartRef.current) / 1000);
  }, []);

  const handleSelect = (key) => {
    if (submitting) return;
    setSelectedAnswer(key);
  };

  // 答题完成后：持久化 + 判断终止 + 下一题/跳转
  const afterRecordNext = useCallback(() => {
    const state = catStateRef.current;
    const records = answerRecordsRef.current;

    // 持久化：CAT state + answer history + 未完成进度
    saveCATState(state);
    saveAnswerHistory(records);
    if (!checkTermination(state)) {
      saveInProgress({ catState: state, records });
    }

    // 检查终止
    if (checkTermination(state)) {
      setFinished(true);
      clearInProgress(); // 完成了，清掉未完成标记
      console.log('===== CAT 测试完成 =====');
      console.log('最终维度分数:', Object.fromEntries(
        Object.entries(state.dims).map(([id, d]) => [id, d.score])
      ));
      navigate('/results');
      return;
    }

    // 选下一题
    const dimId = selectNextDimension(state);
    const q = selectQuestion(state, dimId);
    if (q) {
      state.dims[dimId].usedQuestionIds.push(q.id);
      setCurrentQuestion(q);
      setSelectedAnswer(null);
      setCurrentIndex(records.length);
    } else {
      // 无题可选，强制结束
      setFinished(true);
      clearInProgress();
      saveCATState(state);
      saveAnswerHistory(records);
      console.log('===== CAT 测试完成（无更多题目） =====');
      navigate('/results');
    }
  }, [navigate]);

  const handleNext = () => {
    if (submitting) return;
    const state = catStateRef.current;
    if (!state || !currentQuestion) return;
    if (!selectedAnswer) return;

    setSubmitting(true);
    try {
      const elapsed = recordTime();
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

      // 更新 CAT 状态
      updateDifficultyAndScore(state, currentQuestion.dimId, isCorrect, currentQuestion.difficulty);

      // 记录答题
      answerRecordsRef.current.push({
        questionId: currentQuestion.id,
        dimId: currentQuestion.dimId,
        category: currentQuestion.category,
        userAnswer: selectedAnswer,
        isCorrect,
        timeSpent: elapsed,
        skipped: false,
      });

      afterRecordNext();
    } finally {
      // 让 setSubmitting(false) 在下一个 tick 生效，确保按钮短暂禁用避免双击
      setTimeout(() => setSubmitting(false), 120);
    }
  };

  const handleSkip = () => {
    if (submitting) return;
    const state = catStateRef.current;
    if (!state || !currentQuestion) return;

    setSubmitting(true);
    try {
      const elapsed = recordTime();

      // 跳过视为答错
      updateDifficultyAndScore(state, currentQuestion.dimId, false, currentQuestion.difficulty);

      answerRecordsRef.current.push({
        questionId: currentQuestion.id,
        dimId: currentQuestion.dimId,
        category: currentQuestion.category,
        userAnswer: null,
        isCorrect: false,
        timeSpent: elapsed,
        skipped: true,
      });

      afterRecordNext();
    } finally {
      setTimeout(() => setSubmitting(false), 120);
    }
  };

  // 继续/放弃 卡片处理
  const handleResumeChoiceContinue = () => {
    setShowResumeCard(false);
    // 下一轮 useEffect 会进入恢复流程
    setTimeout(() => {
      const data = restoreFromSaved();
      if (data) startAnswering(data);
      else startAnswering(null);
    }, 0);
  };
  const handleResumeChoiceAbandon = () => {
    clearInProgress();
    clearAnswerHistory();
    clearCATState();
    setShowResumeCard(false);
    setTimeout(() => startAnswering(null), 0);
  };

  // ====== 渲染 ======

  // 题库未就绪，显示阻断
  if (!isBankReady) {
    return (
      <div className="min-h-screen notion-grid-bg flex items-center justify-center px-5">
        <div className="max-w-xl w-full rounded-2xl border border-orange-200 bg-white shadow-card p-7 sm:p-8">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 shrink-0 flex items-center justify-center mt-0.5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4956A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-[18px] sm:text-[20px] font-semibold text-orange-900 leading-snug">
                题库未就绪，请联系管理员
              </h1>
              <p className="mt-2 text-[13.5px] text-orange-700/80 leading-relaxed">
                以下维度题目不足 3 道，无法启动测评：
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {bankCheck.missing.map(m => (
                  <li key={m.id} className="text-[12px] px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 font-medium">
                    {m.name}（仅 {m.count} 题）
                  </li>
                ))}
              </ul>
              <Link
                to="/"
                className="mt-6 inline-flex items-center gap-1.5 text-[13px] text-deep-navy-600 hover:text-deep-navy-800 font-medium underline underline-offset-2"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5"/>
                  <path d="M12 19l-7-7 7-7"/>
                </svg>
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 有未完成测评，先弹卡片
  if (showResumeCard && inProgressData) {
    const count = inProgressData.records?.length || 0;
    return (
      <div className="min-h-screen notion-grid-bg flex items-center justify-center px-5">
        <div className="max-w-xl w-full rounded-2xl border border-deep-navy-200 bg-white shadow-card p-7 sm:p-8">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 rounded-xl bg-deep-navy-50 border border-deep-navy-100 shrink-0 flex items-center justify-center mt-0.5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E3158" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                <polyline points="1 4 1 10 7 10"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-[18px] sm:text-[20px] font-semibold text-deep-navy-800 leading-snug">
                你有一次未完成的测评，继续作答？
              </h1>
              <p className="mt-2 text-[13.5px] text-ink-600 leading-relaxed">
                上次已答 <strong className="text-deep-navy-700">{count}</strong> 题，题目和答题进度都已为你保存。
              </p>
              <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={handleResumeChoiceContinue}
                  className="btn-primary px-5 py-2.5 text-[13.5px]"
                >
                  继续作答
                  <svg className="ml-1.5 w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/>
                    <path d="M12 5l7 7-7 7"/>
                  </svg>
                </button>
                <button
                  onClick={handleResumeChoiceAbandon}
                  className="px-5 py-2.5 rounded-lg text-[13.5px] font-medium border border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50 transition-colors"
                >
                  放弃重来
                </button>
              </div>
              <p className="mt-4 text-[11.5px] text-ink-400 leading-relaxed">
                选择"放弃重来"会清空当前未完成的进度，从第 1 题重新开始。
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 加载题目中
  if (!currentQuestion) {
    return (
      <div className="min-h-screen notion-grid-bg flex items-center justify-center">
        <p className="text-ink-500">加载题目中...</p>
      </div>
    );
  }

  const dimColor = DIM_COLORS[currentQuestion.dimId];
  const totalAnswered = catStateRef.current?.totalQuestions || 0;
  const progress = Math.min(((totalAnswered + 1) / 25) * 100, 100);

  const nextBtnDisabled = !selectedAnswer || submitting;
  const skipBtnDisabled = submitting;

  return (
    <div className="min-h-screen notion-grid-bg flex flex-col">
      {/* Top nav */}
      <header className="w-full bg-warm-white/80 backdrop-blur-sm border-b border-ink-100/60 z-10">
        <div className="section-inner py-4 flex items-center justify-between">
          <BrandLogo />
          <Link
            to="/assessment-intro"
            className="text-[13.5px] text-ink-700 hover:text-deep-navy-600 transition-colors inline-flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"/>
              <path d="M12 19l-7-7 7-7"/>
            </svg>
            返回介绍
          </Link>
        </div>
      </header>

      {/* Progress bar */}
      <div className="w-full bg-white border-b border-ink-100/60">
        <div className="section-inner py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] text-ink-700 font-medium">
              第 <strong className="text-deep-navy-600">{totalAnswered + 1}</strong> 题 / 至少 25 题
            </span>
            <span className="text-[12px] text-ink-500">
              {totalAnswered} 题已答
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-deep-navy-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1">
        <div className="section-inner py-8 sm:py-12 w-full">
          {/* Category tag + difficulty stars */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: dimColor?.stroke }}
            />
            <span
              className="text-[12.5px] font-medium tracking-wide"
              style={{ color: dimColor?.stroke }}
            >
              {currentQuestion.category}
            </span>
            {/* 难度星数 */}
            {currentQuestion.difficulty && (
              <span className="ml-2 inline-flex items-center gap-0.5" title={`难度 ${currentQuestion.difficulty}/5`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <svg
                    key={i}
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill={i < currentQuestion.difficulty ? '#D4956A' : 'none'}
                    stroke={i < currentQuestion.difficulty ? '#D4956A' : '#C4C4C8'}
                    strokeWidth="1.5"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
                <span className="text-[10px] text-ink-400 ml-1">{currentQuestion.difficulty}/5</span>
              </span>
            )}
          </div>

          {/* Question */}
          <h2 className="font-serif text-ink-900 text-[20px] sm:text-[24px] font-semibold tracking-tightserif leading-[1.45] mb-8">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="flex flex-col gap-3">
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedAnswer === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => handleSelect(opt.key)}
                  disabled={submitting}
                  className={`w-full text-left p-4 sm:p-5 rounded-xl border transition-all duration-150
                    ${isSelected
                      ? 'border-deep-navy-400 bg-deep-navy-50/60 shadow-[0_0_0_1px_rgba(30,49,88,0.15)]'
                      : 'border-ink-200 bg-white hover:border-deep-navy-200 hover:bg-deep-navy-50/30 shadow-soft'
                    }
                    ${submitting ? 'opacity-80 cursor-not-allowed' : ''}
                  `}
                >
                  <div className="flex items-start gap-3.5">
                    <span
                      className={`w-7 h-7 rounded-lg border shrink-0 inline-flex items-center justify-center text-[13px] font-semibold transition-colors duration-150
                        ${isSelected
                          ? 'bg-deep-navy-600 text-white border-deep-navy-600'
                          : 'bg-white text-ink-700 border-ink-200'
                        }
                      `}
                    >
                      {opt.key}
                    </span>
                    <span className={`text-[15px] leading-relaxed pt-0.5 transition-colors duration-150
                      ${isSelected ? 'text-deep-navy-700' : 'text-ink-700'}
                    `}>
                      {opt.text}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom actions */}
          <div className="mt-10 flex items-center justify-between">
            <button
              onClick={handleSkip}
              disabled={skipBtnDisabled}
              className={`text-[13.5px] transition-colors underline-offset-2
                ${skipBtnDisabled
                  ? 'text-ink-300 cursor-not-allowed pointer-events-none'
                  : 'text-ink-500 hover:text-ink-700 hover:underline'
                }`}
            >
              跳过本题
            </button>

            <button
              onClick={handleNext}
              disabled={nextBtnDisabled}
              className={`btn-primary min-w-[160px] inline-flex items-center justify-center
                ${nextBtnDisabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
              `}
            >
              {submitting ? (
                <>
                  <svg className="mr-2 w-[16px] h-[16px] animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  提交中...
                </>
              ) : (
                <>
                  下一题
                  <svg className="ml-2 w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/>
                    <path d="M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full">
        <div className="section-inner py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12.5px] text-ink-500">
          <span>© {new Date().getFullYear()} AI PM Coach</span>
          <Link to="/" className="hover:text-deep-navy-600 transition-colors">← 回到首页</Link>
        </div>
      </footer>
    </div>
  );
}
