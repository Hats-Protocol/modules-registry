# Hats Modules Registry

## Overview

A Hats Module is any contract that serves as an [Eligibility](https://docs.hatsprotocol.xyz/for-developers/hats-protocol-overview/eligibility-modules), [Toggle](https://docs.hatsprotocol.xyz/for-developers/hats-protocol-overview/toggle-modules) and/or a [Hatter](https://docs.hatsprotocol.xyz/for-developers/hats-protocol-overview/hat-admins-and-hatter-contracts#hatter-contracts) module.
Modules customize, automate and extend the behavior of Hats Protocol, and can also serve as adapters or integration points with other protocols and applications.

Hats Protocol is open and permission-less, and so anyone is free to use any compatible modules. But, only modules that are included in the registry are supported in the [Modules SDK](https://github.com/Hats-Protocol/modules-sdk) and get a native support in the [Hats App](https://app.hatsprotocol.xyz/).

## Add New Module

The registry is designed to support any existing module that inherits the [HatsModule contract](https://github.com/Hats-Protocol/hats-module/blob/main/src/HatsModule.sol).
For full documentation on how to build new Hats Modules, click [here](https://docs.hatsprotocol.xyz/for-developers/building-hats-modules).

For each module, the registry contains a JSON file with the following structure:

```json
{
  "name": "<module's name (string)>",
  "description": "<short description about the module (string)>",
  "github": {
    "owner": "<module's repository owner on github (string)>",
    "repo": "<module's repository name on github (string)>"
  },
  "type": {
    "eligibility": "<whether the module is an eligiblity module (boolean)>",
    "toggle": "<whether the module is a toggle module (boolean)>",
    "hatter": "<whether the module is a hatter module (boolean)>"
  },
  "implementationAddress": "<module's deployed implemenataion address (string)>",
  "deployments": [
    {
      "chainId": "<chain ID (string)>",
      "block": "<block number of the deployment transaction (string)>"
    }
  ],
  "args": {
    "immutable": [
      {
        "name": "<argument's name (string)>",
        "description": "<short description (string)>",
        "type": "<argument's solidity type, e.g. 'uint256' (string)>",
        "example": "<example argument which will be used for automatic testing>"
      }
    ],
    "mutable": [
      {
        "name": "<argument's name (string)>",
        "description": "<short description (string)>",
        "type": "<argument's solidity type, e.g. 'uint256' (string)>",
        "example": "<example argument which will be used for automatic testing>"
      }
    ]
  },
  "abi": "<module's contract ABI>"
}
```

(Note that arrays in the object above contain one example entry).

### Add your module's JSON file to the modules directory.

Here are some notes on its expected structure:

- The "name" and "description" properties should help users understand the module's functionality.
- The "github" property should point to the module's source code.
- There should be at least one field on the "type" property which is set to "true". A module might also serve as more than one type, in which case there will be more than one field set to "true".
- For each chain provided in "deployments", there should be a deployed implementation contract with an address matching the provided "implementationAddress" property and with an ABI
  matching the "abi" property.
- For both the immutable and mutable arguments, their order should match the order of the arguments as provided to the module.
- The "example" fields will be used to automatically test the module's deployment.

### Bundle

The modules in the registry are bundled into one file, which is then consumed by its users.

```bash
yarn bundle
```

### Test

```bash
yarn test
```

י
