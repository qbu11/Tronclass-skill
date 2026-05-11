---
name: tronclass-homework
description: |
  TronClass 作业与讨论管理：查看作业要求、提交作业文件、查看成绩、参与课程讨论。
  Use when the user wants to view homework details, submit assignments, upload files,
  check submission status, view grades, or participate in discussions. Triggers on:
  "交作业", "提交作业", "作业要求", "讨论", "回帖", "成绩", "submit", "assignment".
allowed-tools: Bash Read Write
---

# TronClass 作业与讨论

通过 `agent-browser --session-name cuc` 管理作业和讨论。

## 常量

- 用户 ID: `3817518` / Session: `--session-name cuc`
- 401/403 时：`agent-browser --headed --session-name cuc open "https://courses.cuc.edu.cn"`

## 作业

### 查看详情

```bash
agent-browser --session-name cuc eval "
  fetch('/api/activities/{aid}?sub_course_id=0').then(r=>r.json())
  .then(d=>JSON.stringify({title:d.title,end:d.end_time,desc:d.data?.description,closed:d.is_closed},null,2))
"
```

### 提交记录 / 成绩

```bash
agent-browser --session-name cuc eval "fetch('/api/activities/{aid}/students/3817518/submission_list').then(r=>r.json()).then(d=>JSON.stringify(d,null,2))"
agent-browser --session-name cuc eval "fetch('/api/activities/{aid}/students/3817518/homework-score').then(r=>r.json()).then(d=>JSON.stringify(d,null,2))"
agent-browser --session-name cuc eval "fetch('/api/courses/{cid}/exam-scores').then(r=>r.json()).then(d=>JSON.stringify(d,null,2))"
```

### 提交作业（API 流程）

```bash
# 1. 创建 upload 条目
agent-browser --session-name cuc eval "fetch('/api/uploads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'file.pdf',size:SIZE})}).then(r=>r.json()).then(d=>JSON.stringify({id:d.id,url:d.upload_url}))"

# 2. PUT 文件到 upload_url
# 3. 创建提交
agent-browser --session-name cuc eval "fetch('/api/course/activities/{aid}/submissions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({uploads:[ID],comments:'',is_draft:false})}).then(r=>r.json()).then(d=>JSON.stringify(d))"
```

### UI 方式提交（首次推荐）

```bash
agent-browser --session-name cuc open "https://courses.cuc.edu.cn/course/{cid}/learning-activity#/{aid}"
agent-browser --session-name cuc upload "input[type=file]" "/path/to/file.pdf"
agent-browser --session-name cuc click @submitRef
```

## 讨论

```bash
# 查看
agent-browser --session-name cuc eval "fetch('/api/activities/{aid}/comments?page=1&page_size=20&order_key=id&order=desc&conditions={\"referrer_type\":\"none\",\"type\":\"comment\"}').then(r=>r.json()).then(d=>JSON.stringify({total:d.total,posts:(d.comments||[]).map(c=>({id:c.id,user:c.user?.name,text:c.content?.substring(0,100)}))},null,2))"

# 发帖
agent-browser --session-name cuc eval "fetch('/api/activities/{aid}/comments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:'内容',referrer_type:'none',type:'comment'})}).then(r=>r.json()).then(d=>JSON.stringify(d))"
```

## 安全规则

- 提交前必须让用户确认
- 不自动提交
- 提交后截图确认
