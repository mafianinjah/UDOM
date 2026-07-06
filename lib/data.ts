// Domain types mirror the 3NF relational schema in /database/schema.sql

export type DeliveryStatus = "Pending" | "Received" | "Collected" | "Cancelled"
export type DeliveryCategory = "Food" | "Parcel" | "Documents" | "Medicine" | "Others"
export type UserRole = "Administrator" | "Security Guard" | "Student"

export interface Hostel {
  hostelId: string
  name: string
  block: string
  capacity: number
}

export interface Student {
  regNumber: string
  fullName: string
  phone: string
  email: string
  hostel: string
  block: string
  room: string
}

export interface CourierCompany {
  companyId: string
  name: string
  phone: string
}

export interface Courier {
  courierId: string
  name: string
  company: string
  phone: string
  vehicleNumber: string
}

export interface SecurityGuard {
  guardId: string
  name: string
  phone: string
  shift: "Day" | "Night"
  hostel: string
}

export interface Delivery {
  deliveryId: string
  student: string // reg number
  studentName: string
  courier: string
  category: DeliveryCategory
  status: DeliveryStatus
  description: string
  receivedBy: string // guard name
  receivedAt: string | null
  collectedAt: string | null
  createdAt: string
}

export interface Notification {
  notificationId: string
  student: string
  deliveryId: string
  message: string
  sentAt: string
  read: boolean
}

export interface AuditLog {
  logId: string
  user: string
  role: UserRole
  action: string
  entity: string
  timestamp: string
}

export const hostels: Hostel[] = [
  { hostelId: "H001", name: "Mangaka", block: "A", capacity: 320 },
  { hostelId: "H002", name: "Nala", block: "B", capacity: 280 },
  { hostelId: "H003", name: "Chimwaga", block: "C", capacity: 400 },
  { hostelId: "H004", name: "Iyumbu", block: "D", capacity: 250 },
]

export const students: Student[] = [
  {
    regNumber: "T21-03-01234",
    fullName: "Amina Juma",
    phone: "+255 712 345 678",
    email: "amina.juma@udom.ac.tz",
    hostel: "Mangaka",
    block: "A",
    room: "A-104",
  },
  {
    regNumber: "T21-03-05678",
    fullName: "Baraka Mwenda",
    phone: "+255 754 987 210",
    email: "baraka.mwenda@udom.ac.tz",
    hostel: "Nala",
    block: "B",
    room: "B-212",
  },
  {
    regNumber: "T22-01-00987",
    fullName: "Neema Kessy",
    phone: "+255 786 112 004",
    email: "neema.kessy@udom.ac.tz",
    hostel: "Chimwaga",
    block: "C",
    room: "C-318",
  },
  {
    regNumber: "T20-05-04521",
    fullName: "Joseph Mushi",
    phone: "+255 719 550 331",
    email: "joseph.mushi@udom.ac.tz",
    hostel: "Iyumbu",
    block: "D",
    room: "D-009",
  },
  {
    regNumber: "T22-02-07788",
    fullName: "Fatuma Ally",
    phone: "+255 767 220 145",
    email: "fatuma.ally@udom.ac.tz",
    hostel: "Mangaka",
    block: "A",
    room: "A-220",
  },
]

export const courierCompanies: CourierCompany[] = [
  { companyId: "C001", name: "DHL Tanzania", phone: "+255 22 286 5000" },
  { companyId: "C002", name: "Posta Tanzania", phone: "+255 26 232 1000" },
  { companyId: "C003", name: "Fasthub Logistics", phone: "+255 22 550 1200" },
  { companyId: "C004", name: "Piki Express", phone: "+255 713 400 900" },
]

export const couriers: Courier[] = [
  { courierId: "K001", name: "Said Ramadhani", company: "DHL Tanzania", phone: "+255 715 001 220", vehicleNumber: "T123 ABC" },
  { courierId: "K002", name: "Grace Peter", company: "Posta Tanzania", phone: "+255 758 330 447", vehicleNumber: "T456 DEF" },
  { courierId: "K003", name: "Emmanuel Loi", company: "Fasthub Logistics", phone: "+255 762 889 001", vehicleNumber: "MC 889 K" },
  { courierId: "K004", name: "Halima Said", company: "Piki Express", phone: "+255 719 447 552", vehicleNumber: "MC 220 P" },
]

export const guards: SecurityGuard[] = [
  { guardId: "G001", name: "John Mlaki", phone: "+255 715 900 100", shift: "Day", hostel: "Mangaka" },
  { guardId: "G002", name: "Mary Shija", phone: "+255 754 210 887", shift: "Night", hostel: "Nala" },
  { guardId: "G003", name: "Peter Ngoya", phone: "+255 786 445 220", shift: "Day", hostel: "Chimwaga" },
]

export const deliveries: Delivery[] = [
  {
    deliveryId: "D-1042",
    student: "T21-03-01234",
    studentName: "Amina Juma",
    courier: "DHL Tanzania",
    category: "Parcel",
    status: "Pending",
    description: "Medium box, electronics",
    receivedBy: "John Mlaki",
    receivedAt: "2026-07-06T08:30:00Z",
    collectedAt: null,
    createdAt: "2026-07-06T08:30:00Z",
  },
  {
    deliveryId: "D-1041",
    student: "T22-01-00987",
    studentName: "Neema Kessy",
    courier: "Piki Express",
    category: "Food",
    status: "Received",
    description: "Hot meal delivery",
    receivedBy: "Peter Ngoya",
    receivedAt: "2026-07-06T07:15:00Z",
    collectedAt: null,
    createdAt: "2026-07-06T07:10:00Z",
  },
  {
    deliveryId: "D-1040",
    student: "T21-03-05678",
    studentName: "Baraka Mwenda",
    courier: "Posta Tanzania",
    category: "Documents",
    status: "Collected",
    description: "Official transcript envelope",
    receivedBy: "Mary Shija",
    receivedAt: "2026-07-05T16:45:00Z",
    collectedAt: "2026-07-05T18:20:00Z",
    createdAt: "2026-07-05T16:40:00Z",
  },
  {
    deliveryId: "D-1039",
    student: "T20-05-04521",
    studentName: "Joseph Mushi",
    courier: "DHL Tanzania",
    category: "Medicine",
    status: "Collected",
    description: "Pharmacy package - refrigerated",
    receivedBy: "John Mlaki",
    receivedAt: "2026-07-05T11:05:00Z",
    collectedAt: "2026-07-05T12:30:00Z",
    createdAt: "2026-07-05T11:00:00Z",
  },
  {
    deliveryId: "D-1038",
    student: "T22-02-07788",
    studentName: "Fatuma Ally",
    courier: "Fasthub Logistics",
    category: "Parcel",
    status: "Cancelled",
    description: "Wrong address, returned to sender",
    receivedBy: "John Mlaki",
    receivedAt: "2026-07-04T09:20:00Z",
    collectedAt: null,
    createdAt: "2026-07-04T09:15:00Z",
  },
  {
    deliveryId: "D-1037",
    student: "T22-01-00987",
    studentName: "Neema Kessy",
    courier: "Piki Express",
    category: "Parcel",
    status: "Pending",
    description: "Small package",
    receivedBy: "Peter Ngoya",
    receivedAt: "2026-07-06T06:50:00Z",
    collectedAt: null,
    createdAt: "2026-07-06T06:45:00Z",
  },
]

export const notifications: Notification[] = [
  {
    notificationId: "N-501",
    student: "T21-03-01234",
    deliveryId: "D-1042",
    message: "Your parcel from DHL Tanzania has arrived at Mangaka gate. Please collect it.",
    sentAt: "2026-07-06T08:31:00Z",
    read: false,
  },
  {
    notificationId: "N-500",
    student: "T22-01-00987",
    deliveryId: "D-1041",
    message: "Your food delivery has arrived at Chimwaga gate.",
    sentAt: "2026-07-06T07:16:00Z",
    read: false,
  },
  {
    notificationId: "N-499",
    student: "T21-03-05678",
    deliveryId: "D-1040",
    message: "Your documents were collected successfully. Thank you.",
    sentAt: "2026-07-05T18:21:00Z",
    read: true,
  },
]

export const auditLogs: AuditLog[] = [
  { logId: "L-9001", user: "admin", role: "Administrator", action: "Registered new student T22-02-07788", entity: "Student", timestamp: "2026-07-06T08:00:00Z" },
  { logId: "L-9002", user: "John Mlaki", role: "Security Guard", action: "Received delivery D-1042", entity: "Delivery", timestamp: "2026-07-06T08:30:00Z" },
  { logId: "L-9003", user: "system", role: "Administrator", action: "Auto-sent notification N-501", entity: "Notification", timestamp: "2026-07-06T08:31:00Z" },
  { logId: "L-9004", user: "Peter Ngoya", role: "Security Guard", action: "Received delivery D-1041", entity: "Delivery", timestamp: "2026-07-06T07:15:00Z" },
  { logId: "L-9005", user: "Baraka Mwenda", role: "Student", action: "Collected delivery D-1040", entity: "Delivery", timestamp: "2026-07-05T18:20:00Z" },
  { logId: "L-9006", user: "admin", role: "Administrator", action: "Updated courier K003 vehicle number", entity: "Courier", timestamp: "2026-07-05T14:10:00Z" },
]

export const statusColors: Record<DeliveryStatus, string> = {
  Pending: "bg-warning/15 text-warning-foreground border-warning/30",
  Received: "bg-primary/10 text-primary border-primary/30",
  Collected: "bg-success/15 text-success border-success/30",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/30",
}

export const categoryColors: Record<DeliveryCategory, string> = {
  Food: "bg-accent/20 text-accent-foreground border-accent/40",
  Parcel: "bg-primary/10 text-primary border-primary/30",
  Documents: "bg-secondary text-secondary-foreground border-border",
  Medicine: "bg-success/15 text-success border-success/30",
  Others: "bg-muted text-muted-foreground border-border",
}
