# Hats Modules Registry

## Overview

A Hats Module is any contract that serves as an [Eligibility](https://docs.hatsprotocol.xyz/for-developers/hats-protocol-overview/eligibility-modules), [Toggle](https://docs.hatsprotocol.xyz/for-developers/hats-protocol-overview/toggle-modules) and/or a [Hatter](https://docs.hatsprotocol.xyz/for-developers/hats-protocol-overview/hat-admins-and-hatter-contracts#hatter-contracts) module.
Modules customize, automate and extend the behavior of Hats Protocol, and can also serve as adapters or integration points with other protocols and applications.

Hats Protocol is open and permission-less, and so anyone is free to use any compatible modules. But, only modules that are included in the registry are supported in the [Modules SDK](https://github.com/Hats-Protocol/modules-sdk) and get a native support in the [Hats App](https://app.hatsprotocol.xyz/).

The registry is designed to support any existing module that inherits the [HatsModule contract](https://github.com/Hats-Protocol/hats-module/blob/main/src/HatsModule.sol).
For full documentation on how to build new Hats Modules, click [here](https://docs.hatsprotocol.xyz/for-developers/building-hats-modules).

## How To Add A New Module

### Step 1 - Add your module's JSON file to the modules directory.

For each module, the registry contains a JSON file with the following structure:

```json
{
  "name": "<module's name (string)>",
  "details": ["<first paragraph describing the module (string)>", "<second paragraph describing the module (string)>"],
  "links": [
  {
    "label": "<link's name/description (string)>",
    "link": "<link's URL (string)>"
  }
  ],
  "parameters": [
  {
    "label": "<parameter's name/description (string)>",
    "functionName": "<name of the function that will be used to retrieve the parameter from the module instance, should have no inputs and only one output (string)>",
    "displayType": "<parameter's type of content, for display purpose (string)>"
  },
  ]
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
  "creationArgs": {
    "useHatId": "<Whether the modules's hatId property (provide to the factory's creation function) should be set with the ID of the hat for which the module is deployed (boolean)>"
    "immutable": [
      {
        "name": "<argument's name (string)>",
        "description": "<short description (string)>",
        "type": "<argument's solidity type, e.g. 'uint256' (string)>",
        "example": "<example argument which will be used for automatic testing>",
        "displayType": "<parameter's type of content, for display purpose>",
        "optional": "<optional field, setting to 'true' indicates that this input is optional>"
      }
    ],
    "mutable": [
      {
        "name": "<argument's name (string)>",
        "description": "<short description (string)>",
        "type": "<argument's solidity type, e.g. 'uint256' (string)>",
        "example": "<example argument, will be used for automated deployment tests>",
        "displayType": "<parameter's type of content, for display purpose>",
        "optional": "<optional field, setting to 'true' indicates that this input is optional>"
      }
    ]
  },
  "customRoles": [
     {
        "id": "<role's ID (string)>",
        "name": "<role's name (string)>",
        "criteria": "<name of the module function that is used to retrieve the role's owner (string)>",
        "hatAdminsFallback": "<optional field, if 'true' then indicates that the role has a fallback to Hat's admin roles in case the criteria function returns a zero value>"
     }
  ],
  "writeFunctions": [
     {
        "roles": ["<ID of a role which has the authority to call this function (string)>"],
        "functionName": "<the function's name in the contract (string)>",
        "label": "<Human readable name for the function, for display purpose (string)>",
        "description": "<function's descruption (string)>",
        "primary": "<optional field, indicates that this is the role's primary function, for display purpose (boolean)>"
        "args": [
          {
            "name": "<argument's human readable name, for display purpose (string)>",
            "description": "<argument's description (string)>",
            "type": "<argument's solidity type>",
            "displayType": "<arguments's type of content, for display purpose>",
            "optional": "<optional field, setting to 'true' indicates that this input is optional>"
          }
        ]
     }
  ]
  "abi": "<module's contract ABI>"
}
```

_Note that arrays in the object above contain one example entry._

**Here are some useful notes about the expected module properties:**

#### `details`

Structured as an array of strings, each array entry represents a paragraph. The property's purpose is to conatain the module's description.

#### `links`

Property's purpose is to include any relevant links about this module and should have at least one link to the module's source code.

#### `parameters`

Used in order to dynamically fetch and display data from module instances. Using this property, the module creator can choose which module fields are relevant for display.

- `label` - Used to display the name/description of each parameter.
- `functionName` - Name of the function from which the parameter should be retrieved. The function should be a view/pure function with no inputs and only one output (an array is also considered as one output).
- `displayType` - A free-text field, used by frontends as an extra context in order to display a proper UI component for each parameter. For example, displaying a date for a parameter representing a timestamp. The known supported types are currently:
  - `default` - Infers automatically the UI component for the value.
  - `timestamp` - a value which represnts a Unix timestamp.
  - `hat` - A `uint256` value which represents a hat ID.
  - `token` - An `address` value of a token contract.
  - `seconds` -A value which represents time denominated in seconds.
  - `amountWithDecimals` - A value which represnts a token amount, allows for taking into account the token's decimals.

#### `type`

There should be at least one field which is set to `true`. A module might serve as more than one type.

#### `deployments`

For each chain provided, there should be a deployed implementation contract with an address matching the provided `implementationAddress` property.

#### `creationArgs`

- `useHatId` - By default, new instances are supposed to be created with their `hatId` value set with the target hat's ID. Setting this field to `false` indicates that the module should be created with the zero value in this field.
- In both the `immutable` and `mutable` array properties, the arguments order should match the order expected by the contract.
- The `example` fields will be used in automated tests to create a new instance of the module.

#### `customRoles`

The module's custom roles. Each module role is associated with a hat and permits its wearers certain authorities in a module instance (calling certain functions). There are two special roles with a reserved ID. First is the `public` role, which public write functions are associated with. Second is the `hatAdmins` role. Functions that are permitted to the target hat's admins are associated with this role.

- `id` - Role's ID, as a camel-case formatted string.
- `name` - Role's name, for display purpose.
- `criteria` - Name of the contract function which can be used to read the role's hat.
- `hatAdminsFallback` - An optional field. If set to `true`, indicates that when the `criteria` function of the role returns zero, then the role is granted to the target hat's admins.

#### `writeFunctions`

- `roles` - IDs of the roles that have the authority to call the function.
- `functionName` - Function's name in the contract.
- `label` - Function's name for display purpose.
- `description` - Function's description.
- `primary` - Optional field. If set to true, indicates that of all its role's functions, it is the primary one. Used for display purpose.
- `args` - Function's arguments, similar to the module creation arguments.

### Step 2 - Bundle

The modules in the registry are bundled into one file, which is then consumed by its users.

Run:

```bash
yarn bundle
```

### Step 3 - Test

Run:

```bash
yarn test
```

### Step 4 - Format

Run:

```bash
yarn prettier
```

י
