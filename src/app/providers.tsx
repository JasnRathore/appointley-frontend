import type { ReactNode } from "react"
import { QueryClientProvider } from "@tanstack/react-query"

import { AuthBootstrap } from "@/components/auth/auth-bootstrap"
import { ThemeProvider } from "@/components/theme-provider"
import { queryClient } from "@/lib/query-client"

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthBootstrap />
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  )
}
