import * as fs from "fs";

export function bundleModules() {
  let moduleFiles = fs.readdirSync("modules");
  const modules = [];
  for (let i = 0; i < moduleFiles.length; i++) {
    const moduleFile = moduleFiles[i];
    const moduleBuffer = fs.readFileSync(`./modules/${moduleFile}`);
    const module = JSON.parse(moduleBuffer.toString());
    modules.push(module);
  }

  return {
    modules,
  };
}
