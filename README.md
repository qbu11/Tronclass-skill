# tronclass-claude-skills

Claude Code skills for [TronClass (畅课)](https://www.tronclass.com/) — the course management platform used by 100+ Chinese universities.

Query grades, download coursework, submit homework, and manage discussions — all from your terminal.

## What's included

| Skill | Slash command | What it does |
|-------|--------------|--------------|
| **Dashboard** | `/tronclass-dashboard` | Courses, deadlines, grades, attendance, announcements |
| **Homework** | `/tronclass-homework` | View / submit assignments, participate in discussions |
| **Resource Extractor** | `/tronclass-resource-extractor` | Batch-download courseware files |

## Quick start

### 1. Install dependencies

```bash
npm install -g agent-browser
agent-browser install
```

### 2. Copy skills into Claude Code

```bash
git clone https://github.com/qbu11/tronclass-claude-skills.git
cp -r tronclass-claude-skills/tronclass-dashboard ~/.claude/skills/
cp -r tronclass-claude-skills/tronclass-homework ~/.claude/skills/
cp -r tronclass-claude-skills/tronclass-resource-extractor ~/.claude/skills/
```

### 3. Login to your university's TronClass (one-time)

```bash
bash ~/.claude/skills/tronclass-resource-extractor/scripts/setup.sh
```

The script opens a browser, asks for your student ID and password, then saves the session. You won't need to log in again until the session expires.

Or login manually:

```bash
agent-browser --headed --session-name cuc open "https://courses.your-university.edu.cn"
# Fill credentials
agent-browser --session-name cuc fill "input[placeholder*='手机号']" "YOUR_STUDENT_ID"
agent-browser --session-name cuc fill "input[placeholder*='密码']" "YOUR_PASSWORD"
agent-browser --session-name cuc snapshot -i   # find the login button ref
agent-browser --session-name cuc click @e8      # click login
```

### 4. Use it

Just talk to Claude:

```
> 我有哪些待办作业？
> 帮我下载社会网络分析的课件
> 看看网络舆情这门课的讨论帖
```

## How it works

```
You ──→ Claude Code ──→ agent-browser ──→ TronClass REST API
                         (headless Chromium, session cookie persisted)
```

- **No CDP / Chrome remote debugging** — `agent-browser` manages its own Chromium instance.
- **No scraping** — all data comes from TronClass's internal REST API, called via `fetch()` inside the browser context.
- **Session persistence** — `--session-name cuc` saves cookies to disk. Login once, use forever (until the session expires).

## Adapting to your university

These skills were built against `courses.cuc.edu.cn` (China University of Communication). The TronClass API is consistent across deployments, so adapting to your university only requires:

1. **Change the domain** in `setup.sh` and the SKILL.md files
2. **Change the SSO login selectors** — different universities use different CAS/SSO pages. Run `agent-browser --headed --session-name myuni open "https://courses.your-uni.edu.cn"` and use `snapshot -i` to find the correct form selectors.
3. **Update the user ID** in `tronclass-dashboard/SKILL.md` and `tronclass-homework/SKILL.md` (the `3817518` in API paths like `/students/3817518/...`)

Everything else — API endpoints, response formats, download flow — should work as-is.

## API reference

Full endpoint catalog, reverse-engineered from 6+ GitHub repos and live testing:

### Core

| Endpoint | Description |
|----------|-------------|
| `GET /api/user/recently-visited-courses` | User's courses |
| `GET /api/my-courses` | All enrolled courses |
| `GET /api/todos?no-intercept=true` | Pending homework with deadlines |
| `GET /api/courses/{id}/activities?sub_course_id=0` | All activities (materials, homework, forums, exams) |

### Courseware

| Endpoint | Description |
|----------|-------------|
| `GET /api/course/{id}/coursewares?conditions=...` | Courseware list |
| `GET /api/activities/{aid}/upload_references` | Files attached to an activity |
| `GET /api/uploads/{uid}/url` | Signed download URL (no auth needed) |

### Homework

| Endpoint | Description |
|----------|-------------|
| `GET /api/activities/{aid}?sub_course_id=0` | Homework details |
| `GET /api/activities/{aid}/students/{uid}/submission_list` | My submissions |
| `GET /api/activities/{aid}/students/{uid}/homework-score` | My score |
| `POST /api/uploads` | Create upload entry → returns `upload_url` |
| `PUT {upload_url}` | Upload file binary |
| `POST /api/course/activities/{aid}/submissions` | Submit homework |

### Grades & attendance

| Endpoint | Description |
|----------|-------------|
| `GET /api/courses/{id}/exam-scores` | Course grades |
| `GET /api/courses/{id}/modules/rollcalls` | Attendance records |
| `GET /api/courses/{id}/enrollments/users/{uid}` | Enrollment info |

### Discussion

| Endpoint | Description |
|----------|-------------|
| `GET /api/activities/{aid}/comments?page=1&page_size=20&...` | Read posts |
| `POST /api/activities/{aid}/comments` | Post a reply |

### Other

| Endpoint | Description |
|----------|-------------|
| `GET /api/announcement` | Announcements |
| `GET /api/my-semesters` | Semester list |
| `GET /api/courses/{id}/modules` | Chapter structure |
| `GET /api/courses/{id}/live-record` | Recorded lectures |

## File structure

```
tronclass-claude-skills/
├── README.md
├── tronclass-dashboard/
│   └── SKILL.md
├── tronclass-homework/
│   └── SKILL.md
└── tronclass-resource-extractor/
    ├── SKILL.md
    └── scripts/
        └── setup.sh
```

## Requirements

- [Claude Code](https://claude.ai/code) (claude.ai/code or CLI)
- [agent-browser](https://github.com/nichochar/agent-browser) (`npm install -g agent-browser`)
- Node.js 18+

## Prior art

TronClass API knowledge compiled from:

- [seven-317/Tronclass-API](https://github.com/seven-317/Tronclass-API) — TypeScript type definitions (most comprehensive)
- [wilinz/tronclass_plus](https://github.com/wilinz/tronclass_plus) — Flutter client with attendance
- [zhou-haoyang/tronclass-cli](https://github.com/zhou-haoyang/tronclass-cli) — Python CLI with homework submission
- [ogios/TronclassFilesystem_eurasia](https://github.com/ogios/TronclassFilesystem_eurasia) — FUSE filesystem
- [BobLiu0518/TronClass-Resource-Download](https://github.com/BobLiu0518/TronClass-Resource-Download) — Userscript downloader

## License

MIT
