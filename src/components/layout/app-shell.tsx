import { useQuery } from "@tanstack/react-query"
import { Outlet, useLocation, Link } from "react-router-dom"
import * as React from "react"

import { AppSidebar } from "@/components/layout/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { getDashboardSummary, getTeams } from "@/lib/api"
import { useAuthStore } from "@/store/auth-store"

export function AppShell() {
  const location = useLocation()
  const pathSegments = location.pathname.split("/").filter(Boolean)
  const activeTeamId = useAuthStore((state) => state.activeTeamId)

  const teamsQuery = useQuery({
    queryKey: ["teams"],
    queryFn: getTeams,
  })

  const dashboardQuery = useQuery({
    queryKey: ["dashboard-summary", activeTeamId],
    queryFn: getDashboardSummary,
    enabled: !!activeTeamId,
  })

  const activeTeamName = React.useMemo(() => {
    return teamsQuery.data?.find((t) => t.id === activeTeamId)?.name ?? "Appointley"
  }, [teamsQuery.data, activeTeamId])

  const breadcrumbs = React.useMemo(() => {
    const items = [{ label: activeTeamName, href: "/dashboard" }]
    let currentPath = ""
    
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`
      if (currentPath === "/dashboard") return // Skip duplicate dashboard crumb
      const label = segment.charAt(0).toUpperCase() + segment.slice(1)
      items.push({ label, href: currentPath })
    })
    
    return items
  }, [pathSegments, activeTeamName])

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1
                  return (
                    <React.Fragment key={crumb.href}>
                      <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                        {isLast ? (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={crumb.href}>{crumb.label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!isLast && (
                        <BreadcrumbSeparator className={index === 0 ? "hidden md:block" : ""} />
                      )}
                    </React.Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <MetricCard label="Rules" value={String(dashboardQuery.data?.availabilityRules ?? 0)} />
              <MetricCard label="Open Links" value={String(dashboardQuery.data?.activeBookingLinks ?? 0)} />
              <MetricCard label="Meetings" value={String(dashboardQuery.data?.upcomingMeetings ?? 0)} />
            </div>
            <main className="flex-1">
              <Outlet />
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

type MetricCardProps = {
  label: string
  value: string
}

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  )
}

