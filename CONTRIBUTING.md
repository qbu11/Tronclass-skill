# 贡献指南

感谢你对 TronClass Skills 的兴趣！

## 如何贡献

### 🏫 适配新学校

最有价值的贡献！只需 3 步：

1. Fork 仓库，替换域名/session名/用户ID
2. 测试登录和基本功能（查课程、查待办）
3. 提 PR，把你的学校加到 README 的"已验证学校"表格

### 🐛 Bug 修复

1. 在 Issues 描述问题和复现步骤
2. Fork → 修复 → 提 PR

### ✨ 新功能

可以做的方向：
- 录播视频下载
- 签到自动化
- 考试提醒
- 更多 API 端点探索

请先开 Issue 讨论再写代码。

## 开发环境

```bash
npm install -g agent-browser
agent-browser install
node tronclass-resource-extractor/scripts/setup.js
```

## 代码规范

- SKILL.md 遵循 [claudeskills.io](https://claudeskill.io) 标准
- 脚本用 Node.js（跨平台）
- agent-browser 命令保持简洁，一行一个操作

## 提交信息

```
feat: 新功能
fix: Bug 修复
docs: 文档更新
chore: 维护性工作
```
