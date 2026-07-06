-- =============================================================================
-- UDOM Delivery Management System
-- 03_procedures_triggers.sql  —  Stored procedures & triggers
-- Run after 01_schema.sql and 02_sample_data.sql
-- =============================================================================
USE udom_delivery;

-- =============================================================================
-- STORED PROCEDURE 1: sp_register_delivery
-- Registers a new incoming delivery, sets status to 'Received', queues a
-- notification for the student, and writes an audit entry — all atomically.
-- =============================================================================
DROP PROCEDURE IF EXISTS sp_register_delivery;
DELIMITER //
CREATE PROCEDURE sp_register_delivery (
  IN  p_reg_number   VARCHAR(15),
  IN  p_courier_id   CHAR(5),
  IN  p_guard_id     CHAR(5),
  IN  p_category     VARCHAR(30),
  IN  p_description  VARCHAR(255),
  IN  p_user_id      INT UNSIGNED,
  OUT p_delivery_id  INT UNSIGNED
)
BEGIN
  DECLARE v_category_id TINYINT UNSIGNED;
  DECLARE v_received_id TINYINT UNSIGNED;
  DECLARE v_student     VARCHAR(80);
  DECLARE v_company     VARCHAR(80);

  -- Roll back everything on any error
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  SELECT category_id INTO v_category_id
    FROM delivery_category WHERE category_name = p_category;
  SELECT status_id INTO v_received_id
    FROM delivery_status WHERE status_name = 'Received';

  IF v_category_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Unknown delivery category';
  END IF;

  INSERT INTO delivery (reg_number, courier_id, guard_id, category_id,
                        status_id, description, received_at)
  VALUES (p_reg_number, p_courier_id, p_guard_id, v_category_id,
          v_received_id, p_description, NOW());

  SET p_delivery_id = LAST_INSERT_ID();

  -- Build a friendly notification message
  SELECT s.full_name, cc.company_name INTO v_student, v_company
    FROM student s
    JOIN courier c        ON c.courier_id = p_courier_id
    JOIN courier_company cc ON cc.company_id = c.company_id
   WHERE s.reg_number = p_reg_number;

  INSERT INTO notification (delivery_id, reg_number, message, channel)
  VALUES (p_delivery_id, p_reg_number,
          CONCAT('Hello ', v_student, ', your ', p_category,
                 ' from ', v_company, ' has arrived. Please collect it at the gate.'),
          'SMS');

  INSERT INTO audit_log (user_id, action, entity, entity_id)
  VALUES (p_user_id, CONCAT('Registered delivery #', p_delivery_id),
          'Delivery', CAST(p_delivery_id AS CHAR));

  COMMIT;
END //
DELIMITER ;

-- =============================================================================
-- STORED PROCEDURE 2: sp_collect_parcel
-- Records a parcel collection, updates the delivery status to 'Collected',
-- marks the student's notification as read, and writes an audit entry.
-- =============================================================================
DROP PROCEDURE IF EXISTS sp_collect_parcel;
DELIMITER //
CREATE PROCEDURE sp_collect_parcel (
  IN p_delivery_id INT UNSIGNED,
  IN p_guard_id    CHAR(5),
  IN p_user_id     INT UNSIGNED
)
BEGIN
  DECLARE v_reg_number VARCHAR(15);
  DECLARE v_status     VARCHAR(20);
  DECLARE v_collected  TINYINT UNSIGNED;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  SELECT d.reg_number, ds.status_name
    INTO v_reg_number, v_status
    FROM delivery d
    JOIN delivery_status ds ON ds.status_id = d.status_id
   WHERE d.delivery_id = p_delivery_id
   FOR UPDATE;

  IF v_reg_number IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Delivery not found';
  END IF;
  IF v_status = 'Collected' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Delivery already collected';
  END IF;
  IF v_status = 'Cancelled' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot collect a cancelled delivery';
  END IF;

  SELECT status_id INTO v_collected
    FROM delivery_status WHERE status_name = 'Collected';

  INSERT INTO collection (delivery_id, collected_by, released_by)
  VALUES (p_delivery_id, v_reg_number, p_guard_id);

  UPDATE delivery SET status_id = v_collected
   WHERE delivery_id = p_delivery_id;

  UPDATE notification SET is_read = TRUE
   WHERE delivery_id = p_delivery_id;

  INSERT INTO audit_log (user_id, action, entity, entity_id)
  VALUES (p_user_id, CONCAT('Collected delivery #', p_delivery_id),
          'Delivery', CAST(p_delivery_id AS CHAR));

  COMMIT;
END //
DELIMITER ;

-- =============================================================================
-- TRIGGER 1: trg_delivery_set_received
-- When a delivery is inserted with a received_at time but left as 'Pending',
-- automatically promote its status to 'Received'.
-- =============================================================================
DROP TRIGGER IF EXISTS trg_delivery_set_received;
DELIMITER //
CREATE TRIGGER trg_delivery_set_received
BEFORE INSERT ON delivery
FOR EACH ROW
BEGIN
  DECLARE v_pending  TINYINT UNSIGNED;
  DECLARE v_received TINYINT UNSIGNED;
  SELECT status_id INTO v_pending  FROM delivery_status WHERE status_name = 'Pending';
  SELECT status_id INTO v_received FROM delivery_status WHERE status_name = 'Received';
  IF NEW.received_at IS NOT NULL AND NEW.status_id = v_pending THEN
    SET NEW.status_id = v_received;
  END IF;
END //
DELIMITER ;

-- =============================================================================
-- TRIGGER 2: trg_collection_after_insert
-- When a collection row is inserted, automatically flip the related delivery
-- to 'Collected' (keeps status in sync even if updated outside the procedure).
-- =============================================================================
DROP TRIGGER IF EXISTS trg_collection_after_insert;
DELIMITER //
CREATE TRIGGER trg_collection_after_insert
AFTER INSERT ON collection
FOR EACH ROW
BEGIN
  DECLARE v_collected TINYINT UNSIGNED;
  SELECT status_id INTO v_collected FROM delivery_status WHERE status_name = 'Collected';
  UPDATE delivery
     SET status_id = v_collected
   WHERE delivery_id = NEW.delivery_id
     AND status_id <> v_collected;
END //
DELIMITER ;

-- =============================================================================
-- TRIGGER 3: trg_delivery_status_audit
-- Writes an audit row automatically whenever a delivery's status changes.
-- =============================================================================
DROP TRIGGER IF EXISTS trg_delivery_status_audit;
DELIMITER //
CREATE TRIGGER trg_delivery_status_audit
AFTER UPDATE ON delivery
FOR EACH ROW
BEGIN
  IF OLD.status_id <> NEW.status_id THEN
    INSERT INTO audit_log (user_id, action, entity, entity_id)
    VALUES (NULL,
            CONCAT('Delivery #', NEW.delivery_id, ' status changed'),
            'Delivery', CAST(NEW.delivery_id AS CHAR));
  END IF;
END //
DELIMITER ;

-- =============================================================================
-- Example calls
-- =============================================================================
-- CALL sp_register_delivery('T21-03-01234','K001','G001','Parcel','Book package', 1, @new_id);
-- SELECT @new_id;
-- CALL sp_collect_parcel(@new_id, 'G001', 1);
