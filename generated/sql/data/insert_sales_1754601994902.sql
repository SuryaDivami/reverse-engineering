-- Generated INSERT statements
-- Table: sales
-- Total rows: 7
-- Part: 1 of 1
-- Generated at: 2025-08-07T21:26:34.902Z
-- Dialect: POSTGRES
-- Batch size: 1000
-- Data masking: ENABLED

-- PostgreSQL specific settings
SET session_replication_role = replica;
-- Table: sales
-- Batch: 1
-- Rows: 7

INSERT INTO "sales" ("id", "customer_id", "region", "amount", "date")
VALUES
  (1   , 1            , 'North' , '1200.50', '2025-06-30T18:30:00.000Z'),
  (2   , 1            , 'North' , '800.00' , '2025-07-14T18:30:00.000Z'),
  (3   , 2            , 'South' , '500.00' , '2025-06-19T18:30:00.000Z'),
  (4   , 3            , 'East'  , '1500.75', '2025-07-09T18:30:00.000Z'),
  (5   , 4            , 'West'  , '2000.00', '2025-07-17T18:30:00.000Z'),
  (6   , 4            , 'West'  , '300.00' , '2025-06-27T18:30:00.000Z'),
  (7   , 5            , 'North' , '750.25' , '2025-05-29T18:30:00.000Z')
;
