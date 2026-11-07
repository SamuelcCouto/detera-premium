import type { ImagemPrevia } from "@/content/cases";

export type ProjetoEmConstrucao = {
  id: string;
  cliente: string;
  setor: string;
  resumo: string;
  url: string;
  urlRotulo: string;
  /**
   * Print do próprio site no ar, servido do nosso `public/`. A prévia ao vivo
   * (iframe, imagem hotlinkada) pesava num cartão que se move pela rolagem e
   * exigia liberar domínios de terceiros na CSP. Quando o site mudar, tirar o
   * print de novo.
   */
  imagem: ImagemPrevia;
};

/**
 * Projetos que já estão no ar, mas ainda não viraram estudo de caso — sem
 * problema/estratégia/resultado documentado, porque o trabalho ainda não
 * fechou um ciclo para contar. Por isso ficam com o domínio de preview da
 * Vercel: o domínio definitivo ainda não é o que representa o projeto.
 */
export const projetosEmConstrucao: ProjetoEmConstrucao[] = [
  {
    id: "yasmin",
    cliente: "Yasmin Guimarães Studio",
    setor: "Massoterapia e estética corporal em Goiânia",
    resumo:
      "Massagem relaxante, drenagem linfática, modeladora e protocolos personalizados, com atendimento individual e hora marcada.",
    url: "https://yasmin-g-studio.vercel.app",
    urlRotulo: "yasmin-g-studio.vercel.app",
    imagem: {
      url: "/cases/yasmin.jpg",
      alt: "Página inicial do Yasmin Guimarães Studio, com a frase “você sai daqui mais leve” e a foto de uma sessão de massagem",
    },
  },
  {
    id: "keepnew",
    cliente: "Keep New Soluções Industriais",
    setor: "Manutenção industrial",
    resumo:
      "Manutenção preventiva e corretiva, reparação e inspeção técnica de máquinas e equipamentos industriais.",
    url: "https://keepnew.vercel.app",
    urlRotulo: "keepnew.vercel.app",
    imagem: {
      url: "/cases/keepnew.jpg",
      alt: "Página inicial da Keep New, com o título “Manutenção e reparo industrial para manter suas máquinas sempre girando”",
    },
  },
];
