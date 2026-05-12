<div align="center">

# 🎓 TronClass Claude Skills

**用 AI 管理你的大学课程**

在 Claude Code 中查课表、交作业、下课件、看成绩 —— 一句话搞定。

<!-- 在这里放 GIF 演示动图 -->
<!-- ![demo](assets/demo.gif) -->

[快速开始](#快速开始) · [功能一览](#功能一览) · [使用示例](#使用示例) · [适配其他学校](#适配其他学校) · [交流群](#交流群)

</div>

---

## 这是什么？

一组 [Claude Code](https://claude.ai/code) 技能插件，让 AI 直接操作 TronClass（畅课）教务平台。

**你只需要用自然语言说：**

```
> 我有哪些作业要交？
> 帮我下载社会网络分析的全部课件
> 看看网络舆情的讨论帖
> 帮我把这个报告交到信息系统那门课的期末作业里
```

AI 会自动调用 TronClass API 完成操作。

## 功能一览

| 技能 | 斜杠命令 | 能做什么 |
|------|---------|---------|
| **课程面板** | `/tronclass-dashboard` | 所有课程、待办 DDL、成绩、签到记录、公告 |
| **作业管理** | `/tronclass-homework` | 查看作业要求、提交文件、查看成绩、参与讨论 |
| **课件下载** | `/tronclass-resource-extractor` | 批量下载课件 PDF/PPT/文档 |

## 快速开始

### 第一步：安装依赖

```bash
npm install -g agent-browser
agent-browser install
```

### 第二步：安装技能

```bash
git clone https://github.com/qbu11/Tronclass-skill.git
cp -r Tronclass-skill/tronclass-dashboard ~/.claude/skills/
cp -r Tronclass-skill/tronclass-homework ~/.claude/skills/
cp -r Tronclass-skill/tronclass-resource-extractor ~/.claude/skills/
```

### 第三步：首次登录（只需一次）

```bash
bash ~/.claude/skills/tronclass-resource-extractor/scripts/setup.sh
```

脚本会：
1. ✅ 检查 agent-browser 是否安装
2. ✅ 安装浏览器
3. ✅ 弹出登录窗口，输入学号密码登录
4. ✅ 保存登录态（之后不用再登录）

> 💡 登录态通过 `--session-name cuc` 持久化到本地，一般一周内有效。过期后重新运行即可。

### 第四步：开始使用

打开 Claude Code，直接对话：

```
> 我的待办作业有哪些？
```

<!-- 在这里放使用截图 -->
<!-- ![usage](assets/usage.png) -->

---

## 使用示例

### 📋 查看待办

```
> 我有什么作业要交？ddl 是什么时候？
```

AI 返回按紧急程度排序的待办列表，标注截止时间。

### 📥 下载课件

```
> 帮我下载社会网络分析的全部课件到本地
```

AI 自动获取课件列表 → 逐个下载 → 保存到本地文件夹。

### 📝 提交作业

```
> 帮我把 report.docx 交到网络舆情的结课作业
```

AI 导航到作业页面 → 上传文件 → 确认提交（会先让你确认再交）。

### 💬 参与讨论

```
> 帮我看看舆情课的讨论帖都说了什么
```

### 📊 查看成绩

```
> 我这学期各门课成绩怎么样？
```

---

## 工作原理

```
你 → Claude Code → agent-browser → TronClass REST API
      (AI 理解你的意图)   (无头浏览器)    (课程平台接口)
```

- **不需要 Chrome 远程调试** —— `agent-browser` 自带 Chromium
- **不是爬虫** —— 所有数据来自 TronClass 官方 REST API
- **登录态持久化** —— 登录一次，长期有效

---

## 适配其他学校

TronClass（畅课）被 100+ 所中国高校使用，API 接口通用。

### 需要改的 3 个值

| 要改什么 | 改成什么 | 在哪改 |
|---------|---------|-------|
| 域名 `courses.cuc.edu.cn` | 你学校的 TronClass 域名 | 全部 `SKILL.md` + `setup.sh` |
| Session 名 `cuc` | 你学校缩写（如 `pku`） | 全部 `SKILL.md` + `setup.sh` |
| 用户 ID `3817518` | 你的用户 ID | `dashboard/SKILL.md` + `homework/SKILL.md` |

一键替换（以北大为例）：

```bash
cd Tronclass-skill
find . -name "*.md" -o -name "*.sh" | xargs sed -i 's/courses.cuc.edu.cn/courses.pku.edu.cn/g'
find . -name "*.md" -o -name "*.sh" | xargs sed -i 's/session-name cuc/session-name pku/g'
find . -name "*.md" -o -name "*.sh" | xargs sed -i 's/3817518/你的用户ID/g'
```

### 完整 Onboarding 流程

**第 1 步：探索你学校的登录页**

```bash
agent-browser --headed --session-name myuni open "https://courses.你的学校.edu.cn"
agent-browser --session-name myuni snapshot -i
```

输出示例：
```
- textbox "请输入学号" [ref=e5]
- textbox "请输入密码" [ref=e6]
- link "登录" [ref=e8]
```

**第 2 步：测试登录**

```bash
agent-browser --session-name myuni fill "@e5" "你的学号"
agent-browser --session-name myuni fill "@e6" "你的密码"
agent-browser --session-name myuni click "@e8"
```

**第 3 步：验证登录成功**

```bash
agent-browser --session-name myuni eval "fetch('/api/todos?no-intercept=true').then(r=>r.ok?'OK':'FAIL')"
# 输出 "OK" 即成功
```

**第 4 步：获取你的用户 ID**

```bash
agent-browser --session-name myuni eval "
  fetch('/api/user/recently-visited-courses').then(r=>r.text())
" | grep -oP '"id":\d+' | head -1
```

登录后 session 自动保存，把 `setup.sh` 里的选择器改成你学校的即可。

### 已验证学校

| 学校 | 域名 | 贡献者 |
|------|------|--------|
| 中国传媒大学 | `courses.cuc.edu.cn` | @qbu11 |
<!-- | 你的学校 | `courses.xxx.edu.cn` | @你的ID | -->

> 🙋 适配成功了？欢迎 PR 把你的学校加到列表！

---

## 文件结构

```
Tronclass-skill/
├── README.md
├── tronclass-dashboard/
│   └── SKILL.md              # 课程面板技能
├── tronclass-homework/
│   └── SKILL.md              # 作业管理技能
└── tronclass-resource-extractor/
    ├── SKILL.md              # 课件下载技能
    └── scripts/
        └── setup.sh          # 一键安装 + 登录脚本
```

## API 参考

<details>
<summary>点击展开完整 API 列表</summary>

### 核心接口

| 用途 | 端点 |
|------|------|
| 我的课程 | `GET /api/user/recently-visited-courses` |
| 全部课程 | `GET /api/my-courses` |
| 待办作业 | `GET /api/todos?no-intercept=true` |
| 课程活动 | `GET /api/courses/{id}/activities?sub_course_id=0` |

### 课件下载

| 用途 | 端点 |
|------|------|
| 课件列表 | `GET /api/course/{id}/coursewares?conditions=...` |
| 文件引用 | `GET /api/activities/{aid}/upload_references` |
| 签名下载 URL | `GET /api/uploads/{uid}/url` |

### 作业

| 用途 | 端点 |
|------|------|
| 作业详情 | `GET /api/activities/{aid}?sub_course_id=0` |
| 我的提交 | `GET /api/activities/{aid}/students/{uid}/submission_list` |
| 作业成绩 | `GET /api/activities/{aid}/students/{uid}/homework-score` |
| 创建上传 | `POST /api/uploads` |
| 提交作业 | `POST /api/course/activities/{aid}/submissions` |

### 成绩与签到

| 用途 | 端点 |
|------|------|
| 课程成绩 | `GET /api/courses/{id}/exam-scores` |
| 签到记录 | `GET /api/courses/{id}/modules/rollcalls` |
| 选课信息 | `GET /api/courses/{id}/enrollments/users/{uid}` |

### 讨论

| 用途 | 端点 |
|------|------|
| 查看帖子 | `GET /api/activities/{aid}/comments?page=1&page_size=20&...` |
| 发帖 | `POST /api/activities/{aid}/comments` |

### 其他

| 用途 | 端点 |
|------|------|
| 公告 | `GET /api/announcement` |
| 学期 | `GET /api/my-semesters` |
| 章节 | `GET /api/courses/{id}/modules` |
| 录播 | `GET /api/courses/{id}/live-record` |

</details>

---

## 环境要求

- [Claude Code](https://claude.ai/code)（桌面版或 CLI）
- [agent-browser](https://github.com/nichochar/agent-browser)（`npm install -g agent-browser`）
- Node.js 18+

---

## 交流群

<!-- 在这里放微信群二维码 -->
<!-- ![wechat-group](assets/wechat-group.jpg) -->

扫码加入交流群，获取使用帮助、反馈问题、参与开发：

<div align="center">

<!-- 取消下面这行的注释，替换为你的二维码图片路径 -->
<!-- <img src="assets/wechat-group.jpg" width="200" /> -->

**微信群二维码位置**

_（请将二维码图片放在 `assets/wechat-group.jpg`）_

</div>

---

## 致谢

TronClass API 知识来源于以下开源项目：

- [seven-317/Tronclass-API](https://github.com/seven-317/Tronclass-API) — TypeScript 类型定义（最全面）
- [wilinz/tronclass_plus](https://github.com/wilinz/tronclass_plus) — Flutter 客户端
- [zhou-haoyang/tronclass-cli](https://github.com/zhou-haoyang/tronclass-cli) — Python CLI
- [ogios/TronclassFilesystem_eurasia](https://github.com/ogios/TronclassFilesystem_eurasia) — FUSE 文件系统
- [BobLiu0518/TronClass-Resource-Download](https://github.com/BobLiu0518/TronClass-Resource-Download) — 油猴脚本

---

## 常见问题

<details>
<summary>登录态过期了怎么办？</summary>

重新运行：`bash ~/.claude/skills/tronclass-resource-extractor/scripts/setup.sh`
</details>

<details>
<summary>我的学校不是 TronClass 怎么办？</summary>

本项目仅支持 TronClass（畅课）平台。判断方法：打开你学校课程网站，页脚写着 "TronClass" 或 "西安智园" 就是。学堂在线/雨课堂/超星等其他平台暂不支持。
</details>

<details>
<summary>提交作业会不会误交？</summary>

不会。AI 提交前会展示作业标题+课程名+文件名让你确认，你明确说"提交"才执行。交错了可以在平台上"撤回"。
</details>

---

## License

MIT

---

<div align="center">

**如果觉得有用，给个 ⭐ 吧！**

</div>
