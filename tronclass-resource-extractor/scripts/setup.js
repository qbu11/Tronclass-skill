#!/usr/bin/env node
// TronClass Skills Setup - Cross-platform onboarding script
// Works on Windows, macOS, Linux without bash dependency

const { execSync } = require('child_process');
const readline = require('readline');

const DOMAIN = process.env.TRONCLASS_DOMAIN || 'courses.cuc.edu.cn';
const SESSION = process.env.TRONCLASS_SESSION || 'cuc';

function run(cmd, silent = false) {
  try {
    const result = execSync(cmd, { encoding: 'utf-8', timeout: 30000 });
    if (!silent) console.log(result.trim());
    return result.trim();
  } catch (e) {
    return e.stdout ? e.stdout.trim() : '';
  }
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans); }));
}

async function main() {
  console.log('=== TronClass Skills Setup ===\n');

  // Step 1: Check agent-browser
  console.log('[1/3] Checking agent-browser...');
  const version = run('agent-browser --version', true);
  if (version) {
    console.log(`  ✓ agent-browser ${version}`);
  } else {
    console.log('  Installing agent-browser...');
    run('npm install -g agent-browser');
    run('agent-browser install');
    console.log('  ✓ Installed');
  }

  // Step 2: Check existing session
  console.log('\n[2/3] Checking session...');
  const check = run(`agent-browser --session-name ${SESSION} eval "fetch('/api/todos?no-intercept=true').then(r=>r.ok?'valid':'expired')"`, true);

  if (check.includes('valid')) {
    console.log('  ✓ Session is valid. No login needed.');
    console.log('\n=== Setup Complete ===');
    return;
  }

  // Step 3: Login
  console.log('  Session expired or missing. Starting login...\n');
  console.log('[3/3] Login to TronClass');

  const studentId = await ask('  Student ID (学号): ');
  const password = await ask('  Password (密码): ');

  console.log('  Opening browser...');
  run(`agent-browser --headed --session-name ${SESSION} open "https://${DOMAIN}"`);

  console.log('  Filling credentials...');
  run(`agent-browser --session-name ${SESSION} fill "input[placeholder*='手机号']" "${studentId}"`);
  run(`agent-browser --session-name ${SESSION} fill "input[placeholder*='密码']" "${password}"`);

  // Find login button
  const snapshot = run(`agent-browser --session-name ${SESSION} snapshot -i`, true);
  const loginMatch = snapshot.match(/link "登录" \[ref=(e\d+)\]/);
  const loginRef = loginMatch ? loginMatch[1] : 'e8';

  console.log(`  Clicking login (@${loginRef})...`);
  run(`agent-browser --session-name ${SESSION} click @${loginRef}`);

  // Wait and verify
  await new Promise(r => setTimeout(r, 3000));
  const verify = run(`agent-browser --session-name ${SESSION} eval "fetch('/api/todos?no-intercept=true').then(r=>r.ok?'OK':'FAIL')"`, true);

  if (verify.includes('OK')) {
    console.log('  ✓ Login successful! Session saved.\n');
  } else {
    console.log('  ✗ Login may have failed. Try manually:');
    console.log(`    agent-browser --headed --session-name ${SESSION} open "https://${DOMAIN}"`);
    console.log('    Then log in in the browser window.\n');
  }

  console.log('=== Setup Complete ===\n');
  console.log('Available skills:');
  console.log('  /tronclass-dashboard          - 课程、待办、成绩、签到');
  console.log('  /tronclass-homework           - 作业查看/提交、讨论');
  console.log('  /tronclass-resource-extractor - 课件下载\n');
  console.log('Try: "我的待办作业有哪些" or "帮我下载课件"');
}

main().catch(e => { console.error(e.message); process.exit(1); });
