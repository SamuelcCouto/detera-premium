// Monta o HTML do manual de identidade (A4 paisagem, escuro) a partir de
// conteudo.mjs e dos SVGs gerados por gerar-logo.mjs.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import * as C from './conteudo.mjs';

const projeto = process.argv[2];
const saida = process.argv[3];
const logo = (nome) => readFileSync(join(projeto, 'docs/identidade/logo', `${nome}.svg`), 'utf8');
const img = (nome) => pathToFileURL(join(projeto, 'docs/identidade/imagens', nome)).href;
const fonte = (nome) => pathToFileURL(join(projeto, 'public/fonts', nome)).href;
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const ts = readFileSync(join(projeto, 'src/components/brand/marca-paths.ts'), 'utf8');
const concat = (nome) => [...ts.match(new RegExp(`export const ${nome} =\\s*((?:"[^"]*"\\s*\\+?\\s*)+);`))[1].matchAll(/"([^"]*)"/g)].map((x) => x[1]).join('');
const METADE = concat('MARCA_METADE');
const NUCLEO = concat('MARCA_NUCLEO');

// Ícones em pixel, os mesmos blocos de src/components/ui/icones.tsx.
const icones = readFileSync(join(projeto, 'src/components/ui/icones.tsx'), 'utf8');
const blocosDe = (nome) => {
  const trecho = icones.slice(icones.indexOf(`const ${nome}: Blocos = [`), icones.indexOf('];', icones.indexOf(`const ${nome}: Blocos = [`)));
  return [...trecho.matchAll(/\[(\d+), (\d+), (\d+), (\d+)\]/g)].map((m) => m.slice(1).map(Number));
};
const icone = (nome) => `<svg viewBox="0 0 10 10" shape-rendering="crispEdges" fill="currentColor">${blocosDe(nome).map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`).join('')}</svg>`;

// Quadros da montagem do coração: as faixas aparecem da base para o topo.
const TOPO = 11.4, BASE = 29.8;
const quadroDaMontagem = (fracao, energia) => {
  const corte = BASE - (BASE - TOPO) * fracao;
  const id = `q${Math.round(fracao * 100)}${energia ? 'e' : ''}`;
  return `<svg viewBox="0 0 32 40"><defs><clipPath id="${id}"><rect x="0" y="${corte}" width="32" height="40"/></clipPath></defs>
  <g fill="#f2f3f5" clip-path="url(#${id})"><path d="${METADE}"/><path transform="translate(32 0) scale(-1 1)" d="${METADE}"/></g>
  ${energia ? `<g fill="#ff3b3b"><rect x="15.35" y="1.4" width="1.3" height="1.4"/><rect x="15.35" y="3.9" width="1.3" height="1.4"/><rect x="15.35" y="6.6" width="1.3" height="26.6"/><rect x="15.35" y="34.7" width="1.3" height="1.4"/><rect x="15.35" y="37.2" width="1.3" height="1.4"/><path d="${NUCLEO}"/></g>` : ''}
  <rect x="0.5" y="0.5" width="31" height="39" fill="none" stroke="#23262e" stroke-width="0.3"/></svg>`;
};

// A grade de construção (32 x 40) sob o símbolo.
const grade = () => {
  let linhas = '';
  for (let x = 0; x <= 32; x += 2) linhas += `<line x1="${x}" y1="0" x2="${x}" y2="40"/>`;
  for (let y = 0; y <= 40; y += 2) linhas += `<line x1="0" y1="${y}" x2="32" y2="${y}"/>`;
  return `<svg viewBox="-1 -1 34 42" class="construcao"><g stroke="#23262e" stroke-width="0.08">${linhas}</g>
  <line x1="16" y1="0" x2="16" y2="40" stroke="#4c7dff" stroke-width="0.12" stroke-dasharray="0.5 0.5"/>
  <g fill="#f2f3f5" fill-opacity="0.92"><path d="${METADE}"/><path transform="translate(32 0) scale(-1 1)" d="${METADE}"/></g>
  <g fill="#ff3b3b"><rect x="15.35" y="1.4" width="1.3" height="1.4"/><rect x="15.35" y="3.9" width="1.3" height="1.4"/><rect x="15.35" y="6.6" width="1.3" height="26.6"/><rect x="15.35" y="34.7" width="1.3" height="1.4"/><rect x="15.35" y="37.2" width="1.3" height="1.4"/><path d="${NUCLEO}"/></g>
  <g stroke="#7ca0ff" stroke-width="0.1" fill="none"><line x1="0" y1="11.4" x2="32" y2="11.4" stroke-dasharray="0.4 0.4"/><line x1="0" y1="29.8" x2="32" y2="29.8" stroke-dasharray="0.4 0.4"/></g></svg>`;
};

let numero = 0;
const pagina = (rotulo, corpo, classe = '') => {
  numero += 1;
  return `<section class="pagina ${classe}">
  ${rotulo ? `<header class="topo"><span>${esc(rotulo)}</span><span>${String(numero).padStart(2, '0')}</span></header>` : ''}
  ${corpo}
</section>`;
};
const losango = (cor = '#ff3b3b') => `<span class="losango" style="background:${cor}"></span>`;

const paginas = [];

// 1. Capa
paginas.push(pagina('', `<div class="capa">
  <div class="capa__letreiro">${logo('detera-letreiro-hero-escuro')}</div>
  <div class="capa__texto"><h1>${esc(C.capa.titulo)}</h1><p>${esc(C.capa.versao)}</p></div>
</div>`, 'pagina--capa'));

// 2. Sumário
// Página onde cada seção começa (o Logo ocupa três e o Movimento, duas).
const sumario = [['A marca', 3], ['Personalidade', 4], ['Logo', 5], ['Versões e usos', 8], ['Cor', 9], ['Contraste', 10], ['Tipografia', 11], ['Elementos', 12], ['Movimento', 13], ['Voz e escrita', 15], ['Aplicações', 16], ['O que a marca não faz', 18]];
paginas.push(pagina('Sumário', `<h2>Sumário</h2><ol class="sumario">${sumario.map(([s, n]) => `<li><span>${esc(s)}</span><span>${String(n).padStart(2, '0')}</span></li>`).join('')}</ol>`));

// 3. A marca
paginas.push(pagina(C.marca.titulo, `<div class="duas">
  <div><h2>${esc(C.marca.titulo)}</h2>${C.marca.paragrafos.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
  <div class="coluna-destaque">
    <p class="rotulo">Slogan</p><p class="slogan">${esc(C.marca.slogan)}</p>
    <p class="rotulo">Assinatura de linha</p><p>${esc(C.marca.tagline)}</p>
    <p class="rotulo">As quatro frentes</p>
    <ul class="frentes">${C.marca.frentes.map((f) => `<li>${losango(f.cor === 'sistema' ? '#4c7dff' : '#ff3b3b')}<div><strong>${esc(f.nome)}</strong><span>${esc(f.promessa)}</span></div></li>`).join('')}</ul>
  </div>
</div>`));

// 4. Personalidade
paginas.push(pagina(C.personalidade.titulo, `<h2>${esc(C.personalidade.titulo)}</h2>
<div class="tres">${C.personalidade.adjetivos.map((a) => `<div class="adjetivo"><p class="adjetivo__nome">${esc(a.nome)}</p><p>${esc(a.texto)}</p></div>`).join('')}</div>
<p class="rotulo mt">Princípios</p>
<ul class="lista-simples">${C.personalidade.principios.map((p) => `<li>${losango('#363b45')}${esc(p)}</li>`).join('')}</ul>`));

// 5. Logo: símbolo e anatomia
paginas.push(pagina(C.logo.titulo, `<div class="duas duas--logo">
  <div class="palco-logo">${logo('detera-simbolo-escuro')}</div>
  <div><h2>O símbolo</h2><p>${esc(C.logo.simbolo)}</p>
    <ul class="anatomia">${C.logo.anatomia.map((a, i) => `<li><span class="anatomia__marca anatomia__marca--${i}"></span><div><strong>${esc(a.nome)}</strong><span>${esc(a.texto)}</span></div></li>`).join('')}</ul>
  </div>
</div>`));

// 6. Letreiro e assinaturas
paginas.push(pagina(C.logo.titulo, `<h2>O letreiro e as assinaturas</h2><p class="largo">${esc(C.logo.letreiro)}</p>
<div class="assinaturas">${C.logo.versoesDeAssinatura.map((v) => `<figure><div class="assinaturas__arte assinaturas__arte--${v.arquivo}">${logo(`${v.arquivo}-escuro`)}</div><figcaption><strong>${esc(v.nome)}</strong><span>${esc(v.texto)}</span></figcaption></figure>`).join('')}</div>`));

// 7. Construção, respiro e tamanhos
paginas.push(pagina(C.logo.titulo, `<div class="tres tres--construcao">
  <div><h3>Construção</h3>${grade()}<p class="pequeno">${esc(C.logo.construcao)}</p></div>
  <div><h3>Área de respiro</h3><div class="respiro"><div class="respiro__caixa">${logo('detera-simbolo-escuro')}</div></div><p class="pequeno">${esc(C.logo.respiro)}</p></div>
  <div><h3>Tamanhos mínimos</h3><div class="minimos"><div class="minimos__simbolo">${logo('detera-simbolo-escuro')}</div><div class="minimos__letreiro">${logo('detera-letreiro-escuro')}</div></div>${C.logo.tamanhos.map((t) => `<p class="pequeno">${esc(t)}</p>`).join('')}</div>
</div>`));

// 8. Versões e usos errados
const errados = [
  `<div class="errado__arte">${logo('detera-simbolo-escuro').replace(/#ff3b3b/g, '#4c7dff')}</div>`,
  `<div class="errado__arte">${logo('detera-simbolo-escuro').replace('viewBox="0 0 32 40"', 'viewBox="-7 0 46 40"').replace('<path d="M14.6', '<path transform="translate(-5 0)" d="M14.6').replace('transform="translate(32 0) scale(-1 1)"', 'transform="translate(37 0) scale(-1 1)"')}</div>`,
  `<div class="errado__arte errado__arte--brilho">${logo('detera-simbolo-escuro')}</div>`,
  `<div class="errado__arte errado__texto">DETERA</div>`,
  `<div class="errado__arte errado__texto errado__texto--leve">DETERА</div>`,
  `<div class="errado__arte errado__arte--foto" style="background-image:url('${img('site-manifesto.jpg')}')">${logo('detera-simbolo-escuro')}</div>`,
];
paginas.push(pagina('Versões e usos', `<h2>Versões</h2>
<div class="versoes">${C.logo.versoes.map((v) => `<figure><div class="versoes__arte" style="background:${v.fundo}">${logo(`detera-assinatura-${v.variante}`)}</div><figcaption><strong>${esc(v.nome)}</strong><span>${esc(v.texto)}</span></figcaption></figure>`).join('')}</div>
<h3 class="mt">Usos errados</h3>
<div class="errados">${C.logo.usosErrados.map((u, i) => `<figure>${errados[i]}<figcaption><span class="nao">Errado</span> ${esc(u)}</figcaption></figure>`).join('')}</div>`));

// 9. Cor
paginas.push(pagina(C.cor.titulo, `<h2>${esc(C.cor.titulo)}</h2>
<div class="grupos-cor">${C.cor.grupos.map((g) => `<div><p class="rotulo">${esc(g.nome)}</p>${g.cores.map((c) => `<div class="cor"><span class="cor__amostra" style="background:${c.hex}"></span><div><strong>${esc(c.token)}</strong><span class="cor__hex">${c.hex.toUpperCase()}</span><span>${esc(c.papel)}</span></div></div>`).join('')}</div>`).join('')}</div>
<div class="regras-cor">${C.cor.regras.map((r) => `<p class="pequeno">${esc(r)}</p>`).join('')}</div>`));

// 10. Contraste
paginas.push(pagina(C.contraste.titulo, `<h2>${esc(C.contraste.titulo)}</h2><p class="largo">${esc(C.contraste.intro)}</p>
<div class="duas duas--contraste">
<table class="contraste"><thead><tr><th>Texto</th>${C.contraste.fundos.map((f) => `<th>${esc(f)}</th>`).join('')}</tr></thead>
<tbody>${C.contraste.linhas.map((l) => `<tr><td>${esc(l.texto)}</td>${l.valores.map((v, i) => `<td class="${l.ok[i] ? 'passa' : 'falha'}">${v}:1</td>`).join('')}</tr>`).join('')}</tbody></table>
<div><p class="rotulo">Correções</p>${C.contraste.correcoes.map((c) => `<p class="pequeno">${esc(c)}</p>`).join('')}
<p class="rotulo mt-p">Sobre fundo claro (#F2F3F5)</p><table class="contraste contraste--claro"><tbody>${C.cor.claro.map((c) => `<tr><td><span class="cor__amostra cor__amostra--mini" style="background:${c.hex}"></span>${esc(c.token)}</td><td>${c.hex.toUpperCase()}</td><td class="passa">${c.razao}:1</td></tr>`).join('')}</tbody></table></div>
</div>`));

// 11. Tipografia
paginas.push(pagina(C.tipografia.titulo, `<div class="duas duas--tipo">
<div><h2>${esc(C.tipografia.titulo)}</h2><p>${esc(C.tipografia.intro)}</p><p class="amostra-fonte">Aa</p><p class="pesos"><span style="font-weight:300">Leve 300</span><span style="font-weight:400">Regular 400</span><span style="font-weight:600">Seminegrito 600</span><span style="font-weight:700">Negrito 700</span></p>
<ul class="lista-simples">${C.tipografia.regras.map((r) => `<li>${losango('#363b45')}${esc(r)}</li>`).join('')}</ul></div>
<div class="escala">${C.tipografia.escala.map((e, i) => `<div class="escala__linha"><span class="escala__amostra" style="font-size:${[30, 25, 20, 15, 13, 11, 9][i]}pt;font-weight:${e.peso}">${esc(e.nome)}</span><span class="escala__meta">${esc(e.tamanho)}, peso ${e.peso}<br>${esc(e.uso)}</span></div>`).join('')}</div>
</div>`));

// 12. Elementos
paginas.push(pagina(C.elementos.titulo, `<h2>${esc(C.elementos.titulo)}</h2>
<div class="elementos">${C.elementos.itens.map((e, i) => `<div class="elemento"><div class="elemento__arte elemento__arte--${i}">${
  i === 0 ? '<span></span>'.repeat(38)
  : i === 1 ? `${losango('#363b45')}${losango('#ff3b3b')}${losango('#4c7dff')}`
  : i === 2 ? '<span class="trilha"></span>'
  : i === 3 ? `<span class="alma-grande">${logo('detera-alma')}</span><span class="alma-menu"><span>${logo('detera-alma')}</span>Vamos construir</span><span class="alma-menu alma-menu--off">Prefiro por e-mail</span>`
  : i === 4 ? '<span></span>'.repeat(48)
  : ['WHATSAPP', 'EMAIL', 'LINKEDIN', 'GITHUB', 'LINK_EXTERNO'].map((n) => `<span class="icone">${icone(n)}</span>`).join('')
}</div><p><strong>${esc(e.nome)}</strong> ${esc(e.texto)}</p></div>`).join('')}</div>`));

// 13. Movimento (1): gesto e verbos
paginas.push(pagina(C.movimento.titulo, `<h2>${esc(C.movimento.titulo)}</h2><p class="largo">${esc(C.movimento.intro)}</p>
<p class="rotulo">Gesto-assinatura</p><p class="gesto">${esc(C.movimento.gesto)}</p>
<div class="quadros">${[0.25, 0.5, 0.75, 1].map((f) => quadroDaMontagem(f, false)).join('')}${quadroDaMontagem(1, true)}</div>
<div class="verbos">${C.movimento.verbos.map((v) => `<div><strong>${esc(v.nome)}</strong><span>${esc(v.texto)}</span></div>`).join('')}</div>`));

// 14. Movimento (2): momento, sistemas, curvas
paginas.push(pagina(C.movimento.titulo, `<div class="duas duas--mov">
<div><p class="rotulo">Momento marcante</p><p>${esc(C.movimento.momento)}</p><img class="print" src="${img('site-travessia.jpg')}" alt=""></div>
<div><p class="rotulo">Sistemas do site todo</p>${C.movimento.sistemas.map((s) => `<p class="pequeno"><strong>${esc(s.nome)}.</strong> ${esc(s.texto)}</p>`).join('')}
<p class="rotulo mt-p">Materiais</p><p class="pequeno">${esc(C.movimento.materiais)}</p>
<p class="rotulo mt-p">Curvas e tempo</p><p class="pequeno">${esc(C.movimento.curvas)}</p>
<p class="rotulo mt-p">O que a marca não faz em movimento</p><p class="pequeno">${esc(C.movimento.naoFaz)}</p>
<p class="rotulo mt-p">Regras técnicas</p><p class="pequeno">${esc(C.movimento.tecnica)}</p></div>
</div>`));

// 15. Voz e escrita
paginas.push(pagina(C.voz.titulo, `<div class="duas">
<div><h2>${esc(C.voz.titulo)}</h2><p>${esc(C.voz.intro)}</p><ul class="lista-simples">${C.voz.regras.map((r) => `<li>${losango('#363b45')}${esc(r)}</li>`).join('')}</ul></div>
<div><p class="rotulo">Reescrita, antes e depois</p>${C.voz.exemplos.map((e) => `<div class="exemplo"><p class="exemplo__antes">${esc(e.antes)}</p><p class="exemplo__depois">${esc(e.depois)}</p></div>`).join('')}</div>
</div>`));

// 16 e 17. Aplicações
paginas.push(pagina(C.aplicacoes.titulo, `<h2>${esc(C.aplicacoes.titulo)}</h2>
<div class="aplicacoes">${C.aplicacoes.itens.slice(0, 4).map((a) => `<figure><img class="print" src="${img(a.imagem)}" alt=""><figcaption><strong>${esc(a.nome)}</strong> ${esc(a.texto)}</figcaption></figure>`).join('')}</div>`));
const [dialogo, celular] = C.aplicacoes.itens.slice(4);
paginas.push(pagina(C.aplicacoes.titulo, `<div class="aplicacoes aplicacoes--2">
  <figure><img class="print" src="${img(dialogo.imagem)}" alt=""><figcaption><strong>${esc(dialogo.nome)}</strong> ${esc(dialogo.texto)}</figcaption></figure>
  <figure class="celulares"><div><img class="print" src="${img(celular.imagem)}" alt=""><img class="print" src="${img(celular.imagem2)}" alt=""></div><figcaption><strong>${esc(celular.nome)}</strong> ${esc(celular.texto)}</figcaption></figure>
</div>
<p class="rotulo mt">Outras peças</p><ul class="lista-simples lista-simples--duas">${C.aplicacoes.pecas.map((p) => `<li>${losango('#363b45')}${esc(p)}</li>`).join('')}</ul>`));

// 18. O que a marca não faz
paginas.push(pagina(C.naoFaz.titulo, `<h2>${esc(C.naoFaz.titulo)}</h2><p class="largo">${esc(C.naoFaz.intro)}</p>
<ul class="nao-faz">${C.naoFaz.itens.map((i) => `<li><span class="nao-faz__marca"></span>${esc(i)}</li>`).join('')}</ul>`));

// 19. Contracapa
paginas.push(pagina('', `<div class="contracapa"><div class="contracapa__assinatura">${logo('detera-assinatura-escuro')}</div>
<p class="slogan">${esc(C.marca.slogan)}</p>
<p>${esc(C.contato.site)}<br>${esc(C.contato.email)}<br>${esc(C.contato.whatsapp)}<br>${esc(C.contato.local)}</p></div>`, 'pagina--capa'));

const css = `
@font-face { font-family: "Oxanium"; font-weight: 200 800; src: url("${fonte('oxanium-latin.woff2')}") format("woff2"); unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }
@font-face { font-family: "Oxanium"; font-weight: 200 800; src: url("${fonte('oxanium-latin-ext.woff2')}") format("woff2"); unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1E00-1E9F, U+2113, U+A720-A7FF; }
@page { size: 297mm 210mm; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; background: #07080b; }
body { font-family: "Oxanium", sans-serif; color: #f2f3f5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.pagina { width: 297mm; height: 210mm; padding: 15mm 18mm 14mm; position: relative; overflow: hidden; page-break-after: always; break-after: page; background: #07080b; }
.topo { position: absolute; left: 18mm; right: 18mm; top: 8mm; display: flex; justify-content: space-between; font-size: 7.5pt; color: #7c828e; border-bottom: 0.2mm solid #23262e; padding-bottom: 2mm; }
h1 { font-size: 40pt; font-weight: 700; letter-spacing: -0.03em; margin: 0; line-height: 1; }
h2 { font-size: 26pt; font-weight: 700; letter-spacing: -0.025em; margin: 6mm 0 5mm; line-height: 1.05; }
h3 { font-size: 13pt; font-weight: 700; margin: 6mm 0 3mm; }
p { font-size: 10pt; line-height: 1.55; color: #9ba1ac; margin: 0 0 3mm; max-width: 125mm; }
p.largo { max-width: 200mm; }
p.pequeno { font-size: 8.6pt; line-height: 1.5; }
strong { color: #f2f3f5; font-weight: 700; }
.rotulo { font-size: 8pt; color: #7c828e; margin: 0 0 1.6mm; font-weight: 600; }
.mt { margin-top: 7mm; } .mt-p { margin-top: 4mm; }
.duas { display: grid; grid-template-columns: 1.1fr 1fr; gap: 14mm; margin-top: 6mm; }
.tres { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10mm; }
.losango { display: inline-block; width: 2.2mm; height: 2.2mm; transform: rotate(45deg); flex: none; margin-right: 3mm; }
.lista-simples { list-style: none; padding: 0; margin: 0; }
.lista-simples li { display: flex; align-items: baseline; font-size: 9.6pt; line-height: 1.5; color: #9ba1ac; margin-bottom: 2.4mm; max-width: 170mm; }
.lista-simples--duas { display: grid; grid-template-columns: 1fr 1fr; column-gap: 12mm; }
.pagina--capa { display: flex; flex-direction: column; justify-content: center; }
.capa__letreiro svg { width: 190mm; height: auto; display: block; }
.capa__texto { margin-top: 12mm; border-top: 0.2mm solid #23262e; padding-top: 6mm; }
.capa__texto p { margin-top: 3mm; }
.sumario { list-style: none; padding: 0; margin: 4mm 0 0; columns: 2; column-gap: 20mm; width: 200mm; }
.sumario li { display: flex; justify-content: space-between; font-size: 13pt; padding: 2.6mm 0; border-bottom: 0.2mm solid #23262e; break-inside: avoid; }
.sumario li span:last-child { color: #7c828e; font-variant-numeric: tabular-nums; }
.coluna-destaque { border-left: 0.2mm solid #23262e; padding-left: 10mm; }
.slogan { font-size: 17pt; font-weight: 700; color: #f2f3f5; line-height: 1.2; max-width: 110mm; }
.frentes { list-style: none; padding: 0; margin: 0; }
.frentes li { display: flex; align-items: baseline; margin-bottom: 2.6mm; }
.frentes li div { display: flex; flex-direction: column; font-size: 9pt; color: #9ba1ac; }
.adjetivo { border-top: 0.2mm solid #363b45; padding-top: 5mm; }
.adjetivo__nome { font-size: 22pt; font-weight: 700; color: #f2f3f5; margin-bottom: 3mm; }
.duas--logo { grid-template-columns: 0.9fr 1.1fr; align-items: center; margin-top: 14mm; }
.palco-logo { display: flex; justify-content: center; align-items: center; height: 140mm; border: 0.2mm solid #23262e; }
.palco-logo svg { height: 105mm; width: auto; }
.anatomia { list-style: none; padding: 0; margin: 5mm 0 0; }
.anatomia li { display: flex; gap: 4mm; align-items: flex-start; margin-bottom: 3.4mm; }
.anatomia li div { display: flex; flex-direction: column; font-size: 9pt; color: #9ba1ac; }
.anatomia__marca { flex: none; width: 7mm; height: 7mm; margin-top: 0.6mm; }
.anatomia__marca--0 { background: #f2f3f5; clip-path: polygon(0 20%, 60% 0, 100% 40%, 100% 100%, 40% 100%, 0 60%); }
.anatomia__marca--1 { background: linear-gradient(90deg, transparent 43%, #ff3b3b 43%, #ff3b3b 57%, transparent 57%); }
.anatomia__marca--2 { background: #ff3b3b; clip-path: polygon(33% 0, 67% 0, 67% 33%, 100% 33%, 100% 67%, 67% 67%, 67% 100%, 33% 100%, 33% 67%, 0 67%, 0 33%, 33% 33%); }
.anatomia__marca--3 { background: repeating-linear-gradient(180deg, #ff3b3b 0 1.2mm, transparent 1.2mm 2.2mm); clip-path: inset(0 43% 0 43%); }
.assinaturas { display: grid; grid-template-columns: 1.3fr 1.3fr 0.6fr; gap: 8mm; margin-top: 8mm; align-items: end; }
.assinaturas figure { margin: 0; }
.assinaturas__arte { height: 62mm; border: 0.2mm solid #23262e; display: flex; align-items: center; justify-content: center; padding: 8mm; }
.assinaturas__arte svg { max-width: 100%; max-height: 100%; width: auto; height: auto; }
.assinaturas__arte--detera-simbolo svg { height: 34mm; }
figcaption { font-size: 8.6pt; line-height: 1.45; color: #9ba1ac; margin-top: 3mm; display: flex; flex-direction: column; }
.construcao { width: 62mm; height: auto; display: block; margin-bottom: 3mm; }
.respiro { height: 66mm; display: flex; align-items: center; justify-content: flex-start; margin-bottom: 3mm; }
.respiro__caixa { outline: 0.3mm dashed #4c7dff; outline-offset: 0; padding: 7mm; }
.respiro__caixa svg { height: 44mm; display: block; }
.minimos { display: flex; align-items: flex-end; gap: 8mm; height: 66mm; margin-bottom: 3mm; }
.minimos__simbolo svg { height: 8mm; display: block; }
.minimos__letreiro svg { height: 3mm; display: block; }
.versoes { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6mm; }
.versoes figure { margin: 0; }
.versoes__arte { height: 30mm; display: flex; align-items: center; justify-content: center; padding: 6mm; border: 0.2mm solid #23262e; }
.versoes__arte svg { width: 100%; height: auto; }
.errados { display: grid; grid-template-columns: repeat(6, 1fr); gap: 5mm; }
.errados figure { margin: 0; }
.errado__arte { height: 30mm; border: 0.2mm solid #23262e; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.errado__arte svg { height: 20mm; width: auto; }
.errado__arte--brilho svg { filter: drop-shadow(0 0 3mm #ff3b3b); }
.errado__texto { font-size: 15pt; font-weight: 800; color: #f2f3f5; letter-spacing: 0.02em; }
.errado__texto--leve { font-weight: 400; }
.errado__arte--foto { background-size: cover; background-position: 30% 40%; }
.errado__arte--foto svg { height: 26mm; }
.nao { color: #ff6b6b; font-weight: 700; }
.grupos-cor { display: grid; grid-template-columns: 1.3fr 1fr 1fr 1fr; gap: 8mm; }
.cor { display: flex; gap: 3mm; margin-bottom: 3.2mm; align-items: flex-start; }
.cor__amostra { flex: none; width: 11mm; height: 11mm; border: 0.2mm solid #363b45; }
.cor__amostra--mini { display: inline-block; width: 3.4mm; height: 3.4mm; vertical-align: middle; margin-right: 2mm; }
.cor div { display: flex; flex-direction: column; font-size: 7.8pt; color: #9ba1ac; line-height: 1.35; }
.cor__hex { color: #f2f3f5; font-variant-numeric: tabular-nums; }
.regras-cor { display: grid; grid-template-columns: 1fr 1fr; gap: 10mm; margin-top: 4mm; border-top: 0.2mm solid #23262e; padding-top: 4mm; }
.regras-cor p { max-width: none; }
.duas--contraste { grid-template-columns: 1.35fr 1fr; margin-top: 3mm; }
table.contraste { border-collapse: collapse; width: 100%; font-size: 8.4pt; }
.contraste th { text-align: left; font-weight: 600; color: #7c828e; padding: 2mm 2mm 2mm 0; border-bottom: 0.2mm solid #363b45; }
.contraste td { padding: 2mm 2mm 2mm 0; border-bottom: 0.2mm solid #23262e; color: #9ba1ac; font-variant-numeric: tabular-nums; }
.contraste td.passa { color: #f2f3f5; }
.contraste td.passa::after { content: " AA"; color: #7c828e; font-size: 7pt; }
.duas--tipo { grid-template-columns: 1fr 1.1fr; margin-top: 0; }
.amostra-fonte { font-size: 70pt; font-weight: 700; color: #f2f3f5; line-height: 1; margin: 4mm 0 2mm; }
.pesos { display: flex; gap: 5mm; font-size: 10pt; color: #f2f3f5; flex-wrap: wrap; max-width: none; }
.escala { border-left: 0.2mm solid #23262e; padding-left: 10mm; margin-top: 6mm; }
.escala__linha { display: flex; justify-content: space-between; align-items: baseline; gap: 6mm; padding: 2mm 0; border-bottom: 0.2mm solid #23262e; }
.escala__amostra { color: #f2f3f5; line-height: 1.1; letter-spacing: -0.01em; }
.escala__meta { font-size: 7.4pt; color: #7c828e; text-align: right; max-width: 62mm; line-height: 1.4; }
.elementos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7mm 10mm; }
.elemento p { font-size: 8.4pt; line-height: 1.5; max-width: none; }
.elemento__arte { height: 34mm; border: 0.2mm solid #23262e; margin-bottom: 3mm; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; gap: 6mm; }
.elemento__arte--0 span { position: absolute; width: 0.5mm; height: 0.5mm; background: #f2f3f5; }
${Array.from({ length: 38 }, (_, i) => `.elemento__arte--0 span:nth-child(${i + 1}) { left: ${(i * 37) % 97 + 1}%; top: ${(i * 53) % 91 + 3}%; opacity: ${[0.3, 0.55, 0.8, 1][i % 4]}; ${i % 9 === 0 ? 'width:0.9mm;height:0.9mm;' : ''}${i % 13 === 0 ? 'background:#ff6b6b;' : ''}}`).join('\n')}
.elemento__arte--1 .losango { width: 5mm; height: 5mm; margin: 0; }
.elemento__arte--1 .losango:first-child { background: #0e1015 !important; border: 0.3mm solid #363b45; }
.trilha { position: absolute; left: 50%; top: 0; bottom: 0; width: 0.25mm; background: #23262e; }
.trilha::before { content: ""; position: absolute; top: 40%; left: 50%; width: 2.6mm; height: 2.6mm; transform: translateX(-50%) rotate(45deg); background: #07080b; border: 0.25mm solid #363b45; }
.elemento__arte--3 { flex-direction: column; align-items: flex-start; padding-left: 12mm; gap: 2mm; }
.alma-grande { position: absolute; right: 8mm; top: 50%; transform: translateY(-50%); }
.alma-grande svg { width: 16mm; height: auto; display: block; }
.alma-menu { display: flex; align-items: center; font-size: 9pt; color: #f2f3f5; position: relative; }
.alma-menu span { position: absolute; left: -5.4mm; }
.alma-menu span svg { width: 3.6mm; display: block; }
.alma-menu--off { color: #9ba1ac; }
.elemento__arte--4 { display: grid; grid-template-columns: repeat(12, 1fr); grid-template-rows: repeat(4, 1fr); gap: 0; padding: 0; align-items: stretch; justify-items: stretch; }
.elemento__arte--4 span { background: #ff3b3b; }
${[1, 3, 4, 7, 9, 12, 14, 16, 18, 19, 22, 25, 27, 29, 30, 33, 35, 38, 40, 41, 43, 46, 47].map((n) => `.elemento__arte--4 span:nth-child(${n}) { background: transparent; }`).join('\n')}
.icone { color: #f2f3f5; }
.icone svg { width: 10mm; height: 10mm; display: block; }
.gesto { font-size: 15pt; color: #f2f3f5; font-weight: 700; max-width: 220mm; line-height: 1.25; }
.quadros { display: flex; gap: 5mm; margin: 5mm 0 6mm; }
.quadros svg { width: 30mm; height: auto; background: #0e1015; }
.verbos { display: grid; grid-template-columns: repeat(6, 1fr); gap: 5mm; }
.verbos div { border-top: 0.2mm solid #363b45; padding-top: 2.4mm; display: flex; flex-direction: column; font-size: 8pt; color: #9ba1ac; line-height: 1.4; }
.verbos strong { font-size: 10.5pt; margin-bottom: 1mm; }
.duas--mov { margin-top: 2mm; grid-template-columns: 1.15fr 1fr; }
img.print { width: 100%; height: auto; display: block; border: 0.2mm solid #23262e; }
.duas--mov img.print { margin-top: 3mm; }
.exemplo { border-top: 0.2mm solid #23262e; padding-top: 3mm; margin-bottom: 3mm; }
.exemplo__antes { text-decoration: line-through; text-decoration-color: #ff3b3b; color: #7c828e; font-size: 8.8pt; }
.exemplo__depois { color: #f2f3f5; font-size: 9.6pt; }
.aplicacoes { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm 8mm; }
.aplicacoes figure { margin: 0; }
.aplicacoes img.print { height: 60mm; object-fit: cover; object-position: top; }
.aplicacoes figcaption { display: block; }
.aplicacoes--2 { grid-template-columns: 1.5fr 1fr; margin-top: 8mm; }
.aplicacoes--2 img.print { height: 90mm; }
.celulares div { display: flex; gap: 4mm; }
.celulares img.print { height: 90mm; width: auto; }
.nao-faz { list-style: none; padding: 0; margin: 4mm 0 0; columns: 3; column-gap: 12mm; }
.nao-faz li { font-size: 9.6pt; color: #9ba1ac; padding: 2mm 0; border-bottom: 0.2mm solid #23262e; display: flex; align-items: center; gap: 3mm; break-inside: avoid; }
.nao-faz__marca { flex: none; width: 3mm; height: 0.5mm; background: #ff3b3b; }
.contracapa { display: flex; flex-direction: column; gap: 6mm; }
.contracapa__assinatura svg { width: 110mm; height: auto; display: block; }
.contracapa p { font-size: 11pt; }
`;

writeFileSync(saida, `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>DETERA, identidade visual</title><style>${css}</style></head><body>${paginas.join('\n')}</body></html>`);
console.log(`${numero} páginas em ${saida}`);
