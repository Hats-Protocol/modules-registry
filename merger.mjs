import * as fs from "fs";

export function mergeJson() {
  const final = {
    factory: undefined,
    eligibilitiesChain: undefined,
    togglesChain: undefined,
    modules: [],
  };

  const factoryBuffer = fs.readFileSync("./factory.json");
  const factory = JSON.parse(factoryBuffer);
  final.factory = factory;

  const eligibilitiesChainBuffer = fs.readFileSync("./eligibilitiesChain.json");
  const eligibilitiesChain = JSON.parse(eligibilitiesChainBuffer);
  final.eligibilitiesChain = eligibilitiesChain;

  const togglesChainBuffer = fs.readFileSync("./togglesChain.json");
  const togglesChain = JSON.parse(togglesChainBuffer);
  final.togglesChain = togglesChain;

  let moduleFiles = fs.readdirSync("modules");
  for (let i = 0; i < moduleFiles.length; i++) {
    const moduleFile = moduleFiles[i];
    const moduleBuffer = fs.readFileSync(`./modules/${moduleFile}`);
    const module = JSON.parse(moduleBuffer);
    final.modules.push(module);
  }

  fs.writeFileSync("modules.json", JSON.stringify(final));
}

mergeJson();
