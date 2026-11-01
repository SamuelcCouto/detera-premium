/**
 * Shaders da missão. Ruído de valor com hash, não simplex: a cena tem planetas,
 * núcleo, céu e a camada de atmosfera, todos com fbm, e o de valor custa
 * menos no celular sem diferença visível nessa escala.
 */

const RUIDO_3D = /* glsl */ `
float hash3(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float ruido3(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash3(i), hash3(i + vec3(1, 0, 0)), f.x),
        mix(hash3(i + vec3(0, 1, 0)), hash3(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash3(i + vec3(0, 0, 1)), hash3(i + vec3(1, 0, 1)), f.x),
        mix(hash3(i + vec3(0, 1, 1)), hash3(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}
float fbm3(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < OITAVAS; i++) {
    v += a * ruido3(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}
`;

const RUIDO_2D = /* glsl */ `
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float ruido2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1, 0)), f.x),
             mix(hash21(i + vec2(0, 1)), hash21(i + vec2(1, 1)), f.x), f.y);
}
float fbm2(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < OITAVAS; i++) {
    v += a * ruido2(p);
    p = p * 2.02 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}
`;

export const comOitavas = (fonte: string, oitavas: number) =>
  `#define OITAVAS ${oitavas}\n${fonte}`;

/* ------------------------------------------------------------------ */

export const VERT_ESFERA = /* glsl */ `
varying vec3 vN;
varying vec3 vP;
varying vec3 vO;
void main() {
  vO = normalize(position);
  vec4 mundo = modelMatrix * vec4(position, 1.0);
  vP = mundo.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * mundo;
}
`;

/** Planeta: o núcleo (a estrela) está na origem, então a luz vem de `-vP`. */
export const FRAG_PLANETA = /* glsl */ `
uniform vec3 uCorA;
uniform vec3 uCorB;
uniform vec3 uCorC;
uniform vec3 uAtm;
uniform float uTipo;
uniform float uTempo;
uniform float uSemente;
varying vec3 vN;
varying vec3 vP;
varying vec3 vO;
${RUIDO_3D}
void main() {
  vec3 N = normalize(vN);
  vec3 L = normalize(-vP);
  vec3 V = normalize(cameraPosition - vP);
  vec3 o = vO + uSemente;
  vec3 cor;

  if (uTipo < 0.5) {
    // Dunas cor de ferrugem.
    float n = fbm3(o * 3.0);
    float d = fbm3(o * 5.0 + n * 2.0);
    cor = mix(uCorA, uCorB, smoothstep(0.32, 0.68, d));
    cor = mix(cor, uCorC, smoothstep(0.66, 0.84, n) * 0.8);
  } else if (uTipo < 1.5) {
    // Gigante de gás: faixas tortas pelo ruído.
    float y = vO.y * 9.0 + fbm3(o * vec3(2.0, 7.0, 2.0) + vec3(uTempo * 0.012, 0.0, 0.0)) * 2.6;
    float faixa = sin(y) * 0.5 + 0.5;
    cor = mix(uCorA, uCorB, faixa);
    cor = mix(cor, uCorC, smoothstep(0.55, 1.0, sin(y * 2.3 + 1.0) * 0.5 + 0.5) * 0.55);
  } else if (uTipo < 2.5) {
    // Gelo, com luzes de cidade no lado escuro.
    float g = fbm3(o * 4.5);
    cor = mix(uCorA, uCorB, smoothstep(0.3, 0.74, g));
  } else {
    // Oceano, continentes e nuvens.
    float c = fbm3(o * 2.4);
    cor = c > 0.56 ? mix(uCorC * 0.8, uCorC, (c - 0.56) * 3.0) : mix(uCorA, uCorB, c * 1.6);
    float nv = fbm3(o * 4.0 + vec3(uTempo * 0.015, 0.0, 0.0));
    cor = mix(cor, vec3(0.88, 0.92, 1.0), smoothstep(0.56, 0.8, nv) * 0.7);
  }

  float luz = dot(N, L);
  float dif = max(luz, 0.0);
  float dia = smoothstep(-0.08, 0.32, luz);
  vec3 cena = cor * (0.035 + 1.15 * dif);

  if (uTipo > 1.5 && uTipo < 2.5) {
    vec3 q = vO * 70.0;
    float h = hash3(floor(q));
    float cidade = step(0.9, h) * smoothstep(0.42, 0.66, fbm3(o * 3.0));
    cena += vec3(1.0, 0.36, 0.26) * cidade * (1.0 - dia) * 1.4;
  }

  float fr = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  cena += uAtm * fr * (0.08 + 1.1 * dia);
  gl_FragColor = vec4(cena, 1.0);
}
`;

/** Halo de atmosfera: casca um pouco maior, lado de dentro, soma de luz. */
export const VERT_HALO = /* glsl */ `
varying float vI;
varying float vDia;
void main() {
  vec3 nv = normalize(normalMatrix * normal);
  vI = pow(clamp(0.74 - dot(nv, vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 3.2);
  vec4 mundo = modelMatrix * vec4(position, 1.0);
  vec3 nm = normalize(mat3(modelMatrix) * normal);
  vDia = smoothstep(-0.35, 0.4, dot(-nm, normalize(-mundo.xyz)));
  gl_Position = projectionMatrix * viewMatrix * mundo;
}
`;

export const FRAG_HALO = /* glsl */ `
uniform vec3 uAtm;
uniform float uForca;
varying float vI;
varying float vDia;
void main() {
  gl_FragColor = vec4(uAtm * vI * (0.25 + vDia) * uForca, 1.0);
}
`;

/** O núcleo: superfície que ferve devagar, borda mais quente. */
export const FRAG_NUCLEO = /* glsl */ `
uniform float uTempo;
varying vec3 vN;
varying vec3 vP;
varying vec3 vO;
${RUIDO_3D}
void main() {
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vP);
  float n = fbm3(vO * 3.2 + vec3(0.0, uTempo * 0.05, 0.0));
  float n2 = fbm3(vO * 9.0 - vec3(uTempo * 0.11, 0.0, uTempo * 0.07));
  vec3 cor = mix(vec3(0.42, 0.03, 0.05), vec3(1.0, 0.23, 0.23), smoothstep(0.25, 0.75, n));
  cor = mix(cor, vec3(1.0, 0.7, 0.42), smoothstep(0.58, 0.82, n2) * 0.85);
  float centro = max(dot(N, V), 0.0);
  cor *= 0.55 + 0.6 * pow(centro, 0.6);
  cor += vec3(1.0, 0.38, 0.28) * pow(1.0 - centro, 2.2) * 0.9;
  gl_FragColor = vec4(cor, 1.0);
}
`;

/** O céu de fundo: nebulosas frias e uma mancha de poeira cor de ferrugem, bem baixas. */
export const VERT_CEU = /* glsl */ `
varying vec3 vD;
void main() {
  vD = normalize(position);
  vec4 p = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;
}
`;

export const FRAG_CEU = /* glsl */ `
varying vec3 vD;
${RUIDO_3D}
void main() {
  float n = fbm3(vD * 2.2);
  float m = fbm3(vD * 5.0 + n * 1.5);
  vec3 base = vec3(0.012, 0.022, 0.05);
  vec3 neb = mix(vec3(0.02, 0.07, 0.11), vec3(0.06, 0.1, 0.2), m);
  float mascara = smoothstep(0.45, 0.8, n) * 0.55;
  vec3 cor = mix(base, neb, mascara);
  float poeira = smoothstep(0.6, 0.85, fbm3(vD * 3.1 + 4.0)) * smoothstep(-0.2, 0.4, vD.y);
  cor += vec3(0.16, 0.05, 0.03) * poeira * 0.35;
  gl_FragColor = vec4(cor, 1.0);
}
`;

/* ------------------------------------------------------------------ */

export const VERT_ESTRELAS = /* glsl */ `
attribute float aTam;
attribute float aFase;
attribute vec3 aCor;
uniform float uTempo;
uniform float uDpr;
varying vec3 vCor;
varying float vBrilho;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float pisca = 0.72 + 0.28 * sin(uTempo * (0.6 + aFase * 1.8) + aFase * 40.0);
  vBrilho = pisca;
  vCor = aCor;
  gl_PointSize = clamp(aTam * uDpr * (260.0 / -mv.z), 1.0, 6.0 * uDpr);
}
`;

export const FRAG_ESTRELAS = /* glsl */ `
varying vec3 vCor;
varying float vBrilho;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(vCor * vBrilho * a, a);
}
`;

/* ------------------------------------------------------------------ */

export const VERT_TELA = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/**
 * A camada de atmosfera, desenhada por cima da cena 3D numa passada só:
 * céu da descida e do crepúsculo, nuvens, relevo em três planos, plasma nas
 * bordas, rastros verticais e o rastro radial da chegada. A cor sai
 * pré-multiplicada: o céu cobre a cena na proporção de `uAtmos`, e o que é
 * luz (plasma, rastros) só soma.
 */
export const FRAG_TELA = /* glsl */ `
uniform vec2 uRes;
uniform float uTempo;
uniform float uAtmos;
uniform float uCeu;
uniform float uPlasma;
uniform float uNuvens;
uniform float uRelevo;
uniform float uRelevoX;
uniform float uRastro;
uniform float uSentido;
uniform float uRadial;
uniform vec2 uTremor;
varying vec2 vUv;
${RUIDO_2D}

float crista(float x, float base, float amp, float semente) {
  return base + (fbm2(vec2(x, semente)) - 0.5) * 2.0 * amp;
}

void main() {
  vec2 uv = vUv + uTremor;
  float asp = uRes.x / uRes.y;
  vec2 p = vec2((uv.x - 0.5) * asp, uv.y - 0.5);
  vec3 cor = vec3(0.0);
  float alfa = 0.0;

  if (uAtmos > 0.001) {
    float r = length(p);
    vec3 descida = mix(vec3(0.1, 0.24, 0.62), vec3(0.012, 0.03, 0.1), smoothstep(0.0, 0.95, r));

    float h = uv.y;
    vec3 crep = mix(vec3(0.94, 0.5, 0.27), vec3(0.15, 0.21, 0.44), smoothstep(0.27, 0.6, h));
    crep = mix(crep, vec3(0.025, 0.05, 0.13), smoothstep(0.58, 1.0, h));
    vec2 sol = vec2(0.5 - uRelevoX * 0.05, 0.3);
    float ds = length((uv - sol) * vec2(asp, 1.0));
    crep += vec3(1.0, 0.6, 0.33) * exp(-ds * 8.0) * 0.8;
    crep += vec3(1.0, 0.86, 0.62) * smoothstep(0.034, 0.024, ds);
    vec2 g = uv * vec2(asp, 1.0) * 85.0;
    float hs = hash21(floor(g));
    float estrela = step(0.986, hs) * smoothstep(0.6, 0.95, h) * smoothstep(0.18, 0.05, length(fract(g) - 0.5));
    crep += vec3(estrela) * 0.85;

    vec3 base = mix(descida, crep, uCeu);

    if (uNuvens > 0.001) {
      vec2 q = vec2(p.x * 1.5, p.y * 1.5 - uTempo * 0.5);
      float c = fbm2(q * 2.1);
      float m = smoothstep(0.4, 0.74, c) * uNuvens;
      vec3 nuvem = mix(vec3(0.7, 0.77, 0.92), vec3(1.0, 0.78, 0.64), uCeu);
      base = mix(base, nuvem * (0.6 + 0.4 * c), m * 0.88);
    }

    if (uRelevo > 0.001) {
      float desce = (1.0 - uRelevo) * 0.45;
      float x = uv.x * asp;
      float longe = crista(x * 1.6 + uRelevoX * 0.35, 0.3, 0.06, 2.3) - desce;
      float meio = crista(x * 2.4 + uRelevoX * 0.8 + 5.0, 0.21, 0.07, 6.1) - desce;
      float perto = crista(x * 3.4 + uRelevoX * 1.6 + 11.0, 0.11, 0.08, 9.7) - desce;
      vec3 bruma = mix(vec3(0.94, 0.5, 0.27), vec3(0.15, 0.21, 0.44), 0.55);
      if (uv.y < longe) base = mix(bruma, vec3(0.08, 0.09, 0.2), 0.55);
      if (uv.y < meio) base = vec3(0.045, 0.055, 0.12);
      if (uv.y < perto) base = vec3(0.018, 0.026, 0.06);
    }

    cor = base * uAtmos;
    alfa = uAtmos;
  }

  if (uPlasma > 0.001) {
    // O plasma substitui a cor nas bordas em vez de somar: somado sobre o
    // azul ele estourava para um rosa-creme lavado.
    float borda = max(abs(p.x) / (asp * 0.5), abs(p.y) / 0.5);
    float chama = fbm2(vec2(atan(p.y, p.x) * 3.0, length(p) * 4.0 - uTempo * 3.2));
    float e = smoothstep(0.6, 1.1, borda + chama * 0.32);
    vec3 pc = mix(vec3(0.82, 0.1, 0.08), vec3(1.0, 0.42, 0.13), chama);
    pc = mix(pc, vec3(1.0, 0.74, 0.42), smoothstep(1.02, 1.25, borda + chama * 0.3));
    float k = e * uPlasma;
    cor = cor * (1.0 - k * 0.75) + pc * k * 0.95;
    cor += vec3(0.22, 0.02, 0.02) * uPlasma * 0.35 * alfa;
    alfa = max(alfa, k * 0.9);
  }

  if (uRastro > 0.001) {
    float colunas = 96.0;
    float cx = floor(uv.x * colunas);
    float hc = hash21(vec2(cx, 3.1));
    float vel = 0.7 + hc * 1.6;
    float fase = hash21(vec2(cx, 7.7));
    float y = fract(uv.y * 0.65 - uTempo * vel * uSentido * 0.9 + fase);
    float cabeca = uSentido > 0.0 ? y : 1.0 - y;
    float risco = smoothstep(0.8, 0.99, cabeca) * (1.0 - step(0.995, cabeca));
    float largura = 1.0 - smoothstep(0.0, 0.09, abs(fract(uv.x * colunas) - 0.5));
    float k = risco * largura * step(0.5, hc) * uRastro;
    vec3 rc = mix(vec3(0.72, 0.84, 1.0), vec3(1.0, 0.56, 0.3), clamp(uPlasma, 0.0, 1.0));
    cor += rc * k;
    alfa = max(alfa, k * 0.8);
  }

  if (uRadial > 0.001) {
    float ang = atan(p.y, p.x);
    float raios = 180.0;
    float a = (ang + 3.14159) / 6.28318 * raios;
    float h = hash21(vec2(floor(a), 1.3));
    float rr = length(p);
    float f = fract(rr * 1.1 - uTempo * (0.9 + h * 1.6) + h);
    float k = smoothstep(0.7, 1.0, f) * step(0.55, h);
    k *= 1.0 - smoothstep(0.0, 0.14, abs(fract(a) - 0.5));
    k *= smoothstep(0.04, 0.32, rr) * uRadial;
    cor += vec3(0.8, 0.88, 1.0) * k;
    alfa = max(alfa, k * 0.8);
  }

  gl_FragColor = vec4(cor, alfa);
}
`;
