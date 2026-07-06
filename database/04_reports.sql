-- =============================================================================
-- UDOM Delivery Management System
-- 04_reports.sql  —  Five complex SQL queries for reporting
-- =============================================================================
USE udom_delivery;

-- -----------------------------------------------------------------------------
-- REPORT 1: Pending / uncollected deliveries older than 24 hours, with the
-- student's contact details and hostel location (for follow-up reminders).
-- Demonstrates: multi-table JOIN, date arithmetic, filtering by status.
-- -----------------------------------------------------------------------------
SELECT  d.delivery_id,
        s.full_name,
        s.phone_number,
        h.hostel_name,
        s.room_number,
        dc.category_name,
        d.received_at,
        TIMESTAMPDIFF(HOUR, d.received_at, NOW()) AS hours_waiting
FROM    delivery d
JOIN    student s           ON s.reg_number = d.reg_number
JOIN    hostel h            ON h.hostel_id  = s.hostel_id
JOIN    delivery_category dc ON dc.category_id = d.category_id
JOIN    delivery_status ds  ON ds.status_id = d.status_id
WHERE   ds.status_name IN ('Pending','Received')
  AND   d.received_at < (NOW() - INTERVAL 24 HOUR)
ORDER BY hours_waiting DESC;

-- -----------------------------------------------------------------------------
-- REPORT 2: Delivery volume and collection rate per hostel.
-- Demonstrates: aggregation, conditional SUM, computed percentage.
-- -----------------------------------------------------------------------------
SELECT  h.hostel_name,
        COUNT(*)                                                   AS total_deliveries,
        SUM(ds.status_name = 'Collected')                         AS collected,
        SUM(ds.status_name IN ('Pending','Received'))             AS awaiting,
        SUM(ds.status_name = 'Cancelled')                         AS cancelled,
        ROUND(100 * SUM(ds.status_name = 'Collected') / COUNT(*), 1) AS collection_rate_pct
FROM    delivery d
JOIN    student s          ON s.reg_number = d.reg_number
JOIN    hostel h           ON h.hostel_id  = s.hostel_id
JOIN    delivery_status ds ON ds.status_id = d.status_id
GROUP BY h.hostel_id, h.hostel_name
ORDER BY total_deliveries DESC;

-- -----------------------------------------------------------------------------
-- REPORT 3: Courier company performance — average time from receipt to
-- collection (in hours) and total handled.
-- Demonstrates: JOIN to collection, AVG over TIMESTAMPDIFF, HAVING.
-- -----------------------------------------------------------------------------
SELECT  cc.company_name,
        COUNT(d.delivery_id)                                            AS deliveries_handled,
        ROUND(AVG(TIMESTAMPDIFF(HOUR, d.received_at, col.collected_at)),1) AS avg_hours_to_collect
FROM    delivery d
JOIN    courier c          ON c.courier_id = d.courier_id
JOIN    courier_company cc ON cc.company_id = c.company_id
LEFT JOIN collection col   ON col.delivery_id = d.delivery_id
GROUP BY cc.company_id, cc.company_name
HAVING  deliveries_handled > 0
ORDER BY avg_hours_to_collect IS NULL, avg_hours_to_collect ASC;

-- -----------------------------------------------------------------------------
-- REPORT 4: Top students by number of deliveries received, including a
-- breakdown of their most common category (correlated subquery).
-- Demonstrates: GROUP BY, correlated subquery, LIMIT.
-- -----------------------------------------------------------------------------
SELECT  s.reg_number,
        s.full_name,
        COUNT(d.delivery_id) AS total_deliveries,
        (SELECT dc.category_name
           FROM delivery d2
           JOIN delivery_category dc ON dc.category_id = d2.category_id
          WHERE d2.reg_number = s.reg_number
          GROUP BY dc.category_id
          ORDER BY COUNT(*) DESC
          LIMIT 1)          AS top_category
FROM    student s
JOIN    delivery d ON d.reg_number = s.reg_number
GROUP BY s.reg_number, s.full_name
ORDER BY total_deliveries DESC
LIMIT 10;

-- -----------------------------------------------------------------------------
-- REPORT 5: Daily deliveries received in the last 7 days by category
-- (pivot-style report using conditional aggregation).
-- Demonstrates: DATE grouping, CASE-based pivot.
-- -----------------------------------------------------------------------------
SELECT  DATE(d.created_at)                                       AS delivery_date,
        SUM(dc.category_name = 'Food')     AS food,
        SUM(dc.category_name = 'Parcel')   AS parcel,
        SUM(dc.category_name = 'Documents')AS documents,
        SUM(dc.category_name = 'Medicine') AS medicine,
        SUM(dc.category_name = 'Others')   AS others,
        COUNT(*)                            AS total
FROM    delivery d
JOIN    delivery_category dc ON dc.category_id = d.category_id
WHERE   d.created_at >= (CURDATE() - INTERVAL 7 DAY)
GROUP BY DATE(d.created_at)
ORDER BY delivery_date DESC;
