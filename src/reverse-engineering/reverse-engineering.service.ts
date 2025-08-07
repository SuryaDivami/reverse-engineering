/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SchemaIntrospectorFactory } from './schema/introspector-factory';
import { EntityBuilder } from './builders/entity-builder';
import { EntityGenerationOptions, DatabaseSchema } from './types/database.types';
import * as path from 'path';

@Injectable()
export class ReverseEngineeringService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Generate TypeScript entities from database schema
   */
  public async generateEntities(options: Partial<EntityGenerationOptions> = {}): Promise<void> {
    const defaultOptions: EntityGenerationOptions = {
      outputPath: path.join(process.cwd(), 'generated/entities'),
      generateInterfaces: false,
      generateRepositories: false,
      useDataTransferObjects: false,
      includeComments: true,
      namingConvention: 'camelCase',
      includeRelations: true,
      ...options
    };

    console.log('Starting reverse engineering process...');
    console.log(`Output path: ${defaultOptions.outputPath}`);

    // Get database schema
    const introspector = SchemaIntrospectorFactory.create(this.dataSource);
    const schema = await introspector.getDatabaseSchema();

    console.log(`Found ${schema.tables.length} tables in ${schema.dialect} database`);

    // Generate entities
    const entityBuilder = new EntityBuilder(defaultOptions, schema.tables, schema.dialect);

    for (const table of schema.tables) {
      try {
        await entityBuilder.generateEntity(table);
      } catch (error) {
        console.error(`Failed to generate entity for table ${table.tableName}:`, error);
      }
    }

    console.log('Reverse engineering process completed!');
  }

  /**
   * Analyze database schema and return metadata
   */
  public async analyzeSchema(): Promise<DatabaseSchema> {
    const introspector = SchemaIntrospectorFactory.create(this.dataSource);
    return await introspector.getDatabaseSchema();
  }

  /**
   * Get basic table information
   */
  public async getTableList(): Promise<Array<{ tableName: string; tableSchema: string; columnCount: number }>> {
    const schema = await this.analyzeSchema();
    
    return schema.tables.map(table => ({
      tableName: table.tableName,
      tableSchema: table.tableSchema,
      columnCount: table.columns.length
    }));
  }

  /**
   * Generate SQL scripts for schema recreation
   */
  public async generateSQLScripts(options?: {
    dialect?: 'postgres' | 'mysql';
    schemaName?: string;
    includeDropIfExists?: boolean;
    includeCreateIfNotExists?: boolean;
    outputPath?: string;
    entitiesPath?: string;
  }): Promise<{
    sql: string;
    tableCount: number;
    outputPath?: string;
  }> {
    const { SqlGenerator } = await import('./builders/sql-generator');
    const { DatabaseDialect } = await import('./types/database.types');

    const dialect = options?.dialect || SchemaIntrospectorFactory.getDialectFromDataSource(this.dataSource);
    
    const sqlGenerator = new SqlGenerator({
      dialect: dialect === 'postgres' ? DatabaseDialect.POSTGRES : DatabaseDialect.MYSQL,
      schemaName: options?.schemaName,
      includeDropIfExists: options?.includeDropIfExists || false,
      includeCreateIfNotExists: options?.includeCreateIfNotExists !== false,
      outputPath: options?.outputPath || path.join(process.cwd(), 'generated/sql')
    });

    let result;
    
    if (options?.entitiesPath) {
      // Generate from entity files
      console.log(`🔍 Generating SQL from entity files in ${options.entitiesPath}...`);
      result = await sqlGenerator.generateFromEntityDirectory(options.entitiesPath);
    } else {
      // Generate from database schema (default)
      console.log('🔍 Generating SQL from database schema...');
      const schema = await this.analyzeSchema();
      result = sqlGenerator.generateCreateTableScripts(schema.tables);
    }

    // Save to file
    const outputPath = await sqlGenerator.saveSqlScript(result);

    return {
      sql: result.sql,
      tableCount: result.tableCount,
      outputPath
    };
  }

  /**
   * Generate React/UI components
   */
  public async generateUIComponents(): Promise<void> {
    // TODO: Implement UI component generation
    console.log('UI component generation not implemented yet');
  }

  /**
   * Test database connection and compatibility
   */
  public async testConnection(): Promise<{
    connected: boolean;
    dialect: string;
    version?: string;
    error?: string;
  }> {
    try {
      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize();
      }

      const dialect = SchemaIntrospectorFactory.getDialectFromDataSource(this.dataSource);
      
      // Get database version
      let version: string | undefined;
      try {
        switch (dialect) {
          case 'postgres':
            const pgResult = await this.dataSource.query('SELECT version()');
            version = pgResult[0]?.version;
            break;
          case 'mysql':
            const mysqlResult = await this.dataSource.query('SELECT VERSION() as version');
            version = mysqlResult[0]?.version;
            break;
          // Add other dialects as needed
        }
      } catch (versionError) {
        console.warn('Could not retrieve database version:', versionError);
      }

      return {
        connected: true,
        dialect,
        version
      };
    } catch (error) {
      return {
        connected: false,
        dialect: 'unknown',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Generate index.ts file for all entities
   */
  public async generateEntityIndex(entitiesPath?: string): Promise<void> {
    const { EntityIndexGenerator } = await import('./builders/entity-index-generator');
    
    const generator = new EntityIndexGenerator({
      entitiesPath: entitiesPath || path.join(process.cwd(), 'generated/entities'),
      outputPath: path.join(entitiesPath || path.join(process.cwd(), 'generated/entities'), 'index.ts'),
      includeNamedExports: true,
      includeEntitiesArray: true,
      filePattern: '**/*.entity.ts'
    });

    await generator.generateIndex();
  }

  /**
   * Scan entity files and return information
   */
  public async scanEntityFiles(entitiesPath?: string): Promise<Array<{
    className: string;
    fileName: string;
    filePath: string;
  }>> {
    const { EntityIndexGenerator } = await import('./builders/entity-index-generator');
    
    const generator = new EntityIndexGenerator({
      entitiesPath: entitiesPath || path.join(process.cwd(), 'generated/entities')
    });

    return await generator.scanEntityFiles();
  }

  /**
   * Export table data as INSERT statements
   */
  public async exportTableData(options?: {
    tables?: string[];
    excludeTables?: string[];
    batchSize?: number;
    outputPath?: string;
    prettyPrint?: boolean;
    alignValues?: boolean;
    nullHandling?: 'NULL' | 'DEFAULT' | 'SKIP';
    dataMasking?: {
      enabled: boolean;
      sensitiveFields?: string[];
      maskEmail?: boolean;
      maskPasswords?: boolean;
      maskPhones?: boolean;
    };
    whereConditions?: Record<string, string>;
  }): Promise<{
    success: boolean;
    tableCount: number;
    totalRows: number;
    fileCount: number;
    outputPaths: string[];
    statistics: Record<string, { rows: number; batches: number }>;
  }> {
    const { DataExporter } = await import('./builders/data-exporter');
    const { DatabaseDialect } = await import('./types/database.types');

    const dialect = SchemaIntrospectorFactory.getDialectFromDataSource(this.dataSource);
    
    const dataExporter = new DataExporter(this.dataSource, {
      dialect: dialect === 'postgres' ? DatabaseDialect.POSTGRES : DatabaseDialect.MYSQL,
      batchSize: options?.batchSize || 1000,
      outputPath: options?.outputPath || path.join(process.cwd(), 'generated/sql/data'),
      prettyPrint: options?.prettyPrint !== false,
      alignValues: options?.alignValues !== false,
      nullHandling: options?.nullHandling || 'NULL',
      includeHeaders: true,
      includeTableComments: true,
      tables: options?.tables,
      excludeTables: options?.excludeTables,
      whereConditions: options?.whereConditions,
      dataMasking: {
        enabled: options?.dataMasking?.enabled || false,
        sensitiveFields: options?.dataMasking?.sensitiveFields || ['password', 'email', 'phone', 'mobile', 'ssn'],
        maskingPatterns: {
          email: { type: 'email', replacement: 'user{n}@example.com' },
          password: { type: 'custom', replacement: '***MASKED***' },
          phone: { type: 'phone', pattern: 'XXX-XXX-XXXX' },
          mobile: { type: 'phone', pattern: 'XXX-XXX-XXXX' },
          name: { type: 'name', replacement: 'User {n}' }
        }
      }
    });

    try {
      const result = await dataExporter.exportAllTables();
      
      return {
        success: true,
        tableCount: result.tableCount,
        totalRows: result.totalRows,
        fileCount: result.fileCount,
        outputPaths: result.outputPaths,
        statistics: result.statistics
      };
    } catch (error) {
      console.error('Data export failed:', error);
      throw error;
    }
  }

  /**
   * Generate CRUD operations for all tables
   */
  public async generateCrudOperations(options?: {
    outputPath?: string;
    framework?: 'nestjs' | 'express' | 'fastify';
    includeValidation?: boolean;
    includeSwagger?: boolean;
    includePagination?: boolean;
    includeFiltering?: boolean;
    includeSorting?: boolean;
    includeRelations?: boolean;
    generateTests?: boolean;
    authGuards?: boolean;
    useTypeORM?: boolean;
    useDTO?: boolean;
    tables?: string[];
    excludeTables?: string[];
  }): Promise<{
    success: boolean;
    tablesProcessed: number;
    filesGenerated: number;
    outputPaths: string[];
    modules: Array<{
      tableName: string;
      entityName: string;
      moduleName: string;
      files: {
        entity: string;
        dto: string[];
        controller: string;
        service: string;
        repository: string;
        module: string;
        tests?: string[];
      };
    }>;
  }> {
    try {
      const { CrudGenerator } = await import('./builders/crud-generator');
      const { DatabaseDialect } = await import('./types/database.types');

      const dialect = SchemaIntrospectorFactory.getDialectFromDataSource(this.dataSource);
      
      // Get database schema
      const introspector = SchemaIntrospectorFactory.create(this.dataSource);
      const schema = await introspector.getDatabaseSchema();

      // Filter tables if specified
      let tables = schema.tables;
      if (options?.tables) {
        tables = tables.filter(table => options.tables!.includes(table.tableName));
      }
      if (options?.excludeTables) {
        tables = tables.filter(table => !options.excludeTables!.includes(table.tableName));
      }

      const crudGenerator = new CrudGenerator({
        outputPath: options?.outputPath || path.join(process.cwd(), 'generated/crud'),
        dialect: dialect === 'postgres' ? DatabaseDialect.POSTGRES : DatabaseDialect.MYSQL,
        framework: options?.framework || 'nestjs',
        includeValidation: options?.includeValidation !== false,
        includeSwagger: options?.includeSwagger !== false,
        includePagination: options?.includePagination !== false,
        includeFiltering: options?.includeFiltering !== false,
        includeSorting: options?.includeSorting !== false,
        includeRelations: options?.includeRelations !== false,
        generateTests: options?.generateTests || false,
        authGuards: options?.authGuards || false,
        useTypeORM: options?.useTypeORM !== false,
        useDTO: options?.useDTO !== false,
      });

      const result = await crudGenerator.generateCrudForTables(tables);

      return {
        success: true,
        tablesProcessed: result.tablesProcessed,
        filesGenerated: result.filesGenerated,
        outputPaths: result.outputPaths,
        modules: result.modules
      };
    } catch (error) {
      console.error('CRUD generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate CRUD operations for specific tables
   */
  public async generateCrudForTables(tableNames: string[], options?: {
    outputPath?: string;
    framework?: 'nestjs' | 'express' | 'fastify';
    includeValidation?: boolean;
    includeSwagger?: boolean;
    includePagination?: boolean;
    includeFiltering?: boolean;
    includeSorting?: boolean;
    includeRelations?: boolean;
    generateTests?: boolean;
    authGuards?: boolean;
    useTypeORM?: boolean;
    useDTO?: boolean;
  }): Promise<{
    success: boolean;
    tablesProcessed: number;
    filesGenerated: number;
    outputPaths: string[];
    modules: Array<{
      tableName: string;
      entityName: string;
      moduleName: string;
    }>;
  }> {
    return this.generateCrudOperations({
      ...options,
      tables: tableNames
    });
  }
}
