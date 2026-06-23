---
name: tronclass-dashboard
description: |
  TronClass 课程总览面板：查看所有课程、待办作业、成绩、签到记录，自动提交作业并验证。
  Use when the user asks about courses, pending homework, deadlines, grades,
  attendance, academic status, or homework submission. Triggers on: "我的课程",
  "待办", "作业截止", "签到", "成绩", "课表", "ddl", "deadline", "提交作业",
  "提交", "交作业", "交一下", "submit".
allowed-tools: Bash Read Write
---

# TronClass 课程总览

通过 `agent-browser --session-name cuc` 调用 TronClass REST API。

## Requirements

- **agent-browser** (`npm install -g agent-browser`)
- Chromium（`agent-browser install`）

## Onboarding（首次使用）

```bash
node ~/.claude/skills/tronclass-resource-extractor/scripts/setup.js
```

或手动：`agent-browser --headed --session-name cuc open "https://courses.cuc.edu.cn"` → 登录 → 完成。

Session `cuc` 持久化 cookie，后续不需要重复登录。401/403 时重新登录即可。

## 常量

- 用户 ID: `3817518` / 学号: `202301063006`
- Session: `--session-name cuc`

## API

### 课程列表

```bash
agent-browser --session-name cuc eval "
  fetch('/api/user/recently-visited-courses').then(r=>r.json())
  .then(d=>JSON.stringify(d.visited_courses.map(c=>({id:c.id,name:c.name,dept:c.department.name})),null,2))
"
```

全量课程（含未访问的）：

```bash
agent-browser --session-name cuc eval "fetch('/api/my-courses').then(r=>r.json()).then(d=>JSON.stringify(d,null,2))"
```

### 待办作业

```bash
agent-browser --session-name cuc eval "
  fetch('/api/todos?no-intercept=true').then(r=>r.json())
  .then(d=>JSON.stringify(d.todo_list.map(t=>({title:t.title,course:t.course_name,type:t.type,due:t.end_time,course_id:t.course_id,id:t.id})),null,2))
"
```

截止日期标注：3天内=紧急, 7天内=注意, 7天+=正常

### 课程全部活动

```bash
agent-browser --session-name cuc eval "
  fetch('/api/courses/{course_id}/activities?sub_course_id=0').then(r=>r.json())
  .then(d=>{const t={};(d.activities||[]).forEach(a=>{t[a.type]=t[a.type]||[];t[a.type].push({id:a.id,title:a.title})});return JSON.stringify(t,null,2)})
"
```

类型：material=课件, homework=作业, forum=讨论, exam=测试

### 签到记录

```bash
agent-browser --session-name cuc eval "
  fetch('/api/courses/{course_id}/modules/rollcalls').then(r=>r.json())
  .then(d=>JSON.stringify(d.rollcalls.map(r=>({title:r.title,time:r.rollcall_time,type:r.type,status:r.status})),null,2))
"
```

### 课程成绩

```bash
agent-browser --session-name cuc eval "fetch('/api/courses/{course_id}/exam-scores').then(r=>r.json()).then(d=>JSON.stringify(d,null,2))"
```

### 选课信息

```bash
agent-browser --session-name cuc eval "
  fetch('/api/courses/{course_id}/enrollments/users/3817518').then(r=>r.json())
  .then(d=>JSON.stringify({name:d.name,klass:d.klass,roles:d.roles},null,2))
"
```

### 公告

```bash
agent-browser --session-name cuc eval "fetch('/api/announcement').then(r=>r.json()).then(d=>JSON.stringify(d,null,2))"
```

### 学期信息

```bash
agent-browser --session-name cuc eval "fetch('/api/my-semesters').then(r=>r.json()).then(d=>JSON.stringify(d,null,2))"
```

## 作业提交流程（自动提交 + 检查）

用户提到"提交"/"交作业"/"提交作业"时，不要只查状态，**直接执行以下完整流程**。

### Step 1: 打开作业页面

```
agent-browser --session-name cuc snapshot "https://courses.cuc.edu.cn/courses/{course_id}/homework/{homework_activity_id}"
```

### Step 2: 从个人资源库投递文件

TronClass 的"添加文件"弹窗会列出**个人资源库**中已上传的文件。用 JS 勾选匹配的 checkbox：

```bash
agent-browser --session-name cuc eval "
const chk = document.querySelectorAll('input[type=checkbox]');
let found = null;
for (const c of chk) {
  const label = c.closest('label') || c.parentElement;
  if (label && label.textContent.includes('文件名关键词')) {
    found = c; break;
  }
}
if (found && !found.checked) { found.click(); 'clicked'; }
else if (found && found.checked) { 'already_checked'; }
else { 'not_found: ' + chk.length + ' checkboxes'; }
"
```

点确认按钮（通过 snapshot 找到"确认"button 的 ref），再点"交付作业"。

### Step 3: 检查提交成功（必须）

提交后立刻查待办和作业详情，**两者都消了才算成功**：

```bash
# 检查待办是否消失
agent-browser --session-name cuc eval "
fetch('/api/todos?no-intercept=true').then(r=>r.json())
.then(d=>JSON.stringify((d.todo_list||[]).filter(t=>t.course_id===175509).map(t=>({title:t.title,id:t.id})),null,2))
"

# 检查作业活动详情的提交状态
agent-browser --session-name cuc eval "
fetch('/api/courses/{course_id}/activities?sub_course_id=0').then(r=>r.json()).then(d=>{
  const a = d.activities.find(x=>x.id==={homework_activity_id});
  return a ? JSON.stringify({title:a.title, is_in_progress:a.is_in_progress, submission_status:a.submission_status}) : 'not found';
})
"
```

### 文件不在资源库时

如果个人资源库找不到文件，说明还没上传到 TronClass。需要：
1. 先用 agent-browser 上传本地文件到资源库
2. 或者走 `agent-browser file-upload` 路径直接投递

## 已知课程

| ID | 名称 |
|----|------|
| 175509 | 社会网络分析 |
| 169344 | 全媒体新闻实务5 |
| 172431 | 网络舆情理论与实践 |
| 173019 | 媒介批评 |
| 174588 | 信息系统与商业创新 |
