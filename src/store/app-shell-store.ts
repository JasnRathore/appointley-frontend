import { create } from "zustand"

type AppShellState = {
  collapsed: boolean
  toggleCollapsed: () => void
}

export const useAppShellStore = create<AppShellState>((set) => ({
  collapsed: false,
  toggleCollapsed: () =>
    set((state) => ({
      collapsed: !state.collapsed,
    })),
}))
