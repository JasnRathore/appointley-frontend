import { useQuery } from "@tanstack/react-query"
import { Outlet, useLocation, Link } from "react-router-dom"
import * as React from "react"
import { PlusCircle } from "lucide-react"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { CreateLinkDialog } from "@/components/layout/create-link-dialog"
import { NotificationDropdown } from "@/components/layout/notification-dropdown"
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
import { Button } from "@/components/ui/button"
import { getTeams } from "@/lib/api"
import { useAuthStore } from "@/store/auth-store"

export function AppShell() {
  const location = useLocation()
  const pathSegments = location.pathname.split("/").filter(Boolean)
  const activeTeamId = useAuthStore((state) => state.activeTeamId)
  const [showCreateLink, setShowCreateLink] = React.useState(false)

  const teamsQuery = useQuery({
    queryKey: ["teams"],
    queryFn: getTeams,
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
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb className="hidden sm:block">
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1
                  return (
                    <React.Fragment key={crumb.href}>
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage className="font-bold">{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={crumb.href} className="text-muted-foreground hover:text-primary transition-colors">
                              {crumb.label}
                            </Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!isLast && (
                        <BreadcrumbSeparator />
                      )}
                    </React.Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
            
            <div className="ml-auto flex items-center gap-3">
              <NotificationDropdown />
              <Button
                size="sm"
                className="hidden sm:flex gap-2 rounded-full shadow-lg shadow-primary/10"
                onClick={() => setShowCreateLink(true)}
              >
                 <PlusCircle className="size-4" />
                 <span className="font-bold">Create Link</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-[1600px] mx-auto w-full">
            <Outlet />
          </main>
          <CreateLinkDialog open={showCreateLink} onOpenChange={setShowCreateLink} />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
