"use client"

import { cn } from "@/lib/utils"

interface SidebarProps {
  children: React.ReactNode
  className?: string
}

export function Sidebar({ children, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden lg:flex lg:w-64 lg:flex-col lg:border-r bg-background p-4 overflow-y-auto",
        className
      )}
    >
      {children}
    </aside>
  )
}
