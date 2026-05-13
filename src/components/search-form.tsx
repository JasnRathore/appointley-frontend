"use client"

import { Label } from "@/components/ui/label"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from "@/components/ui/sidebar"
import { SearchIcon } from "lucide-react"

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  return (
    <form {...props}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <SidebarInput
            id="search"
            placeholder="Search the guide..."
            className="pl-9 bg-white/5 border-white/5 focus-visible:ring-primary/20 focus-visible:border-primary/30 transition-all rounded-xl placeholder:text-white/20"
          />
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40 select-none" />
          <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] font-black text-white/20 select-none">
            <span>⌘</span>
            <span>K</span>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  )
}
