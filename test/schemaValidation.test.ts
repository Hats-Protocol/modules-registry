import axios from "axios";
import { HatsModulesClient } from "@hatsprotocol/modules-sdk";
import { createPublicClient, createWalletClient, http } from "viem";
import { sepolia } from "viem/chains";
import { bundleModules } from "../bundler";
import { createAnvil } from "@viem/anvil";
import "dotenv/config";
import { moduleSchema } from "../schema";
import { RateLimit } from "async-sema";
import type { PublicClient, WalletClient } from "viem";
import type { Registry, Module } from "@hatsprotocol/modules-sdk";
import type { Anvil } from "@viem/anvil";

describe("Schema Validation Tests", () => {
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let hatsModulesClient: HatsModulesClient;
  let anvil: Anvil;
  let modules: { [id: string]: Module };

  beforeAll(async () => {
    anvil = createAnvil({
      forkUrl: process.env.SEPOLIA_RPC,
      startTimeout: 20000,
    });
    await anvil.start();

    // init Viem clients
    publicClient = createPublicClient({
      chain: sepolia,
      transport: http("http://127.0.0.1:8545"),
    });
    walletClient = createWalletClient({
      chain: sepolia,
      transport: http("http://127.0.0.1:8545"),
    });

    const registryModules: Registry = bundleModules() as unknown as Registry;

    hatsModulesClient = new HatsModulesClient({
      publicClient,
      walletClient,
    });

    await hatsModulesClient.prepare(registryModules);
    modules = await hatsModulesClient.getModules();
  }, 30000);

  afterAll(async () => {
    await anvil.stop();
  }, 30000);

  test("Test modules ABI", async () => {
    const lim = RateLimit(3);
    for (const [id, module] of Object.entries(modules)) {
      await lim();
      console.log(`module: ${module.name}`);
      const { data: etherscanAbi } = await axios.get(
        `https://api-sepolia.etherscan.io/api?module=contract&action=getabi&address=${module.implementationAddress}&apikey=${process.env.ETHERSCAN_KEY}`,
      );

      if (etherscanAbi.status === "0") {
        console.log(etherscanAbi.message);
        throw new Error(`Module ${module.name} implementation is not verified`);
      }

      if (
        JSON.stringify(module.abi) !==
        JSON.stringify(JSON.parse(etherscanAbi.result))
      ) {
        throw new Error(
          `Module ${module.name} ABI does not match the verified ABI`,
        );
      }
    }
  }, 30000);

  test("Test module schema", () => {
    for (const [id, module] of Object.entries(modules)) {
      const validationRes = moduleSchema.safeParse(module);
      if (validationRes.success === false) {
        console.log(validationRes.error.message);
        throw new Error(`Error: module ${module.name} schema validation error`);
      }
    }
  });

  test("Test module roles", () => {
    for (const [id, module] of Object.entries(modules)) {
      const customRoles = module.customRoles;
      const abi = module.abi;
      for (let i = 0; i < customRoles.length; i++) {
        const roleCreteria = customRoles[i].criteria;
        const criteriaExists = abi.find((item) => {
          if (item.type === "function" && item.name === roleCreteria) {
            return true;
          } else {
            return false;
          }
        });

        if (!criteriaExists) {
          throw new Error(
            `Error: module ${module.name} role criteria ${roleCreteria} does not exist in the ABI`,
          );
        }
      }
    }
  }, 30000);

  test("Test module write functions", () => {
    for (const [id, module] of Object.entries(modules)) {
      const moduleWriteFucntions = module.writeFunctions;
      const abi = module.abi;

      // check that each write function in the module object exists in the ABI
      for (let i = 0; i < moduleWriteFucntions.length; i++) {
        const writeFunction = moduleWriteFucntions[i];
        const functionExists = abi.some((item) => {
          if (
            item.type === "function" &&
            item.name === writeFunction.functionName &&
            item.inputs.length === writeFunction.args.length
          ) {
            for (
              let inputIndex = 0;
              inputIndex < item.inputs.length;
              inputIndex++
            ) {
              if (
                item.inputs[inputIndex].type !==
                writeFunction.args[inputIndex].type
              ) {
                return false;
              }
            }
            return true;
          } else {
            return false;
          }
        });

        if (!functionExists) {
          throw new Error(
            `Error: module ${module.name} write function ${writeFunction.functionName} does not exist in the ABI`,
          );
        }
      }

      // check that each write function in the ABI exists in the module object
      const abiWriteFunctions = abi.filter(
        (item) =>
          item.type === "function" &&
          item.stateMutability !== "view" &&
          item.stateMutability !== "pure",
      );
      for (let i = 0; i < abiWriteFunctions.length; i++) {
        const writeFunction = abiWriteFunctions[i];
        if (writeFunction.type === "function") {
          const functionExists = moduleWriteFucntions.some((item) => {
            if (
              writeFunction.type === "function" &&
              writeFunction.name === item.functionName &&
              writeFunction.inputs.length === item.args.length
            ) {
              for (
                let inputIndex = 0;
                inputIndex < item.args.length;
                inputIndex++
              ) {
                if (
                  item.args[inputIndex].type !==
                  writeFunction.inputs[inputIndex].type
                ) {
                  return false;
                }
              }
              return true;
            } else {
              return false;
            }
          });
          if (!functionExists && writeFunction.name !== "setUp") {
            throw new Error(
              `Error: module ${module.name} abi function ${writeFunction.name} does not exist in the module object`,
            );
          }
        }
      }
    }
  });
});
