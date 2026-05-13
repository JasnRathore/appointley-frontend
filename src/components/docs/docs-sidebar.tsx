import * as React from "react"

import { SearchForm } from "@/components/search-form"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  Calendar,
  LayoutDashboard,
  Users,
  Mail,
  Settings,
  Bell,
  Code,
  Zap,
  Plus as PlusIcon,
  Minus as MinusIcon,
} from "lucide-react"

import { useLocation } from "react-router-dom"

// This is sample data.
const data = {
  navMain: [
    {
      title: "01. Mission Control",
      url: "#introduction",
      items: [
        {
          title: "Analytical Matrix",
          url: "#introduction",
        },
        {
          title: "Audit Log Engine",
          url: "#introduction",
        },
      ],
    },
    {
      title: "02. Meeting Lifecycle",
      url: "#managing-meetings",
      items: [
        {
          title: "Status: Scheduled",
          url: "#managing-meetings",
        },
        {
          title: "Status: Cancelled",
          url: "#managing-meetings",
        },
        {
          title: "Rescheduling Logic",
          url: "#managing-meetings",
        },
      ],
    },
    {
      title: "03. Scheduling Architecture",
      url: "#booking-flows",
      items: [
        {
          title: "Weekly Availability",
          url: "#booking-flows",
        },
        {
          title: "Blocked Dates",
          url: "#booking-flows",
        },
      ],
    },
    {
      title: "04. Team Intelligence",
      url: "#team-rotations",
      items: [
        {
          title: "Hierarchical Permissions",
          url: "#team-rotations",
        },
        {
          title: "Round-Robin Distro",
          url: "#team-rotations",
        },
      ],
    },
    {
      title: "05. Advanced Configuration",
      url: "#customization",
      items: [
        {
          title: "Notification Matrix",
          url: "#customization",
        },
        {
          title: "The Danger Zone",
          url: "#customization",
        },
      ],
    },
  ],
}

export function DocsSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const currentHash = location.hash || "#introduction"

  return (
    <Sidebar
      {...props}
      className="border-r border-white/5 bg-background/50 backdrop-blur-xl"
    >
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="rounded-xl transition-colors hover:bg-primary/5"
            >
              <a href="/">
                <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <Calendar className="size-5" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="text-lg font-black tracking-tighter uppercase">
                    Appointly
                  </span>
                  <span className="text-[10px] font-bold tracking-widest uppercase opacity-40">
                    Docs v1.0
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="mt-4">
          <SearchForm />
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {data.navMain.map((item, index) => (
              <Collapsible
                key={item.title}
                defaultOpen={true}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase transition-colors hover:text-primary">
                      {item.title}{" "}
                      <PlusIcon className="ml-auto size-3 group-data-[state=open]/collapsible:hidden" />
                      <MinusIcon className="ml-auto size-3 group-data-[state=closed]/collapsible:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {item.items?.length ? (
                    <CollapsibleContent>
                      <SidebarMenuSub className="mt-1 ml-2 gap-1 border-l border-white/5">
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={currentHash === subItem.url}
                            >
                              <a href={subItem.url}>{subItem.title}</a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  ) : null}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
