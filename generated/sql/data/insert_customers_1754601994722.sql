-- Generated INSERT statements
-- Table: customers
-- Total rows: 5
-- Part: 1 of 1
-- Generated at: 2025-08-07T21:26:34.722Z
-- Dialect: POSTGRES
-- Batch size: 1000
-- Data masking: ENABLED

-- PostgreSQL specific settings
SET session_replication_role = replica;
-- Table: customers
-- Batch: 1
-- Rows: 5

INSERT INTO "customers" ("id", "name", "email", "status", "created_at")
VALUES
  (1   , 'Alice Johnson', 'user78@example.com' , 'active'  , '2025-01-09T18:30:00.000Z'),
  (2   , 'Bob Smith'    , 'user732@example.com', 'inactive', '2025-02-14T18:30:00.000Z'),
  (3   , 'Charlie Brown', 'user469@example.com', 'active'  , '2025-03-19T18:30:00.000Z'),
  (4   , 'Diana Prince' , 'user816@example.com', 'active'  , '2025-04-04T18:30:00.000Z'),
  (5   , 'Ethan Hunt'   , 'user875@example.com', 'inactive', '2025-05-11T18:30:00.000Z')
;
