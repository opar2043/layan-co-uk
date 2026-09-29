import { QueryClient } from "@tanstack/react-query";

/**
 * Shared React Query client.
 *
 * `retry: 1` rather than the default 3: a 400/401/403/404 will never succeed on
 * a retry, and three silent retries just delay the error the user needs to see.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export default queryClient;
