// 全页面回归检查：用 Chrome CDP 逐个打开四个路由，验证渲染 + 无运行时报错
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:5173/';
const PORT = 9333;
const DEBUG_PORT = 9222;

// 启动一个带远程调试端口的 Chrome
const chrome = spawn(CHROME, [
  '--headless=new',
  '--no-proxy-server',
  '--no-first-run',
  '--no-default-browser-check',
  `--remote-debugging-port=${DEBUG_PORT}`,
  '--user-data-dir=' + `C:/Users/lenovo/AppData/Local/Temp/cdp-regression-${PORT}`,
  'about:blank'
], { stdio: 'ignore' });

// 等待调试端口就绪
async function waitForCDP() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`, { signal: AbortSignal.timeout(1000) });
      if (r.ok) return await r.json();
    } catch {}
    await sleep(250);
  }
  throw new Error('CDP port not ready');
}

let ws, id = 0;
const pending = new Map();
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const msgId = ++id;
    pending.set(msgId, { resolve, reject });
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
}

async function main() {
  const ver = await waitForCDP();
  const page = (await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`)).json())
    .find(t => t.type === 'page');
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id); pending.delete(m.id);
      if (m.error) p.reject(new Error(m.error.message)); else p.resolve(m.result);
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440, height: 1120, deviceScaleFactor: 1, mobile: false
  });

  const results = [];
  const errors = [];
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') {
      errors.push(m.params.exceptionDetails.text || 'exception');
    }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      errors.push('console.error: ' + m.params.args.map(a => a.value || a.description).join(' '));
    }
  });

  const routes = [
    { hash: '#/', name: '知识地图', checks: [
        ['.mm-node', 34, '思维导节点数'],
        ['.mm-practice-btn', 21, '去刷题按钮数'],
      ], textHas: '知识地图' },
    { hash: '#/set/s6', name: '题集', checks: [
        ['.qrow', 4, '题目行数(>=4)'],
      ], textHas: '栈与队列', gte: true },
    { hash: '#/question/s1/q1', name: '作答', checks: [
        ['#app', 1, '应用根节点'],
      ], textHas: '', },
    { hash: '#/diagnostic', name: '诊断报告', checks: [
        ['.metric', 3, '指标卡(>=3)'],
      ], textHas: '', gte: true },
  ];

  for (const r of routes) {
    errors.length = 0;
    await send('Page.navigate', { url: BASE + r.hash });
    // 等待 Vue 挂载渲染
    await sleep(1200);
    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        const out = { text: document.body.innerText || '', counts: {} };
        ${r.checks.map(c => `out.counts[${JSON.stringify(c[0])}] = document.querySelectorAll(${JSON.stringify(c[0])}).length;`).join('\n')}
        return out;
      })()`,
      returnByValue: true
    });
    const v = res.result.value || {};
    const row = { name: r.name, hash: r.hash, textLen: v.text.length };
    let ok = v.text.length > 30;
    if (r.textHas && !v.text.includes(r.textHas)) ok = false;
    for (const c of r.checks) {
      const n = v.counts[c[0]] ?? 0;
      row[c[2]] = n;
      const pass = r.gte ? n >= c[1] : n === c[1];
      if (!pass) ok = false;
    }
    row.errors = errors.slice();
    if (errors.length) ok = false;
    row.pass = ok;
    results.push(row);
  }

  console.log('=== 全页面回归结果 ===');
  let allPass = true;
  for (const r of results) {
    const mark = r.pass ? 'PASS' : 'FAIL';
    if (!r.pass) allPass = false;
    console.log(`[${mark}] ${r.name} (${r.hash}) 文本长度=${r.textLen} ` +
      Object.entries(r).filter(([k]) => !['name','hash','textLen','errors','pass'].includes(k))
        .map(([k,val]) => `${k}=${val}`).join(' ') +
      (r.errors.length ? ` 报错=${JSON.stringify(r.errors)}` : ''));
  }
  console.log(allPass ? '\nALL PASS ✅' : '\nSOME FAILED ❌');
}

main().catch(e => { console.error('FATAL', e); process.exitCode = 1; })
  .finally(() => { try { ws?.close(); } catch {} chrome.kill('SIGKILL'); });
