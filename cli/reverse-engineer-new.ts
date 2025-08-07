#!/usr/bin/env node

import { Command } from 'commander';
import { ReverseEngineeringService } from '../src/reverse-engineering/reverse-engineering-service-new';
import { CrudGenerator } from '../src/reverse-engineering/builders/crud-generator-new';
import { DatabaseDialect } from '../src/reverse-engineering/types/database.types';
import { ReverseEngineeringConfigInput } from '../src/reverse-engineering/types/config.types';
import { createConfig } from '../src/reverse-engineering/config/default.config';
import * as fs from 'fs';
import * as path from 'path';

const program = new Command();

// Load configuration from file if exists
function loadConfig(): Partial<ReverseEngineeringConfigInput> | null {
  const configPaths = [
    'reverse-engineering.config.js',
    'reverse-engineering.config.json',
    '.reverserc.js',
    '.reverserc.json'
  ];

  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      console.log(`📄 Loading configuration from ${configPath}`);
      try {
        if (configPath.endsWith('.json')) {
          return JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } else {
          delete require.cache[require.resolve(path.resolve(configPath))];
          return require(path.resolve(configPath));
        }
      } catch (error) {
        console.warn(`⚠️  Failed to load config from ${configPath}:`, error.message);
      }
    }
  }

  return null;
}

// Create database configuration from CLI options
function createDatabaseConfig(options: any): any {
  return {
    type: options.dialect || 'postgres',
    host: options.host || 'localhost',
    port: parseInt(options.port) || (options.dialect === 'mysql' ? 3306 : 5432),
    username: options.username || options.user || 'postgres',
    password: options.password,
    database: options.database,
    schema: options.schema,
    ssl: options.ssl
  };
}

// Main program configuration
program
  .name('nestjs-reverse-engineering')
  .description('A powerful reverse engineering and CRUD generation library for NestJS/TypeScript')
  .version('1.0.0');

// Global options
program
  .option('-h, --host <host>', 'Database host', 'localhost')
  .option('-p, --port <port>', 'Database port')
  .option('-u, --username <username>', 'Database username')
  .option('-w, --password <password>', 'Database password')
  .option('-d, --database <database>', 'Database name')
  .option('-s, --schema <schema>', 'Database schema')
  .option('--dialect <dialect>', 'Database dialect (postgres|mysql)', 'postgres')
  .option('--ssl', 'Use SSL connection')
  .option('--config <path>', 'Configuration file path')
  .option('--output-dir <dir>', 'Base output directory', './src')
  .option('--entities-dir <dir>', 'Entities directory', './src/entities')
  .option('--sql-dir <dir>', 'SQL output directory', './sql')
  .option('--data-dir <dir>', 'Data export directory', './data');

// Command: Generate entities
program
  .command('generate:entities')
  .alias('entities')
  .description('Generate TypeORM entities from database schema')
  .option('--include-tables <tables>', 'Comma-separated list of tables to include')
  .option('--exclude-tables <tables>', 'Comma-separated list of tables to exclude')
  .option('--no-validation', 'Skip validation decorators')
  .option('--no-swagger', 'Skip Swagger decorators')
  .option('--no-index', 'Skip index file generation')
  .action(async (options, command) => {
    try {
      const globalOptions = command.parent.opts();
      const fileConfig = loadConfig() || {};

      const config: ReverseEngineeringConfigInput = {
        ...fileConfig,
        database: {
          ...fileConfig.database,
          ...createDatabaseConfig(globalOptions)
        },
        paths: {
          baseOutput: globalOptions.outputDir || fileConfig.paths?.baseOutput || './src',
          entities: globalOptions.entitiesDir || fileConfig.paths?.entities || './src/entities',
          crud: globalOptions.outputDir || fileConfig.paths?.crud || './src',
          sql: globalOptions.sqlDir || fileConfig.paths?.sql || './sql',
          dataExport: globalOptions.dataDir || fileConfig.paths?.dataExport || './data'
        },
        features: {
          entities: true,
          crud: false,
          sql: false,
          dataExport: false,
          generateIndex: !options.noIndex,
          ...fileConfig.features
        },
        entities: {
          includeValidation: !options.noValidation,
          includeSwagger: !options.noSwagger,
          useTypeORM: true,
          generateEnums: true,
          excludedTables: options.excludeTables ? options.excludeTables.split(',') : [],
          includedTables: options.includeTables ? options.includeTables.split(',') : undefined,
          ...fileConfig.entities
        }
      };

      const service = new ReverseEngineeringService();
      service.initialize(config);
      await service.generateEntities();

    } catch (error) {
      console.error('❌ Entity generation failed:', error.message);
      process.exit(1);
    }
  });

// Command: Generate CRUD
program
  .command('generate:crud')
  .alias('crud')
  .description('Generate CRUD operations (controllers, services, repositories)')
  .option('--framework <framework>', 'Framework to use (nestjs|express|fastify)', 'nestjs')
  .option('--include-tables <tables>', 'Comma-separated list of tables to include')
  .option('--exclude-tables <tables>', 'Comma-separated list of tables to exclude')
  .option('--no-validation', 'Skip validation decorators')
  .option('--no-swagger', 'Skip Swagger decorators')
  .option('--no-pagination', 'Skip pagination support')
  .option('--no-filtering', 'Skip filtering support')
  .option('--no-sorting', 'Skip sorting support')
  .option('--no-dto', 'Skip DTO generation')
  .option('--auth', 'Include authentication guards')
  .option('--tests', 'Generate test files')
  .action(async (options, command) => {
    try {
      const globalOptions = command.parent.opts();
      const fileConfig = loadConfig() || {};

      const config: ReverseEngineeringConfigInput = {
        ...fileConfig,
        database: {
          ...fileConfig.database,
          ...createDatabaseConfig(globalOptions)
        },
        paths: {
          baseOutput: globalOptions.outputDir || fileConfig.paths?.baseOutput || './src',
          entities: globalOptions.entitiesDir || fileConfig.paths?.entities || './src/entities',
          crud: globalOptions.outputDir || fileConfig.paths?.crud || './src',
          sql: globalOptions.sqlDir || fileConfig.paths?.sql || './sql',
          dataExport: globalOptions.dataDir || fileConfig.paths?.dataExport || './data'
        },
        features: {
          entities: false,
          crud: true,
          sql: false,
          dataExport: false,
          generateIndex: false,
          ...fileConfig.features
        },
        crud: {
          framework: options.framework,
          includeValidation: !options.noValidation,
          includeSwagger: !options.noSwagger,
          includePagination: !options.noPagination,
          includeFiltering: !options.noFiltering,
          includeSorting: !options.noSorting,
          includeRelations: false,
          generateTests: options.tests,
          authGuards: options.auth,
          useTypeORM: true,
          useDTO: !options.noDto,
          excludedTables: options.excludeTables ? options.excludeTables.split(',') : [],
          includedTables: options.includeTables ? options.includeTables.split(',') : undefined,
          ...fileConfig.crud
        }
      };

      const service = new ReverseEngineeringService();
      service.initialize(config);
      await service.generateCrud();

    } catch (error) {
      console.error('❌ CRUD generation failed:', error.message);
      process.exit(1);
    }
  });

// Command: Generate SQL scripts
program
  .command('generate:sql')
  .alias('sql')
  .description('Generate SQL scripts (CREATE TABLE, INSERT statements)')
  .option('--no-create', 'Skip CREATE TABLE scripts')
  .option('--no-insert', 'Skip INSERT scripts')
  .option('--no-format', 'Skip SQL formatting')
  .action(async (options, command) => {
    try {
      const globalOptions = command.parent.opts();
      const fileConfig = loadConfig() || {};

      const config: ReverseEngineeringConfigInput = {
        ...fileConfig,
        database: {
          ...fileConfig.database,
          ...createDatabaseConfig(globalOptions)
        },
        paths: {
          baseOutput: globalOptions.outputDir || fileConfig.paths?.baseOutput || './src',
          entities: globalOptions.entitiesDir || fileConfig.paths?.entities || './src/entities',
          crud: globalOptions.outputDir || fileConfig.paths?.crud || './src',
          sql: globalOptions.sqlDir || fileConfig.paths?.sql || './sql',
          dataExport: globalOptions.dataDir || fileConfig.paths?.dataExport || './data'
        },
        features: {
          entities: false,
          crud: false,
          sql: true,
          dataExport: false,
          generateIndex: false,
          ...fileConfig.features
        },
        sql: {
          generateCreateTables: !options.noCreate,
          generateInserts: !options.noInsert,
          formatSql: !options.noFormat,
          includeComments: true,
          ...fileConfig.sql
        }
      };

      const service = new ReverseEngineeringService();
      service.initialize(config);
      await service.generateSql();

    } catch (error) {
      console.error('❌ SQL generation failed:', error.message);
      process.exit(1);
    }
  });

// Command: Export data
program
  .command('export:data')
  .alias('data')
  .description('Export database data with optional masking')
  .option('--format <format>', 'Export format (sql|json|csv)', 'sql')
  .option('--batch-size <size>', 'Batch size for exports', '1000')
  .option('--max-rows <rows>', 'Maximum rows per table')
  .option('--mask', 'Enable data masking')
  .option('--mask-fields <fields>', 'Comma-separated list of fields to mask')
  .action(async (options, command) => {
    try {
      const globalOptions = command.parent.opts();
      const fileConfig = loadConfig() || {};

      const config: ReverseEngineeringConfigInput = {
        ...fileConfig,
        database: {
          ...fileConfig.database,
          ...createDatabaseConfig(globalOptions)
        },
        paths: {
          baseOutput: globalOptions.outputDir || fileConfig.paths?.baseOutput || './src',
          entities: globalOptions.entitiesDir || fileConfig.paths?.entities || './src/entities',
          crud: globalOptions.outputDir || fileConfig.paths?.crud || './src',
          sql: globalOptions.sqlDir || fileConfig.paths?.sql || './sql',
          dataExport: globalOptions.dataDir || fileConfig.paths?.dataExport || './data'
        },
        features: {
          entities: false,
          crud: false,
          sql: false,
          dataExport: true,
          generateIndex: false,
          ...fileConfig.features
        },
        dataExport: {
          enableMasking: options.mask,
          batchSize: parseInt(options.batchSize) || 1000,
          format: options.format,
          maskedFields: options.maskFields ? options.maskFields.split(',') : 
                       ['password', 'email', 'phone', 'ssn', 'credit_card'],
          maxRows: options.maxRows ? parseInt(options.maxRows) : undefined,
          ...fileConfig.dataExport
        }
      };

      const service = new ReverseEngineeringService();
      service.initialize(config);
      await service.exportData();

    } catch (error) {
      console.error('❌ Data export failed:', error.message);
      process.exit(1);
    }
  });

// Command: Generate all
program
  .command('generate:all')
  .alias('all')
  .description('Generate everything (entities, CRUD, SQL, data export)')
  .option('--skip-entities', 'Skip entity generation')
  .option('--skip-crud', 'Skip CRUD generation')
  .option('--skip-sql', 'Skip SQL generation')
  .option('--skip-data', 'Skip data export')
  .action(async (options, command) => {
    try {
      const globalOptions = command.parent.opts();
      const fileConfig = loadConfig() || {};

      const config: ReverseEngineeringConfigInput = {
        ...fileConfig,
        database: {
          ...fileConfig.database,
          ...createDatabaseConfig(globalOptions)
        },
        paths: {
          baseOutput: globalOptions.outputDir || fileConfig.paths?.baseOutput || './src',
          entities: globalOptions.entitiesDir || fileConfig.paths?.entities || './src/entities',
          crud: globalOptions.outputDir || fileConfig.paths?.crud || './src',
          sql: globalOptions.sqlDir || fileConfig.paths?.sql || './sql',
          dataExport: globalOptions.dataDir || fileConfig.paths?.dataExport || './data'
        },
        features: {
          entities: !options.skipEntities,
          crud: !options.skipCrud,
          sql: !options.skipSql,
          dataExport: !options.skipData,
          generateIndex: !options.skipEntities,
          ...fileConfig.features
        }
      };

      const service = new ReverseEngineeringService();
      service.initialize(config);
      await service.generateAll();

    } catch (error) {
      console.error('❌ Generation failed:', error.message);
      process.exit(1);
    }
  });

// Command: Test connection
program
  .command('test')
  .description('Test database connection')
  .action(async (options, command) => {
    try {
      const globalOptions = command.parent.opts();
      const fileConfig = loadConfig() || {};

      const dbConfig = {
        ...fileConfig.database,
        ...createDatabaseConfig(globalOptions)
      };

      const service = new ReverseEngineeringService();
      const success = await service.testConnection(dbConfig);
      
      if (!success) {
        process.exit(1);
      }

    } catch (error) {
      console.error('❌ Connection test failed:', error.message);
      process.exit(1);
    }
  });

// Command: List tables
program
  .command('tables')
  .description('List database tables')
  .action(async (options, command) => {
    try {
      const globalOptions = command.parent.opts();
      const fileConfig = loadConfig() || {};

      const dbConfig = {
        ...fileConfig.database,
        ...createDatabaseConfig(globalOptions)
      };

      const service = new ReverseEngineeringService();
      const tables = await service.getTables(dbConfig);

      console.log(`\n📊 Found ${tables.length} tables:\n`);
      tables.forEach((table, index) => {
        console.log(`${index + 1}. ${table.tableName} (${table.columns.length} columns)`);
      });

    } catch (error) {
      console.error('❌ Failed to list tables:', error.message);
      process.exit(1);
    }
  });

// Command: Generate config file
program
  .command('init')
  .description('Generate configuration file')
  .option('--format <format>', 'Config format (js|json)', 'js')
  .action(async (options) => {
    try {
      const configTemplate = {
        database: {
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'password',
          database: 'your_database',
          schema: 'public'
        },
        paths: {
          baseOutput: './src',
          entities: './src/entities',
          crud: './src',
          sql: './sql',
          dataExport: './data'
        },
        features: {
          entities: true,
          crud: true,
          sql: true,
          dataExport: false,
          generateIndex: true
        },
        crud: {
          framework: 'nestjs',
          includeValidation: true,
          includeSwagger: true,
          includePagination: true,
          includeFiltering: true,
          includeSorting: true,
          includeRelations: false,
          generateTests: false,
          authGuards: false,
          useTypeORM: true,
          useDTO: true,
          excludedTables: [],
          includedTables: undefined
        },
        entities: {
          useTypeORM: true,
          includeValidation: true,
          includeSwagger: true,
          generateEnums: true,
          excludedTables: [],
          includedTables: undefined
        },
        sql: {
          generateCreateTables: true,
          generateInserts: true,
          formatSql: true,
          includeComments: true
        },
        dataExport: {
          enableMasking: false,
          batchSize: 1000,
          format: 'sql',
          maskedFields: ['password', 'email', 'phone', 'ssn', 'credit_card'],
          maxRows: undefined
        }
      };

      const filename = options.format === 'json' ? 
        'reverse-engineering.config.json' : 
        'reverse-engineering.config.js';

      let content: string;
      if (options.format === 'json') {
        content = JSON.stringify(configTemplate, null, 2);
      } else {
        content = `module.exports = ${JSON.stringify(configTemplate, null, 2)};`;
      }

      fs.writeFileSync(filename, content);
      console.log(`✅ Configuration file created: ${filename}`);
      console.log('📝 Edit the configuration file to match your setup');

    } catch (error) {
      console.error('❌ Failed to create config file:', error.message);
      process.exit(1);
    }
  });

// Handle unknown commands
program.on('command:*', () => {
  console.error('❌ Invalid command: %s', program.args.join(' '));
  console.log('See --help for a list of available commands.');
  process.exit(1);
});

// Show help if no command is provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(0);
}

program.parse(process.argv);
