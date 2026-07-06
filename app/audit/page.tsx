import { Card, Badge, SectionHeading } from "@/components/ui"
import { auditLogs, type UserRole } from "@/lib/data"
import { formatDateTime } from "@/lib/utils"

const roleColors: Record<UserRole, string> = {
  Administrator: "bg-primary/10 text-primary border-primary/30",
  "Security Guard": "bg-accent/20 text-accent-foreground border-accent/40",
  Student: "bg-success/15 text-success border-success/30",
}

export default function AuditPage() {
  const sorted = [...auditLogs].sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Audit Logs"
        description="Chronological record of system activities for accountability and security tracking."
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Log ID</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Entity</th>
                <th className="px-4 py-3 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map((log) => (
                <tr key={log.logId} className="hover:bg-secondary/30">
                  <td className="px-4 py-3 font-mono text-xs">{log.logId}</td>
                  <td className="px-4 py-3 font-medium">{log.user}</td>
                  <td className="px-4 py-3">
                    <Badge className={roleColors[log.role]}>{log.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{log.action}</td>
                  <td className="px-4 py-3 text-muted-foreground">{log.entity}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateTime(log.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
