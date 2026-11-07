"use client";

import { useEffect, useRef } from "react";

import { E } from "@/lib/missao/estado";
import { gsap } from "@/lib/motion";

/** O nome de cada planeta, na ordem de `PLANETAS` em `mundo.ts`, e a cena dele. */
const ROTULOS = [
  { nome: "Sencis", cena: "projeto-sencis" },
  { nome: "FIDÈLE", cena: "projeto-fidele" },
  { nome: "Yasmin Studio", cena: "projeto-yasmin" },
  { nome: "Keep New", cena: "projeto-keepnew" },
  { nome: "O seu projeto", cena: "seu-projeto" },
];

/**
 * Os instrumentos da cabine. Leem o estado da missão a cada quadro e escrevem
 * direto no DOM (posição, texto, opacidade), sem passar pelo React.
 *
 * - Etiquetas: o nome de cada projeto preso ao planeta por uma linha, com a
 *   posição projetada da cena 3D. São também atalhos para cada planeta.
 * - Altímetro: aparece na reentrada e despenca junto com a câmera.
 */
export function Instrumentos() {
  const altimetro = useRef<HTMLDivElement>(null);
  const leitura = useRef<HTMLSpanElement>(null);
  const etiquetas = useRef<(HTMLAnchorElement | null)[]>([]);
  const linhas = useRef<(SVGLineElement | null)[]>([]);

  useEffect(() => {
    const html = document.documentElement;
    const tique = () => {
      const linear = html.classList.contains("linear");

      if (altimetro.current && leitura.current) {
        const vis = linear ? 0 : E.altVisivel;
        altimetro.current.style.opacity = vis.toFixed(3);
        altimetro.current.style.visibility = vis < 0.01 ? "hidden" : "visible";
        if (vis > 0.01) leitura.current.textContent = `${Math.round(E.alt)} km`;
      }

      // As etiquetas só entram com o sistema já perto; antes, ele é um ponto.
      const perto = 1 - Math.min(1, Math.max(0, (E.galaxia - 0.03) / 0.12));
      const vis = linear ? 0 : E.rotulos * perto;
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
        const folga = 22 + p.r * 7;
        const ex = p.x + folga;
        const ey = p.y - folga;
        etiqueta.style.transform = `translate3d(${ex.toFixed(1)}px, ${(ey - 12).toFixed(1)}px, 0)`;
        linha.setAttribute("x1", (p.x + p.r * 3).toFixed(1));
        linha.setAttribute("y1", (p.y - p.r * 3).toFixed(1));
        linha.setAttribute("x2", ex.toFixed(1));
        linha.setAttribute("y2", ey.toFixed(1));
      });
    };
    gsap.ticker.add(tique);
    return () => gsap.ticker.remove(tique);
  }, []);

  return (
    <>
      <div ref={altimetro} className="altimetro" aria-hidden="true">
        <span className="altimetro__rotulo">Altitude</span>
        <span ref={leitura} className="altimetro__leitura">
          120 km
        </span>
      </div>

      <div className="etiquetas" aria-hidden="true">
        <svg className="etiquetas__linhas">
          {ROTULOS.map((rotulo, i) => (
            <line
              key={rotulo.cena}
              ref={(el) => {
                linhas.current[i] = el;
              }}
            />
          ))}
        </svg>
        {ROTULOS.map((rotulo, i) => (
          <a
            key={rotulo.cena}
            ref={(el) => {
              etiquetas.current[i] = el;
            }}
            href={`#${rotulo.cena}`}
            className="etiqueta"
            tabIndex={-1}
          >
            {rotulo.nome}
          </a>
        ))}
      </div>
    </>
  );
}
