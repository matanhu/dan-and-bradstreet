import { z } from 'zod';

export const developmentSchemas: Partial<Record<number, z.ZodTypeAny>> = {
  2: z.object({
    specification: z.string().trim().min(1, 'Specification is required'),
  }),
  3: z.object({
    branchName: z.string().trim().min(1, 'Branch name is required'),
  }),
  4: z.object({
    version: z
      .string()
      .trim()
      .regex(/^\d+\.\d+\.\d+$/, 'Version must be in semver format (e.g. 1.0.0)'),
  }),
};
