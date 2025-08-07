/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ReverseEngineeringService } from './reverse-engineering.service';
import { EntityGenerationOptions } from './types/database.types';

@Controller('reverse-engineering')
export class ReverseEngineeringController {
  constructor(private readonly reverseEngineeringService: ReverseEngineeringService) {}

  @Get('test-connection')
  async testConnection() {
    return await this.reverseEngineeringService.testConnection();
  }

  @Get('schema')
  async analyzeSchema() {
    return await this.reverseEngineeringService.analyzeSchema();
  }

  @Get('tables')
  async getTableList() {
    return await this.reverseEngineeringService.getTableList();
  }

  @Post('generate-entities')
  async generateEntities(@Body() options: Partial<EntityGenerationOptions>) {
    try {
      await this.reverseEngineeringService.generateEntities(options);
      return { 
        success: true, 
        message: 'Entities generated successfully',
        outputPath: options.outputPath 
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to generate entities',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  @Post('generate-sql')
  async generateSqlScripts(@Body() body: {
    dialect?: 'postgres' | 'mysql';
    schemaName?: string;
    includeDropIfExists?: boolean;
    includeCreateIfNotExists?: boolean;
    outputPath?: string;
    entitiesPath?: string;
  }) {
    try {
      const result = await this.reverseEngineeringService.generateSQLScripts(body);
      return {
        success: true,
        message: 'SQL scripts generated successfully',
        tableCount: result.tableCount,
        outputPath: result.outputPath,
        sqlPreview: result.sql.split('\n').slice(0, 20).join('\n') + '\n...'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to generate SQL scripts',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  @Post('generate-ui')
  async generateUIComponents(@Query('outputPath') outputPath?: string) {
    try {
      await this.reverseEngineeringService.generateUIComponents();
      return {
        success: true,
        message: 'UI components will be generated (feature coming soon)',
        outputPath
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to generate UI components',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  @Get('entity-files')
  async scanEntityFiles(@Query('entitiesPath') entitiesPath?: string) {
    try {
      const entities = await this.reverseEngineeringService.scanEntityFiles(entitiesPath);
      return {
        success: true,
        count: entities.length,
        entities: entities.map(e => ({
          className: e.className,
          fileName: e.fileName,
          filePath: e.filePath
        }))
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to scan entity files',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  @Post('generate-index')
  async generateEntityIndex(@Body() body: { entitiesPath?: string }) {
    try {
      await this.reverseEngineeringService.generateEntityIndex(body.entitiesPath);
      return {
        success: true,
        message: 'Entity index generated successfully',
        outputPath: body.entitiesPath ? `${body.entitiesPath}/index.ts` : './generated/entities/index.ts'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to generate entity index',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  @Post('export-data')
  async exportTableData(@Body() body: {
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
  }) {
    try {
      const result = await this.reverseEngineeringService.exportTableData(body);
      return {
        success: true,
        message: 'Table data exported successfully',
        ...result
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to export table data',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  @Post('generate-crud')
  async generateCrudOperations(@Body() body: {
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
  }) {
    try {
      const result = await this.reverseEngineeringService.generateCrudOperations(body);
      return {
        success: true,
        message: 'CRUD operations generated successfully',
        ...result
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to generate CRUD operations',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  @Post('generate-crud-for-tables')
  async generateCrudForTables(@Body() body: {
    tableNames: string[];
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
  }) {
    try {
      const { tableNames, ...options } = body;
      const result = await this.reverseEngineeringService.generateCrudForTables(tableNames, options);
      return {
        success: true,
        message: 'CRUD operations generated successfully for specified tables',
        ...result
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to generate CRUD operations for specified tables',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
