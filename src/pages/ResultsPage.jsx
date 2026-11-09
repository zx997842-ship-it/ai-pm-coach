import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo.jsx';
import RadarChart from '../components/RadarChart.jsx';
import CompareRadarChart from '../components/CompareRadarChart.jsx';
import DiagnosisCard from '../components/DiagnosisCard.jsx';
import FeedbackBanner from '../components/FeedbackBanner.jsx';
import ScoreBreakdownModal from '../components/ScoreBreakdownModal.jsx';
import ScoreTrendChart from '../components/ScoreTrendChart.jsx';
import {
  DIMENSIONS,
  DIM_COLORS,
  STRENGTH_THRESHOLD,
  REAL_QUESTIONS,
  getTotalScore,
  getScoreLevel,
  loadAnswerHistory,
  calcDimensionScores,
  clearAnswerHistory,
  saveCurrentResultAsSnapshot,
  getAllSnapshots,
  getPreviousSnapshot,
  clearInProgress,
} from '../data/content.js';
import { clearCATState } from '../utils/catEngine.js';
import { getFallbackDiagnosis } from '../data/fallbackDiagnosis.js';

// 重试延迟配置
const RETRY_DELAYS = [1000, 3000];

export default function ResultsPage() {
  const navigate = useNavigate();
  const rawRecords = loadAnswerHistory();
  const records = Array.isArray(rawRecords) ? rawRecords : [];
  const rawScores = calcDimensionScores() || {};
  // 补全6个维度的默认分数，防止 CAT 状态缺失维度导致 undefined
  const scores = {};
  DIMENSIONS.forEach((d) => {
    const v = rawScores[d.id];
    scores[d.id] = typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : 0;
  });
  const totalScore = (() => {
    const v = getTotalScore(scores);
    return Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : 0;
  })();
  const level = getScoreLevel(totalScore);
  const hasData = records.length > 0;

  // 快照 ID（本次测评对应快照）：渲染过程中"尝试保存一次"，返回值用于判断是否新增
  // 关键：saveCurrentResultAsSnapshot 内部做了 1 小时去重，多次调用安全且幂等；放在渲染期可让下方 useMemo 立即取到包含本次快照的 list，避免首次渲染后 setState 导致的 Maximum update depth exceeded 循环
  const currentSnapshotId = useMemo(() => {
    if (!hasData) return null;
    return saveCurrentResultAsSnapshot();
  }, [hasData]);

  // 上一次快照（用于对比）：基于 snapshot 读取
  const allSnapshots = useMemo(() => getAllSnapshots() || [], [currentSnapshotId]);
  const previousSnap = useMemo(() => {
    // "上一次" 指的是除了最新那次（即刚保存的本次）之前的最近一次
    if (!allSnapshots.length) return null;
    if (allSnapshots.length === 1) return null;
    return allSnapshots[allSnapshots.length - 2];
  }, [allSnapshots]);

  // 快照计数（用于"完整成长曲线"入口显示）
  const snapshotCount = allSnapshots.length;

  // 对比数据
  const compareData = useMemo(() => {
    if (!previousSnap) return null;
    const prevTotal = previousSnap.totalScore || 0;
    const deltaTotal = totalScore - prevTotal;

    // 各维度 delta
    const dimDeltas = DIMENSIONS.map((d) => {
      const curr = scores[d.id] || 0;
      const prev = previousSnap.scores?.[d.id] || 0;
      return { id: d.id, name: d.name, curr, prev, delta: curr - prev };
    });

    // 提升最大（delta 最大）
    const mostImproved = [...dimDeltas].sort((a, b) => b.delta - a.delta)[0];
    // 仍需加强：退步或停滞（delta <= 0 且得分 < STRENGTH_THRESHOLD，按得分升序排挑最严重的）
    const weakestNow = dimDeltas
      .filter((d) => d.delta <= 0 || d.curr < STRENGTH_THRESHOLD)
      .sort((a, b) => a.curr - b.curr)[0];

    return {
      prevTotal,
      deltaTotal,
      dimDeltas,
      mostImproved,
      weakestNow,
    };
  }, [previousSnap, totalScore, scores]);

  // 复测反馈状态：根据总分变化和维度单项变化，判断属于哪种反馈场景
  const feedbackState = useMemo(() => {
    if (!compareData) return null;

    const { deltaTotal, dimDeltas } = compareData;
    const daysDelta = previousSnap
      ? Math.max(1, Math.round((Date.now() - previousSnap.takenAt) / (24 * 60 * 60 * 1000)))
      : 0;

    // 找到单项提升 >= 15 的维度（即使总分变化不大）
    const breakthroughDim = dimDeltas.find((d) => d.delta >= 15);

    // 判断反馈类型
    // 优先级：下降 > 大幅提升 > 维度突破 > 持平
    if (deltaTotal < -5) {
      // 情况三：总分下降（变化 < -5）
      return {
        type: 'decline',
        daysDelta,
        deltaTotal,
      };
    }
    if (deltaTotal >= 10) {
      // 情况一：总分提升 10 分以上
      return {
        type: 'bigImprove',
        daysDelta,
        deltaTotal,
        breakthroughDim,
      };
    }
    if (breakthroughDim) {
      // 情况二：某维度单项提升 15 分以上
      return {
        type: 'dimBreakthrough',
        daysDelta,
        deltaTotal,
        breakthroughDim,
      };
    }
    // 情况四：总分基本持平（变化在 -5 到 +10 之间）
    // 找最弱维度用于建议
    const weakest = [...dimDeltas].sort((a, b) => a.curr - b.curr)[0];
    return {
      type: 'stable',
      daysDelta,
      deltaTotal,
      weakestDim: weakest,
    };
  }, [compareData, previousSnap]);

  // 是否首次测评（只有1个快照，无对比数据）
  const isFirstTime = snapshotCount <= 1;

  // 诊断状态
  const [diagnoses, setDiagnoses] = useState({});        // { dimId: { text, isFallback } }
  const [loadingDims, setLoadingDims] = useState({});       // { dimId: true/false }
  const [expandedDims, setExpandedDims] = useState({});    // { dimId: true/false }

  // G2-4: 分数构成 Modal 状态（点击维度分数时打开）
  const [scoreModalDimId, setScoreModalDimId] = useState(null);

  // 找到最弱维度（得分最低且有答题记录）
  const weakestDimRef = useRef(null);
  if (!weakestDimRef.current && hasData) {
    let minScore = 999;
    let weakest = null;
    DIMENSIONS.forEach((d) => {
      const s = scores[d.id] ?? 0;
      const count = records.filter((r) => r.dimId === d.id).length;
      if (count >= 3 && s < minScore) {
        minScore = s;
        weakest = d.id;
      }
    });
    weakestDimRef.current = weakest;
  }

  // 统计每个维度的答题数
  const dimQuestionCounts = {};
  DIMENSIONS.forEach((d) => {
    dimQuestionCounts[d.id] = records.filter((r) => r.dimId === d.id).length;
  });

  // 请求某个维度的诊断（含重试和降级）
  const fetchDiagnosis = useCallback(async (dimId) => {
    const dim = DIMENSIONS.find((d) => d.id === dimId);
    if (!dim) return;

    const dimCount = dimQuestionCounts[dimId] || 0;
    // 数据不足，不调用 AI
    if (dimCount <= 2) return;

    const dimRecords = records.filter((r) => r.dimId === dimId);
    const questionData = dimRecords.map((r) => {
      const q = REAL_QUESTIONS.find((q) => q.id === r.questionId);
      const answerIndex = records.findIndex((rec) => rec === r) + 1;
      return {
        questionId: r.questionId,
        answerIndex,
        question: q ? q.question : '(题目缺失)',
        difficulty: q ? q.difficulty : 0,
        correctAnswer: q ? q.correctAnswer : '',
        userAnswer: r.userAnswer,
        isCorrect: r.isCorrect,
      };
    });

    setLoadingDims((prev) => ({ ...prev, [dimId]: true }));

    let lastError = null;
    let attempt = 0;

    // 最多尝试 3 次（初次 + 2次重试）
    for (let i = 0; i <= RETRY_DELAYS.length; i++) {
      if (i > 0) {
        // 等待重试延迟
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS[i - 1]));
      }

      try {
        const response = await fetch('/api/diagnose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dimName: dim.name,
            dimDesc: dim.desc,
            score: scores[dimId] || 0,
            questions: questionData,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        // 如果后端返回 mock（无 API Key），也视为降级
        setDiagnoses((prev) => ({
          ...prev,
          [dimId]: { text: data.diagnosis, isFallback: data.mock || false },
        }));
        setLoadingDims((prev) => ({ ...prev, [dimId]: false }));
        return; // 成功，退出循环
      } catch (err) {
        lastError = err;
        attempt = i + 1;
        console.warn(`[诊断] ${dimId} 第${attempt}次失败:`, err.message);
        // 继续重试
      }
    }

    // 3 次都失败，启用降级方案
    console.warn(`[诊断] ${dimId} 3次重试均失败，启用降级诊断`);
    const fallbackText = getFallbackDiagnosis(dimId, scores[dimId] || 0);
    setDiagnoses((prev) => ({
      ...prev,
      [dimId]: { text: fallbackText, isFallback: true },
    }));
    setLoadingDims((prev) => ({ ...prev, [dimId]: false }));
  }, [records, scores, dimQuestionCounts]);

  // 页面加载后只生成最弱维度的诊断（仅一次，避免因 fetchDiagnosis 依赖变化反复触发导致 Maximum update depth exceeded）
  const initDoneRef = useRef(false);
  useEffect(() => {
    if (!hasData || !weakestDimRef.current) return;
    if (initDoneRef.current) return;
    initDoneRef.current = true;
    // 最弱维度默认展开
    setExpandedDims((prev) => ({ ...prev, [weakestDimRef.current]: true }));
    fetchDiagnosis(weakestDimRef.current);
  }, [hasData, fetchDiagnosis]);

  // 展开某个维度时触发诊断生成
  const handleExpand = useCallback((dimId) => {
    setExpandedDims((prev) => ({ ...prev, [dimId]: true }));
    // 如果还没有诊断数据，触发 AI 生成
    if (!diagnoses[dimId] && !loadingDims[dimId]) {
      fetchDiagnosis(dimId);
    }
  }, [diagnoses, loadingDims, fetchDiagnosis]);

  // G2-check: 点击诊断卡"重新生成"按钮（清空已有诊断再重新生成）
  const handleRegenerateDiagnosis = useCallback((dimId) => {
    if (loadingDims[dimId]) return;
    setDiagnoses((prev) => {
      const next = { ...prev };
      delete next[dimId];
      return next;
    });
    setExpandedDims((prev) => ({ ...prev, [dimId]: true }));
    fetchDiagnosis(dimId);
  }, [loadingDims, fetchDiagnosis]);

  // G2-2 & G2-4: 重测这个维度 — 清空历史后跳转 /assessment（当前CAT引擎保证6维均衡，这里会优先保留该维度历史做提示）
  const handleRetakeDimension = useCallback((dimId) => {
    clearAnswerHistory();
    clearCATState();
    clearInProgress();
    // 跳转时带 focus 参数，让测评页知道用户希望关注哪个维度（未来扩展单维度专项测评）
    navigate(`/assessment?focus=${encodeURIComponent(dimId)}`);
  }, [navigate]);

  const handleRetake = () => {
    clearAnswerHistory();
    clearCATState();
    navigate('/assessment');
  };

  // G2-4: 找到当前 Modal 的维度信息和其答题记录
  const scoreModalData = useMemo(() => {
    const dimId = scoreModalDimId;
    if (!dimId) return null;
    const dim = DIMENSIONS.find((d) => d.id === dimId);
    if (!dim) return null;
    const dimRecords = Array.isArray(records) ? records.filter((r) => r.dimId === dimId) : [];
    return {
      dimId,
      dimName: dim.name,
      score: scores?.[dimId] || 0,
      records: dimRecords,
    };
  }, [scoreModalDimId, records, scores]);

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

      {/* Progress step indicator */}
      <div className="section-inner pt-6">
        <div className="flex items-center gap-3 text-[12.5px] text-ink-500">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-deep-navy-100 text-deep-navy-600 border border-deep-navy-200 inline-flex items-center justify-center text-[11px] font-medium">1</span>
            <span>测评介绍</span>
          </div>
          <div className="h-px flex-1 max-w-[40px] bg-deep-navy-300" />
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-deep-navy-100 text-deep-navy-600 border border-deep-navy-200 inline-flex items-center justify-center text-[11px] font-medium">2</span>
            <span>开始答题</span>
          </div>
          <div className="h-px flex-1 max-w-[40px] bg-deep-navy-300" />
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-deep-navy-600 text-white inline-flex items-center justify-center text-[11px] font-semibold">3</span>
            <span className="text-ink-900 font-medium">查看报告</span>
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="section-inner py-10 sm:py-14 w-full">
          {/* ====== 总分 ====== */}
          <div className="opacity-0 animate-fade-in-up text-center" style={{ animationFillMode: 'forwards' }}>
            <span className="inline-block text-[12.5px] font-medium uppercase tracking-widest text-deep-navy-600 mb-3">
              Step 03 · 测评报告
            </span>
            <h1 className="font-serif text-ink-900 tracking-tightserif leading-[1.15] font-semibold
                           text-[28px] sm:text-[38px]">
              你的 AI PM 综合能力：
              <span className="text-deep-navy-600">{totalScore} 分</span>
              <span className="text-ink-500 font-normal"> · {level}</span>
            </h1>
            {!hasData && (
              <p className="mt-4 text-[13.5px] text-ink-500">
                暂无答题记录，请先完成测评。
              </p>
            )}
          </div>

          {/* ====== 复测反馈卡片 ====== */}
          {hasData && feedbackState && (
            <FeedbackBanner
              feedbackState={feedbackState}
              records={records}
            />
          )}

          {/* ====== 首次测评提示（无对比数据时不展示叠加图，改为提示） ====== */}
          {hasData && isFirstTime && (
            <div className="opacity-0 animate-fade-in-up mt-6"
                 style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
              <div className="rounded-xl border border-deep-navy-100 bg-deep-navy-50/30 px-5 py-4 text-center">
                <p className="text-[13.5px] text-ink-600 leading-relaxed">
                  这是你的第一次测评。做完下次测评后，这里会展示两次雷达图的对比，让你直观看到进步。
                </p>
              </div>
            </div>
          )}

          {/* ====== 雷达图 + 维度列表 ====== */}
          {hasData && (
            <div className="opacity-0 animate-fade-in-up mt-10"
                 style={{ animationDelay: '120ms', animationFillMode: 'forwards' }}>
              <div className="card p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row lg:items-start lg:gap-10">
                  {/* 左侧：雷达图 */}
                  <div className="shrink-0 flex flex-col items-center">
                    <h2 className="font-serif text-ink-900 text-[17px] font-semibold tracking-tightserif mb-2">
                      六维能力雷达
                      {compareData && !isFirstTime && <span className="ml-2 text-[11px] font-normal text-ink-500">（本次 vs 上次）</span>}
                    </h2>
                    {compareData && !isFirstTime ? (
                      <CompareRadarChart size={340} currentScores={scores} previousScores={previousSnap.scores || {}} />
                    ) : (
                      <RadarChart size={340} scores={scores} />
                    )}
                    <div className="flex items-center gap-5 mt-2 text-[12.5px] flex-wrap justify-center">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#5B8C5A' }} />
                        <span className="text-ink-600">强项 (≥{STRENGTH_THRESHOLD})</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#D4956A' }} />
                        <span className="text-ink-600">弱项</span>
                      </span>
                      {compareData && (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-3 h-0 border-t-2 border-dashed" style={{ borderColor: '#AB8583' }} />
                          <span className="text-ink-600">上次测评</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 右侧：维度诊断列表 */}
                  <div className="flex-1 min-w-0 mt-8 lg:mt-0">
                    <h2 className="font-serif text-ink-900 text-[17px] font-semibold tracking-tightserif mb-4">
                      各维度诊断
                    </h2>
                    <div className="flex flex-col gap-4">
                      {DIMENSIONS.map((d) => {
                        const score = scores[d.id] ?? 0;
                        const color = DIM_COLORS[d.id];
                        const isStrong = score >= STRENGTH_THRESHOLD;
                        const isWeakest = d.id === weakestDimRef.current;
                        const qCount = dimQuestionCounts[d.id] || 0;
                        const diagnosis = diagnoses[d.id];
                        const isLoading = loadingDims[d.id];
                        const isExpanded = expandedDims[d.id];

                        // 分数颜色
                        const scoreColor = score >= 80 ? '#5B8C5A' : score >= 60 ? '#1E3158' : '#D4956A';

                        return (
                          <div key={d.id} className="rounded-xl bg-white/50 border border-ink-100 p-4">
                            {/* 维度头部：名称 + 分数（G2-4：点击分数弹出分数构成） */}
                            <div className="flex gap-4 items-start">
                              <div className="shrink-0 flex flex-col items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setScoreModalDimId(d.id)}
                                  className="w-11 h-11 rounded-xl flex items-center justify-center text-[15px] font-bold cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all focus:outline-none focus:ring-2 focus:ring-deep-navy-200"
                                  style={{
                                    backgroundColor: isStrong ? '#EAF2EA' : '#FDF0E8',
                                    color: isStrong ? '#5B8C5A' : '#D4956A',
                                  }}
                                  title="点击查看分数的详细构成"
                                >
                                  {score}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setScoreModalDimId(d.id)}
                                  className="text-[10px] font-medium hover:underline underline-offset-2 cursor-pointer focus:outline-none"
                                  style={{ color: isStrong ? '#5B8C5A' : '#D4956A' }}
                                >
                                  {isStrong ? '强项 · 点我看详情' : '弱项 · 点我看详情'}
                                </button>
                              </div>
                              <div className="flex-1 min-w-0 pt-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <div
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: color.stroke }}
                                  />
                                  <h3 className="text-[14px] font-semibold text-ink-900">{d.name}</h3>
                                  {isWeakest && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 font-medium">
                                      最弱维度
                                    </span>
                                  )}
                                </div>
                                {/* 诊断卡片 */}
                                <DiagnosisCard
                                  dimId={d.id}
                                  dimName={d.name}
                                  score={score}
                                  questionCount={qCount}
                                  diagnosisText={diagnosis?.text}
                                  loading={isLoading}
                                  isFallback={diagnosis?.isFallback}
                                  collapsed={!isExpanded}
                                  onExpand={() => handleExpand(d.id)}
                                  onRegenerate={handleRegenerateDiagnosis}
                                  onRetakeDimension={handleRetakeDimension}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* 答题概览 */}
              <div className="mt-6">
                <div className="card p-5 sm:p-6">
                  <h3 className="font-serif text-ink-900 text-[15px] font-semibold tracking-tightserif mb-3">
                    答题概览
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-[22px] font-bold text-deep-navy-600">{records.length}</div>
                      <div className="text-[12px] text-ink-500">总题数</div>
                    </div>
                    <div>
                      <div className="text-[22px] font-bold" style={{ color: '#5B8C5A' }}>
                        {records.filter((r) => r.isCorrect).length}
                      </div>
                      <div className="text-[12px] text-ink-500">答对题数</div>
                    </div>
                    <div>
                      <div className="text-[22px] font-bold" style={{ color: '#D4956A' }}>
                        {records.filter((r) => !r.isCorrect).length}
                      </div>
                      <div className="text-[12px] text-ink-500">答错/跳过</div>
                    </div>
                    <div>
                      <div className="text-[22px] font-bold text-ink-700">
                        {Math.round(records.reduce((sum, r) => sum + (r.timeSpent || 0), 0) / 60)}min
                      </div>
                      <div className="text-[12px] text-ink-500">总用时</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 复测对比关键数据 */}
              {compareData && !isFirstTime && (
                <div className="mt-6">
                  <div className="card p-5 sm:p-6" style={{ background: 'linear-gradient(180deg, rgba(232,239,245,0.25), rgba(232,239,245,0.08))' }}>
                    <div className="flex items-center gap-2 mb-4">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E3158" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 3v18h18"/>
                        <path d="M7 14l4-4 4 4 5-5"/>
                      </svg>
                      <h3 className="font-serif text-ink-900 text-[15px] font-semibold tracking-tightserif">
                        对比上次测评
                        <span className="ml-2 text-[11px] font-normal text-ink-500">
                          （{new Date(previousSnap.takenAt).toLocaleDateString('zh-CN')}）
                        </span>
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* 总分变化 */}
                      <div className="rounded-lg bg-white/70 border border-ink-100 p-4 flex flex-col gap-1.5">
                        <span className="text-[12px] text-ink-500 font-medium">总分变化</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[13px] text-ink-500 line-through">{compareData.prevTotal}分</span>
                          <span className="text-[19px] font-bold text-ink-900">{totalScore}分</span>
                        </div>
                        <div
                          className={`inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-full text-[12.5px] font-semibold ${
                            compareData.deltaTotal > 0
                              ? 'bg-emerald-50 text-emerald-600'
                              : compareData.deltaTotal < 0
                              ? 'bg-red-50 text-red-500'
                              : 'bg-ink-100 text-ink-600'
                          }`}
                        >
                          {compareData.deltaTotal > 0 ? (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
                              +{compareData.deltaTotal}
                            </>
                          ) : compareData.deltaTotal < 0 ? (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                              {compareData.deltaTotal}
                            </>
                          ) : (
                            <>持平 0</>
                          )}
                        </div>
                      </div>
                      {/* 提升最大的维度 */}
                      {compareData.mostImproved && (
                        <div className="rounded-lg bg-white/70 border border-ink-100 p-4 flex flex-col gap-1.5">
                          <span className="text-[12px] text-ink-500 font-medium">提升最大</span>
                          <span className="text-[15px] font-bold text-ink-900 leading-tight">
                            {compareData.mostImproved.name}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[12px] text-ink-500 line-through">{compareData.mostImproved.prev}分</span>
                            <span className="text-[12.5px] text-ink-700">→</span>
                            <span className="text-[13px] font-semibold text-ink-900">{compareData.mostImproved.curr}分</span>
                            {compareData.mostImproved.delta > 0 && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600">
                                +{compareData.mostImproved.delta}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {/* 仍需加强的维度 */}
                      {compareData.weakestNow && (
                        <div className="rounded-lg bg-white/70 border border-ink-100 p-4 flex flex-col gap-1.5">
                          <span className="text-[12px] text-ink-500 font-medium">仍需加强</span>
                          <span className="text-[15px] font-bold text-ink-900 leading-tight">
                            {compareData.weakestNow.name}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[13px] font-semibold" style={{ color: '#D4956A' }}>
                              当前 {compareData.weakestNow.curr} 分
                            </span>
                            {compareData.weakestNow.delta <= 0 ? (
                              <span className="px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-600">
                                {compareData.weakestNow.delta === 0 ? '无进步' : `${compareData.weakestNow.delta}分`}
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-ink-100 text-ink-600">
                                未达强项线
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 3+ 次快照时显示 "查看完整成长曲线" 链接 */}
                    {snapshotCount >= 3 && (
                      <div className="mt-4 text-center">
                        <Link
                          to="/growth"
                          className="inline-flex items-center gap-1.5 text-[13px] text-deep-navy-600 hover:text-deep-navy-800 font-medium underline underline-offset-2"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                          </svg>
                          查看完整成长曲线
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7 17L17 7"/>
                            <path d="M8 7h9v9"/>
                          </svg>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ====== 总分趋势折线图 ====== */}
          {hasData && snapshotCount >= 1 && (
            <div className="opacity-0 animate-fade-in-up mt-8"
                 style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
              <ScoreTrendChart snapshots={allSnapshots} />
            </div>
          )}

          {/* ====== 底部 CTA ====== */}
          <div className="opacity-0 animate-fade-in-up mt-10 text-center"
               style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            {hasData && (
              <button
                onClick={handleRetake}
                className="btn-outline min-w-[220px]"
              >
                重新测试
              </button>
            )}
            <p className="mt-3 text-[12.5px] text-ink-500">
              {hasData ? '想再挑战一次？' : '暂无答题记录，请先完成测评'}
            </p>
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

      {/* ====== G2-4 & G2-1: 分数构成 Modal（点击维度分数弹出） ====== */}
      {scoreModalData && (
        <ScoreBreakdownModal
          open={!!scoreModalDimId}
          onClose={() => setScoreModalDimId(null)}
          dimId={scoreModalData.dimId}
          dimName={scoreModalData.dimName}
          score={scoreModalData.score}
          records={scoreModalData.records}
          onRetakeDimension={handleRetakeDimension}
        />
      )}
    </div>
  );
}
