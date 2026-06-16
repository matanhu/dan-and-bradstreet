const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

async function handleResponse(response: Response) {
  if (!response.ok) {
    let message = 'Something went wrong';
    try {
      const data = await response.json();
      message = data?.message ?? message;
    } catch {}
    throw new Error(message);
  }
  return response.json();
}

export const api = {
  createTask: (type: string, assignedTo: number) =>
    fetch(`${BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, assignedTo }),
    }).then(handleResponse),

  changeStatus: (
    id: number,
    toStatus: number,
    nextAssignedTo: number,
    customFields: Record<string, unknown>,
  ) =>
    fetch(`${BASE}/tasks/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toStatus, nextAssignedTo, customFields }),
    }).then(handleResponse),

  closeTask: (id: number) =>
    fetch(`${BASE}/tasks/${id}/close`, { method: 'POST' }).then(handleResponse),

  getUserTasks: (userId: number) =>
    fetch(`${BASE}/tasks/user/${userId}`).then(handleResponse),

  getUsers: () => fetch(`${BASE}/users`).then(handleResponse),

  getConfig: () => fetch(`${BASE}/tasks/config`).then(handleResponse),
};
