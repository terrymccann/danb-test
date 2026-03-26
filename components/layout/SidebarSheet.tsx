"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarSheetProps {
  children: React.ReactNode
  trigger?: React.ReactNode
}

export function SidebarSheet({ children, trigger }: SidebarSheetProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Trigger — only visible on mobile */}
      <div className="lg:hidden">
        {trigger ? (
          <div onClick={() => setOpen(true)}>{trigger}</div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Overlay + Panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setOpen(false)}
          />

          {/* Slide-in panel */}
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-card border-r z-50 overflow-y-auto">
            {/* Close button */}
            <div className="flex justify-end p-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 pt-0">{children}</div>
          </div>
        </>
      )}
    </>
  )
}
