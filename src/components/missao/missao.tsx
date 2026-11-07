import type { CSSProperties, ReactNode } from "react";

import { Letreiro } from "@/components/brand/wordmark";
import { Dossie } from "@/components/missao/dossie";
import { Instrumentos } from "@/components/missao/instrumentos";
import { Roteiro } from "@/components/missao/roteiro";
import { cases, type Case, type ImagemPrevia } from "@/content/cases";
import { projetosEmConstrucao, type ProjetoEmConstrucao } from "@/content/em-construcao";
import { pilares } from "@/content/pilares";
import { etapas } from "@/content/processo";
import { site } from "@/config/site";
import { CENAS, medidas } from "@/lib/missao/cenas";
import { whatsappUrl } from "@/lib/utils/whatsapp";

/** Ordem de chegada das peças da primeira cena, depois que o nome cai. */
const k = (n: number) => ({ "--k": n }) as CSSProperties;

const formatarData = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${iso}T12:00:00Z`),
  );

/**
 * A missão: todas as cenas num palco fixo de uma tela, dentro de uma seção
 * alta que dá a rolagem. O conteúdo inteiro está no HTML, em ordem de leitura;
 * sem JavaScript, com movimento reduzido ou em tela baixa, o CSS empilha os
 * cartões e a página se lê de cima para baixo (modo linear).
 *
 * Cada cartão diz o mínimo. Quem quer ler mais abre um dossiê: a maior parte
 * das pessoas não chega ao fim de uma página longa, então o que importa (os
 * projetos, o contato) não pode depender de atravessar texto.
 *
 * O primeiro cartão já sai do servidor em cena, e os outros com `data-fora`,
 * para a primeira pintura não depender da hidratação.
 */
export function Missao() {
  const { total } = medidas();
  const [sencis, fidele] = cases;
  const [yasmin, keepnew] = projetosEmConstrucao;

  const conteudo: Record<string, ReactNode> = {
    topo: <Topo />,
    projetos: <Sistema />,
    "projeto-sencis": <Caso caso={sencis} />,
    "projeto-fidele": <Caso caso={fidele} />,
    "projeto-yasmin": <EmObra projeto={yasmin} />,
    "projeto-keepnew": <EmObra projeto={keepnew} />,
    solucoes: <Frentes />,
    "seu-projeto": <SeuProjeto />,
    reentrada: <Reentrada />,
    sinal: <Sinal />,
  };

  return (
    <section
      data-missao
      className="missao"
      aria-label="A missão DETERA"
      style={{ "--total": total } as CSSProperties}
    >
      <div data-palco className="palco">
        {CENAS.map((cena, i) => (
          <div
            key={cena.id}
            id={cena.id}
            data-cena={i}
            data-lado={cena.lado}
            data-entrada={cena.entrada}
            data-painel={cena.painel ? "" : undefined}
            data-fora={i === 0 ? undefined : ""}
            className="cena"
          >
            <div className="cartao">{conteudo[cena.id]}</div>
          </div>
        ))}
      </div>
      <Instrumentos />
      <Roteiro />
    </section>
  );
}

/* ------------------------------------------------------------------ */

/**
 * A abertura é um letreiro de filme, sem botão: as estrelas da cena 3D se juntam
 * no lugar que este `<h1>` reserva, o nome acende e o slogan aparece. A ação
 * fica no cabeçalho. O formato anterior (logo à esquerda, slogan em itálico,
 * dois botões e uma dica de rolagem) foi recusado por ter cara de template.
 */
function Topo() {
  return (
    <>
      <h1 className="marca-titulo" data-nome>
        <Letreiro className="w-full" />
      </h1>
      <p className="slogan" style={k(1)}>
        {site.slogan}
      </p>
      <span className="dica" style={k(2)} aria-hidden="true" />
    </>
  );
}

function Sistema() {
  return (
    <>
      <h2 className="titulo-cena">O que já construímos</h2>
      <p className="promessa">Cada planeta é um projeto no ar.</p>
    </>
  );
}

function Foto({ imagem }: { imagem: ImagemPrevia }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- imagem local já otimizada, dentro de um cartão que se move pela rolagem
    <img
      className="projeto__foto"
      src={imagem.url}
      alt={imagem.alt}
      style={{ objectPosition: imagem.pos ?? "50% 50%" }}
      loading="lazy"
      decoding="async"
      width={1200}
      height={600}
    />
  );
}

function Caso({ caso }: { caso: Case }) {
  return (
    <article className="projeto" aria-labelledby={`caso-${caso.id}`}>
      <Foto imagem={caso.imagens[0]} />
      <h2 id={`caso-${caso.id}`} className="projeto__nome">
        {caso.cliente}
      </h2>
      <p className="projeto__setor">{caso.setor}</p>
      <p className="texto">{caso.resumo}</p>
      <div className="acoes">
        <a className="botao botao--acao" href={caso.url} target="_blank" rel="noopener noreferrer">
          Abrir o site
        </a>
        <Dossie rotulo="Ler o caso" titulo={caso.cliente}>
          <p className="dossie__lead">{caso.resumo}</p>
          <h4>O desafio</h4>
          <p>{caso.desafio}</p>
          <h4>A estratégia</h4>
          <p>{caso.estrategia}</p>
          <h4>O que foi construído</h4>
          <ul className="dossie__marcadores">
            {caso.solucao.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h4>O que mudou</h4>
          <p>{caso.impacto}</p>
          {caso.medicao ? (
            <>
              <h4>Notas medidas</h4>
              <dl className="notas">
                {(
                  [
                    ["Desempenho", caso.medicao.desempenho],
                    ["Acessibilidade", caso.medicao.acessibilidade],
                    ["Boas práticas", caso.medicao.praticas],
                    ["SEO", caso.medicao.seo],
                  ] as const
                ).map(([nome, nota]) => (
                  <div key={nome}>
                    <dt>{nome}</dt>
                    <dd>{nota}</dd>
                  </div>
                ))}
              </dl>
              <p className="dossie__stack">
                PageSpeed no celular, medido em {formatarData(caso.medicao.data)}.{" "}
                <a href={caso.medicao.relatorio} target="_blank" rel="noopener noreferrer">
                  Ver o relatório
                </a>
              </p>
            </>
          ) : null}
          <p className="dossie__stack">{caso.tecnologias.join(", ")}</p>
        </Dossie>
      </div>
    </article>
  );
}

function EmObra({ projeto }: { projeto: ProjetoEmConstrucao }) {
  return (
    <article className="projeto" aria-labelledby={`caso-${projeto.id}`}>
      <Foto imagem={projeto.imagem} />
      <h2 id={`caso-${projeto.id}`} className="projeto__nome">
        {projeto.cliente}
      </h2>
      <p className="projeto__setor">{projeto.setor}</p>
      <p className="texto">{projeto.resumo}</p>
      <div className="acoes">
        <a className="botao botao--acao" href={projeto.url} target="_blank" rel="noopener noreferrer">
          Abrir o site
        </a>
      </div>
    </article>
  );
}

function Frentes() {
  return (
    <>
      <h2 className="titulo-cena">O que fazemos</h2>
      <ul className="frentes">
        {pilares.map((pilar) => (
          <li key={pilar.id}>
            <h3 data-acento={pilar.acento}>{pilar.nome}</h3>
            <p>{pilar.promessa}</p>
          </li>
        ))}
      </ul>
      <div className="acoes">
        <Dossie rotulo="Ver as entregas" titulo="O que fazemos">
          {pilares.map((pilar) => (
            <div key={pilar.id} className="dossie__frente">
              <h4>{pilar.nome}</h4>
              <p>{pilar.descricao}</p>
              <dl className="dossie__lista">
                {pilar.entregas.map((entrega) => (
                  <div key={entrega.nome}>
                    <dt>{entrega.nome}</dt>
                    <dd>{entrega.texto}</dd>
                  </div>
                ))}
              </dl>
              <a
                className="botao botao--linha"
                href={whatsappUrl(pilar.mensagemWhatsapp)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {pilar.ctaTexto}
              </a>
            </div>
          ))}
        </Dossie>
        <Dossie rotulo="Como funciona" titulo="Como um projeto acontece">
          <ol className="dossie__lista">
            {etapas.map((etapa) => (
              <li key={etapa.numero}>
                <p className="dossie__etapa">
                  {etapa.numero} {etapa.titulo}
                </p>
                <p>{etapa.texto}</p>
              </li>
            ))}
          </ol>
          <p>A etapa 05 devolve para a 01: o que ela aprende vira a próxima descoberta.</p>
        </Dossie>
        <Dossie rotulo="Quem faz" titulo="Por que a DETERA existe">
          <p className="dossie__lead">
            Tecnologia sem estratégia vira ferramenta parada. Estratégia sem tecnologia vira promessa.
          </p>
          <p>
            A maior parte do mercado escolhe um lado. De um lado, quem faz site bonito e não sabe o que
            acontece com ele depois. Do outro, quem entende de servidor e nunca se perguntou se aquela
            página vende. A DETERA foi montada para não escolher.
          </p>
          <p>
            O nome vem de DETERMINAÇÃO, a força que mantém de pé o coração vermelho de Undertale, o jogo
            que inspirou a marca. Aqui ela vira critério de entrega: um projeto só está bom quando aguenta
            a próxima mudança do negócio sem precisar recomeçar.
          </p>
          <h4>{site.founder}</h4>
          <p>
            Mais de quatro anos em infraestrutura e cloud, hoje liderando um time responsável pela
            sustentação e disponibilidade de ambientes de produção, somados ao desenvolvimento web que
            virou a operação da DETERA.
          </p>
          <a
            className="botao botao--linha"
            href={site.founderPortfolio}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver a trajetória técnica completa
          </a>
        </Dossie>
      </div>
    </>
  );
}

function SeuProjeto() {
  return (
    <>
      <h2 className="titulo-cena titulo-cena--grande">O próximo planeta é o seu</h2>
      <div className="acoes">
        <a
          className="botao botao--acao"
          href={whatsappUrl("Olá! Vim pelo site da DETERA e quero conversar sobre o meu projeto.")}
          target="_blank"
          rel="noopener noreferrer"
        >
          Começar um projeto
        </a>
      </div>
    </>
  );
}

function Reentrada() {
  return (
    <p className="frase-reentrada">
      Personalidade é a mesma decisão repetida em cada parte do projeto, até virar reconhecível.
    </p>
  );
}

function Sinal() {
  return (
    <>
      <h2 className="titulo-cena">Conte o que você quer construir</h2>
      <p className="texto">A primeira conversa é um diagnóstico, sem custo.</p>
      <div className="acoes">
        <a
          className="botao botao--acao"
          href={whatsappUrl("Olá! Vim pelo site da DETERA e quero conversar sobre um projeto.")}
          target="_blank"
          rel="noopener noreferrer"
        >
          Conversar no WhatsApp
        </a>
        <a className="botao botao--linha" href="#contato">
          Mandar os detalhes
        </a>
      </div>
    </>
  );
}
