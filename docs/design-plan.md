# Plano de design — DETERA premium v2

A v1 premium (no ar em detera-premium-ten.vercel.app) manteve a identidade e trocou estrutura e movimento, mas o movimento dela era emprestado: o nome se desfazendo em blur e a cortina abrindo do centro são a assinatura da ORVA, a referência da skill. A v2 mantém o aspecto que funcionou (escuro, Oxanium, vermelho e azul com papel fixo, coração de placas, céu) e dá à DETERA um movimento que só ela teria, tirado do mundo de onde o nome veio: Undertale e a DETERMINAÇÃO.

O plano da v1 está no histórico do git (commit `84b04f5`).

## Diagnóstico do "travado"

Medido na versão publicada, rolando a página em ritmo constante num Chrome que simula celular (CPU 4× mais lenta):

| Cenário | Animações CSS rodando | Página pronta para animar |
|---|---|---|
| Como está | 271 infinitas (174 só das estrelas) | 19,8 s |
| Sem as estrelas animadas | 97 | 7,1 s |

Só desligar o cintilar das estrelas dobrou os quadros por segundo. Cada estrela é um elemento com animação própria, e a placa de vídeo compõe cada uma separadamente o tempo todo, com a página parada ou não. Somam-se a isso o blur animado em dezenas de letras, o vidro fosco do cabeçalho (redesenha o que passa por baixo a cada quadro) e o grão fixo por cima da tela inteira. Quem rola antes de a página ficar pronta pega o hero sem o trecho fixado montado.

A v2 resolve na raiz: o céu passa a ser um canvas só, e nenhum gesto novo usa blur, filtro ou vidro.

## Tema

- **Sujeito:** a DETERA, empresa de soluções web de Goiânia (sites, crescimento, sistemas, infraestrutura). O nome vem de DETERMINAÇÃO, a força do coração vermelho em Undertale.
- **Público:** donos de pequenas e médias empresas cujo digital trava em algum dos quatro sintomas.
- **Função da página:** levar a pessoa a abrir a conversa no WhatsApp sabendo o que a DETERA faz e por que ela é diferente.
- **O que só este site teria:** o coração de placas como alma e como cursor, texto dito como fala de jogo, blocos de pixel que encaixam na grade, pontos que salvam o progresso.

Limite com a obra original: a v2 usa gestos e ideias de Undertale. Não usa sprites, a fonte do jogo, sons nem frases do jogo. A referência aparece no movimento e na documentação de marca, nunca como cópia de material de terceiros.

## Paleta e contraste (WCAG 2.2)

AA pede 4,5:1 para texto normal, 3:1 para texto grande (a partir de 24px, ou 18,66px em negrito) e 3:1 para borda de componente interativo.

| Texto sobre fundo | vazio `#07080b` | camada `#0e1015` | camada-alta `#161920` |
|---|---|---|---|
| texto `#f2f3f5` | 18,04 AA | 17,14 AA | 15,84 AA |
| texto-suave `#9ba1ac` | 7,71 AA | 7,33 AA | 6,77 AA |
| texto-fraco `#767c88` | 4,78 AA | 4,54 AA | **4,19 só texto grande** |
| determinação `#ff3b3b` | 5,67 AA | 5,38 AA | 4,98 AA |
| determinação-viva `#ff6b6b` | 7,22 AA | 6,86 AA | 6,34 AA |
| sistema `#4c7dff` | 5,42 AA | 5,15 AA | 4,76 AA |
| sistema-viva `#7ca0ff` | 7,94 AA | 7,55 AA | 6,98 AA |

| Borda de componente | vazio | camada | camada-alta |
|---|---|---|---|
| contorno `#5c626d` (campo, botão de contorno) | 3,26 ok | 3,10 ok | **2,87 falha** |

| Pares invertidos | Razão |
|---|---|
| vazio sobre determinação (botão principal, seleção) | 5,67 AA |
| vazio sobre determinação-viva (botão em foco) | 7,22 AA |
| vazio sobre sistema | 5,42 AA |
| texto claro sobre determinação | **3,18, só texto grande.** Não é usado hoje e fica fora das regras para texto normal |

**Correções**, calculadas mexendo só na luminosidade em OKLCH (mesmo matiz, mesma croma), no tom mais próximo que passa nos três fundos:

| Token | Hoje | Proposta | Resultado (vazio · camada · camada-alta) |
|---|---|---|---|
| texto-fraco | `#767c88` | `#7c828e` | 5,19 · 4,93 · 4,56 |
| contorno | `#5c626d` | `#606671` | 3,47 · 3,29 · 3,05 |

As bordas decorativas (`borda`, `borda-viva`) ficam abaixo de 3:1 de propósito: separam blocos e nunca são o único sinal de um componente.

## Tipografia

Uma família, Oxanium (regra do projeto), com papéis por peso. O nome "DETERA" continua desenhado à mão em SVG. Sem rótulos em caixa alta: tudo em caixa de frase.

## Identidade de movimento

- **Materiais e objetos:** blocos de pixel (as placas do coração), a linha de energia que atravessa o coração, a grade, o cursor de seleção (o coração que marca a opção escolhida), a caixa de diálogo em que a fala aparece letra a letra, o ponto de salvar, o céu.
- **Verbos:** encaixar (o bloco entra na grade de uma vez, sem deslizar); carregar (a linha enche em degraus); falar (o texto sai caractere a caractere e pausa na pontuação); saltar (o cursor pula de opção em opção, sem viagem); apagar (a fala volta letra a letra); salvar (o nó acende e fica aceso).
- **Três adjetivos:** exata, persistente, lúdica.
- **Gesto-assinatura:** o coração se monta bloco a bloco, a linha de energia carrega de cima a baixo e o núcleo acende. No fim do hero, a câmera atravessa o núcleo.
- **Curvas e tempo:** `steps(n)` para tudo que é pixel (encaixe, carga, fala); `power3.out` só para deslocamentos grandes (o coração indo ao centro); o cursor salta sem curva nenhuma. Ritmo curto e seco.
- **O que a marca não faz:** blur ou desfoque de qualquer tipo, brilho neon, cortina do centro, surgir-e-subir genérico, mola (`elastic`, `back.out`), gradiente, vidro.
- **Teste da troca:** com o branco, o grená e a serifa da ORVA, este site ainda seria a DETERA, porque tudo anda em degraus de pixel, o texto é dito como fala de jogo e um coração é o cursor da página inteira. Nenhum desses gestos existe na ORVA nem na Stillo.

## Sistemas do site todo

Estes três valem em todas as seções e são o que faz o site inteiro responder à pessoa:

1. **Céu vivo, um canvas só.** Fixo atrás da página, com camadas em profundidade. A rolagem desloca as camadas em velocidades diferentes e, quando a rolagem é rápida, as estrelas esticam num rastro curto na direção do movimento. A densidade segue a curva que o site já tinha: cheio no hero, no manifesto e no contato, quase apagado onde se lê muito. Um elemento só na tela, desenhado só quando visível, com resolução limitada; parado com movimento reduzido.
2. **Cursor-coração.** Em toda lista de escolhas (menu, frentes, perguntas, links do rodapé, as duas opções da chamada, campos do formulário), o coração salta para a opção sob o ponteiro ou o foco do teclado, como o cursor de um menu de jogo. Substitui o hover genérico: só o que é escolha ganha o coração, e o contorno de foco continua.
3. **Fala.** Onde o site fala com a pessoa, o texto sai letra a letra com pausa na pontuação, em degraus e sem cursor de terminal: o slogan do hero, o manifesto, a pergunta da chamada e as respostas do FAQ ao abrir.

## Mapa de seções

| Ordem | Seção | Mecânica | Gesto | Conteúdo |
|---|---|---|---|---|
| — | Cabeçalho | fixo, sólido fora do hero (sem vidro) | cursor-coração no menu; o menu do celular abre preenchendo a tela numa grade de blocos | navegação, CTA |
| 1 | Hero | **Fixado #1** (`+=130%`) | ao carregar: o coração se monta bloco a bloco, a linha carrega, as letras do nome encaixam uma a uma e o slogan é falado. Na rolagem: as letras descem para fora em degraus, o slogan é apagado de trás para frente, o coração vai ao centro e cresce, e a câmera atravessa o núcleo: a cruz vermelha toma a tela e se parte numa grade de blocos que se apagam em sequência, abrindo a prova | nome, slogan, frase, CTAs, frentes |
| 2 | Cases | sem pin | o print de cada site se monta bloco a bloco ao entrar (grade com ordem sorteada por semente); as notas contam em degraus | 2 cases + 2 em obra |
| 3 | Diagnóstico | sem pin | os filetes se desenham em degraus | 4 sintomas |
| 4 | Soluções | coluna presa (desktop) e carrossel (celular) | o cursor-coração percorre as entregas da frente em leitura conforme a rolagem; no celular, marca o card encaixado | 4 frentes |
| 5 | Personalidade | **Fixado #2** (`+=240%`, antes 320%) | a frase genérica é apagada letra a letra e a específica é falada no lugar; os quatro nós salvam; no fecho o coração se monta bloco a bloco | 4 pares + fecho |
| 6 | Processo | coluna presa (existe) | o coração salta de nó em nó com a rolagem e cada nó alcançado fica salvo; no fim ele percorre o laço 05 → 01 de volta ao começo | 5 etapas |
| 7 | Chamada | sem pin | caixa de diálogo: a pergunta é falada ao entrar e as duas saídas aparecem como escolhas, com o coração na primeira | CTA |
| 8 | Sobre | coluna presa (existe) | quieto de propósito | texto + fundador |
| 9 | Perguntas | sem pin | abrir uma pergunta fala a resposta | FAQ |
| 10 | Contato | sem pin | cursor-coração no campo em foco | canais + formulário |
| 11 | Rodapé | grade | nada | — |

Dois trechos fixados, os dois mais curtos que na v1. O resto acompanha a rolagem sem prender a página.

## Momento marcante

A travessia do núcleo, no fim do hero: o coração que acabou de se montar cresce até a cruz vermelha do núcleo ocupar a tela, e a tela vermelha se parte em blocos que se apagam, abrindo a primeira prova. É o gesto-assinatura levado ao limite e a passagem da marca para o trabalho.

## O que sai

| Hoje | Por quê |
|---|---|
| Auras e nebulosas (brilhos radiais borrados) | são orbs radiais |
| Vidro fosco do cabeçalho | é vidro, e custa um redesenho a cada quadro |
| Brilho vermelho no coração, nos nós e na barra de obra | puxa para neon |
| Nome se desfazendo em blur; prints e chamada abrindo do centro | gestos da ORVA, e o blur pesa |
| Surgir-e-subir em cada bloco (`data-surgir`) | entrada genérica espalhada |
| Linha vermelha enchendo ao lado do processo | faixa colorida na lateral |
| Reflexo que segue o mouse no botão | hover genérico |
| Grão fixo sobre a tela | camada inteira composta a cada quadro, sem função |
| 174 estrelas animadas uma a uma | viram o canvas |
| Moldura de navegador com três bolinhas | janela decorativa; fica só a faixa com o domínio real |
| Setas depois dos links, rótulos em caixa alta, "A · B" | modelo pronto; o coração marca a escolha |
| Ícones no traço do Lucide | redesenhados em pixel, na grade do coração |
| 47 travessões e as construções "não é X, é Y" no texto | pedido seu; reescrita frase a frase sem mudar o sentido |

## Mídia

Sem vídeo e sem 3D: a mídia é o próprio sistema (céu, coração, blocos). As fotos dos cases continuam em `public/cases/`.

## Documentação de identidade

Um conteúdo, três formatos: história e conceito (DET de determinação), logo (símbolo, letreiro, assinatura, construção, respiro, tamanhos mínimos, usos errados), paleta com a tabela de contraste, tipografia, elementos (céu, nó, cursor-coração, blocos), identidade de movimento, voz e escrita, aplicações e o que a marca não faz.

- **PDF:** diagramado em HTML com a Oxanium embutida e impresso pelo Chrome.
- **DOCX:** mesmo conteúdo, editável no Word.
- **Figma:** o conector do Figma desta sessão está sem autorização. Autorizado, monto o arquivo com variáveis de cor, estilos de texto e o logo como componente. Sem ele, entrego os SVGs do logo prontos para arrastar para o Figma.

## Verificação

`tsc`, `eslint`, `build`. O mesmo teste de fluidez de antes e depois, com a meta de a página ficar pronta para animar em menos de 5 s no celular simulado. Prints em 1440×900, 1280×720, 390×844, 375×667 e 360×780; movimento reduzido; teclado (o cursor-coração segue o foco); console limpo; deploy e conferência em produção.
