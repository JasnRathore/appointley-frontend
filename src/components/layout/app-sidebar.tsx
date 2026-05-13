import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { 
  CalendarDays, 
  Home, 
  Link2, 
  Settings, 
  Users,
  GalleryVerticalEnd,
  Mail,
  Bell,
} from "lucide-react"

import { NavMain } from "@/components/layout/nav-main"
import { NavUser } from "@/components/layout/nav-user"
import { TeamSwitcher } from "@/components/layout/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { getTeams } from "@/lib/api"
import { useAuthStore } from "@/store/auth-store"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user)
  const activeTeamId = useAuthStore((state) => state.activeTeamId)
  const setActiveTeamId = useAuthStore((state) => state.setActiveTeamId)

  const teamsQuery = useQuery({
    queryKey: ["teams"],
    queryFn: getTeams,
  })

  const teams = React.useMemo(() => {
    return (teamsQuery.data ?? []).map((team) => ({
      id: team.id,
      name: team.name,
      logo: GalleryVerticalEnd,
      plan: "Standard", 
    }))
  }, [teamsQuery.data])

  React.useEffect(() => {
    if (teams.length > 0 && !teamsQuery.isFetching) {
      const currentTeamExists = teams.some((t) => t.id === activeTeamId)
      if (!activeTeamId || !currentTeamExists) {
        setActiveTeamId(teams[0].id)
      }
    }
  }, [activeTeamId, teams, setActiveTeamId, teamsQuery.isFetching])

  const navigation = [
    {
      title: "Home",
      url: "/dashboard",
      icon: Home,
      isActive: true,
    },
    {
      title: "Calendar",
      url: "/calendar",
      icon: CalendarDays,
    },
    {
      title: "Meetings",
      url: "/meetings",
      icon: Link2,
    },
    {
      title: "Team",
      url: "/team",
      icon: Users,
    },
    {
      title: "Emails",
      url: "/emails",
      icon: Mail,
    },
    {
      title: "Notifications",
      url: "/notifications",
      icon: Bell,
    },
    {
      title: "Workspace Settings",
      url: "/settings",
      icon: Settings,
    },
  ]

  const userData = {
    name: user?.fullName ?? "User",
    email: user?.email ?? "",
    avatar: user?.avatarUrl ?? "",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigation} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
