"use client";

import { useRef, type ReactNode } from "react";

import { apagar, falar } from "@/lib/fala";
import { criarGrade } from "@/lib/grade";
import { COM_MOVIMENTO, gsap, ScrollTrigger, useGSAP } from "@/lib/motion";
import { montarCoracao } from "@/lib/montar-coracao";

/**
 * Altura mínima para tentar o pin. Abaixo disso (celular deitado) o hero
 * nunca cabe na tela. Acima, a decisão final é medida: ver `fixar`.
 */
const ALTO = "(min-height: 560px)";

/**
 * Centro do símbolo sob o "A", em unidades do `viewBox` do `Letreiro`
 * (`translate(631 140) scale(1.3)` sobre a caixa de 32 × 40 do símbolo), a
 * largura das placas nessa escala (x de 5 a 27, vezes 1,3) e a largura do
 * `viewBox`. Com eles se converte pixel de tela em unidade do SVG.
 */
const CORACAO = { x: 631 + 16 * 1.3, y: 140 + 20 * 1.3, largura: 22 * 1.3 };
const LARGURA_NOME = 716;

/**
 * Tamanho do coração no centro da tela, em pixels: 30% do menor lado, entre
 * 96 e 130. Escala fixa não servia: o nome no celular tem metade da largura
 * do de notebook, e o mesmo fator deixava o coração com 38px lá.
 */
const tamanhoDoCoracao = () =>
  Math.min(130, Math.max(96, Math.min(window.innerWidth, window.innerHeight) * 0.3));

/**
 * O hero da DETERA, em dois tempos.
 *
 * **Ao carregar** (a única animação por tempo da página): o coração se monta
 * bloco a bloco no centro da tela, a linha de energia carrega, o núcleo
 * acende e ele desce para o lugar dele, embaixo do "A". As letras do nome
 * encaixam uma a uma e o slogan é falado.
 *
 * **Na rolagem** (fixado por 130% da tela): a fala é apagada de trás para
 * frente, as letras descem para fora em degraus, o coração volta ao centro e
 * cresce, e a câmera atravessa o núcleo: a cruz vermelha toma a tela e se
 * parte numa grade de blocos que se apagam um a um, abrindo o céu. É o
 * momento marcante do site.
 *
 * Tudo em degraus de pixel (`steps`), sem blur: o blur que desfazia o nome
 * na v1 era o gesto de outra marca, e cada letra desfocada custava um
 * redesenho inteiro por quadro.
 *
 * Entrada e rolagem nunca animam a mesma coisa: a entrada mexe nas camadas
 * de dentro (`data-letra-entra`, `data-coracao-entra`, `data-entra`) e a
 * rolagem nas de fora (`data-letra-desfaz`, `data-hero-coracao`,
 * `data-hero-resto`). No slogan são duas contas no mesmo bloco: `--fala`
 * (a entrada) e `--resto` (o apagar da rolagem).
 *
 * O `div` de fora é deste componente e fica fora do pin: o GSAP põe o
 * "pin-spacer" entre ele e a `<section>`. O marco `data-fim-do-hero` é o
 * que o cabeçalho observa para ficar sólido.
 */
export function HeroCena({ children }: { children: ReactNode }) {
  const raiz = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia(raiz.current!);
      const palco = raiz.current!.querySelector<HTMLElement>(".hero-palco")!;
      const nome = raiz.current!.querySelector<SVGSVGElement>("[data-hero-nome] svg")!;
      const travessia = raiz.current!.querySelector<HTMLElement>("[data-travessia]")!;
      let vivo = true;

      // Quanto o coração anda, em unidades do SVG, até o centro da tela, e
      // quanto cresce. Medido em relação ao palco e não à janela: durante o
      // pin o palco está `fixed` no topo e a janela já rolou.
      const rumoDoCoracao = () => {
        const caixa = nome.getBoundingClientRect();
        const base = palco.getBoundingClientRect();
        const escala = caixa.width / LARGURA_NOME;
        return {
          x: (palco.clientWidth / 2 - (caixa.left - base.left + CORACAO.x * escala)) / escala,
          y: (window.innerHeight * 0.52 - (caixa.top - base.top + CORACAO.y * escala)) / escala,
          crescimento: tamanhoDoCoracao() / (CORACAO.largura * escala),
        };
      };

      // ---------- entrada ----------
      mm.add(COM_MOVIMENTO, () => {
        const coracao = raiz.current!.querySelector<SVGGElement>("[data-coracao-entra]")!;
        const fala = raiz.current!.querySelector("[data-hero-slogan] [data-fala]")!;
        const rumo = rumoDoCoracao();

        // Os invólucros começam escondidos pelo CSS (com a rede de segurança
        // de 3,5 s, para o caso de o JavaScript não chegar); daqui em diante
        // quem esconde e mostra cada peça é a timeline.
        gsap.set("[data-intro]", { opacity: 1 });

        const tl = gsap.timeline({ delay: 0.12 });
        tl.set(
          coracao,
          { x: rumo.x, y: rumo.y, scale: rumo.crescimento, transformOrigin: "50% 50%" },
          0,
        );
        const pronto = montarCoracao(tl, coracao, { inicio: 0.02, passo: 0.035 });
        tl.to(coracao, { x: 0, y: 0, scale: 1, duration: 0.55, ease: "power3.inOut" }, pronto + 0.08)
          .fromTo(
            "[data-letra-entra]",
            { opacity: 0, yPercent: 36 },
            { opacity: 1, yPercent: 0, duration: 0.15, ease: "steps(3)", stagger: 0.065 },
            pronto + 0.2,
          );
        falar(tl, fala, { inicio: pronto + 0.62, porLetra: 0.024 });
        tl.fromTo(
          "[data-entra]",
          { opacity: 0 },
          { opacity: 1, duration: 0.01, stagger: 0.14 },
          pronto + 0.9,
        );
      });

      // ---------- rolagem ----------
      const montarRolagem = () =>
        mm.add({ movimento: COM_MOVIMENTO, alto: ALTO }, (contexto) => {
          const { movimento, alto } = contexto.conditions as { movimento: boolean; alto: boolean };
          if (!movimento) return;

          // Fixa só se o hero inteiro couber na tela. A seção tem `min-h-svh`:
          // quando o conteúdo passa da altura ela cresce, e com pin o que
          // sobrasse embaixo ficaria escondido e sairia desfeito.
          const fixar = alto && palco.offsetHeight <= window.innerHeight + 1;

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: fixar
              ? {
                  trigger: palco,
                  start: "top top",
                  end: "+=130%",
                  pin: true,
                  scrub: true,
                  anticipatePin: 1,
                  // O caminho do coração depende do tamanho da tela.
                  invalidateOnRefresh: true,
                }
              : { trigger: palco, start: "top top", end: "60% top", scrub: true },
          });

          // Começa um fio depois do zero: um `set` no ponto zero de uma
          // timeline é aplicado na hora, e a última letra do slogan sumia
          // antes de a pessoa rolar.
          apagar(tl, raiz.current!.querySelector("[data-hero-slogan] [data-fala]")!, {
            inicio: 0.005,
            porLetra: 0.004,
          });
          tl.to("[data-hero-resto]", { opacity: 0, duration: 0.01, stagger: 0.04 }, 0.02)
            .to("[data-hero-nave]", { opacity: 0, duration: 0.12, ease: "steps(3)" }, 0)
            .to(
              "[data-hero-nome] [data-letra-desfaz]",
              { yPercent: 90, opacity: 0, duration: 0.16, ease: "steps(4)", stagger: 0.03 },
              0.06,
            );

          if (!fixar) {
            tl.to("[data-hero-coracao]", { opacity: 0, duration: 0.12, ease: "steps(3)" }, 0.18);
            return;
          }

          // O coração volta ao centro e cresce…
          tl.to(
            "[data-hero-coracao]",
            {
              x: () => rumoDoCoracao().x,
              y: () => rumoDoCoracao().y,
              scale: () => rumoDoCoracao().crescimento,
              transformOrigin: "50% 50%",
              duration: 0.26,
              ease: "power3.inOut",
            },
            0.26,
          );

          // …e a câmera atravessa o núcleo. A travessia é uma camada de blocos
          // vermelhos do tamanho da tela que nasce do tamanho do núcleo e
          // cresce a partir do centro dele: escalar um `div` sai barato, e o
          // SVG do coração crescendo 50× repintaria a tela inteira a cada
          // quadro.
          const grade = criarGrade(travessia, {
            lado: window.innerWidth < 768 ? 48 : 72,
            semente: 1109,
          });
          const escalaInicial = () => 28 / Math.max(window.innerWidth, window.innerHeight);

          tl.to(
            "[data-hero-coracao]",
            { scale: () => rumoDoCoracao().crescimento * 1.8, duration: 0.12, ease: "power3.in" },
            0.56,
          )
            .fromTo(
              travessia,
              { autoAlpha: 0, scale: escalaInicial, transformOrigin: "50% 52%" },
              { autoAlpha: 1, scale: 1, duration: 0.16, ease: "power3.in" },
              0.58,
            )
            .set("[data-hero-coracao]", { opacity: 0 }, 0.74)
            // A tela vermelha se parte: os blocos apagam um a um, na ordem
            // sorteada, e o que fica atrás é o céu.
            .to(grade.blocos, { opacity: 0, duration: 0.01, stagger: { amount: 0.2 } }, 0.78);

          return () => grade.remover();
        });

      // A decisão de fixar mede a altura do hero, e a altura depende da
      // fonte. Com a fonte já carregada (o caso comum), monta na hora, na
      // ordem da página. Se ainda não, espera por ela; aí os gatilhos das
      // seções de baixo já existem e precisam ser reordenados e recalculados
      // para contar com o espaço que este pin acrescenta acima deles.
      if (document.fonts.status === "loaded") {
        montarRolagem();
      } else {
        document.fonts.ready.then(() => {
          if (!vivo) return;
          montarRolagem();
          ScrollTrigger.sort();
          ScrollTrigger.refresh();
        });
      }

      return () => {
        vivo = false;
        mm.revert();
      };
    },
    { scope: raiz },
  );

  return (
    <div ref={raiz} className="relative">
      {children}
      <span
        data-fim-do-hero
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
      />
    </div>
  );
}
