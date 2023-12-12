# Hats Modules Registry

- [Overview](#overview)
- [Module Registry Schema](#module-registry-schema)
- [Module Curation Rubric](#module-curation-rubric)
- [Curation Cadence](#curation-cadence)
- [How to Add a Module to the Registry](#how-to-add-a-new-module)

## Overview

A Hats Module is any contract that serves as an [Eligibility](https://docs.hatsprotocol.xyz/for-developers/hats-protocol-overview/eligibility-modules), [Toggle](https://docs.hatsprotocol.xyz/for-developers/hats-protocol-overview/toggle-modules) and/or a [Hatter](https://docs.hatsprotocol.xyz/for-developers/hats-protocol-overview/hat-admins-and-hatter-contracts#hatter-contracts) module.
Modules customize, automate and extend the behavior of Hats Protocol, and can also serve as adapters or integration points with other protocols and applications.

This registry is designed to make it easier for module developers to publish modules and for end users to discover and use modules. It is the primary data source for the [Modules SDK](https://github.com/Hats-Protocol/modules-sdk), which apps — such as the [Hats App](https://app.hatsprotocol.xyz/) — use to enable end users to deploy and interact with modules in a no-code way. Modules on the registry include metadata that is used by the SDK and apps to auto-generate UIs for module deployment and interaction.

The registry is designed to support any existing module that inherits the [HatsModule contract](https://github.com/Hats-Protocol/hats-module/blob/main/src/HatsModule.sol).
For full documentation on how to build new Hats Modules, click [here](https://docs.hatsprotocol.xyz/for-developers/building-hats-modules).

Note that Hats Protocol is open and permissionless. Modules do not need to be on this registry to be used with Hats Protocol. Inclusion in this registry is only necessary for modules wanting to be including natively in apps that have chosen to use the Modules SDK, such as the [Hats App](https://app.hatsprotocol.xyz/).

## Module Registry Schema

Each module in the registry is represented by JSON file with the a number of details and metadata properties. The JSON schema takes the following structure:

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

The exact schema is declared using the [ZOD](https://zod.dev/) library, which is also used for performing validation on each module in the registry. 
The source of truth for the full schema — specified in ZOD — can be found [here](./schema.ts).

### Schema Notes

#### `details`

An array of strings representing paragraphs that describe the module to end users.

#### `links`

Relevant links about this module go here. There should be at least one link to the module's source code — make sure the link is to the specific version of the module that is deployed to the registry, and to the correct branch in its repository. Other links can be added as well, such as to the module's documentation, or to other applications relevant to the module.

#### `parameters`

An array of parameters that represent the module's criteria and/or determine the behavior of its instances. Each parameter represents the function that can be called to dynamically fetch data from a module instance and display it to end users. Module creators can choose which parameters are relevant for display by including them in this array.

- `label` - The name of each parameter.
- `functionName` - The name of the view or pure function that gets the parameter value. The function should have no arguments and a single return value (an array is considered a single return value).
- `displayType` - A free-text field that tells front ends how to generate a proper UI component for the parameter. For example, displaying a date for a parameter representing a timestamp. 

Applications can define their own set of supported display types. The following are the display types known to be currently supported by applications:

  | Display Type         | Description                                                  |
  |----------------------|--------------------------------------------------------------|
  | `default`            | The basic solidity data type of the value         |
  | `timestamp`          | A value which represents a Unix timestamp.                    |
  | `hat`                | A `uint256` value which represents a hat ID.                  |
  | `token`              | The `address` of a token contract.                       |
  | `seconds`            | A value which represents time denominated in seconds.         |
  | `amountWithDecimals` | A value which represents a token amount, accounting for decimals. |


#### `type`

Flags for the type of module. At least one flag must be set to true. A module can serve as multiple types.

#### `deployments`

For each chain provided, an implementation contract of the module must be deployed to the address matching the provided `implementationAddress` property.

#### `creationArgs`

The arguments that are passed to the module factory's creation function. The arguments are divided into two arrays: `immutable` and `mutable`. The `immutable` array contains arguments that are set once when the module instance is created and cannot be changed. The `mutable` array contains arguments that can be changed after the module instance is created.

- `useHatId` - By default, new instances should be created with the `hatId` value set to the target hat's ID. A `false` value here indicates that the module's `hatId` value should be set to zero.
- In both the `immutable` and `mutable` array properties, the order of the arguments must match the order expected by the contract.
- The `example` values will be used in automated tests to ensure that a new instance of the module can be correctly deployed. These values do not necessarily need to be realistic, but they must enable the module to be deployed successfully by tests.

#### `customRoles`

The module's custom roles. Each module role is associated with a hat and grants permissions to the hat's wearer(s) to call certain functions on the module contract. 

There are two special roles with a reserved ID that are automatically added to each module:
1. `public` role, associated with functions that are permitted to any caller
2. `hatAdmins` role, associated with functions that are permitted to the target hat's admins

Each custom, non-reserved role must be in with the following properties:
- `id` - The role's ID, as a camel-case formatted string.
- `name` - The role's name, for display purpose.
- `criteria` - The name of the contract function which can be used to retrieve the role's hat.
- `hatAdminsFallback` - Optional. `true` indicates that the role is granted to the target hat's admin(s) if when the role's `criteria` function returns zero.

#### `writeFunctions`

The module's write functions. Each write function is associated with a role and grants permissions to the role's wearer(s) to call the function on the module contract.

- `roles` - IDs of the roles that have the authority to call the function.
- `functionName` - The name of the function in the contract.
- `label` - The name to be displayed to end users.
- `description` - A description of the function to be displayed to end users.
- `primary` - Optional. `true` indicates that this function is the primary function of the `roles` it is associated with. Front ends can use this information to display the function more prominently for each role.
- `args` - The arguments of the function, similar to the module creation arguments.

## Module Curation Rubric

[Curators](https://app.hatsprotocol.xyz/trees/10/1?hatId=1.2.4.4) should evaluate submissions to this registry according to the following criteria. Only modules that meet all criteria should be approved for the registry. Any module on the registry that no longer meets these criteria—eg due to a dependency change that breaks the module's functionality—is a candidate for removal.

> Version [0.1](https://forum.hatsprotocol.xyz/t/proposal-modules-registry-curation-v0-1/67)

| Category                             | Judgement Type | Criterion                                      |
|-------------------------------------|---|-----------------------------------------------|
| **Safety**                          | Objective | The module works as described; no bugs      |
|                                     |           | Is not malicious                            |
| **Schema Adherence** |                Objective | Metadata is complete |
|                                     | | Implementation contract is deployed to at least one chain |
| **Quality**                         | Objective  | Automated tests pass                        |
|                                     |  | Metadata (including name, descriptions, other documentation) is accurate |
| **User-Friendliness**                    | Subjective       | Metadata is legible and affords clarity to end users      |

## Curation Cadence

> Version [0.1](https://forum.hatsprotocol.xyz/t/proposal-modules-registry-curation-v0-1/67)

[Curators](https://app.hatsprotocol.xyz/trees/10/1?hatId=1.2.4.4) must review modules within the following cadence:

### Standard Cadence
* Monthly
* All newly approved modules and changes to registered modules are to be announced at the end of each month
* To be included in a given month, new submissions or changes must be submitted no later than one week before the end of the month
* Within this constraint, [Curators](https://app.hatsprotocol.xyz/trees/10/1?hatId=1.2.4.4) may review asynchronously or devise their own process and timing

### Expedited Cadence
* On an ad hoc basis, module developers may request review outside of the standard cadence. The most common method for such a request is to include it in the submission pull request.
* It is up to [Curator](https://app.hatsprotocol.xyz/trees/10/1?hatId=1.2.4.4) discretion for when and how quickly they honor requests for expedited review.

## How To Add A New Module

### Step 1 - Add your module's JSON file to the modules directory.

Following the [example JSON](#module-registry-schema) and existing modules, fill out the relevant details and metadata for your module and add the file to the [modules](./modules) directory. The name of the file should be the module's name in camelCase, with the `.json` extension.

Keep in mind that much of the metadata will be seen by end users in apps that use the registry, so make sure to be clear and concise.

### Step 2 - Bundle

Consumers of the modules registry do so from a single bundle, so new modules — or changes to existing modules — need to be added to the bundle.

Install dependencies:

```bash
yarn install
```

Then run:

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
