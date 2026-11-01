"use client";

import { useRef, type ReactNode } from "react";

import { obterLenis } from "@/lib/motion";

/**
 * O dossiê: o conteúdo longo de uma cena (as entregas de uma frente, o caso
 * inteiro) fora do palco, num `<dialog>`. A cena fica com o essencial, e quem
 * quer ler tudo abre.
 *
 * `showModal()` já entrega o que um painel precisa: o resto da página fica
 * inerte, Esc fecha e o foco volta ao botão. A rolagem da página para (o Lenis
 * leria a roda sobre o dossiê e rolaria a missão por baixo dele), e o corpo
 * do dossiê rola sozinho com `data-lenis-prevent`.
 */
export function Dossie({
  rotulo,
  titulo,
  children,
}: {
  rotulo: string;
  titulo: string;
  children: ReactNode;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);

  const abrir = () => {
    obterLenis()?.stop();
    dialogo.current?.showModal();
  };
  const fechar = () => dialogo.current?.close();

  return (
    <>
      <button type="button" className="botao botao--linha" onClick={abrir}>
        {rotulo}
      </button>
      <dialog
        ref={dialogo}
        className="dossie"
        aria-label={titulo}
        onClose={() => obterLenis()?.start()}
        onClick={(e) => {
          // Clique no fundo escurecido (o próprio dialog, fora da caixa) fecha.
          if (e.target === dialogo.current) fechar();
        }}
      >
        <div className="dossie__caixa" data-lenis-prevent>
          <div className="dossie__topo">
            <p className="dossie__titulo">{titulo}</p>
            <button type="button" className="dossie__fechar" onClick={fechar}>
              Fechar
            </button>
          </div>
          <div className="dossie__corpo">{children}</div>
        </div>
      </dialog>
    </>
  );
}
