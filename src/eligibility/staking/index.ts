import * as info from "./info.json";
import { abi } from "./abi";
import type { EligibilityModule } from "../types";

const staking: EligibilityModule = {
  moduleInfo: info,
  moduleAbi: abi,
};

export { staking };
