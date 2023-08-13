import type { EligibilityModule, EligibilityFactory } from "./types";
import { factory } from "./factory/index";
import { jokerace } from "./jokerace/index";
import { staking } from "./staking/index";

const eligibilityModules: EligibilityModule[] = [jokerace, staking];

const eligibilityFactory = factory;

export { eligibilityModules, eligibilityFactory };

export type { EligibilityModule, EligibilityFactory };
