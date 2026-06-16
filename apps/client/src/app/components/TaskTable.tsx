import { Task } from '../types/task.type';
import { Filters } from '../app';
import { useUsers } from '../hooks/useUsers';
import { useAllTasks } from '../hooks/useAllTasks';

interface Props {
  filters: Filters;
  selectedTask: Task | null;
  onSelect: (task: Task) => void;
}

export function TaskTable({ filters, selectedTask, onSelect }: Props) {
  const { data: users = [] } = useUsers();
  const { data: tasks, isLoading } = useAllTasks(filters, users);

  const filtered = (tasks ?? []).filter((t) => {
    if (filters.type && t.type !== filters.type) return false;
    if (filters.isClosed !== null && t.isClosed !== filters.isClosed)
      return false;
    return true;
  });

  if (isLoading) return <p className="text-gray-500 text-sm">Loading...</p>;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Type</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Assigned To</th>
            <th className="px-4 py-3 text-left">State</th>
            <th className="px-4 py-3 text-left">Custom Fields</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                No tasks found
              </td>
            </tr>
          )}
          {filtered.map((task) => (
            <tr
              key={task.id}
              onClick={() => onSelect(task)}
              className={`border-t border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors
                ${selectedTask?.id === task.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
            >
              <td className="px-4 py-3 font-mono text-gray-500">#{task.id}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium
                  ${task.type === 'PROCUREMENT' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}
                >
                  {task.type}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-700">{task.status}</td>
              <td className="px-4 py-3 text-gray-700">
                {users.find((u) => u.id === task.assignedTo)?.name ?? '—'}
              </td>
              <td className="px-4 py-3">
                {task.isClosed ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                    Closed
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Open
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                {Object.keys(task.customFields).length === 0 ? (
                  <span className="text-gray-300">—</span>
                ) : (
                  <pre className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1 whitespace-pre-wrap break-all">
                    {JSON.stringify(task.customFields, null, 2)}
                  </pre>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
