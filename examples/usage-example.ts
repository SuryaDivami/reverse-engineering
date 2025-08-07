/**
 * Example: Using the NestJS Reverse Engineering Library
 */

import { ReverseEngineeringService, createConfig } from '../src/index';

async function main() {
  // Example 1: Basic usage with programmatic API
  const service = new ReverseEngineeringService();
  
  const config = createConfig({
    database: {
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'test_db'
    },
    paths: {
      baseOutput: './src',
      entities: './src/entities',
      crud: './src'
    },
    crud: {
      framework: 'nestjs',
      excludedTables: ['migrations', 'schema_migrations'],
      includedTables: ['users', 'products', 'orders'] // Only process these tables
    }
  });

  service.initialize(config);

  try {
    // Test connection first
    const connected = await service.testConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }

    console.log('🔌 Database connected successfully!');

    // Generate entities
    await service.generateEntities();
    console.log('✅ Entities generated');

    // Generate CRUD operations
    await service.generateCrud();
    console.log('✅ CRUD operations generated');

    console.log('🎉 All done! Check your ./src directory for generated files.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Example 2: Configuration for different use cases

// Development environment config
export const developmentConfig = {
  database: {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'dev_user',
    password: 'dev_password',
    database: 'app_development'
  },
  crud: {
    framework: 'nestjs',
    includeSwagger: true,
    includeValidation: true,
    generateTests: true,
    authGuards: false
  }
};

// Production/Migration config
export const migrationConfig = {
  database: {
    type: 'postgres',
    host: 'prod-db.company.com',
    port: 5432,
    username: 'readonly_user',
    password: process.env.DB_PASSWORD,
    database: 'production_app'
  },
  features: {
    entities: true,
    crud: false,
    sql: true,
    dataExport: true,
    generateIndex: true
  },
  dataExport: {
    enableMasking: true,
    maskedFields: ['password', 'email', 'phone', 'ssn', 'api_key'],
    maxRows: 1000
  }
};

// Microservice config
export const microserviceConfig = {
  crud: {
    framework: 'nestjs',
    includedTables: [
      'users',
      'user_profiles',
      'user_sessions',
      'user_preferences'
    ],
    includeSwagger: true,
    includeValidation: true,
    includePagination: true,
    authGuards: true
  }
};

if (require.main === module) {
  main();
}
