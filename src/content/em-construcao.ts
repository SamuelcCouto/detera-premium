import type { ImagemPrevia } from "@/content/cases";

export type ProjetoEmConstrucao = {
  id: string;
  cliente: string;
  setor: string;
  resumo: string;
  url: string;
  urlRotulo: string;
  imagens?: ImagemPrevia[];
  /**
   * Quando o projeto não tem imagem alguma para servir de prévia, a moldura
   * carrega o próprio site num iframe reduzido. É a prévia mais honesta que
   * existe — é literalmente o site, e se atualiza sozinha a cada deploy dele.
   */
  iframe?: boolean;
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
    setor: "Massoterapia e estética corporal · Goiânia",
    resumo:
      "Massagem relaxante, drenagem linfática, modeladora e protocolos personalizados, com atendimento individual e hora marcada.",
    url: "https://yasmin-g-studio.vercel.app",
    urlRotulo: "yasmin-g-studio.vercel.app",
    imagens: [
      {
        url: "https://yasmin-g-studio.vercel.app/opengraph-image",
        alt: "Identidade visual do Yasmin Guimarães Studio, em dourado sobre preto",
      },
    ],
  },
  {
    id: "keepnew",
    cliente: "Keep New Soluções Industriais",
    setor: "Manutenção industrial",
    resumo:
      "Manutenção preventiva e corretiva, reparação e inspeção técnica de máquinas e equipamentos industriais.",
    url: "https://keepnew.vercel.app",
    urlRotulo: "keepnew.vercel.app",
    iframe: true,
  },
];
