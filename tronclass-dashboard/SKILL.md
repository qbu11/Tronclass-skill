---
name: tronclass-dashboard
description: |
  TronClass 课程总览面板：查看所有课程、待办作业、成绩、签到记录。
  Use when the user asks about courses, pending homework, deadlines, grades,
  attendance, or academic status. Triggers on: "我的课程", "待办", "作业截止",
  "签到", "成绩", "课表", "ddl", "deadline".
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

## 已知课程

| ID | 名称 |
|----|------|
| 175509 | 社会网络分析 |
| 169344 | 全媒体新闻实务5 |
| 172431 | 网络舆情理论与实践 |
| 173019 | 媒介批评 |
| 174588 | 信息系统与商业创新 |
