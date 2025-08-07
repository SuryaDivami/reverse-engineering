/* eslint-disable prettier/prettier */
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

export interface EntityInfo {
  className: string;
  fileName: string;
  filePath: string;
  relativePath: string;
}

export interface IndexGenerationOptions {
  entitiesPath: string;
  outputPath?: string;
  includeNamedExports: boolean;
  includeEntitiesArray: boolean;
  filePattern: string;
}

export class EntityIndexGenerator {
  private readonly options: IndexGenerationOptions;

  constructor(options: Partial<IndexGenerationOptions> = {}) {
    this.options = {
      entitiesPath: './generated/entities',
      outputPath: './generated/entities/index.ts',
      includeNamedExports: true,
      includeEntitiesArray: true,
      filePattern: '**/*.entity.ts',
      ...options
    };
  }

  /**
   * Scan directory for entity files
   */
  public async scanEntityFiles(): Promise<EntityInfo[]> {
    const entityFiles: EntityInfo[] = [];
    
    const searchPattern = path.join(this.options.entitiesPath, this.options.filePattern);
    const files = await glob(searchPattern, { 
      ignore: ['**/index.ts', '**/*.spec.ts', '**/*.test.ts'],
      absolute: false 
    });

    for (const filePath of files) {
      const entityInfo = this.extractEntityInfo(filePath);
      if (entityInfo) {
        entityFiles.push(entityInfo);
      }
    }

    return entityFiles.sort((a, b) => a.className.localeCompare(b.className));
  }

  /**
   * Extract entity class information from file
   */
  private extractEntityInfo(filePath: string): EntityInfo | null {
    try {
      const fullPath = path.resolve(filePath);
      const fileContent = fs.readFileSync(fullPath, 'utf8');
      
      // Extract class name using regex
      const classMatch = fileContent.match(/export\s+class\s+(\w+)/);
      if (!classMatch) {
        console.warn(`No exported class found in ${filePath}`);
        return null;
      }

      const className = classMatch[1];
      const fileName = path.basename(filePath);
      const relativePath = path.relative(path.dirname(this.options.outputPath || ''), filePath);
      
      // Remove .ts extension for import
      const importPath = relativePath.replace(/\.ts$/, '');

      return {
        className,
        fileName,
        filePath: fullPath,
        relativePath: importPath
      };
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Generate index.ts content
   */
  public generateIndexContent(entities: EntityInfo[]): string {
    const lines: string[] = [];

    // Add header comment
    lines.push('// Generated entity index - Auto-generated, do not edit manually');
    lines.push('');

    // Add imports
    if (entities.length > 0) {
      lines.push('// Entity imports');
      entities.forEach(entity => {
        lines.push(`import { ${entity.className} } from './${entity.relativePath}';`);
      });
      lines.push('');
    }

    // Add named exports (re-exports)
    if (this.options.includeNamedExports && entities.length > 0) {
      lines.push('// Named exports');
      lines.push('export {');
      entities.forEach((entity, index) => {
        const comma = index < entities.length - 1 ? ',' : '';
        lines.push(`  ${entity.className}${comma}`);
      });
      lines.push('};');
      lines.push('');
    }

    // Add entities array export
    if (this.options.includeEntitiesArray && entities.length > 0) {
      lines.push('// Entities array for TypeORM configuration');
      lines.push('export const Entities = [');
      entities.forEach((entity, index) => {
        const comma = index < entities.length - 1 ? ',' : '';
        lines.push(`  ${entity.className}${comma}`);
      });
      lines.push('];');
      lines.push('');
    }

    // Add entity count export
    lines.push(`// Total entities: ${entities.length}`);
    lines.push(`export const ENTITY_COUNT = ${entities.length};`);
    lines.push('');

    // Add entity names export
    if (entities.length > 0) {
      lines.push('// Entity names for reference');
      lines.push('export const ENTITY_NAMES = [');
      entities.forEach((entity, index) => {
        const comma = index < entities.length - 1 ? ',' : '';
        lines.push(`  '${entity.className}'${comma}`);
      });
      lines.push('];');
      lines.push('');
    }

    // Add entity metadata export
    lines.push('// Entity metadata');
    lines.push('export const ENTITY_METADATA = [');
    entities.forEach((entity, index) => {
      const comma = index < entities.length - 1 ? ',' : '';
      lines.push(`  {`);
      lines.push(`    name: '${entity.className}',`);
      lines.push(`    fileName: '${entity.fileName}',`);
      lines.push(`    class: ${entity.className}`);
      lines.push(`  }${comma}`);
    });
    lines.push('];');

    return lines.join('\n');
  }

  /**
   * Generate index.ts file
   */
  public async generateIndex(): Promise<void> {
    console.log('🔍 Scanning for entity files...');
    const entities = await this.scanEntityFiles();
    
    console.log(`📄 Found ${entities.length} entity files:`);
    entities.forEach(entity => {
      console.log(`  - ${entity.className} (${entity.fileName})`);
    });

    console.log('📝 Generating index.ts...');
    const indexContent = this.generateIndexContent(entities);

    // Ensure output directory exists
    const outputDir = path.dirname(this.options.outputPath!);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write index file
    fs.writeFileSync(this.options.outputPath!, indexContent, 'utf8');
    
    console.log(`✅ Generated index.ts at ${this.options.outputPath}`);
    console.log(`📊 Exported ${entities.length} entities`);
  }

  /**
   * Watch for changes and regenerate index
   */
  public watchAndRegenerate(): void {
    console.log('👁️  Watching for entity file changes...');
    
    // Simple file watcher (in production, consider using chokidar)
    setInterval(async () => {
      try {
        await this.generateIndex();
      } catch (error) {
        console.error('Error regenerating index:', error);
      }
    }, 5000); // Check every 5 seconds
  }
}
