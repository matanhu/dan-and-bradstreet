// Uncomment this line to use CSS modules
// import styles from './app.module.css';
import { useState } from 'react';
import { Task } from './types/task.type';
import { CreateTaskPanel } from './components/CreateTaskPanel';
import { TaskFilters } from './components/TaskFilters';
import { TaskTable } from './components/TaskTable';
import { TaskDetailPanel } from './components/TaskDetailPanel';
import { TaskType } from './enums/task-type.enum';

export interface Filters {
  userId: number | null;
  type: TaskType | null;
  isClosed: boolean | null;
}

export function App() {
  const [filters, setFilters] = useState<Filters>({
    userId: null,
    type: null,
    isClosed: null,
  });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleFilterChange = (f: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...f }));
    setSelectedTask(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Task Management</h1>
      <CreateTaskPanel filters={filters} />
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdated={() => setSelectedTask(null)}
        />
      )}
      <TaskFilters filters={filters} onChange={handleFilterChange} />
      <TaskTable
        filters={filters}
        selectedTask={selectedTask}
        onSelect={setSelectedTask}
      />
    </div>
  );
}

export default App;
