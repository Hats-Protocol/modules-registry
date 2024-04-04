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
      forkUrl: process.env.GOERLI_RPC,
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
