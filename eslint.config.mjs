import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/** eslint-config-next 16 já exporta flat config: nada de FlatCompat aqui. */
const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts", "public/**", "legacy/**"],
  },
  ...coreWebVitals,
  ...nextTypescript,
];

export default eslintConfig;
