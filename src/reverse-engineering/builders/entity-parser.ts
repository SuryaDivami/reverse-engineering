/* eslint-disable prettier/prettier */
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { TableSchema, ColumnSchema, DatabaseDialect } from '../types/database.types';

export interface EntityParseOptions {
  entitiesPath: string;
  filePattern: string;
}

export class EntityParser {
  /**
   * Parse TypeORM entity files and extract table schemas
   */
  public static async parseEntityFiles(options: EntityParseOptions): Promise<TableSchema[]> {
    const tables: TableSchema[] = [];
    
    const searchPattern = path.join(options.entitiesPath, options.filePattern);
    const files = await glob(searchPattern, { 
      ignore: ['**/index.ts', '**/*.spec.ts', '**/*.test.ts'],
      absolute: true 
    });

    for (const filePath of files) {
      const tableSchema = this.parseEntityFile(filePath);
      if (tableSchema) {
        tables.push(tableSchema);
      }
    }

    return tables.sort((a, b) => a.tableName.localeCompare(b.tableName));
  }

  /**
   * Parse a single entity file and extract table schema
   */
  private static parseEntityFile(filePath: string): TableSchema | null {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Extract table name from @Entity decorator
      const entityMatch = fileContent.match(/@Entity\(['"`]([^'"`]+)['"`]\)/);
      const tableName = entityMatch ? entityMatch[1] : this.getTableNameFromClass(fileContent);
      
      if (!tableName) {
        console.warn(`Could not extract table name from ${filePath}`);
        return null;
      }

      // Extract class name
      const classMatch = fileContent.match(/export\s+class\s+(\w+)/);
      const className = classMatch ? classMatch[1] : '';

      // Parse columns from the file
      const columns = this.parseColumns(fileContent);

      // Parse primary keys
      const primaryKeys = columns
        .filter(col => col.isPrimaryKey)
        .map(col => col.columnName);

      return {
        tableName,
        tableSchema: 'public', // Default schema
        tableComment: this.extractTableComment(fileContent),
        columns,
        primaryKeys,
        foreignKeys: [], // Will be populated from column foreign key info
        indexes: []
      };

    } catch (error) {
      console.error(`Error parsing entity file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Get table name from class name if not specified in @Entity
   */
  private static getTableNameFromClass(fileContent: string): string | null {
    const classMatch = fileContent.match(/export\s+class\s+(\w+)/);
    if (!classMatch) return null;

    // Convert PascalCase to snake_case
    const className = classMatch[1];
    return className.replace(/([A-Z])/g, (match, char, index) => {
      return index === 0 ? char.toLowerCase() : `_${char.toLowerCase()}`;
    });
  }

  /**
   * Parse columns from entity file content
   */
  private static parseColumns(fileContent: string): ColumnSchema[] {
    const columns: ColumnSchema[] = [];
    
    // Find all property declarations with decorators - improved regex
    const propertyRegex = /@(Column|PrimaryGeneratedColumn|PrimaryColumn|CreateDateColumn|UpdateDateColumn|DeleteDateColumn|VersionColumn)\s*\([^)]*\)\s*\n\s*(\w+)(\?)?:\s*([^;|\n]+)/g;
    
    let match;
    while ((match = propertyRegex.exec(fileContent)) !== null) {
      const [fullMatch, decoratorType, propertyName, isOptional, tsType] = match;
      
      // Skip if propertyName is undefined
      if (!propertyName) {
        console.warn('Skipping property with undefined name:', fullMatch);
        continue;
      }

      // Extract column options from decorator
      const columnOptions = this.parseColumnOptions(fullMatch);
      
      const column: ColumnSchema = {
        columnName: columnOptions.name || this.camelToSnakeCase(propertyName),
        dataType: this.mapTsTypeToColumnType(tsType, columnOptions),
        isNullable: isOptional === '?' || columnOptions.nullable !== false,
        defaultValue: columnOptions.default,
        characterMaximumLength: columnOptions.length,
        numericPrecision: columnOptions.precision,
        numericScale: columnOptions.scale,
        columnComment: columnOptions.comment,
        comment: columnOptions.comment, // Alias
        isAutoIncrement: decoratorType === 'PrimaryGeneratedColumn',
        ordinalPosition: columns.length + 1,
        isPrimaryKey: decoratorType === 'PrimaryGeneratedColumn' || decoratorType === 'PrimaryColumn',
        isUnique: columnOptions.unique || false,
        // Handle foreign keys (would need more sophisticated parsing for relationships)
        foreignKeyTable: undefined, 
        foreignKeyColumn: undefined,
        onDelete: undefined,
        onUpdate: undefined
      };

      columns.push(column);
    }

    return columns;
  }

  /**
   * Parse column options from decorator string
   */
  private static parseColumnOptions(decoratorString: string): any {
    const options: any = {};

    // Extract options from decorator parameters
    const optionsMatch = decoratorString.match(/\(([^)]*)\)/);
    if (!optionsMatch) return options;

    const optionsStr = optionsMatch[1];
    
    // Parse individual options (simplified parsing)
    const patterns = {
      name: /name:\s*['"`]([^'"`]+)['"`]/,
      type: /type:\s*['"`]([^'"`]+)['"`]/,
      length: /length:\s*(\d+)/,
      precision: /precision:\s*(\d+)/,
      scale: /scale:\s*(\d+)/,
      default: /default:\s*(?:\(\)\s*=>\s*['"`]([^'"`]+)['"`]|['"`]([^'"`]+)['"`]|(\w+))/,
      nullable: /nullable:\s*(true|false)/,
      unique: /unique:\s*(true|false)/,
      comment: /comment:\s*['"`]([^'"`]+)['"`]/
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = optionsStr.match(pattern);
      if (match) {
        if (key === 'nullable' || key === 'unique') {
          options[key] = match[1] === 'true';
        } else if (key === 'length' || key === 'precision' || key === 'scale') {
          options[key] = parseInt(match[1], 10);
        } else if (key === 'default') {
          options[key] = match[1] || match[2] || match[3];
        } else {
          options[key] = match[1];
        }
      }
    }

    return options;
  }

  /**
   * Map TypeScript type to column type
   */
  private static mapTsTypeToColumnType(tsType: string, options: any): string {
    // Remove null/undefined union types
    const cleanType = tsType.replace(/\s*\|\s*(null|undefined)/g, '').trim();

    // Handle specific type mappings
    if (options.type) {
      return options.type;
    }

    switch (cleanType) {
      case 'string':
        if (options.length) return 'varchar';
        return 'text';
      case 'number':
        if (options.precision && options.scale) return 'decimal';
        return 'int';
      case 'boolean':
        return 'boolean';
      case 'Date':
        return 'timestamp';
      case 'Buffer':
        return 'bytea';
      default:
        if (cleanType.endsWith('[]')) return 'json';
        if (cleanType === 'any') return 'json';
        return 'varchar';
    }
  }

  /**
   * Convert camelCase to snake_case
   */
  private static camelToSnakeCase(str: string): string {
    if (!str) return '';
    return str.replace(/([A-Z])/g, (match, char, index) => {
      return index === 0 ? char.toLowerCase() : `_${char.toLowerCase()}`;
    });
  }

  /**
   * Extract table comment from class comment
   */
  private static extractTableComment(fileContent: string): string | undefined {
    const commentMatch = fileContent.match(/\/\*\*\s*\n\s*\*\s*([^\n]*)\s*\n\s*\*\//);
    return commentMatch ? commentMatch[1].trim() : undefined;
  }
}
