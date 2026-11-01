import * as THREE from "three";

import { CENAS, type Cena, type Foco } from "@/lib/missao/cenas";
import { E } from "@/lib/missao/estado";
import {
  comOitavas,
  FRAG_CEU,
  FRAG_ESTRELAS,
  FRAG_HALO,
  FRAG_NUCLEO,
  FRAG_PLANETA,
  FRAG_TELA,
  VERT_CEU,
  VERT_ESFERA,
  VERT_ESTRELAS,
  VERT_HALO,
  VERT_TELA,
} from "@/lib/missao/shaders";
import { criarGerador } from "@/lib/utils/aleatorio";

/**
 * O sistema DETERA em Three.js: o núcleo vermelho na origem e as quatro
 * frentes em órbita, o cinturão entre a segunda e a terceira, a trajetória do
 * processo em volta do planeta azul e a camada de atmosfera por cima.
 *
 * A câmera não tem animação própria. A cada quadro ela é calculada a partir
 * das duas cenas vizinhas do roteiro (`E.a`, `E.b`, `E.t`): cada uma diz para
 * onde olhar e de onde, e a mistura entre as duas é a viagem. Como os planetas
 * se movem, a pose de cada cena é recalculada ao vivo e a câmera acompanha.
 */

type Planeta = {
  grupo: THREE.Group;
  corpo: THREE.Mesh;
  raio: number;
  orbita: number;
  inclinacao: number;
  fase: number;
  omega: number;
  material: THREE.ShaderMaterial;
};

const PLANETAS = [
  // Presença digital: dunas cor de ferrugem.
  { raio: 1.5, orbita: 16, fase: 0.7, inclinacao: 0.05, tipo: 0, a: "#4f231c", b: "#b5563a", c: "#e9a774", atm: "#ff7a55" },
  // Crescimento: gigante de gás âmbar, com anel.
  { raio: 2.7, orbita: 25, fase: 2.5, inclinacao: -0.04, tipo: 1, a: "#5e3a22", b: "#c98f52", c: "#f2d6a2", atm: "#ffcf8a" },
  // Tecnologia: gelo, com luzes de cidade no lado escuro.
  { raio: 1.8, orbita: 35, fase: 4.2, inclinacao: 0.07, tipo: 2, a: "#34455c", b: "#b3c6da", c: "#ffffff", atm: "#bfd6ff" },
  // Infraestrutura: o planeta azul, onde a missão pousa.
  { raio: 2.3, orbita: 45, fase: 5.6, inclinacao: -0.03, tipo: 3, a: "#08183f", b: "#1d4fae", c: "#2c5a46", atm: "#4c7dff" },
] as const;

const CINTURAO = { raio: 30, largura: 2.6, angulo: 0.62 };

const cor = (hex: string) => new THREE.Color(hex);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rad = THREE.MathUtils.degToRad;

export class Mundo {
  private renderer: THREE.WebGLRenderer;
  private cena = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(42, 1, 0.05, 4000);
  private tela = new THREE.Scene();
  private telaCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private telaMat: THREE.ShaderMaterial;
  private nucleoMat: THREE.ShaderMaterial;
  private estrelasMat: THREE.ShaderMaterial;
  private planetas: Planeta[] = [];
  private cinturao: THREE.InstancedMesh;
  private trajeto: THREE.Group;
  private trajetoFeito: THREE.Line;
  private trajetoPontos: THREE.Vector3[] = [];
  private capsula: THREE.Mesh;
  private queimas: THREE.Mesh[] = [];
  private largura = 1;
  private altura = 1;
  private dpr = 1;
  private dprMax = 1.5;
  private v = new THREE.Vector3();

  readonly leve: boolean;

  constructor(canvas: HTMLCanvasElement, leve: boolean) {
    this.leve = leve;
    const oitavas = leve ? 3 : 5;
    const aleatorio = criarGerador(20261101);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !leve,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.autoClear = false;
    this.renderer.setClearColor(0x050913, 1);

    // Céu de fundo.
    const ceu = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 16),
      new THREE.ShaderMaterial({
        vertexShader: VERT_CEU,
        fragmentShader: comOitavas(FRAG_CEU, leve ? 3 : 4),
        side: THREE.BackSide,
        depthWrite: false,
      }),
    );
    ceu.scale.setScalar(2000);
    ceu.renderOrder = -1;
    ceu.frustumCulled = false;
    this.cena.add(ceu);

    // Estrelas: uma casca distante e uma camada de poeira perto, que dá paralaxe na viagem.
    const total = leve ? 1400 : 3200;
    const pos = new Float32Array(total * 3);
    const tam = new Float32Array(total);
    const fase = new Float32Array(total);
    const cores = new Float32Array(total * 3);
    const tons = [cor("#eef0f6"), cor("#bcd0ff"), cor("#ffd9b8"), cor("#ffb3a3")];
    for (let i = 0; i < total; i++) {
      const perto = i < total * 0.25;
      const r = perto ? 60 + aleatorio() * 180 : 500 + aleatorio() * 600;
      const u = aleatorio() * 2 - 1;
      const th = aleatorio() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      pos.set([r * s * Math.cos(th), r * u, r * s * Math.sin(th)], i * 3);
      tam[i] = perto ? 0.35 + aleatorio() * 0.5 : 1 + aleatorio() * aleatorio() * 3.2;
      fase[i] = aleatorio();
      const tom = tons[Math.floor(aleatorio() * aleatorio() * tons.length)];
      cores.set([tom.r, tom.g, tom.b], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aTam", new THREE.BufferAttribute(tam, 1));
    geo.setAttribute("aFase", new THREE.BufferAttribute(fase, 1));
    geo.setAttribute("aCor", new THREE.BufferAttribute(cores, 3));
    this.estrelasMat = new THREE.ShaderMaterial({
      vertexShader: VERT_ESTRELAS,
      fragmentShader: FRAG_ESTRELAS,
      uniforms: { uTempo: { value: 0 }, uDpr: { value: 1 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const estrelas = new THREE.Points(geo, this.estrelasMat);
    estrelas.frustumCulled = false;
    this.cena.add(estrelas);

    // O núcleo e o brilho dele.
    this.nucleoMat = new THREE.ShaderMaterial({
      vertexShader: VERT_ESFERA,
      fragmentShader: comOitavas(FRAG_NUCLEO, oitavas),
      uniforms: { uTempo: { value: 0 } },
    });
    this.cena.add(new THREE.Mesh(new THREE.SphereGeometry(5, 64, 32), this.nucleoMat));
    const brilho = this.texturaBrilho();
    for (const [escala, opacidade] of [
      [24, 0.75],
      [80, 0.22],
    ] as const) {
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: brilho,
          color: 0xff5a40,
          transparent: true,
          opacity: opacidade,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      sprite.scale.setScalar(escala);
      this.cena.add(sprite);
    }

    // Luz do núcleo para as rochas do cinturão (os planetas fazem a própria luz no shader).
    this.cena.add(new THREE.PointLight(0xffc9b5, 3.2, 0, 0));
    this.cena.add(new THREE.AmbientLight(0x1b2440, 0.6));

    // Planetas, órbitas e halos.
    for (const def of PLANETAS) {
      const grupo = new THREE.Group();
      const material = new THREE.ShaderMaterial({
        vertexShader: VERT_ESFERA,
        fragmentShader: comOitavas(FRAG_PLANETA, oitavas),
        uniforms: {
          uCorA: { value: cor(def.a) },
          uCorB: { value: cor(def.b) },
          uCorC: { value: cor(def.c) },
          uAtm: { value: cor(def.atm) },
          uTipo: { value: def.tipo },
          uTempo: { value: 0 },
          uSemente: { value: def.tipo * 3.7 },
        },
      });
      const corpo = new THREE.Mesh(new THREE.SphereGeometry(def.raio, 64, 32), material);
      corpo.rotation.z = 0.25;
      grupo.add(corpo);

      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(def.raio * 1.16, 48, 24),
        new THREE.ShaderMaterial({
          vertexShader: VERT_HALO,
          fragmentShader: FRAG_HALO,
          uniforms: { uAtm: { value: cor(def.atm) }, uForca: { value: def.tipo === 3 ? 1.5 : 1 } },
          side: THREE.BackSide,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      grupo.add(halo);

      if (def.tipo === 1) grupo.add(this.anel(def.raio));

      this.cena.add(grupo);
      this.cena.add(this.linhaDeOrbita(def.orbita, def.inclinacao));
      this.planetas.push({
        grupo,
        corpo,
        raio: def.raio,
        orbita: def.orbita,
        inclinacao: def.inclinacao,
        fase: def.fase,
        // Terceira lei de Kepler, bem devagar: a câmera precisa conseguir acompanhar.
        omega: 0.022 * Math.pow(16 / def.orbita, 1.5),
        material,
      });
    }

    // Cinturão de asteroides.
    const pedras = leve ? 260 : 700;
    this.cinturao = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.MeshStandardMaterial({ color: 0x8a7f78, roughness: 1, flatShading: true }),
      pedras,
    );
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    for (let i = 0; i < pedras; i++) {
      const ang = aleatorio() * Math.PI * 2;
      const r = CINTURAO.raio + (aleatorio() - 0.5) * CINTURAO.largura * 2;
      const tamanho = 0.04 + Math.pow(aleatorio(), 3) * 0.42;
      e.set(aleatorio() * 6, aleatorio() * 6, aleatorio() * 6);
      q.setFromEuler(e);
      m.compose(
        new THREE.Vector3(Math.cos(ang) * r, (aleatorio() - 0.5) * 1.4, Math.sin(ang) * r),
        q,
        new THREE.Vector3(tamanho, tamanho * (0.6 + aleatorio() * 0.5), tamanho),
      );
      this.cinturao.setMatrixAt(i, m);
    }
    this.cena.add(this.cinturao);

    // A trajetória do processo em volta do planeta azul: elipse inclinada,
    // cinco queimas de motor e a cápsula.
    this.trajeto = new THREE.Group();
    this.trajeto.rotation.set(0.42, 0, 0.18);
    for (let i = 0; i <= 240; i++) {
      const a = (i / 240) * Math.PI * 2;
      this.trajetoPontos.push(new THREE.Vector3(Math.cos(a) * 6.2, 0, Math.sin(a) * 4.6));
    }
    const geoTrajeto = new THREE.BufferGeometry().setFromPoints(this.trajetoPontos);
    this.trajeto.add(
      new THREE.Line(
        geoTrajeto,
        new THREE.LineBasicMaterial({ color: 0x8fb3ff, transparent: true, opacity: 0.25 }),
      ),
    );
    this.trajetoFeito = new THREE.Line(
      geoTrajeto.clone(),
      new THREE.LineBasicMaterial({ color: 0xff3b3b, transparent: true, opacity: 0.95 }),
    );
    this.trajeto.add(this.trajetoFeito);
    for (let i = 0; i < 5; i++) {
      const queima = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 12, 8),
        new THREE.MeshBasicMaterial({ color: 0x8fb3ff, transparent: true }),
      );
      queima.position.copy(this.pontoDoTrajeto(i / 5));
      this.queimas.push(queima);
      this.trajeto.add(queima);
    }
    this.capsula = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 16, 8),
      new THREE.MeshBasicMaterial({ color: 0xffe2c8 }),
    );
    const brilhoCapsula = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: brilho,
        color: 0xff8a3d,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    brilhoCapsula.scale.setScalar(1.6);
    this.capsula.add(brilhoCapsula);
    this.trajeto.add(this.capsula);
    this.planetas[3].grupo.add(this.trajeto);

    // A camada de atmosfera.
    this.telaMat = new THREE.ShaderMaterial({
      vertexShader: VERT_TELA,
      fragmentShader: comOitavas(FRAG_TELA, oitavas),
      uniforms: {
        uRes: { value: new THREE.Vector2(1, 1) },
        uTempo: { value: 0 },
        uAtmos: { value: 0 },
        uCeu: { value: 0 },
        uPlasma: { value: 0 },
        uNuvens: { value: 0 },
        uRelevo: { value: 0 },
        uRelevoX: { value: 0 },
        uRastro: { value: 0 },
        uSentido: { value: 1 },
        uRadial: { value: 0 },
        uTremor: { value: new THREE.Vector2() },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.telaMat);
    quad.frustumCulled = false;
    this.tela.add(quad);
  }

  /** Brilho radial pintado num canvas: um só, usado pelo núcleo e pela cápsula. */
  private texturaBrilho() {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.2, "rgba(255,255,255,0.55)");
    g.addColorStop(0.55, "rgba(255,255,255,0.12)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  private anel(raio: number) {
    const geo = new THREE.RingGeometry(raio * 1.4, raio * 2.35, 128, 1);
    const mat = new THREE.ShaderMaterial({
      vertexShader: /* glsl */ `
        varying vec2 vL;
        varying vec3 vP;
        void main() {
          vL = position.xy;
          vec4 m = modelMatrix * vec4(position, 1.0);
          vP = m.xyz;
          gl_Position = projectionMatrix * viewMatrix * m;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uDentro;
        uniform float uFora;
        varying vec2 vL;
        varying vec3 vP;
        float h(float x) { return fract(sin(x * 91.7) * 43758.5); }
        void main() {
          float r = (length(vL) - uDentro) / (uFora - uDentro);
          float faixa = 0.45 + 0.55 * h(floor(r * 46.0));
          float borda = smoothstep(0.0, 0.06, r) * smoothstep(1.0, 0.86, r);
          float vao = 1.0 - smoothstep(0.52, 0.56, r) * smoothstep(0.62, 0.58, r);
          vec3 c = mix(vec3(0.62, 0.48, 0.33), vec3(0.95, 0.84, 0.66), faixa);
          float luz = 0.35 + 0.65 * clamp(1.0 - length(vP) / 60.0, 0.0, 1.0);
          gl_FragColor = vec4(c * luz, faixa * borda * vao * 0.75);
        }`,
      uniforms: { uDentro: { value: raio * 1.4 }, uFora: { value: raio * 2.35 } },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const anel = new THREE.Mesh(geo, mat);
    anel.rotation.x = -Math.PI / 2 + 0.38;
    anel.rotation.y = 0.12;
    return anel;
  }

  private linhaDeOrbita(raio: number, inclinacao: number) {
    const pontos: THREE.Vector3[] = [];
    for (let i = 0; i <= 256; i++) {
      const a = (i / 256) * Math.PI * 2;
      pontos.push(new THREE.Vector3(Math.cos(a) * raio, 0, Math.sin(a) * raio));
    }
    const linha = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pontos),
      new THREE.LineBasicMaterial({ color: 0x8fb3ff, transparent: true, opacity: 0.13 }),
    );
    linha.rotation.x = inclinacao;
    return linha;
  }

  private pontoDoTrajeto(fracao: number) {
    const a = fracao * Math.PI * 2;
    return new THREE.Vector3(Math.cos(a) * 6.2, 0, Math.sin(a) * 4.6);
  }

  dimensionar(largura: number, altura: number) {
    this.largura = largura;
    this.altura = altura;
    // DPR baixo de propósito: a torre 3D de outro projeto, com DPR alto e
    // render sempre ligado, ficou "travada" na mão do cliente.
    this.dpr = Math.min(window.devicePixelRatio || 1, this.leve ? 1 : this.dprMax);
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(largura, altura, false);
    this.camera.aspect = largura / altura;
    this.camera.fov = largura / altura < 0.8 ? 58 : 42;
    this.camera.updateProjectionMatrix();
    this.telaMat.uniforms.uRes.value.set(largura * this.dpr, altura * this.dpr);
    this.estrelasMat.uniforms.uDpr.value = this.dpr;
  }

  /** Máquina que não segurou os primeiros quadros: resolução 1, e só. */
  aliviar() {
    this.dprMax = 1;
    this.dimensionar(this.largura, this.altura);
  }

  private posicaoDoFoco(foco: Foco, alvo: THREE.Vector3) {
    if (foco === "sistema" || foco === "nucleo") return alvo.set(0, 0, 0);
    if (foco === "cinturao") {
      return alvo.set(
        Math.cos(CINTURAO.angulo) * CINTURAO.raio,
        0,
        Math.sin(CINTURAO.angulo) * CINTURAO.raio,
      );
    }
    return alvo.copy(this.planetas[foco].grupo.position);
  }

  /** De onde e para onde a câmera olha numa cena. */
  private pose(cena: Cena, pos: THREE.Vector3, alvo: THREE.Vector3) {
    this.posicaoDoFoco(cena.foco, alvo);
    // Num corpo fora da origem, o ângulo zero é a câmera do lado do núcleo:
    // a face iluminada de frente.
    const base = typeof cena.foco === "number" || cena.foco === "cinturao"
      ? Math.atan2(alvo.z, alvo.x) + Math.PI
      : 0;
    const az = base + rad(cena.az);
    const el = rad(cena.el);
    pos.set(
      alvo.x + cena.dist * Math.cos(el) * Math.cos(az),
      alvo.y + cena.dist * Math.sin(el),
      alvo.z + cena.dist * Math.cos(el) * Math.sin(az),
    );
  }

  private pA = new THREE.Vector3();
  private aA = new THREE.Vector3();
  private pB = new THREE.Vector3();
  private aB = new THREE.Vector3();
  private alvo = new THREE.Vector3();
  private direita = new THREE.Vector3();
  private cima = new THREE.Vector3();

  quadro(tempo: number) {
    const leve = this.leve;

    // Órbitas.
    for (const p of this.planetas) {
      const a = p.fase + tempo * p.omega;
      p.grupo.position.set(Math.cos(a) * p.orbita, Math.sin(a) * p.orbita * p.inclinacao, Math.sin(a) * p.orbita);
      p.corpo.rotation.y = tempo * 0.06;
      p.material.uniforms.uTempo.value = tempo;
    }
    this.cinturao.rotation.y = tempo * 0.004;
    this.nucleoMat.uniforms.uTempo.value = tempo;
    this.estrelasMat.uniforms.uTempo.value = tempo;

    // Câmera: mistura das poses das duas cenas vizinhas.
    const A = CENAS[E.linear ? 0 : E.a];
    const B = CENAS[E.linear ? 0 : E.b];
    const t = E.linear ? 0 : E.t;
    this.pose(A, this.pA, this.aA);
    this.pose(B, this.pB, this.aB);
    const pos = this.camera.position.copy(this.pA).lerp(this.pB, t);
    this.alvo.copy(this.aA).lerp(this.aB, t);

    // A viagem não é reta: no meio dela a câmera se afasta e sobe um pouco,
    // como quem sai da órbita de um corpo e cai na do próximo.
    const arco = Math.sin(Math.PI * t) * this.pA.distanceTo(this.pB) * 0.18;
    pos.y += arco;

    // Chegada: começa longe e desacelera até a pose da primeira cena.
    const chegada = 1 - Math.pow(1 - E.chegada, 3);
    if (chegada < 1) {
      this.v.copy(pos).sub(this.alvo).multiplyScalar((1 - chegada) * 5);
      pos.add(this.v);
    }

    const dist = pos.distanceTo(this.alvo);
    this.camera.lookAt(this.alvo);
    this.direita.setFromMatrixColumn(this.camera.matrix, 0);
    this.cima.setFromMatrixColumn(this.camera.matrix, 1);
    // Gravidade do cursor: a câmera cede para o lado do ponteiro, com massa.
    pos.addScaledVector(this.direita, E.mx * dist * 0.035);
    pos.addScaledVector(this.cima, -E.my * dist * 0.025);
    // Tremor da reentrada.
    if (E.tremor > 0.001) {
      const k = E.tremor * dist * 0.012;
      pos.addScaledVector(this.direita, Math.sin(tempo * 37.1) * Math.sin(tempo * 13.3) * k);
      pos.addScaledVector(this.cima, Math.sin(tempo * 41.7 + 1.3) * Math.cos(tempo * 9.1) * k);
    }
    this.camera.lookAt(this.alvo);

    // Enquadramento fora do centro, do lado oposto ao cartão. Em tela em pé
    // o objeto sobe, e o cartão fica embaixo.
    const ox = lerp(A.ox, B.ox, t);
    const oy = lerp(A.oy, B.oy, t);
    const retrato = this.largura / this.altura < 0.8;
    const dx = retrato ? 0 : -ox * this.largura;
    const dy = retrato ? this.altura * 0.2 + oy * this.altura : oy * this.altura;
    this.camera.setViewOffset(this.largura, this.altura, dx, dy, this.largura, this.altura);

    // Trajetória do processo.
    const vis = E.trajetoria;
    this.trajeto.visible = vis > 0.01;
    if (this.trajeto.visible) {
      const fracao = E.orbita / 5;
      const quantos = Math.max(2, Math.round(fracao * 240) + 1);
      this.trajetoFeito.geometry.setDrawRange(0, quantos);
      this.capsula.position.copy(this.pontoDoTrajeto(fracao));
      this.queimas.forEach((q, i) => {
        const m = q.material as THREE.MeshBasicMaterial;
        m.color.set(i <= E.orbita + 0.02 ? 0xff3b3b : 0x8fb3ff);
        m.opacity = vis;
      });
      this.trajeto.scale.setScalar(0.4 + 0.6 * vis);
    }

    // Projeções para as etiquetas dos planetas.
    this.camera.updateMatrixWorld();
    E.projecoes = this.planetas.map((p) => {
      this.v.copy(p.grupo.position).project(this.camera);
      const visivel = this.v.z < 1 && Math.abs(this.v.x) < 1.1 && Math.abs(this.v.y) < 1.1;
      return {
        x: (this.v.x * 0.5 + 0.5) * this.largura,
        y: (-this.v.y * 0.5 + 0.5) * this.altura,
        r: p.raio,
        visivel,
      };
    });

    // Camada de atmosfera.
    const u = this.telaMat.uniforms;
    u.uTempo.value = tempo;
    u.uAtmos.value = E.atmos;
    u.uCeu.value = E.ceu;
    u.uPlasma.value = E.plasma;
    u.uNuvens.value = E.nuvens;
    u.uRelevo.value = E.relevo;
    u.uRelevoX.value = E.relevoX;
    u.uSentido.value = E.sentido;
    const rapido = Math.min(Math.abs(E.vel) * 0.18, 0.5);
    u.uRastro.value = Math.min(1, E.rastro + (E.atmos < 0.5 ? rapido : 0));
    u.uRadial.value = leve ? 0 : 1 - chegada;
    const k = E.tremor * 0.004;
    u.uTremor.value.set(Math.sin(tempo * 43.0) * k, Math.cos(tempo * 31.0) * k);

    this.renderer.clear();
    if (E.atmos < 0.999) this.renderer.render(this.cena, this.camera);
    const camada =
      E.atmos > 0.001 || E.plasma > 0.001 || u.uRastro.value > 0.001 || u.uRadial.value > 0.001;
    if (camada) this.renderer.render(this.tela, this.telaCam);
  }

  descartar() {
    this.cena.traverse((obj) => {
      const malha = obj as THREE.Mesh;
      malha.geometry?.dispose();
      const mat = malha.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose();
    });
    this.telaMat.dispose();
    this.renderer.dispose();
  }
}
