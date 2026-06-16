import { Filters } from '../app';
import { useUsers } from '../hooks/useUsers';
import { TaskType } from '../enums/task-type.enum';

interface Props {
  filters: Filters;
  onChange: (f: Partial<Filters>) => void;
}

export function TaskFilters({ filters, onChange }: Props) {
  const { data: users = [] } = useUsers();
  return (
    <div className="flex gap-4 items-center bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <select
        className="border border-gray-300 rounded px-3 py-1.5 text-sm"
        value={filters.userId ?? ''}
        onChange={(e) =>
          onChange({ userId: e.target.value ? Number(e.target.value) : null })
        }
      >
        <option value="">All users</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>

      <select
        className="border border-gray-300 rounded px-3 py-1.5 text-sm"
        value={filters.type ?? ''}
        onChange={(e) =>
          onChange({ type: (e.target.value as TaskType) || null })
        }
      >
        <option value="">All types</option>
        <option value={TaskType.PROCUREMENT}>Procurement</option>
        <option value={TaskType.DEVELOPMENT}>Development</option>
      </select>

      <select
        className="border border-gray-300 rounded px-3 py-1.5 text-sm"
        value={filters.isClosed === null ? '' : String(filters.isClosed)}
        onChange={(e) =>
          onChange({
            isClosed: e.target.value === '' ? null : e.target.value === 'true',
          })
        }
      >
        <option value="">All statuses</option>
        <option value="false">Open</option>
        <option value="true">Closed</option>
      </select>
    </div>
  );
}
