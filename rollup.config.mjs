import typescript from "rollup-plugin-typescript2";
import json from "@rollup/plugin-json";
import pkg from "./package.json" assert { type: "json" };

const input = "src/index.ts";
const external = [...Object.keys(pkg.dependencies || {})];

export default [
  {
    input,
    external,
    output: [
      { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "es" },
    ],
    plugins: [json(), typescript({ clean: true })],
  },
];
