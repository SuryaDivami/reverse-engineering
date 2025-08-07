/* eslint-disable prettier/prettier */

export enum DatabaseDialect {
  POSTGRES = 'postgres',
  MYSQL = 'mysql',
  MSSQL = 'mssql',
  SQLITE = 'sqlite',
  ORACLE = 'oracle'
}

export interface TableInfo {
  tableName: string;
  tableSchema: string;
  tableComment?: string;
  columns: ColumnInfo[];
  primaryKeys: string[];
  foreignKeys: ForeignKeyInfo[];
  indexes: IndexInfo[];
}

export interface ColumnInfo {
  columnName: string;
  dataType: string;
  isNullable: boolean;
  defaultValue?: string;
  characterMaximumLength?: number;
  numericPrecision?: number;
  numericScale?: number;
  columnComment?: string;
  isAutoIncrement: boolean;
  ordinalPosition: number;
  enumValues?: string[];
  // Additional properties for SQL generation
  isPrimaryKey?: boolean;
  isUnique?: boolean;
  foreignKeyTable?: string;
  foreignKeyColumn?: string;
  onDelete?: string;
  onUpdate?: string;
  comment?: string; // Alias for columnComment
}

export interface ForeignKeyInfo {
  constraintName: string;
  columnName: string;
  referencedTableSchema: string;
  referencedTableName: string;
  referencedColumnName: string;
  onDelete?: string;
  onUpdate?: string;
}

export interface IndexInfo {
  indexName: string;
  columnNames: string[];
  isUnique: boolean;
  isPrimary: boolean;
}

export interface TypeMapping {
  tsType: string;
  typeormType: string;
  isOptional: boolean;
  needsImport?: string[];
}

export interface DatabaseSchema {
  dialect: DatabaseDialect;
  tables: TableInfo[];
  views?: ViewInfo[];
}

export interface ViewInfo {
  viewName: string;
  viewSchema: string;
  columns: ColumnInfo[];
}

export interface EntityGenerationOptions {
  outputPath: string;
  generateInterfaces: boolean;
  generateRepositories: boolean;
  useDataTransferObjects: boolean;
  includeComments: boolean;
  namingConvention: 'camelCase' | 'PascalCase' | 'snake_case';
  includeRelations: boolean;
}

// Aliases for SQL generation
export type TableSchema = TableInfo;
export type ColumnSchema = ColumnInfo;
