/* eslint-disable prettier/prettier */
import { BaseSchemaIntrospector } from './postgres-introspector';
import { DatabaseDialect, TableInfo, ColumnInfo, ForeignKeyInfo, IndexInfo } from '../types/database.types';

export class MySQLSchemaIntrospector extends BaseSchemaIntrospector {
  public getDialect(): DatabaseDialect {
    return DatabaseDialect.MYSQL;
  }

  public async getAllTables(): Promise<TableInfo[]> {
    const query = `
      SELECT 
        t.TABLE_NAME as table_name,
        t.TABLE_SCHEMA as table_schema,
        t.TABLE_COMMENT as table_comment
      FROM information_schema.TABLES t
      WHERE t.TABLE_TYPE = 'BASE TABLE'
        AND t.TABLE_SCHEMA NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
      ORDER BY t.TABLE_SCHEMA, t.TABLE_NAME;
    `;

    const tables = await this.dataSource.query(query);
    const tableInfos: TableInfo[] = [];

    for (const table of tables) {
      const tableInfo = await this.getTableInfo(table.table_name, table.table_schema);
      tableInfos.push(tableInfo);
    }

    return tableInfos;
  }

  public async getTableInfo(tableName: string, schema?: string): Promise<TableInfo> {
    const databaseName = schema || await this.getCurrentDatabase();
    
    const [columns, primaryKeys, foreignKeys, indexes] = await Promise.all([
      this.getColumns(tableName, databaseName),
      this.getPrimaryKeys(tableName, databaseName),
      this.getForeignKeys(tableName, databaseName),
      this.getIndexes(tableName, databaseName)
    ]);

    const tableCommentQuery = `
      SELECT TABLE_COMMENT as table_comment
      FROM information_schema.TABLES
      WHERE TABLE_NAME = ? AND TABLE_SCHEMA = ?;
    `;
    
    const commentResult = await this.dataSource.query(tableCommentQuery, [tableName, databaseName]);
    const tableComment = commentResult[0]?.table_comment;

    return {
      tableName,
      tableSchema: databaseName,
      tableComment,
      columns,
      primaryKeys,
      foreignKeys,
      indexes
    };
  }

  private async getCurrentDatabase(): Promise<string> {
    const result = await this.dataSource.query('SELECT DATABASE() as current_db');
    return result[0].current_db;
  }

  private async getColumns(tableName: string, schema: string): Promise<ColumnInfo[]> {
    const query = `
      SELECT 
        c.COLUMN_NAME as column_name,
        c.DATA_TYPE as data_type,
        c.IS_NULLABLE as is_nullable,
        c.COLUMN_DEFAULT as column_default,
        c.CHARACTER_MAXIMUM_LENGTH as character_maximum_length,
        c.NUMERIC_PRECISION as numeric_precision,
        c.NUMERIC_SCALE as numeric_scale,
        c.ORDINAL_POSITION as ordinal_position,
        c.COLUMN_COMMENT as column_comment,
        c.EXTRA as extra,
        c.COLUMN_TYPE as column_type
      FROM information_schema.COLUMNS c
      WHERE c.TABLE_NAME = ? AND c.TABLE_SCHEMA = ?
      ORDER BY c.ORDINAL_POSITION;
    `;

    const columns = await this.dataSource.query(query, [tableName, schema]);
    
    return columns.map((col: any): ColumnInfo => ({
      columnName: col.column_name,
      dataType: col.data_type,
      isNullable: col.is_nullable === 'YES',
      defaultValue: col.column_default,
      characterMaximumLength: col.character_maximum_length,
      numericPrecision: col.numeric_precision,
      numericScale: col.numeric_scale,
      columnComment: col.column_comment,
      isAutoIncrement: col.extra && col.extra.toLowerCase().includes('auto_increment'),
      ordinalPosition: col.ordinal_position,
      enumValues: this.extractEnumValues(col.column_type)
    }));
  }

  private extractEnumValues(columnType: string): string[] | undefined {
    if (!columnType || !columnType.toLowerCase().startsWith('enum(')) {
      return undefined;
    }

    const match = columnType.match(/enum\((.*)\)/i);
    if (!match) return undefined;

    return match[1]
      .split(',')
      .map(value => value.trim().replace(/^'|'$/g, ''))
      .filter(value => value.length > 0);
  }

  private async getPrimaryKeys(tableName: string, schema: string): Promise<string[]> {
    const query = `
      SELECT COLUMN_NAME as column_name
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE CONSTRAINT_NAME = 'PRIMARY'
        AND TABLE_NAME = ?
        AND TABLE_SCHEMA = ?
      ORDER BY ORDINAL_POSITION;
    `;

    const result = await this.dataSource.query(query, [tableName, schema]);
    return result.map((row: any) => row.column_name);
  }

  private async getForeignKeys(tableName: string, schema: string): Promise<ForeignKeyInfo[]> {
    const query = `
      SELECT 
        kcu.CONSTRAINT_NAME as constraint_name,
        kcu.COLUMN_NAME as column_name,
        kcu.REFERENCED_TABLE_SCHEMA as referenced_table_schema,
        kcu.REFERENCED_TABLE_NAME as referenced_table_name,
        kcu.REFERENCED_COLUMN_NAME as referenced_column_name,
        rc.DELETE_RULE as on_delete,
        rc.UPDATE_RULE as on_update
      FROM information_schema.KEY_COLUMN_USAGE kcu
      JOIN information_schema.REFERENTIAL_CONSTRAINTS rc ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
      WHERE kcu.TABLE_NAME = ?
        AND kcu.TABLE_SCHEMA = ?
        AND kcu.REFERENCED_TABLE_NAME IS NOT NULL;
    `;

    const result = await this.dataSource.query(query, [tableName, schema]);
    return result.map((row: any): ForeignKeyInfo => ({
      constraintName: row.constraint_name,
      columnName: row.column_name,
      referencedTableSchema: row.referenced_table_schema,
      referencedTableName: row.referenced_table_name,
      referencedColumnName: row.referenced_column_name,
      onDelete: row.on_delete,
      onUpdate: row.on_update
    }));
  }

  private async getIndexes(tableName: string, schema: string): Promise<IndexInfo[]> {
    const query = `
      SELECT 
        INDEX_NAME as index_name,
        GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as column_names,
        NON_UNIQUE = 0 as is_unique,
        INDEX_NAME = 'PRIMARY' as is_primary
      FROM information_schema.STATISTICS
      WHERE TABLE_NAME = ? AND TABLE_SCHEMA = ?
      GROUP BY INDEX_NAME, NON_UNIQUE
      ORDER BY INDEX_NAME;
    `;

    const result = await this.dataSource.query(query, [tableName, schema]);
    return result.map((row: any): IndexInfo => ({
      indexName: row.index_name,
      columnNames: row.column_names ? row.column_names.split(',') : [],
      isUnique: Boolean(row.is_unique),
      isPrimary: Boolean(row.is_primary)
    }));
  }
}
