export const apiFetch = (path: string, options?: RequestInit) => {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  return fetch(`${baseUrl}${path}`, options);
};
