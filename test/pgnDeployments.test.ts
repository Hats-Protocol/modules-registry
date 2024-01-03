import {
  HatsModulesClient,
  solidityToTypescriptType,
} from "@hatsprotocol/modules-sdk";
import {
  createPublicClient,
  createWalletClient,
  http,
  defineChain,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { createAnvil } from "@viem/anvil";
import * as fs from "fs";
import type {
  PublicClient,
  WalletClient,
  PrivateKeyAccount,
  Address,
} from "viem";
import type { Anvil } from "@viem/anvil";
import type { Module, Registry } from "@hatsprotocol/modules-sdk";
import "dotenv/config";

export const pgn = defineChain({
  id: 424,
  name: "PGN",
  network: "pgn",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.publicgoods.network"],
    },
    public: {
      http: ["https://rpc.publicgoods.network"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://explorer.publicgoods.network/" },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 3380209,
    },
  },
});

describe("PGN deployments", () => {
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let hatsModulesClient: HatsModulesClient;
  let anvil: Anvil;
  let deployerAccount: PrivateKeyAccount;
  let instances: Address[] = [];

  beforeAll(async () => {
    anvil = createAnvil({
      forkUrl: process.env.PGN_RPC,
      startTimeout: 30000,
    });
    await anvil.start();

    deployerAccount = privateKeyToAccount(
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    );

    // init Viem clients
    //publicClient = createPublicClient({
    //  chain: pgn,
    //  transport: http("http://127.0.0.1:8545"),
    //}) as PublicClient;
    //walletClient = createWalletClient({
    //  chain: pgn,
    //  transport: http("http://127.0.0.1:8545"),
    //});
    //
    //const modulesFile = new URL("../modules.json", import.meta.url);
    //const data = fs.readFileSync(modulesFile, "utf-8");
    //const registryModules: Registry = JSON.parse(data);
    //
    //hatsModulesClient = new HatsModulesClient({
    //  publicClient,
    //  walletClient,
    //});
    //
    //await hatsModulesClient.prepare(registryModules);
  }, 30000);

  afterAll(async () => {
    await anvil.stop();
  }, 50000);

  test("Test create all modules", async () => {
    const modules = hatsModulesClient.getAllModules();

    // create new module instance for each module which is deployed on goerli
    for (const [id, module] of Object.entries(modules)) {
      console.log(`Testing module: ${module.name}`);
      if (module.name === "JokeRace Eligibility") {
        continue;
      }
      // check if module is deployed on goerli. If not, then skip
      let isOnPgn = false;
      for (let i = 0; i < module.deployments.length; i++) {
        if (module.deployments[i].chainId === "424") {
          isOnPgn = true;
          break;
        }
      }
      if (!isOnPgn) {
        continue;
      }

      const hatId = module.creationArgs.useHatId
        ? BigInt(
            "0x0000000100000000000000000000000000000000000000000000000000000000",
          )
        : BigInt("0");
      const immutableArgs: unknown[] = [];
      const mutableArgs: unknown[] = [];

      // prepare immutable args
      for (let i = 0; i < module.creationArgs.immutable.length; i++) {
        let arg: unknown;
        const exampleArg = module.creationArgs.immutable[i].example;
        const tsType = solidityToTypescriptType(
          module.creationArgs.immutable[i].type,
        );
        if (tsType === "bigint") {
          arg = BigInt(exampleArg as string);
        } else if (tsType === "bigint[]") {
          arg = (exampleArg as Array<string>).map((val) => BigInt(val));
        } else {
          arg = exampleArg;
        }

        immutableArgs.push(arg);
      }

      // prepare mutable args
      for (let i = 0; i < module.creationArgs.mutable.length; i++) {
        let arg: unknown;
        const exampleArg = module.creationArgs.mutable[i].example;
        const tsType = solidityToTypescriptType(
          module.creationArgs.mutable[i].type,
        );
        if (tsType === "bigint") {
          arg = BigInt(exampleArg as string);
        } else if (tsType === "bigint[]") {
          arg = (exampleArg as Array<string>).map((val) => BigInt(val));
        } else {
          arg = exampleArg;
        }

        mutableArgs.push(arg);
      }

      // create new module instance
      const res = await hatsModulesClient.createNewInstance({
        account: deployerAccount,
        moduleId: id,
        hatId: hatId,
        immutableArgs: immutableArgs,
        mutableArgs: mutableArgs,
      });

      instances.push(res.newInstance);

      // check correct hat Id in the new instance
      const hatIdResult = await publicClient.readContract({
        address: res.newInstance as Address,
        abi: module.abi,
        functionName: "hatId",
        args: [],
      });
      expect(hatIdResult).toBe(hatId);
    }
  }, 30000);

  test("Test module parameters", async () => {
    for (let i = 0; i < instances.length; i++) {
      let instance = instances[i];

      const module = await hatsModulesClient.getModuleByInstance(instance);
      const res = await hatsModulesClient.getInstanceParameters(instance);

      if (res === undefined || res.length !== module?.parameters.length) {
        throw new Error(
          "Error: could not read all the module's parameters from the instance",
        );
      }
    }
  }, 30000);
});
