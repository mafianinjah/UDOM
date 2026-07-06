-- =============================================================================
-- UDOM Delivery Management System (Hostel Premises)
-- 01_schema.sql  —  Database schema in Third Normal Form (3NF)
-- Target DBMS: MySQL 8.0+  (InnoDB, utf8mb4)
-- =============================================================================
-- This script creates the complete relational schema for managing deliveries
-- (Food, Parcel, Documents, Medicine, Others) made to students living in
-- University of Dodoma (UDOM) hostels.
-- =============================================================================

DROP DATABASE IF EXISTS udom_delivery;
CREATE DATABASE udom_delivery
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE udom_delivery;

-- -----------------------------------------------------------------------------
-- Table: role
-- Lookup of system roles. Normalised out of the users table (3NF) so that
-- role attributes are not repeated per user.
-- -----------------------------------------------------------------------------
CREATE TABLE role (
  role_id       TINYINT UNSIGNED AUTO_INCREMENT,
  role_name     VARCHAR(30) NOT NULL,
  description   VARCHAR(120),
  PRIMARY KEY (role_id),
  CONSTRAINT uq_role_name UNIQUE (role_name)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Table: hostel
-- Hostel information. A hostel groups many blocks/rooms and hosts many students.
-- -----------------------------------------------------------------------------
CREATE TABLE hostel (
  hostel_id     CHAR(5),                         -- e.g. H001
  hostel_name   VARCHAR(60) NOT NULL,
  block         VARCHAR(10) NOT NULL,
  capacity      SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (hostel_id),
  CONSTRAINT uq_hostel_name_block UNIQUE (hostel_name, block),
  CONSTRAINT chk_hostel_capacity CHECK (capacity >= 0)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Table: student
-- Student registration data. Each student belongs to exactly one hostel.
-- room_number is unique within a hostel (composite uniqueness).
-- -----------------------------------------------------------------------------
CREATE TABLE student (
  reg_number    VARCHAR(15),                     -- e.g. T21-03-01234
  full_name     VARCHAR(80)  NOT NULL,
  phone_number  VARCHAR(20)  NOT NULL,
  email         VARCHAR(120) NOT NULL,
  hostel_id     CHAR(5)      NOT NULL,
  room_number   VARCHAR(10)  NOT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (reg_number),
  CONSTRAINT uq_student_email UNIQUE (email),
  CONSTRAINT uq_student_phone UNIQUE (phone_number),
  CONSTRAINT uq_room_per_hostel UNIQUE (hostel_id, room_number),
  CONSTRAINT fk_student_hostel FOREIGN KEY (hostel_id)
    REFERENCES hostel (hostel_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Table: courier_company
-- Courier companies. One company employs many couriers (1:M).
-- -----------------------------------------------------------------------------
CREATE TABLE courier_company (
  company_id    CHAR(5),                         -- e.g. C001
  company_name  VARCHAR(80) NOT NULL,
  phone_number  VARCHAR(20),
  PRIMARY KEY (company_id),
  CONSTRAINT uq_company_name UNIQUE (company_name)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Table: courier
-- Delivery personnel. Each courier is linked to one company (3NF: company data
-- lives in courier_company, not repeated here).
-- -----------------------------------------------------------------------------
CREATE TABLE courier (
  courier_id    CHAR(5),                         -- e.g. K001
  full_name     VARCHAR(80) NOT NULL,
  company_id    CHAR(5)     NOT NULL,
  phone_number  VARCHAR(20) NOT NULL,
  vehicle_number VARCHAR(20),
  PRIMARY KEY (courier_id),
  CONSTRAINT fk_courier_company FOREIGN KEY (company_id)
    REFERENCES courier_company (company_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Table: security_guard
-- Guards who physically receive deliveries at the hostel gate.
-- -----------------------------------------------------------------------------
CREATE TABLE security_guard (
  guard_id      CHAR(5),                         -- e.g. G001
  full_name     VARCHAR(80) NOT NULL,
  phone_number  VARCHAR(20) NOT NULL,
  shift         ENUM('Day','Night') NOT NULL DEFAULT 'Day',
  hostel_id     CHAR(5)     NOT NULL,
  PRIMARY KEY (guard_id),
  CONSTRAINT fk_guard_hostel FOREIGN KEY (hostel_id)
    REFERENCES hostel (hostel_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Table: delivery_category
-- Lookup of delivery categories (Food, Parcel, Documents, Medicine, Others).
-- Normalised into its own table to allow easy extension.
-- -----------------------------------------------------------------------------
CREATE TABLE delivery_category (
  category_id   TINYINT UNSIGNED AUTO_INCREMENT,
  category_name VARCHAR(30) NOT NULL,
  PRIMARY KEY (category_id),
  CONSTRAINT uq_category_name UNIQUE (category_name)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Table: app_user
-- Login accounts and role management for Administrator, Security Guard, Student.
-- Passwords are stored ONLY as salted hashes (never plaintext).
-- Optional links to the student/guard the account represents.
-- -----------------------------------------------------------------------------
CREATE TABLE app_user (
  user_id       INT UNSIGNED AUTO_INCREMENT,
  username      VARCHAR(50)  NOT NULL,
  password_hash VARCHAR(255) NOT NULL,           -- bcrypt/argon2 hash
  role_id       TINYINT UNSIGNED NOT NULL,
  reg_number    VARCHAR(15)  NULL,               -- set when role = Student
  guard_id      CHAR(5)      NULL,               -- set when role = Security Guard
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  last_login    TIMESTAMP NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT uq_username UNIQUE (username),
  CONSTRAINT fk_user_role FOREIGN KEY (role_id)
    REFERENCES role (role_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_user_student FOREIGN KEY (reg_number)
    REFERENCES student (reg_number)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_user_guard FOREIGN KEY (guard_id)
    REFERENCES security_guard (guard_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Table: delivery_status
-- Lookup of delivery statuses (Pending, Received, Collected, Cancelled).
-- -----------------------------------------------------------------------------
CREATE TABLE delivery_status (
  status_id     TINYINT UNSIGNED AUTO_INCREMENT,
  status_name   VARCHAR(20) NOT NULL,
  PRIMARY KEY (status_id),
  CONSTRAINT uq_status_name UNIQUE (status_name)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Table: delivery
-- Central fact table. Each delivery is for one student, brought by one courier,
-- received by one guard, belongs to one category and has one current status.
-- -----------------------------------------------------------------------------
CREATE TABLE delivery (
  delivery_id   INT UNSIGNED AUTO_INCREMENT,
  reg_number    VARCHAR(15)      NOT NULL,       -- recipient student
  courier_id    CHAR(5)          NOT NULL,       -- who delivered
  guard_id      CHAR(5)          NOT NULL,       -- who received at gate
  category_id   TINYINT UNSIGNED NOT NULL,
  status_id     TINYINT UNSIGNED NOT NULL,
  description   VARCHAR(255),
  received_at   TIMESTAMP NULL,                  -- when guard received it
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (delivery_id),
  CONSTRAINT fk_delivery_student FOREIGN KEY (reg_number)
    REFERENCES student (reg_number)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_delivery_courier FOREIGN KEY (courier_id)
    REFERENCES courier (courier_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_delivery_guard FOREIGN KEY (guard_id)
    REFERENCES security_guard (guard_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_delivery_category FOREIGN KEY (category_id)
    REFERENCES delivery_category (category_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_delivery_status FOREIGN KEY (status_id)
    REFERENCES delivery_status (status_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Table: collection
-- A collection record is created when a student picks up a delivery.
-- 1:1 with delivery (a delivery is collected at most once).
-- -----------------------------------------------------------------------------
CREATE TABLE collection (
  collection_id  INT UNSIGNED AUTO_INCREMENT,
  delivery_id    INT UNSIGNED NOT NULL,
  collected_by   VARCHAR(15)  NOT NULL,          -- reg_number of collector
  released_by    CHAR(5)      NOT NULL,          -- guard who released it
  collected_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (collection_id),
  CONSTRAINT uq_collection_delivery UNIQUE (delivery_id),
  CONSTRAINT fk_collection_delivery FOREIGN KEY (delivery_id)
    REFERENCES delivery (delivery_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_collection_student FOREIGN KEY (collected_by)
    REFERENCES student (reg_number)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_collection_guard FOREIGN KEY (released_by)
    REFERENCES security_guard (guard_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Table: notification
-- Messages sent to students about their deliveries.
-- -----------------------------------------------------------------------------
CREATE TABLE notification (
  notification_id INT UNSIGNED AUTO_INCREMENT,
  delivery_id     INT UNSIGNED NOT NULL,
  reg_number      VARCHAR(15)  NOT NULL,
  message         VARCHAR(255) NOT NULL,
  channel         ENUM('SMS','Email','App') NOT NULL DEFAULT 'SMS',
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notification_id),
  CONSTRAINT fk_notification_delivery FOREIGN KEY (delivery_id)
    REFERENCES delivery (delivery_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_notification_student FOREIGN KEY (reg_number)
    REFERENCES student (reg_number)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Table: audit_log
-- Tracks all significant system activities for accountability/security.
-- -----------------------------------------------------------------------------
CREATE TABLE audit_log (
  log_id        BIGINT UNSIGNED AUTO_INCREMENT,
  user_id       INT UNSIGNED NULL,               -- NULL for system-generated
  action        VARCHAR(150) NOT NULL,
  entity        VARCHAR(40)  NOT NULL,           -- table/domain affected
  entity_id     VARCHAR(40),                     -- PK of affected row
  ip_address    VARCHAR(45),
  logged_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (log_id),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id)
    REFERENCES app_user (user_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- =============================================================================
-- Recommended indexes for performance optimisation
-- (PK/UNIQUE columns are already indexed; these target frequent query paths.)
-- =============================================================================
CREATE INDEX idx_delivery_status      ON delivery (status_id);
CREATE INDEX idx_delivery_student     ON delivery (reg_number);
CREATE INDEX idx_delivery_courier     ON delivery (courier_id);
CREATE INDEX idx_delivery_category    ON delivery (category_id);
CREATE INDEX idx_delivery_created     ON delivery (created_at);
CREATE INDEX idx_student_hostel       ON student (hostel_id);
CREATE INDEX idx_courier_company      ON courier (company_id);
CREATE INDEX idx_notification_student ON notification (reg_number, is_read);
CREATE INDEX idx_collection_date      ON collection (collected_at);
CREATE INDEX idx_audit_logged_at      ON audit_log (logged_at);
CREATE INDEX idx_audit_entity         ON audit_log (entity, entity_id);
