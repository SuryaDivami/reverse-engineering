-- Generated INSERT statements
-- Table: report
-- Total rows: 2
-- Part: 1 of 1
-- Generated at: 2025-08-07T21:26:34.767Z
-- Dialect: POSTGRES
-- Batch size: 1000
-- Data masking: ENABLED

-- PostgreSQL specific settings
SET session_replication_role = replica;
-- Table: report
-- Batch: 1
-- Rows: 2

INSERT INTO "report" ("id", "name", "label", "end_point", "query", "created_at", "updated_at", "deleted_at", "created_by", "updated_by", "deleted_by", "order_no")
VALUES
  (1   , 'sales_summary', 'Sales Summary Report', '/reports/sales-summary', 'SELECT region, SUM(amount) AS total_sales FROM sales WHERE date BETWEEN :start_date AND :end_date GROUP BY region', '2025-08-05T08:33:48.971Z', '2025-08-05T08:33:48.971Z', NULL        , 'admin'     , 'admin'     , NULL        , 1         ),
  (2   , 'customer_list', 'Customer List Report', '/reports/customers'    , 'SELECT id, name, email, created_at FROM customers WHERE status = :status'                                         , '2025-08-05T08:33:48.971Z', '2025-08-05T08:33:48.971Z', NULL        , 'admin'     , 'admin'     , NULL        , 2         )
;
