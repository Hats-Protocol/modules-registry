import axios from "axios";
import { HatsModulesClient } from "@hatsprotocol/modules-sdk";
import { createPublicClient, createWalletClient, http } from "viem";
import { goerli } from "viem/chains";
import * as fs from "fs";
import type { PublicClient, WalletClient } from "viem";
import type { Registry } from "@hatsprotocol/modules-sdk";
import { createAnvil } from "@viem/anvil";
import type { Anvil } from "@viem/anvil";
import { z } from "zod";
import "dotenv/config";
import type { Module } from "@hatsprotocol/modules-sdk";
import { moduleSchema } from "../schema";

describe("Schema Validation Tests", () => {
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let hatsModulesClient: HatsModulesClient;
  let anvil: Anvil;
  let modules: { [id: string]: Module };

  beforeAll(async () => {
    anvil = createAnvil({
      forkUrl: process.env.GOERLI_RPC,
    });
    await anvil.start();

    // init Viem clients
    publicClient = createPublicClient({
      chain: goerli,
      transport: http("http://127.0.0.1:8545"),
    });
    walletClient = createWalletClient({
      chain: goerli,
      transport: http("http://127.0.0.1:8545"),
    });

    const modulesFile = new URL("../modules.json", import.meta.url);
    const data = fs.readFileSync(modulesFile, "utf-8");
    const registryModules: Registry = JSON.parse(data);

    hatsModulesClient = new HatsModulesClient({
      publicClient,
      walletClient,
    });

    await hatsModulesClient.prepare(registryModules);
    modules = await hatsModulesClient.getAllModules();
  }, 30000);

  afterAll(async () => {
    await anvil.stop();
  }, 30000);

  test("Test modules ABI", async () => {
    for (const [id, module] of Object.entries(modules)) {
      console.log(`module: ${module.name}`);
      const { data: etherscanAbi } = await axios.get(
        `https://api-goerli.etherscan.io/api?module=contract&action=getabi&address=${module.implementationAddress}&apikey=${process.env.ETHERSCAN_KEY}`,
      );

      if (etherscanAbi.res === 0) {
        console.log(etherscanAbi.message);
        throw new Error(`Module ${module.name} implementation is not verified`);
      }

      expect(JSON.stringify(module.abi)).toBe(
        JSON.stringify(JSON.parse(etherscanAbi.result)),
      );
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
});
