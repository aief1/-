# 如果当时 - 平行人生模拟器

一个以“人生选择”为主题的互动叙事小产品。用户输入一个想重来的选择，补充当时的真实决定、相反选择和一些背景信息后，产品会生成三条平行人生路径：光亮的那条路、普通的那条路、有代价的那条路，并在最后给出一段温和的回到当下的反思。

> 这不是算命，也不是心理咨询，而是一次安静的想象力练习。

## 功能亮点

- 多步骤沉浸式流程：从遗憾输入、选择补充、背景信息到深度问题，引导用户逐步展开故事。
- 三条平行人生结果：分别呈现理想版本、现实版本和带有代价的版本，避免单一答案式叙事。
- 保留 Demo 模式：需要离线体验时，可改回内置示例数据，不依赖后端和 API Key。
- 可接入 AI 生成：通过 Flask 后端代理 DeepSeek Chat Completions API，避免在前端暴露 API Key。
- 情绪安全提示：结果页包含“仅供参考”和心理援助热线提示。
- 适配移动端：页面和样式对小屏设备做了响应式处理。

## 项目结构

```text
.
├── index.html          # 页面结构和产品流程容器
├── style.css           # 视觉样式、动画、响应式和打印样式
├── app.js              # 前端交互逻辑、Demo 数据、AI 调用和结果渲染
├── server.py           # Flask 后端，代理 DeepSeek API 请求
├── .env.example        # 本地环境变量模板
└── requirements.txt    # Python 后端依赖
```

## 快速开始

### 方式一：直接体验 Demo 模式

如果想不接后端、直接体验内置示例，可以把 `app.js` 中配置改为：

```js
DEMO_MODE: true
```

因此可以直接用浏览器打开 `index.html` 体验，无需安装依赖，也无需配置 API Key。

如果浏览器限制本地文件访问，也可以在项目目录启动一个静态服务器：

```bash
python -m http.server 8000
```

然后访问：

```text
http://localhost:8000
```

### 方式二：启用 DeepSeek AI 生成模式

当前项目已默认切换为 DeepSeek 生成模式：

```js
DEMO_MODE: false
MODEL: 'deepseek-chat'
API_ENDPOINT: '/api/generate'
```

1. 安装 Python 依赖：

```bash
pip install -r requirements.txt
```

2. 配置 DeepSeek API Key。

复制 `.env.example` 为 `.env`，并填入你的 Key：

```text
DEEPSEEK_API_KEY=你的_DeepSeek_API_Key
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions
```

也可以直接在终端设置环境变量：

PowerShell：

```powershell
$env:DEEPSEEK_API_KEY="你的_DeepSeek_API_Key"
```

macOS / Linux：

```bash
export DEEPSEEK_API_KEY="你的_DeepSeek_API_Key"
```

3. 启动 Flask 后端：

```bash
python server.py
```

默认后端地址为：

```text
http://localhost:5000
```

启动后直接访问这个地址即可看到完整页面，Flask 会同时提供前端页面和 API。

4. 确认前端配置。

当前 `app.js` 已配置为：

```js
const CONFIG = {
  DEMO_MODE: false,
  API_ENDPOINT: '/api/generate',
  MODEL: 'deepseek-chat',
  GENERATE_DURATION: 6000,
  TYPEWRITER_SPEED: 80,
  MIN_REGRET_LENGTH: 1,
};
```

5. 打开浏览器访问 `http://localhost:5000`。

## 后端接口

### 健康检查

```http
GET /api/health
```

返回示例：

```json
{
  "status": "ok",
  "provider": "deepseek",
  "model": "deepseek-chat",
  "api_key_configured": true
}
```

### 生成内容

```http
POST /api/generate
Content-Type: application/json
```

请求体示例：

```json
{
  "model": "deepseek-chat",
  "messages": [
    {
      "role": "user",
      "content": "请生成三条平行人生路径"
    }
  ],
  "temperature": 0.8,
  "max_tokens": 3000,
  "response_format": {
    "type": "json_object"
  }
}
```

后端会把请求转发到 DeepSeek API，并将结果返回给前端。

## 前端配置说明

`app.js` 顶部的 `CONFIG` 控制核心运行方式：

```js
const CONFIG = {
  DEMO_MODE: false,
  API_ENDPOINT: '/api/generate',
  MODEL: 'deepseek-chat',
  GENERATE_DURATION: 6000,
  TYPEWRITER_SPEED: 80,
  MIN_REGRET_LENGTH: 1,
};
```

字段说明：

- `DEMO_MODE`：是否使用内置 Demo 数据。设为 `true` 时不调用后端。
- `API_ENDPOINT`：AI 模式下的后端接口地址。
- `MODEL`：后端请求 DeepSeek 时使用的模型名。
- `GENERATE_DURATION`：生成页动画展示时长，单位为毫秒。
- `TYPEWRITER_SPEED`：首页打字机动画速度。
- `MIN_REGRET_LENGTH`：启用开始按钮所需的最少输入字符数。

## 使用流程

1. 在首页输入一个“如果当时”的遗憾或选择。
2. 填写现实中做出的选择，以及相反选择可能是什么。
3. 选择当时的年龄、性别、人生阶段、身边关系等背景信息。
4. 回答若干个更深入的问题，也可以跳过不想回答的问题。
5. 查看三条平行人生和最后的反思。
6. 可选择重新开始，或使用页面保存/打印结果。

## 隐私与安全

- Demo 模式下，内容仅在浏览器当前页面中处理，不会发送到后端。
- AI 模式下，用户输入会发送到本地 Flask 服务，再由后端转发给 DeepSeek API。
- `DEEPSEEK_API_KEY` 只应保存在服务端环境变量或本地 `.env` 中，不要写入前端代码或提交到仓库。
- 当前项目未接入数据库，也没有持久化保存用户输入。

## 开发备注

- 页面文案和结构主要在 `index.html` 中。
- 视觉风格、动画和移动端适配在 `style.css` 中。
- Demo 场景、问题池、页面切换、AI Prompt 和结果渲染逻辑在 `app.js` 中。
- 后端仅负责 API 代理和健康检查，不负责托管静态文件。

## 常见问题

### 为什么直接打开页面不能生成？

因为项目当前默认启用了 DeepSeek AI 模式，需要先启动 Flask 后端。如果想完全离线体验，可以把 `app.js` 里的 `DEMO_MODE` 改回 `true`。

### 为什么开启 AI 模式后请求失败？

请检查三点：

- `server.py` 是否已经启动。
- `DEEPSEEK_API_KEY` 是否已正确设置，或 `.env` 是否存在。
- `app.js` 中的 `API_ENDPOINT` 是否为 `/api/generate`，并且页面是否从 `http://localhost:5000` 打开。

### 为什么不能把 API Key 写在 `app.js` 里？

前端文件会被浏览器直接加载，任何人都可以看到其中内容。API Key 必须放在后端环境变量里，由 `server.py` 代为请求。

## 免责声明

本产品生成内容仅用于自我观察、创意写作和情绪整理，不构成心理咨询、医疗建议、法律建议或任何形式的现实决策依据。如果你正在经历严重心理困扰，请及时联系专业心理咨询师、医疗机构或当地紧急援助服务。
