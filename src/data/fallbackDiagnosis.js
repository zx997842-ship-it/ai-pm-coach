/**
 * 降级诊断文本 — AI 不可用时使用
 * 6 个维度 × 4 个分数段 = 24 段
 * 每段包含五个部分，与 LLM 输出格式一致
 */

export const FALLBACK_DIAGNOSIS = {
  'ai-cognition': {
    // 0-40
    'low': {
      summary: '你对大模型核心能力边界缺乏基本判断',
      weakness: [{
        point: '技术概念理解',
        evidence: '你在涉及 RAG、Fine-tuning、Agent 等核心概念的题目上答错较多',
        cause: '你可能还没有系统学习过大模型技术栈，对各项技术的适用场景理解模糊',
        action: '建议先阅读《大语言模型》入门系列文章，重点理解 RAG 与 Fine-tuning 的区别',
      }],
      encouragement: '你完成了全部测评，说明你有意愿了解 AI 技术，这是很好的起点',
    },
    // 40-60
    'mid-low': {
      summary: '你对 AI 技术有初步认知，但核心概念区分不清',
      weakness: [{
        point: 'RAG 与 Fine-tuning 适用场景',
        evidence: '你在 RAG 和 Fine-tuning 选择相关题目上答错',
        cause: '你可能读过一些科普文章，但没有实际做过技术选型',
        action: '建议阅读 OpenAI 官方 RAG 指南，对比两种方案的成本和效果',
      }],
      encouragement: '你对基础概念有一定判断力，继续深化就能建立扎实的技术认知',
    },
    // 60-80
    'mid-high': {
      summary: '你的 AI 技术认知基本达标，但缺乏深度理解',
      weakness: [{
        point: '模型能力边界判断',
        evidence: '你在涉及模型能力上限和局限性判断的题目上偶有失误',
        cause: '你可能对模型能力的理解还停留在理论层面，缺乏实际踩坑经验',
        action: '建议动手搭建一个简单的 RAG Demo，实际体验召回率和生成质量的权衡',
      }],
      encouragement: '你在多数技术判断题上答得很好，说明你已具备产品视角的技术理解力',
    },
    // 80-100
    'high': {
      summary: '你的 AI 技术认知扎实，可以挑战更深层的架构问题',
      weakness: [{
        point: '进阶架构设计',
        evidence: '高分通过基础测评，可以尝试更复杂的架构判断',
        cause: '你已经掌握了核心概念，下一步是理解多模型协作和 Agent 架构设计',
        action: '建议研究 LangChain 的 Multi-Agent 架构，尝试设计一个多步推理工作流',
      }],
      encouragement: '你在技术认知维度表现优异，说明你不仅有产品思维，也有技术深度',
    },
  },

  'problem-framing': {
    'low': {
      summary: '你缺乏判断"什么场景适合用 AI"的基本框架',
      weakness: [{
        point: 'AI 场景适配性判断',
        evidence: '你在场景选择类题目上答错较多',
        cause: '你可能还没有从产品视角思考过 AI 的能力边界',
        action: '建议阅读《AI 产品经理》第一章节，学习用"场景画布"评估 AI 机会',
      }],
      encouragement: '你愿意花时间完成测评，说明你在认真思考 AI 产品方向',
    },
    'mid-low': {
      summary: '你能识别 AI 机会，但场景评估不够系统',
      weakness: [{
        point: '技术可行性与商业价值平衡',
        evidence: '你在评估 AI 产品机会的题目上判断不够准确',
        cause: '你可能更偏直觉判断，缺乏系统化的评估框架',
        action: '建议用 TAM/SAM/SOM 框架练习评估一个 AI 产品机会',
      }],
      encouragement: '你在部分场景判断题上答得不错，说明你已有产品直觉',
    },
    'mid-high': {
      summary: '你的场景选择能力良好，但 MVP 定义还需精进',
      weakness: [{
        point: 'MVP 范围界定',
        evidence: '你在 MVP 定义相关题目上偶有失误',
        cause: '你可能倾向于做大而全的方案，不够聚焦核心假设验证',
        action: '建议阅读 Lean Startup 关于 MVP 的章节，练习用假设驱动的方式定义 MVP',
      }],
      encouragement: '你在场景可行性判断上表现不错，说明你有产品思维基础',
    },
    'high': {
      summary: '你的场景选择能力出色，可以挑战更复杂的产品决策',
      weakness: [{
        point: '多场景优先级排序',
        evidence: '高分通过，可以尝试更复杂的多场景决策',
        cause: '你已经掌握了单场景评估，下一步是多场景的资源分配和优先级判断',
        action: '建议研究 RICE 框架，练习对多个 AI 场景进行优先级排序',
      }],
      encouragement: '你在场景选择维度表现优异，说明你具备优秀的产品判断力',
    },
  },

  'prompt-design': {
    'low': {
      summary: '你对 Prompt 设计缺乏基本方法论',
      weakness: [{
        point: 'Prompt 基础技巧',
        evidence: '你在 Prompt 设计相关题目上答错较多',
        cause: '你可能还没有实际写过复杂的 Prompt',
        action: '建议先阅读 OpenAI Prompt Engineering Guide，动手练习 10 个基础 Prompt',
      }],
      encouragement: '你完成了测评，说明你对 Prompt 设计有学习的意愿',
    },
    'mid-low': {
      summary: '你会写基础 Prompt，但缺乏高级技巧',
      weakness: [{
        point: '角色扮演与思维链技巧',
        evidence: '你在 CoT 和 Role-play 相关题目上答错',
        cause: '你可能只用过简单的对话式 Prompt，没有尝试过结构化技巧',
        action: '建议阅读 Anthropic 的 Prompt Engineering 文档，重点学习 CoT 技巧',
      }],
      encouragement: '你在基础 Prompt 题目上答得不错，说明你有实操经验',
    },
    'mid-high': {
      summary: '你的 Prompt 设计能力不错，但对话流设计还需提升',
      weakness: [{
        point: '多轮对话状态管理',
        evidence: '你在对话流设计相关题目上偶有失误',
        cause: '你可能更关注单轮 Prompt 质量，对多轮上下文管理不够重视',
        action: '建议研究 ChatGPT 的对话管理机制，设计一个多轮信息收集对话流',
      }],
      encouragement: '你在 Prompt 技巧题上表现良好，说明你有实际动手经验',
    },
    'high': {
      summary: '你的 Prompt 设计能力出色，可以挑战 Agent 级交互',
      weakness: [{
        point: 'Agent 级 Prompt 编排',
        evidence: '高分通过，可以尝试更复杂的 Agent 交互设计',
        cause: '你已经掌握了高级技巧，下一步是多步骤 Agent 的 Prompt 编排',
        action: '建议研究 ReAct 框架，设计一个调用外部工具的 Agent Prompt',
      }],
      encouragement: '你在 Prompt 设计维度表现优异，说明你有很强的实操能力',
    },
  },

  'data-eval': {
    'low': {
      summary: '你缺乏 AI 产品评估的基本思维框架',
      weakness: [{
        point: '评估指标定义',
        evidence: '你在评估指标相关题目上答错较多',
        cause: '你可能还没有建立 AI 产品效果评估的意识',
        action: '建议阅读 Google ML Crash Course 的评估章节，学习分类和回归指标',
      }],
      encouragement: '你完成了测评，说明你在认真思考数据与评估的重要性',
    },
    'mid-low': {
      summary: '你了解基本评估概念，但缺乏实战经验',
      weakness: [{
        point: 'A/B 测试设计',
        evidence: '你在 A/B 测试相关题目上判断不够准确',
        cause: '你可能知道 A/B 测试的概念，但没有实际设计过 AI 产品的实验',
        action: '建议阅读 Trustworthy Online Experiments，学习如何设计统计显著的 A/B 测试',
      }],
      encouragement: '你在基础评估概念题上答得不错，说明你有数据意识',
    },
    'mid-high': {
      summary: '你的评估思维良好，但线上监控还需加强',
      weakness: [{
        point: '线上效果监控体系',
        evidence: '你在监控指标相关题目上偶有失误',
        cause: '你可能更关注离线评估，对线上数据漂移和效果衰减不够重视',
        action: '建议研究 MLOps 的监控最佳实践，设计一个 AI 产品的线上监控看板',
      }],
      encouragement: '你在评估方法论题目上表现良好，说明你有扎实的数据思维',
    },
    'high': {
      summary: '你的评估思维出色，可以挑战更复杂的评估体系',
      weakness: [{
        point: '多维度评估体系设计',
        evidence: '高分通过，可以尝试更复杂的评估体系设计',
        cause: '你已经掌握了核心评估方法，下一步是设计端到端的评估闭环',
        action: '建议研究 LLM-as-Judge 方法论，设计一个自动化+人工的混合评估流程',
      }],
      encouragement: '你在数据与评估维度表现优异，说明你具备高级数据产品思维',
    },
  },

  'product-strategy': {
    'low': {
      summary: '你缺乏 AI 产品战略的基本认知',
      weakness: [{
        point: '产品定位与差异化',
        evidence: '你在产品策略相关题目上答错较多',
        cause: '你可能还没有从战略层面思考过 AI 产品的竞争格局',
        action: '建议阅读《创新者的窘境》，理解技术变革如何影响产品战略',
      }],
      encouragement: '你完成了测评，说明你在认真思考 AI 产品方向',
    },
    'mid-low': {
      summary: '你了解产品策略基础，但差异化判断不足',
      weakness: [{
        point: 'AI 产品护城河判断',
        evidence: '你在护城河相关题目上判断不够准确',
        cause: '你可能对数据飞轮和技术壁垒的理解不够深入',
        action: '建议研究 Notion AI 和 Copilot 的竞争策略，分析它们的护城河',
      }],
      encouragement: '你在定价和商业模式题上答得不错，说明你有商业敏感度',
    },
    'mid-high': {
      summary: '你的产品策略思维良好，但落地执行还需提升',
      weakness: [{
        point: '从战略到执行的转化',
        evidence: '你在 PRD 和需求定义相关题目上偶有失误',
        cause: '你可能更擅长宏观思考，对 AI 功能的具体落地不够精细',
        action: '建议阅读《启示录》关于 AI 产品 PRD 的章节，练习写一份 AI 功能需求文档',
      }],
      encouragement: '你在战略选择题上表现良好，说明你有不错的战略眼光',
    },
    'high': {
      summary: '你的产品策略能力出色，可以挑战更复杂的商业决策',
      weakness: [{
        point: '平台 vs 垂直 vs 工具层决策',
        evidence: '高分通过，可以尝试更复杂的战略决策',
        cause: '你已经掌握了基础战略框架，下一步是在不确定环境下做多维度决策',
        action: '建议研究 HuggingFace 和 OpenAI 的商业模式差异，分析平台与工具层的取舍',
      }],
      encouragement: '你在产品策略维度表现优异，说明你具备出色的战略思维',
    },
  },

  'cross-team': {
    'low': {
      summary: '你在 AI 跨团队协作上缺乏基本认知',
      weakness: [{
        point: '与算法团队协作',
        evidence: '你在跨团队协作题目上答错较多',
        cause: '你可能还没有与算法和工程团队协作推进 AI 项目的经验',
        action: '建议阅读《AI 产品经理手册》，了解 AI 项目中各角色的协作模式',
      }],
      encouragement: '你完成了测评，说明你在认真思考团队协作的重要性',
    },
    'mid-low': {
      summary: '你知道协作的重要性，但方法不够有效',
      weakness: [{
        point: '需求沟通与对齐',
        evidence: '你在需求沟通相关题目上判断不够准确',
        cause: '你可能更习惯传统产品协作模式，对 AI 项目的特殊性不够了解',
        action: '建议学习如何用"模型评估指标"与算法团队对齐需求，减少沟通损耗',
      }],
      encouragement: '你在协作意识题上答得不错，说明你有团队思维',
    },
    'mid-high': {
      summary: '你的协作能力良好，但项目节奏把控还需提升',
      weakness: [{
        point: 'AI 项目节奏管理',
        evidence: '你在项目推进相关题目上偶有失误',
        cause: '你可能对 AI 项目的迭代节奏和不确定性不够熟悉',
        action: '建议研究 Google PAIR 的 AI 项目管理框架，学习如何管理 AI 项目的不确定性',
      }],
      encouragement: '你在协作方法题上表现良好，说明你有实际协作经验',
    },
    'high': {
      summary: '你的跨团队协作能力出色，可以挑战更复杂的组织决策',
      weakness: [{
        point: '跨组织 AI 协作',
        evidence: '高分通过，可以尝试更复杂的协作场景',
        cause: '你已经掌握了核心协作技巧，下一步是在大型组织中推动 AI 变革',
        action: '建议研究大型科技公司如何建立 AI 团队和协作流程，思考组织设计问题',
      }],
      encouragement: '你在跨团队协作维度表现优异，说明你具备优秀的领导力',
    },
  },
};

/**
 * 根据分数获取对应的降级诊断
 */
export function getFallbackDiagnosis(dimId, score) {
  const band = score < 40 ? 'low' : score < 60 ? 'mid-low' : score < 80 ? 'mid-high' : 'high';
  const data = FALLBACK_DIAGNOSIS[dimId]?.[band];
  if (!data) return null;

  const dimResources = LEARNING_RESOURCES[dimId] || {};
  const resources = dimResources[band] || dimResources['mid-low'] || [];
  const resourceText = resources.length > 0
    ? resources.map((r, i) => `资源${i + 1}\n标题：${r.title}\n来源平台：${r.platform}\n资源类型：${r.type}\n预计学习时长：${r.time}\n推荐理由：${r.reason}\n搜索建议：${r.searchKeywords}\n资源链接：${r.url || ''}`).join('\n\n')
    : '';

  const text = [
    `【一句话总结】\n${data.summary}`,
    `【具体问题】\n${data.weakness[0].evidence}`,
    `【原因推测】\n${data.weakness[0].cause}`,
    `【下一步行动】\n${data.weakness[0].action}`,
    `【推荐资源】\n${resourceText}`,
    `【基于事实的鼓励】\n${data.encouragement}`,
  ].join('\n\n');

  return text;
}

/**
 * 学习资源推荐 — 每个维度 × 4个分数段，推荐不同资源
 * 分数段：low(0-40) / mid-low(40-60) / mid-high(60-80) / high(80-100)
 */
export const LEARNING_RESOURCES = {
  'ai-cognition': {
    low: [
      { title: 'Generative AI for Everyone by Andrew Ng', platform: 'DeepLearning.AI', type: '课程', time: '90分钟', reason: '零基础入门LLM概念，建立AI技术认知框架', searchKeywords: 'DeepLearning.AI Generative AI for Everyone Andrew Ng', url: 'https://www.deeplearning.ai/courses/generative-ai-for-everyone/' },
      { title: 'What is a Large Language Model (LLM)?', platform: 'Google Cloud官方博客', type: '文章', time: '15分钟', reason: '用通俗语言理解LLM是什么、能做什么不能做什么', searchKeywords: 'Google Cloud what is large language model LLM', url: 'https://cloud.google.com/learn/what-is-a-large-language-model' },
      { title: 'AI for Beginners - Microsoft Learn', platform: 'Microsoft Learn', type: '课程', time: '180分钟', reason: '从零开始系统学习AI基础知识', searchKeywords: 'Microsoft Learn AI for Beginners', url: 'https://microsoft.github.io/AI-For-Beginners/' },
    ],
    'mid-low': [
      { title: '《Building LLM Applications》by Andrew Ng', platform: 'DeepLearning.AI', type: '课程', time: '120分钟', reason: '系统理解LLM能力边界，弥补技术认知短板', searchKeywords: 'DeepLearning.AI Andrew Ng Building LLM Applications', url: 'https://www.deeplearning.ai/short-courses/building-systems-with-chatgpt-api/' },
      { title: 'OpenAI GPT Best Practices Guide', platform: 'OpenAI官方文档', type: '文章', time: '30分钟', reason: '理解RAG和Fine-tuning的适用场景，建立判断框架', searchKeywords: 'OpenAI GPT Best Practices Guide', url: 'https://platform.openai.com/docs/guides/gpt-best-practices' },
      { title: 'What is RAG? - IBM Technology', platform: 'IBM Technology YouTube', type: '视频', time: '8分钟', reason: '用动画直观理解RAG的原理和适用场景', searchKeywords: 'IBM Technology what is RAG retrieval augmented generation', url: 'https://www.youtube.com/watch?v=T-D1OfcDW1M' },
    ],
    'mid-high': [
      { title: 'LangChain官方教程', platform: 'LangChain官方文档', type: '文章', time: '90分钟', reason: '动手搭建Agent和RAG应用，获得实际选型经验', searchKeywords: 'LangChain documentation RAG Agent tutorial', url: 'https://python.langchain.com/docs/get_started/introduction' },
      { title: 'Fine-tuning vs RAG: A Practical Guide', platform: 'Anthropic官方博客', type: '文章', time: '25分钟', reason: '深入理解两种技术路线的取舍和成本对比', searchKeywords: 'Anthropic fine-tuning vs RAG practical guide', url: 'https://www.anthropic.com/engineering' },
      { title: 'LLM Visualization: A 3D Interactive Model', platform: 'bbycroft.net', type: '文章', time: '30分钟', reason: '通过3D可视化理解Transformer内部机制', searchKeywords: 'bbycroft LLM visualization transformer', url: 'https://bbycroft.net/llm' },
    ],
    high: [
      { title: 'Stanford CS324: Large Language Models', platform: 'Stanford Online', type: '课程', time: '600分钟', reason: 'Stanford研究生级别课程，深入LLM架构与训练', searchKeywords: 'Stanford CS324 Large Language Models course', url: 'https://stanford-cs324.github.io/winter2022/' },
      { title: 'Building Agentic Systems with LangGraph', platform: 'LangChain Academy', type: '课程', time: '180分钟', reason: '学习Multi-Agent架构设计，掌握复杂AI系统编排', searchKeywords: 'LangGraph LangChain building agentic systems', url: 'https://academy.langchain.com/courses/langgraph' },
      { title: '《Designing Machine Learning Systems》by Chip Huyen', platform: 'O\'Reilly', type: '书', time: '400分钟', reason: '从系统设计视角理解ML/LLM产品的工程化挑战', searchKeywords: 'Chip Huyen Designing Machine Learning Systems', url: 'https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/' },
    ],
  },
  'problem-framing': {
    low: [
      { title: 'Google PAIR AI设计指南', platform: 'Google PAIR官方', type: '文章', time: '45分钟', reason: '从零学习AI产品设计的基本原则和用户需求分析', searchKeywords: 'Google PAIR AI design guide', url: 'https://pair.withgoogle.com/guidebook/' },
      { title: '《The Design of Everyday AI Things》', platform: 'O\'Reilly', type: '书', time: '200分钟', reason: '建立AI产品设计思维，理解AI与用户的关系', searchKeywords: 'Design of Everyday AI Things book', url: 'https://www.oreilly.com/library/view/designing-everyday-ai/9781098157963/' },
      { title: 'AI Product Management 101', platform: 'Product School YouTube', type: '视频', time: '45分钟', reason: '入门级AI产品管理概览，建立基本框架', searchKeywords: 'Product School AI Product Management 101', url: 'https://www.youtube.com/results?search_query=Product+School+AI+Product+Management+101' },
    ],
    'mid-low': [
      { title: '《AI Product Manager\'s Handbook》', platform: 'Google Books', type: '书', time: '300分钟', reason: '系统学习AI产品机会评估，掌握场景画布方法论', searchKeywords: 'AI Product Manager Handbook book', url: 'https://books.google.com/books/about/AI_Product_Manager_s_Handbook.html' },
      { title: '《Machine Learning Yearning》by Andrew Ng', platform: 'DeepLearning.AI', type: '书', time: '180分钟', reason: '从技术视角理解什么场景适合用AI', searchKeywords: 'Andrew Ng Machine Learning Yearning', url: 'https://www.deeplearning.ai/machine-learning-yearning/' },
      { title: 'How to Evaluate AI Product Opportunities', platform: 'Reforge', type: '文章', time: '30分钟', reason: '学习用结构化框架评估AI产品机会', searchKeywords: 'Reforge evaluating AI product opportunities', url: 'https://www.reforge.com/blog/ai-product-opportunities' },
    ],
    'mid-high': [
      { title: '《The Lean Startup》by Eric Ries', platform: 'Amazon', type: '书', time: '250分钟', reason: '掌握MVP定义和假设验证方法论', searchKeywords: 'Eric Ries Lean Startup book', url: 'https://www.amazon.com/Lean-Startup-Eric-Ries/dp/0307887898' },
      { title: 'AI Product Strategy: Platform vs Vertical', platform: 'a16z官方博客', type: '文章', time: '20分钟', reason: '理解AI产品在平台层和垂直应用层的战略差异', searchKeywords: 'a16z AI product strategy platform vertical', url: 'https://a16z.com/ai/' },
      { title: 'Lenny\'s Podcast: AI Product Management', platform: 'Lenny\'s Podcast', type: '视频', time: '60分钟', reason: '顶级PM的AI产品策略讨论，实战经验丰富', searchKeywords: 'Lenny Podcast AI product management strategy', url: 'https://www.lennyspodcast.com/' },
    ],
    high: [
      { title: '《Good Strategy Bad Strategy》by Richard Rumelt', platform: 'Amazon', type: '书', time: '300分钟', reason: '掌握企业级战略思维，用于复杂AI产品决策', searchKeywords: 'Richard Rumelt Good Strategy Bad Strategy', url: 'https://www.amazon.com/Good-Strategy-Bad-Richard-Rumelt/dp/0307886239' },
      { title: 'RICE Prioritization Framework for AI Products', platform: 'Intercom官方博客', type: '文章', time: '15分钟', reason: '学习用RICE框架对多个AI场景进行优先级排序', searchKeywords: 'RICE framework AI product prioritization', url: 'https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/' },
      { title: 'HuggingFace vs OpenAI: Business Model Analysis', platform: 'Stratechery', type: '文章', time: '25分钟', reason: '分析平台层与工具层的商业模式差异', searchKeywords: 'Stratechery HuggingFace OpenAI business model', url: 'https://stratechery.com/' },
    ],
  },
  'prompt-design': {
    low: [
      { title: 'OpenAI Prompt Engineering Guide', platform: 'OpenAI官方文档', type: '文章', time: '45分钟', reason: '官方Prompt工程指南，从零开始学习所有基础技巧', searchKeywords: 'OpenAI Prompt Engineering Guide', url: 'https://platform.openai.com/docs/guides/prompt-engineering' },
      { title: 'ChatGPT Prompt Engineering for Developers', platform: 'DeepLearning.AI', type: '课程', time: '90分钟', reason: 'Andrew Ng与OpenAI合作的Prompt入门课程', searchKeywords: 'DeepLearning.AI ChatGPT Prompt Engineering course', url: 'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/' },
      { title: 'Best practices for prompt engineering', platform: 'Google AI官方文档', type: '文章', time: '25分钟', reason: 'Google官方的Prompt技巧总结', searchKeywords: 'Google AI prompt engineering best practices', url: 'https://ai.google.dev/gemini-api/docs/prompting-strategies' },
    ],
    'mid-low': [
      { title: 'Anthropic Prompt Engineering文档', platform: 'Anthropic官方文档', type: '文章', time: '30分钟', reason: '学习CoT和高级Prompt技巧的最佳资源', searchKeywords: 'Anthropic Claude Prompt Engineering', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview' },
      { title: 'Chain-of-Thought Prompting Explained', platform: 'Google AI博客', type: '文章', time: '20分钟', reason: '深入理解CoT原理和最佳实践', searchKeywords: 'Google AI chain of thought prompting explained', url: 'https://blog.google/technology/ai/' },
      { title: 'Prompt Engineering Guide by DAIR.AI', platform: 'DAIR.AI', type: '文章', time: '60分钟', reason: '社区最全面的Prompt工程指南，覆盖所有高级技巧', searchKeywords: 'DAIR.AI Prompt Engineering Guide', url: 'https://www.promptingguide.ai/' },
    ],
    'mid-high': [
      { title: 'Let\'s build GPT from scratch by Karpathy', platform: 'YouTube Karpathy频道', type: '视频', time: '120分钟', reason: '从底层理解LLM行为，写出更精准的Prompt', searchKeywords: 'Karpathy build GPT from scratch', url: 'https://www.youtube.com/watch?v=kCc8FmEb1nY' },
      { title: 'Multi-turn Conversation Design for LLMs', platform: 'OpenAI Cookbook', type: '文章', time: '30分钟', reason: '学习多轮对话的状态管理和上下文设计', searchKeywords: 'OpenAI cookbook multi-turn conversation design', url: 'https://cookbook.openai.com/' },
      { title: 'Structured Outputs with LLMs', platform: 'Instructor官方文档', type: '文章', time: '45分钟', reason: '掌握JSON模式、函数调用等结构化输出技巧', searchKeywords: 'Instructor structured outputs LLM Python', url: 'https://python.useinstructor.com/' },
    ],
    high: [
      { title: 'ReAct Prompting: Synergizing Reasoning and Acting', platform: 'Google Research', type: '文章', time: '45分钟', reason: 'ReAct框架论文，学习Agent级Prompt编排', searchKeywords: 'Google Research ReAct prompting reasoning acting', url: 'https://arxiv.org/abs/2210.03629' },
      { title: 'Building an AI Agent with Tool Use', platform: 'Anthropic官方文档', type: '文章', time: '40分钟', reason: '学习如何设计调用外部工具的Agent Prompt', searchKeywords: 'Anthropic building AI agent tool use', url: 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use' },
      { title: 'DSPy: Programming Foundation Models', platform: 'Stanford NLP', type: '文章', time: '90分钟', reason: '用编程方式自动优化Prompt，告别手工调参', searchKeywords: 'Stanford DSPy programming foundation models', url: 'https://dspy.ai/' },
    ],
  },
  'data-eval': {
    low: [
      { title: 'Google ML Crash Course', platform: 'Google AI官方', type: '课程', time: '300分钟', reason: '系统学习ML评估指标，建立数据思维', searchKeywords: 'Google Machine Learning Crash Course', url: 'https://developers.google.com/machine-learning/crash-course' },
      { title: 'ML Evaluation Metrics: A Beginner\'s Guide', platform: 'Towards Data Science', type: '文章', time: '20分钟', reason: '从零理解准确率、召回率、F1等基础指标', searchKeywords: 'machine learning evaluation metrics beginner guide', url: 'https://towardsdatascience.com/' },
      { title: 'Introduction to A/B Testing', platform: 'Khan Academy', type: '视频', time: '30分钟', reason: '统计学角度的A/B测试入门', searchKeywords: 'Khan Academy A/B testing introduction', url: 'https://www.khanacademy.org/math/statistics-probability' },
    ],
    'mid-low': [
      { title: '《Trustworthy Online Experiments》', platform: 'Cambridge University Press', type: '书', time: '400分钟', reason: 'A/B测试的"圣经"，学习统计显著性和实验设计', searchKeywords: 'Trustworthy Online Experiments book', url: 'https://www.cambridge.org/core/books/trustworthy-online-experiments/' },
      { title: 'LLM Evaluation Guide', platform: 'Anthropic官方博客', type: '文章', time: '20分钟', reason: '理解LLM评估的特殊性和业界最佳实践', searchKeywords: 'LLM evaluation Anthropic guide', url: 'https://www.anthropic.com/engineering/evaluating-language-models' },
      { title: 'Evaluating LLM Applications', platform: 'Weights & Biases', type: '文章', time: '30分钟', reason: '实操指南：如何用W&B做LLM应用评估', searchKeywords: 'Weights Biases evaluating LLM applications', url: 'https://wandb.ai/site' },
    ],
    'mid-high': [
      { title: '《Designing Machine Learning Systems》by Chip Huyen', platform: 'O\'Reilly', type: '书', time: '400分钟', reason: 'Chip Huyen的经典著作，覆盖ML系统设计与评估', searchKeywords: 'Chip Huyen Designing Machine Learning Systems', url: 'https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/' },
      { title: 'MLOps: Continuous Delivery for ML', platform: 'Google Cloud官方文档', type: '文章', time: '45分钟', reason: '学习ML系统的线上监控和持续交付', searchKeywords: 'Google Cloud MLOps continuous delivery', url: 'https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning' },
      { title: 'Monitoring ML Models in Production', platform: 'NVIDIA官方博客', type: '文章', time: '25分钟', reason: '学习数据漂移检测和模型效果衰减监控', searchKeywords: 'NVIDIA monitoring ML models production drift', url: 'https://developer.nvidia.com/blog/' },
    ],
    high: [
      { title: 'LLM-as-Judge: A New Evaluation Paradigm', platform: 'LMSYS Org', type: '文章', time: '30分钟', reason: 'Chatbot Arena团队提出的LLM评估新范式', searchKeywords: 'LMSYS LLM as Judge evaluation paradigm', url: 'https://lmsys.org/blog/' },
      { title: 'Building an LLM Evaluation Framework', platform: 'Anthropic官方博客', type: '文章', time: '40分钟', reason: '设计自动化+人工的混合评估流程', searchKeywords: 'Anthropic building LLM evaluation framework', url: 'https://www.anthropic.com/engineering' },
      { title: 'Evidently AI: Open-source ML Monitoring', platform: 'Evidently AI官方文档', type: '文章', time: '60分钟', reason: '动手搭建多维度评估体系的开源工具', searchKeywords: 'Evidently AI open source ML monitoring', url: 'https://www.evidentlyai.com/' },
    ],
  },
  'product-strategy': {
    low: [
      { title: 'AI Canon by a16z', platform: 'a16z官方博客', type: '文章', time: '90分钟', reason: '顶级VC整理的AI必读文章合集，建立战略认知', searchKeywords: 'a16z AI Canon articles', url: 'https://a16z.com/ai-canon/' },
      { title: '《The Innovator\'s Dilemma》by Clayton Christensen', platform: 'Amazon', type: '书', time: '300分钟', reason: '理解技术变革如何影响产品战略', searchKeywords: 'Clayton Christensen Innovator Dilemma book', url: 'https://www.amazon.com/Innovators-Dilemma-Clayton-M-Christensen/dp/0062060244' },
      { title: 'AI Product Strategy 101', platform: 'Reforge', type: '文章', time: '30分钟', reason: '入门级AI产品战略框架', searchKeywords: 'Reforge AI product strategy framework', url: 'https://www.reforge.com/' },
    ],
    'mid-low': [
      { title: '《The AI-First Company》by Ash Fontana', platform: 'Amazon', type: '书', time: '200分钟', reason: '理解AI公司的战略决策和竞争壁垒建设', searchKeywords: 'AI First Company Ash Fontana', url: 'https://www.amazon.com/AI-First-Company-Flywheel-Machine-Learning/dp/0593330696' },
      { title: 'Notion AI vs Copilot: A Strategic Analysis', platform: 'Stratechery', type: '文章', time: '20分钟', reason: '分析AI产品的护城河和竞争策略', searchKeywords: 'Stratechery Notion AI Copilot strategy', url: 'https://stratechery.com/' },
      { title: 'Data Flywheel and AI Moats', platform: 'a16z官方博客', type: '文章', time: '15分钟', reason: '理解数据飞轮如何构建AI产品壁垒', searchKeywords: 'a16z AI data flywheel moat', url: 'https://a16z.com/' },
    ],
    'mid-high': [
      { title: '《Inspired》by Marty Cagan', platform: 'Amazon', type: '书', time: '250分钟', reason: '学习如何将产品战略转化为具体PRD和需求', searchKeywords: 'Marty Cagan Inspired book', url: 'https://www.amazon.com/Inspired-Create-Products-Customers-Love/dp/0981690408' },
      { title: 'Lenny\'s Podcast AI episodes', platform: 'Lenny\'s Podcast', type: '视频', time: '60分钟', reason: '顶级PM的AI产品策略讨论，实战经验丰富', searchKeywords: 'Lenny Podcast AI product strategy', url: 'https://www.lennyspodcast.com/' },
      { title: 'How to Write an AI PRD', platform: 'Product School', type: '文章', time: '25分钟', reason: '学习AI功能需求文档的编写方法论', searchKeywords: 'how to write AI product requirements document', url: 'https://productschool.com/' },
    ],
    high: [
      { title: '《Competing in the Age of AI》by Marco Iansiti', platform: 'Amazon', type: '书', time: '300分钟', reason: '哈佛商学院教授对AI时代企业战略的深度分析', searchKeywords: 'Competing in the Age of AI Marco Iansiti', url: 'https://www.amazon.com/Competing-Age-AI-Machine-Intelligence/dp/1633697622' },
      { title: 'Platform vs Vertical: The AI Business Model Debate', platform: 'Greylock Partners', type: '文章', time: '30分钟', reason: '深度分析AI平台层和垂直应用层的商业模式', searchKeywords: 'Greylock AI platform vertical business model', url: 'https://greylock.com/' },
      { title: 'State of AI Report', platform: 'Air Street Capital', type: '文章', time: '120分钟', reason: '年度AI行业全景报告，掌握最新战略格局', searchKeywords: 'State of AI Report Air Street Capital', url: 'https://www.stateof.ai/' },
    ],
  },
  'cross-team': {
    low: [
      { title: '《AI Product Manager\'s Handbook》', platform: 'Google Books', type: '书', time: '200分钟', reason: '系统学习AI项目中的跨角色协作模式', searchKeywords: 'AI Product Manager Handbook book', url: 'https://books.google.com/books/about/AI_Product_Manager_s_Handbook.html' },
      { title: 'How to Work with ML Engineers', platform: 'Product School YouTube', type: '视频', time: '40分钟', reason: '了解AI项目中PM与工程师的协作模式', searchKeywords: 'Product Manager working with ML engineers', url: 'https://www.youtube.com/results?search_query=Product+Manager+working+with+ML+engineers' },
      { title: 'Agile for AI: Adapting Scrum for ML Projects', platform: 'Medium - Towards Data Science', type: '文章', time: '20分钟', reason: '理解AI项目与传统项目的管理差异', searchKeywords: 'Agile Scrum machine learning project management', url: 'https://towardsdatascience.com/' },
    ],
    'mid-low': [
      { title: 'Google PAIR AI design guide', platform: 'Google PAIR官方', type: '文章', time: '30分钟', reason: '学习Google的AI产品协作流程', searchKeywords: 'Google PAIR AI design guide', url: 'https://pair.withgoogle.com/guidebook/' },
      { title: 'How to Communicate with Algorithm Teams', platform: 'NVIDIA官方博客', type: '文章', time: '20分钟', reason: '学习用模型评估指标与算法团队对齐需求', searchKeywords: 'communicating with ML algorithm teams product manager', url: 'https://developer.nvidia.com/blog/' },
      { title: 'The AI Project Lifecycle', platform: 'Google Cloud官方文档', type: '文章', time: '25分钟', reason: '理解AI项目从需求到上线的完整流程', searchKeywords: 'Google Cloud AI project lifecycle', url: 'https://cloud.google.com/' },
    ],
    'mid-high': [
      { title: 'Google PAIR: People + AI Research Guidebook', platform: 'Google PAIR官方', type: '文章', time: '60分钟', reason: 'Google官方的AI项目管理框架，管理不确定性', searchKeywords: 'Google PAIR People AI Research guidebook', url: 'https://pair.withgoogle.com/guidebook/' },
      { title: 'MLOps Best Practices', platform: 'Google Cloud官方文档', type: '文章', time: '40分钟', reason: '理解AI项目的工程化协作和监控', searchKeywords: 'Google MLOps best practices', url: 'https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning' },
      { title: 'Managing AI Project Risks', platform: 'McKinsey Digital', type: '文章', time: '20分钟', reason: '学习AI项目特有的风险管理和迭代节奏', searchKeywords: 'McKinsey managing AI project risks', url: 'https://www.mckinsey.com/' },
    ],
    high: [
      { title: '《Team Topologies》by Matthew Skelton', platform: 'Amazon', type: '书', time: '250分钟', reason: '学习如何设计AI团队的组织结构和协作模式', searchKeywords: 'Team Topologies Matthew Skelton book', url: 'https://www.amazon.com/Team-Topologies-Organizing-Business-Technology/dp/1942788819' },
      { title: 'How Big Tech Organizes AI Teams', platform: 'The Pragmatic Engineer', type: '文章', time: '30分钟', reason: '了解大型科技公司的AI团队组织方式', searchKeywords: 'Pragmatic Engineer big tech AI team organization', url: 'https://blog.pragmaticengineer.com/' },
      { title: 'Building an AI-Native Organization', platform: 'McKinsey Digital', type: '文章', time: '25分钟', reason: '麦肯锡对AI原生组织的设计建议', searchKeywords: 'McKinsey building AI native organization', url: 'https://www.mckinsey.com/' },
    ],
  },
};
