/* eslint-disable prettier/prettier */
import { DataSource } from 'typeorm';
import { DatabaseDialect, TableInfo, ColumnInfo, ForeignKeyInfo, IndexInfo, DatabaseSchema } from '../types/database.types';

export abstract class BaseSchemaIntrospector {
  constructor(protected readonly dataSource: DataSource) {}

  public abstract getDialect(): DatabaseDialect;
  public abstract getAllTables(): Promise<TableInfo[]>;
  public abstract getTableInfo(tableName: string, schema?: string): Promise<TableInfo>;
  
  public async getDatabaseSchema(): Promise<DatabaseSchema> {
    const tables = await this.getAllTables();
    return {
      dialect: this.getDialect(),
      tables
    };
  }
}

export class PostgresSchemaIntrospector extends BaseSchemaIntrospector {
  public getDialect(): DatabaseDialect {
    return DatabaseDialect.POSTGRES;
  }

  public async getAllTables(): Promise<TableInfo[]> {
    const query = `
      SELECT 
        t.table_name,
        t.table_schema,
        obj_description(c.oid) as table_comment
      FROM information_schema.tables t
      LEFT JOIN pg_class c ON c.relname = t.table_name
      LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.table_schema
      WHERE t.table_type = 'BASE TABLE'
        AND t.table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      ORDER BY t.table_schema, t.table_name;
    `;

    const tables = await this.dataSource.query(query);
    const tableInfos: TableInfo[] = [];

    for (const table of tables) {
      const tableInfo = await this.getTableInfo(table.table_name, table.table_schema);
      tableInfos.push(tableInfo);
    }

    return tableInfos;
  }

  public async getTableInfo(tableName: string, schema: string = 'public'): Promise<TableInfo> {
    const [columns, primaryKeys, foreignKeys, indexes] = await Promise.all([
      this.getColumns(tableName, schema),
      this.getPrimaryKeys(tableName, schema),
      this.getForeignKeys(tableName, schema),
      this.getIndexes(tableName, schema)
    ]);

    const tableCommentQuery = `
      SELECT obj_description(c.oid) as table_comment
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = $1 AND n.nspname = $2;
    `;
    
    const commentResult = await this.dataSource.query(tableCommentQuery, [tableName, schema]);
    const tableComment = commentResult[0]?.table_comment;

    return {
      tableName,
      tableSchema: schema,
      tableComment,
      columns,
      primaryKeys,
      foreignKeys,
      indexes
    };
  }

  private async getColumns(tableName: string, schema: string): Promise<ColumnInfo[]> {
    const query = `
      SELECT 
        c.column_name,
        c.data_type,
        c.is_nullable::boolean as is_nullable,
        c.column_default,
        c.character_maximum_length,
        c.numeric_precision,
        c.numeric_scale,
        c.ordinal_position,
        col_description(pgc.oid, c.ordinal_position) as column_comment,
        CASE WHEN c.column_default LIKE 'nextval%' THEN true ELSE false END as is_auto_increment,
        CASE WHEN c.data_type = 'USER-DEFINED' THEN c.udt_name ELSE c.data_type END as actual_data_type,
        CASE 
          WHEN c.data_type = 'ARRAY' THEN 
            CASE WHEN c.udt_name LIKE '%[]' THEN substring(c.udt_name from 1 for length(c.udt_name)-2) || '[]'
            ELSE c.udt_name END
          ELSE c.data_type 
        END as processed_data_type
      FROM information_schema.columns c
      LEFT JOIN pg_class pgc ON pgc.relname = c.table_name
      LEFT JOIN pg_namespace pgn ON pgn.oid = pgc.relnamespace AND pgn.nspname = c.table_schema
      WHERE c.table_name = $1 AND c.table_schema = $2
      ORDER BY c.ordinal_position;
    `;

    const columns = await this.dataSource.query(query, [tableName, schema]);
    
    const columnInfos: ColumnInfo[] = [];
    for (const col of columns) {
      const enumValues = col.actual_data_type !== col.data_type 
        ? await this.getEnumValues(col.actual_data_type, schema) 
        : undefined;
        
      columnInfos.push({
        columnName: col.column_name,
        dataType: col.processed_data_type || col.actual_data_type,
        isNullable: col.is_nullable === 'YES' || col.is_nullable === true,
        defaultValue: col.column_default,
        characterMaximumLength: col.character_maximum_length,
        numericPrecision: col.numeric_precision,
        numericScale: col.numeric_scale,
        columnComment: col.column_comment,
        isAutoIncrement: col.is_auto_increment,
        ordinalPosition: col.ordinal_position,
        enumValues
      });
    }
    
    return columnInfos;
  }

  private async getEnumValues(enumName: string, schema: string): Promise<string[] | undefined> {
    try {
      const query = `
        SELECT e.enumlabel
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE t.typname = $1 AND n.nspname = $2
        ORDER BY e.enumsortorder;
      `;
      
      const result = await this.dataSource.query(query, [enumName, schema]);
      return result.map((row: any) => row.enumlabel);
    } catch {
      return undefined;
    }
  }

  private async getPrimaryKeys(tableName: string, schema: string): Promise<string[]> {
    const query = `
      SELECT kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_name = $1
        AND tc.table_schema = $2
      ORDER BY kcu.ordinal_position;
    `;

    const result = await this.dataSource.query(query, [tableName, schema]);
    return result.map((row: any) => row.column_name);
  }

  private async getForeignKeys(tableName: string, schema: string): Promise<ForeignKeyInfo[]> {
    const query = `
      SELECT 
        tc.constraint_name,
        kcu.column_name,
        ccu.table_schema AS referenced_table_schema,
        ccu.table_name AS referenced_table_name,
        ccu.column_name AS referenced_column_name,
        rc.delete_rule as on_delete,
        rc.update_rule as on_update
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
      JOIN information_schema.referential_constraints AS rc ON rc.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = $1
        AND tc.table_schema = $2;
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
        i.relname as index_name,
        array_agg(a.attname ORDER BY c.ordinality) as column_names,
        ix.indisunique as is_unique,
        ix.indisprimary as is_primary
      FROM pg_class t
      JOIN pg_namespace n ON t.relnamespace = n.oid
      JOIN pg_index ix ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN unnest(ix.indkey) WITH ORDINALITY AS c(attnum, ordinality) ON true
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = c.attnum
      WHERE t.relname = $1 AND n.nspname = $2
      GROUP BY i.relname, ix.indisunique, ix.indisprimary
      ORDER BY i.relname;
    `;

    const result = await this.dataSource.query(query, [tableName, schema]);
    return result.map((row: any): IndexInfo => ({
      indexName: row.index_name,
      columnNames: row.column_names,
      isUnique: row.is_unique,
      isPrimary: row.is_primary
    }));
  }
}
