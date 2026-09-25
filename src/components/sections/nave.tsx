"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Cores lidas da marca, não inventadas aqui. */
const COR = {
  nave: "#f2f3f5",
  nucleo: "#ff3b3b",
  tiro: "#ff6b6b",
  rocha: "#5c626d",
  rochaViva: "#767c88",
  poeira: "#3a3f4a",
} as const;

/** Referência de tamanho da área de jogo, para escalar velocidade. */
const BASE = { largura: 200, altura: 280 };

type Corpo = { x: number; y: number; vel: number; tamanho: number; giro: number };
type Tiro = { x: number; y: number };
type Faisca = { x: number; y: number; vx: number; vy: number; vida: number };
type Poeira = { x: number; y: number; vel: number; brilho: number };

function entre(valor: number, minimo: number, maximo: number) {
  return Math.max(minimo, Math.min(maximo, valor));
}

/**
 * Um joguinho de nave na margem que sobra do hero em telas largas.
 *
 * Ele ocupa a sobra inteira, não um quadradinho dentro dela: numa margem de
 * 300px de largura por 800 de altura, uma caixa de 200x280 no meio do vazio
 * lê como sujeira de layout, não como convite.
 *
 * O canvas é transparente de propósito. O fundo que aparece atrás das rochas
 * é o próprio céu do hero — as mesmas estrelas, a mesma luz vermelha à
 * deriva. O jogo não é um bloco pregado na página: acontece dentro dela.
 *
 * Nada é carregado antes do clique, e abaixo de 1680px o componente inteiro
 * some — no celular não há margem sobrando nem teclado.
 */
export function Nave() {
  const [jogando, setJogando] = useState(false);
  const [pontos, setPontos] = useState(0);
  const [recorde, setRecorde] = useState(0);
  const [perdeu, setPerdeu] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const iniciar = useCallback(() => {
    setPontos(0);
    setPerdeu(false);
    setJogando(true);
  }, []);

  useEffect(() => {
    if (!jogando) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    canvas.focus();

    /**
     * Estado do jogo em variáveis locais do efeito: um `useState` por quadro
     * re-renderizaria o React 60 vezes por segundo à toa. Só o placar sai
     * daqui para a interface, e só quando muda.
     */
    let largura = 0;
    let altura = 0;
    let ritmo = 1; // fator de velocidade derivado do tamanho da área
    let naveX = 0;
    let alvoX: number | null = null; // posição pedida pelo ponteiro
    let paraEsquerda = false;
    let paraDireita = false;
    let atirando = false;
    let tiros: Tiro[] = [];
    let rochas: Corpo[] = [];
    let faiscas: Faisca[] = [];
    let poeira: Poeira[] = [];
    let placar = 0;
    let quadro = 0;
    let ultimoTiro = -99;
    let proximaRocha = 0;
    let vivo = true;
    let animacao = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    /**
     * A área muda de tamanho quando a janela muda. Remedir e refazer o campo
     * de poeira é mais barato do que esticar o canvas: esticar borraria os
     * pixels e deixaria a nave fora do lugar onde o ponteiro a vê.
     */
    function medir() {
      const caixa = canvas!.getBoundingClientRect();
      const novaLargura = Math.max(120, Math.round(caixa.width));
      const novaAltura = Math.max(200, Math.round(caixa.height));
      if (novaLargura === largura && novaAltura === altura) return;

      const primeiraVez = largura === 0;
      largura = novaLargura;
      altura = novaAltura;
      ritmo = entre(altura / BASE.altura, 1, 3);

      canvas!.width = Math.round(largura * dpr);
      canvas!.height = Math.round(altura * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (primeiraVez) naveX = largura / 2;
      naveX = entre(naveX, 16, largura - 16);

      // Duas camadas de poeira em velocidades diferentes: o que dá noção de
      // profundidade não é a quantidade de pontos, é a diferença entre elas.
      const quantidade = Math.round((largura * altura) / 3400);
      poeira = Array.from({ length: quantidade }, (_, i) => ({
        x: (i * 97.31) % largura,
        y: (i * 53.77) % altura,
        vel: (0.18 + (i % 4) * 0.13) * ritmo,
        brilho: i % 5 === 0 ? 0.55 : 0.24,
      }));
    }

    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(canvas);

    function atirar() {
      if (quadro - ultimoTiro < 8 || tiros.length >= 6) return;
      ultimoTiro = quadro;
      tiros.push({ x: naveX, y: altura - 42 });
    }

    function tecla(evento: KeyboardEvent) {
      const t = evento.key;
      if (t === "ArrowLeft" || t === "a" || t === "A") paraEsquerda = true;
      else if (t === "ArrowRight" || t === "d" || t === "D") paraDireita = true;
      else if (t === " " || t === "Spacebar") atirar();
      else if (t === "Escape") {
        vivo = false;
        setJogando(false);
        return;
      } else return;

      // O teclado assume o controle: sem isto a nave voltaria para o último
      // ponto onde o ponteiro parou, brigando com quem escolheu as setas.
      alvoX = null;
      // Só engole as teclas que o jogo usa, e só com o canvas em foco: fora
      // daqui, seta e espaço continuam rolando a página normalmente.
      evento.preventDefault();
    }

    function soltou(evento: KeyboardEvent) {
      const t = evento.key;
      if (t === "ArrowLeft" || t === "a" || t === "A") paraEsquerda = false;
      if (t === "ArrowRight" || t === "d" || t === "D") paraDireita = false;
    }

    function moveu(evento: PointerEvent) {
      alvoX = evento.offsetX;
      paraEsquerda = false;
      paraDireita = false;
    }

    function pressionou(evento: PointerEvent) {
      alvoX = evento.offsetX;
      atirando = true;
      canvas!.focus();
      atirar();
    }

    function largou() {
      atirando = false;
    }

    function saiu() {
      atirando = false;
      alvoX = null;
    }

    canvas.addEventListener("keydown", tecla);
    canvas.addEventListener("keyup", soltou);
    canvas.addEventListener("pointermove", moveu);
    canvas.addEventListener("pointerdown", pressionou);
    canvas.addEventListener("pointerup", largou);
    canvas.addEventListener("pointerleave", saiu);

    function explodir(x: number, y: number, tamanho: number) {
      const quantas = 6 + Math.round(tamanho / 4);
      for (let i = 0; i < quantas; i += 1) {
        const angulo = (Math.PI * 2 * i) / quantas + Math.random() * 0.6;
        const forca = 0.9 + Math.random() * 2.1;
        faiscas.push({
          x,
          y,
          vx: Math.cos(angulo) * forca,
          vy: Math.sin(angulo) * forca,
          vida: 1,
        });
      }
    }

    function desenharNave() {
      const base = altura - 22;
      // Propulsão: pisca em ritmo irregular, senão vira lâmpada.
      const chama = 5 + Math.sin(quadro * 0.55) * 2 + Math.random() * 2.5;
      const gradiente = ctx!.createLinearGradient(naveX, base, naveX, base + chama);
      gradiente.addColorStop(0, COR.nucleo);
      gradiente.addColorStop(1, "rgba(255,59,59,0)");
      ctx!.fillStyle = gradiente;
      ctx!.fillRect(naveX - 2, base, 4, chama);

      ctx!.fillStyle = COR.nave;
      ctx!.beginPath();
      ctx!.moveTo(naveX, altura - 44);
      ctx!.lineTo(naveX - 11, base);
      ctx!.lineTo(naveX - 3.5, base - 4);
      ctx!.lineTo(naveX + 3.5, base - 4);
      ctx!.lineTo(naveX + 11, base);
      ctx!.closePath();
      ctx!.fill();

      // O núcleo da marca, de novo: o ponto vermelho no meio da forma.
      ctx!.fillStyle = COR.nucleo;
      ctx!.fillRect(naveX - 1.5, altura - 36, 3, 3);
    }

    /** Rocha desenhada como losango — a mesma forma dos nós da página. */
    function desenharRocha(r: Corpo) {
      const raio = r.tamanho / 2;
      ctx!.save();
      ctx!.translate(r.x, r.y);
      ctx!.rotate(r.giro);
      ctx!.fillStyle = r.tamanho > 20 ? COR.rocha : COR.rochaViva;
      ctx!.fillRect(-raio, -raio, r.tamanho, r.tamanho);
      ctx!.restore();
    }

    function laco() {
      if (!vivo) return;
      quadro += 1;

      // Transparente: o céu do hero é o fundo do jogo.
      ctx!.clearRect(0, 0, largura, altura);

      for (const p of poeira) {
        p.y += p.vel;
        if (p.y > altura) {
          p.y = -1;
          p.x = Math.random() * largura;
        }
        ctx!.globalAlpha = p.brilho;
        ctx!.fillStyle = COR.poeira;
        ctx!.fillRect(p.x, p.y, 1, 1);
      }
      ctx!.globalAlpha = 1;

      // Movimento da nave: ponteiro quando existe, senão teclado.
      if (alvoX !== null) {
        naveX += (alvoX - naveX) * 0.22;
      } else {
        const velocidade = 3.4 * entre(largura / BASE.largura, 1, 2.4);
        if (paraEsquerda) naveX -= velocidade;
        if (paraDireita) naveX += velocidade;
      }
      naveX = entre(naveX, 16, largura - 16);

      if (atirando) atirar();

      if (quadro > proximaRocha) {
        const tamanho = 9 + Math.random() * 19;
        rochas.push({
          x: tamanho + Math.random() * (largura - tamanho * 2),
          y: -tamanho,
          vel: (0.9 + Math.random() * 1.1 + placar * 0.02) * ritmo,
          tamanho,
          giro: Math.random() * Math.PI,
        });
        // Campo mais largo pede mais rochas para manter a mesma densidade.
        const densidade = 12000 / largura;
        proximaRocha = quadro + Math.max(9, densidade - placar * 1.2);
      }

      const velTiro = 5.4 * ritmo;
      tiros = tiros.filter((t) => {
        t.y -= velTiro;
        ctx!.fillStyle = COR.tiro;
        ctx!.fillRect(t.x - 1, t.y, 2, 9);
        return t.y > -10;
      });

      for (const r of rochas) {
        r.y += r.vel;
        r.giro += 0.006 * ritmo;
        desenharRocha(r);
      }

      /**
       * Tiro acerta rocha.
       *
       * A folga vertical inclui metade do passo do tiro, e não só o raio da
       * rocha. Numa área alta o tiro anda uns 15px por quadro enquanto a
       * rocha menor tem 9px de altura: comparando só as posições, o tiro
       * pula por cima dela entre um quadro e outro e o acerto some. Foi
       * exatamente o que apareceu ao rodar 900 quadros sem marcar ponto.
       */
      for (const r of [...rochas]) {
        for (const t of [...tiros]) {
          const folgaX = r.tamanho / 2 + 1;
          const folgaY = r.tamanho / 2 + velTiro / 2;
          if (Math.abs(t.x - r.x) < folgaX && Math.abs(t.y - r.y) < folgaY) {
            rochas = rochas.filter((o) => o !== r);
            tiros = tiros.filter((o) => o !== t);
            explodir(r.x, r.y, r.tamanho);
            placar += 1;
            setPontos(placar);
            break;
          }
        }
      }

      faiscas = faiscas.filter((f) => {
        f.x += f.vx;
        f.y += f.vy;
        f.vy += 0.05;
        f.vida -= 0.035;
        if (f.vida <= 0) return false;
        ctx!.globalAlpha = f.vida;
        ctx!.fillStyle = f.vida > 0.6 ? COR.tiro : COR.rochaViva;
        ctx!.fillRect(f.x - 1, f.y - 1, 2, 2);
        return true;
      });
      ctx!.globalAlpha = 1;

      // Rocha acerta a nave, ou escapa pelo rodapé.
      for (const r of rochas) {
        const perto =
          Math.abs(r.x - naveX) < r.tamanho / 2 + 8 &&
          Math.abs(r.y - (altura - 32)) < r.tamanho / 2 + 10;
        if (perto) {
          vivo = false;
          setPerdeu(true);
          setRecorde((anterior) => Math.max(anterior, placar));
          setJogando(false);
          return;
        }
      }
      rochas = rochas.filter((r) => r.y < altura + r.tamanho);

      desenharNave();
      animacao = requestAnimationFrame(laco);
    }

    animacao = requestAnimationFrame(laco);

    return () => {
      vivo = false;
      cancelAnimationFrame(animacao);
      observador.disconnect();
      canvas.removeEventListener("keydown", tecla);
      canvas.removeEventListener("keyup", soltou);
      canvas.removeEventListener("pointermove", moveu);
      canvas.removeEventListener("pointerdown", pressionou);
      canvas.removeEventListener("pointerup", largou);
      canvas.removeEventListener("pointerleave", saiu);
    };
  }, [jogando]);

  return (
    <div className="relative h-full w-full">
      {/*
        Cantos em vez de moldura. Quatro marcas de esquadro delimitam a área
        sem desenhar uma caixa: a margem continua sendo margem, e mesmo assim
        fica claro até onde o jogo vai.
      */}
      <Cantos />

      {/* Recuado dos cantos de propósito: em cima do esquadro, a legenda
          encostaria no traço e as duas coisas viravam borrão. */}
      <div className="absolute inset-x-6 top-0 flex items-center justify-between pb-2">
        <span className="estado text-texto-fraco">
          {jogando ? "Em órbita" : "Intervalo"}
        </span>
        {jogando || perdeu ? (
          <span className="estado text-determinacao-viva tabular">{pontos} pts</span>
        ) : recorde > 0 ? (
          <span className="estado text-texto-fraco tabular">recorde {recorde}</span>
        ) : null}
      </div>

      {jogando ? (
        <canvas
          ref={canvasRef}
          tabIndex={0}
          aria-label="Joguinho de nave. Setas ou mouse para mover, espaço ou clique para atirar, Esc para sair."
          className="focus-visible:outline-determinacao absolute inset-0 h-full w-full touch-none focus-visible:outline-2 focus-visible:-outline-offset-2"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-2 text-center">
          {perdeu ? (
            <>
              <p className="font-display text-texto text-[1.05rem] font-bold text-balance">
                Acabou em {pontos} {pontos === 1 ? "ponto" : "pontos"}
              </p>
              <p className="text-texto-fraco max-w-[24ch] text-[0.82rem] leading-relaxed">
                Nada que uma próxima tentativa não resolva.
              </p>
            </>
          ) : (
            <p className="text-texto-fraco max-w-[26ch] text-[0.82rem] leading-relaxed">
              Sobrou espaço nesta margem. Achamos melhor colocar algo aqui do que
              deixar vazio.
            </p>
          )}

          <button
            type="button"
            onClick={iniciar}
            className="btn btn--contorno mt-1 h-9 px-4 text-[0.82rem]"
          >
            {perdeu ? "Jogar de novo" : "Clique para jogar"}
          </button>

          <p className="estado text-texto-fraco/70">mouse ou setas · espaço</p>
        </div>
      )}
    </div>
  );
}

/** As quatro marcas de esquadro que delimitam a área de jogo. */
function Cantos() {
  const posicoes = [
    "top-0 left-0 border-t border-l",
    "top-0 right-0 border-t border-r",
    "bottom-0 left-0 border-b border-l",
    "bottom-0 right-0 border-b border-r",
  ];

  return (
    <>
      {posicoes.map((posicao) => (
        <span
          key={posicao}
          aria-hidden="true"
          className={`border-borda-viva pointer-events-none absolute h-4 w-4 ${posicao}`}
        />
      ))}
    </>
  );
}
