export interface TaskTypeHandler {
  readonly type: string;
  readonly maxStatus: number;
  validateStatusChange(
    toStatus: number,
    customFields: Record<string, unknown>,
  ): void;
  getFieldsForStatus(status: number): string[];
}
