import { ReverseEngineeringConfig } from '../types/config.types';
import { DatabaseDialect } from '../types/database.types';

/**
 * Default configuration for the reverse engineering library
 */
export const DEFAULT_REVERSE_ENGINEERING_CONFIG: Omit<ReverseEngineeringConfig, 'database'> = {
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

/**
 * Create a complete configuration by merging user input with defaults
 */
export function createConfig(userConfig: any): ReverseEngineeringConfig {
  return {
    ...DEFAULT_REVERSE_ENGINEERING_CONFIG,
    ...userConfig,
    paths: {
      ...DEFAULT_REVERSE_ENGINEERING_CONFIG.paths,
      ...userConfig.paths
    },
    features: {
      ...DEFAULT_REVERSE_ENGINEERING_CONFIG.features,
      ...userConfig.features
    },
    crud: {
      ...DEFAULT_REVERSE_ENGINEERING_CONFIG.crud,
      ...userConfig.crud
    },
    entities: {
      ...DEFAULT_REVERSE_ENGINEERING_CONFIG.entities,
      ...userConfig.entities
    },
    sql: {
      ...DEFAULT_REVERSE_ENGINEERING_CONFIG.sql,
      ...userConfig.sql
    },
    dataExport: {
      ...DEFAULT_REVERSE_ENGINEERING_CONFIG.dataExport,
      ...userConfig.dataExport
    }
  };
}
