/* eslint-disable prettier/prettier */
import { RESERVED_KEYWORDS, TYPEORM_RESERVED_WORDS } from '../types/constants';

export class NamingUtils {
  /**
   * Convert snake_case to PascalCase
   */
  public static toPascalCase(str: string): string {
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Convert snake_case to camelCase
   */
  public static toCamelCase(str: string): string {
    const pascalCase = this.toPascalCase(str);
    return pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);
  }

  /**
   * Convert PascalCase or camelCase to snake_case
   */
  public static toSnakeCase(str: string): string {
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
  }

  /**
   * Convert PascalCase, camelCase, or snake_case to kebab-case
   */
  public static toKebabCase(str: string): string {
    return str
      .replace(/([A-Z])/g, '-$1')
      .replace(/_/g, '-')
      .toLowerCase()
      .replace(/^-/, '');
  }

  /**
   * Convert kebab-case to PascalCase
   */
  public static kebabToPascalCase(str: string): string {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Convert kebab-case to camelCase
   */
  public static kebabToCamelCase(str: string): string {
    const pascalCase = this.kebabToPascalCase(str);
    return pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);
  }

  /**
   * Sanitize table/column names for TypeScript
   */
  public static sanitizeName(name: string): string {
    // Remove special characters and spaces
    let sanitized = name.replace(/[^a-zA-Z0-9_]/g, '_');
    
    // Remove leading numbers
    if (/^\d/.test(sanitized)) {
      sanitized = '_' + sanitized;
    }
    
    // Handle reserved keywords
    if (this.isReservedKeyword(sanitized)) {
      sanitized = sanitized + '_';
    }
    
    return sanitized;
  }

  /**
   * Check if a name is a reserved keyword
   */
  public static isReservedKeyword(name: string): boolean {
    const lowerName = name.toLowerCase();
    return RESERVED_KEYWORDS.includes(lowerName) || 
           TYPEORM_RESERVED_WORDS.includes(lowerName);
  }

  /**
   * Generate a safe property name
   */
  public static toSafePropertyName(columnName: string, convention: 'camelCase' | 'PascalCase' | 'snake_case' = 'camelCase'): string {
    const sanitized = this.sanitizeName(columnName);
    
    switch (convention) {
      case 'PascalCase':
        return this.toPascalCase(sanitized);
      case 'camelCase':
        return this.toCamelCase(sanitized);
      case 'snake_case':
        return sanitized;
      default:
        return this.toCamelCase(sanitized);
    }
  }

  /**
   * Generate a safe class name from table name
   */
  public static toSafeClassName(tableName: string): string {
    const sanitized = this.sanitizeName(tableName);
    let className = this.toPascalCase(sanitized);
    
    // Ensure it ends with a descriptive suffix if it's too generic
    if (className.length < 3) {
      className = className + 'Entity';
    }
    
    return className;
  }

  /**
   * Generate a safe enum name
   */
  public static toSafeEnumName(value: string): string {
    let sanitized = value.replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase();
    
    // Remove leading numbers
    if (/^\d/.test(sanitized)) {
      sanitized = '_' + sanitized;
    }
    
    return sanitized;
  }

  /**
   * Extract enum values from PostgreSQL enum definition
   */
  public static parseEnumValues(enumDefinition: string): string[] {
    const match = enumDefinition.match(/enum\((.*)\)/i);
    if (!match) return [];
    
    return match[1]
      .split(',')
      .map(value => value.trim().replace(/['"]/g, ''))
      .filter(value => value.length > 0);
  }

  /**
   * Generate file name from table name
   */
  public static toFileName(tableName: string): string {
    return this.toSnakeCase(this.sanitizeName(tableName));
  }

  /**
   * Handle composite names (tables with spaces, special chars)
   */
  public static handleCompositeName(name: string): { original: string; safe: string; quoted: boolean } {
    const hasSpecialChars = /[^a-zA-Z0-9_]/.test(name);
    const startsWithNumber = /^\d/.test(name);
    const isReserved = this.isReservedKeyword(name);
    
    return {
      original: name,
      safe: this.sanitizeName(name),
      quoted: hasSpecialChars || startsWithNumber || isReserved
    };
  }

  /**
   * Generate relationship property name
   */
  public static toRelationshipName(tableName: string, isCollection: boolean = false): string {
    const baseName = this.toCamelCase(this.sanitizeName(tableName));
    return isCollection ? this.pluralize(baseName) : baseName;
  }

  /**
   * Simple pluralization (can be enhanced with a library like 'pluralize')
   */
  private static pluralize(word: string): string {
    // Simple pluralization rules
    if (word.endsWith('y')) {
      return word.slice(0, -1) + 'ies';
    } else if (word.endsWith('s') || word.endsWith('sh') || word.endsWith('ch') || word.endsWith('x') || word.endsWith('z')) {
      return word + 'es';
    } else {
      return word + 's';
    }
  }
}
