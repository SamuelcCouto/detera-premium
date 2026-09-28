# Identidade visual da DETERA

| Arquivo | O que é |
|---|---|
| `DETERA-identidade-visual.pdf` | O manual diagramado, 19 páginas em A4 paisagem, com a Oxanium embutida |
| `DETERA-identidade-visual.docx` | O mesmo conteúdo em Word, editável, em fundo claro |
| `logo/*.svg` | O logo em vetor: símbolo, letreiro, letreiro de apresentação (com o coração sob o A), assinatura horizontal e a alma, nas versões escuro, claro, mono clara e mono escura |
| `logo/png/` | Os mesmos em PNG, para onde SVG não entra |
| `imagens/` | Prints do site usados no manual |
| `figma-pendente/` | As cinco pranchas que faltam no Figma, como imagem (ver abaixo) |
| `fonte/` | O código que gera tudo isso |

Os SVGs saem da geometria de `src/components/brand/marca-paths.ts`, a mesma do site, do favicon e da imagem de compartilhamento. Mudou a marca lá, gere de novo aqui.

## Figma

Arquivo: https://www.figma.com/design/i5eEIvW5HUH8QErDNPo9Fv

- Variáveis de cor (`DETERA / cor`) com escopo por uso, e estilos de texto `DETERA/*` em Oxanium.
- Página **Marca**: o logo como componentes, com as cores ligadas às variáveis.
- Página **Manual**: pranchas 01 a 08 prontas. As pranchas 09 a 13 ficaram vazias porque o plano Starter do Figma chegou ao limite de 20 chamadas por mês da integração. As imagens em `figma-pendente/` são essas pranchas, para arrastar para dentro delas até dar para montar em vetor.

## Gerar de novo

Precisa de Node e do Chrome instalado em `C:/Program Files/Google/Chrome/Application/`.

```bash
cd docs/identidade/fonte
npm install docx@9
node gerar-logo.mjs ../../.. ../logo
node png.mjs ../logo ../logo/png
node gerar-manual.mjs ../../.. manual.html
node imprimir.mjs manual.html ../DETERA-identidade-visual.pdf paginas
node gerar-docx.mjs ../../.. ../DETERA-identidade-visual.docx
```

O texto do manual mora em `fonte/conteudo.mjs`, um arquivo só para PDF, DOCX e Figma.
