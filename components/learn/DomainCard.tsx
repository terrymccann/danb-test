"use client"

import Link from "next/link"
import { BookOpen, FileText } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import type { DomainLearnConfig } from "@/types/learn"

interface DomainCardProps {
  config: DomainLearnConfig
}

export function DomainCard({ config }: DomainCardProps) {
  const totalSessions = config.subDomains.reduce(
    (sum, sub) => sum + sub.sessions.length,
    0
  )

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-sm font-semibold">
            {config.code}
          </Badge>
        </div>
        <CardTitle className="text-xl">{config.title}</CardTitle>
        <CardDescription>{config.examDetails}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>{totalSessions} learning sessions</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{config.subDomains.map((sub) => sub.name).join(" · ")}</span>
          </div>
        </div>
        <Link
          href={`/learn/${config.domain}`}
          className={buttonVariants({ className: "w-full" })}
        >
          View Sessions
        </Link>
      </CardContent>
    </Card>
  )
}
