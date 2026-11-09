import { REAL_QUESTIONS } from '../data/content.js';

const DIM_IDS = ['ai-cognition', 'problem-framing', 'prompt-design', 'data-eval', 'product-strategy', 'cross-team'];

// ====== 读取历史快照中答过的题ID（用于复测优先避开） ======
const SNAPSHOT_KEY = 'ai_pm_coach_snapshots';

function getPreviouslyAnsweredIds() {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    const ids = new Set();
    arr.forEach((snap) => {
      if (Array.isArray(snap.answeredIds)) {
        snap.answeredIds.forEach((id) => ids.add(id));
      }
    });
    return ids;
  } catch (e) {
    return new Set();
  }
}

// ====== 分数贡献 ======
function randInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getScoreContribution(difficulty, isCorrect) {
  if (isCorrect) {
    if (difficulty >= 4) return randInRange(90, 100);
    if (difficulty === 3) return randInRange(70, 80);
    return randInRange(50, 60); // difficulty 1-2
  } else {
    if (difficulty >= 4) return randInRange(50, 60);
    if (difficulty === 3) return randInRange(40, 50);
    return randInRange(20, 30); // difficulty 1-2
  }
}

// ====== 初始化 CAT 状态 ======
export function initCATState() {
  const dims = {};
  DIM_IDS.forEach((id) => {
    dims[id] = { difficulty: 3, questionCount: 0, score: 0, usedQuestionIds: [] };
  });
  return {
    dims,
    totalQuestions: 0,
    questions: [], // 已答题目日志
  };
}

// ====== 选维度：按"还没测够3题的维度"轮询，优先题目数最少的 ======
export function selectNextDimension(state) {
  const candidates = DIM_IDS.filter((id) => state.dims[id].questionCount < 3);
  if (candidates.length === 0) {
    // 所有维度都 >= 3，选题目数最少的维度继续
    const minCount = Math.min(...DIM_IDS.map((id) => state.dims[id].questionCount));
    return DIM_IDS.find((id) => state.dims[id].questionCount === minCount);
  }
  const minCount = Math.min(...candidates.map((id) => state.dims[id].questionCount));
  return candidates.find((id) => state.dims[id].questionCount === minCount);
}

// ====== 选题：在该维度内选当前难度档的一道题（随机） ======
// 复测时优先抽用户从未答过的题；若某维度"未答过题库"不够，再放开限制使用旧题
export function selectQuestion(state, dimId) {
  const targetDifficulty = state.dims[dimId].difficulty;
  const usedIds = state.dims[dimId].usedQuestionIds;
  const prevAnsweredIds = getPreviouslyAnsweredIds();

  const dimName = DIM_IDS.indexOf(dimId) + 1;

  // 辅助：在指定难度档内筛选候选题
  const filterByDiff = (difficulty, excludeUsed) => {
    return REAL_QUESTIONS.filter((q) => {
      if (q.dimId !== dimId) return false;
      if (q.difficulty !== difficulty) return false;
      if (excludeUsed && usedIds.includes(q.id)) return false;
      return true;
    });
  };

  // 辅助：从候选中优先选"未答过"的，不够时再放开使用旧题
  const pickWithFreshFilter = (candidates) => {
    if (candidates.length === 0) return null;
    const fresh = candidates.filter((q) => !prevAnsweredIds.has(q.id));
    const pool = fresh.length > 0 ? fresh : candidates;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  let actualDifficulty = targetDifficulty;
  let candidates = filterByDiff(targetDifficulty, true);

  // 若精确匹配无题，扩散到相邻难度
  if (candidates.length === 0) {
    for (let offset = 1; offset <= 4; offset++) {
      for (const sign of [1, -1]) {
        const altDiff = targetDifficulty + sign * offset;
        if (altDiff >= 1 && altDiff <= 5) {
          candidates = filterByDiff(altDiff, true);
          if (candidates.length > 0) {
            actualDifficulty = altDiff;
            break;
          }
        }
      }
      if (candidates.length > 0) break;
    }
  }

  // 最终兜底：该维度任意未用题目（包含已答过的）
  if (candidates.length === 0) {
    candidates = REAL_QUESTIONS.filter(
      (q) => q.dimId === dimId && !usedIds.includes(q.id)
    );
    if (candidates.length > 0) {
      actualDifficulty = candidates[0].difficulty;
    }
  }

  if (candidates.length === 0) return null;

  // 关键：优先选"从未答过"的题，不够时再放开使用旧题
  const picked = pickWithFreshFilter(candidates);

  const isFresh = !prevAnsweredIds.has(picked.id);
  console.log(
    `[CAT 抽题] 维度${dimName}(${dimId}) | 当前难度档: ${state.dims[dimId].difficulty} | ` +
    `选定题目 ID=${picked.id} 难度=${picked.difficulty} | ` +
    `该维度已答: ${state.dims[dimId].questionCount}题 | ` +
    `候选池: ${candidates.length}题 | ` +
    `${isFresh ? '✨ 新题（未答过）' : '♻️ 复用旧题（该维度新题已耗尽）'}`
  );

  return picked;
}

// ====== 更新难度 & 分数 ======
export function updateDifficultyAndScore(state, dimId, isCorrect, questionDifficulty) {
  const dim = state.dims[dimId];
  const oldDifficulty = dim.difficulty;
  const oldScore = dim.score;

  // 难度调整
  if (isCorrect) {
    dim.difficulty = Math.min(5, dim.difficulty + 1);
  } else {
    dim.difficulty = Math.max(1, dim.difficulty - 1);
  }

  // 分数计算
  const contribution = getScoreContribution(questionDifficulty, isCorrect);
  dim.score = Math.round(oldScore * 0.7 + contribution * 0.3);
  dim.questionCount++;
  state.totalQuestions++;

  // 记录题目
  state.questions.push({
    dimId,
    questionDifficulty,
    isCorrect,
    contribution,
    scoreAfter: dim.score,
  });

  const dimName = DIM_IDS.indexOf(dimId) + 1;

  console.log(
    `[CAT 分数] 维度${dimName}(${dimId}) | ` +
    `${isCorrect ? '答对' : '答错'} | ` +
    `题目难度: ${questionDifficulty} | ` +
    `难度档: ${oldDifficulty}→${dim.difficulty} | ` +
    `贡献分: ${contribution} | ` +
    `分数: ${oldScore}→${dim.score} (${oldScore}×0.7 + ${contribution}×0.3)`
  );

  return { contribution, oldScore, newScore: dim.score };
}

// ====== 终止条件：总题数 >= 25 且每个维度 >= 3 ======
export function checkTermination(state) {
  if (state.totalQuestions < 25) return false;
  return DIM_IDS.every((id) => state.dims[id].questionCount >= 3);
}

// ====== 从 CAT 状态提取各维度分数（用于结果页） ======
export function extractDimensionScores(state) {
  const scores = {};
  DIM_IDS.forEach((id) => {
    scores[id] = state.dims[id].score;
  });
  return scores;
}

// ====== localStorage 持久化 ======
const CAT_STORAGE_KEY = 'ai_pm_coach_cat_state';

export function saveCATState(state) {
  try {
    localStorage.setItem(CAT_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('CAT state 存储失败:', e);
  }
}

export function loadCATState() {
  try {
    const raw = localStorage.getItem(CAT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function clearCATState() {
  try {
    localStorage.removeItem(CAT_STORAGE_KEY);
  } catch (e) {}
}