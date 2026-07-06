import { Truck, Phone, Building2, ShieldCheck } from "lucide-react"
import { Card, Badge, SectionHeading } from "@/components/ui"
import { couriers, courierCompanies, guards } from "@/lib/data"

export default function CouriersPage() {
  return (
    <div className="space-y-8">
      <SectionHeading
        title="Couriers & Guards"
        description="Delivery personnel, courier companies, and security guards receiving deliveries."
      />

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Courier Companies</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {courierCompanies.map((c) => (
            <Card key={c.companyId} className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <p className="mt-3 font-semibold">{c.name}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                {c.phone}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Couriers</h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Vehicle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {couriers.map((c) => (
                  <tr key={c.courierId} className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium">{c.courierId}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        {c.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.company}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.phone}</td>
                    <td className="px-4 py-3">
                      <Badge className="bg-secondary text-secondary-foreground border-border font-mono">
                        {c.vehicleNumber}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Security Guards</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guards.map((g) => (
            <Card key={g.guardId} className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 text-accent-foreground">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold leading-tight">{g.name}</p>
                    <p className="text-xs text-muted-foreground">{g.hostel} gate</p>
                  </div>
                </div>
                <Badge
                  className={
                    g.shift === "Day"
                      ? "bg-warning/20 text-warning-foreground border-warning/30"
                      : "bg-primary/10 text-primary border-primary/30"
                  }
                >
                  {g.shift}
                </Badge>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                {g.phone}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
