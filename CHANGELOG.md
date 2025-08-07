# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-08-08

### Added
- Initial release of NestJS Reverse Engineering Library
- Database reverse engineering with TypeORM entity generation
- CRUD operations generation (controllers, services, DTOs, repositories)
- Support for PostgreSQL and MySQL databases
- Configurable output directories and table filtering
- CLI tool with comprehensive command set
- NestJS module integration with forRoot/forRootAsync
- Programmatic API for custom integrations
- SQL script generation (CREATE TABLE, INSERT statements)
- Data export with optional masking capabilities
- Automatic module import into app.module.ts
- Entity reuse when existing entities are found
- Comprehensive configuration system with defaults
- Test generation for all CRUD operations
- Swagger/OpenAPI documentation generation
- TypeScript type safety throughout

### Features
- **Database Support**: PostgreSQL, MySQL via TypeORM
- **Generation Modes**: Entities, CRUD, SQL, Data Export
- **CLI Commands**: init, test, tables, entities, crud, sql, data, all
- **Configuration**: JSON config file with extensive options
- **Output Control**: Configurable directories for all generated files
- **Table Filtering**: Include/exclude specific tables
- **Framework Integration**: Direct NestJS module support
- **Development Experience**: Full TypeScript support with type definitions

### CLI Commands
- `init` - Generate configuration file
- `test` - Test database connection
- `tables` - List available database tables
- `entities` - Generate TypeORM entities
- `crud` - Generate CRUD operations
- `sql` - Generate SQL scripts
- `data` - Export database data
- `all` - Generate everything at once

### Documentation
- Comprehensive README with usage examples
- TypeScript interface documentation
- CLI help and command reference
- NestJS integration examples
- Programmatic usage examples
