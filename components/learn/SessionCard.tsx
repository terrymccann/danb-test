"use client"

import Link from "next/link"
import { Clock, Lock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SessionMeta } from "@/types/learn"

interface SessionCardProps {
  session: SessionMeta
}

export function SessionCard({ session }: SessionCardProps) {
  if (!session.available) {
    return (
      <Card className="flex flex-col opacity-50">
        <CardContent className="flex flex-1 flex-col justify-between gap-3 pt-6">
          <div>
            <p className="text-sm font-medium">{session.title}</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>Coming soon</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col">
      <CardContent className="flex flex-1 flex-col justify-between gap-3 pt-6">
        <div>
          <p className="text-sm font-medium">{session.title}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>~{session.estimatedMinutes} min</span>
          </div>
        </div>
        <Link
          href={`/learn/session/${session.id}`}
          className={cn(buttonVariants({ size: "sm" }), "w-full")}
        >
          Start
        </Link>
      </CardContent>
    </Card>
  )
}
