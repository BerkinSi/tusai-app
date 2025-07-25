import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

interface UseDataFetchingOptions<T> {
  fetchFn: () => Promise<T>;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  dependencies?: any[];
}

interface UseDataFetchingReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  state: LoadingState;
}

export function useDataFetching<T>({
  fetchFn,
  enabled = true,
  onSuccess,
  onError,
  dependencies = []
}: UseDataFetchingOptions<T>): UseDataFetchingReturn<T> {
  const { authState } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [state, setState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);

  const loading = state === 'loading';

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    console.log('useDataFetching: Starting fetch');
    setState('loading');
    setError(null);

    try {
      const result = await fetchFn();
      console.log('useDataFetching: Fetch result:', result, 'Type:', typeof result, 'Is Array:', Array.isArray(result));
      setData(result);
      setState('success');
      onSuccess?.(result);
      console.log('useDataFetching: Fetch successful');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setState('error');
      onError?.(errorMessage);
      console.error('useDataFetching: Fetch failed:', errorMessage);
    }
  }, [fetchFn, enabled, onSuccess, onError]);

  // Only fetch when authenticated and enabled, and only once per auth state change
  useEffect(() => {
    if (authState === 'authenticated' && enabled && state === 'idle') {
      fetchData();
    } else if (authState === 'unauthenticated') {
      setState('idle');
      setData(null);
      setError(null);
    }
  }, [authState, enabled, state, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    state
  };
} 