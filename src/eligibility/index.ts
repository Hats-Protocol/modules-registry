import * as jokerace from "./jokerace/info.json";
import * as staking from "./staking/info.json"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const eligibilityModules: {[key: string]: any} = {
    "jokerace": jokerace,
    "staking": staking,
}


export {eligibilityModules};
