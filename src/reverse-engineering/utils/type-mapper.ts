/* eslint-disable prettier/prettier */
import { DatabaseDialect, TypeMapping } from '../types/database.types';

export class TypeMapper {
  private static readonly postgresTypeMap: Record<string, TypeMapping> = {
    // String types
    'character varying': { tsType: 'string', typeormType: 'varchar', isOptional: false },
    'varchar': { tsType: 'string', typeormType: 'varchar', isOptional: false },
    'char': { tsType: 'string', typeormType: 'char', isOptional: false },
    'character': { tsType: 'string', typeormType: 'char', isOptional: false },
    'text': { tsType: 'string', typeormType: 'text', isOptional: false },
    'citext': { tsType: 'string', typeormType: 'text', isOptional: false },
    
    // Number types
    'integer': { tsType: 'number', typeormType: 'int', isOptional: false },
    'int': { tsType: 'number', typeormType: 'int', isOptional: false },
    'int4': { tsType: 'number', typeormType: 'int', isOptional: false },
    'bigint': { tsType: 'number', typeormType: 'bigint', isOptional: false },
    'int8': { tsType: 'number', typeormType: 'bigint', isOptional: false },
    'smallint': { tsType: 'number', typeormType: 'smallint', isOptional: false },
    'int2': { tsType: 'number', typeormType: 'smallint', isOptional: false },
    'decimal': { tsType: 'number', typeormType: 'decimal', isOptional: false },
    'numeric': { tsType: 'number', typeormType: 'decimal', isOptional: false },
    'real': { tsType: 'number', typeormType: 'real', isOptional: false },
    'float4': { tsType: 'number', typeormType: 'real', isOptional: false },
    'double precision': { tsType: 'number', typeormType: 'double', isOptional: false },
    'float8': { tsType: 'number', typeormType: 'double', isOptional: false },
    'money': { tsType: 'number', typeormType: 'decimal', isOptional: false },
    'serial': { tsType: 'number', typeormType: 'int', isOptional: false },
    'bigserial': { tsType: 'number', typeormType: 'bigint', isOptional: false },
    
    // Boolean types
    'boolean': { tsType: 'boolean', typeormType: 'boolean', isOptional: false },
    'bool': { tsType: 'boolean', typeormType: 'boolean', isOptional: false },
    
    // Date/Time types
    'timestamp': { tsType: 'Date', typeormType: 'timestamp', isOptional: false },
    'timestamp without time zone': { tsType: 'Date', typeormType: 'timestamp', isOptional: false },
    'timestamp with time zone': { tsType: 'Date', typeormType: 'timestamptz', isOptional: false },
    'timestamptz': { tsType: 'Date', typeormType: 'timestamptz', isOptional: false },
    'date': { tsType: 'Date', typeormType: 'date', isOptional: false },
    'time': { tsType: 'string', typeormType: 'time', isOptional: false },
    'time without time zone': { tsType: 'string', typeormType: 'time', isOptional: false },
    'time with time zone': { tsType: 'string', typeormType: 'timetz', isOptional: false },
    'timetz': { tsType: 'string', typeormType: 'timetz', isOptional: false },
    'interval': { tsType: 'string', typeormType: 'interval', isOptional: false },
    
    // JSON types
    'json': { tsType: 'any', typeormType: 'json', isOptional: false },
    'jsonb': { tsType: 'any', typeormType: 'jsonb', isOptional: false },
    
    // Array types
    'ARRAY': { tsType: 'any[]', typeormType: 'simple-array', isOptional: false },
    
    // UUID
    'uuid': { tsType: 'string', typeormType: 'uuid', isOptional: false },
    
    // Binary types
    'bytea': { tsType: 'Buffer', typeormType: 'bytea', isOptional: false },
    
    // Geometric types
    'point': { tsType: 'string', typeormType: 'point', isOptional: false },
    'line': { tsType: 'string', typeormType: 'line', isOptional: false },
    'lseg': { tsType: 'string', typeormType: 'lseg', isOptional: false },
    'box': { tsType: 'string', typeormType: 'box', isOptional: false },
    'path': { tsType: 'string', typeormType: 'path', isOptional: false },
    'polygon': { tsType: 'string', typeormType: 'polygon', isOptional: false },
    'circle': { tsType: 'string', typeormType: 'circle', isOptional: false },
    
    // Network address types
    'cidr': { tsType: 'string', typeormType: 'cidr', isOptional: false },
    'inet': { tsType: 'string', typeormType: 'inet', isOptional: false },
    'macaddr': { tsType: 'string', typeormType: 'macaddr', isOptional: false },
    
    // Bit string types
    'bit': { tsType: 'string', typeormType: 'bit', isOptional: false },
    'bit varying': { tsType: 'string', typeormType: 'varbit', isOptional: false },
    'varbit': { tsType: 'string', typeormType: 'varbit', isOptional: false },
    
    // Text search types
    'tsvector': { tsType: 'string', typeormType: 'tsvector', isOptional: false },
    'tsquery': { tsType: 'string', typeormType: 'tsquery', isOptional: false },
    
    // XML type
    'xml': { tsType: 'string', typeormType: 'xml', isOptional: false }
  };

  private static readonly mysqlTypeMap: Record<string, TypeMapping> = {
    // String types
    'varchar': { tsType: 'string', typeormType: 'varchar', isOptional: false },
    'char': { tsType: 'string', typeormType: 'char', isOptional: false },
    'text': { tsType: 'string', typeormType: 'text', isOptional: false },
    'tinytext': { tsType: 'string', typeormType: 'tinytext', isOptional: false },
    'mediumtext': { tsType: 'string', typeormType: 'mediumtext', isOptional: false },
    'longtext': { tsType: 'string', typeormType: 'longtext', isOptional: false },
    
    // Number types
    'int': { tsType: 'number', typeormType: 'int', isOptional: false },
    'integer': { tsType: 'number', typeormType: 'int', isOptional: false },
    'tinyint': { tsType: 'number', typeormType: 'tinyint', isOptional: false },
    'smallint': { tsType: 'number', typeormType: 'smallint', isOptional: false },
    'mediumint': { tsType: 'number', typeormType: 'mediumint', isOptional: false },
    'bigint': { tsType: 'number', typeormType: 'bigint', isOptional: false },
    'decimal': { tsType: 'number', typeormType: 'decimal', isOptional: false },
    'numeric': { tsType: 'number', typeormType: 'decimal', isOptional: false },
    'float': { tsType: 'number', typeormType: 'float', isOptional: false },
    'double': { tsType: 'number', typeormType: 'double', isOptional: false },
    'real': { tsType: 'number', typeormType: 'real', isOptional: false },
    
    // Boolean types
    'boolean': { tsType: 'boolean', typeormType: 'boolean', isOptional: false },
    'bool': { tsType: 'boolean', typeormType: 'boolean', isOptional: false },
    
    // Date/Time types
    'datetime': { tsType: 'Date', typeormType: 'datetime', isOptional: false },
    'timestamp': { tsType: 'Date', typeormType: 'timestamp', isOptional: false },
    'date': { tsType: 'Date', typeormType: 'date', isOptional: false },
    'time': { tsType: 'string', typeormType: 'time', isOptional: false },
    'year': { tsType: 'number', typeormType: 'year', isOptional: false },
    
    // JSON types
    'json': { tsType: 'any', typeormType: 'json', isOptional: false },
    
    // Binary types
    'binary': { tsType: 'Buffer', typeormType: 'binary', isOptional: false },
    'varbinary': { tsType: 'Buffer', typeormType: 'varbinary', isOptional: false },
    'tinyblob': { tsType: 'Buffer', typeormType: 'tinyblob', isOptional: false },
    'blob': { tsType: 'Buffer', typeormType: 'blob', isOptional: false },
    'mediumblob': { tsType: 'Buffer', typeormType: 'mediumblob', isOptional: false },
    'longblob': { tsType: 'Buffer', typeormType: 'longblob', isOptional: false },
    
    // Bit type
    'bit': { tsType: 'number', typeormType: 'bit', isOptional: false },
    
    // Geometric types
    'geometry': { tsType: 'string', typeormType: 'geometry', isOptional: false },
    'point': { tsType: 'string', typeormType: 'point', isOptional: false },
    'linestring': { tsType: 'string', typeormType: 'linestring', isOptional: false },
    'polygon': { tsType: 'string', typeormType: 'polygon', isOptional: false },
    'multipoint': { tsType: 'string', typeormType: 'multipoint', isOptional: false },
    'multilinestring': { tsType: 'string', typeormType: 'multilinestring', isOptional: false },
    'multipolygon': { tsType: 'string', typeormType: 'multipolygon', isOptional: false },
    'geometrycollection': { tsType: 'string', typeormType: 'geometrycollection', isOptional: false }
  };

  private static readonly mssqlTypeMap: Record<string, TypeMapping> = {
    // String types
    'varchar': { tsType: 'string', typeormType: 'varchar', isOptional: false },
    'nvarchar': { tsType: 'string', typeormType: 'nvarchar', isOptional: false },
    'char': { tsType: 'string', typeormType: 'char', isOptional: false },
    'nchar': { tsType: 'string', typeormType: 'nchar', isOptional: false },
    'text': { tsType: 'string', typeormType: 'text', isOptional: false },
    'ntext': { tsType: 'string', typeormType: 'ntext', isOptional: false },
    
    // Number types
    'int': { tsType: 'number', typeormType: 'int', isOptional: false },
    'bigint': { tsType: 'number', typeormType: 'bigint', isOptional: false },
    'smallint': { tsType: 'number', typeormType: 'smallint', isOptional: false },
    'tinyint': { tsType: 'number', typeormType: 'tinyint', isOptional: false },
    'decimal': { tsType: 'number', typeormType: 'decimal', isOptional: false },
    'numeric': { tsType: 'number', typeormType: 'decimal', isOptional: false },
    'money': { tsType: 'number', typeormType: 'money', isOptional: false },
    'smallmoney': { tsType: 'number', typeormType: 'smallmoney', isOptional: false },
    'float': { tsType: 'number', typeormType: 'float', isOptional: false },
    'real': { tsType: 'number', typeormType: 'real', isOptional: false },
    
    // Boolean types
    'bit': { tsType: 'boolean', typeormType: 'bit', isOptional: false },
    
    // Date/Time types
    'datetime': { tsType: 'Date', typeormType: 'datetime', isOptional: false },
    'datetime2': { tsType: 'Date', typeormType: 'datetime2', isOptional: false },
    'smalldatetime': { tsType: 'Date', typeormType: 'smalldatetime', isOptional: false },
    'date': { tsType: 'Date', typeormType: 'date', isOptional: false },
    'time': { tsType: 'string', typeormType: 'time', isOptional: false },
    'datetimeoffset': { tsType: 'Date', typeormType: 'datetimeoffset', isOptional: false },
    'timestamp': { tsType: 'Buffer', typeormType: 'timestamp', isOptional: false },
    
    // Binary types
    'binary': { tsType: 'Buffer', typeormType: 'binary', isOptional: false },
    'varbinary': { tsType: 'Buffer', typeormType: 'varbinary', isOptional: false },
    'image': { tsType: 'Buffer', typeormType: 'image', isOptional: false },
    
    // UUID
    'uniqueidentifier': { tsType: 'string', typeormType: 'uniqueidentifier', isOptional: false },
    
    // XML
    'xml': { tsType: 'string', typeormType: 'xml', isOptional: false },
    
    // Spatial types
    'geography': { tsType: 'string', typeormType: 'geography', isOptional: false },
    'geometry': { tsType: 'string', typeormType: 'geometry', isOptional: false }
  };

  public static mapType(dataType: string, dialect: DatabaseDialect, isNullable: boolean = false): TypeMapping {
    const normalizedType = dataType.toLowerCase().trim();
    let typeMap: Record<string, TypeMapping>;

    switch (dialect) {
      case DatabaseDialect.POSTGRES:
        typeMap = this.postgresTypeMap;
        break;
      case DatabaseDialect.MYSQL:
        typeMap = this.mysqlTypeMap;
        break;
      case DatabaseDialect.MSSQL:
        typeMap = this.mssqlTypeMap;
        break;
      default:
        typeMap = this.postgresTypeMap; // Default fallback
    }

    let mapping = typeMap[normalizedType];
    
    if (!mapping) {
      // Handle array types for PostgreSQL
      if (normalizedType.endsWith('[]')) {
        const baseType = normalizedType.slice(0, -2);
        const baseMapping = typeMap[baseType];
        if (baseMapping) {
          mapping = {
            tsType: `${baseMapping.tsType}[]`,
            typeormType: 'simple-array',
            isOptional: baseMapping.isOptional,
            needsImport: baseMapping.needsImport
          };
        }
      }
      
      // Handle enum types
      if (normalizedType.startsWith('enum(') || normalizedType.includes('enum')) {
        mapping = {
          tsType: 'string',
          typeormType: 'enum',
          isOptional: false
        };
      }
      
      // Default fallback
      if (!mapping) {
        mapping = {
          tsType: 'any',
          typeormType: 'text',
          isOptional: false
        };
      }
    }

    return {
      ...mapping,
      isOptional: isNullable || mapping.isOptional
    };
  }

  public static getImports(typeMappings: TypeMapping[]): string[] {
    const imports = new Set<string>();
    
    typeMappings.forEach(mapping => {
      if (mapping.needsImport) {
        mapping.needsImport.forEach(imp => imports.add(imp));
      }
    });

    return Array.from(imports);
  }

  /**
   * Convert TypeORM column types to SQL DDL types for CREATE TABLE statements
   */
  public static mapToSqlType(typeormType: string, dialect: DatabaseDialect): string {
    const dialectStr = dialect.toLowerCase();

    // Handle specific TypeORM types
    switch (typeormType.toLowerCase()) {
      case 'varchar':
        return dialectStr === 'postgres' ? 'VARCHAR' : 'VARCHAR';
      case 'char':
        return 'CHAR';
      case 'text':
        return 'TEXT';
      case 'int':
        return dialectStr === 'postgres' ? 'INTEGER' : 'INT';
      case 'bigint':
        return 'BIGINT';
      case 'smallint':
        return 'SMALLINT';
      case 'decimal':
      case 'numeric':
        return dialectStr === 'postgres' ? 'DECIMAL' : 'DECIMAL';
      case 'real':
        return 'REAL';
      case 'double':
        return dialectStr === 'postgres' ? 'DOUBLE PRECISION' : 'DOUBLE';
      case 'float':
        return 'FLOAT';
      case 'boolean':
        return dialectStr === 'postgres' ? 'BOOLEAN' : 'BOOLEAN';
      case 'date':
        return 'DATE';
      case 'time':
        return 'TIME';
      case 'datetime':
        return dialectStr === 'postgres' ? 'TIMESTAMP' : 'DATETIME';
      case 'timestamp':
        return 'TIMESTAMP';
      case 'timestamptz':
        return dialectStr === 'postgres' ? 'TIMESTAMP WITH TIME ZONE' : 'TIMESTAMP';
      case 'json':
        return 'JSON';
      case 'jsonb':
        return dialectStr === 'postgres' ? 'JSONB' : 'JSON';
      case 'uuid':
        return dialectStr === 'postgres' ? 'UUID' : 'CHAR(36)';
      case 'bytea':
        return dialectStr === 'postgres' ? 'BYTEA' : 'BLOB';
      case 'enum':
        return dialectStr === 'postgres' ? 'VARCHAR' : 'ENUM';
      default:
        // For unknown types, return as-is and let the database handle it
        return typeormType.toUpperCase();
    }
  }
}
