export type ImagemPrevia = {
  url: string;
  alt: string;
  /** `object-position` do recorte. Cada foto tem um ponto de interesse. */
  pos?: string;
};

/**
 * Notas do PageSpeed Insights no perfil de celular — o mais difícil (aparelho
 * intermediário simulado, 4G lento), e o de onde vem a maior parte do tráfego.
 *
 * Medidas, não estimadas: `relatorio` é o link permanente daquela execução,
 * então o número aqui é o mesmo que aparece para quem clicar. É o único
 * número dos cases por isso — qualquer pessoa consegue refazer o teste.
 *
 * Uma execução só, a primeira. Rodar de novo até sair um número melhor seria
 * escolher o resultado, e o perfil de computador (onde os dois sites passam
 * de 99) ficou de fora pelo mesmo motivo. Quando o site mudar, mede de novo
 * e troca tudo junto: data, notas e link.
 */
export type Medicao = {
  /** Dia em que o teste rodou, em ISO. */
  data: string;
  relatorio: string;
  desempenho: number;
  acessibilidade: number;
  praticas: number;
  seo: number;
};

export type Case = {
  id: string;
  cliente: string;
  setor: string;
  resumo: string;
  desafio: string;
  estrategia: string;
  solucao: string[];
  impacto: string;
  tecnologias: string[];
  url: string;
  urlRotulo: string;
  /**
   * Servidas do nosso próprio `public/`, não hotlinkadas do site do cliente.
   *
   * O Sencis é Next.js e o caminho do arquivo carrega o hash do build — muda
   * a cada deploy dele e quebraria a prévia aqui sem ninguém perceber. Cópia
   * local resolve isso e ainda entra otimizada.
   *
   * Mais de uma imagem vira um slideshow discreto (ver `PreviaCase`).
   */
  imagens: ImagemPrevia[];
  medicao?: Medicao;
};

/**
 * Estudo de caso, não vitrine: problema → estratégia → construção → resultado,
 * e a stack só no fim.
 *
 * O bloco `impacto` é qualitativo de propósito. Nenhum dos dois projetos tem
 * série histórica de tráfego ou de vendas para comparar, e número inventado em
 * case é a primeira coisa que um cliente experiente testa.
 */
export const cases: Case[] = [
  {
    id: "sencis",
    cliente: "Sencis Odontologia Integrada",
    setor: "Clínica odontológica · Goiânia",
    resumo:
      "Clínica aberta do zero precisava existir na busca local e passar confiança antes da primeira visita.",
    desafio:
      "Uma clínica nova não tem indicação acumulada nem histórico de marca. E o paciente decide em duas etapas que a clínica não controlava: procura no Google por sintoma — dor, dente escurecido, aparelho — e resolve no WhatsApp, depois de perguntar preço, convênio e estacionamento. Sem site, as duas etapas dependiam de ter alguém livre para responder.",
    estrategia:
      "Tratar o site como a primeira consulta. Organizar o conteúdo pelo problema que a pessoa tem, e não pelo nome técnico do procedimento, porque é assim que ela pesquisa. E antecipar as objeções que já chegavam repetidas no WhatsApp, para a conversa começar depois delas — não nelas.",
    solucao: [
      "Tratamentos apresentados por sintoma, com os termos de busca reais listados junto de cada um.",
      "Perguntas frequentes escritas a partir do que mais chegava no WhatsApp: valor da avaliação, dor, convênio, urgência no mesmo dia, criança e estacionamento.",
      "Fotos da clínica de verdade, sem banco de imagens — inclusive a fachada, que serve de referência para quem chega dirigindo.",
      "Agendamento por formulário com retorno pela recepção, e telefone em destaque para quem está com dor.",
      "Endereço, horário, rota e dados estruturados de negócio local preenchidos por completo, que é o que a busca por mapa consome.",
      "Página única renderizada no servidor, otimizada para abrir rápido em rede móvel.",
    ],
    impacto:
      "A clínica passou a ter endereço próprio na busca, com serviços, região atendida, horário e rota descritos de forma legível para o Google — e não só um perfil de rede social. A triagem que antes acontecia inteira na conversa passou a estar respondida antes dela: o contato chega sabendo o que a clínica faz, onde fica e como funciona a primeira consulta.",
    tecnologias: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Dados estruturados",
      "Vercel",
    ],
    url: "https://www.sencis.com.br",
    urlRotulo: "sencis.com.br",
    imagens: [
      {
        url: "/cases/sencis.jpg",
        alt: "Recepção da Sencis Odontologia, com poltrona, mesas de centro e a parede iluminada em formato de dente",
        pos: "50% 38%",
      },
    ],
    medicao: {
      data: "2026-09-22",
      relatorio:
        "https://pagespeed.web.dev/analysis/https-sencis-com-br/zumysj1csa?form_factor=mobile",
      desempenho: 91,
      acessibilidade: 90,
      praticas: 100,
      seo: 100,
    },
  },
  {
    id: "fidele",
    cliente: "FIDÈLE",
    setor: "Loja virtual · Streetwear",
    resumo:
      "Marca que vendia por mensagem passou a fechar pedido sozinha, com o pagamento confirmado pelo provedor.",
    desafio:
      "A marca vendia por conversa. Cada pedido exigia trocar mensagens sobre tamanho, cor, frete e forma de pagamento, e o pedido só existia enquanto alguém lembrava dele. Vender mais significava responder mais — não crescer.",
    estrategia:
      "Tirar o pedido da conversa e colocá-lo no checkout, sem perder o WhatsApp como canal de dúvida. Para isso a cor precisava ser dado estruturado, e não texto na descrição: é o que permite a vitrine mostrar cada variação, a galeria acompanhar a escolha e a cor viajar intacta até a cobrança.",
    solucao: [
      "Catálogo com variação por cor e tamanho, e um card de vitrine por cor em vez de um card por produto.",
      "Galeria que troca as fotos conforme a cor escolhida, com a peça sozinha sempre primeiro e as fotos com modelo depois.",
      "Carrinho que sobrevive ao recarregamento da página, e consulta de entrega antes do checkout.",
      "Checkout com PIX e cartão em até 3x, com a confirmação de pagamento chegando por webhook servidor-a-servidor — não pelo retorno do navegador.",
      "Busca, tema claro e escuro e páginas de ajuda respondendo o que antes só existia no direct.",
      "Rotas de API endurecidas contra CSRF e sem cache, para preço e pedido nunca virem de uma resposta guardada.",
    ],
    impacto:
      "A venda deixou de depender de alguém atendendo. O pedido nasce completo — peça, cor, tamanho, entrega e pagamento — e a confirmação vem do provedor, não da tela do cliente. O que era um catálogo dentro de uma conversa virou uma loja que funciona fora do horário comercial.",
    tecnologias: ["Next.js", "React", "TypeScript", "InfinitePay", "Vitest", "Vercel"],
    url: "https://www.fideleoficial.com.br",
    urlRotulo: "fideleoficial.com.br",
    imagens: [
      {
        url: "/cases/fidele-1.jpg",
        alt: "Campanha da FIDÈLE com modelos vestindo peças da coleção",
        pos: "50% 30%",
      },
      {
        url: "/cases/fidele-2.jpg",
        alt: "Regata da coleção FIDÈLE",
        pos: "50% 25%",
      },
      {
        url: "/cases/fidele-3.jpg",
        alt: "Polo bordada da coleção FIDÈLE",
        pos: "50% 25%",
      },
      {
        url: "/cases/fidele-4.jpg",
        alt: "Camisa com bolso cargo da coleção FIDÈLE",
        pos: "50% 25%",
      },
    ],
    medicao: {
      data: "2026-09-22",
      relatorio:
        "https://pagespeed.web.dev/analysis/https-fideleoficial-com-br/ziithdfxqh?form_factor=mobile",
      desempenho: 76,
      acessibilidade: 96,
      praticas: 96,
      seo: 100,
    },
  },
];
