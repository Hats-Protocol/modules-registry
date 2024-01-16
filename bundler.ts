import * as fs from "fs";

export function bundleModules() {
  const factoryBuffer = fs.readFileSync("./infra/factory.json");
  const factory = JSON.parse(factoryBuffer.toString());

  const eligibilitiesChainBuffer = fs.readFileSync(
    "./infra/eligibilitiesChain.json",
  );
  const eligibilitiesChain = JSON.parse(eligibilitiesChainBuffer.toString());

  const togglesChainBuffer = fs.readFileSync("./infra/togglesChain.json");
  const togglesChain = JSON.parse(togglesChainBuffer.toString());

  let moduleFiles = fs.readdirSync("modules");
  const modules = [];
  for (let i = 0; i < moduleFiles.length; i++) {
    const moduleFile = moduleFiles[i];
    const moduleBuffer = fs.readFileSync(`./modules/${moduleFile}`);
    const module = JSON.parse(moduleBuffer.toString());
    modules.push(module);
  }

  return {
    factory,
    eligibilitiesChain,
    togglesChain,
    modules,
  };
}
