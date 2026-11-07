import * as THREE from "three";

import { CENAS, type Cena, type Foco } from "@/lib/missao/cenas";
import { E } from "@/lib/missao/estado";
import {
  comOitavas,
  FRAG_CEU,
  FRAG_ESTRELAS,
  FRAG_GALAXIA,
  FRAG_HALO,
  FRAG_NUCLEO,
  FRAG_PLANETA,
  FRAG_TELA,
  VERT_CEU,
  VERT_ESFERA,
  VERT_ESTRELAS,
  VERT_GALAXIA,
  VERT_HALO,
  VERT_TELA,
} from "@/lib/missao/shaders";
import { criarGerador } from "@/lib/utils/aleatorio";

/**
 * O cosmos da missão em Three.js. São duas cenas em escalas que não cabem no
 * mesmo espaço: a Via Láctea, com câmera própria que se aproxima em escala
 * logarítmica, e o sistema solar, com o núcleo vermelho na origem e um planeta
 * por projeto. As duas se encontram no ponto em que o Sol da galáxia está no
 * centro da tela e o núcleo do sistema também. Por cima, a camada de atmosfera.
 *
 * A câmera do sistema não tem animação própria. A cada quadro ela é calculada
 * a partir das duas cenas vizinhas do roteiro (`E.a`, `E.b`, `E.t`): cada uma
 * diz para onde olhar e de onde, e a mistura entre as duas é a viagem. Como os
 * planetas se movem, a pose de cada cena é recalculada ao vivo.
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

/** Um planeta por projeto, na cor do mundo de cada um; o último, azul, é o próximo. */
const PLANETAS = [
  // Sencis: porcelana e o dourado do letreiro da clínica.
  { raio: 1.5, orbita: 16, fase: 0.7, inclinacao: 0.05, tipo: 0, a: "#6b5a44", b: "#d9c7a6", c: "#f6ecd8", atm: "#ffe0a8" },
  // FIDÈLE: gigante rosa com anel, a tinta da marca.
  { raio: 2.7, orbita: 25, fase: 2.5, inclinacao: -0.04, tipo: 1, a: "#2a141d", b: "#c8557a", c: "#f4c6d4", atm: "#ff8fb0" },
  // Yasmin: preto e dourado, com a luz no lado escuro.
  { raio: 1.8, orbita: 35, fase: 4.2, inclinacao: 0.07, tipo: 2, a: "#17120a", b: "#a98538", c: "#ffcf6a", atm: "#e6c46a" },
  // Keep New: aço com ferrugem de máquina.
  { raio: 2, orbita: 45, fase: 5.6, inclinacao: -0.03, tipo: 0, a: "#26292e", b: "#737b85", c: "#d9702c", atm: "#ff9d5c" },
  // O planeta azul, onde a missão pousa: o próximo projeto.
  { raio: 2.3, orbita: 56, fase: 1.4, inclinacao: 0.04, tipo: 3, a: "#08183f", b: "#1d4fae", c: "#2c5a46", atm: "#4c7dff" },
] as const;

const CINTURAO = { raio: 30, largura: 2.6 };

/** Tamanho da Via Láctea, e onde o Sol fica nela: num braço, longe do centro. */
const GALAXIA = { raio: 100, sol: new THREE.Vector3(53, 0.4, -24) };

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
  private ceuMat: THREE.ShaderMaterial;
  private galaxia = new THREE.Scene();
  private galaxiaCam = new THREE.PerspectiveCamera(42, 1, 0.02, 1200);
  private galaxiaGiro = new THREE.Group();
  private galaxiaMats: THREE.ShaderMaterial[] = [];
  private miolo: THREE.Sprite;
  private solDaGalaxia: THREE.Sprite;
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
    this.ceuMat = new THREE.ShaderMaterial({
      vertexShader: VERT_CEU,
      fragmentShader: comOitavas(FRAG_CEU, leve ? 3 : 4),
      uniforms: { uAlfa: { value: 1 } },
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const ceu = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), this.ceuMat);
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
      uniforms: { uTempo: { value: 0 }, uDpr: { value: 1 }, uAlfa: { value: 1 } },
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

    // A Via Láctea.
    this.montarGalaxia(aleatorio, leve);
    this.miolo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: brilho,
        color: 0xffc48a,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    this.miolo.scale.setScalar(96);
    this.galaxiaGiro.add(this.miolo);
    // O Sol: um ponto vermelho no braço, que vira o núcleo do sistema ao chegar.
    this.solDaGalaxia = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: brilho,
        color: 0xff5a40,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    this.solDaGalaxia.scale.setScalar(0.9);
    this.solDaGalaxia.position.copy(GALAXIA.sol);
    this.galaxiaGiro.add(this.solDaGalaxia);
    this.galaxia.add(this.galaxiaGiro);

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
        uRastro: { value: 0 },
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

  /**
   * Espiral logarítmica com dois braços fortes e dois fracos, uma barra no
   * centro, nuvens largas de luz e, por cima, poeira escura na beira de dentro
   * dos braços, que é o que dá cara de foto de galáxia a um monte de pontos.
   */
  private montarGalaxia(aleatorio: () => number, leve: boolean) {
    const gauss = () => (aleatorio() + aleatorio() + aleatorio() + aleatorio() - 2) / 2;
    const quente = cor("#ffd6a3");
    const fria = cor("#c3d2f2");
    const rosa = cor("#f08a96");
    const R = GALAXIA.raio;
    const passo = 1 / Math.tan(rad(14));

    // Um ponto num braço: `larg` é o espalhamento em volta da curva.
    const noBraco = (larg: number, deslocamento = 0) => {
      const braco = Math.floor(aleatorio() * 4);
      const forca = braco % 2 === 0 ? 1 : 0.55;
      const r = R * (0.14 + 0.86 * Math.pow(aleatorio(), 0.75 + (1 - forca) * 0.5));
      const ang = (braco * Math.PI) / 2 + Math.log(r / (R * 0.14)) * passo * 0.6 + deslocamento;
      const e = larg * (0.45 + (r / R) * 0.75);
      return {
        x: Math.cos(ang) * r + gauss() * e,
        z: Math.sin(ang) * r + gauss() * e,
        r,
      };
    };

    type Camada = { pos: number[]; tam: number[]; alfa: number[]; cores: number[] };
    const nova = (): Camada => ({ pos: [], tam: [], alfa: [], cores: [] });
    const por = (c: Camada, x: number, y: number, z: number, t: number, a: number, k: THREE.Color) => {
      c.pos.push(x, y, z);
      c.tam.push(t);
      c.alfa.push(a);
      c.cores.push(k.r, k.g, k.b);
    };
    const k = new THREE.Color();

    // Estrelas: braços, disco e o miolo em barra.
    const estrelas = nova();
    const total = leve ? 22000 : 60000;
    for (let i = 0; i < total; i++) {
      const sorte = aleatorio();
      if (sorte < 0.5) {
        const p = noBraco(17);
        k.copy(quente).lerp(fria, Math.min(1, p.r / (R * 0.6)));
        if (aleatorio() < 0.025) k.copy(rosa);
        por(estrelas, p.x, gauss() * 1.8, p.z, 0.16 + aleatorio() * aleatorio() * 0.5, 0.85, k);
      } else if (sorte < 0.86) {
        const r = R * Math.pow(aleatorio(), 0.62);
        const ang = aleatorio() * Math.PI * 2;
        k.copy(quente).lerp(fria, r / R);
        por(estrelas, Math.cos(ang) * r, gauss() * 2.4, Math.sin(ang) * r, 0.13 + aleatorio() * 0.12, 0.42, k);
      } else {
        // Barra: alongada num eixo, inclinada em relação aos braços.
        const bx = gauss() * R * 0.26;
        const bz = gauss() * R * 0.11;
        por(estrelas, bx * 0.86 - bz * 0.5, gauss() * 5, bx * 0.5 + bz * 0.86, 0.1 + aleatorio() * 0.12, 0.6, quente);
      }
    }

    // Nuvens de luz, largas e fracas.
    const nuvens = nova();
    const quantas = leve ? 700 : 2200;
    for (let i = 0; i < quantas; i++) {
      const p = noBraco(20);
      k.copy(quente).lerp(fria, Math.min(1, p.r / (R * 0.7)));
      if (aleatorio() < 0.05) k.copy(rosa);
      por(nuvens, p.x, gauss() * 1.5, p.z, 9 + aleatorio() * 15, 0.07, k);
    }

    // O brilho difuso do disco, que une os braços: sem ele, é um cata-vento.
    const disco = leve ? 200 : 500;
    for (let i = 0; i < disco; i++) {
      const r = R * Math.pow(aleatorio(), 0.7);
      const ang = aleatorio() * Math.PI * 2;
      k.copy(quente).lerp(fria, Math.min(1, r / (R * 0.8)));
      por(nuvens, Math.cos(ang) * r, 0, Math.sin(ang) * r, 18 + aleatorio() * 16, 0.035, k);
    }

    // Poeira escura, na beira de dentro dos braços.
    const poeira = nova();
    const escura = cor("#05070f");
    const grao = leve ? 500 : 1500;
    for (let i = 0; i < grao; i++) {
      const p = noBraco(7, -0.22);
      por(poeira, p.x, gauss() * 0.8, p.z, 3 + aleatorio() * 6, 0.3, escura);
    }

    const pontos = (c: Camada, aditivo: boolean) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(c.pos, 3));
      geo.setAttribute("aTam", new THREE.Float32BufferAttribute(c.tam, 1));
      geo.setAttribute("aAlfa", new THREE.Float32BufferAttribute(c.alfa, 1));
      geo.setAttribute("aCor", new THREE.Float32BufferAttribute(c.cores, 3));
      const mat = new THREE.ShaderMaterial({
        vertexShader: VERT_GALAXIA,
        fragmentShader: FRAG_GALAXIA,
        uniforms: { uEscala: { value: 1 }, uMaximo: { value: 90 }, uAlfa: { value: 1 } },
        transparent: true,
        depthTest: false,
        depthWrite: false,
        blending: aditivo ? THREE.AdditiveBlending : THREE.NormalBlending,
      });
      this.galaxiaMats.push(mat);
      const p = new THREE.Points(geo, mat);
      p.frustumCulled = false;
      this.galaxiaGiro.add(p);
    };
    pontos(nuvens, true);
    pontos(poeira, false);
    pontos(estrelas, true);
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
    this.galaxiaCam.aspect = this.camera.aspect;
    this.galaxiaCam.fov = this.camera.fov;
    this.galaxiaCam.updateProjectionMatrix();
    // Quantos pixels mede uma unidade a uma unidade de distância.
    const escala = (altura * this.dpr) / (2 * Math.tan(rad(this.camera.fov) / 2));
    for (const m of this.galaxiaMats) {
      m.uniforms.uEscala.value = escala;
      m.uniforms.uMaximo.value = 90 * this.dpr;
    }
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
    return alvo.copy(this.planetas[foco].grupo.position);
  }

  /** De onde e para onde a câmera olha numa cena. */
  private pose(cena: Cena, pos: THREE.Vector3, alvo: THREE.Vector3) {
    this.posicaoDoFoco(cena.foco, alvo);
    // Num corpo fora da origem, o ângulo zero é a câmera do lado do núcleo:
    // a face iluminada de frente.
    const base = typeof cena.foco === "number" ? Math.atan2(alvo.z, alvo.x) + Math.PI : 0;
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
    // como quem sai da órbita de um corpo e cai na do próximo. Saindo da
    // galáxia não: ali a distância é de outra escala, e o arco viraria um salto.
    const arco = Math.sin(Math.PI * t) * this.pA.distanceTo(this.pB) * 0.18;
    pos.y += arco * (1 - A.galaxia);

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

    // A Via Láctea, com câmera própria: a distância cai em escala logarítmica
    // (linear, o fim do zoom seria um salto), e o olhar sai do centro da galáxia
    // para o Sol enquanto a câmera desce para o plano do disco, girando.
    const g = E.galaxia;
    const z = 1 - g;
    const aSistema = 1 - THREE.MathUtils.smoothstep(g, 0.06, 0.32);
    this.ceuMat.uniforms.uAlfa.value = aSistema;
    this.estrelasMat.uniforms.uAlfa.value = aSistema;

    if (g > 0.001) {
      this.galaxiaGiro.rotation.y = tempo * 0.004;
      const aGalaxia = 1 - THREE.MathUtils.smoothstep(z, 0.7, 0.95);
      for (const m of this.galaxiaMats) m.uniforms.uAlfa.value = aGalaxia;
      (this.miolo.material as THREE.SpriteMaterial).opacity = 0.55 * aGalaxia;
      const sol = this.solDaGalaxia.material as THREE.SpriteMaterial;
      sol.opacity = THREE.MathUtils.smoothstep(z, 0.2, 0.5) * aGalaxia;

      this.galaxiaGiro.updateMatrixWorld();
      this.v.copy(GALAXIA.sol).applyMatrix4(this.galaxiaGiro.matrixWorld);
      const olhar = THREE.MathUtils.smootherstep(Math.min(1, z * 2.6), 0, 1);
      this.alvo.set(0, 0, 0).lerp(this.v, olhar);
      const distG = 205 * Math.pow(0.5 / 205, z);
      const elG = rad(lerp(56, 18, z));
      const azG = rad(25 + z * 70);
      const cam = this.galaxiaCam;
      cam.position.set(
        this.alvo.x + distG * Math.cos(elG) * Math.cos(azG) + E.mx * distG * 0.02,
        this.alvo.y + distG * Math.sin(elG) - E.my * distG * 0.015,
        this.alvo.z + distG * Math.cos(elG) * Math.sin(azG),
      );
      cam.lookAt(this.alvo);
      cam.setViewOffset(this.largura, this.altura, dx, dy, this.largura, this.altura);
    }

    // Camada de atmosfera.
    const u = this.telaMat.uniforms;
    u.uTempo.value = tempo;
    u.uAtmos.value = E.atmos;
    u.uCeu.value = E.ceu;
    u.uPlasma.value = E.plasma;
    u.uNuvens.value = E.nuvens;
    u.uRelevo.value = E.relevo;
    u.uRastro.value = E.rastro;
    // O rastro radial é a velocidade da travessia da galáxia.
    u.uRadial.value = g > 0.001 && g < 0.999 ? Math.sin(Math.PI * z) * 0.75 : 0;
    const k = E.tremor * 0.004;
    u.uTremor.value.set(Math.sin(tempo * 43.0) * k, Math.cos(tempo * 31.0) * k);

    this.renderer.clear();
    if (g > 0.001) {
      this.renderer.render(this.galaxia, this.galaxiaCam);
      this.renderer.clearDepth();
    }
    // Longe demais, o sistema é menos que um pixel: não precisa ser desenhado.
    if (E.atmos < 0.999 && g < 0.9) this.renderer.render(this.cena, this.camera);
    const camada = E.atmos > 0.001 || E.plasma > 0.001 || E.rastro > 0.001 || u.uRadial.value > 0.001;
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
    this.galaxia.traverse((obj) => {
      const malha = obj as THREE.Points;
      malha.geometry?.dispose();
      (malha.material as THREE.Material | undefined)?.dispose();
    });
    this.telaMat.dispose();
    this.renderer.dispose();
  }
}
