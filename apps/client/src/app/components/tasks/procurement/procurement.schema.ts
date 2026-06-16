import { z } from 'zod';

const positiveNumericString = z
  .string()
  .trim()
  .refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
    message: 'Must be a positive number',
  });

export const procurementSchemas: Partial<Record<number, z.ZodTypeAny>> = {
  2: z.object({
    priceQuotes: z
      .array(positiveNumericString)
      .min(2, 'At least 2 price quotes required'),
  }),
  3: z.object({
    receipt: z.string().trim().min(1, 'Receipt is required'),
  }),
};
