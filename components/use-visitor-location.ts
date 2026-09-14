import { useEffect, useState } from 'react';
import { visitorLocation, type VisitorLocation } from '@/lib/visitor-location';
export function useVisitorLocation() {
  const [state, setState] = useState<{
    loading: boolean;
    location: VisitorLocation | null;
  }>({ loading: true, location: null });
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    fetch('/api/visitor-location', {
      signal: controller.signal,
      cache: 'no-store',
    })
      .then((response) => {
        if (!response.ok) throw new Error('Location unavailable');
        return response.json();
      })
      .then((data) =>
        setState({
          loading: false,
          location: visitorLocation(
            (data as { location?: Record<string, unknown> | null }).location ??
              undefined,
          ),
        }),
      )
      .catch(() => setState({ loading: false, location: null }))
      .finally(() => clearTimeout(timeout));
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);
  return state;
}
