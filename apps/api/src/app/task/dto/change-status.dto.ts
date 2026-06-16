import { IsInt, IsObject, IsPositive } from 'class-validator';

export class ChangeStatusDto {
  @IsInt()
  @IsPositive()
  toStatus!: number;

  @IsInt()
  @IsPositive()
  nextAssignedTo!: number;

  @IsObject()
  customFields!: Record<string, unknown>;
}
