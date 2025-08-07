/* eslint-disable prettier/prettier */
import { DataSource } from 'typeorm';
import { DatabaseDialect } from '../types/database.types';
import { BaseSchemaIntrospector, PostgresSchemaIntrospector } from './postgres-introspector';
import { MySQLSchemaIntrospector } from './mysql-introspector';

export class SchemaIntrospectorFactory {
  public static create(dataSource: DataSource): BaseSchemaIntrospector {
    const driverType = dataSource.options.type;
    
    switch (driverType) {
      case 'postgres':
        return new PostgresSchemaIntrospector(dataSource);
      case 'mysql':
      case 'mariadb':
        return new MySQLSchemaIntrospector(dataSource);
      case 'mssql':
        // TODO: Implement MSSQL introspector
        throw new Error('MSSQL introspector not implemented yet');
      case 'sqlite':
        // TODO: Implement SQLite introspector
        throw new Error('SQLite introspector not implemented yet');
      case 'oracle':
        // TODO: Implement Oracle introspector
        throw new Error('Oracle introspector not implemented yet');
      default:
        throw new Error(`Unsupported database type: ${driverType}`);
    }
  }

  public static getDialectFromDataSource(dataSource: DataSource): DatabaseDialect {
    const driverType = dataSource.options.type;
    
    switch (driverType) {
      case 'postgres':
        return DatabaseDialect.POSTGRES;
      case 'mysql':
      case 'mariadb':
        return DatabaseDialect.MYSQL;
      case 'mssql':
        return DatabaseDialect.MSSQL;
      case 'sqlite':
        return DatabaseDialect.SQLITE;
      case 'oracle':
        return DatabaseDialect.ORACLE;
      default:
        throw new Error(`Unsupported database type: ${driverType}`);
    }
  }
}
