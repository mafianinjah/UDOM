import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Sidebar } from "@/components/sidebar"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "UDOM Delivery | Hostel Delivery Management System",
  description:
    "Delivery Management System for hostel premises at the University of Dodoma (UDOM). Track parcels, food, documents and medicine deliveries to students in university hostels.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`bg-background ${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <div className="min-h-screen">
          <Sidebar />
          <main className="lg:pl-64">
            <div className="mx-auto max-w-6xl px-4 py-8 pt-16 lg:px-8 lg:pt-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  )
}
