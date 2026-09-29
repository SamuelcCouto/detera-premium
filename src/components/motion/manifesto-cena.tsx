"use client";

import { useRef, type ReactNode } from "react";

import { falar } from "@/lib/fala";
import {
  COM_MOVIMENTO,
  definirRetencao,
  estaNavegando,
  gsap,
  obterLenis,
  ScrollTrigger,
  useGSAP,
} from "@/lib/motion";
import { montarCoracao } from "@/lib/montar-coracao";

/**
 * Altura mínima para o palco. Numa tela deitada de celular não cabe o título
 * e um par inteiro ao mesmo tempo; ali o manifesto fica como lista.
 */
const COM_PALCO = `${COM_MOVIMENTO} and (min-height: 560px)`;

/**
 * Ritmo da fala, em segundos. É tempo de relógio, não de rolagem: rolar
 * rápido não faz a frase passar rápido. Os valores seguem os da fala do
 * hero (0,024 s por letra) e da chamada (0,026), com a frase principal um
 * pouco mais lenta por ser a que precisa ser lida.
 */
const GENERICA = 0.016;
const ESPECIFICA = 0.028;
const FECHO = 0.028;
/** O tempo que uma frase fica inteira na tela antes de a próxima começar. */
const LEITURA = 1.3;
/**
 * Quem insiste em rolar enquanto a seção segura acelera a fala, como segurar
 * o botão numa caixa de diálogo de jogo: o texto corre, mas não pula.
 */
const PRESSA = 3;
const JANELA_DA_PRESSA = 450;
/** Rolando para cima, a fala desfaz rápido até o par pedido. */
const VOLTA = 4;

/** Teclas que rolam para baixo, e quanto cada uma rola. */
const TECLAS: Record<string, () => number> = {
  ArrowDown: () => 40,
  PageDown: () => window.innerHeight * 0.8,
  " ": () => window.innerHeight * 0.8,
  End: () => Number.POSITIVE_INFINITY,
};

/**
 * O manifesto como diálogo: "transformando ideias em personalidade" dito,
 * não explicado.
 *
 * A seção fica fixada e vira uma caixa de fala. Para cada par, a ideia
 * genérica aparece em cinza, o coração vermelho marca quem vai falar e a
 * frase específica sai letra a letra embaixo dela, com a pausa depois de cada
 * vírgula e ponto. Lida a frase, o losango do par acende e fica aceso
 * (salvo), e a fala avança de uma vez para o próximo par, como uma caixa de
 * diálogo que troca de página. No fim, o coração se monta bloco a bloco ao
 * lado da última frase.
 *
 * A fala anda por tempo, não pela rolagem. Na primeira versão ela estava
 * amarrada ao scrub e andava na velocidade do dedo: quem descia rápido via
 * as frases passarem ilegíveis, ou nem via. Agora a rolagem só diz até que
 * página o diálogo deve ir (o trecho fixado é dividido em uma faixa por par
 * mais o fecho), e a timeline, pausada, persegue esse ponto no próprio ritmo.
 * Se a pessoa chega ao fim do trecho antes de a fala acabar, a página segura
 * ali, com a seção ainda na tela, até a última frase ser dita. Âncora de
 * menu atravessa sem segurar, e quem chega de baixo (recarregou mais abaixo,
 * pulou por link) encontra o diálogo já completo.
 *
 * Sem JavaScript, com movimento reduzido ou em tela baixa, nada disto roda e
 * a seção é a lista de sempre: o modo palco é só a classe `manifesto--palco`,
 * que este componente põe e tira, com o layout no CSS.
 */
export function ManifestoCena({ children }: { children: ReactNode }) {
  const raiz = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(COM_PALCO, () => {
        const secao = raiz.current!.querySelector<HTMLElement>(".manifesto")!;
        secao.classList.add("manifesto--palco");

        const falaDe = (el: Element, seletor: string) =>
          el.querySelector(`${seletor} [data-fala]`)!;

        const pares = gsap.utils.toArray<HTMLElement>("[data-par]");
        const progresso = gsap.utils.toArray<HTMLElement>("[data-progresso-vivo]");
        const fecho = raiz.current!.querySelector<HTMLElement>("[data-fecho]")!;
        const marca = fecho.querySelector<SVGSVGElement>("[data-fecho-marca] svg")!;
        const falaDoFecho = falaDe(fecho, "[data-fecho-texto]");

        gsap.set(progresso, { opacity: 0 });
        gsap.set(fecho, { autoAlpha: 0 });
        pares.forEach((par, i) => {
          gsap.set(par, { autoAlpha: i === 0 ? 1 : 0 });
          gsap.set(par.querySelector("[data-voz]"), { opacity: 0 });
        });

        // A timeline inteira, em segundos, pausada: quem a move é `perseguir`.
        // `fins[k]` é o instante em que a página k do diálogo termina de ser
        // dita; é para um desses pontos que a rolagem aponta.
        const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
        const fins: number[] = [];
        // Começa um pouco depois do zero: `set` no instante 0 é aplicado na
        // hora, e o coração da voz apareceria antes de a seção chegar.
        let t = 0.05;
        pares.forEach((par, i) => {
          // A primeira ideia genérica já está na tela quando a seção chega;
          // as outras são faladas quando o par entra, depois de a anterior
          // ter ficado o tempo de leitura inteira na tela.
          if (i > 0) {
            t += LEITURA;
            tl.set(pares[i - 1], { autoAlpha: 0 }, t);
            tl.set(par, { autoAlpha: 1 }, t);
            t =
              falar(tl, falaDe(par, "[data-generico]"), {
                inicio: t,
                porLetra: GENERICA,
                pausa: 1,
              }) + 0.15;
          }
          tl.set(par.querySelector("[data-voz]"), { opacity: 1 }, t);
          t = falar(tl, falaDe(par, "[data-especifico]"), {
            inicio: t + 0.12,
            porLetra: ESPECIFICA,
          });
          tl.set(progresso[i], { opacity: 1 }, t);
          fins.push(t);
        });

        t += LEITURA;
        tl.set(pares[pares.length - 1], { autoAlpha: 0 }, t);
        tl.set(fecho, { autoAlpha: 1 }, t);
        t = montarCoracao(tl, marca, { inicio: t, passo: 0.04 });
        t = falar(tl, falaDoFecho, { inicio: t - 0.1, porLetra: FECHO });
        fins.push(t);
        const total = t;
        const terminou = () => tl.time() >= total - 0.001;

        // Retenção: a página parada no fim do trecho enquanto a fala termina.
        // No celular, o `overflow: hidden` da classe é o que para o dedo: um
        // arrasto que já começou a rolar tem `touchmove` não cancelável, e
        // corrigir a posição a cada evento fazia a seção tremer. No desktop a
        // classe não faz nada (sumir a barra de rolagem mudaria a largura da
        // página); lá quem segura é a roda, pelo Lenis, e o teclado.
        let retendo = false;
        const reter = () => {
          if (retendo) return;
          retendo = true;
          document.documentElement.classList.add("rolagem-retida");
        };
        const soltar = () => {
          if (!retendo) return;
          retendo = false;
          document.documentElement.classList.remove("rolagem-retida");
        };

        // A timeline anda na direção do alvo no ritmo dela, quadro a quadro.
        let alvo = 0;
        let pressaAte = 0;
        const apressar = () => {
          pressaAte = performance.now() + JANELA_DA_PRESSA;
        };
        const perseguir = (_tempo: number, delta: number) => {
          const atual = tl.time();
          if (atual === alvo) return;
          const frente = alvo > atual;
          const ritmo = frente ? (performance.now() < pressaAte ? PRESSA : 1) : VOLTA;
          // Limite no passo: com a aba em segundo plano o quadro seguinte
          // chega segundos depois, e a fala pularia frases inteiras.
          const passo = (Math.min(delta, 100) / 1000) * ritmo;
          tl.time(frente ? Math.min(alvo, atual + passo) : Math.max(alvo, atual - passo));
          if (retendo && terminou()) soltar();
        };
        gsap.ticker.add(perseguir);

        // Leva a página ao limite. Primeiro a janela, depois o Lenis: depois
        // de um salto imediato ele ignora o próximo evento de rolagem nativa
        // e fica com a posição velha, e aí um segundo `lenis.scrollTo` para o
        // mesmo ponto achava que já estava lá e não fazia nada.
        const segurar = (fim: number) => {
          window.scrollTo(0, fim);
          obterLenis()?.scrollTo(fim, { immediate: true, force: true });
        };

        let ultima = window.scrollY;
        const trecho = ScrollTrigger.create({
          trigger: secao,
          start: "top top",
          end: "+=240%",
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const y = self.scroll();
            // `self`, e não `trecho`: o primeiro onUpdate pode vir de dentro do
            // próprio `create`, antes de a constante existir.
            const fim = self.end - 1;
            if (y > fim) {
              // Veio de dentro do trecho (rolagem, não salto) e a fala não
              // acabou: volta para o limite e deixa o diálogo terminar.
              if (
                !terminou() &&
                !estaNavegando() &&
                ultima >= self.start &&
                ultima <= fim + 1
              ) {
                segurar(fim);
                reter();
                apressar();
                alvo = total;
                ultima = fim;
                return;
              }
              // Passou por âncora ou já estava abaixo: o diálogo fica completo.
              soltar();
              alvo = total;
              tl.time(total);
              ultima = y;
              return;
            }
            // Voltou para dentro do trecho: a pessoa quer reler, não segura.
            if (retendo && y < fim - 2) soltar();
            const pagina = Math.min(fins.length - 1, Math.floor(self.progress * fins.length));
            if (!retendo) alvo = fins[pagina];
            ultima = y;
          },
        });

        // O resto de um arrasto ou de um arremesso que ainda passa do limite
        // depois de a retenção começar: o ScrollTrigger não avisa (o progresso
        // já está em 1 e não muda), então a janela é vigiada direto.
        const aoRolar = () => {
          if (!retendo) return;
          if (estaNavegando()) return soltar();
          const fim = trecho.end - 1;
          if (window.scrollY > fim) segurar(fim);
        };
        window.addEventListener("scroll", aoRolar, { passive: true });

        // Um gesto para baixo que levaria a página além do limite, com a
        // pessoa dentro do trecho e a fala por acabar, é segurado.
        const limite = () => trecho.end - 1;
        const deveSegurar = (delta: number, base: number) =>
          delta > 0 &&
          !terminou() &&
          !estaNavegando() &&
          base >= trecho.start &&
          base <= limite() + 1 &&
          base + delta > limite();

        // Roda do mouse (pelo Lenis): segura antes de a página passar do
        // limite, em vez de ela passar e voltar. Para cima, sempre passa.
        definirRetencao((delta) => {
          if (delta > 0 && retendo) {
            apressar();
            return true;
          }
          const lenis = obterLenis();
          const base = lenis?.targetScroll ?? window.scrollY;
          if (!deveSegurar(delta, base)) return false;
          apressar();
          if (lenis && lenis.targetScroll < limite()) lenis.scrollTo(limite());
          return true;
        });

        // Dedo: o primeiro `touchmove` de um arrasto ainda é cancelável, e
        // cancelá-lo impede o arrasto inteiro. Arrastar para baixo (subir a
        // página) solta a retenção, e o gesto seguinte já rola.
        let dedoY = 0;
        const aoTocar = (e: TouchEvent) => {
          dedoY = e.touches[0]?.clientY ?? 0;
        };
        const aoArrastar = (e: TouchEvent) => {
          const y = e.touches[0]?.clientY ?? dedoY;
          const delta = dedoY - y;
          dedoY = y;
          if (delta < -6) {
            soltar();
            return;
          }
          if (retendo || deveSegurar(delta, window.scrollY)) {
            if (e.cancelable) e.preventDefault();
            if (delta > 0) apressar();
          }
        };

        // Teclado: para baixo, segura e leva ao limite (quem apertou End quer
        // o fim, e o fim do trecho é onde a fala termina); para cima, solta.
        const aoTeclar = (e: KeyboardEvent) => {
          const origem = e.target as HTMLElement | null;
          if (origem?.closest?.("input, textarea, select, [contenteditable]")) return;
          if (["ArrowUp", "PageUp", "Home"].includes(e.key) || (e.key === " " && e.shiftKey)) {
            soltar();
            return;
          }
          const medida = TECLAS[e.key];
          if (!medida) return;
          if (retendo || deveSegurar(medida(), window.scrollY)) {
            e.preventDefault();
            apressar();
            if (!retendo) segurar(limite());
          }
        };
        window.addEventListener("touchstart", aoTocar, { passive: true });
        window.addEventListener("touchmove", aoArrastar, { passive: false });
        window.addEventListener("keydown", aoTeclar);

        return () => {
          soltar();
          gsap.ticker.remove(perseguir);
          definirRetencao(null);
          window.removeEventListener("touchstart", aoTocar);
          window.removeEventListener("touchmove", aoArrastar);
          window.removeEventListener("keydown", aoTeclar);
          window.removeEventListener("scroll", aoRolar);
          secao.classList.remove("manifesto--palco");
        };
      });
    },
    { scope: raiz },
  );

  return <div ref={raiz}>{children}</div>;
}
