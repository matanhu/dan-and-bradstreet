import { useState } from 'react';
import { useTaskMutations } from '../hooks/useTaskMutations';
import { useUsers } from '../hooks/useUsers';
import { TaskType } from '../enums/task-type.enum';
import { Filters } from '../app';

interface Props {
  filters: Filters;
}

export function CreateTaskPanel({ filters }: Props) {
  const [type, setType] = useState<TaskType>(TaskType.PROCUREMENT);
  const [createError, setCreateError] = useState<Error | null>(null);
  const { data: users = [], isLoading } = useUsers();
  const [assignedTo, setAssignedTo] = useState<number | null>(
    filters.userId ?? null,
  );
  const effectiveAssignedTo = assignedTo ?? users[0]?.id;
  const { create } = useTaskMutations();

  const submit = () => {
    create.mutate(
      { type, assignedTo: effectiveAssignedTo },
      {
        onSuccess: () => setCreateError(null),
        onError: (error) => {
          setCreateError(error);
        },
      },
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Create Task</h2>
      <div className="flex gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Type</label>
          <select
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value as TaskType)}
          >
            <option value={TaskType.PROCUREMENT}>Procurement</option>
            <option value={TaskType.DEVELOPMENT}>Development</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Assign to</label>
          <select
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
            value={effectiveAssignedTo}
            onChange={(e) => setAssignedTo(Number(e.target.value))}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={submit}
          disabled={create.isPending || !effectiveAssignedTo}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-1.5 rounded transition-colors"
        >
          {create.isPending ? 'Creating...' : 'Create'}
        </button>
        <div className="text-sm text-red-500">
          {createError?.message ? createError.message : null}
        </div>
      </div>
    </div>
  );
}
