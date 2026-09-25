import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Cases } from "@/components/sections/cases";
import { Chamada } from "@/components/sections/chamada";
import { Contato } from "@/components/sections/contato";
import { Diagnostico } from "@/components/sections/diagnostico";
import { Hero } from "@/components/sections/hero";
import { Perguntas } from "@/components/sections/perguntas";
import { Personalidade } from "@/components/sections/personalidade";
import { Processo } from "@/components/sections/processo";
import { Sobre } from "@/components/sections/sobre";
import { Solucoes } from "@/components/sections/solucoes";
import { EmpresaJsonLd, PerguntasJsonLd } from "@/lib/seo/json-ld";

/**
 * A ordem das seções é o argumento comercial do site, e por isso mora aqui em
 * vez de se espalhar por componentes:
 *
 *   marca → prova → problema reconhecível → o que fazemos →
 *   por que temos cara própria → como funciona → chamada → quem somos →
 *   objeções → contato
 *
 * A prova vem logo depois da apresentação de propósito: antes de explicar
 * qualquer coisa, mostrar o que já foi construído.
 *
 * Cada bloco responde à pergunta que o anterior deixa em aberto.
 */
export default function Home() {
  return (
    <>
      <a href="#conteudo" className="pular-conteudo">
        Pular para o conteúdo
      </a>

      <Header />

      <main id="conteudo">
        <Hero />
        <Cases />
        <Diagnostico />
        <Solucoes />
        <Personalidade />
        <Processo />
        <Chamada />
        <Sobre />
        <Perguntas />
        <Contato />
      </main>

      <Footer />

      <EmpresaJsonLd />
      <PerguntasJsonLd />
    </>
  );
}
