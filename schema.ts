import { z } from "zod";

const moduleCreationArgSchema = z
  .object({
    name: z.string(),
    description: z.string(),
    type: z.string(),
    example: z.any(),
    displayType: z.string(),
    optional: z.boolean().optional(),
  })
  .strict();

const moduleWriteFunctionArgSchema = z
  .object({
    name: z.string(),
    description: z.string(),
    type: z.string(),
    displayType: z.string(),
    optional: z.boolean().optional(),
  })
  .strict();

const moduleRoleSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    criteria: z.string().nullable(),
    hatAdminsFallback: z.boolean().optional(),
  })
  .strict();

const moduleWriteFunctionSchema = z
  .object({
    roles: z.array(z.string()),
    functionName: z.string(),
    label: z.string(),
    description: z.string(),
    primary: z.boolean().optional(),
    args: z.array(moduleWriteFunctionArgSchema),
  })
  .strict();

export const moduleSchema = z
  .object({
    deprecated: z.boolean().optional(),
    name: z.string(),
    details: z.array(z.string()),
    links: z.array(z.object({ label: z.string(), link: z.string() })),
    parameters: z.array(
      z.object({
        label: z.string(),
        functionName: z.string(),
        displayType: z.string(),
      }),
    ),
    type: z.object({
      eligibility: z.boolean(),
      toggle: z.boolean(),
      hatter: z.boolean(),
    }),
    implementationAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    deployments: z.array(z.object({ chainId: z.string(), block: z.string() })),
    creationArgs: z.object({
      useHatId: z.boolean(),
      immutable: z.array(moduleCreationArgSchema),
      mutable: z.array(moduleCreationArgSchema),
    }),
    customRoles: z.array(moduleRoleSchema),
    writeFunctions: z.array(moduleWriteFunctionSchema),
    abi: z.any(),
  })
  .strict();
