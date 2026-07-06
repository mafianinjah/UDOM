import { Mail, Phone, MapPin } from "lucide-react"
import { Card, Badge, SectionHeading } from "@/components/ui"
import { students, deliveries } from "@/lib/data"

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Students"
        description="Registered students living in UDOM hostels who can receive deliveries."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {students.map((s) => {
          const count = deliveries.filter((d) => d.student === s.regNumber).length
          return (
            <Card key={s.regNumber} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {s.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-semibold leading-tight">{s.fullName}</p>
                    <p className="font-mono text-xs text-muted-foreground">{s.regNumber}</p>
                  </div>
                </div>
                <Badge className="bg-secondary text-secondary-foreground border-border">{count} deliveries</Badge>
              </div>

              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{s.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" />
                  {s.phone}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {s.hostel} · Block {s.block} · Room {s.room}
                </p>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
