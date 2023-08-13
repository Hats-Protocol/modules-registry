export const abi = [
  {
    inputs: [
      { internalType: "contract IHats", name: "_hats", type: "address" },
      { internalType: "string", name: "_version", type: "string" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      { internalType: "address", name: "implementation", type: "address" },
      { internalType: "uint256", name: "hatId", type: "uint256" },
      { internalType: "bytes", name: "otherImmutableArgs", type: "bytes" },
    ],
    name: "HatsModuleFactory_ModuleAlreadyDeployed",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "implementation",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "instance",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "hatId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "otherImmutableArgs",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "initData",
        type: "bytes",
      },
    ],
    name: "HatsModuleFactory_ModuleDeployed",
    type: "event",
  },
  {
    inputs: [],
    name: "HATS",
    outputs: [{ internalType: "contract IHats", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_implementation", type: "address" },
      { internalType: "uint256", name: "_hatId", type: "uint256" },
      { internalType: "bytes", name: "_otherImmutableArgs", type: "bytes" },
      { internalType: "bytes", name: "_initData", type: "bytes" },
    ],
    name: "createHatsModule",
    outputs: [{ internalType: "address", name: "_instance", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_implementation", type: "address" },
      { internalType: "uint256", name: "_hatId", type: "uint256" },
      { internalType: "bytes", name: "_otherImmutableArgs", type: "bytes" },
    ],
    name: "deployed",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_implementation", type: "address" },
      { internalType: "uint256", name: "_hatId", type: "uint256" },
      { internalType: "bytes", name: "_otherImmutableArgs", type: "bytes" },
    ],
    name: "getHatsModuleAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
