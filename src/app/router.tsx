import { createBrowserRouter } from "react-router-dom"

import { GuestRoute } from "@/components/auth/guest-route"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { BookingPage } from "@/pages/booking-page"
import { CalendarPage } from "@/pages/calendar-page"
import { DashboardPage } from "@/pages/dashboard-page"
import { LoginPage } from "@/pages/login-page"
import { MeetingsPage } from "@/pages/meetings-page"
import { RegisterPage } from "@/pages/register-page"
import { SettingsPage } from "@/pages/settings-page"
import { AccountSettingsPage } from "@/pages/account-settings-page"
import { NotificationsPage } from "@/pages/notifications-page"
import { TeamPage } from "@/pages/team-page"
import { EmailsPage } from "@/pages/emails-page"
import { ManageBookingPage } from "@/pages/manage-booking-page"
import InvitePage from "@/pages/invite-page"
import HomePage from "@/pages/home-page"

import ProductPage from "@/pages/product-page"
import PricingPage from "@/pages/pricing-page"
import DocsPage from "@/pages/docs-page"

export const router = createBrowserRouter([
//  {
//    path: "/",
//    element: <Navigate to="/dashboard" replace />,
//  },
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/product",
    element: <ProductPage />,
  },
  {
    path: "/pricing",
    element: <PricingPage />,
  },
  {
    path: "/docs",
    element: <DocsPage />,
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
    path: "/manage-booking/:meetingId",
    element: <ManageBookingPage />,
  },
  {
    path: "/invite/:token",
    element: <InvitePage />,
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
      {
        path: "account",
        element: <AccountSettingsPage />,
      },
      {
        path: "emails",
        element: <EmailsPage />,
      },
      {
        path: "notifications",
        element: <NotificationsPage />,
      },
    ],
  },
])
