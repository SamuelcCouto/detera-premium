/**
 * Sequência de verdade — é o único bloco do site que ganha numeração, porque é
 * o único em que a ordem significa alguma coisa.
 *
 * A quinta etapa não fecha o ciclo: ela devolve para a primeira. O processo da
 * DETERA é um laço, e a numeração mostra isso sem precisar dizer.
 */
export const etapas = [
  {
    numero: "01",
    titulo: "Descobrir",
    texto:
      "Uma conversa sobre o negócio antes de falar de site: o que você vende, para quem, o que trava hoje e o que precisa acontecer para o projeto ter valido a pena.",
  },
  {
    numero: "02",
    titulo: "Estruturar",
    texto:
      "O problema vira escopo: o que será feito, em que ordem, por quanto e com qual conteúdo. Mudar aqui custa uma conversa; mudar depois custa retrabalho.",
  },
  {
    numero: "03",
    titulo: "Construir",
    texto:
      "A stack é escolhida pelo que o projeto pede, não por hábito. Desenvolvimento com ambiente de teste aberto para você acompanhar — você vê funcionando antes de qualquer coisa ir ao ar.",
  },
  {
    numero: "04",
    titulo: "Lançar",
    texto:
      "Domínio, certificado, medição e indexação configurados na entrega. Entra no ar pronto para ser encontrado, não só pronto para ser visto.",
  },
  {
    numero: "05",
    titulo: "Evoluir",
    texto:
      "Monitoramento, correção e as próximas decisões tomadas com dado, não com achismo. É a etapa que costuma faltar — e a razão de tanto projeto bom envelhecer mal.",
  },
] as const;
