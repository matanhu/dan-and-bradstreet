import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { User } from '../types/user.type';

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => api.getUsers(),
    staleTime: Infinity,
  });
}
