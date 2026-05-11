import { createBrowserRouter, Navigate } from "react-router-dom"

import { GuestRoute } from "@/components/auth/guest-route"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { BookingPage } from "@/pages/booking-page"
import { CalendarPage } from "@/pages/calendar-page"
import { DashboardPage } from "@/pages/dashboard-page"
import { LoginPage } from "@/pages/login-page"
import { MeetingsPage } from "@/pages/meetings-page"
import { RegisterPage } from "@/pages/register-page"
import { SettingsPage } from "@/pages/settings-page"
import { TeamPage } from "@/pages/team-page"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/login",
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <GuestRoute>
        <RegisterPage />
      </GuestRoute>
    ),
  },
  {
    path: "/book/:token",
    element: <BookingPage />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "team",
        element: <TeamPage />,
      },
      {
        path: "calendar",
        element: <CalendarPage />,
      },
      {
        path: "meetings",
        element: <MeetingsPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
])
