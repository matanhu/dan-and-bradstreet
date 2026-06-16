export const TASK_ERRORS = {
  TASK_ALREADY_CLOSED: 'Task already closed',
  TASK_MUST_BE_AT_FINAL_STATUS: (status: number) =>
    `Task must be at status ${status} to close`,
  STATUS_MUST_BE_POSITIVE: 'Status must be >= 1',
  FORWARD_MOVES_MUST_BE_SEQUENTIAL: 'Forward moves must be sequential',
  BACKWARD_MOVES_MUST_BE_SEQUENTIAL: 'Backward moves must be sequential',
  TASK_MODIFIED_CONCURRENTLY:
    'Task was modified by another user. Please refresh.',
  FAILED_UPDATE_TASK_STATUS: 'Failed to update task status',
};
