<div align="center">

# 🎓 TronClass Claude Skills

**用 AI 管理你的大学课程**

在终端里查课表、交作业、下课件、看成绩 —— 一句话搞定。

[![Stars](https://img.shields.io/github/stars/qbu11/Tronclass-skill?style=for-the-badge)](https://github.com/qbu11/Tronclass-skill/stargazers)
[![License](https://img.shields.io/github/license/qbu11/Tronclass-skill?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge)](https://github.com/qbu11/Tronclass-skill/pulls)
[![Platform](https://img.shields.io/badge/platforms-4-blue?style=for-the-badge&label=AI%20Agents)](#兼容性)

<!-- GIF 演示动图 -->
<!-- ![demo](assets/demo.gif) -->

**兼容：** Claude Code · Codex CLI · Hermes Agent · OpenClaw

[一键安装](#一键安装) · [Before / After](#before--after) · [功能](#功能一览) · [适配其他学校](#适配其他学校) · [交流群](#交流群)

</div>

---

## 一键安装

```bash
git clone https://github.com/qbu11/Tronclass-skill.git && cp -r Tronclass-skill/tronclass-*/ ~/.claude/skills/
```

首次使用需登录一次（之后不用再登录）：

```bash
node ~/.claude/skills/tronclass-resource-extractor/scripts/setup.js
```

<details>
<summary>📦 前置依赖（如果没装过）</summary>

```bash
npm install -g agent-browser
agent-browser install
```

</details>

---

## Before / After

| | 传统方式 | 用了这个 Skill |
|---|---------|---------------|
| **查作业** | 打开浏览器 → 登录教务 → 找课程 → 点作业 → 看截止时间 | `我有什么作业要交？` |
| **下课件** | 逐个课件页点"查看文件" → 右键另存 → 重复 N 次 | `帮我下载社会网络分析的全部课件` |
| **交作业** | 打开网页 → 选文件 → 等上传 → 点交付 → 确认 | `帮我把 report.docx 交到期末作业` |
| **看成绩** | 打开浏览器 → 登录 → 逐门课查看 | `我这学期成绩怎么样？` |

---

## 功能一览

| 技能 | 斜杠命令 | 能做什么 |
|------|---------|---------|
| **课程面板** | `/tronclass-dashboard` | 课程列表、待办 DDL、成绩、签到、公告 |
| **作业管理** | `/tronclass-homework` | 查看/提交作业、查看成绩、参与讨论 |
| **课件下载** | `/tronclass-resource-extractor` | 批量下载课件 PDF/PPT/文档 |

---

## 使用示例

<table>
<tr><td>

**📋 查待办**

```
> 我有什么作业要交？ddl 是什么时候？
```

AI 返回按紧急程度排序的待办列表。

</td><td>

**📥 下课件**

```
> 帮我下载社会网络分析的全部课件
```

自动获取列表 → 下载 → 保存到本地。

</td></tr>
<tr><td>

**📝 交作业**

```
> 帮我把 report.docx 交到网络舆情的结课作业
```

会先让你确认再提交，不会误交。

</td><td>

**📊 看成绩**

```
> 我这学期各门课成绩怎么样？
```

一次性展示所有课程成绩。

</td></tr>
</table>

<!-- 使用截图 -->
<!-- ![usage](assets/usage.png) -->

---

## 工作原理

```
你 → AI Agent → agent-browser → TronClass REST API
     (理解意图)    (无头浏览器)     (课程平台接口)
```

- **不需要 Chrome 远程调试** — agent-browser 自带浏览器
- **不是爬虫** — 调用 TronClass 官方 REST API
- **登录态持久化** — 登录一次，约一周有效

---

## 兼容性

SKILL.md 遵循 [claudeskills.io](https://claudeskill.io) 标准，以下 4 个 AI agent 框架均原生支持：

| 框架 | 安装方式 |
|------|---------|
| Claude Code | `cp -r tronclass-*/ ~/.claude/skills/` |
| Codex CLI | `cp -r tronclass-*/ ~/.claude/skills/` |
| Hermes Agent | `cp -r tronclass-*/ ~/.claude/skills/` |
| OpenClaw | `cp -r tronclass-*/ ~/.claude/skills/` |

---

## 适配其他学校

TronClass（畅课）被 100+ 所中国高校使用，API 通用。

<details>
<summary>📖 完整适配教程（点击展开）</summary>

### 需要改的 3 个值

| 要改什么 | 改成什么 | 在哪改 |
|---------|---------|-------|
| `courses.cuc.edu.cn` | 你学校的域名 | 全部 `SKILL.md` + `setup.js` |
| `cuc` | 你学校缩写 | 全部文件中的 `--session-name` |
| `3817518` | 你的用户 ID | `dashboard` + `homework` 的 SKILL.md |

一键替换：

```bash
cd Tronclass-skill
find . -name "*.md" -o -name "*.js" | xargs sed -i 's/courses.cuc.edu.cn/courses.你的学校.edu.cn/g'
find . -name "*.md" -o -name "*.js" | xargs sed -i 's/session-name cuc/session-name 你的缩写/g'
find . -name "*.md" -o -name "*.js" | xargs sed -i 's/3817518/你的用户ID/g'
```

### 探索登录页

```bash
agent-browser --headed --session-name myuni open "https://courses.你的学校.edu.cn"
agent-browser --session-name myuni snapshot -i
# 根据输出调整 fill/click 选择器
```

### 获取用户 ID

```bash
agent-browser --session-name myuni eval "
  fetch('/api/user/recently-visited-courses').then(r=>r.text())
"
```

</details>

### 已验证学校

| 学校 | 域名 | 贡献者 |
|------|------|--------|
| 中国传媒大学 | `courses.cuc.edu.cn` | [@qbu11](https://github.com/qbu11) |
<!-- | 你的学校 | `courses.xxx.edu.cn` | [@你的ID](https://github.com/你的ID) | -->

> 🙋 适配成功了？[提个 PR](https://github.com/qbu11/Tronclass-skill/pulls) 把你的学校加上！

---

## API 参考

<details>
<summary>📖 点击展开完整 API 列表</summary>

| 用途 | 端点 |
|------|------|
| 我的课程 | `GET /api/user/recently-visited-courses` |
| 全部课程 | `GET /api/my-courses` |
| 待办作业 | `GET /api/todos?no-intercept=true` |
| 课程活动 | `GET /api/courses/{id}/activities?sub_course_id=0` |
| 课件列表 | `GET /api/course/{id}/coursewares?conditions=...` |
| 文件引用 | `GET /api/activities/{aid}/upload_references` |
| 签名下载 | `GET /api/uploads/{uid}/url` |
| 作业详情 | `GET /api/activities/{aid}?sub_course_id=0` |
| 我的提交 | `GET /api/activities/{aid}/students/{uid}/submission_list` |
| 作业成绩 | `GET /api/activities/{aid}/students/{uid}/homework-score` |
| 课程成绩 | `GET /api/courses/{id}/exam-scores` |
| 签到记录 | `GET /api/courses/{id}/modules/rollcalls` |
| 讨论帖 | `GET /api/activities/{aid}/comments?...` |
| 公告 | `GET /api/announcement` |
| 创建上传 | `POST /api/uploads` |
| 提交作业 | `POST /api/course/activities/{aid}/submissions` |
| 发帖 | `POST /api/activities/{aid}/comments` |

</details>

---

## 常见问题

<details>
<summary>登录态过期了怎么办？</summary>

```bash
node ~/.claude/skills/tronclass-resource-extractor/scripts/setup.js
```

</details>

<details>
<summary>我的学校不是 TronClass 怎么办？</summary>

打开你学校课程网站，页脚写着 "TronClass" 或 "西安智园" 就是畅课。学堂在线/雨课堂/超星等其他平台暂不支持。

</details>

<details>
<summary>提交作业会不会误交？</summary>

不会。AI 提交前会展示作业标题+文件名让你确认，你说"提交"才执行。交错了可以在平台上撤回。

</details>

---

## 推荐搭配

TronClass Skills 下载的课件和作业，可以搭配这些 skill 构建完整的学术工作流：

| Skill | 用途 | 搭配场景 |
|-------|------|---------|
| [scientific-writing](https://github.com/K-Dense/scientific-writing) | 学术论文写作（IMRAD结构、APA引用） | 用下载的课件资料写课程论文 |
| [scientific-visualization](https://github.com/K-Dense/scientific-visualization) | 论文级可视化（matplotlib/seaborn） | 作业中的数据分析图表 |
| [deep-research](https://github.com/anthropics/claude-code) | 多源深度调研 | 课程报告的文献综述 |
| [scholar-evaluation](https://github.com/K-Dense/scholar-evaluation) | 论文评估（ScholarEval框架） | 评价课程阅读材料的研究质量 |
| [scientific-critical-thinking](https://github.com/K-Dense/scientific-critical-thinking) | 科学批判性思维 | 分析课程论文的实验设计 |
| [bilibili-video-summary](https://github.com/qbu11/Tronclass-skill) | B站视频字幕提取与总结 | 课程相关视频的笔记整理 |

**典型工作流示例：**

```
下载课件（resource-extractor）
    → 深度调研补充资料（deep-research）
    → 写课程论文（scientific-writing）
    → 生成图表（scientific-visualization）
    → 提交作业（homework）
```

---

## 交流群

<div align="center">

<!-- 取消注释并替换为二维码图片 -->
<!-- <img src="assets/wechat-group.jpg" width="200" /> -->

**📱 扫码加入微信交流群**

_（将二维码放在 `assets/wechat-group.jpg`，取消上面注释）_

获取帮助 · 反馈 Bug · 参与开发 · 分享适配经验

</div>

---

## 贡献

欢迎贡献！特别是：

- 🏫 **适配新学校** — 改 3 个值就能用，提 PR 把学校加到验证列表
- 🐛 **Bug 修复** — 发现 API 变动或登录问题
- ✨ **新功能** — 签到自动化、录播下载等

详见 [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 致谢

API 知识来源：[seven-317/Tronclass-API](https://github.com/seven-317/Tronclass-API) · [wilinz/tronclass_plus](https://github.com/wilinz/tronclass_plus) · [zhou-haoyang/tronclass-cli](https://github.com/zhou-haoyang/tronclass-cli) · [ogios/TronclassFilesystem_eurasia](https://github.com/ogios/TronclassFilesystem_eurasia) · [BobLiu0518/TronClass-Resource-Download](https://github.com/BobLiu0518/TronClass-Resource-Download)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=qbu11/Tronclass-skill&type=Date)](https://star-history.com/#qbu11/Tronclass-skill&Date)

---

## License

MIT

<div align="center">

**觉得有用？给个 ⭐ 支持一下！**

[提 Issue](https://github.com/qbu11/Tronclass-skill/issues) · [提 PR](https://github.com/qbu11/Tronclass-skill/pulls)

</div>
