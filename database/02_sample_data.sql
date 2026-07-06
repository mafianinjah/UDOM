-- =============================================================================
-- UDOM Delivery Management System
-- 02_sample_data.sql  —  Sample data insertion statements
-- Run after 01_schema.sql
-- =============================================================================
USE udom_delivery;

-- Roles ----------------------------------------------------------------------
INSERT INTO role (role_name, description) VALUES
  ('Administrator', 'Full system access and configuration'),
  ('Security Guard', 'Receives and releases deliveries at the gate'),
  ('Student', 'Receives notifications and collects deliveries');

-- Delivery categories --------------------------------------------------------
INSERT INTO delivery_category (category_name) VALUES
  ('Food'), ('Parcel'), ('Documents'), ('Medicine'), ('Others');

-- Delivery statuses ----------------------------------------------------------
INSERT INTO delivery_status (status_name) VALUES
  ('Pending'), ('Received'), ('Collected'), ('Cancelled');

-- Hostels --------------------------------------------------------------------
INSERT INTO hostel (hostel_id, hostel_name, block, capacity) VALUES
  ('H001', 'Mangaka',  'A', 320),
  ('H002', 'Nala',     'B', 280),
  ('H003', 'Chimwaga', 'C', 400),
  ('H004', 'Iyumbu',   'D', 250);

-- Students -------------------------------------------------------------------
INSERT INTO student (reg_number, full_name, phone_number, email, hostel_id, room_number) VALUES
  ('T21-03-01234', 'Amina Juma',    '+255712345678', 'amina.juma@udom.ac.tz',    'H001', 'A-104'),
  ('T21-03-05678', 'Baraka Mwenda', '+255754987210', 'baraka.mwenda@udom.ac.tz', 'H002', 'B-212'),
  ('T22-01-00987', 'Neema Kessy',   '+255786112004', 'neema.kessy@udom.ac.tz',   'H003', 'C-318'),
  ('T20-05-04521', 'Joseph Mushi',  '+255719550331', 'joseph.mushi@udom.ac.tz',  'H004', 'D-009'),
  ('T22-02-07788', 'Fatuma Ally',   '+255767220145', 'fatuma.ally@udom.ac.tz',   'H001', 'A-220');

-- Courier companies ----------------------------------------------------------
INSERT INTO courier_company (company_id, company_name, phone_number) VALUES
  ('C001', 'DHL Tanzania',       '+255222865000'),
  ('C002', 'Posta Tanzania',     '+255262321000'),
  ('C003', 'Fasthub Logistics',  '+255225501200'),
  ('C004', 'Piki Express',       '+255713400900');

-- Couriers -------------------------------------------------------------------
INSERT INTO courier (courier_id, full_name, company_id, phone_number, vehicle_number) VALUES
  ('K001', 'Said Ramadhani', 'C001', '+255715001220', 'T123 ABC'),
  ('K002', 'Grace Peter',    'C002', '+255758330447', 'T456 DEF'),
  ('K003', 'Emmanuel Loi',   'C003', '+255762889001', 'MC 889 K'),
  ('K004', 'Halima Said',    'C004', '+255719447552', 'MC 220 P');

-- Security guards ------------------------------------------------------------
INSERT INTO security_guard (guard_id, full_name, phone_number, shift, hostel_id) VALUES
  ('G001', 'John Mlaki',  '+255715900100', 'Day',   'H001'),
  ('G002', 'Mary Shija',  '+255754210887', 'Night', 'H002'),
  ('G003', 'Peter Ngoya', '+255786445220', 'Day',   'H003');

-- User accounts --------------------------------------------------------------
-- NOTE: password_hash values below are ILLUSTRATIVE bcrypt hashes.
-- In the application, generate hashes with password_hash($pwd, PASSWORD_BCRYPT).
INSERT INTO app_user (username, password_hash, role_id, reg_number, guard_id) VALUES
  ('admin',        '$2y$10$abcdefghijklmnopqrstuv0123456789ABCDEFGHIJKLMNOPqr', 1, NULL, NULL),
  ('guard.john',   '$2y$10$abcdefghijklmnopqrstuv0123456789ABCDEFGHIJKLMNOPqr', 2, NULL, 'G001'),
  ('guard.mary',   '$2y$10$abcdefghijklmnopqrstuv0123456789ABCDEFGHIJKLMNOPqr', 2, NULL, 'G002'),
  ('amina.juma',   '$2y$10$abcdefghijklmnopqrstuv0123456789ABCDEFGHIJKLMNOPqr', 3, 'T21-03-01234', NULL),
  ('neema.kessy',  '$2y$10$abcdefghijklmnopqrstuv0123456789ABCDEFGHIJKLMNOPqr', 3, 'T22-01-00987', NULL);

-- Deliveries -----------------------------------------------------------------
-- category_id: 1 Food, 2 Parcel, 3 Documents, 4 Medicine, 5 Others
-- status_id:   1 Pending, 2 Received, 3 Collected, 4 Cancelled
INSERT INTO delivery (reg_number, courier_id, guard_id, category_id, status_id, description, received_at, created_at) VALUES
  ('T21-03-01234', 'K001', 'G001', 2, 1, 'Medium box, electronics',       '2026-07-06 08:30:00', '2026-07-06 08:30:00'),
  ('T22-01-00987', 'K004', 'G003', 1, 2, 'Hot meal delivery',             '2026-07-06 07:15:00', '2026-07-06 07:10:00'),
  ('T21-03-05678', 'K002', 'G002', 3, 3, 'Official transcript envelope',  '2026-07-05 16:45:00', '2026-07-05 16:40:00'),
  ('T20-05-04521', 'K001', 'G001', 4, 3, 'Pharmacy package, refrigerated','2026-07-05 11:05:00', '2026-07-05 11:00:00'),
  ('T22-02-07788', 'K003', 'G001', 2, 4, 'Wrong address, returned',       '2026-07-04 09:20:00', '2026-07-04 09:15:00'),
  ('T22-01-00987', 'K004', 'G003', 2, 1, 'Small package',                 '2026-07-06 06:50:00', '2026-07-06 06:45:00');

-- Collections (for the two Collected deliveries: IDs 3 and 4) -----------------
INSERT INTO collection (delivery_id, collected_by, released_by, collected_at) VALUES
  (3, 'T21-03-05678', 'G002', '2026-07-05 18:20:00'),
  (4, 'T20-05-04521', 'G001', '2026-07-05 12:30:00');

-- Notifications --------------------------------------------------------------
INSERT INTO notification (delivery_id, reg_number, message, channel, is_read, sent_at) VALUES
  (1, 'T21-03-01234', 'Your parcel from DHL Tanzania has arrived at Mangaka gate. Please collect it.', 'SMS',   FALSE, '2026-07-06 08:31:00'),
  (2, 'T22-01-00987', 'Your food delivery has arrived at Chimwaga gate.',                              'App',   FALSE, '2026-07-06 07:16:00'),
  (3, 'T21-03-05678', 'Your documents were collected successfully. Thank you.',                        'Email', TRUE,  '2026-07-05 18:21:00');

-- Audit logs -----------------------------------------------------------------
INSERT INTO audit_log (user_id, action, entity, entity_id, ip_address, logged_at) VALUES
  (1, 'Registered new student T22-02-07788', 'Student',      'T22-02-07788', '10.0.0.10', '2026-07-06 08:00:00'),
  (2, 'Received delivery #1',                 'Delivery',     '1',            '10.0.0.21', '2026-07-06 08:30:00'),
  (NULL, 'Auto-sent notification #1',         'Notification', '1',            NULL,        '2026-07-06 08:31:00'),
  (3, 'Received delivery #2',                 'Delivery',     '2',            '10.0.0.22', '2026-07-06 07:15:00'),
  (4, 'Collected delivery #3',               'Delivery',     '3',            '10.0.0.40', '2026-07-05 18:20:00');
