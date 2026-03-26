import { redirect } from "next/navigation"
import { getDomainConfig } from "@/data/learn/index"
import { DomainPage } from "@/components/learn/DomainPage"
import type { ExamType } from "@/types/exam"

export default async function LearnDomainPage({
  params,
}: {
  params: Promise<{ domain: string }>
}) {
  const { domain } = await params

  const config = getDomainConfig(domain as ExamType)
  if (!config) {
    redirect("/learn")
  }

  return <DomainPage config={config} />
}
