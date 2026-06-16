import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

export function useTaskConfig() {
  return useQuery<Record<string, number>>({
    queryKey: ['tasks', 'config'],
    queryFn: () => api.getConfig(),
    staleTime: Infinity,
  });
}
