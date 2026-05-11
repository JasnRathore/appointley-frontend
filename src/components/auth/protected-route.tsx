import { Navigate } from "react-router-dom"

import { AppShell } from "@/components/layout/app-shell"
import { useAuthStore } from "@/store/auth-store"

export function ProtectedRoute() {
  const hydrated = useAuthStore((state) => state.hydrated)
  const accessToken = useAuthStore((state) => state.accessToken)

  if (!hydrated) {
    return null
  }

  if (!accessToken) {
    return <Navigate to="/login" replace />
  }

  return <AppShell />
}
