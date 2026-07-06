import { Bell, BellOff } from "lucide-react"
import { Card, Badge, SectionHeading } from "@/components/ui"
import { notifications, students } from "@/lib/data"
import { formatDateTime } from "@/lib/utils"

export default function NotificationsPage() {
  const sorted = [...notifications].sort((a, b) => b.sentAt.localeCompare(a.sentAt))

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Notifications"
        description="Automated messages sent to students when deliveries arrive or are collected."
      />

      <Card className="divide-y divide-border">
        {sorted.map((n) => {
          const student = students.find((s) => s.regNumber === n.student)
          return (
            <div key={n.notificationId} className="flex items-start gap-4 p-5">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  n.read ? "bg-secondary text-muted-foreground" : "bg-primary/10 text-primary"
                }`}
              >
                {n.read ? <BellOff className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{student?.fullName ?? n.student}</p>
                  <Badge className="bg-secondary text-secondary-foreground border-border font-mono">
                    {n.deliveryId}
                  </Badge>
                  {!n.read ? (
                    <Badge className="bg-primary/10 text-primary border-primary/30">New</Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">{n.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(n.sentAt)}</p>
              </div>
            </div>
          )
        })}
      </Card>
    </div>
  )
}
