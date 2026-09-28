// Renderiza os SVGs do logo em PNG (fundo transparente ou com a cor da
// versão) no Chrome headless, para o DOCX e para o Figma.
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const [pastaLogo, pastaSaida] = process.argv.slice(2);
mkdirSync(pastaSaida, { recursive: true });

// [arquivo SVG, largura px, altura px, fundo ou null]
const pedidos = [
  ['detera-letreiro-hero-claro', 1432, 404, null],
  ['detera-letreiro-hero-escuro', 1432, 404, null],
  ['detera-assinatura-claro', 1240, 329, null],
  ['detera-assinatura-escuro', 1240, 329, null],
  ['detera-simbolo-claro', 320, 400, null],
  ['detera-simbolo-escuro', 320, 400, null],
  ['detera-alma', 220, 199, null],
  ['detera-assinatura-escuro', 1000, 380, '#07080b', 'versao-escuro'],
  ['detera-assinatura-claro', 1000, 380, '#f2f3f5', 'versao-claro'],
  ['detera-assinatura-mono-claro', 1000, 380, '#07080b', 'versao-mono-claro'],
  ['detera-assinatura-mono-escuro', 1000, 380, '#f2f3f5', 'versao-mono-escuro'],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const port = 9300 + Math.floor(Math.random() * 600);
const perfil = mkdtempSync(join(tmpdir(), 'png-'));
const proc = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${perfil}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
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

try {
  await send('Page.enable');
  for (const [nome, w, h, fundo, saida] of pedidos) {
    const svg = readFileSync(join(pastaLogo, `${nome}.svg`), 'utf8');
    const html = `<!doctype html><html><body style="margin:0;background:${fundo ?? 'transparent'};width:${w}px;height:${h}px;display:flex;align-items:center;justify-content:center"><div style="width:${fundo ? w * 0.78 : w}px;height:${fundo ? h * 0.6 : h}px;display:flex;align-items:center;justify-content:center">${svg.replace('<svg ', '<svg style="width:100%;height:100%" preserveAspectRatio="xMidYMid meet" ')}</div></body></html>`;
    await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
    await send('Emulation.setDefaultBackgroundColorOverride', fundo ? {} : { color: { r: 0, g: 0, b: 0, a: 0 } });
    const temp = join(perfil, `${saida ?? nome}.html`);
    writeFileSync(temp, html);
    await send('Page.navigate', { url: pathToFileURL(temp).href });
    await sleep(300);
    const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: w, height: h, scale: 1 } });
    if (!shot.result) throw new Error(JSON.stringify(shot.error));
    writeFileSync(join(pastaSaida, `${saida ?? nome}.png`), Buffer.from(shot.result.data, 'base64'));
  }
  console.log(`${pedidos.length} PNGs em ${pastaSaida}`);
} finally {
  ws.close(); proc.kill();
  setTimeout(() => { try { rmSync(perfil, { recursive: true, force: true }); } catch {} }, 500);
}
