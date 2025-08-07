import { DatabaseDialect } from './database.types';

/**
 * Main configuration interface for the reverse engineering library
 */
export interface ReverseEngineeringConfig {
  /** Database connection settings */
  database: DatabaseConfig;
  
  /** Output path configuration */
  paths: PathConfig;
  
  /** Feature toggles */
  features: FeatureConfig;
  
  /** CRUD generation options */
  crud: CrudConfig;
  
  /** Entity generation options */
  entities: EntityConfig;
  
  /** SQL generation options */
  sql: SqlConfig;
  
  /** Data export options */
  dataExport: DataExportConfig;
}

/**
 * Database connection configuration
 */
export interface DatabaseConfig {
  type: DatabaseDialect;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  schema?: string;
  ssl?: boolean;
}

/**
 * Path configuration for output files
 */
export interface PathConfig {
  /** Base output directory (default: './src') */
  baseOutput: string;
  
  /** Entities directory (default: './src/entities') */
  entities: string;
  
  /** CRUD modules directory (default: './src') */
  crud: string;
  
  /** SQL scripts directory (default: './sql') */
  sql: string;
  
  /** Data export directory (default: './data') */
  dataExport: string;
}

/**
 * Feature toggles
 */
export interface FeatureConfig {
  /** Generate TypeORM entities */
  entities: boolean;
  
  /** Generate CRUD operations */
  crud: boolean;
  
  /** Generate SQL scripts */
  sql: boolean;
  
  /** Export data */
  dataExport: boolean;
  
  /** Generate index files */
  generateIndex: boolean;
}

/**
 * CRUD generation configuration
 */
export interface CrudConfig {
  /** Framework to use (nestjs | express | fastify) */
  framework: 'nestjs' | 'express' | 'fastify';
  
  /** Include validation decorators */
  includeValidation: boolean;
  
  /** Include Swagger/OpenAPI decorators */
  includeSwagger: boolean;
  
  /** Include pagination support */
  includePagination: boolean;
  
  /** Include filtering support */
  includeFiltering: boolean;
  
  /** Include sorting support */
  includeSorting: boolean;
  
  /** Include relations */
  includeRelations: boolean;
  
  /** Generate test files */
  generateTests: boolean;
  
  /** Include authentication guards */
  authGuards: boolean;
  
  /** Use TypeORM */
  useTypeORM: boolean;
  
  /** Generate DTOs */
  useDTO: boolean;
  
  /** Tables to exclude from CRUD generation */
  excludedTables: string[];
  
  /** Tables to include (if specified, only these will be processed) */
  includedTables?: string[];
}

/**
 * Entity generation configuration
 */
export interface EntityConfig {
  /** Use TypeORM decorators */
  useTypeORM: boolean;
  
  /** Include validation decorators */
  includeValidation: boolean;
  
  /** Include Swagger decorators */
  includeSwagger: boolean;
  
  /** Generate enum types */
  generateEnums: boolean;
  
  /** Tables to exclude */
  excludedTables: string[];
  
  /** Tables to include */
  includedTables?: string[];
}

/**
 * SQL generation configuration
 */
export interface SqlConfig {
  /** Generate CREATE TABLE scripts */
  generateCreateTables: boolean;
  
  /** Generate INSERT scripts */
  generateInserts: boolean;
  
  /** Format SQL output */
  formatSql: boolean;
  
  /** Include comments in SQL */
  includeComments: boolean;
}

/**
 * Data export configuration
 */
export interface DataExportConfig {
  /** Enable data masking */
  enableMasking: boolean;
  
  /** Batch size for data export */
  batchSize: number;
  
  /** Export format (sql | json | csv) */
  format: 'sql' | 'json' | 'csv';
  
  /** Fields to mask */
  maskedFields: string[];
  
  /** Maximum rows per table */
  maxRows?: number;
}

/**
 * Partial configuration for overrides
 */
export type ReverseEngineeringConfigInput = Partial<ReverseEngineeringConfig> & {
  database: DatabaseConfig;
};
