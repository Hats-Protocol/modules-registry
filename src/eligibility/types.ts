export type EligibilityModule = {
  moduleInfo: {
    name: string;
    description: string;
    github: {
      owner: string;
      repo: string;
    };
    deployments: {
      [key: string]: {
        address: string;
        block: string;
      };
    };
    args: {
      immutable: { name: string; description: string; type: string }[];
      mutable: { name: string; description: string; type: string }[];
    };
  };
  moduleAbi: any;
};

export type EligibilityFactory = {
  factoryInfo: {
    name: string;
    description: string;
    github: {
      owner: string;
      repo: string;
    };
    deployments: {
      [key: string]: {
        address: string;
        block: string;
      };
    };
  };
  factoryAbi: any;
};
