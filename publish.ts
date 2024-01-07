import { bundleModules } from "./bundler";
import * as fs from "fs";

export function updateBundle() {
  const bundledModules = bundleModules();
  fs.writeFileSync("modules.json", JSON.stringify(bundledModules));
}

updateBundle();
