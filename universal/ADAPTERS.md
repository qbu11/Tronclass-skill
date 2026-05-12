# 框架适配指南

## Claude Code

直接用 `tronclass-*/SKILL.md`：

```bash
cp -r tronclass-*/ ~/.claude/skills/
node ~/.claude/skills/tronclass-resource-extractor/scripts/setup.js
```

## Codex CLI

把 `universal/SYSTEM_PROMPT.md` 加到项目的 `AGENTS.md`：

```bash
cat universal/SYSTEM_PROMPT.md >> AGENTS.md
```

或作为 instructions 传入：

```bash
codex --instructions "$(cat universal/SYSTEM_PROMPT.md)" "帮我查看待办作业"
```

## Hermes Agent

用 `universal/tools.json` 注册工具：

```python
import json, subprocess

with open('universal/tools.json', encoding='utf-8') as f:
    tools = json.load(f)

def execute_tool(name, params={}):
    tool = next(t for t in tools if t['function']['name'] == name)
    cmd = tool['execute']
    for k, v in params.items():
        cmd = cmd.replace(f'${{{k}}}', str(v))
    result = subprocess.run(cmd, shell=True, capture_output=True,
                           text=True, timeout=15, encoding='utf-8', errors='replace')
    return json.loads(result.stdout.strip().strip('"'))

# 用法
courses = execute_tool('tronclass_get_courses')
todos = execute_tool('tronclass_get_todos')
detail = execute_tool('tronclass_get_homework_detail', {'activity_id': 1129831})
```

对接 function calling：直接用每个 tool 的 `function` 字段作为 tools schema 传给 LLM，LLM 返回 tool_call 后执行对应的 `execute` 命令。
