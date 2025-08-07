/* eslint-disable prettier/prettier */
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { DatabaseDialect } from '../types/database.types';

export interface DataExportOptions {
  dialect: DatabaseDialect;
  batchSize: number;
  outputPath: string;
  prettyPrint: boolean;
  alignValues: boolean;
  nullHandling: 'NULL' | 'DEFAULT' | 'SKIP';
  includeHeaders: boolean;
  includeTableComments: boolean;
  dataMasking: DataMaskingOptions;
  tables?: string[];
  excludeTables?: string[];
  whereConditions?: Record<string, string>;
  orderBy?: Record<string, string>;
}

export interface DataMaskingOptions {
  enabled: boolean;
  sensitiveFields: string[];
  maskingPatterns: Record<string, MaskingRule>;
}

export interface MaskingRule {
  type: 'email' | 'phone' | 'name' | 'address' | 'custom';
  pattern?: string;
  replacement?: string;
  preserveLength?: boolean;
  preserveFormat?: boolean;
}

export interface InsertScriptResult {
  sql: string;
  tableCount: number;
  totalRows: number;
  fileCount: number;
  outputPaths: string[];
  statistics: Record<string, { rows: number; batches: number }>;
}

export interface TableData {
  tableName: string;
  columns: string[];
  rows: any[][];
  totalRows: number;
}

export class DataExporter {
  private readonly dataSource: DataSource;
  private readonly options: DataExportOptions;

  constructor(dataSource: DataSource, options: Partial<DataExportOptions> = {}) {
    this.dataSource = dataSource;
    this.options = {
      dialect: DatabaseDialect.POSTGRES,
      batchSize: 1000,
      outputPath: './generated/sql/data',
      prettyPrint: true,
      alignValues: true,
      nullHandling: 'NULL',
      includeHeaders: true,
      includeTableComments: true,
      dataMasking: {
        enabled: false,
        sensitiveFields: ['password', 'email', 'phone', 'mobile', 'ssn', 'credit_card'],
        maskingPatterns: {
          email: { type: 'email', replacement: 'user{n}@example.com' },
          password: { type: 'custom', replacement: 'MASKED_PASSWORD' },
          phone: { type: 'phone', pattern: 'XXX-XXX-XXXX' },
          name: { type: 'name', replacement: 'User {n}' }
        }
      },
      ...options
    };
  }

  /**
   * Export all table data as INSERT scripts
   */
  public async exportAllTables(): Promise<InsertScriptResult> {
    console.log('🔍 Discovering tables...');
    
    const tables = await this.discoverTables();
    const filteredTables = this.filterTables(tables);
    
    console.log(`📊 Found ${tables.length} tables, exporting ${filteredTables.length} tables`);
    
    return await this.exportTables(filteredTables);
  }

  /**
   * Export specific tables
   */
  public async exportTables(tableNames: string[]): Promise<InsertScriptResult> {
    const results: InsertScriptResult = {
      sql: '',
      tableCount: 0,
      totalRows: 0,
      fileCount: 0,
      outputPaths: [],
      statistics: {}
    };

    // Ensure output directory exists
    if (!fs.existsSync(this.options.outputPath)) {
      fs.mkdirSync(this.options.outputPath, { recursive: true });
    }

    for (const tableName of tableNames) {
      console.log(`📄 Exporting table: ${tableName}`);
      
      try {
        const tableData = await this.extractTableData(tableName);
        const insertScripts = await this.generateInsertScripts(tableData);
        
        // Write to file(s)
        const filePaths = await this.writeInsertScripts(tableName, insertScripts, tableData.totalRows);
        
        results.tableCount++;
        results.totalRows += tableData.totalRows;
        results.fileCount += filePaths.length;
        results.outputPaths.push(...filePaths);
        results.statistics[tableName] = {
          rows: tableData.totalRows,
          batches: insertScripts.length
        };

        console.log(`  ✅ ${tableData.totalRows} rows exported in ${insertScripts.length} batches`);
        
      } catch (error) {
        console.error(`  ❌ Failed to export ${tableName}:`, error);
      }
    }

    // Generate summary file
    const summaryPath = await this.generateSummaryFile(results);
    results.outputPaths.push(summaryPath);
    results.fileCount++;

    return results;
  }

  /**
   * Discover all tables in the database
   */
  private async discoverTables(): Promise<string[]> {
    let query: string;
    
    switch (this.options.dialect) {
      case DatabaseDialect.POSTGRES:
        query = `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
          ORDER BY table_name
        `;
        break;
      case DatabaseDialect.MYSQL:
        query = `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = DATABASE() 
            AND table_type = 'BASE TABLE'
          ORDER BY table_name
        `;
        break;
      default:
        throw new Error(`Unsupported dialect: ${this.options.dialect}`);
    }

    const result = await this.dataSource.query(query);
    return result.map((row: any) => row.table_name);
  }

  /**
   * Filter tables based on options
   */
  private filterTables(tables: string[]): string[] {
    let filtered = tables;

    if (this.options.tables && this.options.tables.length > 0) {
      filtered = filtered.filter(table => this.options.tables!.includes(table));
    }

    if (this.options.excludeTables && this.options.excludeTables.length > 0) {
      filtered = filtered.filter(table => !this.options.excludeTables!.includes(table));
    }

    return filtered;
  }

  /**
   * Extract data from a specific table
   */
  private async extractTableData(tableName: string): Promise<TableData> {
    // Get column information
    const columns = await this.getTableColumns(tableName);
    
    // Build query
    let query = `SELECT * FROM ${this.escapeIdentifier(tableName)}`;
    
    // Add WHERE condition if specified
    if (this.options.whereConditions && this.options.whereConditions[tableName]) {
      query += ` WHERE ${this.options.whereConditions[tableName]}`;
    }
    
    // Add ORDER BY if specified
    if (this.options.orderBy && this.options.orderBy[tableName]) {
      query += ` ORDER BY ${this.options.orderBy[tableName]}`;
    }

    // Execute query
    const rawRows = await this.dataSource.query(query);
    
    // Convert rows to array format and apply data masking
    const rows = rawRows.map((row: any) => 
      columns.map(column => this.applyDataMasking(column, row[column], tableName))
    );

    return {
      tableName,
      columns,
      rows,
      totalRows: rows.length
    };
  }

  /**
   * Get column names for a table
   */
  private async getTableColumns(tableName: string): Promise<string[]> {
    let query: string;
    
    switch (this.options.dialect) {
      case DatabaseDialect.POSTGRES:
        query = `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = $1 
            AND table_schema = 'public'
          ORDER BY ordinal_position
        `;
        break;
      case DatabaseDialect.MYSQL:
        query = `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = ? 
            AND table_schema = DATABASE()
          ORDER BY ordinal_position
        `;
        break;
      default:
        throw new Error(`Unsupported dialect: ${this.options.dialect}`);
    }

    const result = await this.dataSource.query(query, [tableName]);
    return result.map((row: any) => row.column_name);
  }

  /**
   * Generate INSERT scripts for table data
   */
  private async generateInsertScripts(tableData: TableData): Promise<string[]> {
    const scripts: string[] = [];
    const { tableName, columns, rows } = tableData;
    
    // Process data in batches
    for (let i = 0; i < rows.length; i += this.options.batchSize) {
      const batchRows = rows.slice(i, i + this.options.batchSize);
      const script = this.generateBatchInsert(tableName, columns, batchRows, i);
      scripts.push(script);
    }

    return scripts;
  }

  /**
   * Generate a single batch INSERT script
   */
  private generateBatchInsert(
    tableName: string, 
    columns: string[], 
    rows: any[][], 
    batchIndex: number
  ): string {
    const lines: string[] = [];
    
    // Add header comment
    if (this.options.includeHeaders) {
      lines.push(`-- Table: ${tableName}`);
      lines.push(`-- Batch: ${Math.floor(batchIndex / this.options.batchSize) + 1}`);
      lines.push(`-- Rows: ${rows.length}`);
      lines.push('');
    }

    if (rows.length === 0) {
      lines.push(`-- No data for table ${tableName}`);
      return lines.join('\n');
    }

    // Build column list
    const columnList = columns.map(col => this.escapeIdentifier(col)).join(', ');
    
    // Start INSERT statement
    lines.push(`INSERT INTO ${this.escapeIdentifier(tableName)} (${columnList})`);
    lines.push('VALUES');

    // Add data rows
    const valueLines: string[] = [];
    
    if (this.options.prettyPrint && this.options.alignValues) {
      // Calculate column widths for alignment
      const columnWidths = this.calculateColumnWidths(columns, rows);
      
      rows.forEach((row, index) => {
        const formattedValues = row.map((value, colIndex) => 
          this.formatValue(value, columnWidths[colIndex])
        );
        
        const comma = index < rows.length - 1 ? ',' : '';
        valueLines.push(`  (${formattedValues.join(', ')})${comma}`);
      });
    } else {
      // Simple formatting
      rows.forEach((row, index) => {
        const formattedValues = row.map(value => this.formatValue(value));
        const comma = index < rows.length - 1 ? ',' : '';
        valueLines.push(`  (${formattedValues.join(', ')})${comma}`);
      });
    }

    lines.push(...valueLines);
    lines.push(';');
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Calculate column widths for alignment
   */
  private calculateColumnWidths(columns: string[], rows: any[][]): number[] {
    const widths = columns.map(col => col.length + 2); // Start with column name length
    
    rows.forEach(row => {
      row.forEach((value, index) => {
        const formattedValue = this.formatValue(value);
        widths[index] = Math.max(widths[index], formattedValue.length);
      });
    });

    return widths;
  }

  /**
   * Format a single value for SQL
   */
  private formatValue(value: any, width?: number): string {
    let formatted: string;

    if (value === null || value === undefined) {
      switch (this.options.nullHandling) {
        case 'NULL':
          formatted = 'NULL';
          break;
        case 'DEFAULT':
          formatted = 'DEFAULT';
          break;
        case 'SKIP':
          formatted = '\'\''; // Empty string
          break;
        default:
          formatted = 'NULL';
      }
    } else if (typeof value === 'string') {
      // Escape single quotes and wrap in quotes
      formatted = `'${value.replace(/'/g, "''")}'`;
    } else if (typeof value === 'boolean') {
      if (this.options.dialect === DatabaseDialect.POSTGRES) {
        formatted = value ? 'true' : 'false';
      } else {
        formatted = value ? '1' : '0';
      }
    } else if (value instanceof Date) {
      formatted = `'${value.toISOString()}'`;
    } else if (typeof value === 'object') {
      // JSON objects
      formatted = `'${JSON.stringify(value).replace(/'/g, "''")}'`;
    } else {
      // Numbers and other types
      formatted = String(value);
    }

    // Apply width padding if specified
    if (width && this.options.alignValues) {
      formatted = formatted.padEnd(width);
    }

    return formatted;
  }

  /**
   * Apply data masking to sensitive fields
   */
  private applyDataMasking(columnName: string, value: any, tableName: string): any {
    if (!this.options.dataMasking.enabled || value === null || value === undefined) {
      return value;
    }

    const lowerColumnName = columnName.toLowerCase();
    const isSensitive = this.options.dataMasking.sensitiveFields.some(field => 
      lowerColumnName.includes(field.toLowerCase())
    );

    if (!isSensitive) {
      return value;
    }

    // Apply masking based on patterns
    for (const [pattern, rule] of Object.entries(this.options.dataMasking.maskingPatterns)) {
      if (lowerColumnName.includes(pattern.toLowerCase())) {
        return this.applyMaskingRule(value, rule, tableName);
      }
    }

    // Default masking
    return '***MASKED***';
  }

  /**
   * Apply a specific masking rule
   */
  private applyMaskingRule(value: any, rule: MaskingRule, tableName: string): any {
    const stringValue = String(value);

    switch (rule.type) {
      case 'email':
        return rule.replacement?.replace('{n}', Math.floor(Math.random() * 1000).toString()) || 'user@example.com';
      case 'phone':
        return rule.pattern?.replace(/X/g, () => Math.floor(Math.random() * 10).toString()) || 'XXX-XXX-XXXX';
      case 'name':
        return rule.replacement?.replace('{n}', Math.floor(Math.random() * 1000).toString()) || 'Anonymous User';
      case 'custom':
        return rule.replacement || '***MASKED***';
      default:
        if (rule.preserveLength) {
          return '*'.repeat(stringValue.length);
        }
        return '***MASKED***';
    }
  }

  /**
   * Write INSERT scripts to files
   */
  private async writeInsertScripts(
    tableName: string, 
    scripts: string[], 
    totalRows: number
  ): Promise<string[]> {
    const filePaths: string[] = [];

    if (scripts.length === 1) {
      // Single file
      const fileName = `insert_${tableName}_${Date.now()}.sql`;
      const filePath = path.join(this.options.outputPath, fileName);
      
      const content = this.buildFileHeader(tableName, totalRows, 1, 1) + scripts[0];
      fs.writeFileSync(filePath, content, 'utf8');
      filePaths.push(filePath);
    } else {
      // Multiple files for large tables
      scripts.forEach((script, index) => {
        const fileName = `insert_${tableName}_part${index + 1}_${Date.now()}.sql`;
        const filePath = path.join(this.options.outputPath, fileName);
        
        const content = this.buildFileHeader(tableName, totalRows, index + 1, scripts.length) + script;
        fs.writeFileSync(filePath, content, 'utf8');
        filePaths.push(filePath);
      });
    }

    return filePaths;
  }

  /**
   * Build file header
   */
  private buildFileHeader(
    tableName: string, 
    totalRows: number, 
    partNumber: number, 
    totalParts: number
  ): string {
    const lines: string[] = [];
    
    lines.push('-- Generated INSERT statements');
    lines.push(`-- Table: ${tableName}`);
    lines.push(`-- Total rows: ${totalRows}`);
    lines.push(`-- Part: ${partNumber} of ${totalParts}`);
    lines.push(`-- Generated at: ${new Date().toISOString()}`);
    lines.push(`-- Dialect: ${this.options.dialect.toUpperCase()}`);
    lines.push(`-- Batch size: ${this.options.batchSize}`);
    
    if (this.options.dataMasking.enabled) {
      lines.push('-- Data masking: ENABLED');
    }
    
    lines.push('');

    // Add dialect-specific settings
    if (this.options.dialect === DatabaseDialect.MYSQL) {
      lines.push('-- MySQL specific settings');
      lines.push('SET FOREIGN_KEY_CHECKS = 0;');
      lines.push('SET AUTOCOMMIT = 0;');
      lines.push('START TRANSACTION;');
      lines.push('');
    } else if (this.options.dialect === DatabaseDialect.POSTGRES) {
      lines.push('-- PostgreSQL specific settings');
      lines.push('SET session_replication_role = replica;');
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Generate summary file
   */
  private async generateSummaryFile(results: InsertScriptResult): Promise<string> {
    const summaryPath = path.join(this.options.outputPath, `export_summary_${Date.now()}.md`);
    
    const lines: string[] = [];
    lines.push('# Data Export Summary');
    lines.push('');
    lines.push(`**Export Date:** ${new Date().toISOString()}`);
    lines.push(`**Dialect:** ${this.options.dialect.toUpperCase()}`);
    lines.push(`**Total Tables:** ${results.tableCount}`);
    lines.push(`**Total Rows:** ${results.totalRows.toLocaleString()}`);
    lines.push(`**Total Files:** ${results.fileCount}`);
    lines.push(`**Batch Size:** ${this.options.batchSize}`);
    lines.push(`**Data Masking:** ${this.options.dataMasking.enabled ? 'ENABLED' : 'DISABLED'}`);
    lines.push('');
    
    lines.push('## Table Statistics');
    lines.push('');
    lines.push('| Table Name | Rows | Batches |');
    lines.push('|------------|------|---------|');
    
    Object.entries(results.statistics).forEach(([tableName, stats]) => {
      lines.push(`| ${tableName} | ${stats.rows.toLocaleString()} | ${stats.batches} |`);
    });
    
    lines.push('');
    lines.push('## Generated Files');
    lines.push('');
    results.outputPaths.forEach(filePath => {
      lines.push(`- \`${path.basename(filePath)}\``);
    });

    fs.writeFileSync(summaryPath, lines.join('\n'), 'utf8');
    return summaryPath;
  }

  /**
   * Escape SQL identifiers
   */
  private escapeIdentifier(identifier: string): string {
    if (this.options.dialect === DatabaseDialect.POSTGRES) {
      return `"${identifier}"`;
    } else if (this.options.dialect === DatabaseDialect.MYSQL) {
      return `\`${identifier}\``;
    }
    return identifier;
  }
}
