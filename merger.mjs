import * as fs from "fs";

export function mergeJson() {
  const final = [];

  const factoryBuffer = fs.readFileSync("./factory.json");
  const factory = JSON.parse(factoryBuffer);
  final.push(factory);

  let moduleFiles = fs.readdirSync("modules");
  for (let i = 0; i < moduleFiles.length; i++) {
    const moduleFile = moduleFiles[i];
    const moduleBuffer = fs.readFileSync(`./modules/${moduleFile}`);
    const module = JSON.parse(moduleBuffer);
    final.push(module);
  }

  fs.writeFileSync("modules.json", JSON.stringify(final));
}

mergeJson();
