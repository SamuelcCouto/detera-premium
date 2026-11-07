import * as THREE from "three";

import { NOME_DETERA } from "@/components/brand/marca-paths";
import { CENAS, type Cena, type Foco } from "@/lib/missao/cenas";
import { E } from "@/lib/missao/estado";
import {
  FRAG_ASSAR_CEU,
  FRAG_ASSAR_NUCLEO,
  FRAG_ASSAR_PLANETA,
  FRAG_ASSAR_RUIDO,
  FRAG_CEU,
  FRAG_DISCO,
  FRAG_ESTRELAS,
  FRAG_GALAXIA,
  FRAG_HALO,
  FRAG_NOME,
  FRAG_NUCLEO,
  FRAG_PLANETA,
  FRAG_TELA,
  VERT_ASSAR,
  VERT_CEU,
  VERT_DISCO,
  VERT_ESFERA,
  VERT_ESTRELAS,
  VERT_GALAXIA,
  VERT_HALO,
  VERT_NOME,
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
 *
 * O que é caro é pintado uma vez em textura ao montar (`assar`): as superfícies,
 * o céu, o ruído da atmosfera e o disco da galáxia. A cada quadro só há leitura
 * de textura e luz. Vale para qualquer aparelho; o modo `leve` só usa texturas
 * menores e menos pontos.
 */

type Planeta = {
  grupo: THREE.Group;
  corpo: THREE.Mesh;
  raio: number;
  orbita: number;
  inclinacao: number;
  fase: number;
  omega: number;
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
  private nomeCena = new THREE.Scene();
  private nomeMat: THREE.ShaderMaterial;
  private nomeInicio = -1;
  private planetas: Planeta[] = [];
  private cinturao: THREE.InstancedMesh;
  private ceuMat: THREE.ShaderMaterial;
  private galaxia = new THREE.Scene();
  private galaxiaCam = new THREE.PerspectiveCamera(42, 1, 0.02, 1200);
  private galaxiaGiro = new THREE.Group();
  private galaxiaMat: THREE.ShaderMaterial | null = null;
  private galaxiaEstrelas: THREE.BufferGeometry | null = null;
  private discoMat: THREE.ShaderMaterial | null = null;
  private assados: THREE.WebGLRenderTarget[] = [];
  private miolo: THREE.Sprite;
  private solDaGalaxia: THREE.Sprite;
  private largura = 1;
  private altura = 1;
  private dpr = 1;
  private dprMax: number;
  private v = new THREE.Vector3();

  readonly leve: boolean;

  constructor(canvas: HTMLCanvasElement, leve: boolean) {
    this.leve = leve;
    this.dprMax = leve ? 1.25 : 1.5;
    const aleatorio = criarGerador(20261101);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !leve,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.autoClear = false;
    this.renderer.setClearColor(0x050913, 1);

    // Tamanho das superfícies assadas.
    const mapaL = leve ? 1024 : 2048;
    const mapaA = mapaL / 2;

    // Céu de fundo.
    this.ceuMat = new THREE.ShaderMaterial({
      vertexShader: VERT_CEU,
      fragmentShader: FRAG_CEU,
      uniforms: {
        uMapa: { value: this.assar(FRAG_ASSAR_CEU, {}, leve ? 1024 : 2048, leve ? 512 : 1024) },
        uAlfa: { value: 1 },
      },
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
      fragmentShader: FRAG_NUCLEO,
      uniforms: {
        uMapa: { value: this.assar(FRAG_ASSAR_NUCLEO, {}, mapaL, mapaA) },
        uTempo: { value: 0 },
      },
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
    PLANETAS.forEach((def, indice) => {
      const grupo = new THREE.Group();
      const mapa = this.assar(
        FRAG_ASSAR_PLANETA,
        {
          uCorA: { value: cor(def.a) },
          uCorB: { value: cor(def.b) },
          uCorC: { value: cor(def.c) },
          uTipo: { value: def.tipo },
          uSemente: { value: indice * 3.7 },
        },
        mapaL,
        mapaA,
        true,
      );
      const material = new THREE.ShaderMaterial({
        vertexShader: VERT_ESFERA,
        fragmentShader: FRAG_PLANETA,
        uniforms: {
          uMapa: { value: mapa },
          uCorC: { value: cor(def.c) },
          uAtm: { value: cor(def.atm) },
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
      });
    });

    // Cinturão de asteroides.
    const pedras = leve ? 260 : 700;
    this.cinturao = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.MeshLambertMaterial({ color: 0x8a7f78, flatShading: true }),
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

    // O nome em estrelas.
    this.nomeMat = this.montarNome(aleatorio, leve);

    // A camada de atmosfera.
    this.telaMat = new THREE.ShaderMaterial({
      vertexShader: VERT_TELA,
      fragmentShader: FRAG_TELA,
      uniforms: {
        uRuido: { value: this.assar(FRAG_ASSAR_RUIDO, {}, 512, 512, false, true) },
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

  /**
   * Pinta um shader numa textura, uma vez. `mipmaps` serve às superfícies dos
   * planetas, que de longe viram poucos pixels e cintilariam sem eles;
   * `ladrilho` repete nos dois eixos (nas esferas, só em volta do equador).
   */
  private assar(
    fragmentShader: string,
    uniforms: Record<string, THREE.IUniform>,
    largura: number,
    altura: number,
    mipmaps = false,
    ladrilho = false,
  ) {
    const alvo = new THREE.WebGLRenderTarget(largura, altura, {
      depthBuffer: false,
      generateMipmaps: mipmaps,
      minFilter: mipmaps ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.RepeatWrapping,
      wrapT: ladrilho ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping,
    });
    const material = new THREE.ShaderMaterial({
      vertexShader: VERT_ASSAR,
      fragmentShader,
      uniforms,
      blending: THREE.NoBlending,
      depthTest: false,
      depthWrite: false,
    });
    const geometria = new THREE.PlaneGeometry(2, 2);
    const quad = new THREE.Mesh(geometria, material);
    quad.frustumCulled = false;
    const cena = new THREE.Scene();
    cena.add(quad);
    this.renderer.setRenderTarget(alvo);
    this.renderer.render(cena, this.telaCam);
    this.renderer.setRenderTarget(null);
    geometria.dispose();
    material.dispose();
    this.assados.push(alvo);
    return alvo.texture;
  }

  /**
   * As estrelas que formam o nome. As posições saem da própria geometria da
   * marca, desenhada num canvas fora da tela e amostrada: parte no miolo das
   * letras e parte na borda, que é o que deixa os chanfros reconhecíveis.
   *
   * São poeira, não o nome em si: letra feita só de pontos parecia granito e
   * perdia o desenho da marca. Quando elas chegam, o `<svg>` do `<h1>` acende
   * por cima, sólido e exato (`nome-pronto`).
   */
  private montarNome(aleatorio: () => number, leve: boolean) {
    const W = 716;
    const H = 128;
    const e = 2;
    const c = document.createElement("canvas");
    c.width = W * e;
    c.height = H * e;
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    ctx.scale(e, e);
    for (const letra of NOME_DETERA) ctx.fill(new Path2D(letra.d), "evenodd");
    const { data } = ctx.getImageData(0, 0, c.width, c.height);
    const cheio = (x: number, y: number) =>
      x >= 0 && y >= 0 && x < c.width && y < c.height && data[(y * c.width + x) * 4 + 3] > 128;
    const miolo: [number, number][] = [];
    const borda: [number, number][] = [];
    for (let y = 0; y < c.height; y++) {
      for (let x = 0; x < c.width; x++) {
        if (!cheio(x, y)) continue;
        const naBorda = !cheio(x - 2, y) || !cheio(x + 2, y) || !cheio(x, y - 2) || !cheio(x, y + 2);
        (naBorda ? borda : miolo).push([x, y]);
      }
    }

    const total = leve ? 3500 : 8000;
    const pos = new Float32Array(total * 3);
    const origem = new Float32Array(total * 2);
    const fase = new Float32Array(total);
    const tam = new Float32Array(total);
    const cores = new Float32Array(total * 3);
    const tons = [cor("#f4f6fb"), cor("#cfdcf8"), cor("#ffe2c4"), cor("#ff6a55")];
    for (let i = 0; i < total; i++) {
      const lista = aleatorio() < 0.45 ? borda : miolo;
      const [x, y] = lista[Math.floor(aleatorio() * lista.length)];
      pos.set([x / c.width - 0.5, (0.5 - y / c.height) * (H / W), 0], i * 3);
      const ang = aleatorio() * Math.PI * 2;
      const r = 0.15 + aleatorio() * 0.95;
      origem.set([Math.cos(ang) * r, Math.sin(ang) * r * 0.45], i * 2);
      fase[i] = aleatorio();
      tam[i] = 0.7 + aleatorio() * 0.7;
      const sorte = aleatorio();
      const tom = tons[sorte < 0.72 ? 0 : sorte < 0.9 ? 1 : sorte < 0.97 ? 2 : 3];
      cores.set([tom.r, tom.g, tom.b], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aOrigem", new THREE.BufferAttribute(origem, 2));
    geo.setAttribute("aFase", new THREE.BufferAttribute(fase, 1));
    geo.setAttribute("aTam", new THREE.BufferAttribute(tam, 1));
    geo.setAttribute("aCor", new THREE.BufferAttribute(cores, 3));
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT_NOME,
      fragmentShader: FRAG_NOME,
      uniforms: {
        uForma: { value: 0 },
        uFuga: { value: 0 },
        uLargura: { value: 1 },
        uAspecto: { value: 1 },
        uCentro: { value: new THREE.Vector2() },
        uPx: { value: 2 },
        uTempo: { value: 0 },
        uSombra: { value: 0 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    // A sombra compartilha os valores do nome; só muda o `uSombra` e a mistura.
    const sombraMat = mat.clone();
    sombraMat.uniforms = { ...mat.uniforms, uSombra: { value: 1 } };
    sombraMat.blending = THREE.NormalBlending;
    for (const material of [sombraMat, mat]) {
      const pontos = new THREE.Points(geo, material);
      pontos.frustumCulled = false;
      this.nomeCena.add(pontos);
    }
    return mat;
  }

  /** Onde o layout reservou o nome, em pixels da tela. */
  posicionarNome(x: number, y: number, largura: number) {
    const u = this.nomeMat.uniforms;
    const W = this.largura;
    const H = this.altura;
    u.uLargura.value = (2 * largura) / W;
    u.uAspecto.value = W / H;
    u.uCentro.value.set((x / W) * 2 - 1, 1 - (y / H) * 2);
    u.uPx.value = Math.max(1.3, (largura / 716) * 1.5) * this.dpr;
  }

  /** O nome já se formou. Depois disso, parado, a cena pode rodar a meio quadro. */
  get nomePronto() {
    return this.nomeMat.uniforms.uForma.value >= 1;
  }

  /** Brilho radial pintado num canvas: um só, usado pelo núcleo e pelo Sol da galáxia. */
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
    const total = leve ? 14000 : 60000;
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
    const quantas = 2200;
    for (let i = 0; i < quantas; i++) {
      const p = noBraco(20);
      k.copy(quente).lerp(fria, Math.min(1, p.r / (R * 0.7)));
      if (aleatorio() < 0.05) k.copy(rosa);
      por(nuvens, p.x, gauss() * 1.5, p.z, 9 + aleatorio() * 15, 0.07, k);
    }

    // O brilho difuso do disco, que une os braços: sem ele, é um cata-vento.
    const disco = 500;
    for (let i = 0; i < disco; i++) {
      const r = R * Math.pow(aleatorio(), 0.7);
      const ang = aleatorio() * Math.PI * 2;
      k.copy(quente).lerp(fria, Math.min(1, r / (R * 0.8)));
      por(nuvens, Math.cos(ang) * r, 0, Math.sin(ang) * r, 18 + aleatorio() * 16, 0.035, k);
    }

    // Poeira escura, na beira de dentro dos braços.
    const poeira = nova();
    const escura = cor("#05070f");
    const grao = 1500;
    for (let i = 0; i < grao; i++) {
      const p = noBraco(7, -0.22);
      por(poeira, p.x, gauss() * 0.8, p.z, 5 + aleatorio() * 9, 0.13, escura);
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
      const p = new THREE.Points(geo, mat);
      p.frustumCulled = false;
      return p;
    };

    // Nuvens e poeira são milhares de pontos largos um sobre o outro: dezenas
    // de telas de pintura por quadro, e o maior peso da abertura no celular.
    // Como só giram junto com a galáxia, são pintadas uma vez, vistas de cima,
    // numa textura que vira um plano só.
    const S = R * 1.3;
    const lado = leve ? 512 : 1024;
    const alvo = new THREE.WebGLRenderTarget(lado, lado, {
      depthBuffer: false,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
    });
    const cam = new THREE.OrthographicCamera(-S, S, S, -S, 1, 400);
    cam.position.set(0, 100, 0);
    cam.up.set(0, 0, -1);
    cam.lookAt(0, 0, 0);
    const pintura = new THREE.Scene();
    const camadas = [pontos(nuvens, true), pontos(poeira, false)];
    for (const camada of camadas) {
      const mat = camada.material as THREE.ShaderMaterial;
      mat.uniforms.uEscala.value = (100 * lado) / (2 * S);
      mat.uniforms.uMaximo.value = lado;
      pintura.add(camada);
    }
    this.renderer.setRenderTarget(alvo);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.clear();
    this.renderer.render(pintura, cam);
    this.renderer.setRenderTarget(null);
    this.renderer.setClearColor(0x050913, 1);
    for (const camada of camadas) {
      camada.geometry.dispose();
      (camada.material as THREE.Material).dispose();
    }
    this.assados.push(alvo);

    this.discoMat = new THREE.ShaderMaterial({
      vertexShader: VERT_DISCO,
      fragmentShader: FRAG_DISCO,
      uniforms: { uMapa: { value: alvo.texture }, uAlfa: { value: 1 } },
      transparent: true,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const plano = new THREE.Mesh(new THREE.PlaneGeometry(S * 2, S * 2), this.discoMat);
    plano.rotation.x = -Math.PI / 2;
    this.galaxiaGiro.add(plano);

    const pontosDeEstrela = pontos(estrelas, true);
    this.galaxiaMat = pontosDeEstrela.material as THREE.ShaderMaterial;
    this.galaxiaEstrelas = pontosDeEstrela.geometry;
    this.galaxiaGiro.add(pontosDeEstrela);
  }

  dimensionar(largura: number, altura: number) {
    this.largura = largura;
    this.altura = altura;
    // DPR baixo de propósito, e `reduzir` baixa mais se o aparelho não segurar.
    this.dpr = Math.min(window.devicePixelRatio || 1, this.dprMax);
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
    if (this.galaxiaMat) {
      this.galaxiaMat.uniforms.uEscala.value = escala;
      this.galaxiaMat.uniforms.uMaximo.value = 40 * this.dpr;
    }
    this.telaMat.uniforms.uRes.value.set(largura * this.dpr, altura * this.dpr);
    this.estrelasMat.uniforms.uDpr.value = this.dpr;
  }

  /**
   * O aparelho não está segurando: um degrau abaixo na resolução e, no último
   * degrau, metade das estrelas da galáxia. Devolve `false` quando não há mais
   * o que cortar.
   */
  reduzir() {
    if (this.dprMax > 0.75) {
      this.dprMax = Math.max(0.75, this.dprMax - 0.25);
      this.dimensionar(this.largura, this.altura);
      return true;
    }
    if (this.galaxiaEstrelas && this.galaxiaEstrelas.drawRange.count === Infinity) {
      this.galaxiaEstrelas.setDrawRange(0, Math.floor(this.galaxiaEstrelas.attributes.position.count / 2));
      return true;
    }
    return false;
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

    // Projeções para as etiquetas dos planetas, só na cena que as mostra.
    if (E.rotulos > 0.001) {
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
    }

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
      if (this.galaxiaMat) this.galaxiaMat.uniforms.uAlfa.value = aGalaxia;
      // O disco pintado borra de perto: sai antes, e quem assume são as estrelas.
      if (this.discoMat) {
        this.discoMat.uniforms.uAlfa.value = 1 - THREE.MathUtils.smoothstep(z, 0.3, 0.68);
      }
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

    // O nome: as estrelas se juntam ao carregar e fogem no começo do zoom.
    if (this.nomeInicio < 0) this.nomeInicio = tempo;
    const nome = this.nomeMat.uniforms;
    nome.uForma.value = Math.min(1, (tempo - this.nomeInicio) / 2.8);
    nome.uFuga.value = THREE.MathUtils.smoothstep(z, 0, 0.2);
    nome.uTempo.value = tempo;

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
    if (!E.linear && nome.uFuga.value < 0.999) this.renderer.render(this.nomeCena, this.telaCam);
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
    this.nomeCena.traverse((obj) => {
      const malha = obj as THREE.Points;
      malha.geometry?.dispose();
      (malha.material as THREE.Material | undefined)?.dispose();
    });
    for (const alvo of this.assados) alvo.dispose();
    this.telaMat.dispose();
    this.renderer.dispose();
  }
}
