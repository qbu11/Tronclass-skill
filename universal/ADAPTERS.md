# 兼容性说明

本项目的 SKILL.md 遵循 [claudeskills.io](https://claudeskill.io) 标准格式，以下四个 agent 框架均原生支持：

| 框架 | 安装方式 |
|------|---------|
| **Claude Code** | `cp -r tronclass-*/ ~/.claude/skills/` |
| **Codex CLI** | `cp -r tronclass-*/ ~/.claude/skills/` |
| **Hermes Agent** | `cp -r tronclass-*/ ~/.claude/skills/` |
| **OpenClaw** | `cp -r tronclass-*/ ~/.claude/skills/` |

安装方式完全相同——所有框架共享 `~/.claude/skills/` 目录和 SKILL.md 格式。

## tools.json（可选）

`tools.json` 提供 OpenAI function calling 格式的工具定义，适用于需要以编程方式调用 TronClass 工具的场景（如自定义 agent loop、非 claudeskills.io 框架）。

```python
import json, subprocess

with open('universal/tools.json', encoding='utf-8') as f:
    tools = json.load(f)

def execute_tool(name, params={}):
    tool = next(t for t in tools if t['function']['name'] == name)
    cmd = tool['execute']
    for k, v in params.items():
        cmd = cmd.replace(f'${{{k}}}', str(v))
    return subprocess.run(cmd, shell=True, capture_output=True,
                         text=True, timeout=15, encoding='utf-8', errors='replace').stdout.strip()
```

## SYSTEM_PROMPT.md（可选）

纯文本版工具说明，适用于不支持 SKILL.md 的 LLM agent 或手动 prompt engineering。
