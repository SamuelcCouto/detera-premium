# DETERA v3: "Reentrada"

Plano de design e movimento da terceira versão. A v2 (coração em pixel, fala letra a letra, céu em canvas) foi recusada pelo dono da marca por ainda ter "cara de site feito por IA": fundo quase preto com um único acento vermelho é exatamente o traço 2 da lista de clichês. A v3 refaz a experiência do zero como uma missão espacial dirigida pela rolagem, mantendo o que é marca (o nome desenhado, o símbolo, o vermelho de determinação, o azul de sistema, a Oxanium).

O que o caderno de aprendizados mudou neste plano: cena 3D com laço de render limitado e DPR baixo desde o início (a torre 3D de outro projeto ficou "travada"); coreografia por keyframes de estado com um palco só (nunca dois trechos disputando a mesma propriedade); cartões com fundo sólido sobre céu que muda de cor; conteúdo longo fora da cena, em dossiê.

## Tema

- **Sujeito:** a DETERA, empresa de soluções web de Goiânia (presença digital, crescimento, tecnologia, infraestrutura). DET vem de DETERMINAÇÃO.
- **Público:** donos de pequenas e médias empresas.
- **Função da página:** levar a pessoa a abrir a conversa no WhatsApp sabendo o que a DETERA faz e por que ela é diferente.
- **A metáfora:** a empresa é um sistema solar. O núcleo vermelho (determinação) é a estrela; as quatro frentes são os planetas que giram em volta dele. Visitar o site é uma missão: chegar ao sistema, passar por cada planeta, entrar na atmosfera do planeta azul (infraestrutura, o que sustenta), pousar onde estão os projetos reais e voltar à órbita, que é o processo em laço.

## Paleta

| Papel | Token | Hex | Uso |
|---|---|---|---|
| Vácuo | `vacuo` | `#050913` | fundo do espaço (azul-noite, não preto tingido) |
| Painel | `painel` | `#0C1424` | cartões e dossiês |
| Luz estelar | `luz` | `#EEF0F6` | texto principal |
| Poeira | `poeira` | `#9AA6BE` | texto de apoio |
| Determinação | `determinacao` | `#FF3B3B` | ação, núcleo, botão principal |
| Plasma | `plasma` | `#FF8A3D` | só na reentrada e em instrumento em alerta |
| Atmosfera | `atmosfera` | `#8FB3FF` | instrumentos, links, limbo dos planetas |
| Sistema | `sistema` | `#4C7DFF` | o planeta azul, infraestrutura |

Contraste medido (WCAG 2.2): luz/vácuo 17,47; poeira/vácuo 8,13; poeira/painel 7,51; determinação/vácuo 5,63; plasma/vácuo 8,49; atmosfera/vácuo 9,54; sistema/vácuo 5,39; vácuo sobre determinação 5,63; luz sobre o azul do crepúsculo (`#1A2C5A`) 11,88. Todos passam AA. Texto nunca fica direto sobre o horizonte laranja do crepúsculo: lá ele vai num cartão `painel`.

O espaço não é preto chapado: o céu tem nebulosas frias, os planetas têm cor própria (dunas cor de ferrugem, gigante de gás âmbar com anel, mundo de gelo com luzes de cidade, oceano azul), e o pouso acontece num crepúsculo azul e laranja.

## Tipografia

- **Oxanium** (marca, regra do projeto): títulos, instrumentos, botões. 500 a 800.
- **Spectral** (Production Type, OFL, servida de `public/fonts`): a voz do narrador da missão, no texto corrido e nas frases do manifesto. 300, 400 e 300 itálico.

Escala: display `clamp(2.6rem, 1.4rem + 5.2vw, 6.4rem)`; título de cena `clamp(1.9rem, 1.2rem + 2.6vw, 3.4rem)`; frase de manifesto `clamp(1.5rem, 1rem + 1.9vw, 2.6rem)` em Spectral 300; corpo 1.08rem Spectral 400, entrelinha 1.6; instrumento 0.8rem Oxanium 500 em caixa de frase.

## Identidade de movimento

- **Materiais e objetos:** estrela, planetas, órbitas, cinturão de asteroides, atmosfera, plasma de reentrada, nuvens, relevo ao crepúsculo, trajetória orbital com queimas de motor, instrumentos de cabine (altímetro, trajetória).
- **Verbos:** orbitar, atravessar, cair, queimar, pousar, relançar.
- **Três adjetivos:** pesado, imersivo, preciso.
- **Gesto-assinatura: a reentrada.** A câmera mergulha no planeta azul; a borda da tela acende em plasma vermelho e laranja, rastros sobem pela tela, tudo treme com amplitude que cresce e depois cede, o altímetro despenca, e cada frase do manifesto cai do alto da tela com aceleração de gravidade. As nuvens rasgam e a cena se abre num crepúsculo, onde estão os projetos.
- **Gestos de apoio:**
  - chegada ao sistema ao carregar: as estrelas esticam em rastros e se recolhem em pontos enquanto a câmera desacelera, e as letras do nome caem com gravidade;
  - travessia lateral de planeta em planeta, em arco, com o cartão saindo para um lado e o próximo entrando do outro;
  - cartões em órbita no processo: giram em volta de um pivô fora da tela, como um corpo entrando em órbita;
  - relançamento: o céu do crepúsculo escurece de volta ao espaço com rastros descendo;
  - etiquetas dos planetas presas a eles por linhas de instrumento, projetadas da cena 3D;
  - paralaxe de gravidade: o cursor puxa a câmera com massa (mola com atraso).
- **Curvas:** queda com aceleração quadrática na entrada e na saída (gravidade), smootherstep entre cenas, mola amortecida no cursor, `power3.out` só na chegada.
- **O que a marca não faz:** blur, vidro, neon, degradê de enfeite, cortina do centro, fade-and-rise em cada bloco, hover genérico, rótulo em caixa alta, seta no fim do botão.

## Mecânica

Uma seção `missao` com altura virtual e um palco `sticky` de 100svh. A rolagem vira uma posição fracionária `s` entre cenas (keyframes de estado); uma função só interpola câmera, atmosfera, plasma, tremor, céu e relevo, e escreve `--d` (posição relativa à cena, de -1 a 1) nos cartões ativos. Um canvas Three.js fixo atrás de tudo lê o estado a cada quadro. Sem pin do ScrollTrigger e sem snap.

Conteúdo longo (entregas de cada frente, o estudo de caso inteiro) fica num dossiê (`<dialog>`), aberto por botão, para a cena não virar parede de texto.

**Modo linear** (movimento reduzido, tela com até 520px de altura, ou sem WebGL): os cartões viram seções empilhadas, a cena 3D fica parada na pose do sistema, e nenhum tremor.

## Mapa de cenas

| Ato | Cena | Câmera | Cartão |
|---|---|---|---|
| Chegada | 0 Órbita | sistema inteiro, de cima | nome DETERA, slogan, CTA |
| | 1 Sinais | rente ao cinturão de asteroides | os quatro sintomas |
| Sistema | 2–5 Frentes | um planeta por cena, em arco lateral | frente, promessa, entregas, dossiê |
| Reentrada | 6 Aproximação | sobre o limbo do planeta azul | o slogan e o porquê |
| | 7–10 Plasma | dentro da atmosfera | um par genérico/específico por altitude |
| | 11 Nuvens | rompendo as nuvens | a frase de fecho |
| Solo | 12–14 Projetos | crepúsculo com relevo em paralaxe | Sencis, FIDÈLE, também em obra |
| Trajetória | 15–19 Processo | órbita do planeta azul, cápsula nas 5 queimas | uma etapa por cena |
| Diário | 20 Sobre | perto do núcleo | por que a DETERA existe, fundador |
| Sinal | 21 Fim | o sistema de longe | perguntas e contato rolam por cima |
