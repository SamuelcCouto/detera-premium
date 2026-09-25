export type Entrega = {
  nome: string;
  texto: string;
};

export type Pilar = {
  id: string;
  nome: string;
  promessa: string;
  descricao: string;
  entregas: Entrega[];
  ctaTexto: string;
  mensagemWhatsapp: string;
  /**
   * Vermelho é ação; azul é o que sustenta. Infraestrutura é a única frente
   * que não vende movimento, e sim permanência — por isso muda de cor.
   */
  acento: "determinacao" | "sistema";
};

/**
 * Quatro frentes em vez de uma lista de serviços soltos. Cada entrega é
 * nomeada pelo resultado e descrita pelo benefício — a tecnologia entra para
 * dar confiança, não para ocupar a frase.
 */
export const pilares: Pilar[] = [
  {
    id: "presenca",
    nome: "Presença digital",
    promessa: "Um site que trabalha enquanto você trabalha.",
    descricao:
      "Existir bem no lugar onde as pessoas procuram. Um site rápido, claro e organizado para apresentar a empresa, aparecer na busca e transformar visita em conversa.",
    acento: "determinacao",
    entregas: [
      {
        nome: "Site institucional",
        texto:
          "Apresenta a empresa em poucos segundos, carrega rápido no celular e leva a pessoa até o contato sem que ela precise procurar.",
      },
      {
        nome: "Página de conversão",
        texto:
          "Uma página só, feita para campanha e anúncio: uma promessa, uma ação e nada competindo com ela na tela.",
      },
      {
        nome: "Loja virtual",
        texto:
          "Catálogo, carrinho e checkout com PIX e cartão. O pedido fecha sozinho, sem alguém intermediando cada compra no direct.",
      },
      {
        nome: "Ser encontrado no Google",
        texto:
          "Estrutura técnica, conteúdo escrito com os termos que as pessoas realmente digitam e a ficha do Google Business organizada para a busca da sua cidade.",
      },
      {
        nome: "Experiência e conteúdo",
        texto:
          "A ordem em que a informação aparece muda mais a quantidade de contatos do que qualquer escolha visual. É aqui que a maior parte do trabalho acontece.",
      },
    ],
    ctaTexto: "Planejar minha presença digital",
    mensagemWhatsapp:
      "Olá! Vim pelo site da DETERA e quero conversar sobre presença digital para a minha empresa.",
  },
  {
    id: "crescimento",
    nome: "Crescimento",
    promessa: "Atenção que não vira oportunidade é só custo.",
    descricao:
      "Presença resolve ser encontrado por quem já procura. Crescimento é ir atrás de quem ainda não procurou — e conseguir provar se valeu.",
    acento: "determinacao",
    entregas: [
      {
        nome: "Anúncios no Google e no Meta",
        texto:
          "Campanha ligada a uma página feita para ela, e não ao site inteiro. Quem clica cai exatamente no assunto do anúncio.",
      },
      {
        nome: "Medição e analytics",
        texto:
          "Saber de onde veio cada contato. Sem isso, aumentar verba é aposta — e cortar também.",
      },
      {
        nome: "Funil e remarketing",
        texto:
          "Quem visitou e não falou com você ainda pode voltar. O caminho de volta é construído, não esperado.",
      },
      {
        nome: "SEO de conteúdo",
        texto:
          "Responder no site as perguntas que hoje chegam uma a uma no WhatsApp. Cada resposta vira uma porta de entrada na busca.",
      },
      {
        nome: "Otimização contínua",
        texto:
          "Ajustar título, oferta e ordem da página com base no que os números mostram, e não no que a gente acha bonito.",
      },
    ],
    ctaTexto: "Falar sobre aquisição de clientes",
    mensagemWhatsapp:
      "Olá! Vim pelo site da DETERA e quero conversar sobre crescimento e aquisição de clientes.",
  },
  {
    id: "tecnologia",
    nome: "Tecnologia",
    promessa: "Tecnologia tira trabalho da frente. Não acrescenta.",
    descricao:
      "Quando a planilha compartilhada vira o sistema oficial da empresa, o gargalo deixa de ser vender e passa a ser controlar. Aqui a gente constrói a ferramenta que faltava.",
    acento: "determinacao",
    entregas: [
      {
        nome: "Painel e cadastro sob medida",
        texto:
          "O que hoje vive em planilha vira uma tela com permissão por pessoa, histórico do que mudou e busca que funciona.",
      },
      {
        nome: "Integrações entre plataformas",
        texto:
          "Fazer os sistemas que você já usa conversarem, em vez de alguém copiar dado de um para o outro todo dia.",
      },
      {
        nome: "Automação de rotina",
        texto:
          "Tarefa repetitiva que roda sozinha, no horário certo, sem depender de alguém lembrar de rodar.",
      },
      {
        nome: "APIs e conexões",
        texto:
          "Ligar o site ao ERP, ao CRM ou ao meio de pagamento — para o dado nascer uma vez só e valer em todo lugar.",
      },
      {
        nome: "Ferramenta interna",
        texto:
          "Quando nenhum sistema de prateleira resolve, a saída é construir o que resolve. Pequeno, específico e no formato da sua operação.",
      },
    ],
    ctaTexto: "Falar sobre um sistema",
    mensagemWhatsapp:
      "Olá! Vim pelo site da DETERA e quero conversar sobre um sistema ou automação para a minha operação.",
  },
  {
    id: "infraestrutura",
    nome: "Infraestrutura",
    promessa: "O lançamento é o começo do que importa.",
    descricao:
      "A frente que quase ninguém entrega junto, e a que decide se o resto continua valendo daqui a um ano. É de onde a DETERA veio.",
    acento: "sistema",
    entregas: [
      {
        nome: "Publicação e deploy",
        texto:
          "Domínio próprio, certificado e ambiente configurados por quem já colocou sistema em produção com cliente dependendo dele.",
      },
      {
        nome: "Performance",
        texto:
          "Página que abre rápido em rede móvel. Velocidade não é vaidade técnica: é a diferença entre a pessoa esperar e a pessoa voltar para a busca.",
      },
      {
        nome: "Segurança",
        texto:
          "Formulário e rota de pagamento tratados como superfície de ataque desde o primeiro dia, porque é exatamente o que são.",
      },
      {
        nome: "Monitoramento e continuidade",
        texto:
          "Backup, alerta e plano de retorno. A pergunta nunca foi se algo vai falhar, e sim quanto tempo leva para voltar.",
      },
      {
        nome: "Escala",
        texto:
          "Estrutura que aguenta a campanha que deu certo. Crescer não deveria ser o motivo de o site sair do ar.",
      },
      {
        nome: "Evolução",
        texto:
          "O sistema acompanha o negócio: serviço novo, preço novo, página nova — sem recomeçar do zero a cada mudança.",
      },
    ],
    ctaTexto: "Falar sobre infraestrutura",
    mensagemWhatsapp:
      "Olá! Vim pelo site da DETERA e quero conversar sobre infraestrutura, performance e continuidade.",
  },
];
