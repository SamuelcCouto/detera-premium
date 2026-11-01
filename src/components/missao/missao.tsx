import type { CSSProperties, ReactNode } from "react";

import { Letreiro, Simbolo } from "@/components/brand/wordmark";
import { Dossie } from "@/components/missao/dossie";
import { Instrumentos } from "@/components/missao/instrumentos";
import { Roteiro } from "@/components/missao/roteiro";
import { cases, type Case } from "@/content/cases";
import { sintomas } from "@/content/diagnostico";
import { projetosEmConstrucao } from "@/content/em-construcao";
import { transformacoes } from "@/content/personalidade";
import { pilares } from "@/content/pilares";
import { etapas } from "@/content/processo";
import { site } from "@/config/site";
import { CENAS, medidas } from "@/lib/missao/cenas";
import { whatsappUrl } from "@/lib/utils/whatsapp";

/** Ordem de chegada de cada peça dentro do cartão: as de índice maior ficam um pouco para trás. */
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
 * O primeiro cartão já sai do servidor em cena (`--o: 1`), e os outros fora,
 * para a primeira pintura não depender da hidratação.
 */
export function Missao() {
  const { total } = medidas();

  const conteudo: Record<string, ReactNode> = {
    topo: <Topo />,
    sinais: <Sinais />,
    personalidade: <Aproximacao />,
    fecho: <Fecho />,
    projetos: <Projeto caso={cases[0]} titulo />,
    "case-fidele": <Projeto caso={cases[1]} />,
    "em-obra": <EmObra />,
    sobre: <Diario />,
    sinal: <Sinal />,
  };
  pilares.forEach((pilar, i) => {
    conteudo[i === 0 ? "solucoes" : `frente-${pilar.id}`] = <Frente indice={i} />;
  });
  transformacoes.forEach((_, i) => {
    conteudo[`par-${i + 1}`] = <Par indice={i} />;
  });
  etapas.forEach((_, i) => {
    conteudo[i === 0 ? "processo" : `etapa-${i + 1}`] = <Etapa indice={i} />;
  });

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
            data-ato={cena.ato}
            data-fora={i === 0 ? undefined : ""}
            className="cena"
            style={
              (i === 0 ? { "--d": 0, "--q": 0, "--o": 1 } : { "--d": -1, "--q": -1, "--o": 0 }) as CSSProperties
            }
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

function Topo() {
  return (
    <>
      <h1 className="marca-titulo" style={k(0)}>
        <Letreiro caindo className="w-full" />
      </h1>
      <p className="slogan" style={k(1)}>
        {site.slogan}
      </p>
      <p className="texto" style={k(2)}>
        Toda ideia de negócio começa parecida com as outras. O nosso trabalho é tecnologia,
        estratégia e design aplicados até ela virar algo que só a sua empresa tem.
      </p>
      <div className="acoes" style={k(3)}>
        <a
          className="botao botao--acao"
          href={whatsappUrl("Olá! Vim pelo site da DETERA e quero começar um projeto.")}
          target="_blank"
          rel="noopener noreferrer"
        >
          Começar um projeto
        </a>
        <a className="botao botao--linha" href="#solucoes">
          Conhecer as quatro frentes
        </a>
      </div>
      <p className="dica" style={k(4)} aria-hidden="true">
        Role para entrar no sistema
      </p>
    </>
  );
}

function Sinais() {
  return (
    <>
      <h2 className="titulo-cena" style={k(0)}>
        Quatro sinais de que algo trava
      </h2>
      <ul className="sinais">
        {sintomas.map((sintoma, i) => (
          <li key={sintoma.titulo} style={k(i + 1)}>
            <h3>{sintoma.titulo}</h3>
            <p>{sintoma.texto}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

function Frente({ indice }: { indice: number }) {
  const pilar = pilares[indice];
  return (
    <>
      <h2 className="titulo-cena" style={k(0)} data-acento={pilar.acento}>
        {pilar.nome}
      </h2>
      <p className="promessa" style={k(1)}>
        {pilar.promessa}
      </p>
      <p className="texto texto--opcional" style={k(2)}>
        {pilar.descricao}
      </p>
      <ul className="entregas" style={k(3)} aria-label={`Entregas de ${pilar.nome}`}>
        {pilar.entregas.map((entrega) => (
          <li key={entrega.nome}>{entrega.nome}</li>
        ))}
      </ul>
      <div className="acoes" style={k(4)}>
        <Dossie rotulo={`Ver as ${pilar.entregas.length} entregas`} titulo={pilar.nome}>
          <p className="dossie__lead">{pilar.descricao}</p>
          <dl className="dossie__lista">
            {pilar.entregas.map((entrega) => (
              <div key={entrega.nome}>
                <dt>{entrega.nome}</dt>
                <dd>{entrega.texto}</dd>
              </div>
            ))}
          </dl>
          <a
            className="botao botao--acao"
            href={whatsappUrl(pilar.mensagemWhatsapp)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {pilar.ctaTexto}
          </a>
        </Dossie>
      </div>
    </>
  );
}

function Aproximacao() {
  return (
    <>
      <h2 className="titulo-cena titulo-cena--grande" style={k(0)}>
        {site.slogan}
      </h2>
      <p className="texto" style={k(1)}>
        É a frase que orienta cada projeto. Quatro decisões separam o que só funciona do que também
        tem cara própria.
      </p>
    </>
  );
}

function Par({ indice }: { indice: number }) {
  const par = transformacoes[indice];
  return (
    <div className="par">
      <p className="par__generico" style={k(0)}>
        {par.generico}
      </p>
      <p className="par__especifico" style={k(1)}>
        <Simbolo className="par__simbolo" />
        <span>{par.especifico}</span>
      </p>
    </div>
  );
}

function Fecho() {
  return (
    <p className="par__especifico par__especifico--fecho" style={k(0)}>
      Personalidade é a mesma decisão repetida em cada parte do projeto, até virar reconhecível.
    </p>
  );
}

function Projeto({ caso, titulo = false }: { caso: Case; titulo?: boolean }) {
  const imagem = caso.imagens[0];
  return (
    <>
      {titulo ? (
        <h2 className="titulo-cena titulo-cena--menor" style={k(0)}>
          O que já construímos
        </h2>
      ) : null}
      <article className="projeto" aria-labelledby={`caso-${caso.id}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- foto local já otimizada, dentro de um cartão que se move pela rolagem */}
        <img
          className="projeto__foto"
          src={imagem.url}
          alt={imagem.alt}
          style={{ ...k(1), objectPosition: imagem.pos ?? "50% 50%" }}
          loading="lazy"
          decoding="async"
          width={1200}
          height={675}
        />
        <div className="projeto__corpo" style={k(2)}>
          <h3 id={`caso-${caso.id}`}>{caso.cliente}</h3>
          <p className="projeto__setor">{caso.setor}</p>
          <p className="texto">{caso.resumo}</p>
          {caso.medicao ? (
            <div className="notas">
              <dl>
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
              <p>
                PageSpeed no celular, medido em {formatarData(caso.medicao.data)}.{" "}
                <a href={caso.medicao.relatorio} target="_blank" rel="noopener noreferrer">
                  Ver o relatório
                </a>
              </p>
            </div>
          ) : null}
        </div>
        <div className="acoes" style={k(3)}>
          <Dossie rotulo="Ler o caso inteiro" titulo={caso.cliente}>
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
            <p className="dossie__stack">{caso.tecnologias.join(", ")}</p>
          </Dossie>
          <a className="botao botao--linha" href={caso.url} target="_blank" rel="noopener noreferrer">
            Abrir {caso.urlRotulo}
          </a>
        </div>
      </article>
    </>
  );
}

function EmObra() {
  return (
    <>
      <h2 className="titulo-cena titulo-cena--menor" style={k(0)}>
        Também em obra
      </h2>
      <p className="texto" style={k(1)}>
        Projetos que já estão no ar e ainda não fecharam um ciclo para virar estudo de caso.
      </p>
      <ul className="obras">
        {projetosEmConstrucao.map((projeto, i) => (
          <li key={projeto.id} style={k(i + 2)}>
            <h3>{projeto.cliente}</h3>
            <p className="projeto__setor">{projeto.setor}</p>
            <p>{projeto.resumo}</p>
            <a href={projeto.url} target="_blank" rel="noopener noreferrer">
              {projeto.urlRotulo}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

function Etapa({ indice }: { indice: number }) {
  const etapa = etapas[indice];
  const ultima = indice === etapas.length - 1;
  return (
    <>
      {indice === 0 ? (
        <h2 className="titulo-cena titulo-cena--menor" style={k(0)}>
          Como um projeto acontece
        </h2>
      ) : null}
      <p className="etapa__numero" style={k(1)} aria-hidden="true">
        {etapa.numero}
      </p>
      <h3 className="etapa__titulo" style={k(1)}>
        <span className="sr-only">Etapa {etapa.numero}: </span>
        {etapa.titulo}
      </h3>
      <p className="texto" style={k(2)}>
        {etapa.texto}
      </p>
      {ultima ? (
        <p className="etapa__laco" style={k(3)}>
          A órbita fecha aqui e volta para a etapa 01: o que a quinta etapa aprende vira a próxima
          descoberta.
        </p>
      ) : null}
    </>
  );
}

function Diario() {
  return (
    <>
      <h2 className="titulo-cena" style={k(0)}>
        Por que a DETERA existe
      </h2>
      <p className="promessa" style={k(1)}>
        Tecnologia sem estratégia vira ferramenta parada. Estratégia sem tecnologia vira promessa.
      </p>
      <p className="texto" style={k(2)}>
        O nome vem de DETERMINAÇÃO, a força que mantém de pé o coração vermelho de Undertale, o jogo
        que inspirou a marca. Aqui ela vira critério de entrega: um projeto só está bom quando aguenta
        a próxima mudança do negócio sem precisar recomeçar.
      </p>
      <p className="assinatura" style={k(3)}>
        <Simbolo className="assinatura__simbolo" />
        <span>
          {site.founder}, fundador e responsável técnico
        </span>
      </p>
      <div className="acoes" style={k(4)}>
        <Dossie rotulo="Ler o diário inteiro" titulo="Por que a DETERA existe">
          <p className="dossie__lead">
            Tecnologia sem estratégia vira ferramenta parada. Estratégia sem tecnologia vira
            promessa.
          </p>
          <p>
            A maior parte do mercado escolhe um lado. De um lado, quem faz site bonito e não sabe o que
            acontece com ele depois. Do outro, quem entende de servidor e nunca se perguntou se aquela
            página vende. Os dois entregam metade do problema resolvido, e a conta da outra metade
            sobra para o cliente.
          </p>
          <p>
            A DETERA foi montada para não escolher. Estratégia, conteúdo, desenvolvimento, publicação e
            continuidade são partes do mesmo trabalho, porque na operação do cliente elas são
            inseparáveis. Um site que converte precisa estar no ar, e um site no ar precisa de gente
            chegando nele.
          </p>
          <p>
            O nome vem de DETERMINAÇÃO, a força que mantém de pé o coração vermelho de Undertale, o
            jogo que inspirou a marca. Aqui ela vira critério de entrega: um projeto só está bom quando
            aguenta a próxima mudança do negócio sem precisar recomeçar.
          </p>
          <h4>{site.founder}</h4>
          <p>
            Mais de quatro anos em infraestrutura e cloud, hoje liderando um time responsável pela
            sustentação e disponibilidade de ambientes de produção, somados ao desenvolvimento web que
            virou a operação da DETERA. Na prática: quem projeta a página é quem entende o que acontece
            com ela às três da manhã de um domingo.
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

function Sinal() {
  return (
    <>
      <h2 className="titulo-cena titulo-cena--grande" style={k(0)}>
        Sinal aberto
      </h2>
      <p className="texto" style={k(1)}>
        Conte o que você está tentando construir. A primeira conversa é um diagnóstico, e se outra
        empresa atender melhor o seu caso, você ouve isso também.
      </p>
      <div className="acoes" style={k(2)}>
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
