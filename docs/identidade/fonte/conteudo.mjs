// Conteúdo do manual de identidade da DETERA. Fonte única para PDF, DOCX e
// Figma. Segue as próprias regras de escrita que o manual define.

export const capa = {
  titulo: 'Identidade visual',
  versao: 'Versão 2, setembro de 2026',
};

export const marca = {
  titulo: 'A marca',
  paragrafos: [
    'A DETERA é uma empresa de soluções web de Goiânia. Faz sites, campanhas de crescimento, sistemas sob medida e a infraestrutura que mantém tudo isso no ar, para pequenas e médias empresas de todo o Brasil.',
    'O nome vem de DETERMINAÇÃO. A inspiração é Undertale (Toby Fox, 2015), o jogo em que a determinação é a força que mantém de pé o coração vermelho de quem joga. A DETERA leva essa ideia para o trabalho: um projeto só está bom quando aguenta a próxima mudança do negócio sem precisar recomeçar.',
    'A referência ao jogo aparece na lógica da marca e nunca em material de terceiros. A DETERA não usa sprites, fontes, músicas, sons nem falas de Undertale.',
  ],
  slogan: 'Transformando ideias em personalidade',
  tagline: 'Tecnologia, estratégia e crescimento digital',
  frentes: [
    { nome: 'Presença digital', promessa: 'Um site que trabalha enquanto você trabalha.', cor: 'determinacao' },
    { nome: 'Crescimento', promessa: 'Atenção que não vira oportunidade é só custo.', cor: 'determinacao' },
    { nome: 'Tecnologia', promessa: 'Tecnologia serve para tirar trabalho da frente.', cor: 'determinacao' },
    { nome: 'Infraestrutura', promessa: 'O lançamento é o começo do que importa.', cor: 'sistema' },
  ],
};

export const personalidade = {
  titulo: 'Personalidade',
  adjetivos: [
    { nome: 'Exata', texto: 'Faz o que diz e mede o que mostra. Número só entra se foi medido e tem fonte.' },
    { nome: 'Persistente', texto: 'Fica depois do lançamento. O projeto continua sendo cuidado quando o site já está no ar.' },
    { nome: 'Lúdica', texto: 'Tem senso de jogo: um coração que é cursor, texto que é fala, pontos que salvam o progresso.' },
  ],
  principios: [
    'Cor com significado. Vermelho é ação e núcleo; azul é o que sustenta.',
    'Tudo em pixel. A marca encaixa na grade e anda em degraus.',
    'Contenção. Uma coisa memorável por tela, o resto quieto.',
    'Verdade. Nenhum cliente, métrica ou depoimento inventado.',
  ],
};

export const logo = {
  titulo: 'Logo',
  simbolo:
    'O símbolo é um coração de placas partido ao meio por uma linha de energia. Dentro do coração a linha vira núcleo, uma cruz escalonada; fora dele, vira traço pontilhado, um pulso que continua além da própria forma. A metade direita é a esquerda espelhada, para a simetria ser exata.',
  anatomia: [
    { nome: 'Placas', texto: 'As duas metades do coração, com chanfros de 45°.' },
    { nome: 'Linha de energia', texto: 'Atravessa o coração de cima a baixo, em vermelho.' },
    { nome: 'Núcleo', texto: 'Cruz escalonada no centro. É o que acende.' },
    { nome: 'Traços', texto: 'Quatro segmentos que continuam a linha fora do coração.' },
  ],
  letreiro:
    'O nome é desenhado, sem fonte: seis letras traçadas à mão, com chanfro de 45° nos terminais, proporção larga e o A de topo reto. Sempre com A latino (U+0041). O A cirílico (U+0410) parece igual e quebra busca, leitor de tela e copiar e colar.',
  versoesDeAssinatura: [
    { nome: 'Letreiro de apresentação', texto: 'O nome com o coração embaixo do A. Uso do hero e das capas.', arquivo: 'detera-letreiro-hero' },
    { nome: 'Assinatura horizontal', texto: 'O símbolo ao lado do nome, com 2,14 vezes a altura das letras. Uso de rodapé e documentos.', arquivo: 'detera-assinatura' },
    { nome: 'Símbolo', texto: 'Sozinho no cabeçalho, no favicon e em avatares.', arquivo: 'detera-simbolo' },
  ],
  construcao:
    'Grade de 32 por 40 unidades, com centro em x = 16. A linha de energia ocupa de x 15,35 a 16,65 e vai de y 6,6 a 33,2; os quatro traços continuam a linha acima e abaixo. As placas ocupam de y 11,4 a 29,8. Toda a geometria vive num arquivo só (marca-paths.ts), usado pelo site, pelo favicon e pela imagem de compartilhamento.',
  respiro:
    'Área de respiro mínima em volta do símbolo e da assinatura: a largura de uma placa, um terço da largura do símbolo. Nada de texto, borda ou imagem dentro dela.',
  tamanhos: [
    'Símbolo: mínimo de 24 px de altura em tela e 8 mm impresso. Abaixo disso, a versão sem traços, como no favicon de 32 px.',
    'Letreiro: letras com no mínimo 11 px de altura em tela e 3 mm impresso.',
  ],
  versoes: [
    { nome: 'Sobre escuro', texto: 'A versão principal. Placas claras e energia vermelha sobre o vazio.', variante: 'escuro', fundo: '#07080b' },
    { nome: 'Sobre claro', texto: 'Placas em vazio e energia vermelha sobre o cinza-claro da marca.', variante: 'claro', fundo: '#f2f3f5' },
    { nome: 'Monocromática clara', texto: 'Uma cor só, para gravação e fundos onde o vermelho não é possível.', variante: 'mono-claro', fundo: '#07080b' },
    { nome: 'Monocromática escura', texto: 'Uma cor só, para carimbo, papel e impressão em uma cor.', variante: 'mono-escuro', fundo: '#f2f3f5' },
  ],
  usosErrados: [
    'Mudar a cor da linha de energia ou do núcleo.',
    'Separar, girar ou distorcer as metades do coração.',
    'Aplicar brilho, sombra, contorno neon ou gradiente.',
    'Recriar o nome com uma fonte.',
    'Trocar o A latino pelo cirílico.',
    'Colocar sobre foto sem área de respiro e sem contraste.',
  ],
};

export const cor = {
  titulo: 'Cor',
  regras: [
    'Os dois acentos têm significado fixo e nunca são decorativos. O vermelho marca o que age: o botão principal, o núcleo, a alma, o estado ativo. O azul aparece só onde a mensagem é sustentação: a frente de Infraestrutura, dados, continuidade.',
    'Proporção: fundo escuro na maior parte, texto claro, vermelho em pontos e azul mais raro que o vermelho.',
  ],
  grupos: [
    {
      nome: 'Superfícies',
      cores: [
        { token: 'vazio', hex: '#07080b', papel: 'Fundo principal. Preto com desvio de azul.' },
        { token: 'camada', hex: '#0e1015', papel: 'Seções de leitura.' },
        { token: 'camada-alta', hex: '#161920', papel: 'Campos, cartões, tela desligada.' },
        { token: 'borda', hex: '#23262e', papel: 'Filetes decorativos.' },
        { token: 'borda-viva', hex: '#363b45', papel: 'Nós e bordas de destaque.' },
        { token: 'contorno', hex: '#606671', papel: 'Borda de componente; texto secundário sobre claro.' },
      ],
    },
    {
      nome: 'Texto',
      cores: [
        { token: 'texto', hex: '#f2f3f5', papel: 'Texto principal; fundo das peças claras.' },
        { token: 'texto-suave', hex: '#9ba1ac', papel: 'Texto de apoio.' },
        { token: 'texto-fraco', hex: '#7c828e', papel: 'Legendas e texto terciário.' },
      ],
    },
    {
      nome: 'Determinação',
      cores: [
        { token: 'determinacao', hex: '#ff3b3b', papel: 'Ação, núcleo, alma, estado ativo.' },
        { token: 'determinacao-viva', hex: '#ff6b6b', papel: 'Vermelho em texto sobre escuro.' },
        { token: 'determinacao-funda', hex: '#3d0f14', papel: 'Fundo de alerta, uso raro.' },
      ],
    },
    {
      nome: 'Sistema',
      cores: [
        { token: 'sistema', hex: '#4c7dff', papel: 'Infraestrutura, dado, o que sustenta.' },
        { token: 'sistema-viva', hex: '#7ca0ff', papel: 'Azul em texto sobre escuro.' },
        { token: 'sistema-funda', hex: '#10203f', papel: 'Fundo técnico, uso raro.' },
      ],
    },
  ],
  claro: [
    { token: 'texto sobre claro', hex: '#07080b', razao: '18,04' },
    { token: 'secundário sobre claro (contorno)', hex: '#606671', razao: '5,20' },
    { token: 'vermelho sobre claro', hex: '#df021d', razao: '4,54' },
    { token: 'azul sobre claro', hex: '#3865e5', razao: '4,55' },
  ],
};

export const contraste = {
  titulo: 'Contraste',
  intro:
    'Todo par de texto e fundo foi medido pela fórmula do WCAG 2.2. AA pede 4,5:1 para texto normal, 3:1 para texto grande (a partir de 24 px, ou 18,66 px em negrito) e 3:1 para a borda de componentes interativos.',
  fundos: ['vazio #07080b', 'camada #0e1015', 'camada-alta #161920'],
  linhas: [
    { texto: 'texto #f2f3f5', valores: ['18,04', '17,14', '15,84'], ok: [true, true, true] },
    { texto: 'texto-suave #9ba1ac', valores: ['7,71', '7,33', '6,77'], ok: [true, true, true] },
    { texto: 'texto-fraco #7c828e', valores: ['5,19', '4,93', '4,56'], ok: [true, true, true] },
    { texto: 'determinação #ff3b3b', valores: ['5,67', '5,38', '4,98'], ok: [true, true, true] },
    { texto: 'determinação-viva #ff6b6b', valores: ['7,22', '6,86', '6,34'], ok: [true, true, true] },
    { texto: 'sistema #4c7dff', valores: ['5,42', '5,15', '4,76'], ok: [true, true, true] },
    { texto: 'sistema-viva #7ca0ff', valores: ['7,94', '7,55', '6,98'], ok: [true, true, true] },
    { texto: 'contorno #606671 (borda)', valores: ['3,47', '3,29', '3,05'], ok: [true, true, true] },
  ],
  correcoes: [
    'texto-fraco era #767c88 e dava 4,19 sobre camada-alta. Passou a #7c828e, o tom mais próximo que passa nos três fundos, mexendo só na luminosidade (OKLCH), com o mesmo matiz.',
    'contorno era #5c626d e dava 2,87 sobre camada-alta, o fundo dos campos. Passou a #606671 pelo mesmo método.',
    'Texto claro sobre vermelho dá 3,18: só em texto grande. O botão principal usa o vazio sobre o vermelho (5,67).',
  ],
};

export const tipografia = {
  titulo: 'Tipografia',
  intro:
    'Oxanium, uma família só, variável do peso 200 ao 800. Cantos chanfrados a 45° e proporção larga, a mesma personalidade do nome desenhado. Licença SIL Open Font License, servida pelo próprio site.',
  escala: [
    { nome: 'Display', tamanho: '34 a 60 px', peso: '700', uso: 'O que a empresa é e vende. Duas seções por página.' },
    { nome: 'Subdisplay', tamanho: '29 a 48 px', peso: '700', uso: 'O argumento: prova, problema, tese.' },
    { nome: 'Title', tamanho: '24 a 36 px', peso: '700', uso: 'Utilidade: processo e dúvidas.' },
    { nome: 'Heading', tamanho: '18 a 22 px', peso: '700', uso: 'Títulos de item.' },
    { nome: 'Lead', tamanho: '17 a 20 px', peso: '400', uso: 'Frase de abertura de seção.' },
    { nome: 'Corpo', tamanho: '16 px', peso: '400', uso: 'Texto corrido, altura de linha 1,65.' },
    { nome: 'Micro', tamanho: '12,5 px', peso: '500', uso: 'Estados reais: placar, "Em obra".' },
  ],
  regras: [
    'Caixa de frase em tudo. Sem rótulo em caixa alta espaçada.',
    'Linhas de texto com até 62 caracteres.',
    'Algarismos tabulares em número que muda (placar, notas medidas).',
    'O nome DETERA nunca é digitado na fonte em peças de marca: usa-se o letreiro desenhado.',
  ],
};

export const elementos = {
  titulo: 'Elementos',
  itens: [
    { nome: 'O céu', texto: 'Estrelas quadradas de 1 ou 2 px em três profundidades, que andam com a rolagem em velocidades diferentes e esticam num rastro curto quando a rolagem é rápida. Cintilam em cinco degraus de brilho. A densidade acompanha o conteúdo: cheio onde a marca fala, quase apagado onde se lê.' },
    { nome: 'O losango', texto: 'Ponto de continuação, como num mapa de jogo. Cinza quando é marco; vermelho quando está salvo ou ativo; azul quando marca infraestrutura.' },
    { nome: 'A trilha', texto: 'Filete cinza de 1 px que atravessa a página, com um losango por seção. Nunca colorido.' },
    { nome: 'A alma', texto: 'O coração vermelho sólido. É o cursor: marca a opção escolhida em menus, listas, perguntas e campos, e salta de uma opção para outra sem viajar.' },
    { nome: 'A grade de blocos', texto: 'Quadrados que acendem ou apagam um a um, em ordem sorteada, para abrir e fechar coisas: prints que se montam, o menu que preenche a tela, a travessia do núcleo.' },
    { nome: 'Ícones em pixel', texto: 'Grade de 10 por 10, desenhados com quadrados, usados a 20 px (2 px de tela por quadrado) ou a 10 px.' },
  ],
};

export const movimento = {
  titulo: 'Movimento',
  intro: 'O site funciona como um jogo que responde à pessoa: a rolagem controla o tempo, e tudo que é pixel anda em degraus.',
  materiais: 'Blocos de pixel, a linha de energia, a grade, o cursor de seleção, a caixa de diálogo, o ponto de salvar, o céu.',
  verbos: [
    { nome: 'Encaixar', texto: 'O bloco entra na grade de uma vez, sem deslizar.' },
    { nome: 'Carregar', texto: 'A linha de energia enche em degraus.' },
    { nome: 'Falar', texto: 'O texto sai letra a letra e pausa na pontuação.' },
    { nome: 'Saltar', texto: 'O cursor pula de opção em opção, sem viagem.' },
    { nome: 'Apagar', texto: 'A fala volta letra a letra, da última para a primeira.' },
    { nome: 'Salvar', texto: 'O losango acende e fica aceso.' },
  ],
  gesto: 'O coração se monta bloco a bloco, a linha de energia carrega de cima a baixo e o núcleo acende.',
  momento: 'A travessia do núcleo: no fim do hero, o coração cresce até a cruz vermelha tomar a tela, e a tela vermelha se parte em blocos que se apagam, abrindo o céu.',
  curvas: 'steps(n) para tudo que é pixel; power3 só para deslocamentos grandes; o cursor salta sem curva nenhuma. Ritmo curto e seco.',
  sistemas: [
    { nome: 'Céu vivo', texto: 'Um canvas só, atrás da página inteira, com profundidade e rastro pela velocidade da rolagem.' },
    { nome: 'Cursor-coração', texto: 'Em toda lista de escolhas, o coração salta para a opção sob o ponteiro ou o foco do teclado.' },
    { nome: 'Fala', texto: 'Onde o site fala com a pessoa, o texto sai letra a letra: slogan, manifesto, chamada.' },
  ],
  naoFaz: 'Blur ou desfoque de qualquer tipo, brilho neon, cortina que abre do centro, surgir-e-subir genérico, mola, gradiente, vidro.',
  tecnica: 'Animar só transform, opacity e clip-path. No máximo dois trechos fixados por página. Movimento reduzido tem caminho próprio: a página inteira parada e legível.',
};

export const voz = {
  titulo: 'Voz e escrita',
  intro: 'Direta e concreta. Verbos simples, frases curtas, caixa de frase. Explica o que a pessoa ganha em vez de vender.',
  regras: [
    'Sem travessões em excesso. Vírgula, ponto e parênteses resolvem quase tudo.',
    'Sem a construção "não é X, é Y". Diga o que a coisa é.',
    'Número só se for medido e verificável, com fonte e data junto.',
    'Nenhum cliente, depoimento ou certificação inventados.',
    'Botão diz o que acontece: "Vamos construir" abre a conversa no WhatsApp.',
    'DETERA sempre em caixa alta e com A latino.',
  ],
  exemplos: [
    {
      antes: 'Velocidade não é vaidade técnica: é a diferença entre a pessoa esperar e a pessoa voltar para a busca.',
      depois: 'É a velocidade que decide se a pessoa espera ou volta para a busca.',
    },
    {
      antes: 'Tecnologia tira trabalho da frente. Não acrescenta.',
      depois: 'Tecnologia serve para tirar trabalho da frente.',
    },
    {
      antes: 'O que mais atrasa projeto não é desenvolvimento: é conteúdo — texto, foto e informação que só o cliente tem.',
      depois: 'O que mais atrasa um projeto costuma ser o conteúdo: texto, foto e informação que só o cliente tem.',
    },
  ],
};

export const aplicacoes = {
  titulo: 'Aplicações',
  itens: [
    { nome: 'Hero do site', texto: 'O letreiro de apresentação sobre o céu. O coração se monta ao carregar.', imagem: 'site-hero.jpg' },
    { nome: 'O coração no centro', texto: 'Na rolagem, o nome desce em degraus e o coração volta ao centro.', imagem: 'site-coracao-no-centro.jpg' },
    { nome: 'A travessia do núcleo', texto: 'A tela vermelha se parte em blocos que se apagam.', imagem: 'site-travessia.jpg' },
    { nome: 'O manifesto como fala', texto: 'A ideia genérica em cinza e a resposta falada, com a alma na frente.', imagem: 'site-manifesto.jpg' },
    { nome: 'A caixa de diálogo', texto: 'Moldura reta e grossa, duas escolhas, a alma na primeira.', imagem: 'site-chamada.jpg' },
    { nome: 'Celular', texto: 'O mesmo gesto em 390 px, e as entregas em carrossel com a alma no card escolhido.', imagem: 'celular-coracao.jpg', imagem2: 'celular-carrossel.jpg' },
  ],
  pecas: [
    'Favicon: o símbolo sem traços, a 32 px.',
    'Imagem de compartilhamento: 1200 por 630, com o símbolo, o nome, o slogan e as quatro frentes.',
    'Botão principal: texto vazio sobre vermelho (5,67:1). Botão de contorno: borda contorno e texto claro.',
    'Campo: fundo camada-alta, borda contorno (3,05:1) e borda vermelha no foco, com a alma ao lado do rótulo.',
  ],
};

export const naoFaz = {
  titulo: 'O que a marca não faz',
  intro: 'Estes recursos ficam fora da DETERA. Se algum for realmente necessário num projeto, a exceção é discutida e justificada antes.',
  itens: [
    'Gradiente agressivo',
    'Roxo com preto',
    'Neon ou brilho em volta das coisas',
    'Pastéis genéricos',
    'Fundo branco puro',
    'Ícones de pacote pronto (Lucide e parecidos)',
    'Emoji como ícone',
    'Ícone de brilho ou estrelinha',
    'Três cards de funcionalidade em fileira',
    'Bento grid genérico',
    'Cantos muito arredondados (o raio máximo é 4 px)',
    'Faixa colorida na lateral',
    'Grade de pontinhos',
    'Orbs e brilhos radiais',
    'Vidro (liquid glass, vidro fosco)',
    'Sombras em tudo',
    'Skeleton loader decorativo',
    'Setas animadas',
    'Hover genérico em tudo',
    'Janela de terminal decorativa',
    'Lista de checkmarks',
    'Três planos de preço por padrão',
    'Depoimentos inventados',
    'Travessões em excesso',
    'Frases do tipo "não é X, é Y"',
  ],
};

export const contato = {
  site: 'www.detera.com.br',
  email: 'deteraoficial@gmail.com',
  whatsapp: '(62) 9 8475-0989',
  local: 'Goiânia, GO. Atendimento remoto para todo o Brasil.',
};
