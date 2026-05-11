#!/bin/bash
# TronClass Skills Onboarding Script
# 首次使用任何 tronclass-* skill 时运行此脚本

set -e

echo "=== TronClass Skills Setup ==="
echo ""

# Step 1: Check agent-browser
echo "[1/3] Checking agent-browser..."
if command -v agent-browser &> /dev/null; then
    echo "  ✓ agent-browser installed"
else
    echo "  ✗ agent-browser not found. Installing..."
    npm install -g agent-browser
    echo "  ✓ agent-browser installed"
fi

# Step 2: Install browser binaries (Chromium for Playwright)
echo "[2/3] Checking browser binaries..."
agent-browser install 2>/dev/null && echo "  ✓ Browser ready" || echo "  ✓ Browser already installed"

# Step 3: Login to CUC TronClass
echo "[3/3] Logging into TronClass..."
echo "  A browser window will open. Please log in with your CUC credentials."
echo ""

# Check if session already exists and is valid
VALID=$(agent-browser --session-name cuc eval "fetch('/api/todos?no-intercept=true').then(r=>r.ok?'valid':'expired')" 2>/dev/null || echo "no_session")

if echo "$VALID" | grep -q "valid"; then
    echo "  ✓ Existing session is valid. No login needed."
else
    echo "  → Opening login page..."
    agent-browser --headed --session-name cuc open "https://courses.cuc.edu.cn"

    read -p "  Enter your student ID (学号): " STUDENT_ID
    read -sp "  Enter your password (密码): " PASSWORD
    echo ""

    agent-browser --session-name cuc fill "input[placeholder*='手机号']" "$STUDENT_ID"
    agent-browser --session-name cuc fill "input[placeholder*='密码']" "$PASSWORD"

    # Find and click login button
    LOGIN_REF=$(agent-browser --session-name cuc snapshot -i 2>/dev/null | grep 'link "登录"' | grep -o 'ref=e[0-9]*' | head -1 | cut -d= -f2)
    if [ -n "$LOGIN_REF" ]; then
        agent-browser --session-name cuc click "@$LOGIN_REF"
    else
        agent-browser --session-name cuc click "text=登录"
    fi

    sleep 3

    # Verify login
    CHECK=$(agent-browser --session-name cuc eval "fetch('/api/todos?no-intercept=true').then(r=>r.ok?'ok':'fail')" 2>/dev/null || echo "fail")
    if echo "$CHECK" | grep -q "ok"; then
        echo "  ✓ Login successful! Session saved as 'cuc'."
    else
        echo "  ✗ Login may have failed. Try running: agent-browser --headed --session-name cuc open https://courses.cuc.edu.cn"
        echo "    and log in manually."
    fi
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Available skills:"
echo "  /tronclass-dashboard          - 课程总览、待办、成绩、签到"
echo "  /tronclass-homework           - 作业查看/提交、讨论"
echo "  /tronclass-resource-extractor - 课件批量下载"
echo ""
echo "Try: ask Claude '我的待办作业有哪些' or '帮我下载社会网络分析的课件'"
