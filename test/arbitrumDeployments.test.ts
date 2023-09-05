import {
  HatsModulesClient,
  solidityToTypescriptType,
} from "@hatsprotocol/modules-sdk";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrum } from "viem/chains";
import { createAnvil } from "@viem/anvil";
import * as fs from "fs";
import type {
  PublicClient,
  WalletClient,
  PrivateKeyAccount,
  Address,
} from "viem";
import type { Anvil } from "@viem/anvil";
import type { Module } from "@hatsprotocol/modules-sdk";
import "dotenv/config";

describe("Arbitrum deployments", () => {
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let hatsModulesClient: HatsModulesClient;
  let anvil: Anvil;
  let deployerAccount: PrivateKeyAccount;

  beforeAll(async () => {
    anvil = createAnvil({
      forkUrl: process.env.GOERLI_RPC,
    });
    await anvil.start();

    deployerAccount = privateKeyToAccount(
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    );

    // init Viem clients
    publicClient = createPublicClient({
      chain: arbitrum,
      transport: http("http://127.0.0.1:8545"),
    });
    walletClient = createWalletClient({
      chain: arbitrum,
      transport: http("http://127.0.0.1:8545"),
    });

    const modulesFile = new URL("../modules.json", import.meta.url);
    const data = fs.readFileSync(modulesFile, "utf-8");
    const registryModules: Module[] = JSON.parse(data);

    hatsModulesClient = new HatsModulesClient({
      publicClient,
      walletClient,
      registryToken: "",
    });

    await hatsModulesClient.prepare(registryModules);
  }, 30000);

  afterAll(async () => {
    await anvil.stop();
  }, 30000);

  test("Test create all modules", async () => {
    const modules = hatsModulesClient.getAllModules();

    // create new module instance for each module which is deployed on goerli
    for (const [id, module] of Object.entries(modules)) {
      console.log(`Testing module: ${module.name}`);
      // check if module is deployed on goerli. If not, then skip
      let isOnArbitrum = false;
      for (let i = 0; i < module.deployments.length; i++) {
        if (module.deployments[i].chainId === "42161") {
          isOnArbitrum = true;
          break;
        }
      }
      if (!isOnArbitrum) {
        continue;
      }

      const hatId = BigInt(
        "0x0000000100000000000000000000000000000000000000000000000000000000",
      );
      const immutableArgs: unknown[] = [];
      const mutableArgs: unknown[] = [];

      // prepare immutable args
      for (let i = 0; i < module.args.immutable.length; i++) {
        let arg: unknown;
        const exampleArg = module.args.immutable[i].example;
        const tsType = solidityToTypescriptType(module.args.immutable[i].type);
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
      for (let i = 0; i < module.args.mutable.length; i++) {
        let arg: unknown;
        const exampleArg = module.args.mutable[i].example;
        const tsType = solidityToTypescriptType(module.args.mutable[i].type);
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
});