const app = document.getElementById("app");
const toastEl = document.getElementById("toast");
const modalRoot = document.getElementById("modal-root");

const state = {
  authed: localStorage.getItem("deepverify_authed") === "1",
  workspace: localStorage.getItem("deepverify_workspace") || "personal",
  authMode: "login",
  loginTab: "code",
  registerTab: "phone",
  rankingScene: "大语言",
  assetType: "models",
  assetScope: "public",
  assetFilters: {
    queryDraft: "",
    query: "",
    category: "全部分类",
    tag: "全部标签",
  },
  imageAsset: {
    scope: "public",
    queryDraft: "",
    query: "",
    framework: "全部框架",
    page: 1,
    pageSize: 10,
  },
  datasetAsset: {
    scope: "public",
    queryDraft: "",
    query: "",
    language: "全部语言",
    task: "全部任务类型",
    page: 1,
    pageSize: 10,
    activeDatasetId: "",
  },
  modelAsset: {
    scope: "public",
    queryDraft: "",
    query: "",
    scene: "全部场景",
    capability: "全部功能",
    minParams: "0",
    maxParams: "2000",
    minParamsDraft: "0",
    maxParamsDraft: "2000",
    paramPanelOpen: false,
    tag: "全部标签",
    page: 1,
    pageSize: 10,
  },
  selectedPresetModelId: "",
  sidebarCollapsed: false,
  teamRole: localStorage.getItem("deepverify_team_role") || "team_admin",
  navExpanded: {
    tasks: true,
    reports: true,
    assets: true,
    team: true,
  },
  modelTask: {
    target: "inference",
    modelSource: "public",
    model: "qwen",
    datasetSource: "public",
    dataset: "ceval",
    imageSource: "public",
    image: "pytorch",
    imageCategory: "VLLM",
    compute: "atlas",
    nodeMode: "single",
    cardCount: "2",
    customCardCount: "16",
    execution: "standard",
    openPicker: "",
  },
  operatorTask: {
    operatorSource: "public",
    operatorCategory: "神经网络算子",
    operators: ["conv2d"],
    operatorQuery: "",
    computeSource: "public",
    computeVendor: "全部厂商",
    imageVendor: "全部厂商",
    imageFramework: "全部框架",
    execution: "standard",
    openPicker: "",
  },
  operatorAsset: {
    scope: "public",
    queryDraft: "",
    query: "",
    category: "全部分类",
    page: 1,
    pageSize: 10,
  },
  modelTaskFilters: {
    model: { query: "", scene: "全部", support: "全部" },
    dataset: { query: "", type: "全部", scene: "全部" },
    compute: { query: "", source: "全部", chipType: "全部", chipVendor: "全部" },
    image: { query: "", framework: "全部", status: "全部" },
  },
  taskFilters: {
    queryDraft: "",
    query: "",
    status: "全部状态",
    type: "全部类型",
    execution: "全部执行方式",
  },
  selectedTaskIds: [],
  reportFilters: {
    queryDraft: "",
    query: "",
    status: "全部状态",
    type: "全部报告类型",
  },
  computeFilters: {
    queryDraft: "",
    query: "",
    source: "全部来源",
    status: "全部状态",
  },
  selectedReportIds: [],
  deletedReportIds: [],
  activeTaskId: "",
  activeReportId: "",
  naturalParsed: null,
  taskTags: [
    { key: "场景", value: "大语言" },
    { key: "任务", value: "推理" },
    { key: "对比", value: "芯片" },
  ],
  operatorTags: [
    { key: "类型", value: "算子验证" },
    { key: "算子", value: "单算子" },
    { key: "目标", value: "性能稳定性" },
    { key: "对比", value: "芯片" },
  ],
  tagEditTarget: "model",
  labelDraft: [],
};

const scenes = ["大语言", "多模态", "音频", "科学计算", "搜广推"];
const modelScenarios = [
  { key: "llm", name: "大语言", title: "大语言模型验证", icon: "LLM" },
  { key: "multimodal", name: "多模态", title: "多模态模型验证", icon: "MM" },
  { key: "audio", name: "音频", title: "音频模型验证", icon: "AU" },
  { key: "science", name: "科学计算", title: "科学计算模型验证", icon: "SC" },
  { key: "retrieval", name: "检索匹配", title: "检索匹配模型验证", icon: "IR" },
];
const scenarioRouteMap = Object.fromEntries(modelScenarios.map((item) => [`task-model-${item.key}`, item]));
const assetTypes = {
  datasets: "数据集资产",
  models: "模型资产",
  images: "镜像资产",
  operators: "算子资产",
};

const assetRoutes = {
  datasets: "assets-datasets",
  models: "assets-models",
  images: "assets-images",
  operators: "assets-operators",
};

const imageAssetRows = [
  { id: "IMG-PRESET-001", scope: "public", name: "pytorch-2.4-cuda12", version: "2.4", framework: "PyTorch", runtime: "CUDA 12.4 / Python 3.10", chipVendor: "NVIDIA", scenes: "模型训练 / 模型推理", resources: "NVIDIA GPU", status: "可用", updatedAt: "2026-05-28" },
  { id: "IMG-PRESET-002", scope: "public", name: "tensorflow-2.16-gpu", version: "2.16", framework: "TensorFlow", runtime: "CUDA 12.2 / Python 3.10", chipVendor: "NVIDIA", scenes: "模型训练", resources: "NVIDIA GPU / CPU", status: "可用", updatedAt: "2026-05-22" },
  { id: "IMG-PRESET-003", scope: "public", name: "mindspore-2.3-cann", version: "2.3", framework: "MindSpore", runtime: "CANN 8.0 / Python 3.10", chipVendor: "昇腾", scenes: "模型训练 / 算子验证", resources: "昇腾 NPU", status: "可用", updatedAt: "2026-05-20" },
  { id: "IMG-PRESET-004", scope: "public", name: "vllm-0.20.1", version: "0.20.1", framework: "PyTorch", runtime: "vLLM 0.20.1 / CUDA 12.4", chipVendor: "NVIDIA", scenes: "模型推理", resources: "NVIDIA GPU / H20 集群", status: "维护中", reason: "基础运行环境维护中", updatedAt: "2026-06-01" },
  { id: "IMG-PRESET-005", scope: "public", name: "sglang-0.4.8", version: "0.4.8", framework: "PyTorch", runtime: "SGLang 0.4.8 / CUDA 12.4", chipVendor: "NVIDIA", scenes: "模型推理", resources: "NVIDIA GPU", status: "可用", updatedAt: "2026-05-30" },
  { id: "IMG-MY-001", scope: "mine", name: "qwen-runtime-custom", version: "v1.0", origin: "上传", framework: "PyTorch", runtime: "CUDA 12.1 / Python 3.10", chipVendor: "NVIDIA", scenes: "推理验证", resources: "NVIDIA GPU", tags: "大语言 / 推理", size: "18.6GB", description: "Qwen 推理验证环境", status: "可用", createdAt: "2026-05-18" },
  { id: "IMG-MY-002", scope: "mine", name: "operator-cann-lab", version: "v0.8", origin: "上传", framework: "MindSpore", runtime: "CANN 8.0 / Python 3.10", chipVendor: "昇腾", scenes: "算子验证", resources: "昇腾 NPU", tags: "算子 / 昇腾", size: "12.4GB", description: "算子验证实验环境", status: "校验中", reason: "镜像依赖校验中", createdAt: "2026-06-03" },
  { id: "IMG-MY-003", scope: "mine", name: "torch-train-copy", version: "v1.1", origin: "复制", framework: "PyTorch", runtime: "CUDA 12.4 / Python 3.10", chipVendor: "NVIDIA", scenes: "训练验证", resources: "NVIDIA GPU", tags: "训练 / 基线", size: "20.1GB", description: "基于预置镜像复制的训练环境", status: "可用", createdAt: "2026-06-01" },
  { id: "IMG-TEAM-001", scope: "team", name: "team-pytorch-h20", version: "team-2026.04", origin: "团队上传", framework: "PyTorch", runtime: "CUDA 12.4 / Python 3.10", chipVendor: "NVIDIA", scenes: "推理验证", resources: "H20 集群", tags: "H20 / 团队", size: "21.8GB", description: "团队 H20 推理环境", status: "可用", createdAt: "2026-05-12" },
  { id: "IMG-TEAM-002", scope: "team", name: "ascend-cann-8.0", version: "v2.0", origin: "成员共享", framework: "MindSpore", runtime: "CANN 8.0 / Python 3.10", chipVendor: "昇腾", scenes: "算子验证", resources: "昇腾 NPU", tags: "昇腾 / 算子", size: "15.2GB", description: "昇腾算子验证环境", status: "可用", createdAt: "2026-05-26" },
];

const modelAssetRows = [
  { id: "MDL-PRESET-001", scope: "public", name: "DeepSeek-R1", scene: "大语言 / 推理增强", capability: "推理", provider: "DeepSeek", params: 671, updatedAt: "2026-05-30", description: "适合复杂推理、代码生成与知识问答验证。", hot: true },
  { id: "MDL-PRESET-002", scope: "public", name: "Kimi-K2", scene: "大语言 / 长上下文", capability: "推理", provider: "Kimi", params: 1000, updatedAt: "2026-05-26", description: "面向长文本、多轮对话和文档理解场景。", hot: true },
  { id: "MDL-PRESET-003", scope: "public", name: "Qwen2.5-72B", scene: "大语言 / 通用问答", capability: "训练 / 推理", provider: "通义千问", params: 72, updatedAt: "2026-05-20", description: "通用大语言模型，可用于吞吐、延迟和精度基线验证。", hot: true },
  { id: "MDL-PRESET-004", scope: "public", name: "GLM-4.6", scene: "大语言 / 工具调用", capability: "训练 / 推理", provider: "智谱", params: 130, updatedAt: "2026-05-18", description: "适用于工具调用、知识问答和代码辅助验证。", hot: false },
  { id: "MDL-PRESET-005", scope: "public", name: "Llama-3.1-70B", scene: "大语言 / 开源基线", capability: "推理", provider: "Meta", params: 70, updatedAt: "2026-05-16", description: "开源大模型基线，用于跨芯片推理能力对比。", hot: false },
  { id: "MDL-PRESET-006", scope: "public", name: "CLIP-ViT-Large", scene: "多模态 / 图文检索", capability: "推理", provider: "OpenAI", params: 0.43, updatedAt: "2026-05-12", description: "图文匹配和多模态表示验证常用模型。", hot: false },
  { id: "MDL-PRESET-007", scope: "public", name: "Whisper-Large-V3", scene: "音频 / 语音识别", capability: "推理", provider: "OpenAI", params: 1.55, updatedAt: "2026-05-10", description: "语音识别与音频转写场景验证模型。", hot: false },
  { id: "MDL-PRESET-008", scope: "public", name: "AlphaFold-Science", scene: "科学计算 / 蛋白结构", capability: "推理", provider: "DeepMind", params: 93, updatedAt: "2026-05-08", description: "科学计算场景下的结构预测验证模型。", hot: false },
  { id: "MDL-PRESET-009", scope: "public", name: "BGE-Reranker-Large", scene: "检索匹配 / 重排序", capability: "训练 / 推理", provider: "BAAI", params: 0.56, updatedAt: "2026-05-06", description: "适合检索、排序和召回链路验证。", hot: false },
  { id: "MDL-PRESET-010", scope: "public", name: "Paraformer-Large", scene: "音频 / 语音识别", capability: "训练 / 推理", provider: "ModelScope", params: 0.23, updatedAt: "2026-05-04", description: "中文语音识别验证模型，可用于端到端延迟评估。", hot: false },
  { id: "MDL-MY-001", scope: "mine", name: "PuJian-Lite", visible: "仅自己可见", owner: "jing", version: "v1.0.1", tags: "大语言 / 推理", createdAt: "2026-05-18" },
  { id: "MDL-MY-002", scope: "mine", name: "Qwen2.5-7B-Finetune", visible: "仅自己可见", owner: "jing", version: "v0.9", tags: "大语言 / 训练", createdAt: "2026-05-24" },
  { id: "MDL-MY-003", scope: "mine", name: "Private-Reranker-3B", visible: "仅自己可见", owner: "jing", version: "v2.1", tags: "检索匹配 / 推理", createdAt: "2026-05-29" },
  { id: "MDL-TEAM-001", scope: "team", name: "VisionLab-VL", visible: "当前团队", owner: "lin", version: "team-v1.2", tags: "多模态 / 推理", createdAt: "2026-05-21" },
  { id: "MDL-TEAM-002", scope: "team", name: "Team-Qwen2.5-32B", visible: "当前团队", owner: "jing", version: "team-r3", tags: "大语言 / 训练", createdAt: "2026-05-27" },
  { id: "MDL-TEAM-003", scope: "team", name: "Team-DeepSeek-R1-Distill", visible: "当前团队", owner: "lin", version: "distill-32b", tags: "大语言 / 推理", createdAt: "2026-06-02" },
];

function isTeamWorkspace() {
  return state.workspace === "team";
}

function workspacePrivateScope() {
  return isTeamWorkspace()
    ? { key: "team", label: "团队资源", prefix: "团队" }
    : { key: "mine", label: "我的资源", prefix: "我的" };
}

function assetScopeOptions() {
  return [
    { key: "public", label: "预置资源", prefix: "预置" },
    workspacePrivateScope(),
  ];
}

function normalizeAssetScope() {
  const valid = assetScopeOptions().map((item) => item.key);
  if (!valid.includes(state.assetScope)) state.assetScope = "public";
}

function optionList(options) {
  return options.map((item) => `<option>${item}</option>`).join("");
}

function workspaceAssetOptions(kind) {
  const scope = workspacePrivateScope();
  const samples = {
    model: { public: "Qwen2.5-72B", mine: "PuJian-Lite", team: "VisionLab-VL" },
    dataset: { public: "C-Eval", mine: "个人推理样本集", team: "搜广推样本集" },
    image: { public: "pytorch-2.4-cuda12", mine: "pytorch-custom-runtime", team: "ascend-cann-8.0" },
    operator: { public: "FlashAttention", mine: "LayerNorm-Fused", team: "SparseMatMul" },
  }[kind];
  const names = { model: "模型", dataset: "数据集", image: "镜像", operator: "算子" };
  return [
    `预置${names[kind]} / ${samples.public}`,
    `${scope.prefix}${names[kind]} / ${samples[scope.key]}`,
  ];
}

function workspaceComputeOptions() {
  return isTeamWorkspace()
    ? ["Atlas 800T A2 资源池 · 可调度", "团队 H20 推理集群 · 可调度"]
    : ["Atlas 800T A2 资源池 · 可调度", "我的 A800 训练节点 · 可调度"];
}

const modelTaskResources = {
  models: [
    { id: "deepseek-v4-pro", source: "public", name: "DeepSeek-V4-Pro", scene: "大语言", support: "推理", version: "1600B / MoE", status: "可用" },
    { id: "deepseek-v4-pro-fp8", source: "public", name: "DeepSeek-V4-Pro-FP8", scene: "大语言", support: "推理", version: "1600B / FP8", status: "可用" },
    { id: "deepseek-v4-flash", source: "public", name: "DeepSeek-V4-Flash", scene: "大语言", support: "推理", version: "284B / Flash", status: "可用" },
    { id: "kimi-k2", source: "public", name: "Kimi-K2", scene: "大语言", support: "推理", version: "1000B / long-context", status: "可用" },
    { id: "qwen", source: "public", name: "Qwen2.5-72B", scene: "大语言", support: "训练 / 推理", version: "72B / v2.5", status: "可用" },
    { id: "deepseek", source: "public", name: "DeepSeek-V3", scene: "大语言", support: "推理", version: "671B MoE / 2026.01", status: "可用" },
    { id: "glm-46", source: "public", name: "GLM-4.6", scene: "大语言", support: "训练 / 推理", version: "2026.02", status: "可用" },
    { id: "qwen-coder", source: "public", name: "Qwen3-Coder-30B-A3B-Instruct", scene: "大语言", support: "推理", version: "30B / coder", status: "可用" },
    { id: "llama-31", source: "public", name: "Llama-3.1-70B", scene: "大语言", support: "推理", version: "70B / instruct", status: "可用" },
    { id: "clip-vl", source: "public", name: "CLIP-ViT-Large", scene: "多模态", support: "推理", version: "vit-l/14", status: "可用" },
    { id: "paddleocr-vl", source: "public", name: "PaddleOCR-VL-1.6", scene: "多模态", support: "推理", version: "900M / VL", status: "可用" },
    { id: "whisper", source: "public", name: "Whisper-Large-V3", scene: "音频", support: "推理", version: "large-v3", status: "可用" },
    { id: "paraformer", source: "public", name: "Paraformer-Large", scene: "音频", support: "训练 / 推理", version: "asr-large", status: "可用" },
    { id: "alphafold", source: "public", name: "AlphaFold-Science", scene: "科学计算", support: "推理", version: "science-v1", status: "可用" },
    { id: "science-solver", source: "public", name: "ScienceSolver-7B", scene: "科学计算", support: "训练 / 推理", version: "7B / science", status: "可用" },
    { id: "molformer", source: "public", name: "MolFormer-Base", scene: "科学计算", support: "训练 / 推理", version: "molecule-base", status: "可用" },
    { id: "bge-m3", source: "public", name: "BGE-M3", scene: "检索匹配", support: "推理", version: "0.6B / embedding", status: "可用" },
    { id: "mteb-reranker", source: "public", name: "MTEB-Reranker", scene: "检索匹配", support: "推理", version: "1B / rerank", status: "可用" },
    { id: "bge-reranker", source: "public", name: "BGE-Reranker-Large", scene: "检索匹配", support: "训练 / 推理", version: "large-zh", status: "可用" },
    { id: "e5-retrieval", source: "public", name: "E5-Mistral-Retrieval", scene: "检索匹配", support: "推理", version: "retrieval-v1", status: "可用" },
    { id: "pj-lite", source: "mine", name: "PuJian-Lite", scene: "大语言", support: "推理", version: "7B / 私有版本", status: "可用" },
    { id: "mine-qwen-ft", source: "mine", name: "Qwen2.5-7B-Finetune", scene: "大语言", support: "训练 / 推理", version: "finetune-r3", status: "可用" },
    { id: "mine-science", source: "mine", name: "SciReason-13B", scene: "科学计算", support: "训练 / 推理", version: "13B / fine-tune", status: "可用" },
    { id: "mine-audio", source: "mine", name: "AudioLab-ASR", scene: "音频", support: "推理", version: "asr-v2", status: "可用" },
    { id: "mine-vl", source: "mine", name: "Personal-VL-7B", scene: "多模态", support: "推理", version: "vl-7b", status: "可用" },
    { id: "mine-rerank", source: "mine", name: "Private-Reranker-3B", scene: "检索匹配", support: "推理", version: "rerank-3b", status: "可用" },
    { id: "visionlab", source: "team", name: "VisionLab-VL", scene: "多模态", support: "训练 / 推理", version: "VL-13B / 团队版本", status: "可用" },
    { id: "team-qwen", source: "team", name: "Team-Qwen2.5-32B", scene: "大语言", support: "训练 / 推理", version: "32B / 团队授权", status: "可用" },
    { id: "team-deepseek", source: "team", name: "Team-DeepSeek-R1-Distill", scene: "大语言", support: "推理", version: "distill-32b", status: "可用" },
    { id: "team-rank", source: "team", name: "RankAgent-8B", scene: "检索匹配", support: "推理", version: "8B / team-r2", status: "可用" },
    { id: "team-audio", source: "team", name: "Team-AudioLM", scene: "音频", support: "训练 / 推理", version: "audio-team", status: "可用" },
    { id: "team-science", source: "team", name: "Team-ScienceGPT", scene: "科学计算", support: "推理", version: "science-team", status: "可用" },
  ],
  datasets: [
    { id: "ceval", source: "public", name: "C-Eval (STEM)", type: "文本", scene: "大语言", task: "文本生成", language: "中文", storageSize: "128MB", size: "13.9k 样本", publisher: "C-Eval", version: "2026.1", description: "覆盖 STEM、人文社科等学科的中文模型能力基准数据集。", status: "可用" },
    { id: "mmlu", source: "public", name: "MMLU", type: "文本", scene: "大语言", task: "文本生成", language: "英语", storageSize: "96MB", size: "15.9k 样本", publisher: "OpenAI", version: "1.0", description: "覆盖多学科知识与推理能力的英文评测基准。", status: "可用" },
    { id: "gsm8k", source: "public", name: "GSM8K", type: "文本", scene: "大语言", task: "文本生成", language: "英语", storageSize: "22MB", size: "8.5k 样本", publisher: "OpenAI", version: "1.0", description: "小学数学应用题与多步推理基准。", status: "可用" },
    { id: "humaneval", source: "public", name: "HumanEval", type: "文本", scene: "大语言", task: "文本生成", language: "英语", storageSize: "8MB", size: "164 题", publisher: "OpenAI", version: "1.0", description: "用于代码生成正确性验证的标准题集。", status: "可用" },
    { id: "cmmlu", source: "public", name: "CMMLU", type: "文本", scene: "大语言", task: "文本生成", language: "中文", storageSize: "84MB", size: "11.5k 样本", publisher: "Hugging Face", version: "1.0", description: "面向中文语境的多任务语言理解基准。", status: "可用" },
    { id: "mmbench", source: "public", name: "MMBench", type: "图片", scene: "多模态", task: "多模态", language: "中英双语", storageSize: "2.4GB", size: "20k 样本", publisher: "OpenCompass", version: "1.1", description: "多模态模型视觉理解与推理基准。", status: "可用" },
    { id: "mme", source: "public", name: "MME", type: "图片", scene: "多模态", task: "多模态", language: "中英双语", storageSize: "1.1GB", size: "2.4k 样本", publisher: "Hugging Face", version: "1.0", description: "覆盖感知与认知能力的多模态评测数据集。", status: "可用" },
    { id: "audio-bench", source: "public", name: "AudioBench", type: "音频", scene: "音频", task: "语音识别", language: "中英双语", storageSize: "6.8GB", size: "4.8k 样本", publisher: "平台预置", version: "2.0", description: "语音识别、音频理解与延迟验证基准。", status: "可用" },
    { id: "librispeech", source: "public", name: "LibriSpeech-Test", type: "音频", scene: "音频", task: "语音识别", language: "英语", storageSize: "3.2GB", size: "5.4h 音频", publisher: "OpenSLR", version: "test-clean", description: "英文语音识别标准测试集。", status: "可用" },
    { id: "science-bench", source: "public", name: "ScienceQA", type: "通用", scene: "科学计算", task: "科学计算", language: "英语", storageSize: "420MB", size: "21k 样本", publisher: "Hugging Face", version: "1.0", description: "科学知识、多模态理解和推理验证数据集。", status: "可用" },
    { id: "math-bench", source: "public", name: "MATH-500", type: "文本", scene: "科学计算", task: "科学计算", language: "英语", storageSize: "12MB", size: "500 题", publisher: "Hugging Face", version: "1.0", description: "高难度数学推理验证题集。", status: "可用" },
    { id: "retrieval-bench", source: "public", name: "MTEB-Retrieval", type: "文本", scene: "检索匹配", task: "检索匹配", language: "中英双语", storageSize: "1.8GB", size: "60k 样本", publisher: "Hugging Face", version: "1.0", description: "文本向量检索与语义匹配综合基准。", status: "可用" },
    { id: "msmarco", source: "public", name: "MSMARCO-Passage", type: "文本", scene: "检索匹配", task: "检索匹配", language: "英语", storageSize: "3.6GB", size: "100k 样本", publisher: "Microsoft", version: "v1", description: "段落检索与排序验证标准数据集。", status: "可用" },
    { id: "personal-eval", source: "mine", name: "个人推理样本集", type: "文本", scene: "大语言", task: "文本生成", language: "中文", storageSize: "56MB", size: "8.2k 样本", visible: "仅自己可见", owner: "jing", version: "v1.3", tags: "大语言 / 推理", createdAt: "2026-05-18", updatedAt: "2026-06-02", description: "个人维护的大语言模型推理回归样本。", status: "可用" },
    { id: "mine-table", source: "mine", name: "财务表格问答集", type: "表格", scene: "大语言", task: "文本生成", language: "中文", storageSize: "34MB", size: "2.4k 样本", visible: "已分享给团队", owner: "jing", version: "v2.0", tags: "表格 / 财务", createdAt: "2026-05-20", updatedAt: "2026-06-03", description: "面向财务表格理解和问答的私有数据集。", status: "可用" },
    { id: "mine-audio-set", source: "mine", name: "个人音频测试集", type: "音频", scene: "音频", task: "语音识别", language: "中文", storageSize: "2.1GB", size: "1.8k 样本", visible: "仅自己可见", owner: "jing", version: "v1.1", tags: "音频 / ASR", createdAt: "2026-05-22", updatedAt: "2026-05-30", description: "个人采集的中文语音识别测试样本。", status: "可用" },
    { id: "mine-mm-set", source: "mine", name: "个人图文样本集", type: "图片", scene: "多模态", task: "多模态", language: "中英双语", storageSize: "1.4GB", size: "3.1k 样本", visible: "仅自己可见", owner: "jing", version: "v1.0", tags: "图文 / 多模态", createdAt: "2026-05-25", updatedAt: "2026-05-25", description: "用于图文理解和视觉问答验证的私有样本。", status: "可用" },
    { id: "mine-code-set", source: "mine", name: "个人代码生成集", type: "文本", scene: "大语言", task: "文本生成", language: "中英双语", storageSize: "18MB", size: "960 样本", visible: "仅自己可见", owner: "jing", version: "v1.2", tags: "代码 / 生成", createdAt: "2026-05-27", updatedAt: "2026-06-01", description: "工程代码生成与补全任务的回归样本。", status: "可用" },
    { id: "mine-search-set", source: "mine", name: "个人检索验证集", type: "文本", scene: "检索匹配", task: "检索匹配", language: "中文", storageSize: "74MB", size: "5.2k 样本", visible: "已分享给团队", owner: "jing", version: "v1.4", tags: "检索 / 排序", createdAt: "2026-05-29", updatedAt: "2026-06-04", description: "个人维护的中文搜索检索与排序样本。", status: "可用" },
    { id: "search-ads", source: "team", name: "检索匹配样本集", type: "文本", scene: "检索匹配", task: "检索匹配", language: "中文", storageSize: "4.8GB", size: "126k 样本", visible: "当前团队", owner: "浦鉴 Lab", version: "team-v3", tags: "检索 / 搜广推", createdAt: "2026-04-18", updatedAt: "2026-06-02", description: "团队沉淀的搜索、广告与推荐匹配样本。", status: "可用" },
    { id: "team-video", source: "team", name: "团队视频理解集", type: "视频", scene: "多模态", task: "多模态", language: "中英双语", storageSize: "18.2GB", size: "9.6k 样本", visible: "当前团队", owner: "Vision Lab", version: "team-v1.2", tags: "视频 / 理解", createdAt: "2026-04-22", updatedAt: "2026-05-30", description: "团队视频场景理解与问答数据集。", status: "可用" },
    { id: "team-science-set", source: "team", name: "团队科学计算集", type: "表格", scene: "科学计算", task: "科学计算", language: "中英双语", storageSize: "2.6GB", size: "18k 样本", visible: "当前团队", owner: "Science Lab", version: "team-v2", tags: "科学 / 表格", createdAt: "2026-04-25", updatedAt: "2026-06-01", description: "科学计算、实验数据理解与结构化推理样本。", status: "可用" },
    { id: "team-audio-set", source: "team", name: "团队音频验证集", type: "音频", scene: "音频", task: "语音识别", language: "中文", storageSize: "8.4GB", size: "7.5k 样本", visible: "当前团队", owner: "Audio Lab", version: "team-v1.5", tags: "音频 / 语音", createdAt: "2026-05-02", updatedAt: "2026-06-03", description: "团队语音识别和音频理解验证数据。", status: "可用" },
    { id: "team-llm-set", source: "team", name: "团队大模型验收集", type: "文本", scene: "大语言", task: "文本生成", language: "中文", storageSize: "620MB", size: "32k 样本", visible: "当前团队", owner: "浦鉴 Lab", version: "team-v4", tags: "大语言 / 验收", createdAt: "2026-05-06", updatedAt: "2026-06-04", description: "团队大模型版本验收与回归验证样本。", status: "可用" },
    { id: "team-mmbench-set", source: "team", name: "团队多模态回归集", type: "通用", scene: "多模态", task: "多模态", language: "中英双语", storageSize: "12.8GB", size: "12k 样本", visible: "当前团队", owner: "Vision Lab", version: "team-v2.1", tags: "多模态 / 回归", createdAt: "2026-05-10", updatedAt: "2026-06-04", description: "覆盖图片和视频的团队多模态回归数据。", status: "可用" },
  ],
};

const publicOperatorLibrary = {
  神经网络算子: [
    { id: "conv2d", name: "Conv2d" },
    { id: "batchnorm", name: "BatchNorm" },
    { id: "maxpool2d", name: "MaxPool2d" },
    { id: "dropout", name: "Dropout" },
  ],
  矩阵计算算子: [
    { id: "matmul", name: "MatMul" },
    { id: "gemm", name: "GEMM" },
    { id: "batch-matmul", name: "BatchMatMul" },
  ],
  图像处理算子: [
    { id: "resize", name: "Resize" },
    { id: "crop", name: "Crop" },
    { id: "pad", name: "Pad" },
  ],
  通信算子: [
    { id: "allreduce", name: "AllReduce" },
    { id: "allgather", name: "AllGather" },
    { id: "broadcast", name: "Broadcast" },
  ],
  归一化算子: [
    { id: "layernorm", name: "LayerNorm" },
    { id: "rmsnorm", name: "RMSNorm" },
  ],
  激活函数算子: [
    { id: "relu", name: "ReLU" },
    { id: "gelu", name: "GELU" },
    { id: "silu", name: "SiLU" },
  ],
};

const privateOperatorResources = [
  { id: "mine-fused-ln", source: "mine", name: "LayerNorm-Fused", category: "归一化算子", framework: "PyTorch", status: "可用" },
  { id: "mine-flash-attn", source: "mine", name: "FlashAttention-Custom", category: "神经网络算子", framework: "CUDA", status: "可用" },
  { id: "mine-matmul-int8", source: "mine", name: "MatMul-INT8", category: "矩阵计算算子", framework: "MindSpore", status: "不可用", reason: "依赖版本不匹配" },
  { id: "team-sparse-matmul", source: "team", name: "SparseMatMul", category: "矩阵计算算子", framework: "CANN", status: "可用" },
  { id: "team-allreduce", source: "team", name: "AllReduce-Tuned", category: "通信算子", framework: "CUDA", status: "可用" },
  { id: "team-rmsnorm", source: "team", name: "RMSNorm-Team", category: "归一化算子", framework: "PyTorch", status: "接入中", reason: "算子包审核中" },
];

function sourceLabel(source, kind) {
  const names = { model: "模型", dataset: "数据集", image: "镜像", operator: "算子" };
  return { public: "预置", mine: "我的", team: "团队" }[source] + names[kind];
}

function sourceOptionsFor(kind) {
  const privateKey = workspacePrivateScope().key;
  return [
    { key: "public", label: sourceLabel("public", kind) },
    { key: privateKey, label: sourceLabel(privateKey, kind) },
  ];
}

function workspaceResourceScopes() {
  return ["public", workspacePrivateScope().key];
}

function imageTaskResources() {
  return imageAssetRows.map((item) => ({
    ...item,
    source: item.scope,
    category: item.framework,
    env: item.runtime || "-",
  }));
}

function computeTaskResources() {
  return computeRows;
}

function resourceIsSelectable(item) {
  return Boolean(item) && item.status === "可用";
}

function workspaceCanUseResource(item) {
  return Boolean(item) && workspaceResourceScopes().includes(item.scope || item.source);
}

function firstSelectableResource(items, scope) {
  return items.find((item) => (item.scope || item.source) === scope && resourceIsSelectable(item));
}

function ensureModelTaskState() {
  const privateKey = workspacePrivateScope().key;
  const scenario = currentModelScenario()?.name;
  ["modelSource", "datasetSource", "imageSource"].forEach((key) => {
    if (!["public", privateKey].includes(state.modelTask[key])) state.modelTask[key] = "public";
  });
  const firstBySource = {
    model: modelTaskResources.models.find((item) => item.source === state.modelTask.modelSource && (!scenario || item.scene === scenario)),
    dataset: modelTaskResources.datasets.find((item) => item.source === state.modelTask.datasetSource && (!scenario || item.scene === scenario)),
    image: firstSelectableResource(imageTaskResources(), state.modelTask.imageSource),
  };
  const selectedModelValid = modelTaskResources.models.some((item) => item.id === state.modelTask.model && item.source === state.modelTask.modelSource && (!scenario || item.scene === scenario));
  const selectedDatasetValid = modelTaskResources.datasets.some((item) => item.id === state.modelTask.dataset && item.source === state.modelTask.datasetSource && (!scenario || item.scene === scenario));
  const selectedImageValid = imageTaskResources().some((item) => item.id === state.modelTask.image && item.source === state.modelTask.imageSource && resourceIsSelectable(item));
  if (!selectedModelValid) state.modelTask.model = firstBySource.model?.id || "";
  if (!selectedDatasetValid) state.modelTask.dataset = firstBySource.dataset?.id || "";
  if (!selectedImageValid) state.modelTask.image = firstBySource.image?.id || "";
  const currentImage = imageTaskResources().find((item) => item.id === state.modelTask.image);
  if (currentImage) state.modelTask.imageCategory = currentImage.category;
  const validCompute = computeTaskResources().filter((item) => ["public", privateKey].includes(item.scope));
  if (!validCompute.some((item) => item.id === state.modelTask.compute && resourceIsSelectable(item))) {
    state.modelTask.compute = validCompute.find(resourceIsSelectable)?.id || "";
  }
}

function setModelTask(key, value) {
  state.modelTask[key] = value;
  const filterMap = { modelSource: "model", datasetSource: "dataset", imageSource: "image" };
  if (filterMap[key]) resetModelTaskFilter(filterMap[key]);
  ensureModelTaskState();
  render();
}

function resetModelTaskFilter(kind) {
  const defaults = {
    model: { query: "", scene: "全部", support: "全部" },
    dataset: { query: "", type: "全部", scene: "全部" },
    compute: { query: "", source: "全部", chipType: "全部", chipVendor: "全部" },
    image: { query: "", framework: "全部", status: "全部" },
  };
  state.modelTaskFilters[kind] = { ...defaults[kind] };
}

function toggleModelTaskPicker(kind) {
  state.modelTask.openPicker = state.modelTask.openPicker === kind ? "" : kind;
  state.operatorTask.openPicker = "";
  render();
}

const navItems = [
  { key: "home", label: "首页", icon: "⌂", route: "home" },
  {
    key: "tasks",
    label: "验证任务",
    icon: "▦",
    children: [
      { key: "task-model", label: "模型验证创建", route: "task-model" },
      { key: "task-operator", label: "算子验证创建", route: "task-operator" },
      { key: "task-natural", label: "自然语言创建", route: "task-natural" },
      { key: "tasks-list", label: "任务管理", route: "tasks" },
    ],
  },
  {
    key: "reports",
    label: "验证报告",
    icon: "▤",
    route: "reports",
  },
  {
    key: "assets",
    label: "AI资产管理",
    icon: "◫",
    children: [
      { key: "assets-models", label: "模型", route: "assets-models" },
      { key: "assets-operators", label: "算子", route: "assets-operators" },
      { key: "assets-datasets", label: "数据集", route: "assets-datasets" },
      { key: "assets-images", label: "镜像", route: "assets-images" },
    ],
  },
  { key: "compute", label: "算力资源", icon: "▣", route: "compute" },
  { key: "account", label: "个人账户", icon: "◉", route: "account" },
  {
    key: "team",
    label: "团队管理",
    icon: "◎",
    requiresTeamAdmin: true,
    route: "team",
  },
];

const taskRows = [
  { id: "TASK-240611", name: "Qwen3 多卡训练验证", type: "模型验证", execution: "多 Agent", status: "排队中", compute: "NVIDIA H800 集群", createdAt: "2026-06-04 14:20" },
  { id: "TASK-240601", name: "Qwen2.5 推理吞吐验证", type: "模型验证", execution: "多 Agent", status: "运行中", compute: "Atlas 800T A2", createdAt: "2026-06-01 10:21" },
  { id: "TASK-240528", name: "FlashAttention 算子稳定性验证", type: "算子验证", execution: "标准验证流程", status: "已完成", compute: "H20 集群", createdAt: "2026-05-28 17:36" },
  { id: "TASK-240522", name: "语音识别延迟验证", type: "模型验证", execution: "标准验证流程", status: "失败", compute: "昇腾 910B", createdAt: "2026-05-22 09:12" },
];

const reports = [
  ["RPT-240601-1", "Qwen2.5 推理基础报告", "TASK-240601", "基础报告", "生成中", "Atlas 800T A2", "2026-06-01"],
  ["RPT-240528-2", "FlashAttention 算子稳定性智能分析报告", "TASK-240528", "智能分析报告", "已生成", "H20 集群", "2026-05-29"],
  ["RPT-240522-2", "语音识别延迟智能分析", "TASK-240522", "智能分析报告", "生成中", "昇腾 910B", "2026-05-23"],
];

const computeRows = [
  { id: "CMP-1001", scope: "public", name: "Atlas 800T A2 资源池", source: "平台预置", chipType: "NPU", chipVendor: "昇腾", chip: "昇腾 910B", spec: "32 卡 / 64GB HBM / RoCE", status: "可用", scenes: ["大语言", "多模态", "科学计算"] },
  { id: "CMP-1002", scope: "public", name: "NVIDIA H800 集群", source: "平台预置", chipType: "GPU", chipVendor: "NVIDIA", chip: "NVIDIA H800", spec: "8 卡 / 80GB / 高速互联", status: "可用", scenes: ["大语言", "多模态", "检索匹配"] },
  { id: "CMP-2014", scope: "team", name: "团队 H20 推理集群", source: "团队资源", chipType: "GPU", chipVendor: "NVIDIA", chip: "NVIDIA H20", spec: "16 卡 / 96GB / CUDA 12.4", status: "可用", scenes: ["大语言", "检索匹配"] },
  { id: "CMP-2020", scope: "team", name: "昆仑芯 P800 资源池", source: "团队资源", chipType: "NPU", chipVendor: "昆仑芯", chip: "昆仑芯 P800", spec: "4 卡 / 64GB / 高速互联", status: "接入中", reason: "能力校验尚未完成", scenes: ["科学计算", "音频"] },
  { id: "CMP-3019", scope: "mine", name: "实验室自有 NPU", source: "个人接入", chipType: "NPU", chipVendor: "寒武纪", chip: "MLU370", spec: "2 卡 / 48GB / 代理离线", status: "不可用", reason: "代理离线", scenes: ["音频"] },
  { id: "CMP-3022", scope: "mine", name: "我的 A800 训练节点", source: "个人接入", chipType: "GPU", chipVendor: "NVIDIA", chip: "NVIDIA A800", spec: "4 卡 / 80GB / NVLink", status: "可用", scenes: ["大语言", "科学计算"] },
  { id: "CMP-3023", scope: "mine", name: "新接入训练节点", source: "个人接入", chipType: "GPU", chipVendor: "NVIDIA", chip: "NVIDIA A800", spec: "4 卡 / 80GB / 待审", status: "待审核", reason: "等待管理员审核", scenes: ["大语言"] },
];

function route() {
  return location.hash.replace("#/", "") || (state.authed ? "home" : "login");
}

function setRoute(next) {
  location.hash = `#/${next}`;
}

function toast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 1800);
}

function statusBadge(status) {
  const color = {
    已完成: "green",
    已生成: "green",
    可调度: "green",
    可用: "green",
    运行中: "blue",
    生成中: "blue",
    维护中: "blue",
    接入中: "blue",
    上传中: "blue",
    校验中: "blue",
    待审核: "yellow",
    排队中: "yellow",
    失败: "red",
    不可用: "red",
    上传失败: "red",
    校验失败: "red",
    已下线: "",
    已停用: "",
  }[status] || "";
  return `<span class="badge ${color}">${status}</span>`;
}

function icon(text) {
  return `<span aria-hidden="true">${text}</span>`;
}

function shell(content, active = route()) {
  const workspaceName = state.workspace === "team" ? "团队空间 · 浦鉴 Lab" : "个人空间 · jing";
  return `
    <div class="app-shell">
      <header class="topbar">
        <button class="brand btn text" onclick="setRoute('home')" title="返回首页">
          <span class="logo-mark">PJ</span><span>浦鉴</span>
        </button>
        <select class="workspace-select" onchange="switchWorkspace(this.value)">
          <option value="personal" ${state.workspace === "personal" ? "selected" : ""}>个人空间 · jing</option>
          <option value="team" ${state.workspace === "team" ? "selected" : ""}>团队空间 · 浦鉴 Lab</option>
        </select>
        <div class="top-actions">
          <button class="btn" onclick="externalJump('SkillHub')">${icon("↗")}SkillHub</button>
          <button class="btn" onclick="toast('通知：1 个任务完成，2 个资源待审核')">${icon("🔔")}通知</button>
          <button class="avatar" onclick="setRoute('account')" title="个人账户">J</button>
        </div>
      </header>
      <div class="main-grid ${state.sidebarCollapsed ? "sidebar-collapsed" : ""}">
        <aside class="sidebar ${state.sidebarCollapsed ? "collapsed" : ""}">
          <button class="nav-link nav-toggle" onclick="toggleSidebar()" title="${state.sidebarCollapsed ? "展开导航" : "收起导航"}">${icon("☰")} ${state.sidebarCollapsed ? "" : "收起导航"}</button>
          <div class="nav-section">工作区</div>
          <nav class="nav-tree" aria-label="主导航">${renderNavTree(active)}</nav>
        </aside>
        <main class="content">
          <div class="muted" style="margin-bottom:10px">${workspaceName}</div>
          ${content}
        </main>
      </div>
    </div>`;
}

function canShowTeamManagement() {
  return state.workspace === "team" && ["team_owner", "team_admin"].includes(state.teamRole);
}

function isNavItemVisible(item) {
  return !item.requiresTeamAdmin || canShowTeamManagement();
}

function routeBelongsTo(routeName, item) {
  if (item.route && routeAlias(item.route) === routeAlias(routeName)) return true;
  return Boolean(item.children?.some((child) => routeBelongsTo(routeName, child)));
}

function renderNavTree(activeRoute) {
  return navItems.filter(isNavItemVisible).map((item) => renderNavItem(item, activeRoute)).join("");
}

function renderNavItem(item, activeRoute) {
  const hasChildren = Boolean(item.children?.length);
  const activeAlias = routeAlias(activeRoute);
  const isParentActive = routeBelongsTo(activeRoute, item) || parentRouteAliases(item.key).map(routeAlias).includes(activeAlias);
  const expanded = hasChildren && !state.sidebarCollapsed && (state.navExpanded[item.key] || isParentActive);
  const itemClass = `nav-link nav-parent ${isParentActive ? "active parent-active" : ""}`;
  const label = state.sidebarCollapsed ? "" : `<span class="nav-label">${item.label}</span>`;
  const arrow = hasChildren && !state.sidebarCollapsed ? `<span class="nav-arrow">${expanded ? "⌄" : "›"}</span>` : "";
  const onClick = hasChildren ? `toggleNavGroup('${item.key}')` : `setRoute('${item.route}')`;
  const children = hasChildren && expanded
    ? `<div class="nav-children">${item.children.map((child) => renderNavChild(child, activeRoute)).join("")}</div>`
    : "";
  return `<div class="nav-node"><button class="${itemClass}" onclick="${onClick}" title="${item.label}">${label}${arrow}</button>${children}</div>`;
}

function renderNavChild(child, activeRoute) {
  const active = routeAlias(child.route) === routeAlias(activeRoute);
  return `<button class="nav-link nav-child ${active ? "active" : ""}" onclick="setRoute('${child.route}')" title="${child.label}"><span class="nav-label">${child.label}</span></button>`;
}

function routeAlias(routeName) {
  const aliases = {
    ...Object.fromEntries(modelScenarios.map((item) => [`task-model-${item.key}`, "task-model"])),
    "task-detail": "tasks",
    "report-detail": "reports",
    "custom-report": "reports",
    "compute-detail": "compute",
    "compute-onboard": "compute",
    "preset-model-detail": "assets-models",
    "asset-detail": assetRoutes[state.assetType] || "assets-datasets",
    "asset-review": assetRoutes[state.assetType] || "assets-datasets",
    "dataset-detail": "assets-datasets",
    "team-info": "team",
    "team-members": "team",
    "team-invites": "team",
    "team-sharing": "team",
  };
  return aliases[routeName] || routeName;
}

function parentRouteAliases(key) {
  return {
    tasks: ["tasks", "task-detail", "task-natural", "task-model", ...modelScenarios.map((item) => `task-model-${item.key}`)],
    reports: ["reports", "report-detail", "custom-report"],
    assets: ["assets", "asset-detail", "asset-review", "dataset-detail", "preset-model-detail", "assets-datasets", "assets-models", "assets-images", "assets-operators"],
    team: ["team", "team-info", "team-members", "team-invites", "team-sharing"],
    compute: ["compute-detail", "compute-onboard"],
  }[key] || [];
}

function toggleNavGroup(key) {
  state.navExpanded[key] = !state.navExpanded[key];
  render();
}

function switchWorkspace(value) {
  state.workspace = value;
  localStorage.setItem("deepverify_workspace", value);
  normalizeAssetScope();
  ["model", "dataset", "compute", "image"].forEach(resetModelTaskFilter);
  ensureModelTaskState();
  ensureOperatorTaskState();
  if (value === "team" && !["team_owner", "team_admin", "team_member"].includes(state.teamRole)) {
    state.teamRole = "team_admin";
  }
  if (value !== "team" && route().startsWith("team")) {
    setRoute("home");
    return;
  }
  render();
  toast(value === "team" ? "已切换到团队空间" : "已切换到个人空间");
}

function switchTeamRole(value) {
  state.teamRole = value;
  localStorage.setItem("deepverify_team_role", value);
  if (!canShowTeamManagement() && route().startsWith("team")) {
    setRoute("home");
    return;
  }
  render();
  toast(value === "team_member" ? "已切换为团队成员，团队管理已隐藏" : "已切换为团队管理角色");
}

function toggleSidebar() {
  state.sidebarCollapsed = !state.sidebarCollapsed;
  render();
}

function authShell(cardContent) {
  const capabilities = [
    ["FV", "全栈验证，一次看清", "统一验证模型、算子、芯片与算力环境，任务、指标、报告全链路闭环。"],
    ["SE", "场景验证，选型有据", "按大语言、多模态、音频、科学计算、搜广推等场景对比芯片表现。"],
    ["CR", "多源算力，统一调度", "接入平台本地、云厂商和用户自有资源，统一监控、调度和结果回传。"],
    ["IR", "智能报告，直达建议", "从指标结果延伸到原因分析、优化方向和模型/芯片/算力选型建议。"],
  ];
  return `
    <section class="auth-shell">
      <header class="auth-topbar">
        <div class="brand auth-brand"><span class="logo-mark">PJ</span><span><strong>浦鉴</strong><em>DeepVerify</em></span></div>
        <button class="language-btn" type="button">简体中文</button>
      </header>
      <div class="auth-main">
        <div class="auth-copy">
          <h1>AI 软硬件全栈能力验证平台</h1>
          <p>面向芯片、算子、框架、模型、集群与应用场景的一体化验证、调度与分析平台</p>
          <div class="capability-grid">
            ${capabilities.map(([iconText, title, desc]) => `
              <article class="capability-card">
                <span class="capability-icon">${iconText}</span>
                <div>
                  <h3>${title}</h3>
                  <p>${desc}</p>
                </div>
              </article>
            `).join("")}
          </div>
          <div class="auth-metrics">
            <span><strong>10000+</strong> 模型</span>
            <span><strong>2000+</strong> 算子</span>
            <span><strong>5+</strong> 国产芯片资源</span>
            <span><strong>5</strong> 大验证场景</span>
            <span>多 Agent 执行链路</span>
          </div>
        </div>
        <div class="auth-panel">
          <div class="auth-card">${cardContent}</div>
        </div>
      </div>
    </section>`;
}

function authPage() {
  const isRegister = state.authMode === "register";
  return authShell(isRegister ? registerForm() : loginForm());
}

function loginForm() {
  return `
    <div class="auth-card-head">
      <h2>欢迎登录验证平台</h2>
    </div>
    <div class="tabs auth-tabs">
      <button class="${state.loginTab === "code" ? "active" : ""}" onclick="state.loginTab='code';render()">验证码登录</button>
      <button class="${state.loginTab === "password" ? "active" : ""}" onclick="state.loginTab='password';render()">账号密码登录</button>
    </div>
    <div class="form">
      ${
        state.loginTab === "code"
          ? `<div class="field"><label>手机号</label><div class="input-group"><select aria-label="区号"><option>+86</option><option>+852</option><option>+1</option></select><input id="login-account" value="13800000000" /></div></div><div class="field"><label>验证码</label><div class="input-group"><input id="login-secret" value="246810" /><button class="btn" type="button" onclick="toast('验证码已发送')">获取验证码</button></div></div>`
          : `<div class="field"><label>手机号 / 邮箱 / 用户名</label><input id="login-account" value="jing@deepverify.ai" /></div><div class="field"><label>密码</label><input id="login-secret" type="password" value="deepverify" /></div>`
      }
      <label class="row"><input type="checkbox" checked /> 记住登录状态 14 天</label>
      <label class="row"><input type="checkbox" checked /> 我已阅读并同意用户协议</label>
      <button class="btn primary auth-submit" onclick="mockLogin('login')">登录</button>
      <div class="row between">
        <button class="btn text" onclick="state.authMode='register';setRoute('register')">注册账号</button>
        <button class="btn text" onclick="setRoute('forgot')">找回 / 修改密码</button>
      </div>
      <div class="auth-divider"><span>其他登录方式</span></div>
      <div class="alt-login-row">
        <button class="alt-login" type="button" onclick="toast('SSO 登录待后端接入')">SSO</button>
        <button class="alt-login" type="button" onclick="state.loginTab='password';render()">邮箱</button>
        <button class="alt-login" type="button" onclick="toast('企业账号登录待后端接入')">企业账号</button>
      </div>
    </div>`;
}

function registerForm() {
  return `
    <div class="auth-card-head">
      <h2>注册验证平台账号</h2>
      <p>支持手机号注册和邮箱注册，注册成功后自动返回登录。</p>
    </div>
    <div class="tabs auth-tabs">
      <button class="${state.registerTab === "phone" ? "active" : ""}" onclick="state.registerTab='phone';render()">手机号注册</button>
      <button class="${state.registerTab === "email" ? "active" : ""}" onclick="state.registerTab='email';render()">邮箱注册</button>
    </div>
    <div class="form">
      <div class="field"><label>用户名</label><input value="jing-lab" /></div>
      <div class="field"><label>${state.registerTab === "phone" ? "手机号" : "邮箱"}</label><input value="${state.registerTab === "phone" ? "13800000000" : "jing@deepverify.ai"}" /></div>
      <div class="field"><label>验证码</label><input value="246810" /></div>
      <div class="field"><label>设置密码</label><input type="password" value="deepverify" /></div>
      <div class="field"><label>确认密码</label><input type="password" value="deepverify" /></div>
      <label class="row"><input type="checkbox" checked /> 我已阅读并同意用户协议</label>
      <button class="btn primary auth-submit" onclick="registerDone()">完成注册</button>
      <button class="btn text" onclick="state.authMode='login';setRoute('login')">返回登录</button>
    </div>`;
}

function forgotPage() {
  return authShell(`
    <div class="auth-card-head">
      <h2>找回 / 修改密码</h2>
      <p>通过手机号或邮箱验证码确认身份，完成密码重置后返回登录。</p>
    </div>
    <div class="form">
      <div class="field"><label>手机号 / 邮箱</label><input value="jing@deepverify.ai" /></div>
      <div class="field"><label>验证码</label><div class="input-group"><input value="246810" /><button class="btn" type="button" onclick="toast('验证码已发送')">获取验证码</button></div></div>
      <div class="field"><label>新密码</label><input type="password" value="deepverify" /></div>
      <div class="field"><label>确认新密码</label><input type="password" value="deepverify" /></div>
      <button class="btn primary auth-submit" onclick="state.authMode='login';setRoute('login');toast('密码已更新')">确认修改</button>
      <button class="btn text" onclick="setRoute('login')">返回登录</button>
    </div>`);
}

function mockLogin() {
  state.authed = true;
  localStorage.setItem("deepverify_authed", "1");
  setRoute("home");
  toast("登录成功，已进入个人工作空间");
}

function registerDone() {
  state.authMode = "login";
  setRoute("login");
  toast("注册成功，请登录");
}

function pageHead(title, desc, actions = "") {
  return `<div class="page-head"><div><h2>${title}</h2><div class="muted">${desc}</div></div><div class="row">${actions}</div></div>`;
}

function homePage() {
  return shell(`
    ${pageHead(
      state.workspace === "team" ? "团队空间首页" : "个人空间首页",
      "展示当前工作空间的任务、资源、验证排行与产品动态。",
      `<button class="btn primary" onclick="setRoute('task-model')">新建任务</button><button class="btn" onclick="setRoute('reports')">查看报告</button><button class="btn" onclick="setRoute('compute')">接入算力</button><button class="btn" onclick="setRoute('assets')">上传资产</button>`
    )}
    <div class="home-dashboard">
      ${rankingModule()}
      <div class="card home-space-card">
        <h3>空间信息</h3>
        <table>
          <tr><th>空间名称</th><td>${state.workspace === "team" ? "浦鉴 Lab" : "jing 的个人空间"}</td></tr>
          <tr><th>空间 ID</th><td>${state.workspace === "team" ? "WS-TEAM-1024" : "WS-PER-8891"}</td></tr>
          <tr><th>类型</th><td>${state.workspace === "team" ? "团队空间" : "个人空间"}</td></tr>
          <tr><th>描述</th><td>承载任务、资产、报告与算力资源引用。</td></tr>
        </table>
      </div>
      ${newsModule()}
      <div class="card home-task-card">
        <h3>任务概览</h3>
        <div class="home-task-stats">
          ${homeTaskStat("排队中", "6", "等待资源调度")}
          ${homeTaskStat("运行中", "12", "含 3 个 Agent 任务")}
          ${homeTaskStat("已完成", "128", "本月完成验证")}
          ${homeTaskStat("失败", "4", "需查看异常日志")}
        </div>
      </div>
    </div>
  `, "home");
}

function homeTaskStat(label, value, hint) {
  return `<div class="home-task-stat"><span class="muted">${label}</span><strong>${value}</strong><span>${hint}</span></div>`;
}

function stat(label, value, hint) {
  return `<div class="card stat"><span class="muted">${label}</span><strong>${value}</strong><span>${hint}</span></div>`;
}

function rankingModule() {
  const rows = [
    ["1", "昇腾 910B", "MindSpore", "Qwen2.5-72B", "吞吐 18.2k tok/s，能效 1.42，精度保持 99.4%"],
    ["2", "H20", "PyTorch", "DeepSeek-V3", "延迟 P95 38ms，长上下文吞吐稳定，显存利用率 91%"],
    ["3", "S3X", "PaddlePaddle", "BGE-M3", "检索召回率 92.8%，功耗较低，批处理性能稳定"],
  ];
  return `<div class="card home-ranking-card">
    <div class="row between"><h3>验证排行榜</h3><button class="btn" onclick="externalJump('社区排行榜')">查看社区排行榜</button></div>
    <div class="segmented">${scenes.map((s) => `<button class="${state.rankingScene === s ? "active" : ""}" onclick="state.rankingScene='${s}';render()">${s}</button>`).join("")}</div>
    <div class="table-wrap"><table>
      <thead><tr><th>排名</th><th>芯片名称</th><th>框架</th><th>模型</th><th>关键指标摘要</th><th>最近更新</th></tr></thead>
      <tbody>${rows.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${state.rankingScene} · ${r[4]}</td><td>2026-06-01</td></tr>`).join("")}</tbody>
    </table></div>
  </div>`;
}

function newsModule() {
  return `<div class="card home-news-card">
    <div class="row between"><h3>最新产品动态</h3><button class="btn" onclick="externalJump('产品动态')">了解更多</button></div>
    <table>
      <tr><th>标题</th><th>摘要</th><th>时间</th></tr>
      <tr><td>多 Agent 验证流程升级</td><td>新增日志回传、指标同步与智能分析输入。</td><td>2026-06-03</td></tr>
      <tr><td>自有算力接入开放</td><td>支持代理绑定、连通性检测和能力校验。</td><td>2026-05-30</td></tr>
      <tr><td>五类场景排行榜更新</td><td>大语言、多模态、音频、科学计算、搜广推。</td><td>2026-05-26</td></tr>
    </table>
  </div>`;
}

function tasksPage() {
  const filters = state.taskFilters;
  return shell(`
    ${pageHead("任务管理列表", "支持筛选、查看详情、删除、终止与重试。")}
    <div class="card">
      <div class="filters">
        <div class="input-group task-search"><input value="${filters.queryDraft}" oninput="state.taskFilters.queryDraft=this.value" onkeydown="if(event.key==='Enter'){event.preventDefault();applyTaskSearch()}" placeholder="搜索任务名称 / ID" /><button class="btn" type="button" onclick="applyTaskSearch()">搜索</button></div>
        <select onchange="setTaskFilter('status',this.value)">${filterOptions(["全部状态", "排队中", "运行中", "已完成", "失败"], filters.status)}</select>
        <select onchange="setTaskFilter('type',this.value)">${filterOptions(["全部类型", "模型验证", "算子验证"], filters.type)}</select>
        <select onchange="setTaskFilter('execution',this.value)">${filterOptions(["全部执行方式", "标准验证流程", "多 Agent"], filters.execution)}</select>
        ${state.selectedTaskIds.length ? `<button class="btn danger" type="button" onclick="confirmBulkDeleteTasks()">删除</button>` : ""}
      </div>
      ${taskTable()}
    </div>
  `, "tasks");
}

function taskTable() {
  const rows = filteredTaskRows();
  const visibleIds = rows.map((task) => task.id);
  const allVisibleSelected = visibleIds.length && visibleIds.every((id) => state.selectedTaskIds.includes(id));
  return `<div class="table-wrap"><table>
    <thead><tr><th class="check-col"><input type="checkbox" ${allVisibleSelected ? "checked" : ""} ${visibleIds.length ? "" : "disabled"} onchange="toggleAllVisibleTasks(this.checked)" /></th><th>任务 ID</th><th>任务名称</th><th>类型</th><th>执行方式</th><th>状态</th><th>目标算力</th><th>创建时间</th><th>操作</th></tr></thead>
    <tbody>${rows.map(taskRow).join("") || `<tr><td colspan="9"><div class="empty">没有匹配的任务</div></td></tr>`}</tbody>
  </table></div>`;
}

function filteredTaskRows() {
  const { query, status, type, execution } = state.taskFilters;
  const keyword = query.trim().toLowerCase();
  return taskRows
    .filter((task) => !keyword || `${task.id} ${task.name}`.toLowerCase().includes(keyword))
    .filter((task) => status === "全部状态" || task.status === status)
    .filter((task) => type === "全部类型" || task.type === type)
    .filter((task) => execution === "全部执行方式" || task.execution === execution);
}

function taskRow(task) {
  const checked = state.selectedTaskIds.includes(task.id);
  return `<tr><td class="check-col"><input type="checkbox" ${checked ? "checked" : ""} onchange="toggleTaskSelection('${task.id}',this.checked)" /></td><td>${task.id}</td><td>${task.name}</td><td>${task.type}</td><td>${task.execution}</td><td>${statusBadge(task.status)}</td><td>${task.compute}</td><td>${task.createdAt}</td><td>${taskActions(task)}</td></tr>`;
}

function taskActions(task) {
  const actions = [`<button class="btn text" onclick="openTaskDetail('${task.id}')">详情</button>`];
  if (task.status === "运行中") actions.push(`<button class="btn text" onclick="confirmBox('确认终止该任务？')">终止</button>`);
  if (task.status === "失败") actions.push(`<button class="btn text" onclick="toast('任务已重试')">重试</button>`);
  actions.push(`<button class="btn text" onclick="confirmDeleteTask('${task.id}')">删除</button>`);
  return actions.join("");
}

function openTaskDetail(id) {
  state.activeTaskId = id;
  state.lastCreatedTask = null;
  setRoute("task-detail");
}

function setTaskFilter(key, value) {
  state.taskFilters[key] = value;
  render();
}

function applyTaskSearch() {
  state.taskFilters.query = state.taskFilters.queryDraft.trim();
  render();
}

function applyTableSearch(inputId, tableId) {
  const input = document.getElementById(inputId);
  const table = document.getElementById(tableId);
  if (!input || !table) return;
  const keyword = input.value.trim().toLowerCase();
  table.querySelectorAll("tbody tr").forEach((row) => {
    row.style.display = !keyword || row.textContent.toLowerCase().includes(keyword) ? "" : "none";
  });
}

function toggleTaskSelection(id, checked) {
  state.selectedTaskIds = checked
    ? Array.from(new Set([...state.selectedTaskIds, id]))
    : state.selectedTaskIds.filter((taskId) => taskId !== id);
  render();
}

function toggleAllVisibleTasks(checked) {
  const visibleIds = filteredTaskRows().map((task) => task.id);
  state.selectedTaskIds = checked
    ? Array.from(new Set([...state.selectedTaskIds, ...visibleIds]))
    : state.selectedTaskIds.filter((id) => !visibleIds.includes(id));
  render();
}

function confirmDeleteTask(id) {
  state.pendingDeleteTaskIds = [id];
  confirmBox("确认删除该任务？删除后不可恢复。", "deleteSelectedTasks()");
}

function confirmBulkDeleteTasks() {
  if (!state.selectedTaskIds.length) return;
  state.pendingDeleteTaskIds = [...state.selectedTaskIds];
  confirmBox(`确认删除选中的 ${state.selectedTaskIds.length} 个任务？删除后不可恢复。`, "deleteSelectedTasks()");
}

function deleteSelectedTasks() {
  const ids = state.pendingDeleteTaskIds || [];
  for (const id of ids) {
    const index = taskRows.findIndex((task) => task.id === id);
    if (index >= 0) taskRows.splice(index, 1);
  }
  state.selectedTaskIds = state.selectedTaskIds.filter((id) => !ids.includes(id));
  state.pendingDeleteTaskIds = [];
  closeModal();
  toast("任务已删除");
  render();
}

function setReportFilter(key, value) {
  state.reportFilters[key] = value;
  render();
}

function applyReportSearch() {
  state.reportFilters.query = state.reportFilters.queryDraft.trim();
  render();
}

function toggleReportSelection(id, checked) {
  state.selectedReportIds = checked
    ? Array.from(new Set([...state.selectedReportIds, id]))
    : state.selectedReportIds.filter((reportId) => reportId !== id);
  render();
}

function toggleAllVisibleReports(checked) {
  const visibleIds = filteredReportRows().map((report) => report.id);
  state.selectedReportIds = checked
    ? Array.from(new Set([...state.selectedReportIds, ...visibleIds]))
    : state.selectedReportIds.filter((id) => !visibleIds.includes(id));
  render();
}

function confirmDownloadReport(id) {
  state.pendingReportActionIds = [id];
  confirmBox("确认下载该报告？", "downloadSelectedReports()");
}

function confirmBulkDownloadReports() {
  if (!state.selectedReportIds.length) return;
  state.pendingReportActionIds = [...state.selectedReportIds];
  confirmBox(`确认下载选中的 ${state.selectedReportIds.length} 份报告？`, "downloadSelectedReports()");
}

function downloadSelectedReports() {
  state.pendingReportActionIds = [];
  closeModal();
  toast("报告下载已开始");
}

function confirmDeleteReport(id) {
  state.pendingReportActionIds = [id];
  confirmBox("确认删除该报告？删除后不可恢复。", "deleteSelectedReports()");
}

function confirmBulkDeleteReports() {
  if (!state.selectedReportIds.length) return;
  state.pendingReportActionIds = [...state.selectedReportIds];
  confirmBox(`确认删除选中的 ${state.selectedReportIds.length} 份报告？删除后不可恢复。`, "deleteSelectedReports()");
}

function deleteSelectedReports() {
  const ids = state.pendingReportActionIds || [];
  state.deletedReportIds = Array.from(new Set([...state.deletedReportIds, ...ids]));
  state.selectedReportIds = state.selectedReportIds.filter((id) => !ids.includes(id));
  state.pendingReportActionIds = [];
  closeModal();
  toast("报告已删除");
  render();
}

function taskCreatePage(kind) {
  const isModel = kind === "model";
  if (isModel) return modelScenarioSelectPage();
  return operatorTaskCreatePage();
}

function operatorTaskCreatePage() {
  ensureModelTaskState();
  ensureOperatorTaskState();
  return shell(`
    <div class="task-config-page">
      <div class="page-head task-page-head">
        <div><h2>算子验证任务创建</h2><div class="muted">配置算子、算力资源、镜像与执行方式，创建后系统将自动采集验证指标并生成报告。</div></div>
      </div>
      <form class="task-config-form" onsubmit="event.preventDefault();operatorTaskCreated()">
        <section class="config-section">
          <h3>基础配置</h3>
          <div class="config-grid">
            <div class="field"><label>任务名称 <span class="required">*</span></label><input value="FlashAttention 算子稳定性验证" required /></div>
            <div class="field"><label>标签</label>${tagField("operator")}</div>
          </div>
        </section>

        <section class="config-section">
          <h3>算子配置</h3>
          ${operatorSourceSelector()}
          ${operatorPicker()}
        </section>

        <section class="config-section">
          <h3>算力与镜像配置</h3>
          ${operatorComputeSourceSelector()}
          ${operatorComputePicker()}
          ${sourceSelector("image", "镜像来源", "imageSource")}
          ${operatorImagePicker()}
        </section>

        <section class="config-section">
          <h3>执行配置</h3>
          ${operatorExecutionSelector()}
        </section>

        <div class="form-actions">
          <button class="btn primary" type="submit">创建任务</button>
          <button class="btn" type="button" onclick="toast('草稿已保存')">保存草稿</button>
          <button class="btn" type="button" onclick="setRoute('tasks')">取消</button>
        </div>
      </form>
    </div>
  `, "task-operator");
}

function currentModelScenario() {
  return scenarioRouteMap[route()] || null;
}

function modelScenarioSelectPage() {
  return shell(`
    <div class="scenario-page">
      <div class="page-head scenario-head">
        <div><h2>新建验证任务</h2><div class="muted">选择验证场景后，继续配置模型、数据集、算力资源与执行方式。</div></div>
      </div>
      <div class="scenario-grid">
        ${modelScenarios.map((scene) => `<button class="scenario-card" onclick="selectModelScenario('${scene.key}')"><span class="scenario-icon">${scene.icon}</span><strong>${scene.title}</strong></button>`).join("")}
      </div>
    </div>
  `, "task-model");
}

function selectModelScenario(key) {
  const scene = modelScenarios.find((item) => item.key === key);
  if (!scene) return;
  state.modelTask.openPicker = "";
  ["model", "dataset", "compute", "image"].forEach(resetModelTaskFilter);
  setRoute(`task-model-${key}`);
}

function ensureOperatorTaskState() {
  const privateKey = workspacePrivateScope().key;
  if (!["public", privateKey].includes(state.operatorTask.operatorSource)) {
    state.operatorTask.operatorSource = "public";
    state.operatorTask.operators = [];
  }
  if (!Object.keys(publicOperatorLibrary).includes(state.operatorTask.operatorCategory)) {
    state.operatorTask.operatorCategory = Object.keys(publicOperatorLibrary)[0];
  }
  const validIds = operatorCandidates(false).map((item) => item.id);
  state.operatorTask.operators = state.operatorTask.operators.filter((id) => validIds.includes(id));
  state.operatorTask.operators = state.operatorTask.operators.slice(0, 1);
  const privateKeyForCompute = workspacePrivateScope().key;
  if (!["public", privateKeyForCompute].includes(state.operatorTask.computeSource)) state.operatorTask.computeSource = "public";
  const selectedCompute = computeTaskResources().find((item) => item.id === state.modelTask.compute);
  if (!selectedCompute || selectedCompute.scope !== state.operatorTask.computeSource || !resourceIsSelectable(selectedCompute)) {
    state.modelTask.compute = firstSelectableResource(computeTaskResources(), state.operatorTask.computeSource)?.id || "";
  }
}

function operatorSourceSelector() {
  return `<div class="field"><label>算子来源 <span class="required">*</span></label><div class="choice-row">${sourceOptionsFor("operator").map((item) => `<button type="button" class="choice-pill ${state.operatorTask.operatorSource === item.key ? "active" : ""}" onclick="setOperatorTask('operatorSource','${item.key}')">${item.label}</button>`).join("")}</div></div>`;
}

function operatorPicker() {
  const selected = selectedOperators();
  return `<div class="field resource-picker"><label>算子 <span class="required">*</span></label>
    <div class="select-anchor">
      <div role="button" tabindex="0" class="cloud-select-trigger ${state.operatorTask.openPicker === "operator" ? "open" : ""}" onclick="toggleOperatorPicker()" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleOperatorPicker()}">
        <span>${operatorSelectDisplay(selected)}</span><strong>⌄</strong>
      </div>
      ${state.operatorTask.openPicker === "operator" ? operatorSelectPanel() : ""}
    </div>
  </div>`;
}

function operatorSelectDisplay(items) {
  if (!items.length) return "请选择算子";
  return items[0].name;
}

function operatorChips(items) {
  return items.slice(0, 3).map((item) => `<span class="operator-chip">${item.name}<button type="button" class="operator-chip-remove" onclick="event.stopPropagation();removeOperatorSelection('${item.id}')" title="删除${item.name}">×</button></span>`).join("") + (items.length > 3 ? `<span class="tag-chip">+${items.length - 3}</span>` : "");
}

function operatorSelectPanel() {
  return state.operatorTask.operatorSource === "public" ? publicOperatorCascaderPanel() : privateOperatorSearchPanel();
}

function publicOperatorCascaderPanel() {
  const categories = Object.keys(publicOperatorLibrary);
  const query = state.operatorTask.operatorQuery.trim().toLowerCase();
  const rows = operatorCandidates(false);
  const matchedCategories = publicOperatorMatchedCategories(query);
  const activeCategory = query && !matchedCategories.includes(state.operatorTask.operatorCategory) ? matchedCategories[0] || state.operatorTask.operatorCategory : state.operatorTask.operatorCategory;
  const visibleCount = rows.filter((item) => {
    const text = item.name.toLowerCase();
    return item.category === activeCategory && (!query || text.includes(query));
  }).length;
  return `<div class="cloud-select-panel operator-cascader">
    <div class="select-search-row"><input data-dropdown-search="operator" value="${state.operatorTask.operatorQuery}" placeholder="搜索算子名称" /><button type="button" title="搜索" onclick="applyDropdownSearch('operator')">⌕</button><button type="button" onclick="clearDropdownSearch('operator')" title="刷新">↻</button></div>
    <div class="cascader-body">
      <div class="cascader-left">${categories.map((cat) => publicOperatorCategoryButton(cat, query, activeCategory)).join("")}</div>
      <div class="cascader-right">${rows.map((item) => publicOperatorOption(item, item.category, activeCategory)).join("")}<div class="empty dropdown-empty" style="${visibleCount ? "display:none" : ""}">暂无匹配的算子</div></div>
    </div>
  </div>`;
}

function publicOperatorMatchedCategories(query) {
  if (!query) return Object.keys(publicOperatorLibrary);
  return Object.entries(publicOperatorLibrary)
    .filter(([, items]) => items.some((item) => item.name.toLowerCase().includes(query)))
    .map(([category]) => category);
}

function publicOperatorCategoryButton(category, query, activeCategory) {
  const visible = !query || publicOperatorLibrary[category].some((item) => item.name.toLowerCase().includes(query));
  return `<button type="button" ${visible ? "" : `style="display:none"`} class="${activeCategory === category ? "active" : ""}" onclick="setOperatorTask('operatorCategory','${category}')">${category}<span>›</span></button>`;
}

function publicOperatorOption(item, category, activeCategory) {
  const selected = state.operatorTask.operators.includes(item.id);
  const text = item.name;
  const query = state.operatorTask.operatorQuery.trim().toLowerCase();
  const visible = category !== activeCategory || (query && !text.toLowerCase().includes(query)) ? `style="display:none"` : "";
  return `<button type="button" data-search-row data-category="${category}" data-search-text="${text}" ${visible} class="image-option ${selected ? "selected" : ""}" onclick="chooseOperatorSelection('${item.id}')"><span>${item.name}</span><strong>${selected ? "✓" : ""}</strong></button>`;
}

function privateOperatorSearchPanel() {
  const rows = operatorCandidates(false);
  const query = state.operatorTask.operatorQuery.trim().toLowerCase();
  const visibleCount = rows.filter((item) => `${item.name} ${item.category} ${item.framework} ${item.status} ${item.reason || ""}`.toLowerCase().includes(query)).length;
  return `<div class="cloud-select-panel operator-panel">
    <div class="select-search-row"><input data-dropdown-search="operator" value="${state.operatorTask.operatorQuery}" placeholder="搜索算子名称" /><button type="button" title="搜索" onclick="applyDropdownSearch('operator')">⌕</button><button type="button" onclick="clearDropdownSearch('operator')" title="刷新">↻</button></div>
    <div class="select-table">
      <div class="select-table-head operator-table-head"><span>算子名称</span><span>分类</span><span>框架</span><span>状态</span></div>
      ${rows.map(privateOperatorOption).join("")}<div class="empty dropdown-empty" style="${visibleCount ? "display:none" : ""}">暂无匹配的算子</div>
    </div>
  </div>`;
}

function privateOperatorOption(item) {
  const selected = state.operatorTask.operators.includes(item.id);
  const disabled = item.status !== "可用";
  const text = `${item.name} ${item.category} ${item.framework} ${item.status} ${item.reason || ""}`;
  const query = state.operatorTask.operatorQuery.trim().toLowerCase();
  const visible = query && !text.toLowerCase().includes(query) ? `style="display:none"` : "";
  const reason = disabled ? item.reason || "依赖版本不匹配" : "";
  return `<button type="button" data-search-row data-search-text="${text}" ${visible} title="${reason ? "当前算子依赖环境与所选镜像或算力资源不一致，请更换镜像/算力或重新校验算子。" : ""}" class="select-table-row operator-table-row ${selected ? "selected" : ""} ${disabled ? "disabled" : ""}" ${disabled ? "" : `onclick="chooseOperatorSelection('${item.id}')"`}>
    <span>${item.name}${disabled ? `<em>${reason}</em>` : ""}</span><span>${item.category}</span><span>${item.framework}</span><span>${disabled ? "不可用" : item.status}${selected ? `<strong> ✓</strong>` : ""}</span>
  </button>`;
}

function operatorCandidates(applyQuery = true) {
  const query = applyQuery ? state.operatorTask.operatorQuery.trim().toLowerCase() : "";
  if (state.operatorTask.operatorSource === "public") {
    return Object.entries(publicOperatorLibrary)
      .flatMap(([category, items]) => items.map((item) => ({ ...item, category, source: "public", status: "可用" })))
      .filter((item) => !query || item.name.toLowerCase().includes(query));
  }
  return privateOperatorResources
    .filter((item) => item.source === state.operatorTask.operatorSource)
    .filter((item) => !query || `${item.name} ${item.category} ${item.framework} ${item.status} ${item.reason || ""}`.toLowerCase().includes(query));
}

function selectedOperators() {
  const all = operatorCandidates(false).concat(Object.entries(publicOperatorLibrary).flatMap(([category, items]) => items.map((item) => ({ ...item, category, source: "public", status: "可用" }))));
  return state.operatorTask.operators.map((id) => all.find((item) => item.id === id)).filter(Boolean);
}

function setOperatorTask(key, value) {
  state.operatorTask[key] = value;
  if (key === "operatorSource") {
    state.operatorTask.operatorQuery = "";
    state.operatorTask.operators = [];
    state.operatorTask.openPicker = "operator";
  }
  ensureOperatorTaskState();
  render();
}

function toggleOperatorPicker() {
  state.operatorTask.openPicker = state.operatorTask.openPicker === "operator" ? "" : "operator";
  state.modelTask.openPicker = "";
  render();
}

function chooseOperatorSelection(id) {
  state.operatorTask.operators = [id];
  state.operatorTask.openPicker = "";
  render();
}

function removeOperatorSelection(id) {
  state.operatorTask.operators = state.operatorTask.operators.filter((item) => item !== id);
  render();
}

function operatorComputeSourceSelector() {
  const privateScope = workspacePrivateScope();
  const options = [
    { key: "public", label: "预置资源" },
    { key: privateScope.key, label: privateScope.key === "team" ? "团队资源" : "我的资源" },
  ];
  return `<div class="field"><label>算力资源来源 <span class="required">*</span></label><div class="choice-row">${options.map((item) => `<button type="button" class="choice-pill ${state.operatorTask.computeSource === item.key ? "active" : ""}" onclick="setOperatorComputeSource('${item.key}')">${item.label}</button>`).join("")}</div></div>`;
}

function operatorComputePicker() {
  return `<div class="field resource-picker"><label>算力资源 <span class="required">*</span></label>
    <div class="select-anchor">
      <div role="button" tabindex="0" class="cloud-select-trigger ${state.operatorTask.openPicker === "operatorCompute" ? "open" : ""}" onclick="toggleOperatorComputePicker()" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleOperatorComputePicker()}">
        <span>${operatorComputeDisplay()}</span><strong>⌄</strong>
      </div>
      ${state.operatorTask.openPicker === "operatorCompute" ? operatorComputePanel() : ""}
    </div>
  </div>`;
}

function operatorComputeDisplay() {
  const item = computeTaskResources().find((row) => row.id === state.modelTask.compute);
  return item ? `${item.name} / ${item.chip} / ${item.spec}` : "请选择算力资源";
}

function operatorComputePanel() {
  return operatorPrivateComputePanel();
}

function operatorPrivateComputePanel() {
  const rows = computeTaskResources().filter((item) => item.scope === state.operatorTask.computeSource && (state.operatorTask.computeVendor === "全部厂商" || item.chipVendor === state.operatorTask.computeVendor));
  return `<div class="cloud-select-panel compute-panel">
    <div class="select-search-row"><input data-dropdown-search="compute" value="${state.modelTaskFilters.compute.query}" placeholder="搜索资源名称、芯片名称或规格" /><button type="button" onclick="applyDropdownSearch('compute')">⌕</button><button type="button" onclick="clearDropdownSearch('compute')">↻</button></div>
    <div class="select-filter-row compute-filter-row"><select onchange="setOperatorComputeVendor(this.value)">${filterOptions(operatorPrivateComputeVendorOptions(), state.operatorTask.computeVendor)}</select></div>
    <div class="select-table">
      <div class="select-table-head compute-table-head"><span>资源名称</span><span>规格</span><span>芯片</span></div>
      ${rows.map(operatorPrivateComputeOption).join("")}<div class="empty dropdown-empty" style="${rows.length ? "display:none" : ""}">暂无匹配的资源</div>
    </div>
  </div>`;
}

function operatorPrivateComputeOption(item) {
  const selected = state.modelTask.compute === item.id;
  const disabled = item.status !== "可用";
  const text = `${item.name} ${item.chip} ${item.spec} ${item.chipVendor}`;
  const query = state.modelTaskFilters.compute.query.trim().toLowerCase();
  const visible = query && !text.toLowerCase().includes(query) ? `style="display:none"` : "";
  return `<button type="button" data-search-row data-search-text="${text}" ${visible} class="select-table-row compute-table-row ${selected ? "selected" : ""} ${disabled ? "disabled" : ""}" ${disabled ? "" : `onclick="chooseOperatorCompute('${item.id}')"`}><span>${item.name}${disabled ? `<em>${item.reason || item.status}</em>` : ""}</span><span>${item.spec}</span><span>${item.chip}${selected ? `<strong> ✓</strong>` : ""}</span></button>`;
}

function operatorPrivateComputeVendorOptions() {
  const vendors = computeTaskResources().filter((item) => item.scope === state.operatorTask.computeSource).map((item) => item.chipVendor || "其他");
  return ["全部厂商", ...Array.from(new Set(vendors))];
}

function operatorImagePicker() {
  const item = selectedResource("image");
  return `<div class="field resource-picker"><label>镜像 <span class="required">*</span></label>
    <div class="select-anchor">
      <div role="button" tabindex="0" class="cloud-select-trigger ${state.operatorTask.openPicker === "operatorImage" ? "open" : ""}" onclick="toggleOperatorImagePicker()" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleOperatorImagePicker()}">
        <span>${operatorImageDisplay(item)}</span><strong>⌄</strong>
      </div>
      ${state.operatorTask.openPicker === "operatorImage" ? operatorImagePanel() : ""}
    </div>
  </div>`;
}

function operatorImageDisplay(item) {
  if (!item) return "请选择镜像";
  const vendor = imageVendorFor(item);
  return `${item.name} / ${aiFrameworkFor(item)} / ${vendor} / ${item.version}`;
}

function operatorImagePanel() {
  const rows = operatorImageRows(false);
  return `<div class="cloud-select-panel operator-image-panel">
    <div class="select-search-row"><input data-dropdown-search="operatorImage" value="${state.modelTaskFilters.image.query}" placeholder="搜索镜像名称" /><button type="button" onclick="applyDropdownSearch('operatorImage')">⌕</button><button type="button" onclick="clearDropdownSearch('operatorImage')">↻</button></div>
    <div class="select-filter-row compute-filter-row"><select onchange="setOperatorImageFilter('imageVendor',this.value)">${filterOptions(["全部厂商", "NVIDIA", "昇腾", "昆仑芯", "寒武纪", "CPU"], state.operatorTask.imageVendor)}</select><select onchange="setOperatorImageFilter('imageFramework',this.value)">${filterOptions(["全部框架", "PyTorch", "TensorFlow", "MindSpore", "PaddlePaddle"], state.operatorTask.imageFramework)}</select></div>
    <div class="select-table">
      <div class="select-table-head operator-image-head"><span>镜像名称</span><span>版本</span><span>芯片厂商</span><span>AI 框架</span><span>运行环境</span><span>状态</span></div>
      ${rows.map(operatorImageOption).join("")}<div class="empty dropdown-empty" style="${rows.length ? "display:none" : ""}">暂无匹配的镜像</div>
    </div>
  </div>`;
}

function operatorImageRows(applyQuery = true) {
  const query = applyQuery ? state.modelTaskFilters.image.query.trim().toLowerCase() : "";
  return imageTaskResources()
    .filter((item) => item.source === state.modelTask.imageSource)
    .filter((item) => state.operatorTask.imageVendor === "全部厂商" || imageVendorFor(item) === state.operatorTask.imageVendor)
    .filter((item) => state.operatorTask.imageFramework === "全部框架" || aiFrameworkFor(item) === state.operatorTask.imageFramework)
    .filter((item) => !query || `${item.name} ${item.framework} ${item.version} ${item.env}`.toLowerCase().includes(query));
}

function imageVendorFor(item) {
  if (item.chipVendor) return item.chipVendor;
  const text = `${item.name} ${item.env} ${item.version}`.toLowerCase();
  if (/cann|ascend|mindspore|昇腾/.test(text)) return "昇腾";
  if (/kunlun|p800|昆仑/.test(text)) return "昆仑芯";
  if (/mlu|寒武/.test(text)) return "寒武纪";
  if (/cpu/.test(text)) return "CPU";
  return "NVIDIA";
}

function aiFrameworkFor(item) {
  if (["PyTorch", "TensorFlow", "MindSpore", "PaddlePaddle"].includes(item.framework)) return item.framework;
  const text = `${item.name} ${item.framework} ${item.env}`.toLowerCase();
  if (/tensorflow/.test(text)) return "TensorFlow";
  if (/mindspore|cann|ascend/.test(text)) return "MindSpore";
  if (/paddle/.test(text)) return "PaddlePaddle";
  return "PyTorch";
}

function operatorImageOption(item) {
  const selected = state.modelTask.image === item.id;
  const disabled = item.status !== "可用";
  const vendor = imageVendorFor(item);
  const aiFramework = aiFrameworkFor(item);
  const text = `${item.name} ${item.version} ${vendor} ${aiFramework} ${item.env} ${item.status}`;
  const query = state.modelTaskFilters.image.query.trim().toLowerCase();
  const visible = query && !text.toLowerCase().includes(query) ? `style="display:none"` : "";
  return `<button type="button" data-search-row data-search-text="${text}" ${visible} class="select-table-row operator-image-row ${selected ? "selected" : ""} ${disabled ? "disabled" : ""}" ${disabled ? "" : `onclick="chooseOperatorImage('${item.id}')"`}><span>${item.name}</span><span>${item.version}</span><span>${vendor}</span><span>${aiFramework}</span><span>${item.env}</span><span>${item.status}${disabled ? `<em>${item.reason || item.status}</em>` : ""}${selected ? `<strong> ✓</strong>` : ""}</span></button>`;
}

function setOperatorComputeSource(source) {
  state.operatorTask.computeSource = source;
  state.operatorTask.computeVendor = "全部厂商";
  state.operatorTask.openPicker = "operatorCompute";
  state.modelTask.openPicker = "";
  const first = firstSelectableResource(computeTaskResources(), source);
  state.modelTask.compute = first?.id || "";
  render();
}

function toggleOperatorComputePicker() {
  state.operatorTask.openPicker = state.operatorTask.openPicker === "operatorCompute" ? "" : "operatorCompute";
  state.modelTask.openPicker = "";
  render();
}

function setOperatorComputeVendor(vendor) {
  state.operatorTask.computeVendor = vendor;
  state.operatorTask.openPicker = "operatorCompute";
  state.modelTask.openPicker = "";
  render();
}

function chooseOperatorCompute(id) {
  state.modelTask.compute = id;
  state.operatorTask.openPicker = "";
  render();
}

function toggleOperatorImagePicker() {
  state.operatorTask.openPicker = state.operatorTask.openPicker === "operatorImage" ? "" : "operatorImage";
  state.modelTask.openPicker = "";
  render();
}

function setOperatorImageFilter(key, value) {
  state.operatorTask[key] = value;
  state.operatorTask.openPicker = "operatorImage";
  state.modelTask.openPicker = "";
  render();
}

function chooseOperatorImage(id) {
  state.modelTask.image = id;
  state.operatorTask.openPicker = "";
  render();
}

function operatorExecutionSelector() {
  return `<div class="execution-grid">
    <button type="button" class="execution-card ${state.operatorTask.execution === "standard" ? "selected" : ""}" onclick="setOperatorTask('execution','standard')">
      <strong>标准验证流程</strong>
      <span>使用平台预置验证流程执行，适合标准算子验证。</span>
    </button>
    <button type="button" class="execution-card ${state.operatorTask.execution === "agent" ? "selected" : ""}" onclick="setOperatorTask('execution','agent')">
      <strong>多 Agent 验证系统</strong>
      <span>调用多 Agent 链路完成复杂环境验证与结果分析。</span>
    </button>
  </div>`;
}

function modelTaskCreatePage() {
  ensureModelTaskState();
  ensureOperatorTaskState();
  const scenario = currentModelScenario() || modelScenarios[0];
  return shell(`
    <div class="task-config-page">
      <div class="page-head task-page-head">
        <div><div class="breadcrumb">验证任务 / 模型验证创建 / ${scenario.name}</div><h2>${scenario.title}任务创建</h2><div class="muted">配置模型、数据集、算力资源与执行方式，创建后系统将自动采集验证指标并生成报告。</div></div>
        <button class="btn" onclick="setRoute('task-model')">切换场景</button>
      </div>
      <form class="task-config-form" onsubmit="event.preventDefault();taskCreated()">
        <section class="config-section">
          <h3>基础配置</h3>
          <div class="config-grid">
            <div class="field"><label>任务名称 <span class="required">*</span></label><input value="Qwen2.5 推理吞吐验证" required /></div>
            <div class="field"><label>标签</label>${tagField()}</div>
          </div>
        </section>

        <section class="config-section">
          <h3>验证对象配置</h3>
          <div class="field"><label>验证目标 <span class="required">*</span></label>${targetSelector()}</div>
          ${sourceSelector("model", "模型来源", "modelSource")}
          ${resourcePicker("model")}
        </section>

        <section class="config-section">
          <h3>数据集配置</h3>
          ${sourceSelector("dataset", "数据集来源", "datasetSource")}
          ${resourcePicker("dataset")}
        </section>

        <section class="config-section">
          <h3>算力与镜像配置</h3>
          ${operatorComputeSourceSelector()}
          ${operatorComputePicker()}
          ${sourceSelector("image", "镜像来源", "imageSource")}
          ${operatorImagePicker()}
        </section>

        <section class="config-section">
          <h3>执行配置</h3>
          ${executionSelector()}
        </section>

        <div class="form-actions">
          <button class="btn primary" type="submit">创建任务</button>
          <button class="btn" type="button" onclick="toast('草稿已保存')">保存草稿</button>
          <button class="btn" type="button" onclick="setRoute('tasks')">取消</button>
        </div>
      </form>
    </div>
  `, "task-model");
}

function targetSelector() {
  return `<div class="choice-row">
    <button type="button" class="choice-pill ${state.modelTask.target === "inference" ? "active" : ""}" onclick="setModelTask('target','inference')">推理验证</button>
    <button type="button" class="choice-pill ${state.modelTask.target === "training" ? "active" : ""}" onclick="setModelTask('target','training')">训练验证</button>
  </div>`;
}

function sourceSelector(kind, label, stateKey) {
  return `<div class="field"><label>${label} <span class="required">*</span></label><div class="choice-row">${sourceOptionsFor(kind).map((item) => `<button type="button" class="choice-pill ${state.modelTask[stateKey] === item.key ? "active" : ""}" onclick="setModelTask('${stateKey}','${item.key}')">${item.label}</button>`).join("")}</div></div>`;
}

function resourcePicker(kind) {
  const labels = { model: "模型", dataset: "数据集", compute: "算力资源", image: "镜像" };
  const selected = selectedResource(kind);
  return `<div class="field resource-picker"><label>${labels[kind]} <span class="required">*</span></label>
    ${kind === "compute" ? computeNodeSelector() : ""}
    <div class="select-anchor">
      <div role="button" tabindex="0" class="cloud-select-trigger ${state.modelTask.openPicker === kind ? "open" : ""}" onclick="toggleModelTaskPicker('${kind}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleModelTaskPicker('${kind}')}">
        <span>${selectDisplay(kind, selected)}</span><strong>⌄</strong>
      </div>
      ${state.modelTask.openPicker === kind ? selectPanel(kind) : ""}
    </div>
  </div>`;
}

function selectedResource(kind) {
  const map = {
    model: [modelTaskResources.models, state.modelTask.model],
    dataset: [modelTaskResources.datasets, state.modelTask.dataset],
    image: [imageTaskResources(), state.modelTask.image],
    compute: [computeTaskResources(), state.modelTask.compute],
  }[kind];
  return map[0].find((item) => item.id === map[1]);
}

function selectedSummary(kind, item) {
  const desc = {
    model: `${sourceLabel(item.source, "model")} · ${item.scene} · ${item.support} · ${item.version}`,
    dataset: `${sourceLabel(item.source, "dataset")} · ${item.type} · ${item.scene} · ${item.size}`,
    image: `${sourceLabel(item.source, "image")} · ${item.framework} · ${item.runtime || item.env} · ${item.version}`,
    compute: `${item.source} · ${item.chipType} / ${item.chip} · ${item.spec}`,
  }[kind];
  return `<div class="selected-summary"><span>当前选择</span><strong>${item.name}</strong><em>${desc}</em></div>`;
}

function selectDisplay(kind, item) {
  if (!item) return { model: "请选择模型", dataset: "请选择数据集", compute: "请选择算力资源", image: "请选择镜像" }[kind];
  if (kind === "compute") {
    const mode = state.modelTask.nodeMode === "multi" ? "多卡" : "单卡";
    const specCore = item.spec.replace(/^\d+卡\s*/, "");
    const cardCount = state.modelTask.cardCount === "custom" ? state.modelTask.customCardCount || "16" : state.modelTask.cardCount;
    const spec = state.modelTask.nodeMode === "multi" ? `${cardCount}卡 ${specCore}` : `单卡 ${specCore}`;
    return `${item.name} / ${item.chip} / ${spec} / ${mode}`;
  }
  if (kind === "image") return `${item.category} / ${item.name}${item.recommended ? " 推荐" : ""}`;
  return item.name;
}

function selectPanel(kind) {
  if (kind === "model") return searchableSimplePanel("model", "请输入模型名称");
  if (kind === "dataset") return searchableSimplePanel("dataset", "请输入数据集名称");
  if (kind === "compute") return computeSelectPanel();
  return imageCascaderPanel();
}

function searchableSimplePanel(kind, placeholder) {
  const filter = state.modelTaskFilters[kind];
  const rows = filteredResources(kind, false);
  const emptyText = kind === "model" ? "暂无匹配的模型" : "暂无匹配的数据集";
  return `<div class="cloud-select-panel">
    <div class="select-search-row"><input data-dropdown-search="${kind}" value="${filter.query}" placeholder="${placeholder}" /><button type="button" title="搜索" onclick="applyDropdownSearch('${kind}')">⌕</button><button type="button" onclick="clearDropdownSearch('${kind}')" title="刷新">↻</button></div>
    <div class="select-list simple-list">${rows.map((item) => simpleOption(kind, item)).join("")}<div class="empty dropdown-empty" style="${rows.length ? "display:none" : ""}">${emptyText}</div></div>
  </div>`;
}

function simpleOption(kind, item) {
  const stateKey = { model: "model", dataset: "dataset" }[kind];
  const selected = state.modelTask[stateKey] === item.id;
  const query = state.modelTaskFilters[kind].query.trim().toLowerCase();
  const visible = query && !item.name.toLowerCase().includes(query) ? `style="display:none"` : "";
  return `<button type="button" data-search-row data-search-text="${item.name}" ${visible} class="select-option ${selected ? "selected" : ""}" onclick="chooseModelTaskResource('${stateKey}','${item.id}')"><span>${item.name}</span><em></em><strong>${selected ? "✓" : ""}</strong></button>`;
}

function computeNodeSelector() {
  return `<div class="node-config-row">
    <div class="choice-row"><button type="button" class="choice-pill ${state.modelTask.nodeMode === "single" ? "active" : ""}" onclick="setModelTask('nodeMode','single')">单卡</button><button type="button" class="choice-pill ${state.modelTask.nodeMode === "multi" ? "active" : ""}" onclick="setModelTask('nodeMode','multi')">多卡</button></div>
    ${state.modelTask.nodeMode === "multi" ? `<div class="choice-row"><button type="button" class="choice-pill ${state.modelTask.cardCount === "2" ? "active" : ""}" onclick="setModelTask('cardCount','2')">2卡</button><button type="button" class="choice-pill ${state.modelTask.cardCount === "4" ? "active" : ""}" onclick="setModelTask('cardCount','4')">4卡</button><button type="button" class="choice-pill ${state.modelTask.cardCount === "8" ? "active" : ""}" onclick="setModelTask('cardCount','8')">8卡</button><button type="button" class="choice-pill ${state.modelTask.cardCount === "custom" ? "active" : ""}" onclick="setModelTask('cardCount','custom')">自定义</button>${state.modelTask.cardCount === "custom" ? `<input class="card-count-input" type="number" min="1" max="128" value="${state.modelTask.customCardCount || 16}" onchange="setModelTask('customCardCount', this.value)" />` : ""}</div>` : ""}
  </div>`;
}

function computeSelectPanel() {
  const filter = state.modelTaskFilters.compute;
  const rows = filteredResources("compute", false);
  return `<div class="cloud-select-panel compute-panel">
    <div class="select-search-row"><input data-dropdown-search="compute" value="${filter.query}" placeholder="搜索资源名称、芯片名称或规格" /><button type="button" title="搜索" onclick="applyDropdownSearch('compute')">⌕</button><button type="button" onclick="clearDropdownSearch('compute')" title="刷新">↻</button></div>
    <div class="select-filter-row compute-filter-row"><select onchange="setModelTaskFilter('compute','source',this.value)">${filterOptions(computeSourceFilters(), filter.source)}</select><select onchange="setModelTaskFilter('compute','chipType',this.value)">${filterOptions(["全部", "GPU", "NPU", "CPU"], filter.chipType)}</select><select onchange="setModelTaskFilter('compute','chipVendor',this.value)">${filterOptions(["全部", "NVIDIA", "昆仑芯", "寒武纪", "其他"], filter.chipVendor)}</select></div>
    <div class="select-table">
      <div class="select-table-head compute-table-head"><span>资源名称</span><span>规格</span><span>芯片</span></div>
      ${rows.map(computeOption).join("")}<div class="empty dropdown-empty" style="${rows.length ? "display:none" : ""}">暂无匹配的资源</div>
    </div>
  </div>`;
}

function computeOption(item) {
  const selected = state.modelTask.compute === item.id;
  const disabled = item.status !== "可用";
  const text = `${item.name} ${item.chip} ${item.spec} ${item.chipVendor}`;
  const query = state.modelTaskFilters.compute.query.trim().toLowerCase();
  const visible = query && !text.toLowerCase().includes(query) ? `style="display:none"` : "";
  return `<button type="button" data-search-row data-search-text="${text}" ${visible} class="select-table-row compute-table-row ${selected ? "selected" : ""} ${disabled ? "disabled" : ""}" ${disabled ? "" : `onclick="chooseModelTaskResource('compute','${item.id}')"`}><span>${item.name}${disabled ? `<em>${item.reason || item.status}</em>` : ""}</span><span>${item.spec}</span><span>${item.chip}${selected ? `<strong> ✓</strong>` : ""}</span></button>`;
}

function imageCascaderPanel() {
  const filter = state.modelTaskFilters.image;
  const categories = [...new Set(filteredResources("image", false).map((item) => item.category))];
  const rows = filteredResources("image", false);
  return `<div class="cloud-select-panel image-cascader">
    <div class="select-search-row"><input data-dropdown-search="image" value="${filter.query}" placeholder="搜索镜像名称、框架或版本" /><button type="button" title="搜索" onclick="applyDropdownSearch('image')">⌕</button><button type="button" onclick="clearDropdownSearch('image')" title="刷新">↻</button></div>
    <div class="cascader-body">
      <div class="cascader-left">${categories.map((cat) => `<button type="button" class="${state.modelTask.imageCategory === cat ? "active" : ""}" onclick="setImageCategory('${cat}')">${cat}<span>›</span></button>`).join("")}</div>
      <div class="cascader-right">${rows.map(imageOption).join("")}<div class="empty dropdown-empty" style="${rows.length ? "display:none" : ""}">暂无匹配的镜像</div></div>
    </div>
  </div>`;
}

function imageOption(item) {
  const selected = state.modelTask.image === item.id;
  const text = `${item.name} ${item.framework} ${item.version} ${item.env}`;
  const query = state.modelTaskFilters.image.query.trim().toLowerCase();
  const visible = (!query && item.category !== state.modelTask.imageCategory) || (query && !text.toLowerCase().includes(query)) ? `style="display:none"` : "";
  const disabled = !resourceIsSelectable(item);
  return `<button type="button" data-search-row data-category="${item.category}" data-search-text="${text}" ${visible} class="image-option ${selected ? "selected" : ""} ${disabled ? "disabled" : ""}" ${disabled ? "" : `onclick="chooseModelTaskResource('image','${item.id}')"`}><span>${item.name}${disabled ? `<small>${item.reason || item.status}</small>` : ""}</span><em>ⓘ</em>${item.recommended ? `<b>推荐</b>` : ""}<strong>${selected ? "✓" : ""}</strong></button>`;
}

function filterOptions(options, selected) {
  return options.map((item) => `<option ${item === selected ? "selected" : ""}>${item}</option>`).join("");
}

function computeSourceFilters() {
  return isTeamWorkspace() ? ["全部", "预置算力", "团队资源"] : ["全部", "预置算力", "用户自有"];
}

function setModelTaskFilter(kind, key, value) {
  state.modelTaskFilters[kind][key] = value;
  render();
}

function resetPickerFilter(kind) {
  resetModelTaskFilter(kind);
  render();
}

function chooseModelTaskResource(key, id) {
  state.modelTask[key] = id;
  if (key === "image") {
    const item = imageTaskResources().find((image) => image.id === id);
    if (item) state.modelTask.imageCategory = item.category;
  }
  state.modelTask.openPicker = "";
  ensureModelTaskState();
  render();
}

function setImageCategory(category) {
  state.modelTask.imageCategory = category;
  render();
}

function filteredResources(kind, applyQuery = true) {
  const filter = state.modelTaskFilters[kind];
  const query = applyQuery ? filter.query.trim().toLowerCase() : "";
  const scenario = currentModelScenario()?.name;
  if (kind === "model") {
    return modelTaskResources.models
      .filter((item) => item.source === state.modelTask.modelSource)
      .filter((item) => !scenario || item.scene === scenario)
      .filter((item) => !query || item.name.toLowerCase().includes(query))
      .filter((item) => filter.scene === "全部" || item.scene === filter.scene)
      .filter((item) => filter.support === "全部" || item.support.includes(filter.support))
      .sort(sortModelTaskResource);
  }
  if (kind === "dataset") {
    return modelTaskResources.datasets
      .filter((item) => item.source === state.modelTask.datasetSource)
      .filter((item) => !scenario || item.scene === scenario)
      .filter((item) => !query || item.name.toLowerCase().includes(query))
      .filter((item) => filter.type === "全部" || item.type.includes(filter.type))
      .filter((item) => filter.scene === "全部" || item.scene === filter.scene);
  }
  if (kind === "image") {
    return imageTaskResources()
      .filter((item) => item.source === state.modelTask.imageSource)
      .filter((item) => !query || `${item.name} ${item.framework} ${item.version}`.toLowerCase().includes(query))
      .filter((item) => filter.status === "全部" || item.status === filter.status);
  }
  const privateKey = workspacePrivateScope().key;
  return computeTaskResources()
    .filter((item) => item.scope === "public" || item.scope === privateKey)
    .filter((item) => !query || `${item.name} ${item.chip} ${item.chipVendor}`.toLowerCase().includes(query))
    .filter((item) => filter.source === "全部" || item.source === filter.source)
    .filter((item) => filter.chipType === "全部" || item.chipType === filter.chipType)
    .filter((item) => filter.chipVendor === "全部" || item.chipVendor === filter.chipVendor)
    .sort((a, b) => Number(Boolean(scenario && b.scenes?.includes(scenario))) - Number(Boolean(scenario && a.scenes?.includes(scenario))));
}

function liveDropdownSearch(kind, value) {
  if (kind === "operator") {
    state.operatorTask.operatorQuery = value;
  } else if (kind === "operatorImage") {
    state.modelTaskFilters.image.query = value;
  } else if (kind === "operatorSpec") {
    // Public operator specs use local DOM filtering only.
  } else {
    state.modelTaskFilters[kind].query = value;
  }
  filterDropdownRows(kind, value);
}

function clearDropdownSearch(kind) {
  const panel = document.querySelector(".cloud-select-panel");
  const input = panel?.querySelector(".select-search-row input");
  if (kind === "operator") {
    state.operatorTask.operatorQuery = "";
  } else if (kind === "operatorImage") {
    state.modelTaskFilters.image.query = "";
  } else if (kind === "operatorSpec") {
    // Public operator specs use local DOM filtering only.
  } else {
    state.modelTaskFilters[kind].query = "";
  }
  if (input) input.value = "";
  filterDropdownRows(kind, "");
}

function applyDropdownSearch(kind) {
  const panel = document.querySelector(".cloud-select-panel");
  const input = panel?.querySelector(`[data-dropdown-search="${kind}"]`);
  if (!input) return;
  liveDropdownSearch(kind, input.value);
  input.focus({ preventScroll: true });
}

function filterDropdownRows(kind, value) {
  const panel = document.querySelector(".cloud-select-panel");
  if (!panel) return;
  const query = value.trim().toLowerCase();
  const activeCategory = state.modelTask.imageCategory;
  const activeOperatorCategory = state.operatorTask.operatorCategory;
  const isPublicOperatorPanel = kind === "operator" && panel.classList.contains("operator-cascader");
  const publicOperatorCategories = isPublicOperatorPanel ? publicOperatorMatchedCategories(query) : [];
  const visibleOperatorCategory = isPublicOperatorPanel && query && !publicOperatorCategories.includes(activeOperatorCategory) ? publicOperatorCategories[0] || "" : activeOperatorCategory;
  if (isPublicOperatorPanel) {
    panel.querySelectorAll(".cascader-left button").forEach((button) => {
      const category = button.textContent.replace("›", "").trim();
      const visible = !query || publicOperatorCategories.includes(category);
      button.style.display = visible ? "" : "none";
      button.classList.toggle("active", category === visibleOperatorCategory);
    });
  }
  let visibleCount = 0;
  panel.querySelectorAll("[data-search-row]").forEach((row) => {
    const text = (row.dataset.searchText || "").toLowerCase();
    const categoryVisible = isPublicOperatorPanel ? row.dataset.category === visibleOperatorCategory : (kind !== "image" || query || row.dataset.category === activeCategory);
    const visible = categoryVisible && (!query || text.includes(query));
    row.style.display = visible ? "" : "none";
    if (visible) visibleCount += 1;
  });
  const empty = panel.querySelector(".dropdown-empty");
  if (empty) empty.style.display = visibleCount ? "none" : "";
}


function executionSelector() {
  return `<div class="execution-grid">
    <button type="button" class="execution-card ${state.modelTask.execution === "standard" ? "selected" : ""}" onclick="setModelTask('execution','standard')">
      <strong>标准验证流程</strong>
      <span>使用平台预置验证流程执行，适合标准模型训练/推理验证。</span>
    </button>
    <button type="button" class="execution-card ${state.modelTask.execution === "agent" ? "selected" : ""}" onclick="setModelTask('execution','agent')">
      <strong>多 Agent 验证系统</strong>
      <span>调用多 Agent 链路完成复杂环境验证与结果分析。</span>
    </button>
  </div>`;
}

function tagField(target = "model") {
  const tags = target === "operator" ? state.operatorTags : state.taskTags;
  const chips = tags.length
    ? tags.map((tag) => `<span class="tag-chip">${tag.value ? `${tag.key}:${tag.value}` : tag.key}</span>`).join("")
    : `<span class="muted">未绑定标签</span>`;
  return `<button type="button" class="tag-editor-trigger" onclick="openTagModal('${target}')"><span class="tag-chip-row">${chips}</span><span title="选择标签">✎</span></button>`;
}

const tagDictionary = {
  场景: ["大语言", "多模态", "科学计算"],
  任务: ["训练", "推理", "芯片对比"],
  项目: ["验收测试", "采购评估", "性能基线"],
  环境: ["生产", "测试", "实验室"],
  类型: ["算子验证", "模型验证"],
  算子: ["单算子", "预置算子", "自定义算子"],
  目标: ["性能稳定性", "精度一致性", "兼容性"],
  对比: ["芯片", "框架", "版本"],
};

function openTagModal(target = "model") {
  state.tagEditTarget = target;
  const tags = target === "operator" ? state.operatorTags : state.taskTags;
  state.labelDraft = tags.length ? tags.map((tag) => ({ ...tag })) : [{ key: "", value: "" }];
  renderTagModal();
}

function renderTagModal() {
  modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal tag-modal">
    <div class="modal-head"><h3>选择标签</h3><button class="btn text" onclick="closeModal()">×</button></div>
    <div class="tag-edit-list">${state.labelDraft.map((tag, index) => tagEditRow(tag, index)).join("")}</div>
    <button class="btn" type="button" onclick="addTagDraft()">添加标签</button>
    <div class="modal-actions"><button class="btn primary" onclick="confirmTags()">确定</button><button class="btn" onclick="closeModal()">取消</button></div>
  </div></div>`;
}

function tagEditRow(tag, index) {
  const values = tagDictionary[tag.key] || [];
  return `<div class="tag-edit-row">
    <div class="field"><label><span class="required">*</span>标签键</label><select onchange="updateTagDraft(${index}, 'key', this.value)"><option value="">请选择标签键</option>${Object.keys(tagDictionary).map((key) => `<option value="${key}" ${tag.key === key ? "selected" : ""}>${key}</option>`).join("")}</select></div>
    <span class="tag-colon">:</span>
    <div class="field"><label>标签值</label><select ${tag.key ? "" : "disabled"} onchange="updateTagDraft(${index}, 'value', this.value)"><option value="">请选择标签值</option>${values.map((value) => `<option value="${value}" ${tag.value === value ? "selected" : ""}>${value}</option>`).join("")}</select></div>
    <button class="btn text tag-delete" onclick="removeTagDraft(${index})" title="删除">×</button>
  </div>`;
}

function updateTagDraft(index, key, value) {
  state.labelDraft[index][key] = value;
  if (key === "key" && !tagDictionary[value]?.includes(state.labelDraft[index].value)) {
    state.labelDraft[index].value = "";
  }
  renderTagModal();
}

function addTagDraft() {
  state.labelDraft.push({ key: "", value: "" });
  renderTagModal();
}

function removeTagDraft(index) {
  state.labelDraft.splice(index, 1);
  if (!state.labelDraft.length) state.labelDraft.push({ key: "", value: "" });
  renderTagModal();
}

function confirmTags() {
  const seen = new Set();
  const nextTags = state.labelDraft
    .map((tag) => ({ key: tag.key.trim(), value: tag.value.trim() }))
    .filter((tag) => tag.key)
    .filter((tag) => {
      const id = `${tag.key}:${tag.value}`;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  if (state.tagEditTarget === "operator") state.operatorTags = nextTags;
  else state.taskTags = nextTags;
  closeModal();
  render();
}

function taskCreated() {
  ensureModelTaskState();
  const compute = selectedResource("compute");
  const image = selectedResource("image");
  if (!resourceIsSelectable(compute) || !workspaceCanUseResource(compute) || !resourceIsSelectable(image) || !workspaceCanUseResource(image)) {
    toast("请选择当前工作空间中可用的算力资源和镜像");
    return;
  }
  state.lastCreatedTask = { type: "模型验证", metrics: "模型验证指标 + 芯片指标", selectedScenario: currentModelScenario()?.name || "" };
  state.activeTaskId = "";
  toast("任务已创建");
  setRoute("task-detail");
}

function operatorTaskCreated() {
  ensureOperatorTaskState();
  if (!state.operatorTask.operators.length) {
    toast("请至少选择一个算子");
    return;
  }
  const compute = selectedResource("compute");
  const image = selectedResource("image");
  if (!resourceIsSelectable(compute) || !workspaceCanUseResource(compute) || !resourceIsSelectable(image) || !workspaceCanUseResource(image) || !state.operatorTask.execution) {
    toast("请完成算力资源、镜像和执行方式配置");
    return;
  }
  state.lastCreatedTask = {
    type: "算子验证",
    metrics: "算子验证指标 + 芯片指标",
    operators: selectedOperators().map((item) => item.name),
  };
  state.activeTaskId = "";
  toast("任务已创建");
  setRoute("task-detail");
}

function taskDetailPage() {
  const task = taskRows.find((item) => item.id === state.activeTaskId);
  const created = state.lastCreatedTask || null;
  const detail = taskDetailData(task, created);
  return shell(`
    ${pageHead("任务详情", "展示配置摘要、调度状态、执行日志、指标与结果。", `<button class="btn" onclick="setRoute('tasks')">返回列表</button><button class="btn" onclick="toast('任务已重试')">重试</button><button class="btn danger" onclick="confirmBox('确认终止该任务？')">终止</button>`)}
    <div class="grid cols-2">
      <div class="card"><h3>配置摘要</h3><table><tr><th>任务 ID</th><td>${detail.id}</td></tr><tr><th>任务类型</th><td>${detail.type}</td></tr><tr><th>${detail.subjectLabel}</th><td>${detail.subject}</td></tr>${detail.dataset ? `<tr><th>数据集</th><td>${detail.dataset}</td></tr>` : ""}<tr><th>算力</th><td>${detail.compute}</td></tr><tr><th>镜像</th><td>${detail.image}</td></tr><tr><th>执行方式</th><td>${detail.execution}</td></tr><tr><th>默认指标</th><td>${detail.metrics}</td></tr></table></div>
      <div class="card"><h3>调度状态</h3>${taskScheduleSteps(detail.status)}<p class="muted">${detail.scheduleNote}</p><table><tr><th>调度队列</th><td>${detail.queue}</td></tr><tr><th>执行节点</th><td>${detail.node}</td></tr><tr><th>资源占用</th><td>${detail.usage}</td></tr><tr><th>报告产物</th><td>${detail.reportStatus}</td></tr></table></div>
      <div class="card"><h3>执行日志</h3><pre>${detail.logs}</pre></div>
      <div class="card"><h3>验证结果</h3><table>${detail.resultRows.map((row) => `<tr><th>${row[0]}</th><td>${row[1]}</td></tr>`).join("")}</table></div>
    </div>
  `, "tasks");
}

function taskDetailData(task, created) {
  if (task?.id === "TASK-240528") {
    return {
      id: "TASK-240528",
      type: "算子验证",
      status: "已完成",
      subjectLabel: "算子",
      subject: "FlashAttention",
      dataset: "",
      compute: "H20 集群",
      image: "team-pytorch-h20 / CUDA 12.4",
      execution: "标准验证流程",
      metrics: "算子验证指标 + 芯片指标",
      scheduleNote: "任务已完成，调度、执行、结果回传与报告生成均已通过。",
      queue: "operator-validation / high-throughput",
      node: "h20-worker-03，16 卡 H20，CUDA 12.4",
      usage: "8 卡，峰值显存 72GB / 卡，平均 GPU 利用率 91%",
      reportStatus: "基础报告 RPT-240528-1 已生成，智能分析报告 RPT-240528-2 已生成",
      logs: "17:36 创建任务并进入队列\n17:37 完成 H20 集群资源锁定\n17:39 拉取算子镜像并校验依赖版本\n17:43 完成 FlashAttention 单算子性能与稳定性验证\n17:46 指标与日志回传完成\n17:49 基础报告生成完成\n17:52 智能分析报告生成完成",
      resultRows: [["吞吐表现", "较平台基线提升 8.6%，长序列场景收益明显"], ["稳定性", "连续 30 分钟压测无异常退出，P99 延迟波动 3.2%"], ["芯片适配", "H20 CUDA 12.4 环境依赖匹配，建议保留当前镜像作为团队基线"], ["结论", "验证通过，可用于后续模型推理链路验证"]],
    };
  }
  const type = created?.type || task?.type || "模型验证";
  const operators = created?.operators || (type === "算子验证" ? ["Conv2d"] : []);
  return {
    id: task?.id || "TASK-NEW",
    type,
    status: task?.status || "运行中",
    subjectLabel: type === "算子验证" ? "算子" : "模型",
    subject: type === "算子验证" ? operators.join("、") : "Qwen2.5-72B",
    dataset: type === "算子验证" ? "" : "C-Eval",
    compute: task?.compute || "Atlas 800T A2",
    image: type === "算子验证" ? "pytorch-2.4-cuda12" : "pytorch-2.4-cuda12",
    execution: task?.execution || "多 Agent",
    metrics: created?.metrics || (type === "算子验证" ? "算子验证指标 + 芯片指标" : "模型验证指标 + 芯片指标"),
    scheduleNote: task?.status === "已完成" ? "任务已完成，报告已生成。" : "Agent 在线，最近心跳 12 秒前。",
    queue: "default-validation",
    node: "worker-01",
    usage: "资源占用持续回传中",
    reportStatus: task?.status === "已完成" ? "基础报告已生成" : "基础报告生成中",
    logs: "10:21 创建任务\n10:23 资源分配完成\n10:25 Agent 接收任务\n10:37 指标持续回传中",
    resultRows: [["吞吐量", "18.2k tok/s"], ["P95 延迟", "38ms"], ["准确率", "92.6%"], ["能效比", "1.42 tokens/J"]],
  };
}

function taskScheduleSteps(status) {
  const steps = ["排队中", "资源分配", "执行中", "结果回传", "报告生成"];
  const doneCount = status === "已完成" ? steps.length : status === "运行中" ? 3 : status === "失败" ? 3 : 1;
  return `<div class="stepper">${steps.map((step, index) => `<div class="step ${index < doneCount ? "done" : ""}">${step}</div>`).join("")}</div>`;
}

function openNaturalDialog() {
  modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal">
    <div class="row between"><h3>自然语言创建任务</h3><button class="btn text" onclick="closeModal()">关闭</button></div>
    <div class="nl-box">
      <div class="chat">
        <div class="bubble">请描述你想验证的模型、数据集、目标芯片和执行方式。</div>
        <div class="bubble me">验证 Qwen2.5 在 H20 上的推理吞吐，使用预置数据集，走多 Agent。</div>
        <div class="bubble">已解析为模型验证任务：推理验证 / Qwen2.5 / H20 / 多 Agent。请确认后创建。</div>
      </div>
      <textarea>验证 Qwen2.5 在 H20 上的推理吞吐，使用预置数据集，走多 Agent。</textarea>
      <button class="btn primary" onclick="closeModal();taskCreated()">确认创建</button>
    </div>
  </div></div>`;
}

function naturalTaskPage() {
  const defaultText = "验证 Qwen2.5 在 H20 上的推理吞吐，使用预置数据集，走多 Agent。";
  const parsed = state.naturalParsed || parseNaturalTask(defaultText);
  return shell(`
    ${pageHead("自然语言创建任务", "通过对话描述验证目标，系统解析任务类型、模型/算子、算力资源和执行方式。", `<button class="btn" onclick="setRoute('tasks')">返回任务管理</button>`)}
    <div class="grid cols-2">
      <div class="card nl-box">
        <h3>任务创建对话</h3>
        <div class="chat">
          <div class="bubble">请描述你想验证的模型或算子、具体数据集、算力资源、镜像和执行方式。</div>
          <div class="bubble me">${parsed.input}</div>
          <div class="bubble">${naturalAssistantMessage(parsed)}</div>
        </div>
        <textarea id="natural-input">${parsed.input}</textarea>
        <div class="row" style="margin-top:10px"><button class="btn" onclick="parseNaturalFromInput()">解析任务</button><button class="btn primary" ${parsed.ready ? "" : "disabled"} onclick="createNaturalTaskFromParsed()">确认创建</button></div>
      </div>
      ${naturalParsedPanel(parsed)}
    </div>
  `, "task-natural");
}

function parseNaturalFromInput() {
  const input = document.getElementById("natural-input")?.value || "";
  state.naturalParsed = parseNaturalTask(input);
  render();
}

function naturalAssistantMessage(parsed) {
  if (parsed.ready) return "信息完整，资源可用，请确认后创建。";
  const parts = [];
  if (parsed.missing.length) parts.push(`请补充${parsed.missing.join("、")}`);
  if (parsed.unavailable.length) parts.push(`以下资源当前不可用：${parsed.unavailable.join("、")}`);
  return `${parts.join("；")}。补充后点击“解析任务”，我会重新检查资源可用性。`;
}

function parseNaturalTask(input) {
  const text = input.trim();
  const lower = text.toLowerCase();
  const isOperator = /算子|conv2d|matmul|layernorm|rmsnorm|allreduce|gelu|relu/i.test(text);
  const parsed = {
    input: text || "验证 Qwen2.5 在 H20 上的推理吞吐，使用预置数据集，走多 Agent。",
    type: isOperator ? "算子验证" : "模型验证",
    target: /训练/.test(text) ? "训练验证" : "推理验证",
    execution: /agent/i.test(text) || /多\s*Agent/.test(text) ? "多 Agent 验证系统" : "标准验证流程",
    missing: [],
    unavailable: [],
  };
  if (isOperator) {
    parsed.operator = findOperatorFromText(text);
    if (!parsed.operator) parsed.missing.push("算子");
  } else {
    parsed.model = findResourceFromText(modelTaskResources.models, text, "model");
    parsed.dataset = findResourceFromText(modelTaskResources.datasets, text, "dataset");
    if (!parsed.model) parsed.missing.push("模型");
    if (!parsed.dataset) parsed.missing.push(/预置数据集|团队数据集|我的数据集/.test(text) ? "具体数据集名称" : "数据集");
  }
  parsed.compute = findComputeFromText(text);
  parsed.image = findResourceFromText(imageTaskResources().filter(workspaceCanUseResource), text, "image")
    || firstSelectableResource(imageTaskResources(), "public");
  if (!parsed.compute) parsed.missing.push("算力资源");
  if (!parsed.image) parsed.missing.push("镜像");
  [parsed.model, parsed.dataset, parsed.operator, parsed.compute, parsed.image].filter(Boolean).forEach((item) => {
    if (item.status && !resourceIsSelectable(item)) parsed.unavailable.push(item.name);
  });
  parsed.ready = parsed.missing.length === 0 && parsed.unavailable.length === 0;
  return parsed;
}

function findResourceFromText(items, text, kind) {
  const normalized = text.toLowerCase().replace(/\s+/g, "");
  return items.find((item) => normalized.includes(item.name.toLowerCase().replace(/\s+/g, "")))
    || (kind === "model" && /qwen2\.?5|qwen/.test(normalized) ? items.find((item) => item.name.includes("Qwen2.5") && item.scene === "大语言") : null)
    || (kind === "dataset" && /c-eval|ceval/.test(normalized) ? items.find((item) => item.name.startsWith("C-Eval")) : null);
}

function findComputeFromText(text) {
  const normalized = text.toLowerCase();
  const available = computeTaskResources().filter(workspaceCanUseResource);
  return available.find((item) => normalized.includes(item.name.toLowerCase()))
    || (/h20/.test(normalized) ? available.find((item) => item.chip.toLowerCase().includes("h20")) : null)
    || (/h800/.test(normalized) ? available.find((item) => item.chip.toLowerCase().includes("h800")) : null)
    || (/atlas|910b|昇腾/.test(normalized) ? available.find((item) => /atlas|910b|昇腾/i.test(`${item.name} ${item.chip}`)) : null);
}

function findOperatorFromText(text) {
  const all = Object.entries(publicOperatorLibrary).flatMap(([category, items]) => items.map((item) => ({ ...item, category, source: "public", status: "可用" }))).concat(privateOperatorResources);
  const normalized = text.toLowerCase().replace(/\s+/g, "");
  return all.find((item) => normalized.includes(item.name.toLowerCase().replace(/\s+/g, "")));
}

function naturalParsedPanel(parsed) {
  const rows = parsed.type === "算子验证"
    ? [
        ["任务类型", parsed.type, "ok"],
        ["算子", parsed.operator?.name || "未指定具体算子", parsed.operator ? resourceState(parsed.operator) : "missing"],
        ["算力资源", parsed.compute?.name || "未指定算力资源", parsed.compute ? resourceState(parsed.compute) : "missing"],
        ["镜像", parsed.image?.name || "未指定镜像", parsed.image ? resourceState(parsed.image) : "missing"],
        ["执行方式", parsed.execution, "ok"],
      ]
    : [
        ["任务类型", parsed.type, "ok"],
        ["验证目标", parsed.target, "ok"],
        ["模型", parsed.model?.name || "未指定具体模型", parsed.model ? resourceState(parsed.model) : "missing"],
        ["数据集", parsed.dataset?.name || "未指定具体数据集", parsed.dataset ? resourceState(parsed.dataset) : "missing"],
        ["算力资源", parsed.compute?.name || "未指定算力资源", parsed.compute ? resourceState(parsed.compute) : "missing"],
        ["镜像", parsed.image?.name || "未指定镜像", parsed.image ? resourceState(parsed.image) : "missing"],
        ["执行方式", parsed.execution, "ok"],
      ];
  return `<div class="card parse-card"><h3>解析结果</h3><div class="permission ${parsed.ready ? "" : "warn"}">${parsed.ready ? "已满足创建条件，所选资源可用。" : `还需补充：${parsed.missing.join("、") || "无"}${parsed.unavailable.length ? `；不可用资源：${parsed.unavailable.join("、")}` : ""}`}</div><table>${rows.map(([label, value, state]) => `<tr><th>${label}</th><td>${value}</td><td>${parseStateBadge(state)}</td></tr>`).join("")}</table></div>`;
}

function resourceState(item) {
  return resourceIsSelectable(item) || !item.status ? "ok" : "unavailable";
}

function parseStateBadge(stateName) {
  if (stateName === "ok") return `<span class="badge green">可用</span>`;
  if (stateName === "missing") return `<span class="badge red">需补充</span>`;
  return `<span class="badge red">不可用</span>`;
}

function createNaturalTaskFromParsed() {
  const parsed = parseNaturalTask(document.getElementById("natural-input")?.value || state.naturalParsed?.input || "");
  state.naturalParsed = parsed;
  if (!parsed.ready) {
    toast("请补充缺失信息并确认资源可用");
    return;
  }
  state.lastCreatedTask = { type: parsed.type, metrics: parsed.type === "算子验证" ? "算子验证指标 + 芯片指标" : "模型验证指标 + 芯片指标", operators: parsed.operator ? [parsed.operator.name] : undefined };
  toast("任务已创建");
  setRoute("task-detail");
}

function reportsPage() {
  const filters = state.reportFilters;
  return shell(`
    ${pageHead("报告列表", "任务完成后自动生成基础报告，也可生成自定义报告与智能分析报告。", `<button class="btn" onclick="setRoute('report-detail')">查看示例报告</button>`)}
    <div class="card">
      <div class="filters">
        <div class="input-group task-search"><input value="${filters.queryDraft}" oninput="state.reportFilters.queryDraft=this.value" onkeydown="if(event.key==='Enter'){event.preventDefault();applyReportSearch()}" placeholder="搜索报告名称 / ID" /><button class="btn" type="button" onclick="applyReportSearch()">搜索</button></div>
        <select onchange="setReportFilter('status',this.value)">${filterOptions(["全部状态", "已生成", "生成中"], filters.status)}</select>
        <select onchange="setReportFilter('type',this.value)">${filterOptions(["全部报告类型", "基础报告", "自定义报告", "智能分析报告"], filters.type)}</select>
        ${state.selectedReportIds.length ? `<button class="btn" type="button" onclick="confirmBulkDownloadReports()">批量下载</button><button class="btn danger" type="button" onclick="confirmBulkDeleteReports()">批量删除</button>` : ""}
      </div>
      ${reportTable()}
    </div>
  `, "reports");
}

function reportTable() {
  const rows = filteredReportRows();
  const visibleIds = rows.map((report) => report.id);
  const allVisibleSelected = visibleIds.length && visibleIds.every((id) => state.selectedReportIds.includes(id));
  return `<div class="table-wrap"><table id="report-table"><thead><tr><th class="check-col"><input type="checkbox" ${allVisibleSelected ? "checked" : ""} ${visibleIds.length ? "" : "disabled"} onchange="toggleAllVisibleReports(this.checked)" /></th><th>报告 ID</th><th>报告名称</th><th>关联任务</th><th>报告类型</th><th>状态</th><th>目标芯片 / 算力</th><th>创建时间</th><th>操作</th></tr></thead>
    <tbody>${rows.map(reportRow).join("") || `<tr><td colspan="9"><div class="empty">没有匹配的报告</div></td></tr>`}</tbody></table></div>`;
}

function allReportRows() {
  const extras = [
    { taskId: "TASK-240601", index: 2, name: "Qwen2.5 推理智能分析报告", type: "智能分析报告", status: "已生成", createdAt: "2026-06-01" },
    { taskId: "TASK-240528", index: 2, name: "FlashAttention 算子稳定性智能分析报告", type: "智能分析报告", status: "已生成", createdAt: "2026-05-29" },
    { taskId: "TASK-240522", index: 2, name: "语音识别延迟智能分析报告", type: "智能分析报告", status: "生成中", createdAt: "2026-05-23" },
  ];
  const baseRows = taskRows.map((task) => ({
    id: reportIdForTask(task.id, 1),
    name: `${task.name.replace(/验证$/, "")}基础报告`,
    taskId: task.id,
    type: "基础报告",
    status: baseReportStatusForTask(task),
    compute: task.compute,
    createdAt: task.createdAt.slice(0, 10),
  }));
  const extraRows = extras.map((report) => {
    const task = taskRows.find((item) => item.id === report.taskId);
    const baseStatus = task ? baseReportStatusForTask(task) : "生成中";
    return {
      id: reportIdForTask(report.taskId, report.index),
      name: report.name,
      taskId: report.taskId,
      type: report.type,
      status: baseStatus === "已生成" ? report.status : "生成中",
      compute: task?.compute || "-",
      createdAt: report.createdAt,
    };
  });
  return [...baseRows, ...extraRows].filter((report) => !state.deletedReportIds.includes(report.id));
}

function baseReportStatusForTask(task) {
  return task.status === "已完成" || task.status === "失败" ? "已生成" : "生成中";
}

function reportIdForTask(taskId, index) {
  return `RPT-${taskId.replace("TASK-", "")}-${index}`;
}

function filteredReportRows() {
  const { query, status, type } = state.reportFilters;
  const keyword = query.trim().toLowerCase();
  return allReportRows()
    .filter((report) => !keyword || `${report.id} ${report.name} ${report.taskId}`.toLowerCase().includes(keyword))
    .filter((report) => status === "全部状态" || report.status === status)
    .filter((report) => type === "全部报告类型" || report.type === type);
}

function reportRow(report) {
  const checked = state.selectedReportIds.includes(report.id);
  return `<tr><td class="check-col"><input type="checkbox" ${checked ? "checked" : ""} onchange="toggleReportSelection('${report.id}',this.checked)" /></td><td>${report.id}</td><td>${report.name}</td><td>${report.taskId}</td><td>${report.type}</td><td>${statusBadge(report.status)}</td><td>${report.compute}</td><td>${report.createdAt}</td><td>${reportActions(report)}</td></tr>`;
}

function reportActions(report) {
  if (report.status === "生成中") return `<button class="btn text" onclick="confirmDeleteReport('${report.id}')">删除</button>`;
  return `<button class="btn text" onclick="openReportDetail('${report.id}')">详情</button><button class="btn text" onclick="confirmDownloadReport('${report.id}')">下载</button><button class="btn text" onclick="confirmDeleteReport('${report.id}')">删除</button>`;
}

function openReportDetail(id) {
  state.activeReportId = id;
  setRoute("report-detail");
}

function reportDetailPage() {
  const report = allReportRows().find((item) => item.id === state.activeReportId) || allReportRows()[0];
  const showSmartAnalysis = report?.type === "智能分析报告";
  const task = taskRows.find((item) => item.id === report?.taskId) || taskRows[0];
  return shell(`
    ${pageHead(`${report?.type || "基础报告"}详情`, showSmartAnalysis ? "展示客观指标、基础结论与智能分析建议。" : "展示客观指标、图表和基础结论。", `<button class="btn" onclick="setRoute('reports')">返回列表</button><button class="btn" onclick="toast('报告导出下载已开始')">导出下载</button><button class="btn" onclick="customReportModal()">生成自定义报告</button><button class="btn primary" onclick="toast('智能分析报告已生成')">生成智能分析报告</button>`)}
    <div class="grid">
      <div class="card"><h3>任务配置摘要</h3><table><tr><th>报告 ID</th><td>${report?.id || "-"}</td><th>报告类型</th><td>${report?.type || "基础报告"}</td></tr><tr><th>任务名称</th><td>${task?.name || "-"}</td><th>任务 ID</th><td>${report?.taskId || "-"}</td></tr><tr><th>任务类型</th><td>${task?.type || "模型验证"}</td><th>目标算力</th><td>${report?.compute || "-"}</td></tr></table></div>
      <div class="grid cols-4">${stat("吞吐量", "18.2k", "tok/s")}${stat("P95 延迟", "38ms", "达标")}${stat("准确率", "92.6%", "较基线 +1.4%")}${stat("能效比", "1.42", "tokens/J")}</div>
      <div class="grid cols-2"><div class="card"><h3>图表区</h3><div class="chart"><div class="bar" style="height:76%"></div><div class="bar" style="height:62%"></div><div class="bar" style="height:88%"></div><div class="bar" style="height:58%"></div><div class="bar" style="height:71%"></div></div></div><div class="card"><h3>基础结论</h3><p>吞吐、延迟与准确率均达到本次验证目标。资源消耗峰值处于可接受范围，建议继续观察长周期稳定性。</p></div></div>
      ${showSmartAnalysis ? smartAnalysisSection() : ""}
    </div>
  `, "reports");
}

function smartAnalysisSection() {
  return `<div class="card smart-report">
    <h3>智能分析报告</h3>
    <div class="grid cols-3">
      <div><span class="muted">综合评级</span><strong class="analysis-score">A-</strong><p>吞吐与准确率表现稳定，延迟在高并发阶段存在轻微波动。</p></div>
      <div><span class="muted">主要风险</span><strong>显存带宽争用</strong><p>长上下文和高 batch 并发时，P95 延迟抖动明显高于基础样本。</p></div>
      <div><span class="muted">建议优先级</span><strong>中高</strong><p>建议在上线前补充长文本、混合 batch 与持续压测样本。</p></div>
    </div>
    <div class="grid cols-2" style="margin-top:14px">
      <div><h4>差异原因分析</h4><ul><li>H20 推理集群在 8K 以上上下文长度下显存访问压力上升。</li><li>当前镜像运行时对动态 batch 分桶策略不够充分。</li><li>样本集中短文本占比较高，对长文本稳定性的覆盖不足。</li></ul></div>
      <div><h4>优化建议</h4><ul><li>启用更细粒度的 batch 分桶并限制极端长上下文并发比例。</li><li>升级推理镜像中的 attention kernel 与通信库版本。</li><li>补充长文本、工具调用和多轮对话样本后重新验证。</li></ul></div>
    </div>
    <div class="permission" style="margin-top:14px">选型建议：大语言推理场景可继续使用 H20 集群；如目标是更低 P95 延迟，建议同时对比 Atlas 800T A2 资源池。</div>
  </div>`;
}

function customReportModal() {
  modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal form">
    <div class="row between"><h3>自定义报告配置</h3><button class="btn text" onclick="closeModal()">关闭</button></div>
    <div class="field"><label>报告名称</label><input value="Qwen2.5 推理吞吐验证 · 自定义报告" /></div>
    <div class="field"><label>指标范围</label><select multiple><option selected>模型指标</option><option selected>芯片指标</option><option>资源指标</option><option>算子指标</option></select></div>
    <div class="field"><label>展示形式</label><select multiple><option selected>指标卡</option><option selected>表格</option><option>折线图</option><option>柱状图</option><option>对比图</option></select></div>
    <label class="row"><input type="checkbox" checked /> 包含基础结论</label>
    <button class="btn primary" onclick="closeModal();setRoute('custom-report')">生成</button>
  </div></div>`;
}

function customReportPage() {
  return shell(`${pageHead("自定义报告详情", "按所选指标范围与展示形式生成，可查看和导出下载。", `<button class="btn" onclick="setRoute('reports')">返回报告列表</button><button class="btn" onclick="toast('自定义报告已下载')">导出下载</button>`)}<div class="grid cols-2"><div class="card"><h3>指标卡</h3><div class="grid cols-2">${stat("模型指标", "4 项", "已选择")}${stat("芯片指标", "5 项", "已选择")}</div></div><div class="card"><h3>对比图</h3><div class="chart"><div class="bar" style="height:66%"></div><div class="bar" style="height:82%"></div><div class="bar" style="height:54%"></div></div></div></div>`, "reports");
}

function computeSourceOptions() {
  return isTeamWorkspace()
    ? ["全部来源", "平台预置", "团队资源"]
    : ["全部来源", "平台预置", "个人接入"];
}

function computeRowsForWorkspace() {
  return computeRows.filter(workspaceCanUseResource);
}

function computeDisplayStatus(row) {
  return row.status === "可用" ? "可调度" : row.status;
}

function normalizeComputeFilters() {
  const sourceOptions = computeSourceOptions();
  const statusOptions = computeStatusOptions();
  if (!sourceOptions.includes(state.computeFilters.source)) state.computeFilters.source = "全部来源";
  if (!statusOptions.includes(state.computeFilters.status)) state.computeFilters.status = "全部状态";
}

function computeStatusOptions() {
  return ["全部状态", ...new Set(computeRowsForWorkspace().map(computeDisplayStatus))];
}

function filteredComputeRows() {
  const filters = state.computeFilters;
  const query = filters.query.trim().toLowerCase();
  return computeRowsForWorkspace()
    .filter((row) => filters.source === "全部来源" || row.source === filters.source)
    .filter((row) => filters.status === "全部状态" || computeDisplayStatus(row) === filters.status)
    .filter((row) => !query || `${row.id} ${row.name} ${row.source} ${row.chipType} ${row.chip} ${row.spec} ${row.status}`.toLowerCase().includes(query));
}

function setComputeFilter(key, value) {
  state.computeFilters[key] = value;
  render();
}

function applyComputeSearch() {
  state.computeFilters.query = state.computeFilters.queryDraft.trim();
  render();
}

function computePage() {
  normalizeComputeFilters();
  const filters = state.computeFilters;
  const visibleRows = filteredComputeRows();
  const sourceOptions = computeSourceOptions();
  const statusOptions = computeStatusOptions();
  return shell(`
    ${pageHead("算力资源列表", "查看和管理当前工作空间可用的算力资源。", `<button class="btn primary" onclick="setRoute('compute-onboard')">接入自有算力</button>`)}
    <div class="card">
      <div class="filters"><div class="input-group task-search"><input id="compute-search" value="${filters.queryDraft}" oninput="state.computeFilters.queryDraft=this.value" onkeydown="if(event.key==='Enter'){event.preventDefault();applyComputeSearch()}" placeholder="搜索资源名称 / ID" /><button class="btn" type="button" onclick="applyComputeSearch()">搜索</button></div><select onchange="setComputeFilter('source',this.value)">${filterOptions(sourceOptions, filters.source)}</select><select onchange="setComputeFilter('status',this.value)">${filterOptions(statusOptions, filters.status)}</select></div>
      <div class="table-wrap"><table id="compute-table"><thead><tr><th>ID</th><th>资源名称</th><th>来源</th><th>芯片 / 资源类型</th><th>规格摘要</th><th>可调度状态</th><th>操作</th></tr></thead><tbody>${visibleRows.map((r) => `<tr><td>${r.id}</td><td>${r.name}</td><td>${r.source}</td><td>${r.chipType} / ${r.chip}</td><td>${r.spec}${r.reason ? `<div class="muted">${r.reason}</div>` : ""}</td><td>${statusBadge(computeDisplayStatus(r))}</td><td><button class="btn text" onclick="setRoute('compute-detail')">详情</button><button class="btn text" onclick="toast('连通性检测已触发')">检测</button><button class="btn text" ${resourceIsSelectable(r) ? `onclick="confirmBox('确认停用该资源？','disableComputeResource(\\'${r.id}\\')')"` : "disabled"}>停用</button></td></tr>`).join("") || `<tr><td colspan="7"><div class="empty">暂无匹配的算力资源</div></td></tr>`}</tbody></table></div>
    </div>
  `, "compute");
}

function disableComputeResource(id) {
  const row = computeRows.find((item) => item.id === id);
  if (!row) return;
  row.status = "已停用";
  row.reason = "资源已停用";
  ensureModelTaskState();
  closeModal();
  toast("算力资源已停用");
  render();
}

function computeDetailPage() {
  return shell(`
    ${pageHead("算力资源详情", "查看基本信息、规格、适用场景、接入状态、审核状态、能力校验和调度信息。", `<button class="btn" onclick="setRoute('compute')">返回列表</button><button class="btn" onclick="toast('检测任务已启动')">检测</button>`)}
    <div class="grid cols-2">
      <div class="card"><h3>基本信息</h3><table><tr><th>资源名称</th><td>Atlas 800T A2 资源池</td></tr><tr><th>资源 ID</th><td>CMP-1001</td></tr><tr><th>来源</th><td>平台预置</td></tr><tr><th>芯片型号</th><td>昇腾 910B</td></tr></table></div>
      <div class="card"><h3>规格信息</h3><table><tr><th>卡数</th><td>32</td></tr><tr><th>显存</th><td>64GB HBM</td></tr><tr><th>网络</th><td>RoCE</td></tr><tr><th>框架</th><td>PyTorch / CANN</td></tr></table></div>
      <div class="card"><h3>接入与审核</h3><p>${statusBadge("可调度")} ${statusBadge("已生成")} <span class="badge blue">代理在线</span></p><p class="muted">最近心跳：2026-06-04 11:52，审核状态：审核通过。</p></div>
      <div class="card"><h3>能力校验与调度</h3><p>最近检测结果：通过。当前占用任务：3，历史任务：128。</p><p>适用场景：大语言、多模态、科学计算。</p></div>
    </div>
  `, "compute");
}

function computeOnboardPage() {
  return shell(`
    ${pageHead("用户自有算力接入流程", "登记资源信息、获取接入指引、绑定代理、连通性检测、能力校验、提交启用。")}
    <div class="stepper" style="margin-bottom:16px"><div class="step done">登记资源</div><div class="step done">接入指引</div><div class="step done">绑定代理</div><div class="step done">连通性检测</div><div class="step">能力校验</div><div class="step">提交启用</div><div class="step">进入资源池</div></div>
    <div class="grid cols-2">
      <form class="card form"><h3>登记资源信息</h3><div class="field"><label>资源名称 *</label><input id="compute-onboard-name" value="实验室 A800 训练节点" /></div><div class="field"><label>归属范围 *</label><select id="compute-onboard-scope"><option value="mine">个人</option><option value="team">团队</option></select></div><div class="field"><label>芯片 / 资源类型 *</label><input id="compute-onboard-chip" value="GPU / A800" /></div><div class="field"><label>规格说明 *</label><textarea id="compute-onboard-spec">4 卡，80GB 显存，1TB 内存，NVMe 存储</textarea></div><div class="field"><label>适用场景 *</label><select id="compute-onboard-scenes" multiple><option selected>大语言</option><option selected>科学计算</option><option>多模态</option></select></div><div class="field"><label>网络连接方式 *</label><select><option>平台代理反连</option><option>专线</option><option>VPN</option></select></div><div class="field"><label>联系人 *</label><input value="jing" /></div><button class="btn primary" type="button" onclick="submitComputeOnboard()">提交</button></form>
      <div class="card"><h3>连通性检测结果</h3><p>${statusBadge("可调度")} 代理已绑定，端口可达，驱动版本匹配。</p><div class="empty">若检测失败，会展示失败原因并禁止进入任务创建可选资源。</div></div>
    </div>
  `, "compute");
}

function submitComputeOnboard() {
  const scope = document.getElementById("compute-onboard-scope")?.value === "team" ? "team" : "mine";
  const chipText = document.getElementById("compute-onboard-chip")?.value.trim() || "GPU / A800";
  const [chipType = "GPU", chip = "A800"] = chipText.split("/").map((item) => item.trim());
  const scenes = Array.from(document.getElementById("compute-onboard-scenes")?.selectedOptions || []).map((option) => option.value);
  computeRows.push({
    id: `CMP-${Date.now()}`,
    scope,
    name: document.getElementById("compute-onboard-name")?.value.trim() || "新接入算力资源",
    source: scope === "team" ? "团队资源" : "个人接入",
    chipType,
    chipVendor: /nvidia|a800|h800|h20/i.test(chip) ? "NVIDIA" : /昇腾|910/i.test(chip) ? "昇腾" : "其他",
    chip,
    spec: document.getElementById("compute-onboard-spec")?.value.trim() || "-",
    status: "待审核",
    reason: "等待管理员审核",
    scenes,
  });
  ensureModelTaskState();
  toast("资源信息已保存，进入能力校验");
  setRoute("compute");
}

function sortModelTaskResource(a, b) {
  if (state.modelTask.modelSource === "public") {
    const hotA = Boolean(modelAssetProfiles[a.id]?.hot);
    const hotB = Boolean(modelAssetProfiles[b.id]?.hot);
    if (hotA !== hotB) return hotA ? -1 : 1;
    const providerA = modelAssetProfiles[a.id]?.provider || providerFromModelName(a.name);
    const providerB = modelAssetProfiles[b.id]?.provider || providerFromModelName(b.name);
    return providerA.localeCompare(providerB, "zh-Hans-CN") || a.name.localeCompare(b.name, "zh-Hans-CN");
  }
  return a.name.localeCompare(b.name, "zh-Hans-CN");
}

function modelAssetScopeOptions() {
  return [
    { key: "public", label: "预置模型" },
    { key: isTeamWorkspace() ? "team" : "mine", label: isTeamWorkspace() ? "团队模型" : "我的模型" },
  ];
}

const modelAssetProfiles = {
  "deepseek-v4-pro": { alias: "DeepSeek-V4-Pro", provider: "DeepSeek", params: 1600, sourceName: "Model Scope", updatedAt: "2026.05.20", hot: true, description: "旗舰级 MoE 大模型，总参 1.6T，激活 49B，原生支持百万级超长上下文。依托海量高质量训练数据，具备顶尖数学逻辑、复杂推理、专业代码与长文本深度解析能力，适配高阶科研、复杂办公、深度智能代理等高难度场景。" },
  "deepseek-v4-pro-fp8": { alias: "DeepSeek-V4-Pro-FP8", provider: "DeepSeek", params: 1600, sourceName: "Hugging Face", updatedAt: "2026.06.05", hot: false, description: "面向推理部署优化的 FP8 版本，保持旗舰模型核心能力，同时降低显存占用，适合大规模吞吐验证和多资源池部署对比。" },
  "deepseek-v4-flash": { alias: "DeepSeek-V4-Flash", provider: "DeepSeek", params: 284, sourceName: "Model Scope", updatedAt: "2026.05.26", hot: true, description: "高效轻量化 MoE 模型，总参 284B，激活 13B，推理速度快、延迟低、调用成本低，适合日常对话、内容创作、基础 RAG、批量文案处理等普惠刚需场景。" },
  "kimi-k2": { alias: "Kimi-K2", provider: "Kimi", params: 1000, sourceName: "Model Scope", updatedAt: "2026.05.26", hot: true, description: "面向长文本、多轮对话和文档理解场景，适合验证长上下文推理、材料分析和复杂问答表现。" },
  qwen: { alias: "Qwen2.5-72B", provider: "Qwen", params: 72, sourceName: "Model Scope", updatedAt: "2026.05.20", hot: true, description: "通用大语言模型，兼顾训练与推理验证，适合吞吐、延迟、精度和跨芯片性能基线对比。" },
  deepseek: { alias: "DeepSeek-V3", provider: "DeepSeek", params: 671, sourceName: "Model Scope", updatedAt: "2026.05.30", hot: true, description: "适合复杂推理、代码生成与知识问答验证的大语言模型，可用于多芯片推理效率和长文本能力评估。" },
  "glm-46": { alias: "GLM-4.6", provider: "GLM", params: 32, sourceName: "Model Scope", updatedAt: "2026.05.18", hot: false, description: "面向通用问答、工具调用和代码辅助场景，适合验证模型服务吞吐、延迟和稳定性。" },
  "qwen-coder": { alias: "Qwen3-Coder-30B-A3B-Instruct", provider: "Qwen", params: 30, sourceName: "Model Scope", updatedAt: "2026.06.02", hot: false, description: "面向代码生成和工程辅助任务的指令模型，适合验证代码任务、工具调用和长链路推理表现。" },
  "llama-31": { alias: "Llama-3.1-70B", provider: "Meta", params: 70, sourceName: "Hugging Face", updatedAt: "2026.05.16", hot: false, description: "开源大模型基线，可用于跨芯片推理能力、部署兼容性和开源生态适配验证。" },
  "clip-vl": { alias: "CLIP-ViT-Large", provider: "OpenAI", params: 1, sourceName: "Hugging Face", updatedAt: "2026.05.12", hot: false, description: "图文匹配和多模态表示验证常用模型，适合图文检索、相似度匹配和多模态编码评估。" },
  "paddleocr-vl": { alias: "PaddleOCR-VL-1.6", provider: "PaddlePaddle", params: 0.9, sourceName: "Model Scope", updatedAt: "2026.06.04", hot: false, description: "面向 OCR 和文档理解的多模态模型，适合图片文字识别、版面理解和视觉语言任务验证。" },
  whisper: { alias: "Whisper-large-v3", provider: "OpenAI", params: 1.5, sourceName: "Hugging Face", updatedAt: "2026.05.10", hot: false, description: "语音识别与音频转写场景验证模型，可用于端到端识别准确率、延迟和资源消耗评估。" },
  paraformer: { alias: "Paraformer-Large", provider: "ModelScope", params: 0.23, sourceName: "Model Scope", updatedAt: "2026.05.04", hot: false, description: "中文语音识别验证模型，适合音频识别、延迟和多硬件部署稳定性评估。" },
  alphafold: { alias: "AlphaFold-Science", provider: "DeepMind", params: 93, sourceName: "Model Scope", updatedAt: "2026.05.08", hot: false, description: "科学计算场景下的结构预测验证模型，适合验证复杂推理链路和算力资源适配。" },
  "science-solver": { alias: "ScienceSolver-7B", provider: "平台预置", params: 7, sourceName: "Model Scope", updatedAt: "2026.05.28", hot: false, description: "面向科学问答、公式推理和实验数据理解的验证模型，覆盖科学计算类任务基线。" },
  molformer: { alias: "MolFormer-Base", provider: "平台预置", params: 0.1, sourceName: "Model Scope", updatedAt: "2026.05.15", hot: false, description: "面向分子表示与属性预测的科学计算模型，可用于训练与推理链路验证。" },
  "bge-m3": { alias: "BGE-M3", provider: "BAAI", params: 0.6, sourceName: "Hugging Face", updatedAt: "2026.05.22", hot: false, description: "多语言、多粒度向量检索模型，适合检索召回、语义匹配和 RAG 检索链路评估。" },
  "mteb-reranker": { alias: "MTEB-Reranker", provider: "平台预置", params: 1, sourceName: "Model Scope", updatedAt: "2026.05.24", hot: false, description: "面向检索排序任务的重排模型，适合验证召回后排序质量、延迟和资源占用。" },
  "bge-reranker": { alias: "BGE-Reranker-Large", provider: "BAAI", params: 0.56, sourceName: "Hugging Face", updatedAt: "2026.05.06", hot: false, description: "适合检索、排序和召回链路验证，可用于多资源环境下的重排性能比较。" },
};

function normalizeModelAssetState() {
  const validScopes = modelAssetScopeOptions().map((item) => item.key);
  if (!validScopes.includes(state.modelAsset.scope)) state.modelAsset.scope = "public";
  const maxPage = Math.max(1, Math.ceil(filteredModelAssets().length / state.modelAsset.pageSize));
  if (state.modelAsset.page > maxPage) state.modelAsset.page = maxPage;
  if (state.modelAsset.page < 1) state.modelAsset.page = 1;
}

function modelsAssetPage() {
  normalizeModelAssetState();
  const helper = isTeamWorkspace() ? "查看平台预置模型，管理团队可用模型。" : "查看平台预置模型，管理你上传的自定义模型。";
  const scope = state.modelAsset.scope;
  const canManage = scope === "mine" || (scope === "team" && canShowTeamManagement());
  const action = canManage ? `<button class="btn primary" onclick="openModelCreateModal()">${scope === "team" ? "上传团队模型" : "上传我的模型"}</button>` : "";
  return shell(`
    ${pageHead("模型", helper, action)}
    <div class="card">
      <div class="segmented asset-scope-tabs" style="margin-bottom:12px">${modelAssetScopeOptions().map((item) => `<button class="${scope === item.key ? "active" : ""}" onclick="setModelAssetScope('${item.key}')">${item.label}</button>`).join("")}</div>
      ${scope === "public" ? presetModelFilters() : privateModelFilters()}
      ${scope === "public" ? presetModelGrid() : privateModelTable(scope)}
      ${modelAssetPagination()}
    </div>
  `, "assets-models");
}

function presetModelFilters() {
  const filters = state.modelAsset;
  return `<div class="filters model-asset-filters">
    <div class="input-group task-search"><input value="${filters.queryDraft}" oninput="state.modelAsset.queryDraft=this.value" onkeydown="if(event.key==='Enter'){event.preventDefault();applyModelAssetSearch()}" placeholder="搜索您感兴趣的模型" /><button class="btn" type="button" onclick="applyModelAssetSearch()">搜索</button></div>
    <select onchange="setModelAssetFilter('scene',this.value)">${filterOptions(modelSceneOptions(), filters.scene)}</select>
    <select onchange="setModelAssetFilter('capability',this.value)">${filterOptions(["全部功能", "训练", "推理"], filters.capability)}</select>
    <div class="param-filter">
      <button class="param-trigger ${filters.paramPanelOpen ? "active" : ""}" type="button" onclick="toggleModelParamPanel()"><span>模型参数量</span><strong>${modelParamLabel()}</strong><em>v</em></button>
      ${filters.paramPanelOpen ? `<div class="param-popover">
        <div class="param-inputs">
          <label><input id="model-param-min" type="number" min="0" max="2000" value="${filters.minParamsDraft}" oninput="setModelParamDraft('min',this.value)" onkeydown="if(event.key==='Enter'){event.preventDefault();applyModelParamRange()}" /><span>B</span></label>
          <span>–</span>
          <label><input id="model-param-max" type="number" min="0" max="2000" value="${filters.maxParamsDraft}" oninput="setModelParamDraft('max',this.value)" onkeydown="if(event.key==='Enter'){event.preventDefault();applyModelParamRange()}" /><span>B</span></label>
        </div>
        <div class="param-sliders" id="model-param-sliders" data-active-thumb="max" style="--param-min:${Number(filters.minParamsDraft) / 20}%;--param-max:${Number(filters.maxParamsDraft) / 20}%">
          <div class="param-range-track"></div>
          <button class="param-range-thumb param-range-min" type="button" aria-label="最低参数量" style="left:var(--param-min)" onpointerdown="startModelParamDrag(event,'min')" onkeydown="adjustModelParamThumb(event,'min')"></button>
          <button class="param-range-thumb param-range-max" type="button" aria-label="最高参数量" style="left:var(--param-max)" onpointerdown="startModelParamDrag(event,'max')" onkeydown="adjustModelParamThumb(event,'max')"></button>
        </div>
        <div class="param-actions"><button class="btn primary" type="button" onclick="applyModelParamRange()">确定</button><button class="btn" type="button" onclick="resetModelParamRange()">重置</button></div>
      </div>` : ""}
    </div>
  </div>`;
}

function privateModelFilters() {
  const filters = state.modelAsset;
  return `<div class="filters model-asset-filters">
    <div class="input-group task-search"><input value="${filters.queryDraft}" oninput="state.modelAsset.queryDraft=this.value" onkeydown="if(event.key==='Enter'){event.preventDefault();applyModelAssetSearch()}" placeholder="输入模型名称、标签进行搜索" /><button class="btn" type="button" onclick="applyModelAssetSearch()">搜索</button></div>
  </div>`;
}

function modelSceneOptions() {
  return ["全部场景", "大语言", "多模态", "音频", "科学计算", "检索匹配"];
}

function modelTagOptions() {
  const tags = modelRowsForCurrentScope().flatMap((row) => (row.tags || "").split(" / ").filter(Boolean));
  return ["全部标签", ...Array.from(new Set(tags))];
}

function modelRowsForCurrentScope() {
  return modelTaskResources.models
    .filter((row) => row.source === state.modelAsset.scope)
    .map(modelResourceToAssetRow);
}

function modelResourceToAssetRow(resource) {
  const profile = modelAssetProfiles[resource.id] || {};
  const params = profile.params ?? parseModelParams(resource.version);
  return {
    id: resource.id,
    scope: resource.source,
    name: resource.name,
    alias: profile.alias || resource.name,
    scene: resource.scene,
    capability: resource.support,
    provider: profile.provider || providerFromModelName(resource.name),
    params,
    sourceName: profile.sourceName || "Model Scope",
    updatedAt: profile.updatedAt || "2026.05.18",
    description: profile.description || `${resource.name} 可用于${resource.scene}场景下的训练、推理和跨芯片验证。`,
    hot: Boolean(profile.hot),
    visible: resource.source === "team" ? "当前团队" : "仅自己可见",
    owner: profile.owner || (resource.source === "team" ? "团队空间" : "jing"),
    version: resource.version || "v1.0",
    tags: profile.tags || `${resource.scene} / ${resource.support.includes("训练") ? "训练" : "推理"}`,
  };
}

function providerFromModelName(name) {
  if (/deepseek/i.test(name)) return "DeepSeek";
  if (/qwen/i.test(name)) return "Qwen";
  if (/glm/i.test(name)) return "GLM";
  if (/llama/i.test(name)) return "Meta";
  if (/clip|whisper/i.test(name)) return "OpenAI";
  if (/bge/i.test(name)) return "BAAI";
  if (/paddle/i.test(name)) return "PaddlePaddle";
  return "平台预置";
}

function parseModelParams(version = "") {
  const b = version.match(/(\d+(?:\.\d+)?)\s*B/i);
  if (b) return Number(b[1]);
  const m = version.match(/(\d+(?:\.\d+)?)\s*M/i);
  if (m) return Number((Number(m[1]) / 1000).toFixed(2));
  return 1;
}

function filteredModelAssets() {
  const filters = state.modelAsset;
  const keyword = filters.query.trim().toLowerCase();
  return modelRowsForCurrentScope()
    .filter((row) => !keyword || `${row.id} ${row.name} ${row.provider || ""} ${row.scene || ""} ${row.tags || ""}`.toLowerCase().includes(keyword))
    .filter((row) => state.modelAsset.scope !== "public" || filters.scene === "全部场景" || row.scene === filters.scene || row.scene?.startsWith(`${filters.scene} /`))
    .filter((row) => state.modelAsset.scope !== "public" || filters.capability === "全部功能" || row.capability?.includes(filters.capability))
    .filter((row) => state.modelAsset.scope !== "public" || !filters.minParams || Number(row.params) >= Number(filters.minParams))
    .filter((row) => state.modelAsset.scope !== "public" || !filters.maxParams || Number(row.params) <= Number(filters.maxParams))
    .sort(sortModelAssetRows);
}

function sortModelAssetRows(a, b) {
  if (state.modelAsset.scope === "public") {
    if (a.hot !== b.hot) return a.hot ? -1 : 1;
    const providerA = a.provider || providerFromModelName(a.name);
    const providerB = b.provider || providerFromModelName(b.name);
    return providerA.localeCompare(providerB, "zh-Hans-CN") || a.name.localeCompare(b.name, "zh-Hans-CN");
  }
  return a.name.localeCompare(b.name, "zh-Hans-CN");
}

function pagedModelAssets() {
  const start = (state.modelAsset.page - 1) * state.modelAsset.pageSize;
  return filteredModelAssets().slice(start, start + state.modelAsset.pageSize);
}

function presetModelGrid() {
  const rows = pagedModelAssets();
  return `<div class="model-card-grid">${rows.map(modelAssetCard).join("") || `<div class="empty">暂无匹配的模型</div>`}</div>`;
}

function modelAssetCard(row) {
  return `<article class="model-asset-card">
    ${row.hot ? `<span class="model-hot">热门</span>` : ""}
    <div class="model-card-main">
      <h3>${row.name}</h3>
      <div class="model-alias">${row.alias}</div>
      <div class="model-chips"><span>${row.scene}</span><span>${row.provider}</span><span>参数量 ${row.params}B</span></div>
      <p>${row.description}</p>
    </div>
    <div class="model-card-foot">
      <span>${row.sourceName}</span>
      <span>${row.updatedAt} 更新</span>
      <button class="btn text" onclick="openPresetModelDetail('${row.id}')">查看</button>
    </div>
  </article>`;
}

function openPresetModelDetail(id) {
  state.selectedPresetModelId = id;
  state.assetType = "models";
  state.modelAsset.scope = "public";
  setRoute("preset-model-detail");
}

function presetModelDetailPage() {
  const resource = modelTaskResources.models.find((item) => item.source === "public" && item.id === state.selectedPresetModelId)
    || modelTaskResources.models.find((item) => item.source === "public");
  const row = modelResourceToAssetRow(resource);
  const isDeepSeekPro = row.id === "deepseek-v4-pro";
  const intro = isDeepSeekPro ? deepSeekProIntro(row) : genericPresetModelIntro(row);
  return shell(`
    <div class="preset-model-detail">
      <button class="detail-back" onclick="setRoute('assets-models')">←</button>
      <div class="preset-model-hero">
        <h1>${row.name}</h1>
        <p>${row.alias}</p>
        <div class="model-chips detail-chips"><span>${row.scene}模型</span><span>${row.provider}</span><span>参数量 ${row.params}B</span><span>开源协议 MIT</span></div>
        <div class="preset-model-source"><span>${row.sourceName}</span><span>${row.updatedAt} 更新</span></div>
      </div>
      <div class="preset-detail-tabs"><button class="active">模型介绍</button></div>
      <section class="preset-model-intro">
        <h2>简介</h2>
        ${intro}
      </section>
    </div>
  `, "assets-models");
}

function deepSeekProIntro(row) {
  return `
    <p>本模型可以直接部署，模型详情请参考 <a href="javascript:void(0)">${row.name} ↗</a>。</p>
    <p>${row.name} 是 DeepSeek-V4 系列的旗舰版本，采用混合专家（MoE）架构：</p>
    <p>总参数量：1.6T（1600B）<br>
    激活参数量：49B<br>
    上下文长度：1M tokens（百万级长上下文）<br>
    精度：FP4 + FP8 Mixed（MoE 专家参数使用 FP4，其他参数使用 FP8）<br>
    三种推理模式：Non-think（快速响应）、Think High（深度推理）、Think Max（极限推理）</p>
    <p>核心特性：</p>
    <p>Hybrid Attention（CSA + HCA 混合注意力），长上下文效率大幅提升。在 1M 上下文设置下，相比 DeepSeek-V3.2 可显著降低单 token 推理 FLOPs 和 KV cache 成本。<br>
    Manifold-Constrained Hyper-Connections（mHC）增强残差连接。<br>
    Muon 优化器加速收敛。</p>
    <p>${row.name}-Max 在开源模型中达到领先的知识能力和代码能力水平，在推理和 Agentic 任务上适合用于高阶模型验证。</p>
  `;
}

function genericPresetModelIntro(row) {
  return `
    <p>本模型可以直接部署，也可以在模型验证任务中作为预置模型选择。</p>
    <p>${row.name} 面向${row.scene}场景，适合用于${row.capability}能力验证、跨芯片性能对比和验证报告生成。</p>
    <p>总参数量：${row.params}B<br>
    支持能力：${row.capability}<br>
    来源：${row.sourceName}<br>
    更新日期：${row.updatedAt}</p>
    <p>核心特性：</p>
    <p>${row.description}</p>
  `;
}

function privateModelTable(scope) {
  const rows = pagedModelAssets();
  const canManage = scope === "mine" || (scope === "team" && canShowTeamManagement());
  return `<div class="table-wrap"><table><thead><tr><th>模型名称 / ID</th><th>可见范围</th><th>所有者</th><th>最新版本</th><th>标签</th><th>操作</th></tr></thead><tbody>${rows.map((row) => `<tr><td><button class="btn text" onclick="setRoute('asset-detail')">${row.name}</button><br><span class="muted">${row.id}</span></td><td>${row.visible}</td><td>${row.owner}</td><td>${row.version}</td><td>${row.tags}</td><td><button class="btn text" onclick="setRoute('asset-detail')">查看</button>${canManage ? `<button class="btn text" onclick="confirmBox('删除后该模型将无法继续用于新建验证任务，确认删除吗？','deleteModelAsset(\\'${row.id}\\')')">删除</button>` : ""}</td></tr>`).join("") || `<tr><td colspan="6"><div class="empty">暂无匹配的模型</div></td></tr>`}</tbody></table></div>`;
}

function modelAssetPagination() {
  const total = filteredModelAssets().length;
  const totalPages = Math.max(1, Math.ceil(total / state.modelAsset.pageSize));
  return `<div class="pagination"><button class="btn" ${state.modelAsset.page <= 1 ? "disabled" : ""} onclick="setModelAssetPage(${state.modelAsset.page - 1})">上一页</button><span>第 ${state.modelAsset.page} / ${totalPages} 页</span><button class="btn" ${state.modelAsset.page >= totalPages ? "disabled" : ""} onclick="setModelAssetPage(${state.modelAsset.page + 1})">下一页</button><select onchange="setModelAssetPageSize(this.value)">${filterOptions(["10", "20", "50"], String(state.modelAsset.pageSize))}</select><span>条 / 页</span><input type="number" min="1" max="${totalPages}" value="${state.modelAsset.page}" onkeydown="if(event.key==='Enter'){event.preventDefault();setModelAssetPage(this.value)}" /><button class="btn" onclick="setModelAssetPage(this.previousElementSibling.value)">跳转</button></div>`;
}

function modelParamLabel() {
  return `${state.modelAsset.minParams || "0"}B – ${state.modelAsset.maxParams || "2000"}B`;
}

function toggleModelParamPanel() {
  state.modelAsset.paramPanelOpen = !state.modelAsset.paramPanelOpen;
  state.modelAsset.minParamsDraft = state.modelAsset.minParams || "0";
  state.modelAsset.maxParamsDraft = state.modelAsset.maxParams || "2000";
  render();
}

function normalizeParamValue(value, fallback) {
  const number = Number(value);
  if (Number.isNaN(number)) return fallback;
  return String(Math.min(2000, Math.max(0, number)));
}

function setModelParamDraft(type, value, syncInput = false) {
  const key = type === "min" ? "minParamsDraft" : "maxParamsDraft";
  const inputId = type === "min" ? "model-param-min" : "model-param-max";
  const otherValue = Number(type === "min" ? state.modelAsset.maxParamsDraft : state.modelAsset.minParamsDraft);
  const normalized = Number(normalizeParamValue(value, type === "min" ? "0" : "2000"));
  const nextValue = type === "min" ? Math.min(normalized, otherValue) : Math.max(normalized, otherValue);
  state.modelAsset[key] = String(nextValue);
  if (syncInput) {
    const input = document.getElementById(inputId);
    if (input) input.value = state.modelAsset[key];
  }
  const slider = document.getElementById("model-param-sliders");
  if (slider) {
    slider.style.setProperty(type === "min" ? "--param-min" : "--param-max", `${nextValue / 20}%`);
    slider.dataset.activeThumb = type;
  }
}

function activateModelParamThumb(type) {
  const slider = document.getElementById("model-param-sliders");
  if (slider) slider.dataset.activeThumb = type;
}

let activeModelParamThumb = "";

function updateModelParamThumb(type, value) {
  const minValue = Number(state.modelAsset.minParamsDraft);
  const maxValue = Number(state.modelAsset.maxParamsDraft);
  const nextValue = Number(normalizeParamValue(value, type === "min" ? "0" : "2000"));
  const clampedValue = type === "min" ? Math.min(nextValue, maxValue) : Math.max(nextValue, minValue);
  const key = type === "min" ? "minParamsDraft" : "maxParamsDraft";
  const inputId = type === "min" ? "model-param-min" : "model-param-max";
  state.modelAsset[key] = String(clampedValue);
  const numberInput = document.getElementById(inputId);
  if (numberInput) numberInput.value = String(clampedValue);
  const slider = document.getElementById("model-param-sliders");
  if (slider) {
    slider.style.setProperty(type === "min" ? "--param-min" : "--param-max", `${clampedValue / 20}%`);
    slider.dataset.activeThumb = type;
  }
}

function setModelParamSlider(type, value) {
  updateModelParamThumb(type, value);
}

function startModelParamDrag(event, type) {
  event.preventDefault();
  activeModelParamThumb = type;
  activateModelParamThumb(type);
  event.currentTarget.setPointerCapture?.(event.pointerId);
  updateModelParamFromPointer(event);
}

function updateModelParamFromPointer(event) {
  if (!activeModelParamThumb) return;
  const slider = document.getElementById("model-param-sliders");
  if (!slider) return;
  const rect = slider.getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  updateModelParamThumb(activeModelParamThumb, Math.round(ratio * 2000));
}

function stopModelParamDrag() {
  activeModelParamThumb = "";
}

function adjustModelParamThumb(event, type) {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const current = Number(type === "min" ? state.modelAsset.minParamsDraft : state.modelAsset.maxParamsDraft);
  const next = event.key === "Home" ? 0 : event.key === "End" ? 2000 : current + (event.key === "ArrowLeft" ? -10 : 10);
  updateModelParamThumb(type, next);
}

function applyModelParamRange() {
  let min = Number(normalizeParamValue(state.modelAsset.minParamsDraft, "0"));
  let max = Number(normalizeParamValue(state.modelAsset.maxParamsDraft, "2000"));
  if (min > max) [min, max] = [max, min];
  state.modelAsset.minParams = String(min);
  state.modelAsset.maxParams = String(max);
  state.modelAsset.minParamsDraft = String(min);
  state.modelAsset.maxParamsDraft = String(max);
  state.modelAsset.paramPanelOpen = false;
  state.modelAsset.page = 1;
  render();
}

function resetModelParamRange() {
  state.modelAsset.minParams = "0";
  state.modelAsset.maxParams = "2000";
  state.modelAsset.minParamsDraft = "0";
  state.modelAsset.maxParamsDraft = "2000";
  state.modelAsset.paramPanelOpen = false;
  state.modelAsset.page = 1;
  render();
}

function setModelAssetScope(scope) {
  state.modelAsset.scope = scope;
  state.modelAsset.queryDraft = "";
  state.modelAsset.query = "";
  state.modelAsset.scene = "全部场景";
  state.modelAsset.capability = "全部功能";
  state.modelAsset.minParams = "0";
  state.modelAsset.maxParams = "2000";
  state.modelAsset.minParamsDraft = "0";
  state.modelAsset.maxParamsDraft = "2000";
  state.modelAsset.paramPanelOpen = false;
  state.modelAsset.tag = "全部标签";
  state.modelAsset.page = 1;
  render();
}

function setModelAssetFilter(key, value) {
  state.modelAsset[key] = value;
  state.modelAsset.page = 1;
  render();
}

function applyModelAssetSearch() {
  state.modelAsset.query = state.modelAsset.queryDraft.trim();
  state.modelAsset.page = 1;
  render();
}

function setModelAssetPage(page) {
  state.modelAsset.page = Number(page) || 1;
  render();
}

function setModelAssetPageSize(size) {
  state.modelAsset.pageSize = Number(size) || 10;
  state.modelAsset.page = 1;
  render();
}

function openModelCreateModal() {
  const scope = state.modelAsset.scope === "team" ? "team" : "mine";
  const title = scope === "team" ? "上传团队模型" : "上传我的模型";
  modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal form"><div class="row between"><h3>${title}</h3><button class="btn text" onclick="closeModal()">关闭</button></div><div class="field"><label>模型名称 *</label><input id="model-create-name" value="custom-model" /></div><div class="field"><label>最新版本 *</label><input id="model-create-version" value="v1.0" /></div><div class="field"><label>标签</label><input id="model-create-tags" value="大语言 / 推理" /></div><div class="field"><label>模型文件 *</label><input id="model-create-file" type="file" /></div><button class="btn primary" onclick="submitModelCreate('${scope}')">上传</button></div></div>`;
}

function submitModelCreate(scope) {
  const name = document.getElementById("model-create-name").value.trim() || "custom-model";
  const tags = document.getElementById("model-create-tags").value.trim() || "大语言 / 推理";
  modelTaskResources.models.push({
    id: `model-${scope}-${Date.now()}`,
    source: scope,
    name,
    scene: tags.split(" / ")[0] || "大语言",
    support: tags.includes("训练") ? "训练 / 推理" : "推理",
    version: document.getElementById("model-create-version").value.trim() || "v1.0",
    status: "可用",
  });
  closeModal();
  toast("模型已上传");
  render();
}

function deleteModelAsset(id) {
  const index = modelTaskResources.models.findIndex((item) => item.id === id);
  if (index >= 0) modelTaskResources.models.splice(index, 1);
  closeModal();
  toast("模型已删除");
  render();
}

function operatorAssetScopeOptions() {
  return [
    { key: "public", label: "预置算子" },
    { key: isTeamWorkspace() ? "team" : "mine", label: isTeamWorkspace() ? "团队算子" : "我的算子" },
  ];
}

function normalizeOperatorAssetState() {
  const validScopes = operatorAssetScopeOptions().map((item) => item.key);
  if (!validScopes.includes(state.operatorAsset.scope)) state.operatorAsset.scope = "public";
  const maxPage = Math.max(1, Math.ceil(filteredOperatorAssets().length / state.operatorAsset.pageSize));
  if (state.operatorAsset.page > maxPage) state.operatorAsset.page = maxPage;
  if (state.operatorAsset.page < 1) state.operatorAsset.page = 1;
}

function operatorsAssetPage() {
  normalizeOperatorAssetState();
  const scope = state.operatorAsset.scope;
  const helper = isTeamWorkspace() ? "查看平台预置算子，管理团队可用算子。" : "查看平台预置算子，管理你创建或上传的自定义算子。";
  const canUpload = scope === "mine" || (scope === "team" && canShowTeamManagement());
  const action = canUpload ? `<button class="btn primary" onclick="openOperatorUploadModal()">${scope === "team" ? "上传团队算子" : "上传我的算子"}</button>` : "";
  return shell(`
    ${pageHead("算子", helper, action)}
    <div class="card">
      <div class="segmented asset-scope-tabs" style="margin-bottom:12px">${operatorAssetScopeOptions().map((item) => `<button class="${scope === item.key ? "active" : ""}" onclick="setOperatorAssetScope('${item.key}')">${item.label}</button>`).join("")}</div>
      ${operatorAssetFilters()}
      ${scope === "public" ? publicOperatorAssetTable() : privateOperatorAssetTable(scope)}
      ${operatorAssetPagination()}
    </div>
  `, "assets-operators");
}

function operatorAssetFilters() {
  const filters = state.operatorAsset;
  const search = `<div class="input-group task-search"><input value="${filters.queryDraft}" oninput="state.operatorAsset.queryDraft=this.value" onkeydown="if(event.key==='Enter'){event.preventDefault();applyOperatorAssetSearch()}" placeholder="${filters.scope === "public" ? "输入算子名称进行搜索" : "输入算子名称、标签进行搜索"}" /><button class="btn" type="button" onclick="applyOperatorAssetSearch()">搜索</button></div>`;
  if (filters.scope !== "public") return `<div class="filters operator-asset-filters">${search}</div>`;
  return `<div class="filters operator-asset-filters">${search}<select onchange="setOperatorAssetFilter('category',this.value)">${filterOptions(operatorAssetCategoryOptions(), filters.category)}</select></div>`;
}

function operatorAssetCategoryOptions() {
  return ["全部分类", ...Object.keys(publicOperatorLibrary)];
}

function publicOperatorAssetRows() {
  return Object.entries(publicOperatorLibrary).flatMap(([category, items]) => items.map((item, index) => ({
    ...item,
    source: "public",
    category,
    chips: operatorCompatibleChips(category, item.name),
    updatedAt: `2026-05-${String(28 - (index % 8)).padStart(2, "0")}`,
  })));
}

function operatorCompatibleChips(category, name) {
  if (/通信|AllReduce|AllGather|Broadcast/i.test(`${category} ${name}`)) return "NVIDIA GPU / 昇腾 NPU";
  if (/矩阵|MatMul|GEMM/i.test(`${category} ${name}`)) return "NVIDIA GPU / 昇腾 NPU / 昆仑芯 NPU";
  if (/图像|Resize|Crop|Pad/i.test(`${category} ${name}`)) return "NVIDIA GPU / CPU";
  return "NVIDIA GPU / 昇腾 NPU";
}

function privateOperatorAssetRows(scope = state.operatorAsset.scope) {
  return privateOperatorResources
    .filter((item) => item.source === scope)
    .map((item) => ({
      ...item,
      description: operatorAssetDescription(item),
      owner: item.owner || (scope === "team" ? "团队空间" : "jing"),
      version: item.version || (item.source === "team" ? "team-v1.0" : "v1.0"),
      tags: item.tags || `${item.category} / ${item.framework}`,
    }));
}

function operatorAssetDescription(item) {
  if (item.description) return item.description;
  const descriptions = {
    "mine-fused-ln": "融合归一化计算，减少访存并提升推理稳定性。",
    "mine-flash-attn": "面向长序列推理的注意力算子优化实现。",
    "mine-matmul-int8": "INT8 矩阵乘算子，用于量化推理验证。",
    "team-sparse-matmul": "团队维护的稀疏矩阵乘算子。",
    "team-allreduce": "针对多卡通信链路优化的 AllReduce 算子。",
    "team-rmsnorm": "团队共享的 RMSNorm 算子包。",
  };
  return descriptions[item.id] || `${item.category}自定义算子。`;
}

function operatorRowsForCurrentScope() {
  return state.operatorAsset.scope === "public" ? publicOperatorAssetRows() : privateOperatorAssetRows();
}

function filteredOperatorAssets() {
  const filters = state.operatorAsset;
  const keyword = filters.query.trim().toLowerCase();
  return operatorRowsForCurrentScope()
    .filter((row) => !keyword || `${row.name} ${row.description || ""} ${row.owner || ""} ${row.version || ""} ${row.tags || ""}`.toLowerCase().includes(keyword))
    .filter((row) => filters.scope !== "public" || filters.category === "全部分类" || row.category === filters.category);
}

function pagedOperatorAssets() {
  const start = (state.operatorAsset.page - 1) * state.operatorAsset.pageSize;
  return filteredOperatorAssets().slice(start, start + state.operatorAsset.pageSize);
}

function publicOperatorAssetTable() {
  const rows = pagedOperatorAssets();
  return `<div class="table-wrap"><table><thead><tr><th>算子名称</th><th>分类</th><th>适配芯片</th><th>更新日期</th><th>操作</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${row.name}</td><td>${row.category}</td><td>${row.chips}</td><td>${row.updatedAt}</td><td><button class="btn text" onclick="toast('详情页暂未配置')">详情</button></td></tr>`).join("") || `<tr><td colspan="5"><div class="empty">暂无匹配的算子</div></td></tr>`}</tbody></table></div>`;
}

function privateOperatorAssetTable(scope) {
  const rows = pagedOperatorAssets();
  const canManage = scope === "mine" || (scope === "team" && canShowTeamManagement());
  return `<div class="table-wrap"><table><thead><tr><th>算子名称</th><th>描述</th><th>所有者</th><th>最新版本</th><th>标签</th><th>操作</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${row.name}</td><td>${row.description}</td><td>${row.owner}</td><td>${row.version}</td><td>${row.tags}</td><td><button class="btn text" onclick="toast('详情页暂未配置')">查看</button>${canManage ? `<button class="btn text" onclick="confirmBox('删除后该算子将无法继续用于新建验证任务，确认删除吗？','deleteOperatorAsset(\\'${row.id}\\')')">删除</button>` : ""}</td></tr>`).join("") || `<tr><td colspan="6"><div class="empty">暂无匹配的算子</div></td></tr>`}</tbody></table></div>`;
}

function operatorAssetPagination() {
  const total = filteredOperatorAssets().length;
  const totalPages = Math.max(1, Math.ceil(total / state.operatorAsset.pageSize));
  return `<div class="pagination"><button class="btn" ${state.operatorAsset.page <= 1 ? "disabled" : ""} onclick="setOperatorAssetPage(${state.operatorAsset.page - 1})">上一页</button><span>第 ${state.operatorAsset.page} / ${totalPages} 页</span><button class="btn" ${state.operatorAsset.page >= totalPages ? "disabled" : ""} onclick="setOperatorAssetPage(${state.operatorAsset.page + 1})">下一页</button><select onchange="setOperatorAssetPageSize(this.value)">${filterOptions(["10", "20", "50"], String(state.operatorAsset.pageSize))}</select><span>条 / 页</span><input type="number" min="1" max="${totalPages}" value="${state.operatorAsset.page}" onkeydown="if(event.key==='Enter'){event.preventDefault();setOperatorAssetPage(this.value)}" /><button class="btn" onclick="setOperatorAssetPage(this.previousElementSibling.value)">跳转</button></div>`;
}

function setOperatorAssetScope(scope) {
  state.operatorAsset.scope = scope;
  state.operatorAsset.queryDraft = "";
  state.operatorAsset.query = "";
  state.operatorAsset.category = "全部分类";
  state.operatorAsset.page = 1;
  render();
}

function setOperatorAssetFilter(key, value) {
  state.operatorAsset[key] = value;
  state.operatorAsset.page = 1;
  render();
}

function applyOperatorAssetSearch() {
  state.operatorAsset.query = state.operatorAsset.queryDraft.trim();
  state.operatorAsset.page = 1;
  render();
}

function setOperatorAssetPage(page) {
  state.operatorAsset.page = Number(page) || 1;
  render();
}

function setOperatorAssetPageSize(size) {
  state.operatorAsset.pageSize = Number(size) || 10;
  state.operatorAsset.page = 1;
  render();
}

function openOperatorUploadModal() {
  const scope = state.operatorAsset.scope;
  if (scope === "public" || (scope === "team" && !canShowTeamManagement())) return;
  const title = scope === "team" ? "上传团队算子" : "上传我的算子";
  modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal form"><div class="row between"><h3>${title}</h3><button class="btn text" onclick="closeModal()">关闭</button></div>
    <div class="field"><label>算子名称 *</label><input id="operator-upload-name" value="CustomOperator" /></div>
    <div class="field"><label>算子分类 *</label><select id="operator-upload-category">${optionList(Object.keys(publicOperatorLibrary))}</select></div>
    <div class="field"><label>开发框架 *</label><select id="operator-upload-framework">${optionList(["PyTorch", "CUDA", "MindSpore", "CANN"])}</select></div>
    <div class="field"><label>最新版本 *</label><input id="operator-upload-version" value="v1.0" /></div>
    <div class="field"><label>标签</label><input id="operator-upload-tags" value="自定义 / 算子验证" /></div>
    <div class="field"><label>算子描述</label><textarea id="operator-upload-description">用于算子验证的自定义实现。</textarea></div>
    <div class="field"><label>算子文件 *</label><input id="operator-upload-file" type="file" /></div>
    <button class="btn primary" onclick="submitOperatorUpload('${scope}')">上传</button>
  </div></div>`;
}

function submitOperatorUpload(scope) {
  const name = document.getElementById("operator-upload-name")?.value.trim();
  if (!name) {
    toast("请输入算子名称");
    return;
  }
  privateOperatorResources.push({
    id: `operator-${scope}-${Date.now()}`,
    source: scope,
    name,
    category: document.getElementById("operator-upload-category")?.value || "神经网络算子",
    framework: document.getElementById("operator-upload-framework")?.value || "PyTorch",
    version: document.getElementById("operator-upload-version")?.value.trim() || "v1.0",
    tags: document.getElementById("operator-upload-tags")?.value.trim() || "自定义 / 算子验证",
    description: document.getElementById("operator-upload-description")?.value.trim() || "自定义算子。",
    owner: scope === "team" ? "团队空间" : "jing",
    status: "可用",
  });
  closeModal();
  toast("算子已上传");
  render();
}

function deleteOperatorAsset(id) {
  const index = privateOperatorResources.findIndex((item) => item.id === id);
  if (index >= 0) privateOperatorResources.splice(index, 1);
  closeModal();
  toast("算子已删除");
  render();
}

function imageAssetScopeOptions() {
  return [
    { key: "public", label: "预置镜像" },
    { key: isTeamWorkspace() ? "team" : "mine", label: isTeamWorkspace() ? "团队镜像" : "我的镜像" },
  ];
}

function normalizeImageAssetState() {
  const validScopes = imageAssetScopeOptions().map((item) => item.key);
  if (!validScopes.includes(state.imageAsset.scope)) state.imageAsset.scope = "public";
  const maxPage = Math.max(1, Math.ceil(filteredImageAssets().length / state.imageAsset.pageSize));
  if (state.imageAsset.page > maxPage) state.imageAsset.page = maxPage;
  if (state.imageAsset.page < 1) state.imageAsset.page = 1;
}

function imagesAssetPage() {
  normalizeImageAssetState();
  const helper = isTeamWorkspace() ? "查看平台预置镜像，管理团队可用镜像。" : "查看平台预置镜像，管理你上传的自定义镜像。";
  const scope = state.imageAsset.scope;
  const canManage = scope === "mine" || (scope === "team" && canShowTeamManagement());
  const action = canManage ? `<button class="btn primary" onclick="openImageUploadModal()">${scope === "team" ? "上传团队镜像" : "上传我的镜像"}</button>` : "";
  return shell(`
    ${pageHead("镜像", helper, action)}
    <div class="card">
      <div class="segmented asset-scope-tabs" style="margin-bottom:12px">${imageAssetScopeOptions().map((item) => `<button class="${scope === item.key ? "active" : ""}" onclick="setImageAssetScope('${item.key}')">${item.label}</button>`).join("")}</div>
      ${imageAssetFilters()}
      ${scope === "public" ? publicImageTable() : privateImageTable(scope)}
      ${imageAssetPagination()}
    </div>
  `, "assets-images");
}

function imageAssetFilters() {
  const filters = state.imageAsset;
  return `<div class="filters"><div class="input-group task-search"><input value="${filters.queryDraft}" oninput="state.imageAsset.queryDraft=this.value" onkeydown="if(event.key==='Enter'){event.preventDefault();applyImageAssetSearch()}" placeholder="搜索镜像名称" /><button class="btn" type="button" onclick="applyImageAssetSearch()">搜索</button></div><select onchange="setImageAssetFilter('framework',this.value)">${filterOptions(imageFrameworkOptions(), filters.framework)}</select></div>`;
}

function imageFrameworkOptions() {
  return ["全部框架", "PyTorch", "TensorFlow", "MindSpore", "PaddlePaddle"];
}

function imageRowsForCurrentScope() {
  return imageAssetRows.filter((row) => row.scope === state.imageAsset.scope);
}

function filteredImageAssets() {
  const { query, framework } = state.imageAsset;
  const keyword = query.trim().toLowerCase();
  return imageRowsForCurrentScope()
    .filter((row) => framework === "全部框架" || row.framework === framework)
    .filter((row) => !keyword || `${row.name} ${row.version} ${row.framework} ${row.scenes} ${row.tags || ""}`.toLowerCase().includes(keyword));
}

function pagedImageAssets() {
  const start = (state.imageAsset.page - 1) * state.imageAsset.pageSize;
  return filteredImageAssets().slice(start, start + state.imageAsset.pageSize);
}

function publicImageTable() {
  const rows = pagedImageAssets();
  return `<div class="table-wrap"><table><thead><tr><th>镜像名称</th><th>镜像版本</th><th>框架</th><th>适用场景</th><th>支持资源</th><th>状态</th><th>更新时间</th><th>操作</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${row.name}</td><td>${row.version}</td><td>${row.framework}</td><td>${row.scenes}</td><td>${row.resources}</td><td>${statusBadge(row.status)}</td><td>${row.updatedAt}</td><td><button class="btn text" onclick="confirmImageDownload('${row.id}')">下载</button></td></tr>`).join("") || `<tr><td colspan="8"><div class="empty">暂无匹配的镜像</div></td></tr>`}</tbody></table></div>`;
}

function confirmImageDownload(id) {
  const row = imageAssetRows.find((item) => item.id === id && item.scope === "public");
  if (row) confirmBox(`确认下载镜像“${row.name}:${row.version}”？`, "closeModal();toast('镜像已开始下载')");
}

function privateImageTable(scope) {
  const rows = pagedImageAssets();
  const canManage = scope === "mine" || (scope === "team" && canShowTeamManagement());
  return `<div class="table-wrap"><table><thead><tr><th>镜像名称</th><th>镜像版本</th><th>来源</th><th>框架</th><th>适用场景</th><th>标签</th><th>镜像大小</th><th>镜像描述</th><th>状态</th><th>创建时间</th><th>操作</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${row.name}</td><td>${row.version}</td><td>${row.origin}</td><td>${row.framework}</td><td>${row.scenes}</td><td>${row.tags}</td><td>${row.size}</td><td>${row.description}</td><td>${statusBadge(row.status)}</td><td>${row.createdAt}</td><td>${canManage ? imageAssetActions(row) : "-"}</td></tr>`).join("") || `<tr><td colspan="11"><div class="empty">暂无匹配的镜像</div></td></tr>`}</tbody></table></div>`;
}

function imageAssetActions(row) {
  return `<button class="btn text" onclick="openImageEditModal('${row.id}')">编辑</button><button class="btn text" onclick="copyImageAsset('${row.id}')">复制</button><button class="btn text" onclick="confirmBox('删除后该镜像将无法继续用于新建验证任务，确认删除吗？','deleteImageAsset(\\'${row.id}\\')')">删除</button>`;
}

function imageAssetPagination() {
  const total = filteredImageAssets().length;
  const totalPages = Math.max(1, Math.ceil(total / state.imageAsset.pageSize));
  return `<div class="pagination"><button class="btn" ${state.imageAsset.page <= 1 ? "disabled" : ""} onclick="setImageAssetPage(${state.imageAsset.page - 1})">上一页</button><span>第 ${state.imageAsset.page} / ${totalPages} 页</span><button class="btn" ${state.imageAsset.page >= totalPages ? "disabled" : ""} onclick="setImageAssetPage(${state.imageAsset.page + 1})">下一页</button><select onchange="setImageAssetPageSize(this.value)">${filterOptions(["10", "20", "50"], String(state.imageAsset.pageSize))}</select><span>条 / 页</span><input type="number" min="1" max="${totalPages}" value="${state.imageAsset.page}" onkeydown="if(event.key==='Enter'){event.preventDefault();setImageAssetPage(this.value)}" /><button class="btn" onclick="setImageAssetPage(this.previousElementSibling.value)">跳转</button></div>`;
}

function setImageAssetScope(scope) {
  state.imageAsset.scope = scope;
  state.imageAsset.queryDraft = "";
  state.imageAsset.query = "";
  state.imageAsset.framework = "全部框架";
  state.imageAsset.page = 1;
  render();
}

function setImageAssetFilter(key, value) {
  state.imageAsset[key] = value;
  state.imageAsset.page = 1;
  render();
}

function applyImageAssetSearch() {
  state.imageAsset.query = state.imageAsset.queryDraft.trim();
  state.imageAsset.page = 1;
  render();
}

function setImageAssetPage(page) {
  state.imageAsset.page = Number(page) || 1;
  render();
}

function setImageAssetPageSize(size) {
  state.imageAsset.pageSize = Number(size) || 10;
  state.imageAsset.page = 1;
  render();
}

function openImageUploadModal() {
  const scope = state.imageAsset.scope === "team" ? "team" : "mine";
  const title = scope === "team" ? "上传团队镜像" : "上传我的镜像";
  modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal form"><div class="row between"><h3>${title}</h3><button class="btn text" onclick="closeModal()">关闭</button></div><div class="field"><label>镜像名称 *</label><input id="image-upload-name" value="custom-runtime" /></div><div class="field"><label>镜像版本 *</label><input id="image-upload-version" value="v1.0" /></div><div class="field"><label>AI 框架 *</label><select id="image-upload-framework"><option>PyTorch</option><option>TensorFlow</option><option>MindSpore</option><option>PaddlePaddle</option></select></div><div class="field"><label>适用场景 *</label><input id="image-upload-scenes" value="推理验证" /></div><div class="field"><label>标签</label><input id="image-upload-tags" value="自定义 / 推理" /></div><div class="field"><label>镜像描述</label><textarea id="image-upload-description">用于验证任务的自定义镜像环境</textarea></div><div class="field"><label>镜像文件 / 镜像地址 *</label><input id="image-upload-address" value="registry.example.com/deepverify/custom-runtime:v1.0" /></div><button class="btn primary" onclick="submitImageUpload('${scope}')">提交校验</button></div></div>`;
}

function submitImageUpload(scope) {
  const name = document.getElementById("image-upload-name").value.trim() || "custom-runtime";
  const framework = document.getElementById("image-upload-framework").value;
  const isAscend = framework === "MindSpore";
  imageAssetRows.push({
    id: `IMG-${scope.toUpperCase()}-${Date.now()}`,
    scope,
    name,
    version: document.getElementById("image-upload-version").value.trim() || "v1.0",
    origin: scope === "team" ? "团队上传" : "上传",
    framework,
    runtime: isAscend ? "CANN 8.0 / Python 3.10" : "CUDA 12.4 / Python 3.10",
    chipVendor: isAscend ? "昇腾" : "NVIDIA",
    scenes: document.getElementById("image-upload-scenes").value.trim() || "推理验证",
    resources: isAscend ? "昇腾 NPU" : "NVIDIA GPU",
    tags: document.getElementById("image-upload-tags").value.trim() || "-",
    size: "待校验",
    description: document.getElementById("image-upload-description").value.trim() || "-",
    status: "校验中",
    reason: "镜像依赖校验中",
    createdAt: "2026-06-05",
  });
  ensureModelTaskState();
  closeModal();
  toast("镜像已提交校验");
  render();
}

function openImageEditModal(id) {
  const row = imageAssetRows.find((item) => item.id === id);
  if (!row) return;
  modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal form"><div class="row between"><h3>编辑镜像</h3><button class="btn text" onclick="closeModal()">关闭</button></div><div class="field"><label>镜像名称</label><input id="image-edit-name" value="${row.name}" /></div><div class="field"><label>适用场景</label><input id="image-edit-scenes" value="${row.scenes}" /></div><div class="field"><label>标签</label><input id="image-edit-tags" value="${row.tags || ""}" /></div><div class="field"><label>镜像描述</label><textarea id="image-edit-description">${row.description || ""}</textarea></div><div class="permission">镜像版本、来源、框架、镜像大小和创建时间不可编辑。</div><button class="btn primary" onclick="saveImageEdit('${id}')">保存</button></div></div>`;
}

function saveImageEdit(id) {
  const row = imageAssetRows.find((item) => item.id === id);
  if (!row) return;
  row.name = document.getElementById("image-edit-name").value.trim() || row.name;
  row.scenes = document.getElementById("image-edit-scenes").value.trim() || row.scenes;
  row.tags = document.getElementById("image-edit-tags").value.trim() || row.tags;
  row.description = document.getElementById("image-edit-description").value.trim() || row.description;
  ensureModelTaskState();
  closeModal();
  toast("镜像信息已保存");
  render();
}

function copyImageAsset(id) {
  const row = imageAssetRows.find((item) => item.id === id);
  if (!row) return;
  imageAssetRows.push({ ...row, id: `IMG-COPY-${Date.now()}`, name: `${row.name}-copy`, origin: "复制", createdAt: "2026-06-05" });
  ensureModelTaskState();
  toast("镜像已复制");
  render();
}

function deleteImageAsset(id) {
  const index = imageAssetRows.findIndex((item) => item.id === id);
  if (index >= 0) imageAssetRows.splice(index, 1);
  ensureModelTaskState();
  closeModal();
  toast("镜像已删除");
  render();
}

function datasetScopeOptions() {
  return [
    { key: "public", label: "预置数据集" },
    { key: isTeamWorkspace() ? "team" : "mine", label: isTeamWorkspace() ? "团队数据集" : "我的数据集" },
  ];
}

function normalizeDatasetAssetState() {
  const validScopes = datasetScopeOptions().map((item) => item.key);
  if (!validScopes.includes(state.datasetAsset.scope)) state.datasetAsset.scope = "public";
  const totalPages = Math.max(1, Math.ceil(filteredDatasetAssets().length / state.datasetAsset.pageSize));
  state.datasetAsset.page = Math.min(totalPages, Math.max(1, Number(state.datasetAsset.page) || 1));
}

function datasetRowsForCurrentScope() {
  return modelTaskResources.datasets.filter((item) => item.source === state.datasetAsset.scope);
}

function filteredDatasetAssets() {
  const query = state.datasetAsset.query.trim().toLowerCase();
  return datasetRowsForCurrentScope().filter((item) => {
    const searchable = state.datasetAsset.scope === "public" ? item.name : `${item.name} ${item.tags || ""}`;
    const matchesQuery = !query || searchable.toLowerCase().includes(query);
    const matchesLanguage = state.datasetAsset.language === "全部语言"
      || (state.datasetAsset.language === "中文" && ["中文", "中英双语"].includes(item.language))
      || (state.datasetAsset.language === "英文" && ["英语", "中英双语"].includes(item.language));
    const matchesTask = state.datasetAsset.task === "全部任务类型" || state.datasetAsset.task === item.task;
    return matchesQuery && matchesLanguage && matchesTask;
  });
}

function pagedDatasetAssets() {
  const start = (state.datasetAsset.page - 1) * state.datasetAsset.pageSize;
  return filteredDatasetAssets().slice(start, start + state.datasetAsset.pageSize);
}

function canManageCurrentDatasetScope() {
  if (state.datasetAsset.scope === "mine") return true;
  return state.datasetAsset.scope === "team" && canShowTeamManagement();
}

function datasetsAssetPage() {
  normalizeDatasetAssetState();
  const scope = state.datasetAsset.scope;
  const canCreate = scope !== "public" && canManageCurrentDatasetScope();
  const action = canCreate ? `<button class="btn primary" type="button" onclick="openDatasetCreateModal()">${scope === "team" ? "上传团队数据集" : "上传我的数据集"}</button>` : "";
  return shell(`
    ${pageHead("数据集", scope === "public" ? "查看平台预置的标准数据集与验证基准。" : "管理当前工作空间可用的数据集。", action)}
    <div class="card dataset-page-card">
      <div class="segmented asset-scope-tabs dataset-scope-tabs">${datasetScopeOptions().map((item) => `<button class="${scope === item.key ? "active" : ""}" onclick="setDatasetAssetScope('${item.key}')">${item.label}</button>`).join("")}</div>
      ${datasetAssetSearchBar()}
      ${scope === "public" ? publicDatasetTable() : privateDatasetTable()}
      ${datasetAssetPagination()}
    </div>
  `, "assets-datasets");
}

function datasetAssetSearchBar() {
  const filters = state.datasetAsset;
  const placeholder = filters.scope === "public" ? "输入数据集名称进行搜索" : "输入数据集名称、标签进行搜索";
  return `<div class="filters dataset-filters">
    <div class="input-group task-search"><input value="${filters.queryDraft}" oninput="state.datasetAsset.queryDraft=this.value" onkeydown="if(event.key==='Enter'){event.preventDefault();applyDatasetAssetSearch()}" placeholder="${placeholder}" /><button class="btn" type="button" onclick="applyDatasetAssetSearch()">搜索</button></div>
    ${filters.scope === "public" ? `<select onchange="setDatasetAssetFilter('language',this.value)">${filterOptions(["全部语言", "中文", "英文"], filters.language)}</select><select onchange="setDatasetAssetFilter('task',this.value)">${filterOptions(["全部任务类型", "文本生成", "多模态", "语音识别", "检索匹配", "科学计算"], filters.task)}</select>` : ""}
  </div>`;
}

function datasetNameCell(row) {
  return `<button class="btn text dataset-name-link" type="button" onclick="openDatasetDetail('${row.id}')">${row.name}</button><div class="muted dataset-id">${row.id}</div>`;
}

function publicDatasetTable() {
  const rows = pagedDatasetAssets();
  return `<div class="table-wrap dataset-table-wrap"><table class="dataset-table"><thead><tr><th>数据集名称 / ID</th><th>类型</th><th>任务</th><th>语言</th><th>大小</th><th>数据量</th><th>发布方</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${datasetNameCell(row)}</td><td>${row.type}</td><td>${row.task}</td><td>${row.language}</td><td>${row.storageSize}</td><td>${row.size}</td><td>${row.publisher}</td></tr>`).join("") || `<tr><td colspan="7"><div class="empty">暂无匹配的数据集</div></td></tr>`}</tbody></table></div>`;
}

function privateDatasetTable() {
  const rows = pagedDatasetAssets();
  const canManage = canManageCurrentDatasetScope();
  return `<div class="table-wrap dataset-table-wrap"><table class="dataset-table dataset-private-table"><thead><tr><th>数据集名称 / ID</th><th>内容类型</th><th>可见范围</th><th>所有者</th><th>最新版本</th><th>标签</th><th>创建时间</th><th>修改时间</th><th>操作</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${datasetNameCell(row)}</td><td>${row.type}</td><td>${row.visible}</td><td>${row.owner}</td><td>${row.version}</td><td>${row.tags}</td><td>${row.createdAt}</td><td>${row.updatedAt}</td><td class="dataset-actions"><button class="btn text" onclick="confirmDatasetDownload('${row.id}')">下载</button>${canManage ? `<button class="btn text" onclick="confirmDatasetCopy('${row.id}')">复制</button><button class="btn text danger-text" onclick="confirmDatasetDelete('${row.id}')">删除</button>` : ""}</td></tr>`).join("") || `<tr><td colspan="9"><div class="empty">暂无匹配的数据集</div></td></tr>`}</tbody></table></div>`;
}

function datasetAssetPagination() {
  const total = filteredDatasetAssets().length;
  const totalPages = Math.max(1, Math.ceil(total / state.datasetAsset.pageSize));
  return `<div class="pagination"><button class="btn" ${state.datasetAsset.page <= 1 ? "disabled" : ""} onclick="setDatasetAssetPage(${state.datasetAsset.page - 1})">上一页</button><span>第 ${state.datasetAsset.page} / ${totalPages} 页</span><button class="btn" ${state.datasetAsset.page >= totalPages ? "disabled" : ""} onclick="setDatasetAssetPage(${state.datasetAsset.page + 1})">下一页</button><select onchange="setDatasetAssetPageSize(this.value)">${filterOptions(["10", "20", "50"], String(state.datasetAsset.pageSize))}</select><span>条 / 页</span><input type="number" min="1" max="${totalPages}" value="${state.datasetAsset.page}" onkeydown="if(event.key==='Enter'){event.preventDefault();setDatasetAssetPage(this.value)}" /><button class="btn" onclick="setDatasetAssetPage(this.previousElementSibling.value)">跳转</button></div>`;
}

function setDatasetAssetScope(scope) {
  state.datasetAsset.scope = scope;
  state.datasetAsset.queryDraft = "";
  state.datasetAsset.query = "";
  state.datasetAsset.language = "全部语言";
  state.datasetAsset.task = "全部任务类型";
  state.datasetAsset.page = 1;
  render();
}

function setDatasetAssetFilter(key, value) {
  state.datasetAsset[key] = value;
  state.datasetAsset.page = 1;
  render();
}

function applyDatasetAssetSearch() {
  state.datasetAsset.query = state.datasetAsset.queryDraft.trim();
  state.datasetAsset.page = 1;
  render();
}

function setDatasetAssetPage(page) {
  const totalPages = Math.max(1, Math.ceil(filteredDatasetAssets().length / state.datasetAsset.pageSize));
  state.datasetAsset.page = Math.min(totalPages, Math.max(1, Number(page) || 1));
  render();
}

function setDatasetAssetPageSize(size) {
  state.datasetAsset.pageSize = Number(size) || 10;
  state.datasetAsset.page = 1;
  render();
}

function openDatasetDetail(id) {
  state.datasetAsset.activeDatasetId = id;
  setRoute("dataset-detail");
}

function datasetDetailPage() {
  const visibleRows = modelTaskResources.datasets.filter(workspaceCanUseResource);
  const row = visibleRows.find((item) => item.id === state.datasetAsset.activeDatasetId)
    || visibleRows.find((item) => item.source === state.datasetAsset.scope)
    || visibleRows[0];
  const sourceText = sourceLabel(row.source, "dataset");
  const ownerLabel = row.source === "public" ? "发布方" : "所有者";
  const ownerValue = row.source === "public" ? row.publisher : row.owner;
  return shell(`
    ${pageHead(row.name, "查看数据集基本信息与描述。", `<button class="btn" onclick="setRoute('assets-datasets')">返回数据集列表</button>`)}
    <div class="grid cols-2 dataset-detail-grid">
      <div class="card"><h3>基本信息</h3><table>
        <tr><th>数据集名称</th><td>${row.name}</td><th>数据集 ID</th><td>${row.id}</td></tr>
        <tr><th>来源</th><td>${sourceText}</td><th>内容类型</th><td>${row.type}</td></tr>
        <tr><th>任务</th><td>${row.task}</td><th>语言</th><td>${row.language}</td></tr>
        <tr><th>大小</th><td>${row.storageSize}</td><th>数据量</th><td>${row.size}</td></tr>
        <tr><th>${ownerLabel}</th><td>${ownerValue}</td><th>最新版本</th><td>${row.version || "-"}</td></tr>
        <tr><th>可见范围</th><td>${row.source === "public" ? "平台预置" : row.visible}</td><th>标签</th><td>${row.tags || "-"}</td></tr>
        <tr><th>创建时间</th><td>${row.createdAt || "-"}</td><th>修改时间</th><td>${row.updatedAt || "-"}</td></tr>
      </table></div>
      <div class="card"><h3>数据集描述</h3><p>${row.description || "暂无描述。"}</p></div>
    </div>
  `, "assets-datasets");
}

function openDatasetCreateModal() {
  if (!canManageCurrentDatasetScope()) return;
  const scope = state.datasetAsset.scope;
  modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal form dataset-modal"><div class="row between"><h3>${scope === "team" ? "上传团队数据集" : "上传我的数据集"}</h3><button class="btn text" onclick="closeModal()">关闭</button></div>
    <div class="field"><label>数据集名称 *</label><input id="dataset-create-name" value="新建验证数据集" /></div>
    <div class="field"><label>内容类型 *</label><select id="dataset-create-type">${optionList(["图片", "文本", "音频", "视频", "表格", "通用"])}</select></div>
    <div class="field"><label>任务 *</label><select id="dataset-create-task">${optionList(["文本生成", "多模态", "语音识别", "检索匹配", "科学计算"])}</select></div>
    <div class="field"><label>语言 *</label><select id="dataset-create-language">${optionList(["中文", "英语", "中英双语"])}</select></div>
    <div class="field"><label>可见范围</label><select id="dataset-create-visible">${scope === "team" ? `<option>当前团队</option>` : `<option>仅自己可见</option><option>已分享给团队</option>`}</select></div>
    <div class="field"><label>标签</label><input id="dataset-create-tags" value="自定义 / 验证" /></div>
    <div class="field"><label>数据文件</label><input id="dataset-create-file" type="file" /></div>
    <div class="field"><label>描述</label><textarea id="dataset-create-description">用于模型验证的自定义数据集。</textarea></div>
    <button class="btn primary" type="button" onclick="submitDatasetCreate('${scope}')">上传</button>
  </div></div>`;
}

function submitDatasetCreate(scope) {
  const name = document.getElementById("dataset-create-name")?.value.trim();
  if (!name) {
    toast("请输入数据集名称");
    return;
  }
  const task = document.getElementById("dataset-create-task")?.value || "文本生成";
  const sceneMap = { 文本生成: "大语言", 多模态: "多模态", 语音识别: "音频", 检索匹配: "检索匹配", 科学计算: "科学计算" };
  const now = "2026-06-11";
  modelTaskResources.datasets.push({
    id: `dataset-${scope}-${Date.now()}`,
    source: scope,
    name,
    type: document.getElementById("dataset-create-type")?.value || "文本",
    scene: sceneMap[task] || "大语言",
    task,
    language: document.getElementById("dataset-create-language")?.value || "中文",
    storageSize: "待统计",
    size: "待统计",
    visible: document.getElementById("dataset-create-visible")?.value || (scope === "team" ? "当前团队" : "仅自己可见"),
    owner: scope === "team" ? "浦鉴 Lab" : "jing",
    version: "v1.0",
    tags: document.getElementById("dataset-create-tags")?.value.trim() || "-",
    createdAt: now,
    updatedAt: now,
    description: document.getElementById("dataset-create-description")?.value.trim() || "-",
    status: "可用",
  });
  closeModal();
  ensureModelTaskState();
  toast("数据集已上传");
  render();
}

function confirmDatasetDownload(id) {
  const row = modelTaskResources.datasets.find((item) => item.id === id);
  if (row) confirmBox(`确认下载数据集“${row.name}”？`, `closeModal();toast('数据集已开始下载')`);
}

function confirmDatasetCopy(id) {
  const row = modelTaskResources.datasets.find((item) => item.id === id);
  if (row) confirmBox(`确认复制数据集“${row.name}”？`, `copyDatasetAsset('${id}')`);
}

function copyDatasetAsset(id) {
  const row = modelTaskResources.datasets.find((item) => item.id === id);
  if (!row || row.source === "public" || !canManageCurrentDatasetScope()) return;
  const now = "2026-06-11";
  modelTaskResources.datasets.push({ ...row, id: `dataset-${row.source}-${Date.now()}`, name: `${row.name}-copy`, version: "v1.0", createdAt: now, updatedAt: now });
  closeModal();
  ensureModelTaskState();
  toast("数据集已复制");
  render();
}

function confirmDatasetDelete(id) {
  const row = modelTaskResources.datasets.find((item) => item.id === id);
  if (row) confirmBox(`删除后该数据集将无法继续用于新建验证任务，确认删除“${row.name}”？`, `deleteDatasetAsset('${id}')`);
}

function deleteDatasetAsset(id) {
  const index = modelTaskResources.datasets.findIndex((item) => item.id === id);
  if (index < 0 || modelTaskResources.datasets[index].source === "public" || !canManageCurrentDatasetScope()) return;
  modelTaskResources.datasets.splice(index, 1);
  closeModal();
  ensureModelTaskState();
  normalizeDatasetAssetState();
  toast("数据集已删除");
  render();
}

function assetsPage() {
  if (state.assetType === "datasets") return datasetsAssetPage();
  if (state.assetType === "models") return modelsAssetPage();
  if (state.assetType === "images") return imagesAssetPage();
  if (state.assetType === "operators") return operatorsAssetPage();
  normalizeAssetScope();
  normalizeAssetFilters();
  const assetName = assetDisplayName();
  const scopeDescription = isTeamWorkspace()
    ? `查看团队可用${assetName}，用于验证任务配置。`
    : `管理个人${assetName}，并按需共享给团队协作使用。`;
  const title = assetTypes[state.assetType];
  return shell(`
    ${pageHead(`${title}管理`, scopeDescription, `<button class="btn primary" onclick="assetUploadModal()">新建 / 上传</button>`)}
    <div class="card">
      <div class="segmented asset-scope-tabs" style="margin-bottom:12px">${assetScopeOptionsForType().map((scope) => `<button class="${state.assetScope === scope.key ? "active" : ""}" onclick="setAssetScope('${scope.key}')">${scope.label}</button>`).join("")}</div>
      ${assetFiltersBar()}
      ${assetTable()}
    </div>
  `, assetRoutes[state.assetType] || "assets-datasets");
}

function assetTable() {
  const scopeText = { public: "预置资源", mine: "我的资源", team: "团队资源" }[state.assetScope];
  const canShare = state.workspace === "personal" && state.assetScope === "mine";
  const rows = filteredAssetRows();
  return `<div class="table-wrap"><table id="asset-table"><thead><tr><th>资产名称</th><th>类型</th><th>来源</th><th>审核状态</th><th>标签</th><th>操作</th></tr></thead>
  <tbody>${rows.map((row) => `<tr><td>${row.name}</td><td>${assetTypes[state.assetType]}</td><td>${scopeText}</td><td>${statusBadge(row.status || "已生成")}</td><td>${row.tag}</td><td><button class="btn text" onclick="setRoute('asset-detail')">详情</button>${canShare ? `<button class="btn text" onclick="assetShareModal()">共享给团队</button>` : ""}${state.assetScope !== "public" ? `<button class="btn text" onclick="confirmBox('确认删除该资产？')">删除</button>` : ""}</td></tr>`).join("") || `<tr><td colspan="6"><div class="empty">当前范围暂无资产</div></td></tr>`}</tbody></table></div>`;
}

function assetDisplayName() {
  return { models: "模型", datasets: "数据集", images: "镜像", operators: "算子" }[state.assetType];
}

function assetRowsForCurrentView() {
  const source = state.assetScope;
  if (state.assetType === "models") {
    return modelTaskResources.models
      .filter((item) => item.source === source)
      .map((item) => ({ name: item.name, status: item.status, category: item.scene, tags: [item.support.includes("训练") ? "训练" : "", item.support.includes("推理") ? "推理" : ""].filter(Boolean), tag: `${item.scene} / ${item.support}` }));
  }
  if (state.assetType === "datasets") {
    return modelTaskResources.datasets
      .filter((item) => item.source === source)
      .map((item) => ({ name: item.name, status: item.status, category: item.scene, tags: [item.type], tag: `${item.scene} / ${item.type} / ${item.size}` }));
  }
  if (state.assetType === "images") {
    return imageTaskResources()
      .filter((item) => item.source === source)
      .map((item) => ({ name: item.name, status: item.status, category: item.category, tags: [item.framework], tag: `${item.category} / ${item.env}` }));
  }
  if (state.assetType === "operators" && source === "public") {
    return Object.entries(publicOperatorLibrary).flatMap(([category, items]) => items.map((item) => ({ name: item.name, status: "可用", category, tags: ["预置算子"], tag: category })));
  }
  return privateOperatorResources
    .filter((item) => item.source === source)
    .map((item) => ({ name: item.name, status: item.status, category: item.category, tags: [item.framework], tag: `${item.category} / ${item.framework}` }));
}

function assetKindForType() {
  return { models: "model", datasets: "dataset", images: "image", operators: "operator" }[state.assetType];
}

function assetScopeOptionsForType() {
  const kind = assetKindForType();
  const privateKey = workspacePrivateScope().key;
  return [
    { key: "public", label: sourceLabel("public", kind) },
    { key: privateKey, label: sourceLabel(privateKey, kind) },
  ];
}

function assetFiltersBar() {
  const filters = state.assetFilters;
  const categories = assetFilterOptions("category");
  const tags = assetFilterOptions("tag");
  return `<div class="filters"><div class="input-group task-search"><input value="${filters.queryDraft}" oninput="state.assetFilters.queryDraft=this.value" onkeydown="if(event.key==='Enter'){event.preventDefault();applyAssetSearch()}" placeholder="搜索${assetTypes[state.assetType].replace("资产", "名称")} / 关键词" /><button class="btn" type="button" onclick="applyAssetSearch()">搜索</button></div><select onchange="setAssetFilter('category',this.value)">${filterOptions(categories, filters.category)}</select><select onchange="setAssetFilter('tag',this.value)">${filterOptions(tags, filters.tag)}</select></div>`;
}

function assetFilterOptions(type) {
  const rows = assetRowsForCurrentView();
  if (type === "category") return ["全部分类", ...Array.from(new Set(rows.map((row) => row.category).filter(Boolean)))];
  return ["全部标签", ...Array.from(new Set(rows.flatMap((row) => row.tags || []).filter(Boolean)))];
}

function normalizeAssetFilters() {
  const categories = assetFilterOptions("category");
  const tags = assetFilterOptions("tag");
  if (!categories.includes(state.assetFilters.category)) state.assetFilters.category = "全部分类";
  if (!tags.includes(state.assetFilters.tag)) state.assetFilters.tag = "全部标签";
}

function filteredAssetRows() {
  const { query, category, tag } = state.assetFilters;
  const keyword = query.trim().toLowerCase();
  return assetRowsForCurrentView()
    .filter((row) => !keyword || `${row.name} ${row.tag} ${row.category}`.toLowerCase().includes(keyword))
    .filter((row) => category === "全部分类" || row.category === category)
    .filter((row) => tag === "全部标签" || (row.tags || []).includes(tag));
}

function setAssetScope(scope) {
  state.assetScope = scope;
  state.assetFilters.category = "全部分类";
  state.assetFilters.tag = "全部标签";
  render();
}

function setAssetFilter(key, value) {
  state.assetFilters[key] = value;
  render();
}

function applyAssetSearch() {
  state.assetFilters.query = state.assetFilters.queryDraft.trim();
  render();
}

function assetDetailPage() {
  const ownership = isTeamWorkspace()
    ? { owner: "团队资源", visible: "当前团队", note: "当前团队成员可在授权范围内查看和引用该资产。" }
    : { owner: "个人资产", visible: "仅自己可见", note: "你可以将该资产共享给团队，用于团队任务协作。" };
  return shell(`
    ${pageHead("资产详情", "查看资产基本信息、使用记录、审核状态和共享范围。", `<button class="btn" onclick="setRoute('assets')">返回资产列表</button>${!isTeamWorkspace() ? `<button class="btn" onclick="assetShareModal()">共享设置</button>` : ""}<button class="btn" onclick="setRoute('asset-review')">审核状态</button>`)}
    <div class="grid cols-2">
      <div class="card"><h3>基本信息</h3><table><tr><th>资产名称</th><td>Qwen2.5-72B</td></tr><tr><th>类型</th><td>模型资产</td></tr><tr><th>归属</th><td>${ownership.owner}</td></tr><tr><th>可见范围</th><td>${ownership.visible}</td></tr></table></div>
      <div class="card"><h3>使用记录</h3><table><tr><th>任务</th><th>时间</th></tr><tr><td>TASK-240601</td><td>2026-06-01</td></tr><tr><td>TASK-240528</td><td>2026-05-28</td></tr></table></div>
      <div class="card"><h3>共享与使用范围</h3><p>${ownership.note}</p></div>
      <div class="card"><h3>审核信息</h3><p>${statusBadge("已生成")} 审核通过，可进入指定可见范围。</p></div>
    </div>
  `, "assets");
}

function assetUploadModal() {
  const ownerText = isTeamWorkspace() ? "团队资源" : "我的资源";
  modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal form"><div class="row between"><h3>资产上传</h3><button class="btn text" onclick="closeModal()">关闭</button></div><div class="permission">当前上传后进入${ownerText}。</div><div class="field"><label>资产类型</label><select><option>模型</option><option>数据集</option><option>算子</option><option>镜像</option></select></div><div class="field"><label>名称</label><input value="PuJian-Lite" /></div><div class="field"><label>描述</label><textarea>用于平台验证的资产。</textarea></div><div class="field"><label>文件</label><input type="file" /></div><button class="btn primary" onclick="closeModal();toast('资产已保存为草稿')">上传</button></div></div>`;
}

function assetShareModal() {
  if (isTeamWorkspace()) {
    toast("请在个人工作空间的我的资源中发起授权共享");
    return;
  }
  modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal form"><div class="row between"><h3>资产共享设置</h3><button class="btn text" onclick="closeModal()">关闭</button></div><div class="field"><label>目标团队</label><select><option>浦鉴 Lab</option></select></div><div class="field"><label>共享权限</label><select><option>可查看 + 可引用</option><option>仅可查看</option></select></div><div class="permission">共享后，团队成员可按权限查看或引用该资产。</div><div class="row"><button class="btn primary" onclick="closeModal();toast('已共享给团队')">确认共享</button><button class="btn danger" onclick="closeModal();confirmBox('取消共享后团队成员不可在新任务中引用，确认取消？')">取消共享</button></div></div></div>`;
}

function assetReviewPage() {
  return shell(`${pageHead("资产审核状态", "展示草稿、待审核、审核通过、审核驳回等状态。", `<button class="btn" onclick="setRoute('assets')">返回资产</button>`)}<div class="card"><table><tr><th>状态</th><th>说明</th><th>可见范围</th></tr><tr><td>${statusBadge("待审核")}</td><td>已提交审核，等待管理员或系统审核。</td><td>仅个人</td></tr><tr><td>${statusBadge("已生成")}</td><td>审核通过，可进入指定可见范围。</td><td>指定团队 / 预置资产池</td></tr><tr><td>${statusBadge("失败")}</td><td>审核驳回，需要展示驳回原因。</td><td>不可上架</td></tr></table></div>`, "assets");
}

function accountPage() {
  return shell(`
    ${pageHead("个人账户管理", "查看和管理账户信息与安全设置。", `<button class="btn danger" onclick="logout()">退出登录</button>`)}
    <div class="grid cols-2 account-page">
      <div class="card form"><h3>个人资料</h3><div class="field"><label>头像</label><input type="file" accept="image/png,image/jpeg" /></div><div class="field"><label>昵称</label><input value="jing" /></div><div class="field"><label>姓名</label><input value="王京" /></div><div class="field"><label>公司 / 组织</label><input value="浦鉴 Lab" /></div><div class="field"><label>职位</label><input value="AI Infra Engineer" /></div><button class="btn primary" onclick="toast('个人资料已保存')">保存</button></div>
      <div class="card form"><h3>偏好设置</h3><div class="field"><label>语言</label><select><option>简体中文</option><option>English</option></select></div><div class="field"><label>主题</label><select><option>浅色</option><option>深色</option></select></div><div class="field"><label>默认工作空间</label><select><option>个人空间</option><option>团队空间</option></select></div><button class="btn primary" onclick="toast('偏好已保存')">保存</button></div>
      <div class="card form"><h3>安全设置</h3><div class="field"><label>绑定手机号</label><input value="13800000000" /></div><div class="field"><label>绑定邮箱</label><input value="jing@deepverify.ai" /></div><div class="field"><label>旧密码</label><input type="password" /></div><div class="field"><label>新密码</label><input type="password" /></div><div class="field"><label>确认新密码</label><input type="password" /></div><button class="btn primary" onclick="toast('安全设置已更新')">更新</button></div>
      <div class="card"><h3>登录管理</h3><p>${statusBadge("已生成")} 当前登录有效，记住登录状态 14 天。</p><p class="muted">最近登录：2026-06-04 11:30，地点：上海。</p></div>
    </div>
  `, "account");
}

function teamPage() {
  return shell(`
    ${pageHead("团队管理", "管理团队基础信息、成员邀请与团队可用资源。")}
    <div class="team-page team-layout">
      <div class="card team-info-card"><h3>团队信息</h3><div class="form"><div class="field"><label>团队名称</label><input value="浦鉴 Lab" /></div><div class="field"><label>团队描述</label><input value="软硬件全栈验证团队" /></div></div><div class="team-card-actions"><button class="btn primary" onclick="toast('团队信息已保存')">保存</button></div></div>
      <div class="card team-sharing-card"><h3>资源共享管理</h3><p>查看团队可用的模型、数据集、镜像和算子。</p><div class="team-card-actions"><button class="btn" onclick="showTeamAssets()">查看团队资产</button></div></div>
      <div class="card team-members-card"><h3>成员管理</h3><table><tr><th>成员</th><th>角色</th><th>操作</th></tr><tr><td>jing</td><td>团队拥有者</td><td></td></tr><tr><td>lin</td><td>团队管理员</td><td><button class="btn text">修改角色</button></td></tr><tr><td>chen</td><td>团队成员</td><td><button class="btn text" onclick="confirmBox('确认移除该成员？')">移除</button></td></tr></table></div>
      <div class="card team-invite-card"><h3>邀请</h3><div class="form"><div class="field"><label>手机号 / 邮箱 / 用户名</label><input value="new@deepverify.ai" /></div><div class="field"><label>角色</label><select><option>团队成员</option><option>团队管理员</option></select></div><div class="permission"><strong>当前邀请码</strong><span class="badge blue" style="margin-left:8px">PJ-LAB-8K26</span></div><div class="team-invite-actions"><button class="btn primary" onclick="toast('邀请已发送')">邀请成员</button><button class="btn" onclick="toast('邀请码 PJ-LAB-8K26 已复制')">复制邀请码</button><button class="btn" onclick="toast('邀请码已重置')">重置邀请码</button></div></div></div>
    </div>
  `, "team");
}

function showTeamAssets() {
  state.assetScope = "team";
  state.assetType = "models";
  setRoute("assets-models");
}

function externalJump(name) {
  toast(`${name} 为外部跳转入口，本原型不设计内部页面`);
}

function confirmBox(message, confirmAction = "closeModal();toast('操作已确认')") {
  modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal"><h3>请确认操作</h3><p>${message}</p><div class="row"><button class="btn danger" onclick="${confirmAction}">确认</button><button class="btn" onclick="closeModal()">取消</button></div></div></div>`;
}

function closeModal() {
  modalRoot.innerHTML = "";
}

function logout() {
  localStorage.removeItem("deepverify_authed");
  state.authed = false;
  state.authMode = "login";
  setRoute("login");
}

function render() {
  const current = route();
  if (current === "register") state.authMode = "register";
  if (current === "login") state.authMode = "login";
  const assetRouteMap = {
    "assets-datasets": "datasets",
    "assets-models": "models",
    "assets-images": "images",
    "assets-operators": "operators",
  };
  if (assetRouteMap[current]) state.assetType = assetRouteMap[current];
  normalizeAssetScope();
  ensureModelTaskState();
  ensureOperatorTaskState();
  if (current.startsWith("team") && !canShowTeamManagement()) {
    setRoute("home");
    return;
  }
  if (!state.authed && current !== "forgot") {
    app.innerHTML = authPage();
    return;
  }
  const pages = {
    login: authPage,
    forgot: forgotPage,
    home: homePage,
    tasks: tasksPage,
    "task-model": () => taskCreatePage("model"),
    ...Object.fromEntries(modelScenarios.map((item) => [`task-model-${item.key}`, modelTaskCreatePage])),
    "task-operator": () => taskCreatePage("operator"),
    "task-natural": naturalTaskPage,
    "task-detail": taskDetailPage,
    reports: reportsPage,
    "report-detail": reportDetailPage,
    "custom-report": customReportPage,
    compute: computePage,
    "compute-detail": computeDetailPage,
    "compute-onboard": computeOnboardPage,
    assets: assetsPage,
    "assets-datasets": assetsPage,
    "assets-models": assetsPage,
    "assets-images": assetsPage,
    "assets-operators": assetsPage,
    "preset-model-detail": presetModelDetailPage,
    "asset-detail": assetDetailPage,
    "dataset-detail": datasetDetailPage,
    "asset-review": assetReviewPage,
    account: accountPage,
    team: teamPage,
    "team-info": teamPage,
    "team-members": teamPage,
    "team-invites": teamPage,
    "team-sharing": teamPage,
  };
  app.innerHTML = (pages[current] || homePage)();
}

window.setRoute = setRoute;
window.switchWorkspace = switchWorkspace;
window.switchTeamRole = switchTeamRole;
window.toggleSidebar = toggleSidebar;
window.toggleNavGroup = toggleNavGroup;
window.setTaskFilter = setTaskFilter;
window.applyTaskSearch = applyTaskSearch;
window.applyTableSearch = applyTableSearch;
window.toggleTaskSelection = toggleTaskSelection;
window.toggleAllVisibleTasks = toggleAllVisibleTasks;
window.openTaskDetail = openTaskDetail;
window.confirmDeleteTask = confirmDeleteTask;
window.confirmBulkDeleteTasks = confirmBulkDeleteTasks;
window.deleteSelectedTasks = deleteSelectedTasks;
window.setReportFilter = setReportFilter;
window.applyReportSearch = applyReportSearch;
window.toggleReportSelection = toggleReportSelection;
window.toggleAllVisibleReports = toggleAllVisibleReports;
window.openReportDetail = openReportDetail;
window.confirmDownloadReport = confirmDownloadReport;
window.confirmBulkDownloadReports = confirmBulkDownloadReports;
window.downloadSelectedReports = downloadSelectedReports;
window.confirmDeleteReport = confirmDeleteReport;
window.confirmBulkDeleteReports = confirmBulkDeleteReports;
window.deleteSelectedReports = deleteSelectedReports;
window.setModelTask = setModelTask;
window.setModelTaskFilter = setModelTaskFilter;
window.liveDropdownSearch = liveDropdownSearch;
window.applyDropdownSearch = applyDropdownSearch;
window.clearDropdownSearch = clearDropdownSearch;
window.toggleModelTaskPicker = toggleModelTaskPicker;
window.resetPickerFilter = resetPickerFilter;
window.chooseModelTaskResource = chooseModelTaskResource;
window.setImageCategory = setImageCategory;
window.selectModelScenario = selectModelScenario;
window.setOperatorTask = setOperatorTask;
window.toggleOperatorPicker = toggleOperatorPicker;
window.chooseOperatorSelection = chooseOperatorSelection;
window.removeOperatorSelection = removeOperatorSelection;
window.setOperatorComputeSource = setOperatorComputeSource;
window.toggleOperatorComputePicker = toggleOperatorComputePicker;
window.setOperatorComputeVendor = setOperatorComputeVendor;
window.chooseOperatorCompute = chooseOperatorCompute;
window.toggleOperatorImagePicker = toggleOperatorImagePicker;
window.setOperatorImageFilter = setOperatorImageFilter;
window.chooseOperatorImage = chooseOperatorImage;
window.operatorTaskCreated = operatorTaskCreated;
window.openTagModal = openTagModal;
window.renderTagModal = renderTagModal;
window.updateTagDraft = updateTagDraft;
window.addTagDraft = addTagDraft;
window.removeTagDraft = removeTagDraft;
window.confirmTags = confirmTags;
window.mockLogin = mockLogin;
window.registerDone = registerDone;
window.taskCreated = taskCreated;
window.openNaturalDialog = openNaturalDialog;
window.customReportModal = customReportModal;
window.setAssetScope = setAssetScope;
window.setAssetFilter = setAssetFilter;
window.applyAssetSearch = applyAssetSearch;
window.setDatasetAssetScope = setDatasetAssetScope;
window.setDatasetAssetFilter = setDatasetAssetFilter;
window.applyDatasetAssetSearch = applyDatasetAssetSearch;
window.setDatasetAssetPage = setDatasetAssetPage;
window.setDatasetAssetPageSize = setDatasetAssetPageSize;
window.openDatasetDetail = openDatasetDetail;
window.openDatasetCreateModal = openDatasetCreateModal;
window.submitDatasetCreate = submitDatasetCreate;
window.confirmDatasetDownload = confirmDatasetDownload;
window.confirmDatasetCopy = confirmDatasetCopy;
window.copyDatasetAsset = copyDatasetAsset;
window.confirmDatasetDelete = confirmDatasetDelete;
window.deleteDatasetAsset = deleteDatasetAsset;
window.setComputeFilter = setComputeFilter;
window.applyComputeSearch = applyComputeSearch;
window.disableComputeResource = disableComputeResource;
window.submitComputeOnboard = submitComputeOnboard;
window.showTeamAssets = showTeamAssets;
window.setModelAssetScope = setModelAssetScope;
window.setModelAssetFilter = setModelAssetFilter;
window.applyModelAssetSearch = applyModelAssetSearch;
window.toggleModelParamPanel = toggleModelParamPanel;
window.setModelParamDraft = setModelParamDraft;
window.activateModelParamThumb = activateModelParamThumb;
window.setModelParamSlider = setModelParamSlider;
window.startModelParamDrag = startModelParamDrag;
window.adjustModelParamThumb = adjustModelParamThumb;
window.applyModelParamRange = applyModelParamRange;
window.resetModelParamRange = resetModelParamRange;
window.setModelAssetPage = setModelAssetPage;
window.setModelAssetPageSize = setModelAssetPageSize;
window.openModelCreateModal = openModelCreateModal;
window.submitModelCreate = submitModelCreate;
window.deleteModelAsset = deleteModelAsset;
window.openPresetModelDetail = openPresetModelDetail;
window.setOperatorAssetScope = setOperatorAssetScope;
window.setOperatorAssetFilter = setOperatorAssetFilter;
window.applyOperatorAssetSearch = applyOperatorAssetSearch;
window.setOperatorAssetPage = setOperatorAssetPage;
window.setOperatorAssetPageSize = setOperatorAssetPageSize;
window.openOperatorUploadModal = openOperatorUploadModal;
window.submitOperatorUpload = submitOperatorUpload;
window.deleteOperatorAsset = deleteOperatorAsset;
window.setImageAssetScope = setImageAssetScope;
window.setImageAssetFilter = setImageAssetFilter;
window.applyImageAssetSearch = applyImageAssetSearch;
window.setImageAssetPage = setImageAssetPage;
window.setImageAssetPageSize = setImageAssetPageSize;
window.confirmImageDownload = confirmImageDownload;
window.openImageUploadModal = openImageUploadModal;
window.submitImageUpload = submitImageUpload;
window.openImageEditModal = openImageEditModal;
window.saveImageEdit = saveImageEdit;
window.copyImageAsset = copyImageAsset;
window.deleteImageAsset = deleteImageAsset;
window.assetUploadModal = assetUploadModal;
window.assetShareModal = assetShareModal;
window.externalJump = externalJump;
window.confirmBox = confirmBox;
window.closeModal = closeModal;
window.logout = logout;
window.state = state;

window.addEventListener("hashchange", render);
document.addEventListener("input", (event) => {
  const input = event.target.closest("[data-dropdown-search]");
  if (!input) return;
  liveDropdownSearch(input.dataset.dropdownSearch, input.value);
});
document.addEventListener("keydown", (event) => {
  const input = event.target.closest("[data-dropdown-search]");
  if (!input || event.key !== "Enter") return;
  event.preventDefault();
  event.stopPropagation();
  applyDropdownSearch(input.dataset.dropdownSearch);
});
document.addEventListener("pointermove", updateModelParamFromPointer);
document.addEventListener("pointerup", stopModelParamDrag);
document.addEventListener("pointercancel", stopModelParamDrag);
render();
