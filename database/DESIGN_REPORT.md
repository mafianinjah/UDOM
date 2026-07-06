# UDOM Delivery Management System — Database Design Report

**Delivery Management System for Hostel Premises at the University of Dodoma (UDOM)**
Target implementation: **MySQL 8.0**, application layer in **PHP + Bootstrap**.
(The included web app in this repository is a Next.js reference UI; the schema below is the authoritative database design and maps directly to it.)

---

## 1. Problem Analysis

Deliveries (food, parcels, documents, medicine and other items) arrive daily at UDOM hostel gates. Currently they are handled manually: guards keep paper logs, students are informed informally, and there is no reliable record of who received or collected what. This causes lost items, disputes, delays, and no accountability trail. A centralized Delivery Management System (DMS) is required to register deliveries at the gate, notify students automatically, track collection, and provide reports and audit trails.

## 2. Functional Requirements

1. Register students with hostel, block and room details.
2. Maintain hostels, courier companies, couriers and security guards.
3. Record each incoming delivery with category and description.
4. Track delivery status: **Pending → Received → Collected / Cancelled**.
5. Send notifications to students when deliveries arrive/are collected.
6. Record collection details (who collected, which guard released, date/time).
7. Manage user accounts and roles (Administrator, Security Guard, Student).
8. Authenticate users and enforce role-based authorization.
9. Produce reports (pending items, per-hostel volume, courier performance, etc.).
10. Maintain an audit log of all significant activities.

## 3. Non-Functional Requirements

- **Security:** hashed passwords, role-based access, SQL-injection prevention.
- **Integrity:** enforced via primary keys, foreign keys, unique and check constraints.
- **Performance:** indexed on frequent query paths; sub-second reporting on realistic volumes.
- **Reliability:** ACID transactions (InnoDB) for register/collect operations.
- **Usability:** responsive Bootstrap UI, clear status badges.
- **Maintainability:** normalized schema (3NF), lookup tables for enumerations.
- **Auditability:** immutable audit log of user/system actions.

## 4. Context Diagram (Level 0 / System Boundary)

```
                 +-----------------------------------------------+
   Student  ---->|                                               |----> Notifications
                 |        UDOM Delivery Management System         |
   Courier  ---->|   (register, track, notify, collect, report)  |----> Reports
                 |                                               |
 Security Guard->|                                               |<---- Login/Roles
                 +-----------------------------------------------+
                                     ^
                                     |
                                Administrator
```

## 5. Data Flow Diagram

**Level 0 (single process):** External entities (Student, Courier, Security Guard, Administrator) exchange data with process **P0 — Manage Deliveries**, backed by the data stores below.

**Level 1 (decomposed processes):**

```
P1 Register Delivery ---> D1 Delivery, D2 Notification, D6 Audit Log
P2 Notify Student    ---> D2 Notification  --> Student
P3 Collect Parcel    ---> D3 Collection, D1 Delivery(update), D6 Audit Log
P4 Manage Accounts   ---> D4 App User, D5 Role, D6 Audit Log
P5 Generate Reports  <--- D1 Delivery, D3 Collection, ...
```

Data stores: **D1** delivery, **D2** notification, **D3** collection, **D4** app_user, **D5** role, **D6** audit_log (plus master data: student, hostel, courier, courier_company, security_guard).

## 6. Entity Relationship Diagram (ERD)

```
HOSTEL 1───∞ STUDENT ───∞ 1 (recipient)
   │                         │
   │ 1                       │ 1
   ∞                         ∞
SECURITY_GUARD 1──∞ DELIVERY ∞──1 DELIVERY_CATEGORY
   │  (receives)     │  │ │ ∞
   │                 │  │ │ └──1 DELIVERY_STATUS
   │ 1               │  │ └────∞ NOTIFICATION ∞──1 STUDENT
   ∞ (releases)      │  │
COLLECTION 1───1 DELIVERY (a delivery is collected at most once)
                     │ ∞
COURIER_COMPANY 1──∞ COURIER 1──∞ DELIVERY

ROLE 1───∞ APP_USER ∞───1 (optional) STUDENT
                    ∞───1 (optional) SECURITY_GUARD
APP_USER 1───∞ AUDIT_LOG
```

### Relationship Cardinalities

| Relationship | Cardinality | Notes |
|---|---|---|
| Hostel → Student | 1:M | A hostel houses many students |
| Hostel → Security Guard | 1:M | A hostel has many guards |
| Student → Delivery | 1:M | A student receives many deliveries |
| Courier Company → Courier | 1:M | A company employs many couriers |
| Courier → Delivery | 1:M | A courier brings many deliveries |
| Security Guard → Delivery | 1:M | A guard receives many deliveries |
| Delivery Category → Delivery | 1:M | Each delivery has one category |
| Delivery Status → Delivery | 1:M | Each delivery has one current status |
| Delivery → Collection | 1:1 | A delivery is collected at most once |
| Delivery → Notification | 1:M | A delivery may trigger many notifications |
| Role → App User | 1:M | A role is held by many users |
| App User → Audit Log | 1:M | A user generates many log entries |
| Student ↔ Courier (via Delivery) | M:N | Resolved by the `delivery` associative table |

The only inherent **M:N** relationship (students receive from many couriers, couriers serve many students) is resolved through the `delivery` table, which carries its own attributes.

## 7. Normalization (1NF → 3NF)

**Unnormalized (UNF):** a single "delivery slip" holding student name, phone, hostel, block, room, courier name, company, company phone, guard name, category, status, description, collection date — with repeating and derived data.

- **1NF:** eliminate repeating groups; every attribute atomic; a primary key defined. All tables have single-valued columns and a PK.
- **2NF:** remove partial dependencies. Because we use single-column surrogate/natural keys (e.g. `delivery_id`), no non-key attribute depends on part of a composite key. Master entities (student, courier, hostel) are separated so their attributes depend on their own key only.
- **3NF:** remove transitive dependencies. For example, *company_name* and *company phone* depend on the company, not on the courier — so they live in `courier_company`, not `courier`. *Hostel name/block/capacity* depend on the hostel, not the student — so they live in `hostel`. Category and status names are moved to `delivery_category` and `delivery_status` lookups rather than repeated per delivery. No non-key attribute depends on another non-key attribute.

Result: every non-key attribute depends on **the key, the whole key, and nothing but the key**.

## 8. Data Dictionary (selected core tables)

**student**

| Attribute | Type | Key | Constraint |
|---|---|---|---|
| reg_number | VARCHAR(15) | PK | e.g. T21-03-01234 |
| full_name | VARCHAR(80) | | NOT NULL |
| phone_number | VARCHAR(20) | | UNIQUE, NOT NULL |
| email | VARCHAR(120) | | UNIQUE, NOT NULL |
| hostel_id | CHAR(5) | FK→hostel | NOT NULL |
| room_number | VARCHAR(10) | | UNIQUE within hostel |

**delivery**

| Attribute | Type | Key | Constraint |
|---|---|---|---|
| delivery_id | INT UNSIGNED | PK | AUTO_INCREMENT |
| reg_number | VARCHAR(15) | FK→student | NOT NULL |
| courier_id | CHAR(5) | FK→courier | NOT NULL |
| guard_id | CHAR(5) | FK→security_guard | NOT NULL |
| category_id | TINYINT | FK→delivery_category | NOT NULL |
| status_id | TINYINT | FK→delivery_status | NOT NULL |
| description | VARCHAR(255) | | nullable |
| received_at | TIMESTAMP | | nullable |
| created_at | TIMESTAMP | | DEFAULT NOW() |

**collection**

| Attribute | Type | Key | Constraint |
|---|---|---|---|
| collection_id | INT UNSIGNED | PK | AUTO_INCREMENT |
| delivery_id | INT UNSIGNED | FK→delivery | UNIQUE (1:1) |
| collected_by | VARCHAR(15) | FK→student | NOT NULL |
| released_by | CHAR(5) | FK→security_guard | NOT NULL |
| collected_at | TIMESTAMP | | DEFAULT NOW() |

*(Full column lists for every table are in `01_schema.sql`.)*

## 9. Relational Schema (textual)

```
role(role_id PK, role_name, description)
hostel(hostel_id PK, hostel_name, block, capacity)
student(reg_number PK, full_name, phone_number, email, hostel_id FK, room_number)
courier_company(company_id PK, company_name, phone_number)
courier(courier_id PK, full_name, company_id FK, phone_number, vehicle_number)
security_guard(guard_id PK, full_name, phone_number, shift, hostel_id FK)
delivery_category(category_id PK, category_name)
delivery_status(status_id PK, status_name)
app_user(user_id PK, username, password_hash, role_id FK, reg_number FK, guard_id FK, is_active, last_login)
delivery(delivery_id PK, reg_number FK, courier_id FK, guard_id FK, category_id FK, status_id FK, description, received_at, created_at)
collection(collection_id PK, delivery_id FK/UNIQUE, collected_by FK, released_by FK, collected_at)
notification(notification_id PK, delivery_id FK, reg_number FK, message, channel, is_read, sent_at)
audit_log(log_id PK, user_id FK, action, entity, entity_id, ip_address, logged_at)
```

## 10. SQL Implementation

- `01_schema.sql` — `CREATE DATABASE`, all `CREATE TABLE` statements, constraints, indexes.
- `02_sample_data.sql` — `INSERT` sample records for every table.
- `03_procedures_triggers.sql` — stored procedures (`sp_register_delivery`, `sp_collect_parcel`) and triggers (auto-set Received, auto-Collected on collection, status-change auditing).
- `04_reports.sql` — five complex reporting queries.

**Run order (MySQL CLI):**
```bash
mysql -u root -p < 01_schema.sql
mysql -u root -p udom_delivery < 02_sample_data.sql
mysql -u root -p udom_delivery < 03_procedures_triggers.sql
mysql -u root -p udom_delivery < 04_reports.sql
```

## 11. Database Security

- **Authentication:** each user has a unique username and a **hashed** password (`password_hash()` with bcrypt/argon2 in PHP; `password_verify()` on login). Never store plaintext.
- **Authorization:** role-based access via the `role` table; the application restricts pages/actions per role (Administrator, Security Guard, Student). Create least-privilege MySQL accounts (e.g. an app account with only `SELECT/INSERT/UPDATE` on needed tables, no `DROP`).
- **SQL-injection prevention:** use **prepared statements / parameterized queries** (PDO or MySQLi) exclusively; never concatenate user input into SQL.
- **Input validation & sanitization** on the server side; output encoding to prevent XSS.
- **Transport security:** serve the app over HTTPS; store secrets outside the web root.
- **Auditing:** `audit_log` records who did what and when; status changes are logged automatically by trigger.
- **Data integrity:** enforced by FK, UNIQUE and CHECK constraints so invalid states cannot be persisted.

## 12. System Architecture

Three-tier architecture:

```
[ Presentation ]  Bootstrap + PHP views (browser)           <-- Students, Guards, Admin
        |
[ Application  ]  PHP controllers, business logic,
                  prepared statements, password hashing,
                  session & role management
        |
[ Data         ]  MySQL 8 (InnoDB) — tables, views,
                  stored procedures, triggers, indexes
```

## 13. Backup and Recovery Strategy

- **Daily logical backups** with `mysqldump` (schema + data), retained 30 days, stored off-server.
  `mysqldump -u root -p --single-transaction --routines --triggers udom_delivery > udom_$(date +%F).sql`
- **Binary logging enabled** (`log_bin`) for **point-in-time recovery** between full backups.
- **Weekly full physical backup** (e.g. Percona XtraBackup) for faster restore of large data.
- **Off-site / cloud copy** of backups; periodic **restore drills** to verify recoverability.
- Documented **RPO** (≤ 24h via daily dump, near-zero with binlogs) and **RTO** targets.

## 14. Assumptions and Limitations

- One student occupies one room; a delivery has a single recipient student.
- A delivery is collected at most once (enforced by `UNIQUE(delivery_id)` in `collection`).
- Notification sending (SMS/Email gateway) is triggered by the app; the DB records the notification.
- Illustrative password hashes in the sample data are placeholders, not real credentials.
- The system covers hostel-gate deliveries, not last-mile logistics tracking.

## 15. Recommendations for Future Improvements

- Add OTP-based collection confirmation and QR codes on delivery slips.
- Real SMS/Email gateway integration and delivery-status webhooks.
- Analytics dashboard with historical trends and SLA monitoring per courier.
- Multi-campus support and soft-delete/archival with retention policies.
- Read replicas and partitioning of `delivery`/`audit_log` for large-scale growth.

## 16. How Each Table Contributes (Justification)

- **role / app_user** — authentication and role-based authorization; separating role attributes avoids repetition (3NF).
- **hostel** — single source of truth for hostel data referenced by students and guards.
- **student** — recipient master data; foreign key to hostel keeps location normalized.
- **courier_company / courier** — separates company facts from courier facts, removing transitive dependency.
- **security_guard** — records accountability for who received/released items.
- **delivery_category / delivery_status** — lookups that make the design extensible and keep the fact table lean.
- **delivery** — the central associative/fact table resolving the M:N between students and couriers and carrying delivery attributes.
- **collection** — captures the pickup event (1:1 with delivery) with time and responsible parties.
- **notification** — records all messages sent to students, decoupled from delivery state.
- **audit_log** — provides a tamper-evident activity trail for security and dispute resolution.

Together these tables deliver a normalized, secure, and auditable foundation for managing UDOM hostel deliveries end to end.
