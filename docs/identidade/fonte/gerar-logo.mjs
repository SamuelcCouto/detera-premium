// Gera os SVGs do logo da DETERA a partir de src/components/brand/marca-paths.ts
// (a fonte única da geometria), sem redesenhar nada.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const raiz = process.argv[2];
const saida = process.argv[3];
mkdirSync(saida, { recursive: true });
const ts = readFileSync(join(raiz, 'src/components/brand/marca-paths.ts'), 'utf8');

const concatenada = (nome) => {
  const m = ts.match(new RegExp(`export const ${nome} =\\s*((?:"[^"]*"\\s*\\+?\\s*)+);`));
  return [...m[1].matchAll(/"([^"]*)"/g)].map((x) => x[1]).join('');
};
const METADE = concatenada('MARCA_METADE');
const NUCLEO = concatenada('MARCA_NUCLEO');
const linha = ts.match(/MARCA_LINHA = \{ x: ([\d.]+), largura: ([\d.]+) \}/);
const LINHA = { x: Number(linha[1]), largura: Number(linha[2]) };
const TRACOS = [...ts.slice(ts.indexOf('MARCA_TRACOS')).matchAll(/\{ y: ([\d.]+), altura: ([\d.]+) \}/g)].map((m) => ({ y: Number(m[1]), altura: Number(m[2]) }));
const nomeBloco = ts.slice(ts.indexOf('export const NOME_DETERA = ['), ts.indexOf('] as const;', ts.indexOf('export const NOME_DETERA = [')));
const LETRAS = [...nomeBloco.matchAll(/d: "([^"]+)"/g)].map((m) => m[1]);
if (LETRAS.length !== 6 || TRACOS.length !== 4) throw new Error('geometria não encontrada');

const cores = {
  escuro: { placa: '#f2f3f5', energia: '#ff3b3b', fundo: '#07080b' },
  claro: { placa: '#07080b', energia: '#ff3b3b', fundo: '#f2f3f5' },
  'mono-claro': { placa: '#f2f3f5', energia: '#f2f3f5', fundo: '#07080b' },
  'mono-escuro': { placa: '#07080b', energia: '#07080b', fundo: '#f2f3f5' },
};

// O símbolo no sistema 0 0 32 40, deslocado e escalado dentro do SVG maior.
const simbolo = ({ placa, energia }, transform = '') => `<g${transform ? ` transform="${transform}"` : ''}>
  <g fill="${placa}"><path d="${METADE}"/><path transform="translate(32 0) scale(-1 1)" d="${METADE}"/></g>
  <g fill="${energia}">${TRACOS.map((t) => `<rect x="${LINHA.x}" y="${t.y}" width="${LINHA.largura}" height="${t.altura}"/>`).join('')}<rect x="${LINHA.x}" y="6.6" width="${LINHA.largura}" height="26.6"/><path d="${NUCLEO}"/></g>
</g>`;
const letras = (cor, transform = '') => `<g fill="${cor}" fill-rule="evenodd"${transform ? ` transform="${transform}"` : ''}>${LETRAS.map((d) => `<path d="${d}"/>`).join('')}</g>`;
const svg = (viewBox, corpo, fundo) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${fundo ? `<rect x="-10000" y="-10000" width="20000" height="20000" fill="${fundo}"/>` : ''}${corpo}</svg>\n`;

for (const [variante, cor] of Object.entries(cores)) {
  writeFileSync(join(saida, `detera-simbolo-${variante}.svg`), svg('0 0 32 40', simbolo(cor)));
  writeFileSync(join(saida, `detera-letreiro-${variante}.svg`), svg('0 0 716 128', letras(cor.placa)));
  // Assinatura horizontal: símbolo com 2,14 vezes a altura das letras (a
  // proporção do rodapé do site), afastado dele por 0,77 da altura das letras.
  const k = 274 / 40;
  writeFileSync(
    join(saida, `detera-assinatura-${variante}.svg`),
    svg('0 0 1033 274', simbolo(cor, `scale(${k})`) + letras(cor.placa, 'translate(317 73)')),
  );
  // O letreiro do hero, com o coração embaixo do "A".
  writeFileSync(
    join(saida, `detera-letreiro-hero-${variante}.svg`),
    svg('0 0 716 202', letras(cor.placa) + simbolo(cor, 'translate(631 140) scale(1.3)')),
  );
}

// A alma: o coração vermelho sólido do cursor.
writeFileSync(
  join(saida, 'detera-alma.svg'),
  svg('5 11.4 22 19.9', `<g fill="#ff3b3b"><path d="${METADE}"/><path transform="translate(32 0) scale(-1 1)" d="${METADE}"/><path d="M14.5 14.2H17.5V29.8L16 31.3L14.5 29.8Z"/></g>`),
);

console.log('SVGs gerados em', saida);
