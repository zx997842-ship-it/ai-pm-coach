import { useState, useMemo } from 'react';

/**
 * 检查诊断文本的核心段落是否引用了"具体题号"（第X题 / 第N题 / 数字 1-25）
 * Prompt 明确要求 LLM 必须引用 1-25 的"答题顺序号"，如果没有引用则算失控。
 * @param {object} sections 已解析的 sections 对象
 * @returns {boolean} true=至少一处引用了题号；false=完全没引用
 */
function hasQuestionNumberReference(sections) {
  const targets = [
    sections?.['具体问题'],
    sections?.['原因推测'],
    sections?.['基于事实的鼓励'],
    sections?.['进阶方向'], // >=90 分的情况下【具体问题】改名"进阶方向"
  ].filter(Boolean).join('\n');
  if (!targets) return true; // 没有任何目标段落，跳过校验（避免误判）

  // 匹配：第X题 / 第Ｎ题 / N题（N为 1-25 的数字）
  const hasExplicitMark = /第\s*\d+\s*题/.test(targets);
  if (hasExplicitMark) return true;

  // 宽松一点：包含 1-25 之间的独立数字（作为题号引用）
  const hasNumberInRange = /(?<!\d)(?:[1-9]|1\d|2[0-5])(?!\d)/.test(targets);
  return hasNumberInRange;
}

function parseDiagnosis(text) {
  if (!text) return {};
  const result = {};
  const regex = /【([^】]+)】\s*\n?([\s\S]*?)(?=【[^】]+】|$)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    result[match[1].trim()] = match[2].trim();
  }
  return result;
}

function parseResources(text) {
  if (!text) return [];
  const resources = [];
  const blocks = text.split(/\n(?=资源\d+)/);
  for (const block of blocks) {
    const res = {};
    const lines = block.split('\n');
    for (const line of lines) {
      const m = line.match(/^(标题|来源平台|资源类型|预计学习时长|推荐理由|搜索建议|资源链接)[：:]\s*(.*)/);
      if (m) {
        res[m[1]] = m[2].trim();
      }
    }
    if (res['标题'] || res['搜索建议']) {
      resources.push(res);
    }
  }
  return resources;
}

function getScoreColor(score) {
  if (score >= 80) return '#5B8C5A';
  if (score >= 60) return '#1E3158';
  return '#D4956A';
}

const TYPE_BADGE_COLORS = {
  '文章': 'bg-blue-50 text-blue-600',
  '视频': 'bg-purple-50 text-purple-600',
  '书': 'bg-amber-50 text-amber-600',
  '课程': 'bg-green-50 text-green-600',
};

// ====== G2-2 申诉记录 localStorage ======
const APPEAL_KEY = 'ai_pm_coach_appeals';

function readAppeals() {
  try {
    const raw = localStorage.getItem(APPEAL_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function writeAppeal(record) {
  try {
    const list = readAppeals();
    list.push({ ...record, createdAt: Date.now() });
    // 最多保留 100 条
    while (list.length > 100) list.shift();
    localStorage.setItem(APPEAL_KEY, JSON.stringify(list));
    return true;
  } catch (e) {
    console.warn('申诉记录保存失败:', e);
    return false;
  }
}

export default function DiagnosisCard({
  dimId,
  dimName,
  score,
  questionCount = 0,
  diagnosisText,
  loading,
  isFallback,
  collapsed,
  onExpand,
  onRegenerate,          // G2-check: 点击"重新生成"按钮时调用
  onRetakeDimension,      // G2-2 & G2-4: 点击"重测这个维度"时调用
}) {
  // ========== 所有 Hooks 必须在任何 early return 之前声明（React Rules of Hooks） ==========
  const [showResources, setShowResources] = useState(false);
  const [appealOpen, setAppealOpen] = useState(false);
  const [appealText, setAppealText] = useState('');
  const [appealSubmitted, setAppealSubmitted] = useState(false);
  const [submittingAppeal, setSubmittingAppeal] = useState(false);

  // 纯函数派生值（每次渲染同步计算，不受分支影响，hooks 数量稳定）
  const sections = parseDiagnosis(diagnosisText);
  const resources = parseResources(sections['推荐资源'] || '');
  const scoreColor = getScoreColor(score);
  const isHighScore = score >= 90;
  const weaknessTitle = isHighScore ? '进阶方向' : '薄弱点';

  // G2: 诊断文本未引用题号时显示告警（useMemo 必须在 hooks 区内）
  const hasValidReference = useMemo(() => {
    if (!diagnosisText) return true; // 加载中或无数据时不校验
    return hasQuestionNumberReference(sections);
  }, [diagnosisText, sections]);

  // 提交申诉（函数声明，不依赖执行分支）
  const handleSubmitAppeal = () => {
    if (!appealText.trim() || submittingAppeal) return;
    setSubmittingAppeal(true);
    try {
      writeAppeal({
        dimId,
        dimName,
        score,
        diagnosisText,
        reason: appealText.trim(),
      });
      setAppealSubmitted(true);
    } finally {
      setTimeout(() => setSubmittingAppeal(false), 100);
    }
  };

  // ========== 渲染分支：仅在所有 hooks 声明后才可 early return ==========

  // G1-8: 维度答题 < 3 时，显示"答题数据不足，无法生成针对性诊断"
  if (questionCount > 0 && questionCount <= 2) {
    return (
      <div className="mt-3 p-4 rounded-xl bg-ink-50/40 border border-dashed border-ink-200">
        <p className="text-[13px] text-ink-500 leading-relaxed">
          答题数据不足，无法生成针对性诊断（仅 {questionCount} 题），建议你做一次专项测评。
        </p>
      </div>
    );
  }

  if (collapsed && !loading && !diagnosisText) {
    return (
      <button
        onClick={onExpand}
        className="mt-3 px-4 py-2 rounded-lg border border-deep-navy-200 text-deep-navy-600 text-[12.5px] font-medium hover:bg-deep-navy-50 transition-colors inline-flex items-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 21l-4.35-4.35"/>
          <circle cx="11" cy="11" r="8"/>
        </svg>
        展开查看诊断
      </button>
    );
  }

  if (loading) {
    return (
      <div className="mt-3 p-5 rounded-xl bg-ink-50/40 border border-ink-100 animate-pulse">
        <div className="flex items-center gap-2 text-[13px] text-ink-600">
          <svg className="w-4 h-4 animate-spin text-deep-navy-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          AI 正在为你生成针对性诊断（约 3 秒）
        </div>
      </div>
    );
  }

  if (!diagnosisText) return null;

  return (
    <div className="mt-3 rounded-xl bg-white/50 border border-ink-100 overflow-hidden relative">
      {isFallback && (
        <span className="absolute top-2 right-3 text-[10px] text-ink-300 font-normal">
          (基础诊断)
        </span>
      )}

      {/* G2: 诊断未引用题号时显示告警条 + 重新生成按钮 */}
      {diagnosisText && !hasValidReference && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-[12px] text-amber-800 min-w-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span className="truncate">诊断未引用具体题目，分析可能不够准确</span>
          </div>
          {onRegenerate && (
            <button
              onClick={() => onRegenerate(dimId)}
              disabled={loading}
              className="shrink-0 inline-flex items-center gap-1 text-[11.5px] px-2.5 py-1 rounded-md border border-amber-200 bg-white text-amber-700 hover:bg-amber-100/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              </svg>
              重新生成
            </button>
          )}
        </div>
      )}

      <div className="px-4 py-4 flex flex-col gap-3">
        {/* 一句话总结 */}
        {sections['一句话总结'] && (
          <p className="text-[15px] font-semibold leading-snug" style={{ color: scoreColor }}>
            {sections['一句话总结']}
          </p>
        )}

        {/* 薄弱点区块 */}
        {sections['具体问题'] && (
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
              {weaknessTitle}
            </span>
            <div className="rounded-lg border border-ink-100 overflow-hidden">
              <div className="px-3 pt-2.5 pb-1">
                <p className="text-[13px] font-semibold text-ink-800">
                  {isHighScore ? '可挑战的方向' : '核心知识点'}
                </p>
              </div>
              <div className="mx-3 mb-2 px-3 py-2 rounded bg-ink-50/70 border border-ink-100/50">
                <p className="text-[12px] text-ink-600 leading-relaxed">
                  {sections['具体问题']}
                </p>
              </div>
              {sections['原因推测'] && (
                <div className="px-3 pb-2">
                  <p className="text-[12.5px] text-ink-600 leading-relaxed">
                    {sections['原因推测']}
                  </p>
                </div>
              )}
              {sections['下一步行动'] && (
                <div className="px-3 pb-2.5 flex items-start gap-2">
                  <span className="text-deep-navy-600 font-bold mt-0.5">→</span>
                  <p className="flex-1 text-[12.5px] text-deep-navy-600 font-semibold leading-relaxed">
                    {sections['下一步行动']}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 鼓励语 — 绿色细边框 */}
        {sections['基于事实的鼓励'] && (
          <div className="rounded-lg border border-green-200 bg-green-50/30 px-3 py-2.5">
            <p className="text-[12.5px] text-green-700 leading-relaxed">
              {sections['基于事实的鼓励']}
            </p>
          </div>
        )}

        {/* 推荐资源 — 放在卡片底部 */}
        {resources.length > 0 && (
          <div className="pt-1">
            <button
              onClick={() => setShowResources(!showResources)}
              className="text-[12px] text-deep-navy-500 hover:text-deep-navy-700 underline underline-offset-2 inline-flex items-center gap-1"
            >
              {showResources ? '收起推荐资源' : '查看推荐资源'}
              <svg className={`w-3 h-3 transition-transform ${showResources ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>

            {showResources && (
              <div className="flex flex-col gap-2 mt-2">
                {resources.map((res, i) => (
                  <div key={i} className="rounded-lg border border-deep-navy-100 bg-deep-navy-50/20 p-3 flex flex-col gap-1.5">
                    {/* 顶部：标题（可点击链接）+ 类型徽章 */}
                    <div className="flex items-start justify-between gap-2">
                      {res['资源链接'] ? (
                        <a
                          href={res['资源链接']}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] font-semibold text-deep-navy-700 hover:text-deep-navy-900 hover:underline leading-snug"
                        >
                          {res['标题'] || '(无标题)'}
                        </a>
                      ) : (
                        <p className="text-[13px] font-semibold text-ink-800 leading-snug">
                          {res['标题'] || '(无标题)'}
                        </p>
                      )}
                      {res['资源类型'] && (
                        <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium ${TYPE_BADGE_COLORS[res['资源类型']] || 'bg-ink-100 text-ink-600'}`}>
                          {res['资源类型']}
                        </span>
                      )}
                    </div>

                    {/* 第二行：来源平台 · 预计时长 */}
                    <div className="flex items-center gap-2 text-[11px] text-ink-500">
                      {res['来源平台'] && <span>{res['来源平台']}</span>}
                      {res['来源平台'] && res['预计学习时长'] && <span>·</span>}
                      {res['预计学习时长'] && <span>{res['预计学习时长']}</span>}
                    </div>

                    {/* 推荐理由 */}
                    {res['推荐理由'] && (
                      <p className="text-[11.5px] text-ink-500 leading-relaxed">
                        {res['推荐理由']}
                      </p>
                    )}

                    {/* 搜索按钮 */}
                    {res['搜索建议'] && (
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(res['搜索建议'])}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1.5 self-start text-[11.5px] text-deep-navy-600 hover:text-deep-navy-800 bg-deep-navy-50 hover:bg-deep-navy-100 rounded-md px-2.5 py-1.5 transition-colors"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"/>
                          <path d="M21 21l-4.35-4.35"/>
                        </svg>
                        用这个关键词搜索 →
                        <span className="text-[10.5px] text-ink-500 font-normal ml-0.5">
                          {res['搜索建议']}
                        </span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ====== G2-2 申诉入口 & 弹窗 ====== */}
        <div className="pt-2 border-t border-ink-100/60 mt-1">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setAppealOpen(v => !v)}
              className="text-[11.5px] text-ink-500 hover:text-ink-700 inline-flex items-center gap-1 underline underline-offset-2"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              我觉得评分不准
            </button>
            {onRetakeDimension && (
              <button
                onClick={() => onRetakeDimension(dimId)}
                className="text-[11.5px] px-2.5 py-1 rounded-md border border-ink-200 bg-white text-ink-600 hover:bg-ink-50 hover:border-ink-300 inline-flex items-center gap-1 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10"/>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                </svg>
                重测这个维度
              </button>
            )}
          </div>

          {appealOpen && (
            <div className="mt-3 rounded-lg border border-ink-200 bg-ink-50/40 p-3.5 flex flex-col gap-2.5">
              {appealSubmitted ? (
                <div className="flex flex-col gap-1">
                  <p className="text-[12.5px] text-ink-700 font-medium leading-relaxed">
                    ✓ 已收到你的反馈，感谢帮助我们改进评分模型。
                  </p>
                  {onRetakeDimension && (
                    <button
                      onClick={() => onRetakeDimension(dimId)}
                      className="mt-1 self-start text-[12px] px-3 py-1.5 rounded-md border border-deep-navy-200 bg-white text-deep-navy-700 hover:bg-deep-navy-50 inline-flex items-center gap-1 transition-colors"
                    >
                      重测这个维度
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14"/>
                        <path d="M12 5l7 7-7 7"/>
                      </svg>
                    </button>
                  )}
                  <p className="mt-1 text-[10.5px] text-ink-400 leading-relaxed">
                    你的反馈会用于改进评分模型
                  </p>
                </div>
              ) : (
                <>
                  <label className="text-[12px] text-ink-600 font-medium">
                    为什么觉得评分不准？（告诉我们具体原因）
                  </label>
                  <textarea
                    value={appealText}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v.length <= 1000) setAppealText(v);
                    }}
                    rows={3}
                    placeholder="例如：第3题我选择的答案有合理性，但被判错了…"
                    className="w-full resize-none rounded-md border border-ink-200 bg-white px-3 py-2 text-[12.5px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-deep-navy-300 focus:ring-1 focus:ring-deep-navy-200"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[11px] ${appealText.length > 900 ? 'text-orange-600' : 'text-ink-400'}`}>
                      {appealText.length}/1000
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setAppealOpen(false); setAppealText(''); setAppealSubmitted(false); }}
                        className="text-[12px] px-3 py-1.5 rounded-md text-ink-500 hover:text-ink-700 hover:bg-ink-100/60 transition-colors"
                        disabled={submittingAppeal}
                      >
                        取消
                      </button>
                      <button
                        onClick={handleSubmitAppeal}
                        disabled={!appealText.trim() || submittingAppeal}
                        className="text-[12px] px-3 py-1.5 rounded-md bg-deep-navy-600 text-white hover:bg-deep-navy-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1"
                      >
                        {submittingAppeal ? '提交中...' : '提交反馈'}
                      </button>
                    </div>
                  </div>
                  <p className="text-[10.5px] text-ink-400 leading-relaxed">
                    你的反馈会用于改进评分模型
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
