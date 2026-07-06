"use client"

import { useMemo, useState } from "react"
import { Search, Plus, Check, X, ArrowRight } from "lucide-react"
import { Card, Badge, SectionHeading } from "@/components/ui"
import {
  deliveries as seedDeliveries,
  students,
  couriers,
  guards,
  campusLocations,
  statusColors,
  categoryColors,
  typeColors,
  type Delivery,
  type DeliveryStatus,
  type DeliveryCategory,
  type DeliveryType,
} from "@/lib/data"
import { formatDateTime, cn } from "@/lib/utils"

const statuses: (DeliveryStatus | "All")[] = ["All", "Pending", "Received", "In Transit", "Collected", "Cancelled"]
const typeFilters: (DeliveryType | "All")[] = ["All", "Internal", "External"]
const categories: DeliveryCategory[] = ["Food", "Parcel", "Documents", "Medicine", "Others"]

export default function DeliveriesPage() {
  const [list, setList] = useState<Delivery[]>(seedDeliveries)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<DeliveryStatus | "All">("All")
  const [typeFilter, setTypeFilter] = useState<DeliveryType | "All">("All")
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<DeliveryType>("External")

  const filtered = useMemo(() => {
    return list.filter((d) => {
      const matchesStatus = status === "All" || d.status === status
      const matchesType = typeFilter === "All" || d.deliveryType === typeFilter
      const q = query.toLowerCase()
      const matchesQuery =
        !q ||
        d.deliveryId.toLowerCase().includes(q) ||
        d.studentName.toLowerCase().includes(q) ||
        d.courier.toLowerCase().includes(q) ||
        d.origin.toLowerCase().includes(q) ||
        d.destination.toLowerCase().includes(q)
      return matchesStatus && matchesType && matchesQuery
    })
  }, [list, query, status, typeFilter])

  function updateStatus(id: string, newStatus: DeliveryStatus) {
    setList((prev) =>
      prev.map((d) =>
        d.deliveryId === id
          ? {
              ...d,
              status: newStatus,
              collectedAt: newStatus === "Collected" ? new Date().toISOString() : d.collectedAt,
            }
          : d,
      ),
    )
  }

  function registerDelivery(form: FormData) {
    const regNumber = String(form.get("student"))
    const student = students.find((s) => s.regNumber === regNumber)
    const newDelivery: Delivery = {
      deliveryId: `D-${1043 + list.length}`,
      student: regNumber,
      studentName: student?.fullName ?? "Unknown",
      deliveryType: form.get("deliveryType") as DeliveryType,
      origin: String(form.get("origin")),
      destination: String(form.get("destination")),
      courier: String(form.get("courier")),
      category: form.get("category") as DeliveryCategory,
      status: "Pending",
      description: String(form.get("description") || ""),
      receivedBy: String(form.get("guard")),
      receivedAt: new Date().toISOString(),
      collectedAt: null,
      createdAt: new Date().toISOString(),
    }
    setList((prev) => [newDelivery, ...prev])
    setShowForm(false)
  }

  // Internal deliveries move between two campus premises; external ones arrive from off-campus.
  const originOptions =
    formType === "External" ? campusLocations.filter((l) => l.kind === "External") : campusLocations.filter((l) => l.kind !== "External")
  const destinationOptions = campusLocations.filter((l) => l.kind !== "External")
  const courierOptions =
    formType === "Internal"
      ? couriers.filter((c) => c.company === "UDOM Internal Dispatch")
      : couriers.filter((c) => c.company !== "UDOM Internal Dispatch")

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Deliveries"
        description="Track internal (block-to-block, college-to-college) and external (off-campus to premises) deliveries."
        action={
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Register Delivery
          </button>
        }
      />

      {showForm ? (
        <Card className="p-6">
          <h2 className="text-base font-semibold">Register New Delivery</h2>
          <form action={registerDelivery} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Delivery Type</span>
              <select
                name="deliveryType"
                required
                value={formType}
                onChange={(e) => setFormType(e.target.value as DeliveryType)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="External">External (off-campus → premises)</option>
                <option value="Internal">Internal (block/college → block/college)</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Recipient (Student)</span>
              <select name="student" required className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                {students.map((s) => (
                  <option key={s.regNumber} value={s.regNumber}>
                    {s.fullName} ({s.regNumber})
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Origin</span>
              <select name="origin" required className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                {originOptions.map((l) => (
                  <option key={l.locationId} value={l.name}>
                    {l.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Destination</span>
              <select name="destination" required className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                {destinationOptions.map((l) => (
                  <option key={l.locationId} value={l.name}>
                    {l.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Carrier</span>
              <select name="courier" required className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                {courierOptions.map((c) => (
                  <option key={c.courierId} value={c.company}>
                    {c.company} — {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Category</span>
              <select name="category" required className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Received By (Guard)</span>
              <select name="guard" required className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                {guards.map((g) => (
                  <option key={g.guardId} value={g.name}>
                    {g.name} ({g.hostel})
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
              <span className="font-medium">Description</span>
              <input
                name="description"
                placeholder="e.g. Medium box, electronics"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </label>
            <div className="flex gap-3 sm:col-span-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Check className="h-4 w-4" />
                Save Delivery
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ID, student, carrier, or location..."
              className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {typeFilters.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  typeFilter === t
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/70",
                )}
              >
                {t === "All" ? "All Types" : t}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                status === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/70",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Recipient</th>
                <th className="px-4 py-3 font-medium">Carrier</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((d) => (
                <tr key={d.deliveryId} className="hover:bg-secondary/30">
                  <td className="px-4 py-3 font-medium">{d.deliveryId}</td>
                  <td className="px-4 py-3">
                    <Badge className={typeColors[d.deliveryType]}>{d.deliveryType}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="max-w-32 truncate text-muted-foreground">{d.origin}</span>
                      <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                      <span className="max-w-32 truncate font-medium">{d.destination}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{d.studentName}</div>
                    <div className="text-xs text-muted-foreground">{d.student}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{d.courier}</td>
                  <td className="px-4 py-3">
                    <Badge className={categoryColors[d.category]}>{d.category}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={statusColors[d.status]}>{d.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {d.status === "Pending" || d.status === "Received" || d.status === "In Transit" ? (
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateStatus(d.deliveryId, "Collected")}
                          className="inline-flex items-center gap-1 rounded-md bg-success/15 px-2 py-1 text-xs font-medium text-success hover:bg-success/25"
                        >
                          <Check className="h-3 w-3" /> Collect
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(d.deliveryId, "Cancelled")}
                          className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/20"
                        >
                          <X className="h-3 w-3" /> Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">No actions</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No deliveries match your filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
