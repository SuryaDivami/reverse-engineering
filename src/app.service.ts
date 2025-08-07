/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ReverseEngineeringService } from './reverse-engineering';

@Injectable()
export class AppService {
  constructor(
    private readonly reverseEngineeringService: ReverseEngineeringService,
  ) {}
  
  async getHello(): Promise<string> {
    try {
      // Test the database connection
      const connectionTest = await this.reverseEngineeringService.testConnection();
      
      if (!connectionTest.connected) {
        return `Database connection failed: ${connectionTest.error}`;
      }

      // Get table information
      const tables = await this.reverseEngineeringService.getTableList();
      
      let response = `Hello! Connected to ${connectionTest.dialect} database`;
      if (connectionTest.version) {
        response += ` (${connectionTest.version})`;
      }
      response += `\n\nFound ${tables.length} tables:\n`;
      
      tables.forEach(table => {
        response += `- ${table.tableSchema}.${table.tableName} (${table.columnCount} columns)\n`;
      });

      response += '\nUse the /reverse-engineering endpoints to generate entities and explore the schema!';
      
      return response;
    } catch (error) {
      return `Error: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
}
