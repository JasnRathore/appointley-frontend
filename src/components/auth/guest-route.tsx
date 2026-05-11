import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"

import { useAuthStore } from "@/store/auth-store"

type GuestRouteProps = {
  children: ReactNode
}

export function GuestRoute({ children }: GuestRouteProps) {
  const hydrated = useAuthStore((state) => state.hydrated)
  const accessToken = useAuthStore((state) => state.accessToken)

  if (!hydrated) {
    return null
  }

  if (accessToken) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
