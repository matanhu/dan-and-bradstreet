import { IsEnum, IsInt, IsPositive } from 'class-validator';
import { TaskType } from '@org/data-access';

export class CreateTaskDto {
  @IsEnum(TaskType)
  type!: TaskType;

  @IsInt()
  @IsPositive()
  assignedTo!: number;
}
