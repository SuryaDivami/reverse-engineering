#!/usr/bin/env node
/* eslint-disable prettier/prettier */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ReverseEngineeringService } from '../src/reverse-engineering';
import * as path from 'path';

interface CliOptions {
  help: boolean;
  outputPath: string;
  includeComments: boolean;
  includeRelations: boolean;
  namingConvention: 'camelCase' | 'PascalCase' | 'snake_case';
  generateInterfaces: boolean;
  generateRepositories: boolean;
  testConnection: boolean;
  listTables: boolean;
  analyzeSchema: boolean;
  generateIndex: boolean;
  entitiesPath: string;
  generateSql: boolean;
  sqlDialect: 'postgres' | 'mysql';
  sqlSchemaName?: string;
  sqlOutputPath?: string;
  exportData: boolean;
  dataBatchSize: number;
  dataOutputPath?: string;
  dataMasking: boolean;
  dataTablesOnly?: string[];
  dataExcludeTables?: string[];
  generateCrud: boolean;
  crudOutputPath?: string;
  crudFramework: 'nestjs' | 'express' | 'fastify';
  crudValidation: boolean;
  crudSwagger: boolean;
  crudPagination: boolean;
  crudFiltering: boolean;
  crudSorting: boolean;
  crudAuth: boolean;
  crudTests: boolean;
  crudTablesOnly?: string[];
  crudExcludeTables?: string[];
}

async function parseArgs(): Promise<CliOptions> {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    help: false,
    outputPath: path.join(process.cwd(), 'generated/entities'),
    includeComments: true,
    includeRelations: true,
    namingConvention: 'camelCase',
    generateInterfaces: false,
    generateRepositories: false,
    testConnection: false,
    listTables: false,
    analyzeSchema: false,
    generateIndex: false,
    entitiesPath: path.join(process.cwd(), 'generated/entities'),
    generateSql: false,
    sqlDialect: 'postgres',
    sqlOutputPath: path.join(process.cwd(), 'generated/sql'),
    exportData: false,
    dataBatchSize: 1000,
    dataOutputPath: path.join(process.cwd(), 'generated/sql/data'),
    dataMasking: false,
    generateCrud: false,
    crudOutputPath: path.join(process.cwd(), 'generated/crud'),
    crudFramework: 'nestjs',
    crudValidation: true,
    crudSwagger: true,
    crudPagination: true,
    crudFiltering: true,
    crudSorting: true,
    crudAuth: false,
    crudTests: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--output-path':
      case '-o':
        options.outputPath = args[++i];
        break;
      case '--no-comments':
        options.includeComments = false;
        break;
      case '--no-relations':
        options.includeRelations = false;
        break;
      case '--naming-convention':
      case '-n':
        options.namingConvention = args[++i] as any;
        break;
      case '--generate-interfaces':
        options.generateInterfaces = true;
        break;
      case '--generate-repositories':
        options.generateRepositories = true;
        break;
      case '--generate-index':
      case '-i':
        options.generateIndex = true;
        break;
      case '--entities-path':
        options.entitiesPath = args[++i];
        break;
      case '--test-connection':
      case '-t':
        options.testConnection = true;
        break;
      case '--list-tables':
      case '-l':
        options.listTables = true;
        break;
      case '--analyze-schema':
      case '-a':
        options.analyzeSchema = true;
        break;
      case '--generate-sql':
      case '-s':
        options.generateSql = true;
        break;
      case '--sql-dialect':
        options.sqlDialect = args[++i] as 'postgres' | 'mysql';
        break;
      case '--sql-schema':
        options.sqlSchemaName = args[++i];
        break;
      case '--sql-output':
        options.sqlOutputPath = args[++i];
        break;
      case '--export-data':
      case '-d':
        options.exportData = true;
        break;
      case '--data-batch-size':
        options.dataBatchSize = parseInt(args[++i], 10);
        break;
      case '--data-output':
        options.dataOutputPath = args[++i];
        break;
      case '--data-masking':
        options.dataMasking = true;
        break;
      case '--data-tables':
        options.dataTablesOnly = args[++i].split(',');
        break;
      case '--data-exclude':
        options.dataExcludeTables = args[++i].split(',');
        break;
      case '--generate-crud':
      case '-c':
        options.generateCrud = true;
        break;
      case '--crud-output':
        options.crudOutputPath = args[++i];
        break;
      case '--crud-framework':
        options.crudFramework = args[++i] as 'nestjs' | 'express' | 'fastify';
        break;
      case '--no-crud-validation':
        options.crudValidation = false;
        break;
      case '--no-crud-swagger':
        options.crudSwagger = false;
        break;
      case '--no-crud-pagination':
        options.crudPagination = false;
        break;
      case '--no-crud-filtering':
        options.crudFiltering = false;
        break;
      case '--no-crud-sorting':
        options.crudSorting = false;
        break;
      case '--crud-auth':
        options.crudAuth = true;
        break;
      case '--crud-tests':
        options.crudTests = true;
        break;
      case '--crud-tables':
        options.crudTablesOnly = args[++i].split(',');
        break;
      case '--crud-exclude':
        options.crudExcludeTables = args[++i].split(',');
        break;
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
Database Reverse Engineering CLI Tool

Usage: npm run reverse-engineer [options]

Options:
  -h, --help                    Show this help message
  -o, --output-path <path>      Output directory for generated files (default: ./generated/entities)
  -n, --naming-convention <convention>  Naming convention: camelCase, PascalCase, snake_case (default: camelCase)
  --no-comments                 Exclude database comments from generated entities
  --no-relations                Exclude foreign key relationships from generated entities
  --generate-interfaces         Generate TypeScript interfaces alongside entities
  --generate-repositories       Generate repository classes for entities
  -i, --generate-index          Generate index.ts file for all entities
  --entities-path <path>        Path to entities directory (default: ./generated/entities)
  -t, --test-connection         Test database connection and show info
  -l, --list-tables            List all tables in the database
  -a, --analyze-schema         Analyze and display full database schema
  -s, --generate-sql           Generate CREATE TABLE SQL scripts
  --sql-dialect <dialect>      SQL dialect for scripts: postgres, mysql (default: postgres)
  --sql-schema <schema>        Schema name for SQL scripts (PostgreSQL only)
  --sql-output <path>          Output directory for SQL files (default: ./generated/sql)
  -d, --export-data            Export table data as INSERT statements
  --data-batch-size <size>     Batch size for data export (default: 1000)
  --data-output <path>         Output directory for data files (default: ./generated/sql/data)
  --data-masking               Enable data masking for sensitive fields
  --data-tables <tables>       Comma-separated list of tables to export (default: all)
  --data-exclude <tables>      Comma-separated list of tables to exclude
  -c, --generate-crud          Generate CRUD operations (controllers, services, repositories, modules)
  --crud-output <path>         Output directory for CRUD files (default: ./generated/crud)
  --crud-framework <framework> Framework to use: nestjs, express, fastify (default: nestjs)
  --no-crud-validation         Disable validation decorators in DTOs
  --no-crud-swagger            Disable Swagger/OpenAPI decorators
  --no-crud-pagination         Disable pagination support
  --no-crud-filtering          Disable filtering support
  --no-crud-sorting            Disable sorting support
  --crud-auth                  Include authentication guards
  --crud-tests                 Generate test files
  --crud-tables <tables>       Comma-separated list of tables to generate CRUD for (default: all)
  --crud-exclude <tables>      Comma-separated list of tables to exclude from CRUD generation

Examples:
  npm run reverse-engineer
  npm run reverse-engineer -o ./src/entities --no-comments
  npm run reverse-engineer --naming-convention PascalCase --generate-interfaces
  npm run reverse-engineer --test-connection
  npm run reverse-engineer --list-tables
  npm run reverse-engineer --analyze-schema
  npm run reverse-engineer --generate-sql --sql-dialect postgres
  npm run reverse-engineer --generate-sql --entities-path ./src/entities
  npm run reverse-engineer --export-data --data-masking
  npm run reverse-engineer --export-data --data-tables users,customers
  npm run reverse-engineer --generate-crud --crud-framework nestjs
  npm run reverse-engineer --generate-crud --crud-auth --crud-tests
  npm run reverse-engineer --generate-crud --crud-tables users,posts --no-crud-pagination
`);
}

async function main(): Promise<void> {
  try {
    const options = await parseArgs();

    if (options.help) {
      printHelp();
      return;
    }

    console.log('🔄 Initializing reverse engineering tool...\n');

    const app = await NestFactory.createApplicationContext(AppModule, {
      logger: false
    });

    const reverseEngineeringService = app.get(ReverseEngineeringService);

    // Test connection if requested
    if (options.testConnection) {
      console.log('🔍 Testing database connection...');
      const connectionTest = await reverseEngineeringService.testConnection();
      
      if (connectionTest.connected) {
        console.log(`✅ Connected to ${connectionTest.dialect} database`);
        if (connectionTest.version) {
          console.log(`📊 Database version: ${connectionTest.version}`);
        }
      } else {
        console.error(`❌ Connection failed: ${connectionTest.error}`);
        process.exit(1);
      }
      console.log('');
    }

    // List tables if requested
    if (options.listTables) {
      console.log('📋 Listing database tables...');
      const tables = await reverseEngineeringService.getTableList();
      
      console.log(`Found ${tables.length} tables:\n`);
      tables.forEach(table => {
        console.log(`  📄 ${table.tableSchema}.${table.tableName} (${table.columnCount} columns)`);
      });
      console.log('');
    }

    // Analyze schema if requested
    if (options.analyzeSchema) {
      console.log('🔍 Analyzing database schema...');
      const schema = await reverseEngineeringService.analyzeSchema();
      
      console.log(`\n📊 Schema Analysis for ${schema.dialect} database:`);
      console.log(`Tables: ${schema.tables.length}\n`);

      schema.tables.forEach(table => {
        console.log(`📄 Table: ${table.tableSchema}.${table.tableName}`);
        if (table.tableComment) {
          console.log(`   Comment: ${table.tableComment}`);
        }
        console.log(`   Columns: ${table.columns.length}`);
        console.log(`   Primary Keys: ${table.primaryKeys.join(', ') || 'None'}`);
        console.log(`   Foreign Keys: ${table.foreignKeys.length}`);
        console.log(`   Indexes: ${table.indexes.length}`);
        
        // Show column details
        if (table.columns.length <= 10) { // Only show for smaller tables
          table.columns.forEach(col => {
            const nullable = col.isNullable ? '(nullable)' : '(not null)';
            const pk = table.primaryKeys.includes(col.columnName) ? ' [PK]' : '';
            console.log(`     • ${col.columnName}: ${col.dataType} ${nullable}${pk}`);
          });
        }
        console.log('');
      });
    }

    // Generate index if requested
    if (options.generateIndex) {
      console.log('📝 Generating entity index...');
      await reverseEngineeringService.generateEntityIndex(options.entitiesPath);
      console.log(`✅ Entity index generated!`);
      console.log(`📁 Output: ${options.entitiesPath}/index.ts`);
    }

    // Generate SQL scripts if requested
    if (options.generateSql) {
      console.log('📝 Generating CREATE TABLE SQL scripts...');
      const result = await reverseEngineeringService.generateSQLScripts({
        dialect: options.sqlDialect,
        schemaName: options.sqlSchemaName,
        outputPath: options.sqlOutputPath
        // Don't pass entitiesPath - use database schema by default
      });
      
      console.log(`✅ SQL scripts generated!`);
      console.log(`📊 ${result.tableCount} tables processed`);
      console.log(`📁 Output file: ${result.outputPath}`);
      console.log(`🔧 Dialect: ${options.sqlDialect}`);
      
      if (options.sqlSchemaName) {
        console.log(`🏷️  Schema: ${options.sqlSchemaName}`);
      }
    }

    // Export data if requested
    if (options.exportData) {
      console.log('📦 Exporting table data as INSERT statements...');
      const result = await reverseEngineeringService.exportTableData({
        tables: options.dataTablesOnly,
        excludeTables: options.dataExcludeTables,
        batchSize: options.dataBatchSize,
        outputPath: options.dataOutputPath,
        dataMasking: {
          enabled: options.dataMasking,
          sensitiveFields: ['password', 'email', 'phone', 'mobile', 'ssn', 'credit_card']
        }
      });
      
      console.log(`✅ Data export completed!`);
      console.log(`📊 ${result.tableCount} tables processed`);
      console.log(`📄 ${result.totalRows.toLocaleString()} total rows exported`);
      console.log(`📁 ${result.fileCount} files generated`);
      console.log(`🔧 Batch size: ${options.dataBatchSize}`);
      
      if (options.dataMasking) {
        console.log(`🔒 Data masking: ENABLED`);
      }
      
      console.log(`📁 Output directory: ${options.dataOutputPath}`);
    }

    // Generate CRUD operations if requested
    if (options.generateCrud) {
      console.log('🛠️  Generating CRUD operations (controllers, services, repositories, modules)...');
      const result = await reverseEngineeringService.generateCrudOperations({
        outputPath: options.crudOutputPath,
        framework: options.crudFramework,
        includeValidation: options.crudValidation,
        includeSwagger: options.crudSwagger,
        includePagination: options.crudPagination,
        includeFiltering: options.crudFiltering,
        includeSorting: options.crudSorting,
        authGuards: options.crudAuth,
        generateTests: options.crudTests,
        tables: options.crudTablesOnly,
        excludeTables: options.crudExcludeTables
      });
      
      console.log(`✅ CRUD generation completed!`);
      console.log(`📊 ${result.tablesProcessed} tables processed`);
      console.log(`📁 ${result.filesGenerated} files generated`);
      console.log(`🔧 Framework: ${options.crudFramework}`);
      console.log(`🔒 Authentication: ${options.crudAuth ? 'ENABLED' : 'DISABLED'}`);
      console.log(`🧪 Tests: ${options.crudTests ? 'GENERATED' : 'SKIPPED'}`);
      console.log(`📁 Output directory: ${options.crudOutputPath}`);
      
      console.log(`\n📋 Generated modules:`);
      result.modules.forEach(module => {
        console.log(`  🔧 ${module.entityName}Module (${module.tableName})`);
      });
    }

    // Generate entities (default action if no specific action requested)
    if (!options.testConnection && !options.listTables && !options.analyzeSchema && !options.generateIndex && !options.generateSql && !options.exportData && !options.generateCrud) {
      console.log('🛠️  Generating TypeScript entities...');
      
      await reverseEngineeringService.generateEntities({
        outputPath: options.outputPath,
        includeComments: options.includeComments,
        includeRelations: options.includeRelations,
        namingConvention: options.namingConvention,
        generateInterfaces: options.generateInterfaces,
        generateRepositories: options.generateRepositories,
        useDataTransferObjects: false
      });

      console.log(`\n✅ Entity generation completed!`);
      console.log(`📁 Output directory: ${options.outputPath}`);
    }

    await app.close();
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { main };
