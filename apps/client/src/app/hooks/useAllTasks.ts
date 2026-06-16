import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { Task } from '../types/task.type';
import { Filters } from '../app';
import { User } from '../types/user.type';

export function useAllTasks(filters: Filters, users: User[]) {
  const userIds = filters.userId ? [filters.userId] : users.map((u) => u.id);

  return useQuery<Task[]>({
    queryKey: ['tasks', 'all', filters],
    queryFn: async () => {
      const results = await Promise.all(
        userIds.map((id) => api.getUserTasks(id)),
      );
      const flat = results.flat() as Task[];

      const seen = new Set<number>();
      return flat.filter((t) => {
        if (seen.has(t.id)) return false;
        seen.add(t.id);
        return true;
      });
    },
    enabled: users.length > 0 || filters.userId !== null,
  });
}
