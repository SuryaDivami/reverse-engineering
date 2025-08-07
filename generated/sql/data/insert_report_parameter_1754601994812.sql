-- Generated INSERT statements
-- Table: report_parameter
-- Total rows: 3
-- Part: 1 of 1
-- Generated at: 2025-08-07T21:26:34.812Z
-- Dialect: POSTGRES
-- Batch size: 1000
-- Data masking: ENABLED

-- PostgreSQL specific settings
SET session_replication_role = replica;
-- Table: report_parameter
-- Batch: 1
-- Rows: 3

INSERT INTO "report_parameter" ("id", "report_id", "parameter_name", "label", "data_type", "created_at", "updated_at", "deleted_at", "created_by", "updated_by", "deleted_by", "query_parameter", "input_field_type", "option_type", "option", "order_no")
VALUES
  (1   , 1          , 'start_date'    , 'Start Date'     , 'date'     , '2025-08-05T08:34:02.220Z', '2025-08-05T08:34:02.220Z', NULL        , 'admin'     , 'admin'     , NULL        , ':start_date'    , 'date-picker'     , 'static'     , NULL                                                                           , 1         ),
  (2   , 1          , 'end_date'      , 'End Date'       , 'date'     , '2025-08-05T08:34:02.220Z', '2025-08-05T08:34:02.220Z', NULL        , 'admin'     , 'admin'     , NULL        , ':end_date'      , 'date-picker'     , 'static'     , NULL                                                                           , 2         ),
  (3   , 2          , 'status'        , 'Customer Status', 'string'   , '2025-08-05T08:34:02.220Z', '2025-08-05T08:34:02.220Z', NULL        , 'admin'     , 'admin'     , NULL        , ':status'        , 'dropdown'        , 'static'     , '[{"label":"Active","value":"active"},{"label":"Inactive","value":"inactive"}]', 1         )
;
