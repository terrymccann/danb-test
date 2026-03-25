"use client"

import Link from "next/link"
import { Clock, BookOpen } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { ScienceTag } from "@/components/learn/ScienceTag"
import type { SessionMeta } from "@/types/learn"

interface LearnCardProps {
  session: SessionMeta
}

export function LearnCard({ session }: LearnCardProps) {
  const domainLabels = { gc: "GC", rhs: "RHS", ice: "ICE" } as const

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-sm font-semibold">
            {domainLabels[session.domain]}
          </Badge>
        </div>
        <CardTitle className="text-xl">{session.title}</CardTitle>
        <CardDescription>{session.topic}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>7-phase learning session</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>~{session.estimatedMinutes} minutes</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {session.scienceTags.map((tag) => (
              <ScienceTag key={tag} label={tag} />
            ))}
          </div>
        </div>
        <Link
          href={`/learn/${session.id}`}
          className={buttonVariants({ className: "w-full" })}
        >
          Start Learning Session
        </Link>
      </CardContent>
    </Card>
  )
}
