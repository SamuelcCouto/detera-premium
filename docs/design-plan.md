# DETERA v3: "Reentrada"

Plano de design e movimento da terceira versão. A v2 (coração em pixel, fala letra a letra, céu em canvas) foi recusada pelo dono da marca por ainda ter "cara de site feito por IA". A v3 refez a experiência como uma missão espacial dirigida pela rolagem, mantendo o que é marca (o nome desenhado, o símbolo, o vermelho de determinação, o azul de sistema, a Oxanium).

**Revisão de novembro de 2026.** O primeiro corte da v3 tinha 22 cenas. O pedido: enxugar texto e animação, porque quase ninguém vê uma página até o fim, e pôr os projetos no centro. O roteiro caiu para 10 cenas, a apresentação leva direto aos projetos, e o resto foi para dossiês.

## Tema

- **Sujeito:** a DETERA, empresa de soluções web de Goiânia. DET vem de DETERMINAÇÃO.
- **Público:** donos de pequenas e médias empresas.
- **Função da página:** mostrar o que já foi construído e levar a pessoa a abrir a conversa no WhatsApp.
- **A metáfora:** o portfólio é um sistema solar. O núcleo vermelho (determinação) é a estrela, cada projeto é um planeta na cor do próprio mundo, e o planeta azul ainda vazio é o de quem está lendo.

## Paleta

| Papel | Token | Hex | Uso |
|---|---|---|---|
| Vácuo | `vacuo` | `#050913` | fundo do espaço (azul-noite, não preto tingido) |
| Painel | `painel` | `#0C1424` | cartões e dossiês |
| Luz estelar | `luz` | `#EEF0F6` | texto principal |
| Poeira | `poeira` | `#9AA6BE` | texto de apoio |
| Determinação | `determinacao` | `#FF3B3B` | ação, núcleo, botão principal |
| Plasma | `plasma` | `#FF8A3D` | só na reentrada |
| Atmosfera | `atmosfera` | `#8FB3FF` | instrumentos, links, limbo dos planetas |
| Sistema | `sistema` | `#4C7DFF` | o planeta azul |
| Traço | `traco` | `#5A6A8C` | linha de instrumento e borda de componente |

Contraste medido (WCAG 2.2): luz/vácuo 17,47; poeira/vácuo 8,13; poeira/painel 7,51; determinação/vácuo 5,63; plasma/vácuo 8,49; atmosfera/vácuo 9,54; sistema/vácuo 5,39; vácuo sobre determinação 5,63; traço/vácuo 3,67; traço/painel 3,40. Texto nunca fica direto sobre o horizonte laranja do crepúsculo: lá ele vai num cartão `painel`.

Cor de cada planeta: Sencis em porcelana e dourado, FIDÈLE gigante rosa com anel, Yasmin em preto e dourado, Keep New em aço e ferrugem, o próximo em oceano azul.

## Tipografia

- **Oxanium** (marca, regra do projeto): títulos, instrumentos, botões. 500 a 800.
- **Spectral** (Production Type, OFL, servida de `public/fonts`): a voz do narrador. 300, 400 e 300 itálico.

## Identidade de movimento

- **Verbos:** atravessar, orbitar, queimar, pousar.
- **Três adjetivos:** pesado, imersivo, preciso.
- **Gesto de abertura: o zoom na Via Láctea.** A primeira rolagem desce da galáxia inteira até o sistema solar, em escala logarítmica, com rastro radial, até o Sol do braço virar o núcleo do sistema.
- **Gesto de fechamento: a reentrada.** A câmera mergulha no planeta azul, as bordas da tela viram plasma, tudo treme, o altímetro despenca e uma única frase cai do alto. As nuvens rasgam e a cena pousa no crepúsculo do contato.
- **Apoio, só o necessário:** as letras do nome caem ao carregar; a câmera viaja em arco de planeta em planeta, com o cartão entrando de um lado e saindo pelo outro; etiquetas presas aos planetas; o cursor puxa a câmera com mola.
- **O que saiu no enxugamento:** cartões em órbita, trilha de atos, separação em camadas dentro do cartão, relevo correndo de lado, cápsula do processo, rastro por velocidade da rolagem.
- **O que a marca não faz:** blur, vidro, neon, degradê de enfeite, cortina do centro, fade-and-rise em cada bloco, hover genérico, rótulo em caixa alta, seta no fim do botão.

## Mecânica

Uma seção `missao` com altura virtual e um palco `sticky` de 100svh. A rolagem vira uma posição fracionária `s` entre cenas (keyframes de estado); uma função só interpola o estado, e os cartões ativos recebem `--d` (posição relativa, de -1 a 1). Um canvas Three.js fixo lê o estado a cada quadro. A Via Láctea é uma cena à parte, com câmera própria, porque as escalas não cabem no mesmo espaço. Sem pin do ScrollTrigger e sem snap.

Conteúdo longo fica em dossiês (`<dialog>`): o caso inteiro com as notas medidas, as entregas, como funciona, quem faz e as perguntas frequentes.

**Modo linear** (movimento reduzido, tela com até 520px de altura, ou sem WebGL): os cartões viram seções empilhadas, a cena 3D fica parada na Via Láctea, e nenhum tremor.

## Mapa de cenas

| Cena | Câmera | Cartão |
|---|---|---|
| `topo` | a Via Láctea inteira | nome, slogan, duas ações |
| `projetos` | o sistema solar, planetas etiquetados | "O que já construímos" |
| `projeto-sencis`, `projeto-fidele` | um planeta por cena | foto, nome, setor, resumo, abrir o site, ler o caso |
| `projeto-yasmin`, `projeto-keepnew` | um planeta por cena | nome, setor, resumo, abrir o site |
| `solucoes` | perto do núcleo | as quatro frentes e três dossiês |
| `seu-projeto` | o planeta azul | "O próximo planeta é o seu" |
| `reentrada` | dentro da atmosfera, em plasma | uma frase |
| `sinal` | o crepúsculo | conversar no WhatsApp |

Depois da missão, a página volta a rolar como página: contato, formulário e rodapé.
