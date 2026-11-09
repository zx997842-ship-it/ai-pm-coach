export const TOTAL_TAKERS = 1234;

export const DIM_COLORS = {
  'ai-cognition':     { fill: '#8FA8C4', stroke: '#6E8BAA', bg: '#E8EFF5' },
  'problem-framing':  { fill: '#9BBF9D', stroke: '#7BA57E', bg: '#EAF2EA' },
  'prompt-design':    { fill: '#A89AC0', stroke: '#8B7AA8', bg: '#EEEAF4' },
  'data-eval':        { fill: '#8BB8B0', stroke: '#6E9E96', bg: '#E8F2F0' },
  'product-strategy': { fill: '#B8A890', stroke: '#9E8E73', bg: '#F2EFEA' },
  'cross-team':       { fill: '#C49F9D', stroke: '#AB8583', bg: '#F4ECEC' },
};

export const DIMENSIONS = [
  { id: 'ai-cognition',     num: '01', name: 'AI 技术认知',         desc: '对 LLM、Agent、RAG 等核心技术的理解深度，以及能否准确判断技术边界与可行性。' },
  { id: 'problem-framing',  num: '02', name: '问题定义与场景选择',   desc: '能否从真实用户痛点出发，筛选出适合用 AI 解决、且能产生商业价值的场景。' },
  { id: 'prompt-design',    num: '03', name: 'Prompt 与交互设计',   desc: '设计高质量 Prompt、编排多轮对话、以及设计"AI-native"式交互体验的能力。' },
  { id: 'data-eval',        num: '04', name: '数据与评估思维',       desc: '是否理解数据对模型效果的影响，能否建立可量化的评估指标与迭代闭环。' },
  { id: 'product-strategy', num: '05', name: 'AI 产品策略',          desc: '在竞争格局中找准差异化定位，判断是做平台、做垂直、还是做工具层的战略眼光。' },
  { id: 'cross-team',       num: '06', name: '跨团队协作与推进',     desc: '能否与算法、工程、设计高效协作，把"模糊的 AI 需求"变成可落地的项目节奏。' },
];

export const ASSESSMENT_META = { durationMinutes: 15, totalDimensions: 6, questionCount: 25 };
export const STRENGTH_THRESHOLD = 65;

export const getTotalScore = (scores) => {
  if (!scores || typeof scores !== 'object') return 0;
  const vals = Object.values(scores).filter((v) => typeof v === 'number' && Number.isFinite(v));
  if (vals.length === 0) return 0;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const rounded = Math.round(avg);
  return Math.max(0, Math.min(100, rounded));
};

export const getScoreLevel = (score) => {
  const s = Number.isFinite(score) ? score : 0;
  if (s >= 85) return '高级水平';
  if (s >= 65) return '中级水平';
  if (s >= 50) return '初级水平';
  return '入门水平';
};

export const DIM_DIAGNOSTICS = {
  'ai-cognition':     '你对大模型选型的判断扎实，能准确区分不同基座模型的适用场景与推理成本。但在多模态模型的能力边界和落地时序上，还需要建立更系统的判断框架。',
  'problem-framing':  '你能从用户痛点和商业价值出发筛选 AI 场景，场景判断的整体方向是对的。短板在于对 ROI 的量化估算偏保守，有时会低估技术可行性而错失切入时机。',
  'prompt-design':    '你掌握了基本的 Prompt 结构设计，能写出格式清晰的指令。但面对复杂多步推理和 Few-shot 示例编排时，Prompt 的鲁棒性还不够，容易出现边界 case 崩溃。',
  'data-eval':        '你对评估指标的理解存在明显缺口，还停留在"看模型输出像不像"的直觉层面。缺少对 BLEU / ROUGE / 人工偏好评估等量化方法的系统认知，也没有建立 eval set 的习惯。',
  'product-strategy': '你能理解 AI 产品的竞争格局，但判断偏保守，容易被现有方案框住。在做平台 vs 垂直 vs 工具的路线选择时，缺少对数据飞轮和网络效应的分析维度。',
  'cross-team':       '你的跨职能沟通能力在及格线以上，能把需求讲清楚。但在与算法团队的协作中，对模型迭代周期的理解不够，有时会低估一个 feature 从实验到上线的时间成本。',
};

// ====== 50 道真实题库（含 difficulty 1-5） ======
export const REAL_QUESTIONS = [
  { id: 1,  question: '以下不属于大语言模型LLM核心能力的是（）',                                   category: 'AI 技术认知',            dimId: 'ai-cognition',     options: [{key:'A',text:'文本生成'},{key:'B',text:'逻辑推理'},{key:'C',text:'硬件芯片驱动'},{key:'D',text:'摘要总结'}], correctAnswer: 'C', difficulty: 2 },
  { id: 2,  question: 'AI产品经理在做LLM应用产品时，首要应该优先确认的是（）',                      category: '问题定义与场景选择',      dimId: 'problem-framing',  options: [{key:'A',text:'模型参数规模'},{key:'B',text:'业务真实需求与场景边界'},{key:'C',text:'界面UI设计'},{key:'D',text:'服务器算力规格'}], correctAnswer: 'B', difficulty: 2 },
  { id: 3,  question: 'Prompt中限定输出格式、输出长度、角色身份，主要目的是（）',                    category: 'Prompt 与交互设计',       dimId: 'prompt-design',    options: [{key:'A',text:'提升模型参数量'},{key:'B',text:'约束大模型输出，降低输出随机性'},{key:'C',text:'训练微调模型权重'},{key:'D',text:'减少token计费'}], correctAnswer: 'B', difficulty: 2 },
  { id: 4,  question: 'RAG检索增强生成的核心价值是（）',                                            category: 'AI 技术认知',            dimId: 'ai-cognition',     options: [{key:'A',text:'增大模型参数量'},{key:'B',text:'接入私有知识库，缓解大模型幻觉问题'},{key:'C',text:'替代模型微调'},{key:'D',text:'提升模型推理速度'}], correctAnswer: 'B', difficulty: 2 },
  { id: 5,  question: '大模型"幻觉(Hallucination)"指的是（）',                                    category: 'AI 技术认知',            dimId: 'ai-cognition',     options: [{key:'A',text:'模型响应速度慢'},{key:'B',text:'模型编造不存在的事实、虚假信息'},{key:'C',text:'输入token过长报错'},{key:'D',text:'上下文窗口溢出'}], correctAnswer: 'B', difficulty: 1 },
  { id: 6,  question: '以下哪一项属于RAG流程正确顺序（）',                                           category: 'AI 技术认知',            dimId: 'ai-cognition',     options: [{key:'A',text:'文档切片→向量化存入向量库→用户query向量化→检索召回→送入大模型生成答案'},{key:'B',text:'用户query向量化→文档切片→向量库存储→生成答案'},{key:'C',text:'直接把全部文档丢给大模型，不需要向量库'},{key:'D',text:'模型微调→文档切片→检索召回'}], correctAnswer: 'A', difficulty: 2 },
  { id: 7,  question: 'Agent智能体相比普通LLM对话应用，最大特点是（）',                              category: 'AI 技术认知',            dimId: 'ai-cognition',     options: [{key:'A',text:'输出文字更长'},{key:'B',text:'具备思考、工具调用、多步骤自主执行任务能力'},{key:'C',text:'不需要token消耗'},{key:'D',text:'完全没有幻觉'}], correctAnswer: 'B', difficulty: 2 },
  { id: 8,  question: '下列不属于Agent常用工具调用的是（）',                                         category: 'AI 技术认知',            dimId: 'ai-cognition',     options: [{key:'A',text:'联网搜索'},{key:'B',text:'代码解释器'},{key:'C',text:'向量数据库写入'},{key:'D',text:'用户手机硬件驱动固件刷写'}], correctAnswer: 'D', difficulty: 2 },
  { id: 9,  question: 'Token在大模型中描述正确的是（）',                                            category: 'AI 技术认知',            dimId: 'ai-cognition',     options: [{key:'A',text:'只是汉字，一个汉字=1token'},{key:'B',text:'文本被切分后的最小处理单元，输入输出都会消耗token'},{key:'C',text:'服务器内存单位'},{key:'D',text:'模型权重参数'}], correctAnswer: 'B', difficulty: 1 },
  { id: 10, question: '上下文窗口(context window)代表（）',                                        category: 'AI 技术认知',            dimId: 'ai-cognition',     options: [{key:'A',text:'软件弹窗大小'},{key:'B',text:'模型单次可以处理的最大输入+输出token总量'},{key:'C',text:'网页窗口尺寸'},{key:'D',text:'向量库容量'}], correctAnswer: 'B', difficulty: 1 },
  { id: 11, question: '当用户输入超长，超过模型上下文窗口，哪种做法不合理（）',                       category: 'AI 技术认知',            dimId: 'ai-cognition',     options: [{key:'A',text:'文档摘要压缩'},{key:'B',text:'RAG分片检索'},{key:'C',text:'直接强行全部输入，无视报错'},{key:'D',text:'滚动窗口截断历史对话'}], correctAnswer: 'C', difficulty: 3 },
  { id: 12, question: 'AI产品做效果评估，PPL困惑度主要用来衡量（）',                                 category: '数据与评估思维',          dimId: 'data-eval',        options: [{key:'A',text:'UI美观度'},{key:'B',text:'语言流畅程度'},{key:'C',text:'接口响应时延'},{key:'D',text:'用户留存率'}], correctAnswer: 'B', difficulty: 3 },
  { id: 13, question: '下面哪项属于AI产品非功能需求（）',                                            category: 'AI 产品策略',            dimId: 'product-strategy', options: [{key:'A',text:'能够总结文档'},{key:'B',text:'接口响应时间≤2s'},{key:'C',text:'支持生成思维导图'},{key:'D',text:'支持翻译PDF'}], correctAnswer: 'B', difficulty: 3 },
  { id: 14, question: '微调(Fine‑tuning)大模型，主要作用是（）',                                   category: 'AI 技术认知',            dimId: 'ai-cognition',     options: [{key:'A',text:'从零训练大基座模型'},{key:'B',text:'使用领域数据集调整模型，适配特定业务风格与输出'},{key:'C',text:'替换向量数据库'},{key:'D',text:'降低网络延迟'}], correctAnswer: 'B', difficulty: 2 },
  { id: 15, question: '对于企业私有知识库问答产品，优先选择RAG而不是微调，主要原因不包括（）',          category: 'AI 技术认知',            dimId: 'ai-cognition',     options: [{key:'A',text:'RAG更新知识库不需要重新训练模型'},{key:'B',text:'RAG成本更低'},{key:'C',text:'RAG天然可以实时更新资料'},{key:'D',text:'RAG可以直接修改基座模型权重'}], correctAnswer: 'D', difficulty: 4 },
  { id: 16, question: '大模型应用中top‑p采样参数，控制的是（）',                                     category: 'AI 技术认知',            dimId: 'ai-cognition',     options: [{key:'A',text:'接口并发数'},{key:'B',text:'输出文本的随机性与多样性'},{key:'C',text:'最大输出token'},{key:'D',text:'向量相似度阈值'}], correctAnswer: 'B', difficulty: 3 },
  { id: 17, question: 'Temperature温度参数设置为0，代表（）',                                       category: 'AI 技术认知',            dimId: 'ai-cognition',     options: [{key:'A',text:'输出完全随机，创意最高'},{key:'B',text:'输出尽量确定、重复度高，随机性最低'},{key:'C',text:'禁止输出任何文字'},{key:'D',text:'提升推理速度'}], correctAnswer: 'B', difficulty: 2 },
  { id: 18, question: '向量Embedding的作用是（）',                                                  category: 'AI 技术认知',            dimId: 'ai-cognition',     options: [{key:'A',text:'将文本转为高维数字向量，用于语义相似度检索'},{key:'B',text:'训练大模型权重'},{key:'C',text:'加速GPU运算'},{key:'D',text:'存储原始PDF文件'}], correctAnswer: 'A', difficulty: 2 },
  { id: 19, question: '在RAG中，向量检索召回top‑k，k值设置过大容易出现（）',                         category: 'AI 技术认知',            dimId: 'ai-cognition',     options: [{key:'A',text:'召回无关文档片段，干扰模型回答'},{key:'B',text:'向量库直接崩溃'},{key:'C',text:'模型自动微调'},{key:'D',text:'token消耗直接归零'}], correctAnswer: 'A', difficulty: 3 },
  { id: 20, question: 'AI产品经理做需求评审，不属于AI特有风险点的是（）',                              category: 'AI 产品策略',            dimId: 'product-strategy', options: [{key:'A',text:'模型幻觉输出错误信息'},{key:'B',text:'输出内容合规风险'},{key:'C',text:'按钮点击跳转逻辑错误'},{key:'D',text:'知识库召回漏检导致答非所问'}], correctAnswer: 'C', difficulty: 3 },
  { id: 21, question: '下列哪项不属于AIGC产品合规风险（）',                                          category: 'AI 产品策略',            dimId: 'product-strategy', options: [{key:'A',text:'AI生成侵权图片、抄袭文本'},{key:'B',text:'生成虚假造谣内容'},{key:'C',text:'用户登录密码加密存储'},{key:'D',text:'生成歧视、暴力内容'}], correctAnswer: 'C', difficulty: 3 },
  { id: 22, question: '对于AI对话产品，用户体验指标中MRR@k用来评估（）',                              category: '数据与评估思维',          dimId: 'data-eval',        options: [{key:'A',text:'检索召回质量'},{key:'B',text:'APP闪退率'},{key:'C',text:'用户日活'},{key:'D',text:'接口成功率'}], correctAnswer: 'A', difficulty: 3 },
  { id: 23, question: '多模态大模型不能处理以下哪类输入（）',                                         category: 'AI 技术认知',            dimId: 'ai-cognition',     options: [{key:'A',text:'图片'},{key:'B',text:'音频'},{key:'C',text:'真实物理世界实时传感器信号（无转换）'},{key:'D',text:'文本'}], correctAnswer: 'C', difficulty: 3 },
  { id: 24, question: '下面哪一个不属于AI Agent组成模块（）',                                        category: 'AI 技术认知',            dimId: 'ai-cognition',     options: [{key:'A',text:'LLM大脑'},{key:'B',text:'工具集Tool'},{key:'C',text:'记忆Memory'},{key:'D',text:'手机系统内核'}], correctAnswer: 'D', difficulty: 2 },
  { id: 25, question: 'AI产品PRD中，必须单独写明AI模块的是（）',                                     category: 'AI 产品策略',            dimId: 'product-strategy', options: [{key:'A',text:'模型输入输出约束、幻觉风险、降级策略'},{key:'B',text:'页面按钮颜色色值'},{key:'C',text:'页面div布局'},{key:'D',text:'css样式'}], correctAnswer: 'A', difficulty: 3 },
  { id: 26, question: '当大模型接口不稳定，频繁超时，AI产品经理首先要设计（）',                         category: 'AI 产品策略',            dimId: 'product-strategy', options: [{key:'A',text:'降级兜底方案，错误提示、备用接口切换'},{key:'B',text:'修改产品UI配色'},{key:'C',text:'增加更多功能'},{key:'D',text:'直接下线全部功能'}], correctAnswer: 'A', difficulty: 3 },
  { id: 27, question: '零样本Zero‑shot指（）',                                                     category: 'Prompt 与交互设计',       dimId: 'prompt-design',    options: [{key:'A',text:'不给任何示例，直接让模型完成任务'},{key:'B',text:'给大量样本微调模型'},{key:'C',text:'向量库没有数据'},{key:'D',text:'用户零次使用产品'}], correctAnswer: 'A', difficulty: 2 },
  { id: 28, question: '少样本Few‑shot Prompt是指（）',                                              category: 'Prompt 与交互设计',       dimId: 'prompt-design',    options: [{key:'A',text:'在prompt中提供少量示例，引导模型输出格式'},{key:'B',text:'模型参数量很小'},{key:'C',text:'不输入任何内容'},{key:'D',text:'关闭模型推理'}], correctAnswer: 'A', difficulty: 2 },
  { id: 29, question: '下面哪项是AI产品和传统软件产品最大区别（）',                                   category: '问题定义与场景选择',      dimId: 'problem-framing',  options: [{key:'A',text:'需要写PRD文档'},{key:'B',text:'输出具备概率性，相同输入可能得到不同输出'},{key:'C',text:'需要考虑用户流程'},{key:'D',text:'需要做版本迭代'}], correctAnswer: 'B', difficulty: 3 },
  { id: 30, question: '知识库切片Chunk分块，分块过大的问题是（）',                                    category: 'AI 技术认知',            dimId: 'ai-cognition',     options: [{key:'A',text:'单块信息冗余，语义混杂，召回精准度下降，token消耗高'},{key:'B',text:'向量库无法存储'},{key:'C',text:'直接导致模型崩溃'},{key:'D',text:'文档自动丢失'}], correctAnswer: 'A', difficulty: 3 },
  { id: 31, question: '知识库切片Chunk分块过小，会出现（）',                                          category: 'AI 技术认知',            dimId: 'ai-cognition',     options: [{key:'A',text:'语义被强行切断，丢失完整上下文语义'},{key:'B',text:'模型自动放大参数量'},{key:'C',text:'接口速度翻倍'},{key:'D',text:'消除幻觉'}], correctAnswer: 'A', difficulty: 3 },
  { id: 32, question: 'AI产品灰度发布，主要目的是（）',                                               category: 'AI 产品策略',            dimId: 'product-strategy', options: [{key:'A',text:'全量上线直接给所有用户'},{key:'B',text:'小流量验证AI能力效果、稳定性，控制风险'},{key:'C',text:'修改源代码'},{key:'D',text:'关闭服务器'}], correctAnswer: 'B', difficulty: 3 },
  { id: 33, question: '以下哪一个指标不适合用来评估对话式AI产品业务效果（）',                            category: '数据与评估思维',          dimId: 'data-eval',        options: [{key:'A',text:'用户问题解决率'},{key:'B',text:'回答准确率人工标注得分'},{key:'C',text:'服务器CPU型号'},{key:'D',text:'用户满意度打分'}], correctAnswer: 'C', difficulty: 3 },
  { id: 34, question: '关于大模型蒸馏，描述正确的是（）',                                             category: 'AI 技术认知',            dimId: 'ai-cognition',     options: [{key:'A',text:'用大模型(教师)输出，训练小模型(学生)，压缩模型体积提升速度'},{key:'B',text:'训练全新基座大模型'},{key:'C',text:'向量数据库压缩文档'},{key:'D',text:'清理对话历史token'}], correctAnswer: 'A', difficulty: 3 },
  { id: 35, question: '当AI产品输出可能产生误导性专业建议（医疗、法律），产品设计上必须（）',             category: 'AI 产品策略',            dimId: 'product-strategy', options: [{key:'A',text:'增加免责提示，明确AI不能替代专业人士'},{key:'B',text:'直接宣称AI结果100%准确'},{key:'C',text:'隐藏AI生成标识'},{key:'D',text:'不做任何提示'}], correctAnswer: 'A', difficulty: 3 },
  { id: 36, question: '下面不属于向量数据库的是（）',                                                 category: 'AI 技术认知',            dimId: 'ai-cognition',     options: [{key:'A',text:'Milvus'},{key:'B',text:'Chroma'},{key:'C',text:'MySQL'},{key:'D',text:'FAISS'}], correctAnswer: 'C', difficulty: 2 },
  { id: 37, question: '在AI产品设计中，"人类反馈强化学习RLHF"主要作用是（）',                         category: 'AI 技术认知',            dimId: 'ai-cognition',     options: [{key:'A',text:'根据人类偏好对齐模型输出，提升回答安全性、符合人类价值观'},{key:'B',text:'加速向量检索'},{key:'C',text:'优化前端页面'},{key:'D',text:'存储用户聊天记录'}], correctAnswer: 'A', difficulty: 3 },
  { id: 38, question: '下列场景最适合使用Agent方案的是（）',                                          category: '问题定义与场景选择',      dimId: 'problem-framing',  options: [{key:'A',text:'简单单轮文本翻译'},{key:'B',text:'需要多步拆解、调用工具联网查询计算完成复杂任务'},{key:'C',text:'简单摘要一句话文本'},{key:'D',text:'单轮简单问答'}], correctAnswer: 'B', difficulty: 4 },
  { id: 39, question: 'AI产品经理在对接算法团队，下面哪项做法错误（）',                                 category: '跨团队协作与推进',        dimId: 'cross-team',       options: [{key:'A',text:'只描述业务目标，把全部评估标准交给算法自行定义'},{key:'B',text:'明确业务场景、边界、评估指标、bad case案例'},{key:'C',text:'提供真实业务测试样本'},{key:'D',text:'定义降级兜底逻辑'}], correctAnswer: 'A', difficulty: 3 },
  { id: 40, question: '大模型输出内容过滤安全护栏，主要目的是（）',                                    category: 'AI 产品策略',            dimId: 'product-strategy', options: [{key:'A',text:'拦截暴力、色情、违法违规输出，保障内容安全'},{key:'B',text:'提升模型推理速度'},{key:'C',text:'增大token上限'},{key:'D',text:'优化向量召回'}], correctAnswer: 'A', difficulty: 2 },
  { id: 41, question: '下列哪一项不属于RAG常见bad case（）',                                          category: 'AI 技术认知',            dimId: 'ai-cognition',     options: [{key:'A',text:'召回文档与问题无关，模型错误引用无关材料'},{key:'B',text:'知识库没有对应资料，模型强行编造答案'},{key:'C',text:'向量库正常召回准确文档，模型输出正确答案'},{key:'D',text:'文档切片断裂，信息残缺'}], correctAnswer: 'C', difficulty: 3 },
  { id: 42, question: '多轮对话产品，对话历史如何处理描述错误的是（）',                                 category: 'Prompt 与交互设计',       dimId: 'prompt-design',    options: [{key:'A',text:'全部历史无限塞入上下文窗口，无需截断'},{key:'B',text:'超过窗口要做摘要、截断、滚动窗口'},{key:'C',text:'可以选择性保留关键对话信息'},{key:'D',text:'历史对话会持续消耗token'}], correctAnswer: 'A', difficulty: 3 },
  { id: 43, question: '下面哪一个属于生成式AI产品（）',                                               category: 'AI 技术认知',            dimId: 'ai-cognition',     options: [{key:'A',text:'LLM智能文档助手'},{key:'B',text:'传统ERP管理系统'},{key:'C',text:'静态网页展示网站'},{key:'D',text:'文件下载工具'}], correctAnswer: 'A', difficulty: 2 },
  { id: 44, question: 'AI产品的成本不包含（）',                                                      category: 'AI 产品策略',            dimId: 'product-strategy', options: [{key:'A',text:'Token调用计费'},{key:'B',text:'向量库存储、检索算力'},{key:'C',text:'人工标注评测成本'},{key:'D',text:'用户手机电池硬件采购成本'}], correctAnswer: 'D', difficulty: 3 },
  { id: 45, question: '当业务预算有限，企业内部知识库问答，优先选型思路是（）',                          category: 'AI 产品策略',            dimId: 'product-strategy', options: [{key:'A',text:'直接从零训练千亿基座大模型'},{key:'B',text:'优先RAG方案，基于开源/商用大模型做应用层开发'},{key:'C',text:'大规模全量微调基座模型'},{key:'D',text:'购买大量GPU自建大模型基座'}], correctAnswer: 'B', difficulty: 4 },
  { id: 46, question: '评估AI知识库问答，"引用溯源"功能的核心意义是（）',                              category: '数据与评估思维',          dimId: 'data-eval',        options: [{key:'A',text:'展示回答来源文档片段，方便校验AI答案真实性，降低幻觉风险'},{key:'B',text:'美化页面布局'},{key:'C',text:'增加token消耗'},{key:'D',text:'提升接口响应速度'}], correctAnswer: 'A', difficulty: 3 },
  { id: 47, question: '以下哪项不属于AI产品经理需要产出的文档（）',                                    category: '跨团队协作与推进',        dimId: 'cross-team',       options: [{key:'A',text:'AI模块专项评估方案&bad case库'},{key:'B',text:'模型底层CUDA内核代码'},{key:'C',text:'AI产品PRD'},{key:'D',text:'测试用例（AI场景）'}], correctAnswer: 'B', difficulty: 2 },
  { id: 48, question: '大模型的"对齐"Alignment，指的是（）',                                        category: 'AI 技术认知',            dimId: 'ai-cognition',     options: [{key:'A',text:'让模型输出符合人类意图、价值观、安全规范'},{key:'B',text:'向量数据库索引对齐'},{key:'C',text:'UI界面元素对齐'},{key:'D',text:'服务器时钟时间对齐'}], correctAnswer: 'A', difficulty: 2 },
  { id: 49, question: '下列关于AI产品迭代，说法正确的是（）',                                          category: 'AI 产品策略',            dimId: 'product-strategy', options: [{key:'A',text:'AI产品不需要迭代，上线永久不变'},{key:'B',text:'需要持续收集bad case，迭代prompt、知识库、检索策略，持续优化效果'},{key:'C',text:'只迭代前端界面，不用管模型输出效果'},{key:'D',text:'出现幻觉直接全部下线产品'}], correctAnswer: 'B', difficulty: 3 },
  { id: 50, question: 'AI产品落地中，"数据漂移"Data drift指（）',                                   category: 'AI 技术认知',            dimId: 'ai-cognition',     options: [{key:'A',text:'用户实际业务输入分布，和训练/测试数据集差异变大，导致效果下降'},{key:'B',text:'向量数据库文件丢失'},{key:'C',text:'网络带宽波动'},{key:'D',text:'UI页面布局错乱'}], correctAnswer: 'A', difficulty: 3 },

  // ====== 补充题目：各维度题量均衡 ======
  { id: 51, question: 'AI产品经理与算法团队协作时，以下做法错误的是（）',                              category: '跨团队协作与推进',        dimId: 'cross-team',       options: [{key:'A',text:'共同定义模型评估指标和验收标准'},{key:'B',text:'把业务场景和bad case充分分享给算法'},{key:'C',text:'只提需求不关心模型能力边界'},{key:'D',text:'定期同步迭代进度和优先级调整'}], correctAnswer: 'C', difficulty: 2 },
  { id: 52, question: '当算法团队反馈模型在某些场景下效果不达标，AI产品经理首先应该（）',              category: '跨团队协作与推进',        dimId: 'cross-team',       options: [{key:'A',text:'要求算法立即换更大的模型'},{key:'B',text:'和算法一起分析bad case，判断是数据、Prompt还是模型本身的问题'},{key:'C',text:'直接放弃该场景'},{key:'D',text:'让工程团队绕过算法直接硬编码规则'}], correctAnswer: 'B', difficulty: 3 },
  { id: 53, question: 'AI产品经理与工程团队协作时，需要特别关注（）',                                category: '跨团队协作与推进',        dimId: 'cross-team',       options: [{key:'A',text:'模型推理耗时和成本对产品体验的影响'},{key:'B',text:'工程团队的考勤制度'},{key:'C',text:'代码语言的语法细节'},{key:'D',text:'服务器机房的装修风格'}], correctAnswer: 'A', difficulty: 2 },
  { id: 54, question: '下列哪种场景最适合用AI Agent方案而非简单的LLM对话（）',                        category: '问题定义与场景选择',      dimId: 'problem-framing',  options: [{key:'A',text:'写一首短诗'},{key:'B',text:'需要调用多个工具完成的复杂工作流，如调研+分析+报告生成'},{key:'C',text:'翻译一句话'},{key:'D',text:'给图片加滤镜'}], correctAnswer: 'B', difficulty: 3 },
  { id: 55, question: '评估一个AI产品机会时，"技术可行性"主要指（）',                                category: '问题定义与场景选择',      dimId: 'problem-framing',  options: [{key:'A',text:'团队成员是否掌握所需技术栈'},{key:'B',text:'现有模型能力、数据可得性和成本是否能支撑产品设想'},{key:'C',text:'产品UI是否好看'},{key:'D',text:'目标用户的年龄分布'}], correctAnswer: 'B', difficulty: 2 },
  { id: 56, question: '定义AI产品MVP时，以下哪项不需要优先考虑（）',                                  category: '问题定义与场景选择',      dimId: 'problem-framing',  options: [{key:'A',text:'核心功能是否能验证关键假设'},{key:'B',text:'是否有足够的bad case覆盖核心场景'},{key:'C',text:'产品的Logo设计细节'},{key:'D',text:'降级兜底方案是否完善'}], correctAnswer: 'C', difficulty: 2 },
  { id: 57, question: 'Prompt中使用"角色扮演(Role)"技巧的主要作用是（）',                             category: 'Prompt 与交互设计',       dimId: 'prompt-design',    options: [{key:'A',text:'让模型切换到更专业的表达风格和思维视角'},{key:'B',text:'减少token消耗'},{key:'C',text:'改变模型的语言'},{key:'D',text:'提升网络速度'}], correctAnswer: 'A', difficulty: 2 },
  { id: 58, question: '多轮对话产品中，"上下文截断"的最佳实践是（）',                                  category: 'Prompt 与交互设计',       dimId: 'prompt-design',    options: [{key:'A',text:'保留全部历史对话，不做任何处理'},{key:'B',text:'保留近N轮对话，并对早期对话做摘要压缩'},{key:'C',text:'只保留最后一轮对话'},{key:'D',text:'用户每次重新输入全部背景信息'}], correctAnswer: 'B', difficulty: 3 },
  { id: 59, question: 'AI产品评估中，A/B测试需要特别注意的是（）',                                    category: '数据与评估思维',          dimId: 'data-eval',        options: [{key:'A',text:'测试用户是否均匀分布，避免特定人群偏差'},{key:'B',text:'测试时间越短越好'},{key:'C',text:'不需要统计显著性检验'},{key:'D',text:'只看模型准确率即可'}], correctAnswer: 'A', difficulty: 3 },
  { id: 60, question: '以下哪个指标最能反映AI产品的端到端用户体验（）',                                category: '数据与评估思维',          dimId: 'data-eval',        options: [{key:'A',text:'模型参数量'},{key:'B',text:'单次推理延迟'},{key:'C',text:'用户任务完成率(Task Success Rate)'},{key:'D',text:'服务器CPU利用率'}], correctAnswer: 'C', difficulty: 2 },

  // ====== 补充题目二：各维度进一步均衡 ======
  { id: 61, question: 'AI产品经理在跨团队沟通中，以下哪项技巧最有效（）',                              category: '跨团队协作与推进',        dimId: 'cross-team',       options: [{key:'A',text:'用业务语言描述问题和目标，减少技术术语'},{key:'B',text:'只发文字消息，不做任何口头沟通'},{key:'C',text:'把所有技术细节都暴露给所有人'},{key:'D',text:'会议只讲结论不做记录'}], correctAnswer: 'A', difficulty: 2 },
  { id: 62, question: 'AI项目中"技术债"的处理方式，以下合理的是（）',                                  category: '跨团队协作与推进',        dimId: 'cross-team',       options: [{key:'A',text:'完全不管技术债，先上线再说'},{key:'B',text:'定期预留时间偿还关键技术债，避免积重难返'},{key:'C',text:'让技术团队自行处理，产品不用关心'},{key:'D',text:'技术债只会影响工程团队'}], correctAnswer: 'B', difficulty: 3 },
  { id: 63, question: '关于AI项目协作中的"节奏同步"，以下做法正确的是（）',                            category: '跨团队协作与推进',        dimId: 'cross-team',       options: [{key:'A',text:'各团队独立推进，不需要同步'},{key:'B',text:'建立定期同步机制，对齐进度、风险和优先级'},{key:'C',text:'只在项目结束时同步一次'},{key:'D',text:'同步只针对管理层'}], correctAnswer: 'B', difficulty: 2 },
  { id: 64, question: 'AI产品从0到1推进时，产品经理需要具备的核心能力是（）',                          category: '跨团队协作与推进',        dimId: 'cross-team',       options: [{key:'A',text:'独立完成所有技术开发工作'},{key:'B',text:'在不确定环境下协调多方、快速验证和迭代'},{key:'C',text:'精通算法底层论文'},{key:'D',text:'只会做市场推广'}], correctAnswer: 'B', difficulty: 3 },
  { id: 65, question: 'AI产品经理在选择技术方案时，以下做法合理的是（）',                              category: 'AI 产品策略',            dimId: 'product-strategy', options: [{key:'A',text:'盲目追求最新最火的技术'},{key:'B',text:'在技术成熟度、成本、团队能力之间做平衡决策'},{key:'C',text:'只看技术是否先进'},{key:'D',text:'完全听从算法团队的决定'}], correctAnswer: 'B', difficulty: 2 },
  { id: 66, question: 'AI产品的"护城河"通常不包括（）',                                              category: 'AI 产品策略',            dimId: 'product-strategy', options: [{key:'A',text:'数据积累形成的飞轮效应'},{key:'B',text:'品牌和用户心智'},{key:'C',text:'一次性的促销活动'},{key:'D',text:'技术壁垒和专利'}], correctAnswer: 'C', difficulty: 2 },
  { id: 67, question: 'AI产品定价策略中，以下哪种思路更合理（）',                                      category: 'AI 产品策略',            dimId: 'product-strategy', options: [{key:'A',text:'只看竞品定价，不考虑自身成本'},{key:'B',text:'结合算力成本、用户价值和竞品定价综合考虑'},{key:'C',text:'定价越低越好'},{key:'D',text:'定价越高越能体现价值'}], correctAnswer: 'B', difficulty: 3 },
  { id: 68, question: '在AI产品中，"用户隐私保护"的首要原则是（）',                                    category: 'AI 产品策略',            dimId: 'product-strategy', options: [{key:'A',text:'尽量收集更多数据以提升模型效果'},{key:'B',text:'最小化数据收集，仅收集必要信息并做好加密存储'},{key:'C',text:'数据可以随意共享给第三方'},{key:'D',text:'不需要告知用户数据用途'}], correctAnswer: 'B', difficulty: 2 },
  { id: 69, question: 'AI产品需求文档PRD中，以下哪项描述不够规范（）',                                  category: 'AI 产品策略',            dimId: 'product-strategy', options: [{key:'A',text:'明确写清AI功能的输入、输出、降级策略'},{key:'B',text:'定义可量化的AI效果验收指标'},{key:'C',text:'只写"让AI更智能"这种模糊描述'},{key:'D',text:'标注AI模块的风险和边界'}], correctAnswer: 'C', difficulty: 2 },
  { id: 70, question: '以下哪种方法最适合评估AI生成内容的质量（）',                                    category: '数据与评估思维',          dimId: 'data-eval',        options: [{key:'A',text:'只看生成速度'},{key:'B',text:'建立多维度评估体系，包括准确性、相关性、流畅性等'},{key:'C',text:'凭感觉主观判断'},{key:'D',text:'只看内容长度'}], correctAnswer: 'B', difficulty: 3 },
  { id: 71, question: 'AI产品的"评估集(Eval Set)"设计中，以下做法正确的是（）',                        category: '数据与评估思维',          dimId: 'data-eval',        options: [{key:'A',text:'评估集只包含简单case'},{key:'B',text:'评估集应覆盖典型场景和边界case，定期更新'},{key:'C',text:'评估集可以永远不变'},{key:'D',text:'评估集不需要标注正确答案'}], correctAnswer: 'B', difficulty: 2 },
  { id: 72, question: '关于AI产品的线上监控，以下哪项不属于关键监控指标（）',                          category: '数据与评估思维',          dimId: 'data-eval',        options: [{key:'A',text:'接口成功率和延迟'},{key:'B',text:'用户满意度评分'},{key:'C',text:'服务器所在城市的天气'},{key:'D',text:'用户留存率'}], correctAnswer: 'C', difficulty: 2 },
  { id: 73, question: 'AI产品评估中"人工标注"的主要作用是（）',                                        category: '数据与评估思维',          dimId: 'data-eval',        options: [{key:'A',text:'完全替代自动化评估'},{key:'B',text:'作为Ground Truth验证AI输出质量和自动化评估的准确性'},{key:'C',text:'只用来训练模型'},{key:'D',text:'不需要人工标注，全靠机器'}], correctAnswer: 'B', difficulty: 2 },
  { id: 74, question: '下列哪项是AI产品"场景画布"的核心要素（）',                                      category: '问题定义与场景选择',      dimId: 'problem-framing',  options: [{key:'A',text:'用户痛点、AI解决方案、商业价值和技术可行性'},{key:'B',text:'产品UI设计稿'},{key:'C',text:'代码架构图'},{key:'D',text:'公司组织架构'}], correctAnswer: 'A', difficulty: 2 },
  { id: 75, question: 'AI产品机会评估框架中，"市场规模"的评估方法是（）',                              category: '问题定义与场景选择',      dimId: 'problem-framing',  options: [{key:'A',text:'凭感觉估计'},{key:'B',text:'通过TAM/SAM/SOM框架，结合行业数据和用户画像进行量化估算'},{key:'C',text:'只看现有竞品的用户数'},{key:'D',text:'不需要评估市场规模'}], correctAnswer: 'B', difficulty: 3 },
  { id: 76, question: '以下哪种用户需求最适合用AI技术解决（）',                                        category: '问题定义与场景选择',      dimId: 'problem-framing',  options: [{key:'A',text:'需要高度创造性和灵活性的任务'},{key:'B',text:'完全不需要灵活性的机械重复任务'},{key:'C',text:'用户已经能完美手工完成的简单任务'},{key:'D',text:'需要物理力量的体力劳动'}], correctAnswer: 'A', difficulty: 2 },
  { id: 77, question: 'Prompt设计中的"思维链(Chain-of-Thought)"技巧主要用于（）',                       category: 'Prompt 与交互设计',       dimId: 'prompt-design',    options: [{key:'A',text:'让模型展示推理过程，提升复杂问题的回答准确率'},{key:'B',text:'让模型回答更短'},{key:'C',text:'减少token消耗'},{key:'D',text:'改变模型的语言风格'}], correctAnswer: 'A', difficulty: 3 },
  { id: 78, question: 'AI交互设计中，以下哪种做法能提升用户信任感（）',                                category: 'Prompt 与交互设计',       dimId: 'prompt-design',    options: [{key:'A',text:'展示AI思考过程和引用来源'},{key:'B',text:'把AI回答包装成专家口吻，不给纠错入口'},{key:'C',text:'隐藏AI生成标识'},{key:'D',text:'只展示结论，不展示过程'}], correctAnswer: 'A', difficulty: 3 },
  { id: 79, question: '关于Prompt中的"负面约束"，以下说法正确的是（）',                                 category: 'Prompt 与交互设计',       dimId: 'prompt-design',    options: [{key:'A',text:'负面约束可以有效规避不期望的输出格式和内容'},{key:'B',text:'负面约束没有任何作用'},{key:'C',text:'负面约束会让模型崩溃'},{key:'D',text:'只需要正面描述，不需要负面约束'}], correctAnswer: 'A', difficulty: 2 },
  { id: 80, question: 'AI产品的"对话流设计"中，以下做法合理的是（）',                                  category: 'Prompt 与交互设计',       dimId: 'prompt-design',    options: [{key:'A',text:'对话过程中动态调整prompt，引导用户完成任务'},{key:'B',text:'始终使用同一个prompt，不做任何调整'},{key:'C',text:'不让用户打断对话流程'},{key:'D',text:'对话不需要状态管理'}], correctAnswer: 'A', difficulty: 3 },
];

export const TOTAL_QUIZ_QUESTIONS = 25;

// ====== localStorage 工具函数 ======
const STORAGE_KEY = 'ai_pm_coach_assessment';

export const saveAnswerHistory = (records) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); } catch (e) { console.warn('localStorage 存储失败:', e); }
};

export const loadAnswerHistory = () => {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
};

export const clearAnswerHistory = () => {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
};

// ====== CAT 维度分数读取（从 CAT 引擎持久化的状态中提取） ======
const CAT_STORAGE_KEY = 'ai_pm_coach_cat_state';

export const calcDimensionScores = () => {
  try {
    const raw = localStorage.getItem(CAT_STORAGE_KEY);
    if (!raw) return {};
    const state = JSON.parse(raw);
    const scores = {};
    if (state.dims) {
      Object.keys(state.dims).forEach((id) => {
        scores[id] = state.dims[id].score || 0;
      });
    }
    return scores;
  } catch (e) {
    return {};
  }
};

// ====== 历史快照保存/读取（复测对比功能） ======
const SNAPSHOT_KEY = 'ai_pm_coach_snapshots';

/**
 * 单次快照结构:
 * {
 *   id: string,          // 唯一标识（基于时间戳）
 *   takenAt: number,     // 测评完成的时间戳 ms
 *   scores: { dimId: number },  // 各维度得分
 *   totalScore: number,  // 总分（六维平均）
 *   questionCount: number,      // 本次答题总题数
 * }
 */

function readAllSnapshots() {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function writeSnapshots(list) {
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('快照写入失败:', e);
  }
}

/**
 * 把当前的答题结果保存为一次快照。
 * 由 ResultsPage 在首屏加载且有答题记录时调用（若距上次快照不足 1 小时则复用/跳过避免重复）。
 */
export const saveCurrentResultAsSnapshot = () => {
  const scores = calcDimensionScores();
  const scoreVals = Object.values(scores);
  if (!scoreVals.length || scoreVals.every(s => !s)) return null;

  const records = loadAnswerHistory() || [];
  const now = Date.now();
  const existing = readAllSnapshots();

  // 避免重复：1 小时内且总分相同的快照视为同一次
  const total = getTotalScore(scores);
  const duplicate = existing.find(s => {
    if (Math.abs(s.takenAt - now) > 60 * 60 * 1000) return false;
    return s.totalScore === total;
  });
  if (duplicate) return duplicate.id;

  const snap = {
    id: `snap_${now}`,
    takenAt: now,
    scores,
    totalScore: total,
    questionCount: records.length,
    // 记录本次答过的题ID，用于复测时优先避开
    answeredIds: records.map((r) => r.questionId).filter(Boolean),
  };
  const updated = [...existing, snap].sort((a, b) => a.takenAt - b.takenAt);
  // 最多保留 50 次历史
  while (updated.length > 50) updated.shift();
  writeSnapshots(updated);
  return snap.id;
};

export const getAllSnapshots = () => readAllSnapshots();

export const getLatestSnapshot = () => {
  const all = readAllSnapshots();
  return all.length > 0 ? all[all.length - 1] : null;
};

export const getPreviousSnapshot = () => {
  const all = readAllSnapshots();
  return all.length >= 2 ? all[all.length - 2] : null;
};

export const clearAllSnapshots = () => {
  try { localStorage.removeItem(SNAPSHOT_KEY); } catch (e) {}
};

// ====== 题库校验：每个维度题量是否充足 ======
// 如果某维度题量少于 3 道，视为未就绪，禁止启动测评
export const validateQuestionBankReady = () => {
  const dimCounts = {};
  DIMENSIONS.forEach(d => {
    dimCounts[d.id] = REAL_QUESTIONS.filter(q => q.dimId === d.id).length;
  });
  const allReady = DIMENSIONS.every(d => dimCounts[d.id] >= 3);
  return {
    ready: allReady,
    dimCounts,
    missing: DIMENSIONS.filter(d => dimCounts[d.id] < 3).map(d => ({
      id: d.id,
      name: d.name,
      count: dimCounts[d.id],
    })),
  };
};

// ====== 未完成测评进度持久化 ======
// 用于用户中途关闭浏览器后，重新打开时可以继续
const IN_PROGRESS_KEY = 'ai_pm_coach_in_progress';

/**
 * 保存一次未完成的测评进度（每答完一题调用）
 * @param {object} payload { catState, records, updatedAt }
 */
export const saveInProgress = (payload) => {
  try {
    localStorage.setItem(IN_PROGRESS_KEY, JSON.stringify({
      ...payload,
      updatedAt: Date.now(),
    }));
  } catch (e) {
    console.warn('进度保存失败:', e);
  }
};

/**
 * 读取未完成的测评进度
 * @returns {object|null} { catState, records, updatedAt } 或 null
 */
export const loadInProgress = () => {
  try {
    const raw = localStorage.getItem(IN_PROGRESS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // 只有 records 存在且没做完的才视为"未完成"
    if (!data || !Array.isArray(data.records)) return null;
    const count = data.records.length;
    // 如果已经达到 25 题以上（完成），不算未完成
    if (count >= 25) return null;
    return data;
  } catch (e) {
    return null;
  }
};

/**
 * 清除未完成的测评进度（测评完成或用户选择放弃重来时调用）
 */
export const clearInProgress = () => {
  try {
    localStorage.removeItem(IN_PROGRESS_KEY);
  } catch (e) {}
};