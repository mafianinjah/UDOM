import type React from "react"
import { cn } from "@/lib/utils"

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-lg border border-border bg-card text-card-foreground shadow-sm", className)}>
      {children}
    </div>
  )
}

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        className,
      )}
    >
      {children}
    </span>
  )
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
        {description ? <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}
