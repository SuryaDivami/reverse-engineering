// Main library exports
export { ReverseEngineeringService } from './reverse-engineering/reverse-engineering-service-new';
export { ReverseEngineeringModule } from './reverse-engineering/reverse-engineering-module-new';
export { ReverseEngineeringController } from './reverse-engineering/reverse-engineering.controller';

// Configuration interfaces and types
export * from './reverse-engineering/types/database.types';
export * from './reverse-engineering/types/config.types';

// Core builders and utilities
export { CrudGenerator } from './reverse-engineering/builders/crud-generator-new';
export { EntityBuilder } from './reverse-engineering/builders/entity-builder';
export { FileBuilder } from './reverse-engineering/builders/file-builder';
export { SqlGenerator } from './reverse-engineering/builders/sql-generator';
export { DataExporter } from './reverse-engineering/builders/data-exporter';

// Utility classes
export { NamingUtils } from './reverse-engineering/utils/naming-utils';
export { TypeMapper } from './reverse-engineering/utils/type-mapper';

// Schema introspectors
export { PostgresSchemaIntrospector } from './reverse-engineering/schema/postgres-introspector';
export { MySQLSchemaIntrospector } from './reverse-engineering/schema/mysql-introspector';
export { SchemaIntrospectorFactory } from './reverse-engineering/schema/introspector-factory';

// Default configuration
export { DEFAULT_REVERSE_ENGINEERING_CONFIG, createConfig } from './reverse-engineering/config/default.config';
