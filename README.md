# NestJS Reverse Engineering Library

A powerful, configurable TypeScript/NestJS library for database reverse engineering, entity generation, and CRUD operations. Transform your existing database into a fully-featured NestJS application with entities, controllers, services, and more.

## 🚀 Features

- **Database Reverse Engineering**: Generate TypeORM entities from existing database schemas
- **CRUD Generation**: Create controllers, services, DTOs, and repositories
- **Multiple Database Support**: PostgreSQL, MySQL, and more via TypeORM
- **Configurable Output**: Customize where files are generated
- **Table Filtering**: Include/exclude specific tables
- **NestJS Integration**: Direct module integration with your existing apps
- **CLI & Programmatic APIs**: Use via command line or in your code
- **Entity Reuse**: Uses existing entities when available
- **Module Auto-Import**: Automatically updates your app.module.ts
- **SQL Generation**: Export CREATE TABLE and INSERT statements
- **Data Export**: Export data with optional masking for sensitive fields

## 📦 Installation

```bash
npm install nestjs-reverse-engineering
# or
yarn add nestjs-reverse-engineering
```

## 🛠️ Quick Start

### 1. CLI Usage

Initialize a configuration file:
```bash
npx nestjs-reverse-engineering init
```

Generate everything:
```bash
npx nestjs-reverse-engineering all
```

Or use individual commands:
```bash
# Generate entities only
npx nestjs-reverse-engineering entities

# Generate CRUD operations
npx nestjs-reverse-engineering crud

# Test database connection
npx nestjs-reverse-engineering test
```

### 2. NestJS Module Integration

```typescript
import { Module } from '@nestjs/common';
import { ReverseEngineeringModule } from '@your-org/nestjs-reverse-engineering';

@Module({
  imports: [
    ReverseEngineeringModule.forRoot({
      database: {
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'your_username',
        password: 'your_password',
        database: 'your_database',
      },
      generation: {
        outputDir: './src',
        entitiesDir: './src/entities',
      },
    }),
  ],
})
export class AppModule {}
```

### 3. Programmatic Usage

```typescript
import { ReverseEngineeringService } from '@your-org/nestjs-reverse-engineering';

const service = new ReverseEngineeringService({
  database: {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'your_username',
    password: 'your_password',
    database: 'your_database',
  },
});

// Generate entities
await service.generateEntities();

// Generate CRUD operations
await service.generateCrud();

// Test connection
const isConnected = await service.testConnection();
```

## ⚙️ Configuration

### Configuration File (`re-config.json`)

```json
{
  "database": {
    "type": "postgres",
    "host": "localhost",
    "port": 5432,
    "username": "your_username",
    "password": "your_password",
    "database": "your_database",
    "schema": "public"
  },
  "generation": {
    "outputDir": "./src",
    "entitiesDir": "./src/entities",
    "sqlDir": "./sql",
    "dataDir": "./data"
  },
  "tables": {
    "includeTables": [],
    "excludeTables": ["migrations", "seeds"]
  },
  "features": {
    "generateEntities": true,
    "generateCrud": true,
    "generateSql": true,
    "exportData": true,
    "enableSwagger": true,
    "enableValidation": true,
    "enableAuth": false
  },
  "crud": {
    "framework": "nestjs",
    "generateTests": true,
    "generateAuth": false
  },
  "data": {
    "enableMasking": false,
    "batchSize": 1000
  }
}
```

### TypeScript Configuration Interface

```typescript
export interface ReverseEngineeringConfig {
  database: {
    type: 'postgres' | 'mysql' | 'sqlite' | 'mssql';
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    database?: string;
    schema?: string;
    ssl?: boolean;
    synchronize?: boolean;
  };
  generation?: {
    outputDir?: string;          // Default: './src'
    entitiesDir?: string;        // Default: './src/entities'
    sqlDir?: string;             // Default: './sql'
    dataDir?: string;            // Default: './data'
  };
  tables?: {
    includeTables?: string[];    // Include only these tables
    excludeTables?: string[];    // Exclude these tables
  };
  features?: {
    generateEntities?: boolean;   // Default: true
    generateCrud?: boolean;       // Default: true
    generateSql?: boolean;        // Default: true
    exportData?: boolean;         // Default: true
    enableSwagger?: boolean;      // Default: true
    enableValidation?: boolean;   // Default: true
    enableAuth?: boolean;         // Default: false
  };
  crud?: {
    framework?: 'nestjs';         // Default: 'nestjs'
    generateTests?: boolean;      // Default: true
    generateAuth?: boolean;       // Default: false
  };
  data?: {
    enableMasking?: boolean;      // Default: false
    batchSize?: number;           // Default: 1000
  };
}
```

## 🖥️ CLI Commands

### Global Options
```bash
-h, --host <host>              Database host
-p, --port <port>              Database port  
-u, --username <username>      Database username
-w, --password <password>      Database password
-d, --database <database>      Database name
-s, --schema <schema>          Database schema
--dialect <dialect>            Database dialect (postgres|mysql)
--ssl                          Use SSL connection
--config <path>                Configuration file path
--output-dir <dir>             Base output directory
--entities-dir <dir>           Entities directory
--sql-dir <dir>                SQL output directory
--data-dir <dir>               Data export directory
```

### Commands

#### Initialize Configuration
```bash
npx nestjs-reverse-engineering init [options]
```

#### Test Database Connection
```bash
npx nestjs-reverse-engineering test
```

#### List Tables
```bash
npx nestjs-reverse-engineering tables
```

#### Generate Entities
```bash
npx nestjs-reverse-engineering entities [options]

Options:
  --include-tables <tables>    Comma-separated list of tables to include
  --exclude-tables <tables>    Comma-separated list of tables to exclude
```

#### Generate CRUD Operations
```bash
npx nestjs-reverse-engineering crud [options]

Options:
  --include-tables <tables>    Comma-separated list of tables to include
  --exclude-tables <tables>    Comma-separated list of tables to exclude
  --no-tests                   Skip test generation
  --no-swagger                 Skip Swagger documentation
  --enable-auth                Enable authentication guards
```

#### Generate SQL Scripts
```bash
npx nestjs-reverse-engineering sql [options]

Options:
  --include-tables <tables>    Comma-separated list of tables to include
  --exclude-tables <tables>    Comma-separated list of tables to exclude
```

#### Export Data
```bash
npx nestjs-reverse-engineering data [options]

Options:
  --include-tables <tables>    Comma-separated list of tables to include  
  --exclude-tables <tables>    Comma-separated list of tables to exclude
  --enable-masking             Enable data masking for sensitive fields
  --batch-size <size>          Batch size for data export
```

#### Generate Everything
```bash
npx nestjs-reverse-engineering all [options]
```

## 🏗️ Generated Structure

When you run the library, it generates files in your project's `/src` directory:

```
src/
├── entities/
│   ├── user.entity.ts
│   ├── post.entity.ts
│   └── index.ts
├── users/
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   └── users.controller.spec.ts
├── posts/
│   ├── posts.controller.ts
│   ├── posts.service.ts
│   ├── posts.module.ts
│   ├── dto/
│   │   ├── create-post.dto.ts
│   │   └── update-post.dto.ts
│   └── posts.controller.spec.ts
└── app.module.ts (automatically updated)
```

## 🔧 Advanced Usage

### Custom Entity Templates

```typescript
import { ReverseEngineeringService } from '@your-org/nestjs-reverse-engineering';

const service = new ReverseEngineeringService(config);

// Generate with custom templates
await service.generateEntities({
  customTemplates: {
    entity: 'path/to/custom-entity.template',
    dto: 'path/to/custom-dto.template'
  }
});
```

### Selective Generation

```typescript
// Generate only specific tables
await service.generateCrud({
  includeTables: ['users', 'posts'],
  excludeTables: ['migrations']
});
```

### With Custom Configuration

```typescript
const customConfig = {
  database: { /* ... */ },
  generation: {
    outputDir: './src/modules',
    entitiesDir: './src/database/entities'
  },
  features: {
    generateAuth: true,
    enableSwagger: true
  }
};

const service = new ReverseEngineeringService(customConfig);
```

## 🔌 NestJS Module Features

### Dynamic Configuration

```typescript
import { ReverseEngineeringModule } from '@your-org/nestjs-reverse-engineering';

@Module({
  imports: [
    ReverseEngineeringModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        database: {
          type: configService.get('DB_TYPE'),
          host: configService.get('DB_HOST'),
          // ... other config
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### Injectable Service

```typescript
import { Injectable } from '@nestjs/common';
import { ReverseEngineeringService } from '@your-org/nestjs-reverse-engineering';

@Injectable()
export class MyService {
  constructor(
    private readonly reverseEngineering: ReverseEngineeringService,
  ) {}

  async regenerateEntities() {
    return this.reverseEngineering.generateEntities();
  }
}
```

## 🧪 Testing

The library includes comprehensive testing utilities:

```typescript
import { Test } from '@nestjs/testing';
import { ReverseEngineeringModule } from '@your-org/nestjs-reverse-engineering';

describe('Generated Modules', () => {
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ReverseEngineeringModule.forRoot(config)],
    }).compile();
    
    // Your tests here
  });
});
```

## 🔒 Security & Best Practices

- **Environment Variables**: Store database credentials in environment variables
- **Data Masking**: Enable data masking for sensitive information during export
- **SSL Connections**: Use SSL for production database connections
- **Table Filtering**: Exclude sensitive or system tables from generation

```bash
# Example with environment variables
DB_HOST=localhost \
DB_USERNAME=user \
DB_PASSWORD=pass \
npx nestjs-reverse-engineering all
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

For issues, questions, or contributions, please visit our [GitHub repository](https://github.com/SuryaDivami/reverse-engineering).

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)

