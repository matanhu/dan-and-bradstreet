import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

export function useTaskMutations() {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: ({ type, assignedTo }: { type: string; assignedTo: number }) =>
      api.createTask(type, assignedTo),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', 'all'] }),
  });

  const changeStatus = useMutation({
    mutationFn: ({
      id,
      toStatus,
      nextAssignedTo,
      customFields,
    }: {
      id: number;
      toStatus: number;
      nextAssignedTo: number;
      customFields: Record<string, unknown>;
    }) => api.changeStatus(id, toStatus, nextAssignedTo, customFields),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', 'all'] }),
  });

  const close = useMutation({
    mutationFn: (id: number) => api.closeTask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', 'all'] }),
  });

  return { create, changeStatus, close };
}
