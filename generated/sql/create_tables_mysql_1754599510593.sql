-- Generated CREATE TABLE scripts
-- Dialect: MYSQL
-- Generated at: 2025-08-07T20:45:10.589Z
-- Total tables: 6

-- MySQL specific settings
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- Table: `customers`

CREATE TABLE IF NOT EXISTS `customers` (
  `id` INTEGER NOT NULL DEFAULT nextval('customers_id_seq'::regclass) AUTO_INCREMENT,
  `name` CHARACTER VARYING(255) NOT NULL,
  `email` CHARACTER VARYING(255) NOT NULL,
  `status` CHARACTER VARYING(50) NOT NULL,
  `created_at` TIMESTAMP WITHOUT TIME ZONE DEFAULT 'CURRENT_TIMESTAMP'
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

-- ===================================

-- Table: `report`

CREATE TABLE IF NOT EXISTS `report` (
  `id` INTEGER NOT NULL DEFAULT nextval('report_id_seq'::regclass) AUTO_INCREMENT,
  `name` CHARACTER VARYING(255),
  `label` CHARACTER VARYING(255),
  `end_point` CHARACTER VARYING(255),
  `query` TEXT,
  `created_at` TIMESTAMP WITHOUT TIME ZONE DEFAULT 'CURRENT_TIMESTAMP',
  `updated_at` TIMESTAMP WITHOUT TIME ZONE DEFAULT 'CURRENT_TIMESTAMP',
  `deleted_at` TIMESTAMP WITHOUT TIME ZONE,
  `created_by` CHARACTER VARYING(255),
  `updated_by` CHARACTER VARYING(255),
  `deleted_by` CHARACTER VARYING(255),
  `order_no` INTEGER
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

-- ===================================

-- Table: `report_parameter`

CREATE TABLE IF NOT EXISTS `report_parameter` (
  `id` INTEGER NOT NULL DEFAULT nextval('report_parameter_id_seq'::regclass) AUTO_INCREMENT,
  `report_id` INTEGER,
  `parameter_name` CHARACTER VARYING(255),
  `label` CHARACTER VARYING(255),
  `data_type` CHARACTER VARYING(100),
  `created_at` TIMESTAMP WITHOUT TIME ZONE DEFAULT 'CURRENT_TIMESTAMP',
  `updated_at` TIMESTAMP WITHOUT TIME ZONE DEFAULT 'CURRENT_TIMESTAMP',
  `deleted_at` TIMESTAMP WITHOUT TIME ZONE,
  `created_by` CHARACTER VARYING(255),
  `updated_by` CHARACTER VARYING(255),
  `deleted_by` CHARACTER VARYING(255),
  `query_parameter` CHARACTER VARYING(255),
  `input_field_type` CHARACTER VARYING(100),
  `option_type` CHARACTER VARYING(100),
  `option` JSON,
  `order_no` INTEGER
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

-- ===================================

-- Table: `report_result_mapping`

CREATE TABLE IF NOT EXISTS `report_result_mapping` (
  `id` INTEGER NOT NULL DEFAULT nextval('report_result_mapping_id_seq'::regclass) AUTO_INCREMENT,
  `report_id` INTEGER,
  `query_parameter_name` CHARACTER VARYING(255),
  `variable_name` CHARACTER VARYING(255),
  `label` CHARACTER VARYING(255),
  `data_type` CHARACTER VARYING(100),
  `alignment` CHARACTER VARYING(200),
  `created_at` TIMESTAMP WITHOUT TIME ZONE DEFAULT 'CURRENT_TIMESTAMP',
  `updated_at` TIMESTAMP WITHOUT TIME ZONE DEFAULT 'CURRENT_TIMESTAMP',
  `deleted_at` TIMESTAMP WITHOUT TIME ZONE,
  `created_by` CHARACTER VARYING(255),
  `updated_by` CHARACTER VARYING(255),
  `deleted_by` CHARACTER VARYING(255)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

-- ===================================

-- Table: `sales`

CREATE TABLE IF NOT EXISTS `sales` (
  `id` INTEGER NOT NULL DEFAULT nextval('sales_id_seq'::regclass) AUTO_INCREMENT,
  `customer_id` INTEGER,
  `region` CHARACTER VARYING(100),
  `amount` DECIMAL(10, 2),
  `date` DATE DEFAULT 'CURRENT_DATE'
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

-- ===================================

-- Table: `users`

CREATE TABLE IF NOT EXISTS `users` (
  `id` CHAR(36) NOT NULL,
  `name` CHARACTER VARYING(255) NOT NULL,
  `email` CHARACTER VARYING(255) NOT NULL,
  `password` CHARACTER VARYING(255) NOT NULL,
  `mobile_no` CHARACTER VARYING(255),
  `profile_image` CHARACTER VARYING(255),
  `country` CHARACTER VARYING(255),
  `city` CHARACTER VARYING(255),
  `role` CHARACTER VARYING(255) NOT NULL,
  `createdAt` TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  `updatedAt` TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

-- ===================================
-- FOREIGN KEY CONSTRAINTS
-- ===================================
