import { z } from 'zod';
import { TaskType } from '../../enums/task-type.enum';
import { procurementSchemas } from './procurement/procurement.schema';
import { developmentSchemas } from './development/development.schema';

const schemas: Record<TaskType, Partial<Record<number, z.ZodTypeAny>>> = {
  [TaskType.PROCUREMENT]: procurementSchemas,
  [TaskType.DEVELOPMENT]: developmentSchemas,
};

export function validateCustomFields(
  type: TaskType,
  toStatus: number,
  fields: Record<string, unknown>,
): boolean {
  const schema = schemas[type]?.[toStatus];
  if (!schema) return true;
  return schema.safeParse(fields).success;
}
