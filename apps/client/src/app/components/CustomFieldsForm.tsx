import { TaskType } from '../enums/task-type.enum';
import { ProcurementFieldsForm } from './tasks/procurement/ProcurementFieldsForm';
import { DevelopmentFieldsForm } from './tasks/development/DevelopmentFieldsForm';

interface Props {
  type: TaskType;
  toStatus: number;
  fields: Record<string, unknown>;
  onChange: (fields: Record<string, unknown>) => void;
}

export function CustomFieldsForm({ type, toStatus, fields, onChange }: Props) {
  if (type === TaskType.PROCUREMENT)
    return (
      <ProcurementFieldsForm
        toStatus={toStatus}
        fields={fields}
        onChange={onChange}
      />
    );

  if (type === TaskType.DEVELOPMENT)
    return (
      <DevelopmentFieldsForm
        toStatus={toStatus}
        fields={fields}
        onChange={onChange}
      />
    );

  return null;
}
