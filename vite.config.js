import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ====== 诊断 API 中间件 ======
function diagnosisApiPlugin() {
  return {
    name: 'diagnosis-api',
    configureServer(server) {
      server.middlewares.use('/api/diagnose', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        for await (const chunk of req) {
          body += chunk;
        }

        let payload;
        try {
          payload = JSON.parse(body);
        } catch {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
          return;
        }

        const { dimName, dimDesc, score, questions } = payload;

        // 构建 System Prompt
        const systemPrompt = `你是一位拥有8年经验的资深AI产品经理面试官，同时也是AI产品经理学习教练，熟悉行业内的优质学习资源。

你的任务：根据用户在某个维度的答题数据，生成针对性的诊断报告。

你将收到以下数据：
- 维度名称
- 维度得分（0-100）
- 用户在该维度答过的所有题目（包括"答题顺序号"、题目内容、难度、用户答对还是答错）

关键定义：
- "答题顺序号"（answerIndex）是用户在25道题测评中实际看到的题号，从1开始，最大为25。
- 你必须始终使用"答题顺序号"来引用题目，绝对不能使用questionId（原始题库ID，可能大于25，用户看不懂）。

你需要输出以下六个部分，每个部分用【】标记开头：

【一句话总结】
用一句话（30字以内）总结用户在这个维度的水平。要犀利不要圆滑。
正确示范："你对大模型选型缺乏判断框架"
错误示范："你在AI基础上还有提升空间"

【具体问题】
引用用户实际答错的那几道题的"答题顺序号"和内容，告诉他具体在哪里出了问题。
格式示例："你在第3题和第7题都搞错了RAG和Fine-tuning的适用场景"
必须使用答题顺序号，必须引用真实题号，不能编造。

【原因推测】
基于用户答错题的特征，推测背后的原因。
格式示例："你可能没有实际做过RAG系统的经验，所以对召回率和生成质量这两个指标的关系理解不深"
必须基于用户答错的题来推测，不能凭空臆断。

【下一步行动】
给出一个具体的、立刻能开始的动作。
正确示范："建议先读OpenAI官方的Evaluation Guide文档，特别是第3章"
错误示范："建议多学习"

【推荐资源】
基于用户的弱点和考察点，推荐3-5个学习资源帮他补强。每条资源用"资源N"标记开头，并给出以下7个字段：

资源1
标题：具体到用户能搜到的程度，如"《Building LLM Applications》by Andrew Ng"
来源平台：DeepLearning.AI / OpenAI官方博客 / YouTube上Karpathy的频道 等具体平台
资源类型：文章/视频/书/课程（四选一）
预计学习时长：多少分钟
推荐理由：一句话，说明为什么这个资源适合当前的弱点
搜索建议：用这串关键词去Google搜就能找到，3-6个词最合适，如"DeepLearning.AI Andrew Ng Building Systems LLM"
资源链接：如果知道该资源的官方URL，可以填写。如果不确定，留空即可。

资源2
（同上格式）

推荐资源死规矩：
第一，资源链接仅限填入知名平台的官方URL（如DeepLearning.AI、OpenAI、Anthropic、Google AI、O'Reilly、Amazon等）。不要填知乎/掘金/CSDN上的链接、不知名博主的链接、任何可能失效的链接。如果不确定链接是否正确，资源链接留空。
第二，只推荐稳定来源。优先推荐：知名作者的内容（Andrew Ng、Karpathy、Chip Huyen）、大公司官方资源（OpenAI、Anthropic、Google AI的官方文档）、经典书籍。不要推荐知乎/掘金/CSDN上的具体文章、不知名博主的推文、任何"最新"的时效性内容。
第三，搜索建议关键词要足够具体能定位到资源，但又不能长到没人会输入，3-6个词最合适。

【基于事实的鼓励】
基于用户答对的具体题目给予鼓励。
格式示例："你在第5题判断Token成本权衡的时候答得很好，说明你已经有产品权衡的思维"
必须引用用户答对的"答题顺序号"，不能空洞地说"你很努力"。

死规矩：
1. 不许说"你在X方面有潜力但缺乏深度"这类废话
2. 不许只说"建议多学习"，必须给可执行的具体动作
3. 不许凭空推测原因，必须基于用户答错的题来推测
4. 鼓励必须引用用户答对的具体题目（答题顺序号），不能空洞
5. 用结构化的中文段落输出，不要用JSON、不要用代码格式，就是一段段的自然语言
6. 每个部分之间用空行分隔
7. 所有引用题目必须使用"答题顺序号"（1-25之间的数字），绝对不能出现大于25的题号！
8. 资源链接只能填知名平台的官方URL，不确定就留空，不要编造链接！

分数自适应规则：
- 如果维度得分 >= 90：诊断重心改为"你已经掌握得很好，可以挑战哪些更难的话题"。"具体问题"部分改为"进阶方向"，不再列薄弱点。
- 如果维度得分 < 90：正常列出薄弱点和改进建议。`;

        // 构建 User Prompt（使用 answerIndex 作为用户视角的题号）
        const questionList = questions
          .map((q) => {
            const status = q.isCorrect ? '答对' : '答错';
            const displayIdx = q.answerIndex || 0;
            return `答题顺序号第${displayIdx}题 | 难度${q.difficulty} | ${status} | 题目: ${q.question} | 正确答案: ${q.correctAnswer} | 用户答案: ${q.userAnswer || '未答'}`;
          })
          .join('\n');

        const correctCount = questions.filter((q) => q.isCorrect).length;
        const wrongCount = questions.filter((q) => !q.isCorrect).length;

        const userPrompt = `维度名称：${dimName}
维度描述：${dimDesc}
维度得分：${score}/100
答对题数：${correctCount}
答错题数：${wrongCount}

重要提示：下方每题都标注了"答题顺序号第N题"，后续你在引用时必须使用这个"答题顺序号"（第1题、第N题），不要使用其他数字。

答题详情：
${questionList}

请根据以上数据生成诊断报告。`;

        // 调用 LLM API
        const apiKey = process.env.LLM_API_KEY || process.env.VITE_LLM_API_KEY || '';
        const baseUrl = process.env.LLM_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
        const model = process.env.LLM_MODEL || 'doubao-pro-32k';

        if (!apiKey) {
          // 无 API Key 时返回模拟诊断
          const mockDiagnosis = generateMockDiagnosis(dimName, score, questions);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ diagnosis: mockDiagnosis, mock: true }));
          return;
        }

        try {
          const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
              ],
              temperature: 0.7,
              max_tokens: 1000,
            }),
          });

          if (!response.ok) {
            const errText = await response.text();
            console.error('LLM API error:', response.status, errText);
            res.statusCode = 502;
            res.end(JSON.stringify({ error: `LLM API error: ${response.status}`, detail: errText }));
            return;
          }

          const data = await response.json();
          const diagnosis = data.choices?.[0]?.message?.content || '(LLM 返回为空)';

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ diagnosis, mock: false }));
        } catch (err) {
          // LLM 调用失败：返回 502 让前端重试，不再服务端静默降级
          console.error('LLM API call failed:', err);
          res.statusCode = 502;
          res.end(JSON.stringify({ error: `LLM API call failed: ${err.message}` }));
        }
      });
    },
  };
}

// 无 API Key 时的模拟诊断（必须使用 answerIndex，避免出现大于25的题号）
// 每个维度 × 4个分数段，推荐不同资源
const MOCK_RESOURCES = {
  'ai-cognition': {
    low: [
      '资源1\n标题：Generative AI for Everyone by Andrew Ng\n来源平台：DeepLearning.AI\n资源类型：课程\n预计学习时长：90分钟\n推荐理由：零基础入门LLM概念，建立AI技术认知框架\n搜索建议：DeepLearning.AI Generative AI for Everyone Andrew Ng\n资源链接：https://www.deeplearning.ai/courses/generative-ai-for-everyone/',
      '资源2\n标题：What is a Large Language Model (LLM)?\n来源平台：Google Cloud官方博客\n资源类型：文章\n预计学习时长：15分钟\n推荐理由：用通俗语言理解LLM是什么、能做什么不能做什么\n搜索建议：Google Cloud what is large language model LLM\n资源链接：https://cloud.google.com/learn/what-is-a-large-language-model',
      '资源3\n标题：AI for Beginners - Microsoft Learn\n来源平台：Microsoft Learn\n资源类型：课程\n预计学习时长：180分钟\n推荐理由：从零开始系统学习AI基础知识\n搜索建议：Microsoft Learn AI for Beginners\n资源链接：https://microsoft.github.io/AI-For-Beginners/',
    ],
    'mid-low': [
      '资源1\n标题：《Building LLM Applications》by Andrew Ng\n来源平台：DeepLearning.AI\n资源类型：课程\n预计学习时长：120分钟\n推荐理由：系统理解LLM能力边界，弥补技术认知短板\n搜索建议：DeepLearning.AI Andrew Ng Building LLM Applications\n资源链接：https://www.deeplearning.ai/short-courses/building-systems-with-chatgpt-api/',
      '资源2\n标题：OpenAI GPT Best Practices Guide\n来源平台：OpenAI官方文档\n资源类型：文章\n预计学习时长：30分钟\n推荐理由：理解RAG和Fine-tuning的适用场景，建立判断框架\n搜索建议：OpenAI GPT Best Practices Guide\n资源链接：https://platform.openai.com/docs/guides/gpt-best-practices',
      '资源3\n标题：What is RAG? - IBM Technology\n来源平台：IBM Technology YouTube\n资源类型：视频\n预计学习时长：8分钟\n推荐理由：用动画直观理解RAG的原理和适用场景\n搜索建议：IBM Technology what is RAG retrieval augmented generation\n资源链接：https://www.youtube.com/watch?v=T-D1OfcDW1M',
    ],
    'mid-high': [
      '资源1\n标题：LangChain官方教程\n来源平台：LangChain官方文档\n资源类型：文章\n预计学习时长：90分钟\n推荐理由：动手搭建Agent和RAG应用，获得实际选型经验\n搜索建议：LangChain documentation RAG Agent tutorial\n资源链接：https://python.langchain.com/docs/get_started/introduction',
      '资源2\n标题：Fine-tuning vs RAG: A Practical Guide\n来源平台：Anthropic官方博客\n资源类型：文章\n预计学习时长：25分钟\n推荐理由：深入理解两种技术路线的取舍和成本对比\n搜索建议：Anthropic fine-tuning vs RAG practical guide\n资源链接：https://www.anthropic.com/engineering',
      '资源3\n标题：LLM Visualization: A 3D Interactive Model\n来源平台：bbycroft.net\n资源类型：文章\n预计学习时长：30分钟\n推荐理由：通过3D可视化理解Transformer内部机制\n搜索建议：bbycroft LLM visualization transformer\n资源链接：https://bbycroft.net/llm',
    ],
    high: [
      '资源1\n标题：Stanford CS324: Large Language Models\n来源平台：Stanford Online\n资源类型：课程\n预计学习时长：600分钟\n推荐理由：Stanford研究生级别课程，深入LLM架构与训练\n搜索建议：Stanford CS324 Large Language Models course\n资源链接：https://stanford-cs324.github.io/winter2022/',
      '资源2\n标题：Building Agentic Systems with LangGraph\n来源平台：LangChain Academy\n资源类型：课程\n预计学习时长：180分钟\n推荐理由：学习Multi-Agent架构设计，掌握复杂AI系统编排\n搜索建议：LangGraph LangChain building agentic systems\n资源链接：https://academy.langchain.com/courses/langgraph',
      '资源3\n标题：《Designing Machine Learning Systems》by Chip Huyen\n来源平台：O\'Reilly\n资源类型：书\n预计学习时长：400分钟\n推荐理由：从系统设计视角理解ML/LLM产品的工程化挑战\n搜索建议：Chip Huyen Designing Machine Learning Systems\n资源链接：https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/',
    ],
  },
  'problem-framing': {
    low: [
      '资源1\n标题：Google PAIR AI设计指南\n来源平台：Google PAIR官方\n资源类型：文章\n预计学习时长：45分钟\n推荐理由：从零学习AI产品设计的基本原则和用户需求分析\n搜索建议：Google PAIR AI design guide\n资源链接：https://pair.withgoogle.com/guidebook/',
      '资源2\n标题：AI Product Management 101\n来源平台：Product School YouTube\n资源类型：视频\n预计学习时长：45分钟\n推荐理由：入门级AI产品管理概览，建立基本框架\n搜索建议：Product School AI Product Management 101\n资源链接：https://www.youtube.com/results?search_query=Product+School+AI+Product+Management+101',
    ],
    'mid-low': [
      '资源1\n标题：《AI Product Manager\'s Handbook》\n来源平台：Google Books\n资源类型：书\n预计学习时长：300分钟\n推荐理由：系统学习AI产品机会评估，掌握场景画布方法论\n搜索建议：AI Product Manager Handbook book\n资源链接：https://books.google.com/books/about/AI_Product_Manager_s_Handbook.html',
      '资源2\n标题：《Machine Learning Yearning》by Andrew Ng\n来源平台：DeepLearning.AI\n资源类型：书\n预计学习时长：180分钟\n推荐理由：从技术视角理解什么场景适合用AI\n搜索建议：Andrew Ng Machine Learning Yearning\n资源链接：https://www.deeplearning.ai/machine-learning-yearning/',
      '资源3\n标题：How to Evaluate AI Product Opportunities\n来源平台：Reforge\n资源类型：文章\n预计学习时长：30分钟\n推荐理由：学习用结构化框架评估AI产品机会\n搜索建议：Reforge evaluating AI product opportunities\n资源链接：https://www.reforge.com/blog/ai-product-opportunities',
    ],
    'mid-high': [
      '资源1\n标题：《The Lean Startup》by Eric Ries\n来源平台：Amazon\n资源类型：书\n预计学习时长：250分钟\n推荐理由：掌握MVP定义和假设验证方法论\n搜索建议：Eric Ries Lean Startup book\n资源链接：https://www.amazon.com/Lean-Startup-Eric-Ries/dp/0307887898',
      '资源2\n标题：AI Product Strategy: Platform vs Vertical\n来源平台：a16z官方博客\n资源类型：文章\n预计学习时长：20分钟\n推荐理由：理解AI产品在平台层和垂直应用层的战略差异\n搜索建议：a16z AI product strategy platform vertical\n资源链接：https://a16z.com/ai/',
      '资源3\n标题：Lenny\'s Podcast: AI Product Management\n来源平台：Lenny\'s Podcast\n资源类型：视频\n预计学习时长：60分钟\n推荐理由：顶级PM的AI产品策略讨论，实战经验丰富\n搜索建议：Lenny Podcast AI product management strategy\n资源链接：https://www.lennyspodcast.com/',
    ],
    high: [
      '资源1\n标题：《Good Strategy Bad Strategy》by Richard Rumelt\n来源平台：Amazon\n资源类型：书\n预计学习时长：300分钟\n推荐理由：掌握企业级战略思维，用于复杂AI产品决策\n搜索建议：Richard Rumelt Good Strategy Bad Strategy\n资源链接：https://www.amazon.com/Good-Strategy-Bad-Richard-Rumelt/dp/0307886239',
      '资源2\n标题：RICE Prioritization Framework for AI Products\n来源平台：Intercom官方博客\n资源类型：文章\n预计学习时长：15分钟\n推荐理由：学习用RICE框架对多个AI场景进行优先级排序\n搜索建议：RICE framework AI product prioritization\n资源链接：https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/',
    ],
  },
  'prompt-design': {
    low: [
      '资源1\n标题：OpenAI Prompt Engineering Guide\n来源平台：OpenAI官方文档\n资源类型：文章\n预计学习时长：45分钟\n推荐理由：官方Prompt工程指南，从零开始学习所有基础技巧\n搜索建议：OpenAI Prompt Engineering Guide\n资源链接：https://platform.openai.com/docs/guides/prompt-engineering',
      '资源2\n标题：ChatGPT Prompt Engineering for Developers\n来源平台：DeepLearning.AI\n资源类型：课程\n预计学习时长：90分钟\n推荐理由：Andrew Ng与OpenAI合作的Prompt入门课程\n搜索建议：DeepLearning.AI ChatGPT Prompt Engineering course\n资源链接：https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/',
      '资源3\n标题：Best practices for prompt engineering\n来源平台：Google AI官方文档\n资源类型：文章\n预计学习时长：25分钟\n推荐理由：Google官方的Prompt技巧总结\n搜索建议：Google AI prompt engineering best practices\n资源链接：https://ai.google.dev/gemini-api/docs/prompting-strategies',
    ],
    'mid-low': [
      '资源1\n标题：Anthropic Prompt Engineering文档\n来源平台：Anthropic官方文档\n资源类型：文章\n预计学习时长：30分钟\n推荐理由：学习CoT和高级Prompt技巧的最佳资源\n搜索建议：Anthropic Claude Prompt Engineering\n资源链接：https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview',
      '资源2\n标题：Chain-of-Thought Prompting Explained\n来源平台：Google AI博客\n资源类型：文章\n预计学习时长：20分钟\n推荐理由：深入理解CoT原理和最佳实践\n搜索建议：Google AI chain of thought prompting explained\n资源链接：https://blog.google/technology/ai/',
      '资源3\n标题：Prompt Engineering Guide by DAIR.AI\n来源平台：DAIR.AI\n资源类型：文章\n预计学习时长：60分钟\n推荐理由：社区最全面的Prompt工程指南，覆盖所有高级技巧\n搜索建议：DAIR.AI Prompt Engineering Guide\n资源链接：https://www.promptingguide.ai/',
    ],
    'mid-high': [
      '资源1\n标题：Let\'s build GPT from scratch by Karpathy\n来源平台：YouTube Karpathy频道\n资源类型：视频\n预计学习时长：120分钟\n推荐理由：从底层理解LLM行为，写出更精准的Prompt\n搜索建议：Karpathy build GPT from scratch\n资源链接：https://www.youtube.com/watch?v=kCc8FmEb1nY',
      '资源2\n标题：Multi-turn Conversation Design for LLMs\n来源平台：OpenAI Cookbook\n资源类型：文章\n预计学习时长：30分钟\n推荐理由：学习多轮对话的状态管理和上下文设计\n搜索建议：OpenAI cookbook multi-turn conversation design\n资源链接：https://cookbook.openai.com/',
      '资源3\n标题：Structured Outputs with LLMs\n来源平台：Instructor官方文档\n资源类型：文章\n预计学习时长：45分钟\n推荐理由：掌握JSON模式、函数调用等结构化输出技巧\n搜索建议：Instructor structured outputs LLM Python\n资源链接：https://python.useinstructor.com/',
    ],
    high: [
      '资源1\n标题：ReAct Prompting: Synergizing Reasoning and Acting\n来源平台：Google Research\n资源类型：文章\n预计学习时长：45分钟\n推荐理由：ReAct框架论文，学习Agent级Prompt编排\n搜索建议：Google Research ReAct prompting reasoning acting\n资源链接：https://arxiv.org/abs/2210.03629',
      '资源2\n标题：Building an AI Agent with Tool Use\n来源平台：Anthropic官方文档\n资源类型：文章\n预计学习时长：40分钟\n推荐理由：学习如何设计调用外部工具的Agent Prompt\n搜索建议：Anthropic building AI agent tool use\n资源链接：https://docs.anthropic.com/en/docs/build-with-claude/tool-use',
    ],
  },
  'data-eval': {
    low: [
      '资源1\n标题：Google ML Crash Course\n来源平台：Google AI官方\n资源类型：课程\n预计学习时长：300分钟\n推荐理由：系统学习ML评估指标，建立数据思维\n搜索建议：Google Machine Learning Crash Course\n资源链接：https://developers.google.com/machine-learning/crash-course',
      '资源2\n标题：ML Evaluation Metrics: A Beginner\'s Guide\n来源平台：Towards Data Science\n资源类型：文章\n预计学习时长：20分钟\n推荐理由：从零理解准确率、召回率、F1等基础指标\n搜索建议：machine learning evaluation metrics beginner guide\n资源链接：https://towardsdatascience.com/',
    ],
    'mid-low': [
      '资源1\n标题：《Trustworthy Online Experiments》\n来源平台：Cambridge University Press\n资源类型：书\n预计学习时长：400分钟\n推荐理由：A/B测试的"圣经"，学习统计显著性和实验设计\n搜索建议：Trustworthy Online Experiments book\n资源链接：https://www.cambridge.org/core/books/trustworthy-online-experiments/',
      '资源2\n标题：LLM Evaluation Guide\n来源平台：Anthropic官方博客\n资源类型：文章\n预计学习时长：20分钟\n推荐理由：理解LLM评估的特殊性和业界最佳实践\n搜索建议：LLM evaluation Anthropic guide\n资源链接：https://www.anthropic.com/engineering/evaluating-language-models',
      '资源3\n标题：Evaluating LLM Applications\n来源平台：Weights & Biases\n资源类型：文章\n预计学习时长：30分钟\n推荐理由：实操指南：如何用W&B做LLM应用评估\n搜索建议：Weights Biases evaluating LLM applications\n资源链接：https://wandb.ai/site',
    ],
    'mid-high': [
      '资源1\n标题：《Designing Machine Learning Systems》by Chip Huyen\n来源平台：O\'Reilly\n资源类型：书\n预计学习时长：400分钟\n推荐理由：Chip Huyen的经典著作，覆盖ML系统设计与评估\n搜索建议：Chip Huyen Designing Machine Learning Systems\n资源链接：https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/',
      '资源2\n标题：MLOps: Continuous Delivery for ML\n来源平台：Google Cloud官方文档\n资源类型：文章\n预计学习时长：45分钟\n推荐理由：学习ML系统的线上监控和持续交付\n搜索建议：Google Cloud MLOps continuous delivery\n资源链接：https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning',
      '资源3\n标题：Monitoring ML Models in Production\n来源平台：NVIDIA官方博客\n资源类型：文章\n预计学习时长：25分钟\n推荐理由：学习数据漂移检测和模型效果衰减监控\n搜索建议：NVIDIA monitoring ML models production drift\n资源链接：https://developer.nvidia.com/blog/',
    ],
    high: [
      '资源1\n标题：LLM-as-Judge: A New Evaluation Paradigm\n来源平台：LMSYS Org\n资源类型：文章\n预计学习时长：30分钟\n推荐理由：Chatbot Arena团队提出的LLM评估新范式\n搜索建议：LMSYS LLM as Judge evaluation paradigm\n资源链接：https://lmsys.org/blog/',
      '资源2\n标题：Building an LLM Evaluation Framework\n来源平台：Anthropic官方博客\n资源类型：文章\n预计学习时长：40分钟\n推荐理由：设计自动化+人工的混合评估流程\n搜索建议：Anthropic building LLM evaluation framework\n资源链接：https://www.anthropic.com/engineering',
    ],
  },
  'product-strategy': {
    low: [
      '资源1\n标题：AI Canon by a16z\n来源平台：a16z官方博客\n资源类型：文章\n预计学习时长：90分钟\n推荐理由：顶级VC整理的AI必读文章合集，建立战略认知\n搜索建议：a16z AI Canon articles\n资源链接：https://a16z.com/ai-canon/',
      '资源2\n标题：《The Innovator\'s Dilemma》by Clayton Christensen\n来源平台：Amazon\n资源类型：书\n预计学习时长：300分钟\n推荐理由：理解技术变革如何影响产品战略\n搜索建议：Clayton Christensen Innovator Dilemma book\n资源链接：https://www.amazon.com/Innovators-Dilemma-Clayton-M-Christensen/dp/0062060244',
      '资源3\n标题：AI Product Strategy 101\n来源平台：Reforge\n资源类型：文章\n预计学习时长：30分钟\n推荐理由：入门级AI产品战略框架\n搜索建议：Reforge AI product strategy framework\n资源链接：https://www.reforge.com/',
    ],
    'mid-low': [
      '资源1\n标题：《The AI-First Company》by Ash Fontana\n来源平台：Amazon\n资源类型：书\n预计学习时长：200分钟\n推荐理由：理解AI公司的战略决策和竞争壁垒建设\n搜索建议：AI First Company Ash Fontana\n资源链接：https://www.amazon.com/AI-First-Company-Flywheel-Machine-Learning/dp/0593330696',
      '资源2\n标题：Notion AI vs Copilot: A Strategic Analysis\n来源平台：Stratechery\n资源类型：文章\n预计学习时长：20分钟\n推荐理由：分析AI产品的护城河和竞争策略\n搜索建议：Stratechery Notion AI Copilot strategy\n资源链接：https://stratechery.com/',
      '资源3\n标题：Data Flywheel and AI Moats\n来源平台：a16z官方博客\n资源类型：文章\n预计学习时长：15分钟\n推荐理由：理解数据飞轮如何构建AI产品壁垒\n搜索建议：a16z AI data flywheel moat\n资源链接：https://a16z.com/',
    ],
    'mid-high': [
      '资源1\n标题：《Inspired》by Marty Cagan\n来源平台：Amazon\n资源类型：书\n预计学习时长：250分钟\n推荐理由：学习如何将产品战略转化为具体PRD和需求\n搜索建议：Marty Cagan Inspired book\n资源链接：https://www.amazon.com/Inspired-Create-Products-Customers-Love/dp/0981690408',
      '资源2\n标题：Lenny\'s Podcast AI episodes\n来源平台：Lenny\'s Podcast\n资源类型：视频\n预计学习时长：60分钟\n推荐理由：顶级PM的AI产品策略讨论，实战经验丰富\n搜索建议：Lenny Podcast AI product strategy\n资源链接：https://www.lennyspodcast.com/',
    ],
    high: [
      '资源1\n标题：《Competing in the Age of AI》by Marco Iansiti\n来源平台：Amazon\n资源类型：书\n预计学习时长：300分钟\n推荐理由：哈佛商学院教授对AI时代企业战略的深度分析\n搜索建议：Competing in the Age of AI Marco Iansiti\n资源链接：https://www.amazon.com/Competing-Age-AI-Machine-Intelligence/dp/1633697622',
      '资源2\n标题：Platform vs Vertical: The AI Business Model Debate\n来源平台：Greylock Partners\n资源类型：文章\n预计学习时长：30分钟\n推荐理由：深度分析AI平台层和垂直应用层的商业模式\n搜索建议：Greylock AI platform vertical business model\n资源链接：https://greylock.com/',
      '资源3\n标题：State of AI Report\n来源平台：Air Street Capital\n资源类型：文章\n预计学习时长：120分钟\n推荐理由：年度AI行业全景报告，掌握最新战略格局\n搜索建议：State of AI Report Air Street Capital\n资源链接：https://www.stateof.ai/',
    ],
  },
  'cross-team': {
    low: [
      '资源1\n标题：《AI Product Manager\'s Handbook》\n来源平台：Google Books\n资源类型：书\n预计学习时长：200分钟\n推荐理由：系统学习AI项目中的跨角色协作模式\n搜索建议：AI Product Manager Handbook book\n资源链接：https://books.google.com/books/about/AI_Product_Manager_s_Handbook.html',
      '资源2\n标题：How to Work with ML Engineers\n来源平台：Product School YouTube\n资源类型：视频\n预计学习时长：40分钟\n推荐理由：了解AI项目中PM与工程师的协作模式\n搜索建议：Product Manager working with ML engineers\n资源链接：https://www.youtube.com/results?search_query=Product+Manager+working+with+ML+engineers',
    ],
    'mid-low': [
      '资源1\n标题：Google PAIR AI design guide\n来源平台：Google PAIR官方\n资源类型：文章\n预计学习时长：30分钟\n推荐理由：学习Google的AI产品协作流程\n搜索建议：Google PAIR AI design guide\n资源链接：https://pair.withgoogle.com/guidebook/',
      '资源2\n标题：How to Communicate with Algorithm Teams\n来源平台：NVIDIA官方博客\n资源类型：文章\n预计学习时长：20分钟\n推荐理由：学习用模型评估指标与算法团队对齐需求\n搜索建议：communicating with ML algorithm teams product manager\n资源链接：https://developer.nvidia.com/blog/',
      '资源3\n标题：The AI Project Lifecycle\n来源平台：Google Cloud官方文档\n资源类型：文章\n预计学习时长：25分钟\n推荐理由：理解AI项目从需求到上线的完整流程\n搜索建议：Google Cloud AI project lifecycle\n资源链接：https://cloud.google.com/',
    ],
    'mid-high': [
      '资源1\n标题：Google PAIR: People + AI Research Guidebook\n来源平台：Google PAIR官方\n资源类型：文章\n预计学习时长：60分钟\n推荐理由：Google官方的AI项目管理框架，管理不确定性\n搜索建议：Google PAIR People AI Research guidebook\n资源链接：https://pair.withgoogle.com/guidebook/',
      '资源2\n标题：MLOps Best Practices\n来源平台：Google Cloud官方文档\n资源类型：文章\n预计学习时长：40分钟\n推荐理由：理解AI项目的工程化协作和监控\n搜索建议：Google MLOps best practices\n资源链接：https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning',
      '资源3\n标题：Managing AI Project Risks\n来源平台：McKinsey Digital\n资源类型：文章\n预计学习时长：20分钟\n推荐理由：学习AI项目特有的风险管理和迭代节奏\n搜索建议：McKinsey managing AI project risks\n资源链接：https://www.mckinsey.com/',
    ],
    high: [
      '资源1\n标题：《Team Topologies》by Matthew Skelton\n来源平台：Amazon\n资源类型：书\n预计学习时长：250分钟\n推荐理由：学习如何设计AI团队的组织结构和协作模式\n搜索建议：Team Topologies Matthew Skelton book\n资源链接：https://www.amazon.com/Team-Topologies-Organizing-Business-Technology/dp/1942788819',
      '资源2\n标题：How Big Tech Organizes AI Teams\n来源平台：The Pragmatic Engineer\n资源类型：文章\n预计学习时长：30分钟\n推荐理由：了解大型科技公司的AI团队组织方式\n搜索建议：Pragmatic Engineer big tech AI team organization\n资源链接：https://blog.pragmaticengineer.com/',
      '资源3\n标题：Building an AI-Native Organization\n来源平台：McKinsey Digital\n资源类型：文章\n预计学习时长：25分钟\n推荐理由：麦肯锡对AI原生组织的设计建议\n搜索建议：McKinsey building AI native organization\n资源链接：https://www.mckinsey.com/',
    ],
  },
};

function generateMockDiagnosis(dimName, score, questions) {
  const wrongQuestions = questions.filter((q) => !q.isCorrect);
  const correctQuestions = questions.filter((q) => q.isCorrect);
  const wrongIdx = wrongQuestions.map((q) => q.answerIndex).filter((x) => x);
  const correctIdx = correctQuestions.map((q) => q.answerIndex).filter((x) => x);

  const level = score >= 70 ? '基础扎实' : score >= 50 ? '存在明显短板' : '亟待补强';

  let diagnosis = `【一句话总结】\n你在${dimName}维度${level}，得分${score}分。\n\n`;

  diagnosis += `【具体问题】\n`;
  if (wrongIdx.length > 0) {
    diagnosis += `你在第${wrongIdx.join('、')}题答错了，这些题目涉及${dimName}的核心知识点，建议重点回顾。\n\n`;
  } else {
    diagnosis += `该维度没有答错的题目，表现良好。\n\n`;
  }

  diagnosis += `【原因推测】\n`;
  if (wrongIdx.length > 0) {
    diagnosis += `从答错的题目来看，你可能对${dimName}的某些核心概念理解不够深入，建议结合实际项目经验来加深理解。\n\n`;
  } else {
    diagnosis += `你在这个维度的知识掌握较好，可能是日常工作中经常接触相关内容。\n\n`;
  }

  diagnosis += `【下一步行动】\n`;
  if (score < 70) {
    diagnosis += `建议系统学习${dimName}相关知识，可以阅读行业权威文档和实践案例。\n\n`;
  } else {
    diagnosis += `建议继续深化${dimName}领域的知识，关注最新行业动态和最佳实践。\n\n`;
  }

  // 添加推荐资源（按分数段选择）
  diagnosis += `【推荐资源】\n`;
  const band = score < 40 ? 'low' : score < 60 ? 'mid-low' : score < 80 ? 'mid-high' : 'high';
  const resKey = Object.keys(MOCK_RESOURCES).find((k) => dimName.includes(k) || k.includes(dimName.slice(0, 5)));
  const dimResources = MOCK_RESOURCES[resKey] || MOCK_RESOURCES['ai-cognition'];
  const resources = dimResources[band] || dimResources['mid-low'] || [];
  diagnosis += resources.join('\n\n') + '\n\n';

  diagnosis += `【基于事实的鼓励】\n`;
  if (correctIdx.length > 0) {
    diagnosis += `你在第${correctIdx.join('、')}题答得很好，说明你在${dimName}方面有一定的基础和判断力。\n\n`;
  } else {
    diagnosis += `虽然这个维度还有提升空间，但能完成所有题目本身就是一种学习态度的体现。\n\n`;
  }

  return diagnosis;
}

export default defineConfig({
  plugins: [react(), diagnosisApiPlugin()],
  base: './'
})
