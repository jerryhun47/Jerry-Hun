/// <reference types="vite/client" />
export const apiFetch = (path: string, options?: RequestInit) => {
  let baseUrl = import.meta.env.VITE_API_URL || '';
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  return fetch(`${baseUrl}${path}`, options);
};
