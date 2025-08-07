/* eslint-disable prettier/prettier */
import * as fs from 'fs';
import * as path from 'path';
import { TableInfo, ColumnInfo, DatabaseDialect } from '../types/database.types';
import { NamingUtils } from '../utils/naming-utils';
import { TypeMapper } from '../utils/type-mapper';

export interface CrudGenerationOptions {
  outputPath: string;
  dialect: DatabaseDialect;
  framework: 'nestjs' | 'express' | 'fastify';
  includeValidation: boolean;
  includeSwagger: boolean;
  includePagination: boolean;
  includeFiltering: boolean;
  includeSorting: boolean;
  includeRelations: boolean;
  generateTests: boolean;
  authGuards: boolean;
  useTypeORM: boolean;
  useDTO: boolean;
  moduleName?: string;
}

export interface CrudGenerationResult {
  tablesProcessed: number;
  filesGenerated: number;
  outputPaths: string[];
  modules: ModuleInfo[];
}

export interface ModuleInfo {
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
}

export class CrudGenerator {
  private readonly options: CrudGenerationOptions;

  constructor(options: Partial<CrudGenerationOptions> = {}) {
    this.options = {
      outputPath: './src',
      dialect: DatabaseDialect.POSTGRES,
      framework: 'nestjs',
      includeValidation: true,
      includeSwagger: true,
      includePagination: true,
      includeFiltering: true,
      includeSorting: true,
      includeRelations: true,
      generateTests: false,
      authGuards: false,
      useTypeORM: true,
      useDTO: true,
      ...options
    };
  }

  /**
   * Helper method to create a file with content
   */
  private async createFile(filePath: string, content: string): Promise<void> {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf8');
  }

  /**
   * Generate CRUD operations for all tables
   */
  public async generateCrudForTables(tables: TableInfo[]): Promise<CrudGenerationResult> {
    const result: CrudGenerationResult = {
      tablesProcessed: 0,
      filesGenerated: 0,
      outputPaths: [],
      modules: []
    };

    console.log(`🚀 Generating CRUD operations for ${tables.length} tables...`);

    for (const table of tables) {
      try {
        console.log(`📄 Processing table: ${table.tableName}`);
        
        const moduleInfo = await this.generateCrudForTable(table);
        
        result.tablesProcessed++;
        result.filesGenerated += Object.keys(moduleInfo.files).length;
        result.outputPaths.push(...Object.values(moduleInfo.files).flat());
        result.modules.push(moduleInfo);
        
        console.log(`  ✅ Generated ${Object.keys(moduleInfo.files).length} files`);
        
      } catch (error) {
        console.error(`  ❌ Failed to process ${table.tableName}:`, error);
      }
    }

    // Generate main app module with all CRUD modules
    const appModulePath = await this.generateAppModule(result.modules);
    result.outputPaths.push(appModulePath);
    result.filesGenerated++;

    console.log(`\n✅ CRUD generation completed!`);
    console.log(`📊 ${result.tablesProcessed} tables processed`);
    console.log(`📁 ${result.filesGenerated} files generated`);

    return result;
  }

  /**
   * Generate CRUD operations for a single table
   */
  private async generateCrudForTable(table: TableInfo): Promise<ModuleInfo> {
    const entityName = NamingUtils.toPascalCase(table.tableName);
    const moduleName = NamingUtils.toCamelCase(table.tableName);
    const moduleDir = path.join(this.options.outputPath, moduleName);

    // Ensure module directory exists
    if (!fs.existsSync(moduleDir)) {
      fs.mkdirSync(moduleDir, { recursive: true });
    }

    const moduleInfo: ModuleInfo = {
      tableName: table.tableName,
      entityName,
      moduleName,
      files: {
        entity: '',
        dto: [],
        controller: '',
        service: '',
        repository: '',
        module: '',
        tests: []
      }
    };

    // Generate entity file
    moduleInfo.files.entity = await this.generateEntity(table, moduleDir);

    // Generate DTOs
    moduleInfo.files.dto = await this.generateDTOs(table, moduleDir);

    // Generate repository
    moduleInfo.files.repository = await this.generateRepository(table, moduleDir);

    // Generate service
    moduleInfo.files.service = await this.generateService(table, moduleDir);

    // Generate controller
    moduleInfo.files.controller = await this.generateController(table, moduleDir);

    // Generate module
    moduleInfo.files.module = await this.generateModule(table, moduleDir);

    // Generate tests if requested
    if (this.options.generateTests) {
      moduleInfo.files.tests = await this.generateTests(table, moduleDir);
    }

    return moduleInfo;
  }

  /**
   * Generate entity file
   */
  private async generateEntity(table: TableInfo, moduleDir: string): Promise<string> {
    const entityName = NamingUtils.toPascalCase(table.tableName);
    const fileName = `${NamingUtils.toKebabCase(table.tableName)}.entity.ts`;
    const filePath = path.join(moduleDir, 'entities', fileName);

    // Generate entity content
    const content = this.buildEntityContent(table);

    // Write file
    await this.createFile(filePath, content);
    return filePath;
  }

  /**
   * Build entity content
   */
  private buildEntityContent(table: TableInfo): string {
    const entityName = NamingUtils.toPascalCase(table.tableName);
    const lines: string[] = [];

    // Imports
    lines.push("import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';");
    
    if (this.options.includeSwagger) {
      lines.push("import { ApiProperty } from '@nestjs/swagger';");
    }
    
    if (this.options.includeValidation) {
      lines.push("import { IsString, IsNumber, IsBoolean, IsOptional, IsDate } from 'class-validator';");
    }
    
    lines.push('');

    // Entity decorator and class
    lines.push(`@Entity('${table.tableName}')`);
    lines.push(`export class ${entityName} {`);

    // Generate columns
    table.columns.forEach(column => {
      lines.push('');
      lines.push(...this.buildColumnDecorators(column));
      lines.push(`  ${this.buildColumnProperty(column)}`);
    });

    lines.push('}');
    
    return lines.join('\n');
  }

  /**
   * Build column decorators
   */
  private buildColumnDecorators(column: ColumnInfo): string[] {
    const decorators: string[] = [];
    
    // TypeORM decorators
    if (column.columnName === 'id' && column.isAutoIncrement) {
      decorators.push('  @PrimaryGeneratedColumn()');
    } else if (column.columnName.includes('created_at') || column.columnName.includes('createdAt')) {
      decorators.push('  @CreateDateColumn()');
    } else if (column.columnName.includes('updated_at') || column.columnName.includes('updatedAt')) {
      decorators.push('  @UpdateDateColumn()');
    } else {
      const columnOptions: string[] = [];
      
      if (column.columnName !== NamingUtils.toCamelCase(column.columnName)) {
        columnOptions.push(`name: '${column.columnName}'`);
      }
      
      if (column.characterMaximumLength) {
        columnOptions.push(`length: ${column.characterMaximumLength}`);
      }
      
      if (column.defaultValue) {
        // Handle SQL constants and functions
        if (typeof column.defaultValue === 'string' && 
            (column.defaultValue.includes('CURRENT_') || 
             column.defaultValue.includes('NOW()') ||
             column.defaultValue.includes('UUID()'))) {
          columnOptions.push(`default: () => "${column.defaultValue}"`);
        } else {
          columnOptions.push(`default: ${column.defaultValue}`);
        }
      }
      
      if (column.isNullable) {
        columnOptions.push('nullable: true');
      }
      
      const optionsStr = columnOptions.length > 0 ? `{ ${columnOptions.join(', ')} }` : '';
      decorators.push(`  @Column(${optionsStr})`);
    }

    // Swagger decorators
    if (this.options.includeSwagger) {
      const swaggerOptions: string[] = [];
      
      if (column.columnComment) {
        swaggerOptions.push(`description: '${column.columnComment}'`);
      }
      
      if (column.isNullable) {
        swaggerOptions.push('required: false');
      }
      
      const swaggerStr = swaggerOptions.length > 0 ? `{ ${swaggerOptions.join(', ')} }` : '';
      decorators.push(`  @ApiProperty(${swaggerStr})`);
    }

    // Validation decorators
    if (this.options.includeValidation) {
      const tsType = this.getTypeScriptType(column.dataType);
      
      if (column.isNullable) {
        decorators.push('  @IsOptional()');
      }
      
      switch (tsType) {
        case 'string':
          decorators.push('  @IsString()');
          break;
        case 'number':
          decorators.push('  @IsNumber()');
          break;
        case 'boolean':
          decorators.push('  @IsBoolean()');
          break;
        case 'Date':
          decorators.push('  @IsDate()');
          break;
      }
    }

    return decorators;
  }

  /**
   * Build column property
   */
  private buildColumnProperty(column: ColumnInfo): string {
    const propertyName = NamingUtils.toCamelCase(column.columnName);
    const tsType = this.getTypeScriptType(column.dataType);
    const nullable = column.isNullable ? '?' : '';
    
    return `${propertyName}${nullable}: ${tsType}${column.isNullable ? ' | null' : ''};`;
  }

  /**
   * Generate DTOs
   */
  private async generateDTOs(table: TableInfo, moduleDir: string): Promise<string[]> {
    const dtoDir = path.join(moduleDir, 'dto');
    const entityName = NamingUtils.toPascalCase(table.tableName);
    const filePaths: string[] = [];

    // Create DTO
    const createDtoPath = path.join(dtoDir, `create-${NamingUtils.toKebabCase(table.tableName)}.dto.ts`);
    const createDtoContent = this.buildCreateDtoContent(table);
    await this.createFile(createDtoPath, createDtoContent);
    filePaths.push(createDtoPath);

    // Update DTO
    const updateDtoPath = path.join(dtoDir, `update-${NamingUtils.toKebabCase(table.tableName)}.dto.ts`);
    const updateDtoContent = this.buildUpdateDtoContent(table);
    await this.createFile(updateDtoPath, updateDtoContent);
    filePaths.push(updateDtoPath);

    // Query DTO (for filtering)
    if (this.options.includeFiltering) {
      const queryDtoPath = path.join(dtoDir, `query-${NamingUtils.toKebabCase(table.tableName)}.dto.ts`);
      const queryDtoContent = this.buildQueryDtoContent(table);
      await this.createFile(queryDtoPath, queryDtoContent);
      filePaths.push(queryDtoPath);
    }

    return filePaths;
  }

  /**
   * Build Create DTO content
   */
  private buildCreateDtoContent(table: TableInfo): string {
    const entityName = NamingUtils.toPascalCase(table.tableName);
    const lines: string[] = [];

    // Imports
    if (this.options.includeSwagger) {
      lines.push("import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';");
    }
    
    if (this.options.includeValidation) {
      lines.push("import { IsString, IsNumber, IsBoolean, IsOptional, IsDate } from 'class-validator';");
    }
    
    lines.push('');

    // Class
    lines.push(`export class Create${entityName}Dto {`);

    // Generate properties (exclude id, created_at, updated_at)
    const createColumns = table.columns.filter(col => 
      !col.isAutoIncrement && 
      !col.columnName.includes('created_at') && 
      !col.columnName.includes('updated_at')
    );

    createColumns.forEach(column => {
      lines.push('');
      lines.push(...this.buildDtoPropertyDecorators(column));
      lines.push(`  ${this.buildDtoProperty(column)}`);
    });

    lines.push('}');
    
    return lines.join('\n');
  }

  /**
   * Build Update DTO content
   */
  private buildUpdateDtoContent(table: TableInfo): string {
    const entityName = NamingUtils.toPascalCase(table.tableName);
    const lines: string[] = [];

    // Imports
    lines.push(`import { PartialType } from '@nestjs/mapped-types';`);
    lines.push(`import { Create${entityName}Dto } from './create-${NamingUtils.toKebabCase(table.tableName)}.dto';`);
    lines.push('');

    // Class
    lines.push(`export class Update${entityName}Dto extends PartialType(Create${entityName}Dto) {}`);
    
    return lines.join('\n');
  }

  /**
   * Build Query DTO content
   */
  private buildQueryDtoContent(table: TableInfo): string {
    const entityName = NamingUtils.toPascalCase(table.tableName);
    const lines: string[] = [];

    // Imports
    if (this.options.includeSwagger) {
      lines.push("import { ApiPropertyOptional } from '@nestjs/swagger';");
    }
    
    if (this.options.includeValidation) {
      lines.push("import { IsOptional, IsNumber, IsString } from 'class-validator';");
      lines.push("import { Transform } from 'class-transformer';");
    }
    
    lines.push('');

    // Class
    lines.push(`export class Query${entityName}Dto {`);

    // Pagination properties
    if (this.options.includePagination) {
      lines.push('');
      if (this.options.includeSwagger) {
        lines.push("  @ApiPropertyOptional({ description: 'Page number for pagination' })");
      }
      if (this.options.includeValidation) {
        lines.push('  @IsOptional()');
        lines.push('  @IsNumber()');
        lines.push('  @Transform(({ value }) => parseInt(value))');
      }
      lines.push('  page?: number;');

      lines.push('');
      if (this.options.includeSwagger) {
        lines.push("  @ApiPropertyOptional({ description: 'Number of items per page' })");
      }
      if (this.options.includeValidation) {
        lines.push('  @IsOptional()');
        lines.push('  @IsNumber()');
        lines.push('  @Transform(({ value }) => parseInt(value))');
      }
      lines.push('  limit?: number;');
    }

    // Filtering properties for searchable columns
    if (this.options.includeFiltering) {
      const searchableColumns = table.columns.filter(col => 
        col.dataType.includes('varchar') || 
        col.dataType.includes('text') || 
        col.dataType.includes('char')
      );

      searchableColumns.forEach(column => {
        const propertyName = NamingUtils.toCamelCase(column.columnName);
        lines.push('');
        if (this.options.includeSwagger) {
          lines.push(`  @ApiPropertyOptional({ description: 'Filter by ${column.columnName}' })`);
        }
        if (this.options.includeValidation) {
          lines.push('  @IsOptional()');
          lines.push('  @IsString()');
        }
        lines.push(`  ${propertyName}?: string;`);
      });
    }

    // Sorting properties
    if (this.options.includeSorting) {
      lines.push('');
      if (this.options.includeSwagger) {
        lines.push("  @ApiPropertyOptional({ description: 'Field to sort by' })");
      }
      if (this.options.includeValidation) {
        lines.push('  @IsOptional()');
        lines.push('  @IsString()');
      }
      lines.push('  sortBy?: string;');

      lines.push('');
      if (this.options.includeSwagger) {
        lines.push("  @ApiPropertyOptional({ description: 'Sort direction', enum: ['ASC', 'DESC'] })");
      }
      if (this.options.includeValidation) {
        lines.push('  @IsOptional()');
        lines.push('  @IsString()');
      }
      lines.push("  sortOrder?: 'ASC' | 'DESC';");
    }

    lines.push('}');
    
    return lines.join('\n');
  }

  /**
   * Build DTO property decorators
   */
  private buildDtoPropertyDecorators(column: ColumnInfo): string[] {
    const decorators: string[] = [];
    const propertyName = NamingUtils.toCamelCase(column.columnName);

    // Swagger decorators
    if (this.options.includeSwagger) {
      const swaggerOptions: string[] = [];
      
      if (column.columnComment) {
        swaggerOptions.push(`description: '${column.columnComment}'`);
      }
      
      const swaggerStr = swaggerOptions.length > 0 ? `{ ${swaggerOptions.join(', ')} }` : '';
      
      if (column.isNullable) {
        decorators.push(`  @ApiPropertyOptional(${swaggerStr})`);
      } else {
        decorators.push(`  @ApiProperty(${swaggerStr})`);
      }
    }

    // Validation decorators
    if (this.options.includeValidation) {
      const tsType = this.getTypeScriptType(column.dataType);
      
      if (column.isNullable) {
        decorators.push('  @IsOptional()');
      }
      
      switch (tsType) {
        case 'string':
          decorators.push('  @IsString()');
          break;
        case 'number':
          decorators.push('  @IsNumber()');
          break;
        case 'boolean':
          decorators.push('  @IsBoolean()');
          break;
        case 'Date':
          decorators.push('  @IsDate()');
          break;
      }
    }

    return decorators;
  }

  /**
   * Build DTO property
   */
  private buildDtoProperty(column: ColumnInfo): string {
    const propertyName = NamingUtils.toCamelCase(column.columnName);
    const tsType = this.getTypeScriptType(column.dataType);
    const nullable = column.isNullable ? '?' : '';
    
    return `${propertyName}${nullable}: ${tsType}${column.isNullable ? ' | null' : ''};`;
  }

  /**
   * Generate repository
   */
  private async generateRepository(table: TableInfo, moduleDir: string): Promise<string> {
    const entityName = NamingUtils.toPascalCase(table.tableName);
    const fileName = `${NamingUtils.toKebabCase(table.tableName)}.repository.ts`;
    const filePath = path.join(moduleDir, fileName);

    const content = this.buildRepositoryContent(table);
    await this.createFile(filePath, content);
    return filePath;
  }

  /**
   * Build repository content
   */
  private buildRepositoryContent(table: TableInfo): string {
    const entityName = NamingUtils.toPascalCase(table.tableName);
    const lines: string[] = [];

    // Imports
    lines.push("import { Injectable } from '@nestjs/common';");
    lines.push("import { InjectRepository } from '@nestjs/typeorm';");
    lines.push("import { Repository, FindManyOptions } from 'typeorm';");
    lines.push(`import { ${entityName} } from './entities/${NamingUtils.toKebabCase(table.tableName)}.entity';`);
    lines.push(`import { Create${entityName}Dto } from './dto/create-${NamingUtils.toKebabCase(table.tableName)}.dto';`);
    lines.push(`import { Update${entityName}Dto } from './dto/update-${NamingUtils.toKebabCase(table.tableName)}.dto';`);
    
    if (this.options.includeFiltering) {
      lines.push(`import { Query${entityName}Dto } from './dto/query-${NamingUtils.toKebabCase(table.tableName)}.dto';`);
    }
    
    lines.push('');

    // Repository class
    lines.push('@Injectable()');
    lines.push(`export class ${entityName}Repository {`);
    lines.push(`  constructor(`);
    lines.push(`    @InjectRepository(${entityName})`);
    lines.push(`    private readonly repository: Repository<${entityName}>,`);
    lines.push(`  ) {}`);
    
    // Create method
    lines.push('');
    lines.push(`  async create(create${entityName}Dto: Create${entityName}Dto): Promise<${entityName}> {`);
    lines.push(`    const entity = this.repository.create(create${entityName}Dto);`);
    lines.push(`    return await this.repository.save(entity);`);
    lines.push(`  }`);

    // Find all method
    lines.push('');
    if (this.options.includeFiltering) {
      lines.push(`  async findAll(queryDto?: Query${entityName}Dto): Promise<{ data: ${entityName}[], total: number }> {`);
      lines.push(`    const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'DESC', ...filters } = queryDto || {};`);
      lines.push(`    `);
      lines.push(`    const options: FindManyOptions<${entityName}> = {`);
      lines.push(`      where: this.buildWhereClause(filters),`);
      lines.push(`      order: { [sortBy]: sortOrder },`);
      if (this.options.includePagination) {
        lines.push(`      skip: (page - 1) * limit,`);
        lines.push(`      take: limit,`);
      }
      lines.push(`    };`);
      lines.push(`    `);
      lines.push(`    const [data, total] = await this.repository.findAndCount(options);`);
      lines.push(`    return { data, total };`);
    } else {
      lines.push(`  async findAll(): Promise<${entityName}[]> {`);
      lines.push(`    return await this.repository.find();`);
    }
    lines.push(`  }`);

    // Find one method
    lines.push('');
    lines.push(`  async findOne(id: number): Promise<${entityName}> {`);
    lines.push(`    const entity = await this.repository.findOne({ where: { id } as any });`);
    lines.push(`    if (!entity) {`);
    lines.push(`      throw new Error(\`${entityName} with ID \${id} not found\`);`);
    lines.push(`    }`);
    lines.push(`    return entity;`);
    lines.push(`  }`);

    // Update method
    lines.push('');
    lines.push(`  async update(id: number, update${entityName}Dto: Update${entityName}Dto): Promise<${entityName}> {`);
    lines.push(`    const entity = await this.findOne(id);`);
    lines.push(`    Object.assign(entity, update${entityName}Dto);`);
    lines.push(`    return await this.repository.save(entity);`);
    lines.push(`  }`);

    // Remove method
    lines.push('');
    lines.push(`  async remove(id: number): Promise<void> {`);
    lines.push(`    const entity = await this.findOne(id);`);
    lines.push(`    await this.repository.remove(entity);`);
    lines.push(`  }`);

    // Build where clause helper
    if (this.options.includeFiltering) {
      lines.push('');
      lines.push(`  private buildWhereClause(filters: any): any {`);
      lines.push(`    const where: any = {};`);
      lines.push(`    `);
      lines.push(`    // Add filter conditions`);
      const searchableColumns = table.columns.filter(col => 
        col.dataType.includes('varchar') || 
        col.dataType.includes('text') || 
        col.dataType.includes('char')
      );
      
      searchableColumns.forEach(column => {
        const propertyName = NamingUtils.toCamelCase(column.columnName);
        lines.push(`    if (filters.${propertyName}) {`);
        lines.push(`      where.${propertyName} = filters.${propertyName};`);
        lines.push(`    }`);
      });
      
      lines.push(`    `);
      lines.push(`    return where;`);
      lines.push(`  }`);
    }

    lines.push('}');
    
    return lines.join('\n');
  }

  /**
   * Generate service
   */
  private async generateService(table: TableInfo, moduleDir: string): Promise<string> {
    const entityName = NamingUtils.toPascalCase(table.tableName);
    const fileName = `${NamingUtils.toKebabCase(table.tableName)}.service.ts`;
    const filePath = path.join(moduleDir, fileName);

    const content = this.buildServiceContent(table);
    await this.createFile(filePath, content);
    return filePath;
  }

  /**
   * Build service content
   */
  private buildServiceContent(table: TableInfo): string {
    const entityName = NamingUtils.toPascalCase(table.tableName);
    const lines: string[] = [];

    // Imports
    lines.push("import { Injectable } from '@nestjs/common';");
    lines.push(`import { ${entityName}Repository } from './${NamingUtils.toKebabCase(table.tableName)}.repository';`);
    lines.push(`import { Create${entityName}Dto } from './dto/create-${NamingUtils.toKebabCase(table.tableName)}.dto';`);
    lines.push(`import { Update${entityName}Dto } from './dto/update-${NamingUtils.toKebabCase(table.tableName)}.dto';`);
    
    if (this.options.includeFiltering) {
      lines.push(`import { Query${entityName}Dto } from './dto/query-${NamingUtils.toKebabCase(table.tableName)}.dto';`);
    }
    
    lines.push('');

    // Service class
    lines.push('@Injectable()');
    lines.push(`export class ${entityName}Service {`);
    lines.push(`  constructor(private readonly ${NamingUtils.toCamelCase(table.tableName)}Repository: ${entityName}Repository) {}`);
    
    // Create method
    lines.push('');
    lines.push(`  async create(create${entityName}Dto: Create${entityName}Dto) {`);
    lines.push(`    return await this.${NamingUtils.toCamelCase(table.tableName)}Repository.create(create${entityName}Dto);`);
    lines.push(`  }`);

    // Find all method
    lines.push('');
    lines.push(`  async findAll(${this.options.includeFiltering ? `queryDto?: Query${entityName}Dto` : ''}) {`);
    if (this.options.includeFiltering) {
      lines.push(`    return await this.${NamingUtils.toCamelCase(table.tableName)}Repository.findAll(queryDto);`);
    } else {
      lines.push(`    return await this.${NamingUtils.toCamelCase(table.tableName)}Repository.findAll();`);
    }
    lines.push(`  }`);

    // Find one method
    lines.push('');
    lines.push(`  async findOne(id: number) {`);
    lines.push(`    const entity = await this.${NamingUtils.toCamelCase(table.tableName)}Repository.findOne(id);`);
    lines.push(`    if (!entity) {`);
    lines.push(`      throw new Error(\`${entityName} with ID \${id} not found\`);`);
    lines.push(`    }`);
    lines.push(`    return entity;`);
    lines.push(`  }`);

    // Update method
    lines.push('');
    lines.push(`  async update(id: number, update${entityName}Dto: Update${entityName}Dto) {`);
    lines.push(`    const entity = await this.${NamingUtils.toCamelCase(table.tableName)}Repository.update(id, update${entityName}Dto);`);
    lines.push(`    if (!entity) {`);
    lines.push(`      throw new Error(\`${entityName} with ID \${id} not found\`);`);
    lines.push(`    }`);
    lines.push(`    return entity;`);
    lines.push(`  }`);

    // Remove method
    lines.push('');
    lines.push(`  async remove(id: number) {`);
    lines.push(`    await this.${NamingUtils.toCamelCase(table.tableName)}Repository.remove(id);`);
    lines.push(`    return { message: \`${entityName} deleted successfully\` };`);
    lines.push(`  }`);

    lines.push('}');
    
    return lines.join('\n');
  }

  /**
   * Generate controller
   */
  private async generateController(table: TableInfo, moduleDir: string): Promise<string> {
    const entityName = NamingUtils.toPascalCase(table.tableName);
    const fileName = `${NamingUtils.toKebabCase(table.tableName)}.controller.ts`;
    const filePath = path.join(moduleDir, fileName);

    const content = this.buildControllerContent(table);
    await this.createFile(filePath, content);
    return filePath;
  }

  /**
   * Build controller content
   */
  private buildControllerContent(table: TableInfo): string {
    const entityName = NamingUtils.toPascalCase(table.tableName);
    const controllerPath = NamingUtils.toKebabCase(table.tableName);
    const lines: string[] = [];

    // Imports
    lines.push("import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';");
    
    if (this.options.includeSwagger) {
      lines.push("import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';");
    }
    
    if (this.options.includeValidation) {
      lines.push("import { ParseIntPipe } from '@nestjs/common';");
    }
    
    if (this.options.authGuards) {
      lines.push("import { UseGuards } from '@nestjs/common';");
      lines.push("import { JwtAuthGuard } from '../auth/jwt-auth.guard';");
    }
    
    lines.push(`import { ${entityName}Service } from './${NamingUtils.toKebabCase(table.tableName)}.service';`);
    lines.push(`import { Create${entityName}Dto } from './dto/create-${NamingUtils.toKebabCase(table.tableName)}.dto';`);
    lines.push(`import { Update${entityName}Dto } from './dto/update-${NamingUtils.toKebabCase(table.tableName)}.dto';`);
    
    if (this.options.includeFiltering) {
      lines.push(`import { Query${entityName}Dto } from './dto/query-${NamingUtils.toKebabCase(table.tableName)}.dto';`);
    }
    
    lines.push('');

    // Controller decorators
    if (this.options.includeSwagger) {
      lines.push(`@ApiTags('${controllerPath}')`);
    }
    
    if (this.options.authGuards) {
      lines.push('@UseGuards(JwtAuthGuard)');
    }
    
    lines.push(`@Controller('${controllerPath}')`);
    lines.push(`export class ${entityName}Controller {`);
    lines.push(`  constructor(private readonly ${NamingUtils.toCamelCase(table.tableName)}Service: ${entityName}Service) {}`);

    // CREATE endpoint
    lines.push('');
    lines.push(...this.buildCreateEndpoint(table));

    // FIND ALL endpoint  
    lines.push('');
    lines.push(...this.buildFindAllEndpoint(table));

    // FIND ONE endpoint
    lines.push('');
    lines.push(...this.buildFindOneEndpoint(table));

    // UPDATE endpoint
    lines.push('');
    lines.push(...this.buildUpdateEndpoint(table));

    // DELETE endpoint
    lines.push('');
    lines.push(...this.buildDeleteEndpoint(table));

    lines.push('}');
    
    return lines.join('\n');
  }

  /**
   * Build CREATE endpoint
   */
  private buildCreateEndpoint(table: TableInfo): string[] {
    const entityName = NamingUtils.toPascalCase(table.tableName);
    const lines: string[] = [];

    if (this.options.includeSwagger) {
      lines.push(`  @ApiOperation({ summary: 'Create a new ${entityName.toLowerCase()}' })`);
      lines.push(`  @ApiResponse({ status: 201, description: 'The ${entityName.toLowerCase()} has been successfully created.' })`);
      lines.push(`  @ApiResponse({ status: 400, description: 'Bad Request.' })`);
    }
    
    lines.push(`  @Post()`);
    lines.push(`  create(@Body() create${entityName}Dto: Create${entityName}Dto) {`);
    lines.push(`    return this.${NamingUtils.toCamelCase(table.tableName)}Service.create(create${entityName}Dto);`);
    lines.push(`  }`);

    return lines;
  }

  /**
   * Build FIND ALL endpoint
   */
  private buildFindAllEndpoint(table: TableInfo): string[] {
    const entityName = NamingUtils.toPascalCase(table.tableName);
    const lines: string[] = [];

    if (this.options.includeSwagger) {
      lines.push(`  @ApiOperation({ summary: 'Get all ${entityName.toLowerCase()}s' })`);
      lines.push(`  @ApiResponse({ status: 200, description: 'Return all ${entityName.toLowerCase()}s.' })`);
    }
    
    lines.push(`  @Get()`);
    if (this.options.includeFiltering) {
      lines.push(`  findAll(@Query() queryDto: Query${entityName}Dto) {`);
      lines.push(`    return this.${NamingUtils.toCamelCase(table.tableName)}Service.findAll(queryDto);`);
    } else {
      lines.push(`  findAll() {`);
      lines.push(`    return this.${NamingUtils.toCamelCase(table.tableName)}Service.findAll();`);
    }
    lines.push(`  }`);

    return lines;
  }

  /**
   * Build FIND ONE endpoint
   */
  private buildFindOneEndpoint(table: TableInfo): string[] {
    const entityName = NamingUtils.toPascalCase(table.tableName);
    const lines: string[] = [];

    if (this.options.includeSwagger) {
      lines.push(`  @ApiOperation({ summary: 'Get a ${entityName.toLowerCase()} by id' })`);
      lines.push(`  @ApiParam({ name: 'id', description: '${entityName} ID' })`);
      lines.push(`  @ApiResponse({ status: 200, description: 'Return the ${entityName.toLowerCase()}.' })`);
      lines.push(`  @ApiResponse({ status: 404, description: '${entityName} not found.' })`);
    }
    
    lines.push(`  @Get(':id')`);
    if (this.options.includeValidation) {
      lines.push(`  findOne(@Param('id', ParseIntPipe) id: number) {`);
    } else {
      lines.push(`  findOne(@Param('id') id: string) {`);
    }
    lines.push(`    return this.${NamingUtils.toCamelCase(table.tableName)}Service.findOne(${this.options.includeValidation ? 'id' : '+id'});`);
    lines.push(`  }`);

    return lines;
  }

  /**
   * Build UPDATE endpoint
   */
  private buildUpdateEndpoint(table: TableInfo): string[] {
    const entityName = NamingUtils.toPascalCase(table.tableName);
    const lines: string[] = [];

    if (this.options.includeSwagger) {
      lines.push(`  @ApiOperation({ summary: 'Update a ${entityName.toLowerCase()}' })`);
      lines.push(`  @ApiParam({ name: 'id', description: '${entityName} ID' })`);
      lines.push(`  @ApiResponse({ status: 200, description: 'The ${entityName.toLowerCase()} has been successfully updated.' })`);
      lines.push(`  @ApiResponse({ status: 404, description: '${entityName} not found.' })`);
    }
    
    lines.push(`  @Patch(':id')`);
    if (this.options.includeValidation) {
      lines.push(`  update(@Param('id', ParseIntPipe) id: number, @Body() update${entityName}Dto: Update${entityName}Dto) {`);
    } else {
      lines.push(`  update(@Param('id') id: string, @Body() update${entityName}Dto: Update${entityName}Dto) {`);
    }
    lines.push(`    return this.${NamingUtils.toCamelCase(table.tableName)}Service.update(${this.options.includeValidation ? 'id' : '+id'}, update${entityName}Dto);`);
    lines.push(`  }`);

    return lines;
  }

  /**
   * Build DELETE endpoint
   */
  private buildDeleteEndpoint(table: TableInfo): string[] {
    const entityName = NamingUtils.toPascalCase(table.tableName);
    const lines: string[] = [];

    if (this.options.includeSwagger) {
      lines.push(`  @ApiOperation({ summary: 'Delete a ${entityName.toLowerCase()}' })`);
      lines.push(`  @ApiParam({ name: 'id', description: '${entityName} ID' })`);
      lines.push(`  @ApiResponse({ status: 200, description: 'The ${entityName.toLowerCase()} has been successfully deleted.' })`);
      lines.push(`  @ApiResponse({ status: 404, description: '${entityName} not found.' })`);
    }
    
    lines.push(`  @Delete(':id')`);
    if (this.options.includeValidation) {
      lines.push(`  remove(@Param('id', ParseIntPipe) id: number) {`);
    } else {
      lines.push(`  remove(@Param('id') id: string) {`);
    }
    lines.push(`    return this.${NamingUtils.toCamelCase(table.tableName)}Service.remove(${this.options.includeValidation ? 'id' : '+id'});`);
    lines.push(`  }`);

    return lines;
  }

  /**
   * Generate module
   */
  private async generateModule(table: TableInfo, moduleDir: string): Promise<string> {
    const entityName = NamingUtils.toPascalCase(table.tableName);
    const fileName = `${NamingUtils.toKebabCase(table.tableName)}.module.ts`;
    const filePath = path.join(moduleDir, fileName);

    const content = this.buildModuleContent(table);
    await this.createFile(filePath, content);
    return filePath;
  }

  /**
   * Build module content
   */
  private buildModuleContent(table: TableInfo): string {
    const entityName = NamingUtils.toPascalCase(table.tableName);
    const kebabName = NamingUtils.toKebabCase(table.tableName);
    const lines: string[] = [];

    // Imports
    lines.push("import { Module } from '@nestjs/common';");
    lines.push("import { TypeOrmModule } from '@nestjs/typeorm';");
    lines.push(`import { ${entityName}Controller } from './${kebabName}.controller';`);
    lines.push(`import { ${entityName}Service } from './${kebabName}.service';`);
    lines.push(`import { ${entityName}Repository } from './${kebabName}.repository';`);
    lines.push(`import { ${entityName} } from './entities/${kebabName}.entity';`);
    lines.push('');

    // Module decorator
    lines.push('@Module({');
    lines.push('  imports: [');
    lines.push(`    TypeOrmModule.forFeature([${entityName}]),`);
    lines.push('  ],');
    lines.push(`  controllers: [${entityName}Controller],`);
    lines.push(`  providers: [${entityName}Service, ${entityName}Repository],`);
    lines.push(`  exports: [${entityName}Service, ${entityName}Repository],`);
    lines.push('})');
    lines.push(`export class ${entityName}Module {}`);
    
    return lines.join('\n');
  }

  /**
   * Generate tests
   */
  private async generateTests(table: TableInfo, moduleDir: string): Promise<string[]> {
    const filePaths: string[] = [];
    // Test generation implementation would go here
    // For now, return empty array
    return filePaths;
  }

  /**
   * Generate app module with all CRUD modules
   */
  private async generateAppModule(modules: ModuleInfo[]): Promise<string> {
    const filePath = path.join(this.options.outputPath, 'app.module.ts');
    const lines: string[] = [];

    // Imports
    lines.push("import { Module } from '@nestjs/common';");
    lines.push("import { TypeOrmModule } from '@nestjs/typeorm';");
    
    modules.forEach(module => {
      lines.push(`import { ${module.entityName}Module } from './${module.moduleName}/${NamingUtils.toKebabCase(module.tableName)}.module';`);
    });
    
    lines.push('');

    // App Module
    lines.push('@Module({');
    lines.push('  imports: [');
    lines.push('    TypeOrmModule.forRoot({');
    lines.push('      // Database configuration goes here');
    lines.push('      // type: \'postgres\',');
    lines.push('      // host: \'localhost\',');
    lines.push('      // port: 5432,');
    lines.push('      // username: \'your-username\',');
    lines.push('      // password: \'your-password\',');
    lines.push('      // database: \'your-database\',');
    lines.push('      // entities: [__dirname + \'/**/*.entity{.ts,.js}\'],');
    lines.push('      // synchronize: true,');
    lines.push('    }),');
    
    modules.forEach(module => {
      lines.push(`    ${module.entityName}Module,`);
    });
    
    lines.push('  ],');
    lines.push('})');
    lines.push('export class AppModule {}');
    
    await this.createFile(filePath, lines.join('\n'));
    return filePath;
  }

  /**
   * Get TypeScript type from database type
   */
  private getTypeScriptType(dataType: string): string {
    const mapping = TypeMapper.mapType(dataType, this.options.dialect);
    return mapping.tsType;
  }
}
