/* eslint-disable prettier/prettier */
import * as fs from 'fs';
import * as path from 'path';
import { DatabaseDialect, TableSchema, ColumnSchema } from '../types/database.types';
import { TypeMapper } from '../utils/type-mapper';
import { NamingUtils } from '../utils/naming-utils';

export interface SqlGenerationOptions {
  dialect: DatabaseDialect;
  schemaName?: string;
  includeDropIfExists: boolean;
  includeCreateIfNotExists: boolean;
  includeComments: boolean;
  engineType?: string; // For MySQL: InnoDB, MyISAM, etc.
  charset?: string; // For MySQL: utf8mb4, utf8, etc.
  collation?: string; // For MySQL: utf8mb4_unicode_ci, etc.
  tablespace?: string; // For PostgreSQL
  fillfactor?: number; // For PostgreSQL
  withOids?: boolean; // For PostgreSQL (deprecated but sometimes needed)
  outputPath?: string;
}

export interface SqlScriptResult {
  sql: string;
  tableCount: number;
  dialect: DatabaseDialect;
  options: SqlGenerationOptions;
}

export class SqlGenerator {
  private readonly typeMapper: TypeMapper;
  private readonly namingUtils: NamingUtils;
  private readonly options: SqlGenerationOptions;

  constructor(options: Partial<SqlGenerationOptions> = {}) {
    this.options = {
      dialect: DatabaseDialect.POSTGRES,
      includeDropIfExists: false,
      includeCreateIfNotExists: true,
      includeComments: true,
      engineType: 'InnoDB',
      charset: 'utf8mb4',
      collation: 'utf8mb4_unicode_ci',
      outputPath: './generated/sql',
      ...options
    };

    this.typeMapper = new TypeMapper();
    this.namingUtils = new NamingUtils();
  }

  /**
   * Generate CREATE TABLE scripts from table schemas
   */
  public generateCreateTableScripts(tables: TableSchema[]): SqlScriptResult {
    const sqlLines: string[] = [];

    // Add header comment
    sqlLines.push(`-- Generated CREATE TABLE scripts`);
    sqlLines.push(`-- Dialect: ${this.options.dialect.toUpperCase()}`);
    sqlLines.push(`-- Generated at: ${new Date().toISOString()}`);
    sqlLines.push(`-- Total tables: ${tables.length}`);
    sqlLines.push('');

    // Add dialect-specific setup
    this.addDialectSpecificSetup(sqlLines);

    // Generate table creation scripts
    tables.forEach((table, index) => {
      this.generateSingleTableScript(table, sqlLines);
      
      // Add separator between tables
      if (index < tables.length - 1) {
        sqlLines.push('');
        sqlLines.push('-- ===================================');
        sqlLines.push('');
      }
    });

    // Add foreign key constraints at the end
    sqlLines.push('');
    sqlLines.push('-- ===================================');
    sqlLines.push('-- FOREIGN KEY CONSTRAINTS');
    sqlLines.push('-- ===================================');
    sqlLines.push('');

    tables.forEach(table => {
      this.generateForeignKeyConstraints(table, sqlLines);
    });

    const sql = sqlLines.join('\n');

    return {
      sql,
      tableCount: tables.length,
      dialect: this.options.dialect,
      options: this.options
    };
  }

  /**
   * Generate CREATE TABLE script for a single table
   */
  private generateSingleTableScript(table: TableSchema, sqlLines: string[]): void {
    const tableName = this.getFullTableName(table.tableName);

    // Add table comment
    if (this.options.includeComments) {
      sqlLines.push(`-- Table: ${tableName}`);
      if (table.tableComment) {
        sqlLines.push(`-- ${table.tableComment}`);
      }
      sqlLines.push('');
    }

    // Add DROP IF EXISTS
    if (this.options.includeDropIfExists) {
      sqlLines.push(`DROP TABLE IF EXISTS ${tableName};`);
      sqlLines.push('');
    }

    // Start CREATE TABLE
    const createClause = this.options.includeCreateIfNotExists ? 'CREATE TABLE IF NOT EXISTS' : 'CREATE TABLE';
    sqlLines.push(`${createClause} ${tableName} (`);

    // Add columns
    const columnDefinitions: string[] = [];
    table.columns.forEach(column => {
      columnDefinitions.push(this.generateColumnDefinition(column));
    });

    // Add primary key constraint
    const primaryKeyColumns = table.columns
      .filter(col => col.isPrimaryKey)
      .map(col => this.escapeIdentifier(col.columnName));

    if (primaryKeyColumns.length > 0) {
      columnDefinitions.push(`  CONSTRAINT ${this.escapeIdentifier(`pk_${table.tableName}`)} PRIMARY KEY (${primaryKeyColumns.join(', ')})`);
    }

    // Add unique constraints
    table.columns
      .filter(col => col.isUnique && !col.isPrimaryKey)
      .forEach(col => {
        columnDefinitions.push(`  CONSTRAINT ${this.escapeIdentifier(`uk_${table.tableName}_${col.columnName}`)} UNIQUE (${this.escapeIdentifier(col.columnName)})`);
      });

    // Join column definitions
    sqlLines.push(columnDefinitions.join(',\n'));

    // Close CREATE TABLE with dialect-specific options
    sqlLines.push(')');

    // Add table-specific options
    this.addTableOptions(table, sqlLines);

    sqlLines.push(';');

    // Add column comments (for dialects that support it)
    this.addColumnComments(table, sqlLines);

    // Add indexes
    this.addIndexes(table, sqlLines);
  }

  /**
   * Generate column definition
   */
  private generateColumnDefinition(column: ColumnSchema): string {
    const parts: string[] = [];

    // Column name
    parts.push(`  ${this.escapeIdentifier(column.columnName)}`);

    // Data type
    parts.push(this.getColumnDataType(column));

    // NOT NULL constraint
    if (!column.isNullable && !column.isPrimaryKey) {
      parts.push('NOT NULL');
    }

    // Default value
    if (column.defaultValue !== null && column.defaultValue !== undefined) {
      parts.push(`DEFAULT ${this.formatDefaultValue(column.defaultValue, column.dataType)}`);
    }

    // Auto increment / Serial
    if (column.isAutoIncrement) {
      if (this.options.dialect === 'postgres') {
        // For PostgreSQL, we use SERIAL or BIGSERIAL
        // This is handled in getColumnDataType
      } else if (this.options.dialect === 'mysql') {
        parts.push('AUTO_INCREMENT');
      }
    }

    return parts.join(' ');
  }

  /**
   * Get column data type with proper dialect mapping
   */
  private getColumnDataType(column: ColumnSchema): string {
    // Handle auto increment columns
    if (column.isAutoIncrement && this.options.dialect === 'postgres') {
      if (column.dataType.includes('bigint') || column.dataType.includes('int8')) {
        return 'BIGSERIAL';
      }
      return 'SERIAL';
    }

    // Map TypeORM types to SQL types
    const sqlType = TypeMapper.mapToSqlType(column.dataType, this.options.dialect);

    // Handle length/precision
    if (column.characterMaximumLength) {
      if (sqlType.includes('VARCHAR') || sqlType.includes('CHAR')) {
        return `${sqlType}(${column.characterMaximumLength})`;
      }
    }

    if (column.numericPrecision && column.numericScale !== null) {
      if (sqlType.includes('DECIMAL') || sqlType.includes('NUMERIC')) {
        return `${sqlType}(${column.numericPrecision}, ${column.numericScale})`;
      }
    }

    return sqlType;
  }

  /**
   * Format default value based on data type
   */
  private formatDefaultValue(defaultValue: any, dataType: string): string {
    if (defaultValue === null) return 'NULL';

    // Handle functions/expressions
    if (typeof defaultValue === 'string' && defaultValue.includes('()')) {
      if (this.options.dialect === 'postgres') {
        if (defaultValue.includes('CURRENT_TIMESTAMP') || defaultValue.includes('NOW()')) {
          return 'CURRENT_TIMESTAMP';
        }
        if (defaultValue.includes('CURRENT_DATE')) {
          return 'CURRENT_DATE';
        }
      } else if (this.options.dialect === 'mysql') {
        if (defaultValue.includes('CURRENT_TIMESTAMP')) {
          return 'CURRENT_TIMESTAMP';
        }
      }
      return defaultValue;
    }

    // Handle string values
    if (dataType.includes('varchar') || dataType.includes('char') || dataType.includes('text')) {
      return `'${defaultValue.toString().replace(/'/g, "''")}'`;
    }

    // Handle boolean values
    if (dataType.includes('boolean') || dataType.includes('bool')) {
      if (this.options.dialect === 'postgres') {
        return defaultValue ? 'true' : 'false';
      } else {
        return defaultValue ? '1' : '0';
      }
    }

    // Handle numeric values
    if (dataType.includes('int') || dataType.includes('decimal') || dataType.includes('float') || dataType.includes('double')) {
      return defaultValue.toString();
    }

    // Default case
    return `'${defaultValue.toString()}'`;
  }

  /**
   * Generate foreign key constraints
   */
  private generateForeignKeyConstraints(table: TableSchema, sqlLines: string[]): void {
    const foreignKeyColumns = table.columns.filter(col => col.foreignKeyTable);

    if (foreignKeyColumns.length === 0) return;

    foreignKeyColumns.forEach(column => {
      const tableName = this.getFullTableName(table.tableName);
      const referencedTable = this.getFullTableName(column.foreignKeyTable!);
      const constraintName = `fk_${table.tableName}_${column.columnName}`;

      sqlLines.push(`-- Foreign key: ${table.tableName}.${column.columnName} -> ${column.foreignKeyTable}.${column.foreignKeyColumn || 'id'}`);
      
      const alterStatement = [
        `ALTER TABLE ${tableName}`,
        `ADD CONSTRAINT ${this.escapeIdentifier(constraintName)}`,
        `FOREIGN KEY (${this.escapeIdentifier(column.columnName)})`,
        `REFERENCES ${referencedTable} (${this.escapeIdentifier(column.foreignKeyColumn || 'id')})`
      ];

      // Add referential actions
      if (column.onDelete) {
        alterStatement.push(`ON DELETE ${column.onDelete.toUpperCase()}`);
      }
      if (column.onUpdate) {
        alterStatement.push(`ON UPDATE ${column.onUpdate.toUpperCase()}`);
      }

      sqlLines.push(alterStatement.join(' ') + ';');
      sqlLines.push('');
    });
  }

  /**
   * Add dialect-specific setup commands
   */
  private addDialectSpecificSetup(sqlLines: string[]): void {
    if (this.options.dialect === 'mysql') {
      sqlLines.push('-- MySQL specific settings');
      sqlLines.push('SET FOREIGN_KEY_CHECKS = 0;');
      sqlLines.push('SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";');
      sqlLines.push('SET AUTOCOMMIT = 0;');
      sqlLines.push('START TRANSACTION;');
      sqlLines.push('SET time_zone = "+00:00";');
      sqlLines.push('');
    } else if (this.options.dialect === 'postgres') {
      sqlLines.push('-- PostgreSQL specific settings');
      if (this.options.schemaName && this.options.schemaName !== 'public') {
        sqlLines.push(`CREATE SCHEMA IF NOT EXISTS ${this.escapeIdentifier(this.options.schemaName)};`);
        sqlLines.push(`SET search_path TO ${this.escapeIdentifier(this.options.schemaName)};`);
      }
      sqlLines.push('');
    }
  }

  /**
   * Add table-specific options
   */
  private addTableOptions(table: TableSchema, sqlLines: string[]): void {
    if (this.options.dialect === 'mysql') {
      const options: string[] = [];
      
      if (this.options.engineType) {
        options.push(`ENGINE=${this.options.engineType}`);
      }
      if (this.options.charset) {
        options.push(`DEFAULT CHARSET=${this.options.charset}`);
      }
      if (this.options.collation) {
        options.push(`COLLATE=${this.options.collation}`);
      }

      if (options.length > 0) {
        sqlLines[sqlLines.length - 1] = `)${options.join(' ')}`;
      }
    } else if (this.options.dialect === 'postgres') {
      const options: string[] = [];

      if (this.options.tablespace) {
        options.push(`TABLESPACE ${this.options.tablespace}`);
      }
      if (this.options.fillfactor) {
        options.push(`WITH (fillfactor = ${this.options.fillfactor})`);
      }
      if (this.options.withOids) {
        options.push('WITH OIDS');
      }

      if (options.length > 0) {
        sqlLines[sqlLines.length - 1] = `) ${options.join(' ')}`;
      }
    }
  }

  /**
   * Add column comments
   */
  private addColumnComments(table: TableSchema, sqlLines: string[]): void {
    if (!this.options.includeComments) return;

    const tableName = this.getFullTableName(table.tableName);
    const columnsWithComments = table.columns.filter(col => col.comment);

    if (columnsWithComments.length === 0) return;

    sqlLines.push('');
    columnsWithComments.forEach(column => {
      if (this.options.dialect === 'postgres') {
        sqlLines.push(`COMMENT ON COLUMN ${tableName}.${this.escapeIdentifier(column.columnName)} IS '${column.comment?.replace(/'/g, "''")}';`);
      } else if (this.options.dialect === 'mysql') {
        sqlLines.push(`ALTER TABLE ${tableName} MODIFY COLUMN ${this.escapeIdentifier(column.columnName)} ${this.getColumnDataType(column)} COMMENT '${column.comment?.replace(/'/g, "\\'")}';`);
      }
    });
  }

  /**
   * Add indexes
   */
  private addIndexes(table: TableSchema, sqlLines: string[]): void {
    const tableName = this.getFullTableName(table.tableName);
    
    // Add indexes for foreign key columns
    table.columns
      .filter(col => col.foreignKeyTable && !col.isPrimaryKey)
      .forEach(column => {
        const indexName = `idx_${table.tableName}_${column.columnName}`;
        sqlLines.push('');
        sqlLines.push(`CREATE INDEX ${this.escapeIdentifier(indexName)} ON ${tableName} (${this.escapeIdentifier(column.columnName)});`);
      });

    // Add indexes for unique columns (if not already primary key)
    table.columns
      .filter(col => col.isUnique && !col.isPrimaryKey && !col.foreignKeyTable)
      .forEach(column => {
        const indexName = `idx_${table.tableName}_${column.columnName}_unique`;
        sqlLines.push('');
        sqlLines.push(`CREATE UNIQUE INDEX ${this.escapeIdentifier(indexName)} ON ${tableName} (${this.escapeIdentifier(column.columnName)});`);
      });
  }

  /**
   * Get full table name with schema prefix
   */
  private getFullTableName(tableName: string): string {
    const escapedTableName = this.escapeIdentifier(tableName);
    
    if (this.options.schemaName && this.options.dialect === 'postgres') {
      return `${this.escapeIdentifier(this.options.schemaName)}.${escapedTableName}`;
    }
    
    return escapedTableName;
  }

  /**
   * Escape SQL identifiers
   */
  private escapeIdentifier(identifier: string): string {
    if (this.options.dialect === 'postgres') {
      return `"${identifier}"`;
    } else if (this.options.dialect === 'mysql') {
      return `\`${identifier}\``;
    }
    return identifier;
  }

  /**
   * Save SQL script to file
   */
  public async saveSqlScript(result: SqlScriptResult, filename?: string): Promise<string> {
    if (!this.options.outputPath) {
      throw new Error('Output path not configured');
    }

    // Ensure output directory exists
    if (!fs.existsSync(this.options.outputPath)) {
      fs.mkdirSync(this.options.outputPath, { recursive: true });
    }

    const fileName = filename || `create_tables_${this.options.dialect}_${Date.now()}.sql`;
    const filePath = path.join(this.options.outputPath, fileName);

    fs.writeFileSync(filePath, result.sql, 'utf8');

    return filePath;
  }

  /**
   * Generate SQL from entity files in directory
   */
  public async generateFromEntityDirectory(entitiesPath: string): Promise<SqlScriptResult> {
    const { EntityParser } = await import('./entity-parser');
    
    const tables = await EntityParser.parseEntityFiles({
      entitiesPath,
      filePattern: '**/*.entity.ts'
    });

    if (tables.length === 0) {
      throw new Error(`No entity files found in ${entitiesPath}`);
    }

    console.log(`🔍 Found ${tables.length} entity files to process`);
    tables.forEach(table => {
      console.log(`  - ${table.tableName} (${table.columns.length} columns)`);
    });

    return this.generateCreateTableScripts(tables);
  }
}
