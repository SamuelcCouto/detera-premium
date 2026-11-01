"use client";

import { useEffect, useRef } from "react";

import { pilares } from "@/content/pilares";
import { CENAS } from "@/lib/missao/cenas";
import { E } from "@/lib/missao/estado";
import { gsap } from "@/lib/motion";

/** Os atos da missão: o nome e a cena em que cada um começa. */
const ATOS = CENAS.reduce<{ nome: string; cena: number; id: string }[]>((lista, cena, i) => {
  if (!lista.length || lista[lista.length - 1].nome !== cena.ato) {
    lista.push({ nome: cena.ato, cena: i, id: cena.id });
  }
  return lista;
}, []);

/** A cena de cada frente, na ordem dos planetas. */
const CENAS_DAS_FRENTES = CENAS.flatMap((cena, i) => (typeof cena.foco === "number" && cena.ato === "Sistema" ? [i] : []));

/**
 * Os instrumentos da cabine. Leem o estado da missão a cada quadro e escrevem
 * direto no DOM (posição, texto, opacidade), sem passar pelo React.
 *
 * - Trajetória: a linha da missão com os atos; é também a navegação entre
 *   eles, por isso cada marco é um link de verdade.
 * - Altímetro: aparece na reentrada e despenca junto com a câmera.
 * - Etiquetas: o nome de cada frente preso ao planeta por uma linha, com a
 *   posição projetada da cena 3D.
 */
export function Instrumentos() {
  const marcador = useRef<HTMLSpanElement>(null);
  const trilha = useRef<HTMLElement>(null);
  const altimetro = useRef<HTMLDivElement>(null);
  const leitura = useRef<HTMLSpanElement>(null);
  const fita = useRef<HTMLDivElement>(null);
  const etiquetas = useRef<(HTMLAnchorElement | null)[]>([]);
  const linhas = useRef<(SVGLineElement | null)[]>([]);

  useEffect(() => {
    const html = document.documentElement;
    let atoAceso = -1;
    const tique = () => {
      const linear = html.classList.contains("linear");
      const total = CENAS.length - 1;

      if (marcador.current) {
        marcador.current.style.transform = `translateY(calc(${(E.s / total).toFixed(4)} * var(--trilha)))`;
      }
      // O ato atual: o último cujo começo já passou.
      const atual = ATOS.reduce((achado, ato, i) => (E.s >= ato.cena - 0.5 ? i : achado), 0);
      if (atual !== atoAceso) {
        atoAceso = atual;
        trilha.current?.querySelectorAll("a").forEach((a, i) => {
          if (i === atual) a.setAttribute("aria-current", "step");
          else a.removeAttribute("aria-current");
        });
      }

      if (altimetro.current && leitura.current && fita.current) {
        const vis = linear ? 0 : E.altVisivel;
        altimetro.current.style.opacity = vis.toFixed(3);
        altimetro.current.style.visibility = vis < 0.01 ? "hidden" : "visible";
        if (vis > 0.01) {
          leitura.current.textContent = `${Math.round(E.alt)} km`;
          fita.current.style.transform = `translateY(${((E.alt % 20) * 4).toFixed(1)}px)`;
          altimetro.current.toggleAttribute("data-alerta", E.plasma > 0.6);
        }
      }

      const vis = linear ? 0 : E.rotulos;
      E.projecoes.forEach((p, i) => {
        const etiqueta = etiquetas.current[i];
        const linha = linhas.current[i];
        if (!etiqueta || !linha) return;
        const mostra = vis > 0.02 && p.visivel;
        etiqueta.style.opacity = mostra ? vis.toFixed(3) : "0";
        etiqueta.style.visibility = mostra ? "visible" : "hidden";
        linha.style.opacity = mostra ? (vis * 0.7).toFixed(3) : "0";
        if (!mostra) return;
        // A etiqueta fica acima e à direita do planeta; a linha sai da borda dele.
        const folga = 26 + p.r * 8;
        const ex = p.x + folga;
        const ey = p.y - folga;
        etiqueta.style.transform = `translate3d(${ex.toFixed(1)}px, ${(ey - 12).toFixed(1)}px, 0)`;
        linha.setAttribute("x1", (p.x + p.r * 4).toFixed(1));
        linha.setAttribute("y1", (p.y - p.r * 4).toFixed(1));
        linha.setAttribute("x2", ex.toFixed(1));
        linha.setAttribute("y2", ey.toFixed(1));
      });
    };
    gsap.ticker.add(tique);
    return () => gsap.ticker.remove(tique);
  }, []);

  return (
    <>
      <nav ref={trilha} aria-label="Trajetória da missão" className="trajetoria">
        <ol>
          {ATOS.map((ato) => (
            <li key={ato.nome} style={{ "--p": ato.cena / (CENAS.length - 1) } as React.CSSProperties}>
              <a href={`#${ato.id}`} data-ato-inicio={ato.cena}>
                <span>{ato.nome}</span>
              </a>
            </li>
          ))}
        </ol>
        <span ref={marcador} className="trajetoria__marcador" aria-hidden="true" />
      </nav>

      <div ref={altimetro} className="altimetro" aria-hidden="true">
        <span className="altimetro__rotulo">Altitude</span>
        <span ref={leitura} className="altimetro__leitura">140 km</span>
        <div className="altimetro__janela">
          <div ref={fita} className="altimetro__fita" />
        </div>
      </div>

      <div className="etiquetas" aria-hidden="true">
        <svg className="etiquetas__linhas">
          {pilares.map((pilar, i) => (
            <line key={pilar.id} ref={(el) => { linhas.current[i] = el; }} />
          ))}
        </svg>
        {pilares.map((pilar, i) => (
          <a
            key={pilar.id}
            ref={(el) => { etiquetas.current[i] = el; }}
            href={`#${CENAS[CENAS_DAS_FRENTES[i]]?.id ?? "solucoes"}`}
            className="etiqueta"
            data-acento={pilar.acento}
            tabIndex={-1}
          >
            {pilar.nome}
          </a>
        ))}
      </div>
    </>
  );
}
