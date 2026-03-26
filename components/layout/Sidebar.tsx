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
        "hidden lg:block w-64 shrink-0 border-r bg-card overflow-y-auto",
        className
      )}
    >
      <div className="p-4">{children}</div>
    </aside>
  )
}
