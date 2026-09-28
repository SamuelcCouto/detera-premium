// Imprime o manual (HTML -> PDF) no Chrome headless e fotografa cada página
// para conferência.
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const [html, pdf, pastaPaginas] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const port = 9300 + Math.floor(Math.random() * 600);
const perfil = mkdtempSync(join(tmpdir(), 'manual-'));
const proc = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${perfil}`, '--no-first-run', '--allow-file-access-from-files', 'about:blank'], { stdio: 'ignore' });
let alvos = [];
for (let i = 0; i < 75 && !alvos.length; i++) {
  try { alvos = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).filter((t) => t.type === 'page'); } catch {}
  if (!alvos.length) await sleep(200);
}
const ws = new WebSocket(alvos[0].webSocketDebuggerUrl);
await new Promise((r) => { ws.onopen = r; });
let id = 0; const pend = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (method, params = {}) => new Promise((r) => { const mid = ++id; pend.set(mid, r); ws.send(JSON.stringify({ id: mid, method, params })); });
const ev = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result?.result?.value;

try {
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1123, height: 794, deviceScaleFactor: 1.4, mobile: false });
  await send('Page.navigate', { url: pathToFileURL(html).href });
  await sleep(1500);
  await ev('document.fonts.ready.then(() => document.fonts.check("16px Oxanium"))');
  const fonteOk = await ev('document.fonts.check("16px Oxanium")');
  const res = await send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0 });
  writeFileSync(pdf, Buffer.from(res.result.data, 'base64'));

  mkdirSync(pastaPaginas, { recursive: true });
  const caixas = await ev('[...document.querySelectorAll(".pagina")].map((p) => { const r = p.getBoundingClientRect(); return { x: r.left, y: r.top + scrollY, w: r.width, h: r.height }; })');
  for (const [i, c] of caixas.entries()) {
    const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 80, captureBeyondViewport: true, clip: { x: c.x, y: c.y, width: c.w, height: c.h, scale: 1 } });
    writeFileSync(join(pastaPaginas, `pagina-${String(i + 1).padStart(2, '0')}.jpg`), Buffer.from(shot.result.data, 'base64'));
  }
  console.log(`PDF: ${pdf} | páginas: ${caixas.length} | Oxanium carregada: ${fonteOk}`);
} finally {
  ws.close(); proc.kill();
  setTimeout(() => { try { rmSync(perfil, { recursive: true, force: true }); } catch {} }, 500);
}
