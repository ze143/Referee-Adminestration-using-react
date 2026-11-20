import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // دقيقة
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
