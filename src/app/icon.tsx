import { ImageResponse } from "next/og";

import {
  MARCA_LINHA,
  MARCA_METADE,
  MARCA_NUCLEO,
} from "@/components/brand/marca-paths";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * A mesma marca do site, sem os traços que continuam fora do coração: em
 * 32px eles viram sujeira de um pixel. Fica a silhueta das duas placas, a
 * linha central e o núcleo — o que ainda se lê nesse tamanho.
 *
 * A geometria vem de `marca-paths`, não copiada aqui: favicon divergindo do
 * símbolo do site é o tipo de erro que ninguém percebe até estar publicado.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#07080b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="23" height="29" viewBox="0 0 32 40" fill="none">
          <g fill="#f2f3f5">
            <path d={MARCA_METADE} />
            <g transform="translate(32 0) scale(-1 1)">
              <path d={MARCA_METADE} />
            </g>
          </g>
          <rect
            x={MARCA_LINHA.x}
            y="6.6"
            width={MARCA_LINHA.largura}
            height="26.6"
            fill="#ff3b3b"
          />
          <path d={MARCA_NUCLEO} fill="#ff3b3b" />
        </svg>
      </div>
    ),
    size,
  );
}
