"use client";

import { useEffect, useRef, useState } from "react";

import { Simbolo } from "@/components/brand/wordmark";
import { ButtonLink } from "@/components/ui/button";
import { navLinks } from "@/config/nav";
import { obterLenis } from "@/lib/motion";
import { cn } from "@/lib/utils/cn";
import { whatsappUrl } from "@/lib/utils/whatsapp";

const mensagemTopo =
  "Olá! Vim pelo site da DETERA e quero conversar sobre um projeto para a minha empresa.";

export function Header() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [solido, setSolido] = useState(false);
  const botaoMenu = useRef<HTMLButtonElement>(null);

  /**
   * Transparente sobre o hero, vidro fosco depois dele.
   *
   * Quem avisa é o marco `data-fim-do-hero`, no fim do invólucro do hero
   * (depois do espaço que o trecho fixado acrescenta): o cabeçalho fica
   * sólido assim que esse fim entra na tela — ou seja, quando o hero
   * começa a subir e o conteúdo de baixo passa a correr por trás do menu.
   * Por observador, e não por ScrollTrigger: o cabeçalho vem antes do hero
   * na página, e um gatilho criado antes do trecho fixado mediria a posição
   * sem o espaço que o pin ainda nem tinha acrescentado.
   */
  useEffect(() => {
    const marco = document.querySelector("[data-fim-do-hero]");
    if (!marco) return;

    const observador = new IntersectionObserver(
      ([entrada]) => setSolido(entrada.isIntersecting),
      // A área observada vai da borda de baixo da janela até muito acima
      // dela: o marco conta como "dentro" assim que o fim do hero entra por
      // baixo, e continua dentro depois de passar do topo. Com a janela
      // normal, um salto de âncora que atravessasse o marco entre dois
      // quadros (de fora por baixo para fora por cima) não gerava aviso
      // nenhum, e o cabeçalho ficava transparente sobre o conteúdo.
      // Os 2px de baixo tiram o empate de o marco encostar na borda no
      // carregamento, quando o hero ainda não foi fixado.
      { rootMargin: "100000px 0px -2px 0px" },
    );
    observador.observe(marco);
    return () => observador.disconnect();
  }, []);

  /**
   * Menu aberto: o resto da página para de rolar e sai do alcance do
   * teclado e do leitor de tela (`inert`), e Esc fecha devolvendo o foco
   * ao botão.
   *
   * Duas travas de rolagem porque são dois mecanismos: `overflow: hidden`
   * no corpo segura a rolagem nativa (sem isso o fundo rola por baixo do
   * painel no iOS), e o Lenis tem a própria, que ignora o `overflow`.
   */
  useEffect(() => {
    if (!menuAberto) return;

    const lenis = obterLenis();
    lenis?.stop();
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const foraDoMenu = ["main", "footer", ".pular-conteudo"]
      .map((seletor) => document.querySelector<HTMLElement>(seletor))
      .filter((el): el is HTMLElement => el !== null);
    foraDoMenu.forEach((el) => {
      el.inert = true;
    });

    const fecharComEsc = (evento: KeyboardEvent) => {
      if (evento.key !== "Escape") return;
      setMenuAberto(false);
      botaoMenu.current?.focus();
    };
    window.addEventListener("keydown", fecharComEsc);

    return () => {
      document.body.style.overflow = anterior;
      foraDoMenu.forEach((el) => {
        el.inert = false;
      });
      lenis?.start();
      window.removeEventListener("keydown", fecharComEsc);
    };
  }, [menuAberto]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-500",
        solido || menuAberto
          ? "border-borda bg-vazio/70 backdrop-blur-md backdrop-saturate-150"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-[4.5rem] w-full max-w-[76rem] items-center justify-between gap-6 px-6 md:px-10">
        {/* Só o símbolo no cabeçalho: o nome aparece inteiro logo abaixo, no
            hero, e em tamanho que nenhuma marca de menu alcança. A marca não
            fica parada — e no hover ela acelera. */}
        <a
          href="#topo"
          className="group text-texto shrink-0"
          aria-label="DETERA, ir para o início do site"
        >
          <Simbolo className="h-10 w-8" />
        </a>

        <nav aria-label="Navegação principal" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-texto-suave hover:text-texto decoration-determinacao text-[0.92rem] underline-offset-[7px] transition-colors hover:underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          {/* No celular o rótulo encurta para caber ao lado do menu: sem isso o
              único CTA fixo sumia justamente onde a maior parte da visita
              acontece. */}
          <ButtonLink href={whatsappUrl(mensagemTopo)} size="sm">
            <span className="lg:hidden">Começar</span>
            <span className="hidden lg:inline">Começar um projeto</span>
          </ButtonLink>

          <button
            ref={botaoMenu}
            type="button"
            onClick={() => setMenuAberto((aberto) => !aberto)}
            aria-expanded={menuAberto}
            aria-controls="menu-mobile"
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
            className="border-contorno text-texto hover:border-determinacao flex h-11 w-11 items-center justify-center rounded-[2px] border transition-colors lg:hidden"
          >
            <span className="sr-only">Menu</span>
            <span aria-hidden="true" className="flex w-4 flex-col gap-[5px]">
              <span
                className={cn(
                  "h-px bg-current transition-transform duration-200",
                  menuAberto && "translate-y-[6px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "h-px bg-current transition-opacity duration-200",
                  menuAberto && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "h-px bg-current transition-transform duration-200",
                  menuAberto && "-translate-y-[6px] -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </div>

      {/* `hidden` em vez de desmontar: os links continuam no HTML entregue,
          então o rastreador enxerga a navegação sem executar o menu. */}
      <div
        id="menu-mobile"
        hidden={!menuAberto}
        className="border-borda bg-vazio border-t lg:hidden"
      >
        <nav aria-label="Navegação principal, versão compacta">
          <ul className="flex flex-col px-6 py-2">
            {navLinks.map((link) => (
              <li key={link.href} className="border-borda border-b last:border-b-0">
                <a
                  href={link.href}
                  onClick={() => setMenuAberto(false)}
                  className="text-texto font-display block py-4 text-[1.15rem] font-bold"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="px-6 pt-2 pb-6">
          <ButtonLink
            href={whatsappUrl(mensagemTopo)}
            className="w-full"
            onClick={() => setMenuAberto(false)}
          >
            Começar um projeto
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
