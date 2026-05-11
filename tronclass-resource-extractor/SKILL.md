---
name: tronclass-resource-extractor
description: |
  从 TronClass 课程管理平台批量下载课件、章节资源。用 agent-browser 登录一次后
  session 持久化，纯 CLI 调 TronClass REST API。Use when the user sends a
  courses.cuc.edu.cn link, or mentions "课件下载", "下载资料", "TronClass", "畅课".
allowed-tools: Bash Read Write
---

# TronClass 课程资源提取

用 `agent-browser` 从 TronClass（畅课）批量下载课件。

## Requirements

- **agent-browser** (`npm install -g agent-browser`)
- **curl** (下载文件)
- Chromium 浏览器（agent-browser 自带，运行 `agent-browser install`）

## Onboarding（首次使用）

首次使用任何 tronclass skill 时，运行 setup 脚本：

```bash
bash ~/.claude/skills/tronclass-resource-extractor/scripts/setup.sh
```

或手动执行：

```bash
# 1. 安装 agent-browser（如果没有）
npm install -g agent-browser
agent-browser install

# 2. 登录 TronClass（会弹出浏览器窗口）
agent-browser --headed --session-name cuc open "https://courses.cuc.edu.cn"
# 填写学号密码
agent-browser --session-name cuc fill "input[placeholder*='手机号']" "学号"
agent-browser --session-name cuc fill "input[placeholder*='密码']" "密码"
agent-browser --session-name cuc snapshot -i  # 找登录按钮 ref
agent-browser --session-name cuc click @e8     # 点击登录

# 3. 验证
agent-browser --session-name cuc eval "fetch('/api/todos?no-intercept=true').then(r=>r.ok?'OK':'FAIL')"
```

登录后 `--session-name cuc` 持久化 cookie，后续不需要重复登录。

## 常量

- Session: `--session-name cuc`
- Session 失效时（API 返回 401）：重新执行 onboarding 登录步骤

## 工作流程

### 1. 提取 course_id

从 URL `https://courses.cuc.edu.cn/course/175509/courseware#/` 提取 `175509`。

### 2. 导航

```bash
agent-browser --session-name cuc open "https://courses.cuc.edu.cn/course/{course_id}/courseware"
```

### 3. 获取课件列表

```bash
agent-browser --session-name cuc eval "
  fetch('/api/course/{course_id}/coursewares?conditions={\"category\":null,\"itemsSortBy\":{\"predicate\":\"chapter\",\"reverse\":false}}')
  .then(r=>r.json())
  .then(d=>JSON.stringify(d.activities.map(a=>({id:a.id,title:a.title}))))
"
```

### 4. 获取文件引用

```bash
agent-browser --session-name cuc eval "
  fetch('/api/activities/{activity_id}/upload_references')
  .then(r=>r.json())
  .then(d=>JSON.stringify(d.references.map(r=>({name:r.name,upload_id:r.upload.id,size:r.upload.size}))))
"
```

### 5. 获取签名下载 URL

```bash
agent-browser --session-name cuc eval "
  fetch('/api/uploads/{upload_id}/url').then(r=>r.json()).then(d=>JSON.stringify(d))
"
```

### 6. 下载

签名 URL 不需要认证：

```bash
curl -sL -o "输出文件名" "签名URL"
```

### 7. 检查其他资源

```bash
# 章节
agent-browser --session-name cuc eval "fetch('/api/courses/{id}/modules').then(r=>r.json()).then(d=>JSON.stringify(d))"
# 所有活动
agent-browser --session-name cuc eval "fetch('/api/courses/{id}/activities?sub_course_id=0').then(r=>r.json()).then(d=>JSON.stringify(d))"
# 录播
agent-browser --session-name cuc eval "fetch('/api/courses/{id}/live-record').then(r=>r.json()).then(d=>JSON.stringify(d))"
```

## API 速查

| 用途 | 端点 |
|------|------|
| 课件列表 | `GET /api/course/{id}/coursewares?conditions=...` |
| 文件引用 | `GET /api/activities/{aid}/upload_references` |
| 签名下载 | `GET /api/uploads/{upload_id}/url` |
| 章节 | `GET /api/courses/{id}/modules` |
| 全部活动 | `GET /api/courses/{id}/activities?sub_course_id=0` |

## 输出

文件保存到 `C:/Obsidian_Vault/obsidian/{课程名}_课程资料/`

## 注意

- 签名 URL 的 token 有时效，过期需重新调 `/api/uploads/{id}/url`
- agent-browser eval 中的 fetch 自动带 cookie
