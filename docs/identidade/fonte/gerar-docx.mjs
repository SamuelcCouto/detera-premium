// Gera o manual de identidade em .docx (A4 retrato, página no cinza-claro da
// marca) a partir de conteudo.mjs e dos PNGs do logo.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  AlignmentType, BorderStyle, Document, Footer, HeadingLevel, ImageRun, LevelFormat,
  Packer, PageBreak, PageNumber, Paragraph, ShadingType, Table, TableCell, TableRow,
  TextRun, WidthType,
} from 'docx';

import * as C from './conteudo.mjs';

const [projeto, saida] = process.argv.slice(2);
const png = (nome) => readFileSync(join(projeto, 'docs/identidade/logo/png', `${nome}.png`));
const foto = (nome) => readFileSync(join(projeto, 'docs/identidade/imagens', nome));

// Cores para fundo claro (medidas no manual): texto, secundário, vermelho e
// azul que passam no AA sobre #F2F3F5.
const TEXTO = '07080B';
const SECUNDARIO = '606671';
const VERMELHO = 'DF021D';
const AZUL = '3865E5';
const FILETE = 'C9CCD2';
const FONTE = 'Oxanium';
const LARGURA = 9638; // A4 com margens de 2 cm, em DXA

const p = (texto, opcoes = {}) => new Paragraph({ spacing: { after: 140, line: 300 }, ...opcoes, children: [new TextRun({ text: texto, color: opcoes.cor ?? TEXTO, size: opcoes.tamanho ?? 21, bold: opcoes.negrito })] });
const rotulo = (texto) => new Paragraph({ spacing: { before: 240, after: 80 }, children: [new TextRun({ text: texto, color: SECUNDARIO, size: 17, bold: true })] });
const h1 = (texto) => new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [new TextRun(texto)] });
const h2 = (texto) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(texto)] });
const item = (texto, negrito) => new Paragraph({
  numbering: { reference: 'losango', level: 0 },
  spacing: { after: 90, line: 290 },
  children: negrito
    ? [new TextRun({ text: `${negrito} `, bold: true, color: TEXTO, size: 21 }), new TextRun({ text: texto, color: TEXTO, size: 21 })]
    : [new TextRun({ text: texto, color: TEXTO, size: 21 })],
});
const imagem = (dados, tipo, largura, altura, depois = 200) => new Paragraph({ spacing: { after: depois }, children: [new ImageRun({ type: tipo, data: dados, transformation: { width: largura, height: altura } })] });
const legenda = (texto) => new Paragraph({ spacing: { after: 220 }, children: [new TextRun({ text: texto, color: SECUNDARIO, size: 17 })] });

const semBorda = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const borda = { style: BorderStyle.SINGLE, size: 4, color: FILETE };
const celula = (conteudo, largura, { fundo, negrito, cor } = {}) => new TableCell({
  width: { size: largura, type: WidthType.DXA },
  shading: fundo ? { type: ShadingType.CLEAR, color: 'auto', fill: fundo } : undefined,
  margins: { top: 80, bottom: 80, left: 100, right: 100 },
  borders: { top: semBorda, left: semBorda, right: semBorda, bottom: borda },
  children: (Array.isArray(conteudo) ? conteudo : [conteudo]).map((t) => new Paragraph({ children: [new TextRun({ text: t, size: 18, bold: negrito, color: cor ?? TEXTO })] })),
});
const tabela = (larguras, cabecalho, linhas) => new Table({
  width: { size: LARGURA, type: WidthType.DXA },
  columnWidths: larguras,
  rows: [
    new TableRow({ tableHeader: true, children: cabecalho.map((t, i) => celula(t, larguras[i], { negrito: true, cor: SECUNDARIO })) }),
    ...linhas.map((l) => new TableRow({ children: l.map((c, i) => (typeof c === 'object' && !Array.isArray(c) ? celula(c.texto ?? '', larguras[i], c) : celula(c, larguras[i]))) })),
  ],
});

const corpo = [];

// Capa
corpo.push(
  new Paragraph({ spacing: { before: 2400, after: 600 }, children: [new ImageRun({ type: 'png', data: png('detera-letreiro-hero-claro'), transformation: { width: 520, height: 147 } })] }),
  new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: C.capa.titulo, bold: true, size: 64, color: TEXTO })] }),
  p(C.capa.versao, { cor: SECUNDARIO }),
  p('Este documento tem o mesmo conteúdo do PDF de identidade visual, em formato editável. As cores de texto sobre fundo claro seguem a tabela de contraste da seção Cor.', { cor: SECUNDARIO, tamanho: 18 }),
);

// A marca
corpo.push(h1(C.marca.titulo), ...C.marca.paragrafos.map((t) => p(t)));
corpo.push(rotulo('Slogan'), p(C.marca.slogan, { negrito: true, tamanho: 30 }));
corpo.push(rotulo('Assinatura de linha'), p(C.marca.tagline));
corpo.push(rotulo('As quatro frentes'), ...C.marca.frentes.map((f) => item(f.promessa, `${f.nome}.`)));

// Personalidade
corpo.push(h1(C.personalidade.titulo), ...C.personalidade.adjetivos.map((a) => item(a.texto, `${a.nome}.`)));
corpo.push(rotulo('Princípios'), ...C.personalidade.principios.map((t) => item(t)));

// Logo
corpo.push(h1(C.logo.titulo), h2('O símbolo'), imagem(png('detera-simbolo-claro'), 'png', 96, 120), p(C.logo.simbolo));
corpo.push(rotulo('Anatomia'), ...C.logo.anatomia.map((a) => item(a.texto, `${a.nome}.`)));
corpo.push(h2('O letreiro e as assinaturas'), p(C.logo.letreiro));
corpo.push(imagem(png('detera-letreiro-hero-claro'), 'png', 400, 113, 80), legenda(`${C.logo.versoesDeAssinatura[0].nome}. ${C.logo.versoesDeAssinatura[0].texto}`));
corpo.push(imagem(png('detera-assinatura-claro'), 'png', 380, 101, 80), legenda(`${C.logo.versoesDeAssinatura[1].nome}. ${C.logo.versoesDeAssinatura[1].texto}`));
corpo.push(imagem(png('detera-simbolo-claro'), 'png', 64, 80, 80), legenda(`${C.logo.versoesDeAssinatura[2].nome}. ${C.logo.versoesDeAssinatura[2].texto}`));
corpo.push(h2('Construção'), p(C.logo.construcao));
corpo.push(h2('Área de respiro'), p(C.logo.respiro));
corpo.push(h2('Tamanhos mínimos'), ...C.logo.tamanhos.map((t) => item(t)));

// Versões e usos
corpo.push(h1('Versões e usos'));
C.logo.versoes.forEach((v) => {
  corpo.push(imagem(png(`versao-${v.variante}`), 'png', 300, 114, 60), legenda(`${v.nome}. ${v.texto}`));
});
corpo.push(h2('Usos errados'), ...C.logo.usosErrados.map((u) => item(u, 'Errado:')));

// Cor
corpo.push(h1(C.cor.titulo), ...C.cor.regras.map((t) => p(t)));
C.cor.grupos.forEach((g) => {
  corpo.push(rotulo(g.nome));
  corpo.push(tabela([900, 2300, 1400, 5038], ['Cor', 'Token', 'Hex', 'Papel'], g.cores.map((c) => [{ texto: '', fundo: c.hex.slice(1) }, c.token, c.hex.toUpperCase(), c.papel])));
});
corpo.push(rotulo('Cores para texto sobre fundo claro (#F2F3F5)'));
corpo.push(tabela([900, 4238, 2000, 2500], ['Cor', 'Uso', 'Hex', 'Contraste'], C.cor.claro.map((c) => [{ texto: '', fundo: c.hex.slice(1) }, c.token, c.hex.toUpperCase(), `${c.razao}:1, AA`])));

// Contraste
corpo.push(h1(C.contraste.titulo), p(C.contraste.intro));
corpo.push(tabela([3238, 2133, 2133, 2134], ['Texto', ...C.contraste.fundos], C.contraste.linhas.map((l) => [l.texto, ...l.valores.map((v) => `${v}:1, AA`)])));
corpo.push(rotulo('Correções'), ...C.contraste.correcoes.map((t) => item(t)));

// Tipografia
corpo.push(h1(C.tipografia.titulo), p(C.tipografia.intro));
corpo.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: 'Aa', font: FONTE, size: 96, bold: true, color: TEXTO })] }));
corpo.push(tabela([1800, 1600, 900, 5338], ['Nível', 'Tamanho', 'Peso', 'Uso'], C.tipografia.escala.map((e) => [e.nome, e.tamanho, e.peso, e.uso])));
corpo.push(rotulo('Regras'), ...C.tipografia.regras.map((t) => item(t)));
corpo.push(p('A Oxanium é gratuita (Google Fonts). Se ela não estiver instalada no computador, o Word mostra este documento com uma fonte substituta; instale a Oxanium para ver a tipografia da marca.', { cor: SECUNDARIO, tamanho: 17 }));

// Elementos
corpo.push(h1(C.elementos.titulo), ...C.elementos.itens.map((e) => item(e.texto, `${e.nome}.`)));
corpo.push(imagem(png('detera-alma'), 'png', 44, 40, 60), legenda('A alma, o coração vermelho sólido do cursor.'));

// Movimento
corpo.push(h1(C.movimento.titulo), p(C.movimento.intro));
corpo.push(rotulo('Gesto-assinatura'), p(C.movimento.gesto, { negrito: true, tamanho: 26 }));
corpo.push(rotulo('Verbos'), tabela([2000, 7638], ['Verbo', 'Como se move'], C.movimento.verbos.map((v) => [v.nome, v.texto])));
corpo.push(rotulo('Momento marcante'), p(C.movimento.momento));
corpo.push(imagem(foto('site-travessia.jpg'), 'jpg', 520, 325, 80), legenda('A travessia do núcleo no site.'));
corpo.push(rotulo('Sistemas do site todo'), ...C.movimento.sistemas.map((s) => item(s.texto, `${s.nome}.`)));
corpo.push(rotulo('Materiais'), p(C.movimento.materiais));
corpo.push(rotulo('Curvas e tempo'), p(C.movimento.curvas));
corpo.push(rotulo('O que a marca não faz em movimento'), p(C.movimento.naoFaz));
corpo.push(rotulo('Regras técnicas'), p(C.movimento.tecnica));

// Voz e escrita
corpo.push(h1(C.voz.titulo), p(C.voz.intro), ...C.voz.regras.map((t) => item(t)));
corpo.push(rotulo('Reescrita, antes e depois'));
corpo.push(tabela([4819, 4819], ['Antes', 'Depois'], C.voz.exemplos.map((e) => [{ texto: e.antes, cor: SECUNDARIO }, e.depois])));

// Aplicações
corpo.push(h1(C.aplicacoes.titulo));
C.aplicacoes.itens.forEach((a) => {
  if (a.imagem2) {
    corpo.push(new Paragraph({ spacing: { after: 80 }, children: [
      new ImageRun({ type: 'jpg', data: foto(a.imagem), transformation: { width: 180, height: 390 } }),
      new TextRun('   '),
      new ImageRun({ type: 'jpg', data: foto(a.imagem2), transformation: { width: 180, height: 390 } }),
    ] }));
  } else {
    corpo.push(imagem(foto(a.imagem), 'jpg', 520, 325, 80));
  }
  corpo.push(legenda(`${a.nome}. ${a.texto}`));
});
corpo.push(rotulo('Outras peças'), ...C.aplicacoes.pecas.map((t) => item(t)));

// O que a marca não faz
corpo.push(h1(C.naoFaz.titulo), p(C.naoFaz.intro), ...C.naoFaz.itens.map((t) => item(t)));

// Contato
corpo.push(
  new Paragraph({ pageBreakBefore: true, spacing: { before: 3000, after: 400 }, children: [new ImageRun({ type: 'png', data: png('detera-assinatura-claro'), transformation: { width: 380, height: 101 } })] }),
  p(C.marca.slogan, { negrito: true, tamanho: 26 }),
  p(C.contato.site), p(C.contato.email), p(C.contato.whatsapp), p(C.contato.local),
);

const doc = new Document({
  creator: 'DETERA',
  title: 'DETERA, identidade visual',
  description: 'Manual de identidade visual da DETERA, versão 2.',
  background: { color: 'F2F3F5' },
  styles: {
    default: { document: { run: { font: FONTE, size: 21, color: TEXTO } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONTE, size: 44, bold: true, color: TEXTO }, paragraph: { spacing: { before: 0, after: 280 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONTE, size: 28, bold: true, color: TEXTO }, paragraph: { spacing: { before: 320, after: 140 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [{
      reference: 'losango',
      levels: [{ level: 0, format: LevelFormat.BULLET, text: '◆', alignment: AlignmentType.LEFT, style: { run: { color: VERMELHO, size: 14 }, paragraph: { indent: { left: 400, hanging: 280 } } } }],
    }],
  },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
    footers: {
      default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'DETERA, identidade visual   ', color: SECUNDARIO, size: 16 }), new TextRun({ children: [PageNumber.CURRENT], color: SECUNDARIO, size: 16 })] })] }),
    },
    children: corpo,
  }],
});

writeFileSync(saida, await Packer.toBuffer(doc));
console.log('DOCX:', saida);
// AZUL fica exportado no manual (tabela "sobre claro"); aqui não há texto azul.
void AZUL;
void PageBreak;
