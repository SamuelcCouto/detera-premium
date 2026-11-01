"use client";

import { useRef } from "react";

import { Simbolo } from "@/components/brand/wordmark";
import { navLinks } from "@/config/nav";
import { site } from "@/config/site";
import { obterLenis } from "@/lib/motion";
import { whatsappUrl } from "@/lib/utils/whatsapp";

/**
 * Cabeçalho fixo e leve: o símbolo, os cinco destinos e o botão de conversa.
 * No celular os destinos vão para um `<dialog>` em tela cheia, que já traz o
 * que um menu precisa (o resto da página inerte, Esc, o foco de volta).
 */
export function Header() {
  const menu = useRef<HTMLDialogElement>(null);

  const abrir = () => {
    obterLenis()?.stop();
    menu.current?.showModal();
  };
  const fechar = () => menu.current?.close();

  return (
    <header className="cabecalho">
      <a href="#topo" className="cabecalho__marca" aria-label={`${site.name}, voltar ao início`}>
        <Simbolo className="h-7 w-auto text-[var(--color-luz)]" />
        <span aria-hidden="true">{site.name}</span>
      </a>

      <nav aria-label="Principal" className="cabecalho__nav">
        <ul>
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </nav>

      <a
        className="botao botao--acao botao--compacto cabecalho__cta"
        href={whatsappUrl("Olá! Vim pelo site da DETERA e quero começar um projeto.")}
        target="_blank"
        rel="noopener noreferrer"
      >
        Começar um projeto
      </a>

      <button type="button" className="cabecalho__abrir" onClick={abrir} aria-haspopup="dialog">
        Menu
      </button>

      <dialog
        ref={menu}
        className="menu"
        aria-label="Menu"
        onClose={() => obterLenis()?.start()}
      >
        <button type="button" className="menu__fechar" onClick={fechar}>
          Fechar
        </button>
        <ul>
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={fechar}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          className="botao botao--acao"
          href={whatsappUrl("Olá! Vim pelo site da DETERA e quero começar um projeto.")}
          target="_blank"
          rel="noopener noreferrer"
        >
          Começar um projeto
        </a>
      </dialog>
    </header>
  );
}
