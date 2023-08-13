import * as info from "./info.json";
import { abi } from "./abi";
import type { EligibilityModule } from "../types";

const jokerace: EligibilityModule = {
  moduleInfo: info,
  moduleAbi: abi,
};

export { jokerace };
