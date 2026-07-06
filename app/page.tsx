import { Package, CheckCircle2, Clock, XCircle, Building2, ArrowRightLeft, Truck } from "lucide-react"
import { Card, Badge, SectionHeading } from "@/components/ui"
import {
  deliveries,
  hostels,
  statusColors,
  categoryColors,
  typeColors,
  type DeliveryStatus,
  type DeliveryCategory,
} from "@/lib/data"
import { formatDateTime } from "@/lib/utils"

const statusIcons: Record<DeliveryStatus, typeof Package> = {
  Pending: Clock,
  Received: Package,
  "In Transit": Truck,
  Collected: CheckCircle2,
  Cancelled: XCircle,
}

export default function DashboardPage() {
  const total = deliveries.length
  const pending = deliveries.filter((d) => d.status === "Pending").length
  const received = deliveries.filter((d) => d.status === "Received").length
  const inTransit = deliveries.filter((d) => d.status === "In Transit").length
  const internal = deliveries.filter((d) => d.deliveryType === "Internal").length
  const external = deliveries.filter((d) => d.deliveryType === "External").length

  const stats = [
    { label: "Total Deliveries", value: total, icon: Package, tone: "text-primary bg-primary/10" },
    { label: "Awaiting Collection", value: pending + received + inTransit, icon: Clock, tone: "text-warning-foreground bg-warning/20" },
    { label: "Internal (on-campus)", value: internal, icon: ArrowRightLeft, tone: "text-primary bg-primary/10" },
    { label: "External (off-campus)", value: external, icon: Truck, tone: "text-accent-foreground bg-accent/20" },
  ]

  const categories: DeliveryCategory[] = ["Food", "Parcel", "Documents", "Medicine", "Others"]
  const categoryCounts = categories.map((c) => ({
    category: c,
    count: deliveries.filter((d) => d.category === c).length,
  }))
  const maxCount = Math.max(...categoryCounts.map((c) => c.count), 1)

  const recent = [...deliveries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)

  return (
    <div className="space-y-8">
      <SectionHeading
        title="Delivery Dashboard"
        description="Overview of parcel, food, document and medicine deliveries across UDOM hostels."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="p-5">
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-semibold tracking-tight">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent Deliveries</h2>
            <Badge className="bg-secondary text-secondary-foreground border-border">Live</Badge>
          </div>
          <div className="mt-4 divide-y divide-border">
            {recent.map((d) => {
              const Icon = statusIcons[d.status]
              return (
                <div key={d.deliveryId} className="flex items-center gap-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {d.deliveryId} · {d.studentName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {d.origin} → {d.destination} · {formatDateTime(d.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge className={typeColors[d.deliveryType]}>{d.deliveryType}</Badge>
                    <Badge className={categoryColors[d.category]}>{d.category}</Badge>
                    <Badge className={statusColors[d.status]}>{d.status}</Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold">Deliveries by Category</h2>
          <div className="mt-5 space-y-4">
            {categoryCounts.map((c) => (
              <div key={c.category}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium">{c.category}</span>
                  <span className="text-muted-foreground">{c.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(c.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold">Hostels</h2>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {hostels.map((h) => (
            <div key={h.hostelId} className="rounded-lg border border-border p-4">
              <p className="text-sm font-semibold">{h.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">Block {h.block}</p>
              <p className="mt-3 text-2xl font-semibold">{h.capacity}</p>
              <p className="text-xs text-muted-foreground">Capacity</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
