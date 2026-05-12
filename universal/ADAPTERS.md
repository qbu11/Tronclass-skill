# 各框架适配指南

## Claude Code（已内置）

直接使用 `tronclass-dashboard/`、`tronclass-homework/`、`tronclass-resource-extractor/` 目录下的 SKILL.md。

安装：
```bash
cp -r tronclass-*/  ~/.claude/skills/
```

## OpenAI Codex CLI

将 `universal/SYSTEM_PROMPT.md` 作为 system instructions 传入：

```bash
# 方式 1：在 AGENTS.md 中 include
cat universal/SYSTEM_PROMPT.md >> AGENTS.md

# 方式 2：作为 --instructions 参数
codex --instructions "$(cat universal/SYSTEM_PROMPT.md)" "帮我查看待办作业"
```

## Hermes Agent / 自定义 Agent

将 `universal/tools.json` 注册为工具集：

```python
import json, subprocess

with open('universal/tools.json') as f:
    tools = json.load(f)

def execute_tool(name, params):
    tool = next(t for t in tools if t['function']['name'] == name)
    cmd = tool['execute']
    for k, v in params.items():
        cmd = cmd.replace(f'${{{k}}}', str(v))
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return result.stdout.strip()

# 示例
courses = execute_tool('tronclass_get_courses', {})
todos = execute_tool('tronclass_get_todos', {})
```

对于 function calling 模式，直接用 `tools.json` 中的 `function` 字段作为 tools schema 传给 LLM。

## OpenClaw / Browser Relay

OpenClaw 本身通过 browser extension 控制浏览器。TronClass skills 可以通过两种方式集成：

```javascript
// 方式 1：直接在 OpenClaw 的 action 中调用 agent-browser
const { execSync } = require('child_process');

function tronclassAction(apiPath) {
  const result = execSync(
    `agent-browser --session-name cuc eval "fetch('${apiPath}').then(r=>r.json()).then(d=>JSON.stringify(d))"`,
    { encoding: 'utf-8' }
  );
  return JSON.parse(result.replace(/^"|"$/g, ''));
}

// 方式 2：把 SYSTEM_PROMPT.md 加到 OpenClaw 的 agent instructions 中
```

## MCP Server（未来）

如果需要 MCP 兼容，可以基于 `tools.json` 生成一个 MCP server：

```bash
# 使用 mcp-from-tools 工具（如果存在）
npx mcp-from-tools ./universal/tools.json --name tronclass
```

或手动实现一个简单的 stdio MCP server，对每个 tool 调用执行对应的 `execute` 命令。

## 通用原则

无论哪个框架，核心执行层都是：

```
LLM → 决定调用哪个工具 → shell 执行 agent-browser 命令 → 返回 JSON → LLM 解读
```

`agent-browser` 是唯一的运行时依赖。只要能执行 shell 命令，任何 agent 框架都能用。
