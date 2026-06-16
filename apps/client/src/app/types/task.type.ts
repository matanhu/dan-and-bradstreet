import { TaskType } from '../enums/task-type.enum';

export interface TaskHistory {
  id: number;
  fromStatus: number;
  toStatus: number;
  assignedTo: number;
  customFields: Record<string, unknown>;
  createdAt: string;
}

export interface Task {
  id: number;
  type: TaskType;
  status: number;
  isClosed: boolean;
  customFields: Record<string, unknown>;
  assignedTo: number;
  history: TaskHistory[];
}
