// 全题集遍历回归：9 个题集 + 所有题目详情页，确认无空页
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:5173/';
const DEBUG_PORT = 9334;

// 期望数据（与 mock/data.js 对齐）
const EXPECT = {
  s1: ['q10','q11','q12','q13'], s2: ['q7','q8'], s3: ['q14','q15','q16','q17'],
  s4: ['q18','q19','q20','q21'], s5: ['q9'], s6: ['q1','q2','q3','q4','q5','q6'],
  s7: ['q22','q23','q24','q25','q26'], s8: ['q27','q28','q29','q30'], s9: ['q31','q32','q33','q34']
};

const chrome = spawn(CHROME, [
  '--headless=new','--no-proxy-server','--no-first-run','--no-default-browser-check',
  `--remote-debugging-port=${DEBUG_PORT}`,
  '--user-data-dir=C:/Users/lenovo/AppData/Local/Temp/cdp-sets-9334','about:blank'
], { stdio: 'ignore' });

async function waitCDP(){
  for(let i=0;i<60;i++){ try{ const r=await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`,{signal:AbortSignal.timeout(1000)}); if(r.ok)return; }catch{} await sleep(250); }
  throw new Error('CDP not ready');
}
let ws,id=0; const pending=new Map();
function send(method,params={}){ return new Promise((res,rej)=>{ const n=++id; pending.set(n,{res,rej}); ws.send(JSON.stringify({id:n,method,params})); }); }

async function main(){
  await waitCDP();
  const page=(await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`)).json()).find(t=>t.type==='page');
  ws=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
  ws.onmessage=e=>{ const m=JSON.parse(e.data); if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.rej(new Error(m.error.message)):p.res(m.result);} };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});

  async function evaluate(expr){ const r=await send('Runtime.evaluate',{expression:expr,returnByValue:true}); return r.result.value; }
  async function go(hash){ await send('Page.navigate',{url:BASE+hash}); await sleep(450); }

  let pass=0, fail=0;
  const fails=[];

  // 1) 题集页：每个 set 的题目行数 == 期望，且没有空状态
  for(const [sid,qids] of Object.entries(EXPECT)){
    await go('#/set/'+sid);
    const v=await evaluate(`(()=>({rows:document.querySelectorAll('.qrow').length, empty:document.body.innerText.includes('没有找到该题集'), title:(document.querySelector('.page-title')||{}).innerText||''}))()`);
    const ok = v.rows===qids.length && !v.empty;
    if(ok) pass++; else { fail++; fails.push(`题集 ${sid}: rows=${v.rows} 期望=${qids.length} empty=${v.empty} title=${v.title}`); }
  }

  // 2) 详情页：每道题都能渲染 QuestionCard，不出现"题目不存在"
  let qDetailPass=0, qDetailFail=0;
  for(const [sid,qids] of Object.entries(EXPECT)){
    for(const qid of qids){
      await go(`#/question/${sid}/${qid}`);
      const v=await evaluate(`(()=>({textLen:document.body.innerText.length, empty:document.body.innerText.includes('题目不存在'), card:!!document.querySelector('.q-card, .qcard, .question-card')||document.body.innerText.length>60}))()`);
      const ok = !v.empty && v.card;
      if(ok) qDetailPass++; else { qDetailFail++; fails.push(`详情 ${sid}/${qid}: empty=${v.empty} len=${v.textLen}`); }
    }
  }

  // 3) 三种题型控件都存在（用 s1：含 single/multiple/blank）
  await go('#/question/s1/q10');
  const single=await evaluate(`document.body.innerText.includes('单选题')||document.querySelectorAll('input[type=radio]').length>0`);
  await go('#/question/s1/q12');
  const multi=await evaluate(`document.body.innerText.includes('多选题')||document.querySelectorAll('input[type=checkbox]').length>0`);
  await go('#/question/s1/q13');
  const blank=await evaluate(`document.querySelectorAll('input[type=text], input:not([type])').length>0 || document.body.innerText.includes('填空')`);

  console.log('=== 全题集遍历回归 ===');
  console.log(`题集页: 通过 ${pass}/9`);
  console.log(`题目详情: 通过 ${qDetailPass}/${qDetailPass+qDetailFail}`);
  console.log(`题型控件: 单选=${!!single} 多选=${!!multi} 填空=${!!blank}`);
  if(fails.length){ console.log('\n失败项:'); fails.forEach(f=>console.log(' - '+f)); }
  const allOk = fail===0 && qDetailFail===0 && single && multi && blank;
  console.log(allOk?'\nALL PASS ✅':'\nSOME FAILED ❌');
}
main().catch(e=>{console.error('FATAL',e);process.exitCode=1;}).finally(()=>{try{ws?.close();}catch{} chrome.kill('SIGKILL');});
