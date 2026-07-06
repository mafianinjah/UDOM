"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  Bell,
  ScrollText,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/deliveries", label: "Deliveries", icon: Package },
  { href: "/students", label: "Students", icon: Users },
  { href: "/couriers", label: "Couriers", icon: Truck },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/audit", label: "Audit Logs", icon: ScrollText },
]

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card text-foreground shadow-sm lg:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 border-b border-border px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">UDOM Delivery</p>
            <p className="text-xs text-muted-foreground">Hostel Management</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
              AD
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">Administrator</p>
              <p className="truncate text-xs text-muted-foreground">admin@udom.ac.tz</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
