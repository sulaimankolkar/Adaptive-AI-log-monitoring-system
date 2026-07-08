import { useState, useCallback } from 'react';
import api from '../services/api';

export function useFetch<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async (
    url: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', 
    body: any = null,
    headers: any = {}
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.request<T>({
        url,
        method,
        data: body,
        headers,
      });
      setData(response.data);
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'An error occurred';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, request, setData };
}
export default useFetch;
