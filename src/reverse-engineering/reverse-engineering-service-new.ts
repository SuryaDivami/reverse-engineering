/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SchemaIntrospectorFactory } from './schema/introspector-factory';
import { EntityBuilder } from './builders/entity-builder';
import { CrudGenerator } from './builders/crud-generator-new';
import { SqlGenerator } from './builders/sql-generator';
import { DataExporter } from './builders/data-exporter';
import { EntityIndexGenerator } from './builders/entity-index-generator';
import { 
  EntityGenerationOptions, 
  DatabaseSchema, 
  TableInfo,
  DatabaseDialect 
} from './types/database.types';
import { 
  ReverseEngineeringConfig, 
  ReverseEngineeringConfigInput,
  DatabaseConfig 
} from './types/config.types';
import { createConfig } from './config/default.config';
import * as path from 'path';

@Injectable()
export class ReverseEngineeringService {
  private config: ReverseEngineeringConfig;

  constructor(private readonly dataSource?: DataSource) {}

  /**
   * Initialize the service with configuration
   */
  public initialize(configInput: ReverseEngineeringConfigInput): void {
    this.config = createConfig(configInput);
    console.log('🔧 Reverse Engineering Service initialized with configuration');
  }

  /**
   * Get configuration (create default if not initialized)
   */
  private getConfig(): ReverseEngineeringConfig {
    if (!this.config) {
      throw new Error('Service not initialized. Call initialize() with configuration first.');
    }
    return this.config;
  }

  /**
   * Create a database connection from configuration
   */
  private async createDataSource(dbConfig: DatabaseConfig): Promise<DataSource> {
    const { DataSource } = await import('typeorm');
    
    return new DataSource({
      type: dbConfig.type as any,
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      schema: dbConfig.schema,
      ssl: dbConfig.ssl,
      entities: [],
      synchronize: false,
    });
  }

  /**
   * Generate TypeScript entities from database schema
   */
  public async generateEntities(configOverride?: Partial<ReverseEngineeringConfigInput>): Promise<void> {
    const config = configOverride ? createConfig({ ...this.getConfig(), ...configOverride }) : this.getConfig();
    
    if (!config.features.entities) {
      console.log('⏭️  Entity generation disabled in configuration');
      return;
    }

    console.log('🔄 Starting entity generation process...');
    console.log(`📁 Output path: ${config.paths.entities}`);

    // Create or use existing data source
    const dataSource = this.dataSource || await this.createDataSource(config.database);
    
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    try {
      // Get database schema
      const introspector = SchemaIntrospectorFactory.create(dataSource);
      const schema = await introspector.getDatabaseSchema();

      console.log(`🗄️  Found ${schema.tables.length} tables in ${schema.dialect} database`);

      // Filter tables based on configuration
      let filteredTables = schema.tables;
      if (config.entities.includedTables && config.entities.includedTables.length > 0) {
        filteredTables = filteredTables.filter(table => 
          config.entities.includedTables!.includes(table.tableName)
        );
      }
      if (config.entities.excludedTables && config.entities.excludedTables.length > 0) {
        filteredTables = filteredTables.filter(table => 
          !config.entities.excludedTables.includes(table.tableName)
        );
      }

      console.log(`📊 Processing ${filteredTables.length} tables after filtering`);

      // Generate entities
      const entityOptions: EntityGenerationOptions = {
        outputPath: config.paths.entities,
        generateInterfaces: false,
        generateRepositories: false,
        useDataTransferObjects: false,
        includeComments: true,
        namingConvention: 'camelCase',
        includeRelations: config.entities.useTypeORM,
      };

      const entityBuilder = new EntityBuilder(entityOptions, filteredTables, schema.dialect);

      for (const table of filteredTables) {
        try {
          await entityBuilder.generateEntity(table);
          console.log(`  ✅ Generated entity for ${table.tableName}`);
        } catch (error) {
          console.error(`  ❌ Failed to generate entity for table ${table.tableName}:`, error);
        }
      }

      // Generate index file if enabled
      if (config.features.generateIndex) {
        const indexGenerator = new EntityIndexGenerator({
          entitiesPath: config.paths.entities,
          outputPath: path.join(config.paths.entities, 'index.ts')
        });
        await indexGenerator.generateIndex();
        console.log(`  📄 Generated index file`);
      }

      console.log('✅ Entity generation process completed!');

    } finally {
      // Only destroy if we created the connection
      if (!this.dataSource && dataSource.isInitialized) {
        await dataSource.destroy();
      }
    }
  }

  /**
   * Generate CRUD operations for tables
   */
  public async generateCrud(configOverride?: Partial<ReverseEngineeringConfigInput>): Promise<void> {
    const config = configOverride ? createConfig({ ...this.getConfig(), ...configOverride }) : this.getConfig();
    
    if (!config.features.crud) {
      console.log('⏭️  CRUD generation disabled in configuration');
      return;
    }

    console.log('🔄 Starting CRUD generation process...');

    // Create or use existing data source
    const dataSource = this.dataSource || await this.createDataSource(config.database);
    
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    try {
      // Get database schema
      const introspector = SchemaIntrospectorFactory.create(dataSource);
      const schema = await introspector.getDatabaseSchema();

      console.log(`🗄️  Found ${schema.tables.length} tables in ${schema.dialect} database`);

      // Generate CRUD operations
      const crudGenerator = new CrudGenerator(config);
      const result = await crudGenerator.generateCrudForTables(schema.tables);

      console.log(`✅ CRUD generation completed!`);
      console.log(`📊 ${result.tablesProcessed} tables processed`);
      console.log(`📁 ${result.filesGenerated} files generated`);
      console.log(`📋 App module: ${result.appModulePath}`);

    } finally {
      // Only destroy if we created the connection
      if (!this.dataSource && dataSource.isInitialized) {
        await dataSource.destroy();
      }
    }
  }

  /**
   * Generate SQL scripts
   */
  public async generateSql(configOverride?: Partial<ReverseEngineeringConfigInput>): Promise<void> {
    const config = configOverride ? createConfig({ ...this.getConfig(), ...configOverride }) : this.getConfig();
    
    if (!config.features.sql) {
      console.log('⏭️  SQL generation disabled in configuration');
      return;
    }

    console.log('🔄 Starting SQL generation process...');

    // Create or use existing data source
    const dataSource = this.dataSource || await this.createDataSource(config.database);
    
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    try {
      // Get database schema
      const introspector = SchemaIntrospectorFactory.create(dataSource);
      const schema = await introspector.getDatabaseSchema();

      // Generate SQL scripts
      const sqlGenerator = new SqlGenerator();
      const result = await sqlGenerator.generateCreateTableScripts(schema.tables);

      console.log(`✅ SQL generation completed!`);
      console.log(`📁 Generated SQL scripts`);

    } finally {
      if (!this.dataSource && dataSource.isInitialized) {
        await dataSource.destroy();
      }
    }
  }

  /**
   * Export data with optional masking
   */
  public async exportData(configOverride?: Partial<ReverseEngineeringConfigInput>): Promise<void> {
    const config = configOverride ? createConfig({ ...this.getConfig(), ...configOverride }) : this.getConfig();
    
    if (!config.features.dataExport) {
      console.log('⏭️  Data export disabled in configuration');
      return;
    }

    console.log('🔄 Starting data export process...');

    // Create or use existing data source
    const dataSource = this.dataSource || await this.createDataSource(config.database);
    
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    try {
      // Get database schema
      const introspector = SchemaIntrospectorFactory.create(dataSource);
      const schema = await introspector.getDatabaseSchema();

      // Export data
      const dataExporter = new DataExporter(dataSource, {
        dialect: config.database.type,
        outputPath: config.paths.dataExport,
        batchSize: config.dataExport.batchSize,
        dataMasking: {
          enabled: config.dataExport.enableMasking,
          sensitiveFields: config.dataExport.maskedFields,
          maskingPatterns: {}
        }
      });
      
      const tableNames = schema.tables.map(t => t.tableName);
      const result = await dataExporter.exportTables(tableNames);

      console.log(`✅ Data export completed!`);
      console.log(`📊 ${result.tableCount} tables processed`);
      console.log(`📁 ${result.fileCount} files generated`);

    } finally {
      if (!this.dataSource && dataSource.isInitialized) {
        await dataSource.destroy();
      }
    }
  }

  /**
   * Complete reverse engineering process (entities + CRUD + SQL + data export)
   */
  public async generateAll(configOverride?: Partial<ReverseEngineeringConfigInput>): Promise<void> {
    const config = configOverride ? createConfig({ ...this.getConfig(), ...configOverride }) : this.getConfig();

    console.log('🚀 Starting complete reverse engineering process...');

    if (config.features.entities) {
      await this.generateEntities(configOverride);
    }

    if (config.features.crud) {
      await this.generateCrud(configOverride);
    }

    if (config.features.sql) {
      await this.generateSql(configOverride);
    }

    if (config.features.dataExport) {
      await this.exportData(configOverride);
    }

    console.log('🎉 Complete reverse engineering process finished!');
  }

  /**
   * Test database connection
   */
  public async testConnection(dbConfig?: DatabaseConfig): Promise<boolean> {
    const config = dbConfig || this.getConfig().database;
    
    console.log('🔌 Testing database connection...');

    try {
      const dataSource = await this.createDataSource(config);
      await dataSource.initialize();
      
      console.log('✅ Database connection successful!');
      
      await dataSource.destroy();
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
  }

  /**
   * Get database schema information
   */
  public async getSchema(dbConfig?: DatabaseConfig): Promise<DatabaseSchema> {
    const config = dbConfig || this.getConfig().database;
    
    const dataSource = await this.createDataSource(config);
    await dataSource.initialize();

    try {
      const introspector = SchemaIntrospectorFactory.create(dataSource);
      return await introspector.getDatabaseSchema();
    } finally {
      await dataSource.destroy();
    }
  }

  /**
   * Get list of tables
   */
  public async getTables(dbConfig?: DatabaseConfig): Promise<TableInfo[]> {
    const schema = await this.getSchema(dbConfig);
    return schema.tables;
  }

  /**
   * Validate configuration
   */
  public validateConfig(configInput: ReverseEngineeringConfigInput): boolean {
    try {
      const config = createConfig(configInput);
      
      // Validate database configuration
      if (!config.database.host || !config.database.database) {
        throw new Error('Database host and database name are required');
      }

      // Validate paths
      if (!config.paths.baseOutput) {
        throw new Error('Base output path is required');
      }

      console.log('✅ Configuration is valid');
      return true;
    } catch (error) {
      console.error('❌ Configuration validation failed:', error.message);
      return false;
    }
  }

  /**
   * Get current configuration
   */
  public getConfiguration(): ReverseEngineeringConfig | null {
    return this.config || null;
  }
}
