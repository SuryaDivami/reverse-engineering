#!/usr/bin/env node
/* eslint-disable prettier/prettier */

/**
 * Example usage script for the Database Reverse Engineering Tool
 * 
 * This script demonstrates various ways to use the reverse engineering system
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ReverseEngineeringService } from '../src/reverse-engineering';

async function runExamples() {
  console.log('🚀 Database Reverse Engineering Tool - Examples\n');

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false
  });

  const reverseEngineeringService = app.get(ReverseEngineeringService);

  try {
    // Example 1: Test connection
    console.log('📌 Example 1: Testing Database Connection');
    console.log('-------------------------------------------');
    const connectionTest = await reverseEngineeringService.testConnection();
    console.log(`✅ Connected: ${connectionTest.connected}`);
    console.log(`📊 Database: ${connectionTest.dialect}`);
    if (connectionTest.version) {
      console.log(`🔢 Version: ${connectionTest.version}`);
    }
    console.log('');

    // Example 2: List tables
    console.log('📌 Example 2: Listing Database Tables');
    console.log('-------------------------------------');
    const tables = await reverseEngineeringService.getTableList();
    console.log(`Found ${tables.length} tables:`);
    tables.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table.tableSchema}.${table.tableName} (${table.columnCount} columns)`);
    });
    console.log('');

    // Example 3: Analyze schema (first 2 tables only for brevity)
    console.log('📌 Example 3: Schema Analysis (Sample)');
    console.log('--------------------------------------');
    const schema = await reverseEngineeringService.analyzeSchema();
    const sampleTables = schema.tables.slice(0, 2);
    
    sampleTables.forEach(table => {
      console.log(`\n📄 Table: ${table.tableName}`);
      if (table.tableComment) {
        console.log(`   Comment: ${table.tableComment}`);
      }
      console.log(`   Primary Keys: ${table.primaryKeys.join(', ') || 'None'}`);
      console.log(`   Foreign Keys: ${table.foreignKeys.length}`);
      console.log(`   Columns:`);
      
      table.columns.slice(0, 5).forEach(col => {
        const nullable = col.isNullable ? '(nullable)' : '(not null)';
        const pk = table.primaryKeys.includes(col.columnName) ? ' [PK]' : '';
        const autoInc = col.isAutoIncrement ? ' [AUTO_INCREMENT]' : '';
        console.log(`     • ${col.columnName}: ${col.dataType} ${nullable}${pk}${autoInc}`);
        if (col.columnComment) {
          console.log(`       Comment: ${col.columnComment}`);
        }
      });
      
      if (table.columns.length > 5) {
        console.log(`     ... and ${table.columns.length - 5} more columns`);
      }
    });
    console.log('');

    // Example 4: Generate entities with different options
    console.log('📌 Example 4: Generating Entities with Custom Options');
    console.log('-----------------------------------------------------');
    
    await reverseEngineeringService.generateEntities({
      outputPath: './examples/generated-entities',
      includeComments: true,
      includeRelations: true,
      namingConvention: 'camelCase',
      generateInterfaces: false,
      generateRepositories: false
    });
    
    console.log('✅ Entities generated successfully!');
    console.log('   Check ./examples/generated-entities/ for the generated files');
    console.log('');

    console.log('🎉 All examples completed successfully!');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Check the generated entities in ./examples/generated-entities/');
    console.log('   2. Use them in your TypeORM projects');
    console.log('   3. Run the CLI tool: npm run reverse-engineer --help');
    console.log('   4. Start the REST API: npm run start:dev');
    console.log('   5. Visit http://localhost:3001/reverse-engineering/test-connection');

  } catch (error) {
    console.error('❌ Error running examples:', error instanceof Error ? error.message : String(error));
  }

  await app.close();
}

if (require.main === module) {
  runExamples();
}

export { runExamples };
