import { useState } from 'react';
import { Task } from '../types/task.type';
import { useUsers } from '../hooks/useUsers';
import { useTaskConfig } from '../hooks/useTaskConfig';
import { useTaskMutations } from '../hooks/useTaskMutations';
import { CustomFieldsForm } from './CustomFieldsForm';
import { validateCustomFields } from './tasks/task-validation';

interface Props {
  task: Task;
  onClose: () => void;
  onUpdated: () => void;
}

export function TaskDetailPanel({ task, onClose, onUpdated }: Props) {
  const [nextUser, setNextUser] = useState(task.assignedTo);
  const [customFields, setCustomFields] = useState<Record<string, unknown>>(
    task.customFields || {},
  );
  const [error, setError] = useState<string | null>(null);
  const { changeStatus, close } = useTaskMutations();

  const { data: users = [] } = useUsers();
  const { data: config } = useTaskConfig();
  const maxStatus = config?.[task.type];
  const canAdvance = !task.isClosed && maxStatus !== undefined && task.status < maxStatus;
  const canReverse = !task.isClosed && task.status > 1;
  const canClose = !task.isClosed && maxStatus !== undefined && task.status === maxStatus;
  const canSubmitAdvance =
    canAdvance &&
    validateCustomFields(task.type, task.status + 1, customFields);

  const handleAdvance = () => {
    setError(null);
    changeStatus.mutate(
      {
        id: task.id,
        toStatus: task.status + 1,
        nextAssignedTo: nextUser,
        customFields,
      },
      { onSuccess: onUpdated, onError: (e) => setError(e.message) },
    );
  };

  const handleReverse = () => {
    setError(null);
    changeStatus.mutate(
      {
        id: task.id,
        toStatus: task.status - 1,
        nextAssignedTo: nextUser,
        customFields: {},
      },
      { onSuccess: onUpdated, onError: (e) => setError(e.message) },
    );
  };

  const handleClose = () => {
    setError(null);
    close.mutate(task.id, {
      onSuccess: onUpdated,
      onError: (e) => setError(e.message),
    });
  };

  return (
    <div className="bg-white border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-gray-700">
          Task <span className="font-mono">#{task.id}</span> —{' '}
          <span
            className={
              task.type === 'PROCUREMENT' ? 'text-purple-600' : 'text-blue-600'
            }
          >
            {task.type}
          </span>{' '}
          · Status {task.status}
          {task.isClosed && (
            <span className="ml-2 text-gray-400 text-xs">🔒 Closed</span>
          )}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}

      {!task.isClosed && (
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Reassign to</label>
            <select
              className="border border-gray-300 rounded px-3 py-1.5 text-sm"
              value={nextUser}
              onChange={(e) => setNextUser(Number(e.target.value))}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {canAdvance && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Required fields</label>
              <CustomFieldsForm
                type={task.type}
                toStatus={task.status + 1}
                fields={customFields}
                onChange={setCustomFields}
              />
            </div>
          )}

          <div className="flex gap-2">
            {canReverse && (
              <button
                onClick={handleReverse}
                disabled={changeStatus.isPending}
                className="border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 text-sm px-3 py-1.5 rounded transition-colors"
              >
                ◀ Back
              </button>
            )}
            {canAdvance && (
              <button
                onClick={handleAdvance}
                disabled={changeStatus.isPending || !canSubmitAdvance}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-3 py-1.5 rounded transition-colors"
              >
                Forward ▶
              </button>
            )}
            {canClose && (
              <button
                onClick={handleClose}
                disabled={close.isPending}
                className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm px-3 py-1.5 rounded transition-colors"
              >
                Close Task
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
