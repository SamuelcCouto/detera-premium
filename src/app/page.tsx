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
 *   marca → por que temos cara própria → prova → problema reconhecível →
 *   o que fazemos → como funciona → chamada → quem somos → objeções →
 *   contato
 *
 * O manifesto vem colado no hero (em teste): o slogan acabou de ser dito, e
 * a seção seguinte explica a frase antes de mostrar os projetos. Na ordem
 * anterior ele ficava depois de Soluções, fundo demais para quem só passa
 * os olhos. Se não agradar, a alternativa é logo depois de Cases, mantendo a
 * prova antes de qualquer explicação.
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
        <Personalidade />
        <Cases />
        <Diagnostico />
        <Solucoes />
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
