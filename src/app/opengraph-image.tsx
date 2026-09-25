import { ImageResponse } from "next/og";

import {
  MARCA_LINHA,
  MARCA_METADE,
  MARCA_NUCLEO,
  MARCA_TRACOS,
  NOME_DETERA,
} from "@/components/brand/marca-paths";
import { site } from "@/config/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name} — ${site.slogan}`;

const frentes = ["Presença digital", "Crescimento", "Tecnologia", "Infraestrutura"];

/**
 * O compartilhamento repete a primeira dobra: marca, slogan e as quatro
 * frentes ligadas por uma linha que continua depois da última.
 *
 * Sem fonte customizada de propósito — carregar o arquivo da Orbitron em
 * tempo de build acrescenta uma requisição de rede que pode derrubar o
 * deploy inteiro por um motivo cosmético.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#07080b",
          color: "#f2f3f5",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 78px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <svg width="36" height="45" viewBox="0 0 32 40" fill="none">
            <g fill="#f2f3f5">
              <path d={MARCA_METADE} />
              <g transform="translate(32 0) scale(-1 1)">
                <path d={MARCA_METADE} />
              </g>
            </g>
            {MARCA_TRACOS.map((traco) => (
              <rect
                key={traco.y}
                x={MARCA_LINHA.x}
                y={traco.y}
                width={MARCA_LINHA.largura}
                height={traco.altura}
                fill="#ff3b3b"
              />
            ))}
            <rect
              x={MARCA_LINHA.x}
              y="6.6"
              width={MARCA_LINHA.largura}
              height="26.6"
              fill="#ff3b3b"
            />
            <path d={MARCA_NUCLEO} fill="#ff3b3b" />
          </svg>

          {/* O nome desenhado, os mesmos caminhos de `NOME_DETERA` que o
              site usa — não a fonte da imagem, que aqui nem carrega. Sem
              tarja vermelha: o "A" ficou só com o topo reto, do jeito que
              o site desenha agora (o símbolo pequeno que foi para debaixo
              do "A" no site fica de fora aqui — o símbolo cheio já abre a
              imagem, logo acima). */}
          <svg width="548" height="98" viewBox="0 0 716 128" style={{ marginTop: 34 }}>
            <g fill="#f2f3f5" fillRule="evenodd">
              {NOME_DETERA.map((letra) => (
                <path key={letra.d} d={letra.d} />
              ))}
            </g>
          </svg>

          <div
            style={{
              marginTop: 14,
              fontSize: 44,
              color: "#9ba1ac",
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            {site.slogan}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          {frentes.map((frente, indice) => (
            <div
              key={frente}
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 23,
                color: "#9ba1ac",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  background: indice === 3 ? "#4c7dff" : "#ff3b3b",
                  transform: "rotate(45deg)",
                  marginRight: 12,
                }}
              />
              {frente}
              <div
                style={{
                  width: indice === 3 ? 70 : 46,
                  height: 1,
                  background: "#23262e",
                  marginLeft: 16,
                  marginRight: indice === 3 ? 0 : 16,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
