/* eslint-disable prettier/prettier */
import * as fs from 'fs';
import * as path from 'path';

export interface FileGenerationOptions {
  outputPath: string;
  overwrite?: boolean;
  createDirectories?: boolean;
  indentation?: string;
  lineEnding?: '\n' | '\r\n';
}

export class FileBuilder {
  private content: string[] = [];
  private indentLevel = 0;
  private readonly indentSize: string;
  private readonly lineEnding: string;

  constructor(
    private readonly options: FileGenerationOptions = {
      outputPath: '',
      indentation: '  ',
      lineEnding: '\n'
    }
  ) {
    this.indentSize = options.indentation || '  ';
    this.lineEnding = options.lineEnding || '\n';
  }

  /**
   * Add a line of content with proper indentation
   */
  public addLine(content: string = ''): this {
    if (content.trim() === '') {
      this.content.push('');
    } else {
      const indent = this.indentSize.repeat(this.indentLevel);
      this.content.push(indent + content);
    }
    return this;
  }

  /**
   * Add multiple lines of content
   */
  public addLines(lines: string[]): this {
    lines.forEach(line => this.addLine(line));
    return this;
  }

  /**
   * Add raw content without indentation
   */
  public addRaw(content: string): this {
    this.content.push(content);
    return this;
  }

  /**
   * Add a comment block
   */
  public addComment(comment: string, style: 'line' | 'block' = 'line'): this {
    if (style === 'block') {
      this.addLine('/**');
      comment.split('\n').forEach(line => {
        this.addLine(` * ${line}`);
      });
      this.addLine(' */');
    } else {
      comment.split('\n').forEach(line => {
        this.addLine(`// ${line}`);
      });
    }
    return this;
  }

  /**
   * Add an import statement
   */
  public addImport(imports: string | string[], from: string): this {
    if (Array.isArray(imports)) {
      if (imports.length === 1) {
        this.addLine(`import { ${imports[0]} } from '${from}';`);
      } else {
        this.addLine(`import {`);
        this.increaseIndent();
        imports.forEach((imp, index) => {
          const comma = index < imports.length - 1 ? ',' : '';
          this.addLine(`${imp}${comma}`);
        });
        this.decreaseIndent();
        this.addLine(`} from '${from}';`);
      }
    } else {
      this.addLine(`import { ${imports} } from '${from}';`);
    }
    return this;
  }

  /**
   * Add a default import
   */
  public addDefaultImport(name: string, from: string): this {
    this.addLine(`import ${name} from '${from}';`);
    return this;
  }

  /**
   * Add namespace import
   */
  public addNamespaceImport(name: string, from: string): this {
    this.addLine(`import * as ${name} from '${from}';`);
    return this;
  }

  /**
   * Start a block (class, function, interface, etc.)
   */
  public startBlock(declaration: string): this {
    this.addLine(declaration + ' {');
    this.increaseIndent();
    return this;
  }

  /**
   * End a block
   */
  public endBlock(semicolon: boolean = false): this {
    this.decreaseIndent();
    this.addLine('}' + (semicolon ? ';' : ''));
    return this;
  }

  /**
   * Add a property declaration
   */
  public addProperty(
    name: string, 
    type: string, 
    options: {
      optional?: boolean;
      readonly?: boolean;
      static?: boolean;
      private?: boolean;
      protected?: boolean;
      public?: boolean;
      defaultValue?: string;
      decorators?: string[];
      comment?: string;
    } = {}
  ): this {
    if (options.comment) {
      this.addComment(options.comment);
    }

    if (options.decorators) {
      options.decorators.forEach(decorator => {
        this.addLine(decorator);
      });
    }

    let declaration = '';
    
    // Access modifiers
    if (options.public) declaration += 'public ';
    if (options.private) declaration += 'private ';
    if (options.protected) declaration += 'protected ';
    
    // Other modifiers
    if (options.static) declaration += 'static ';
    if (options.readonly) declaration += 'readonly ';
    
    // Property name and type
    declaration += `${name}${options.optional ? '?' : ''}: ${type}`;
    
    // Default value
    if (options.defaultValue) {
      declaration += ` = ${options.defaultValue}`;
    }
    
    this.addLine(declaration + ';');
    return this;
  }

  /**
   * Add a method declaration
   */
  public addMethod(
    name: string,
    parameters: Array<{ name: string; type: string; optional?: boolean; defaultValue?: string }>,
    returnType: string,
    options: {
      async?: boolean;
      static?: boolean;
      private?: boolean;
      protected?: boolean;
      public?: boolean;
      abstract?: boolean;
      decorators?: string[];
      comment?: string;
      body?: string[];
    } = {}
  ): this {
    if (options.comment) {
      this.addComment(options.comment);
    }

    if (options.decorators) {
      options.decorators.forEach(decorator => {
        this.addLine(decorator);
      });
    }

    let declaration = '';
    
    // Access modifiers
    if (options.public) declaration += 'public ';
    if (options.private) declaration += 'private ';
    if (options.protected) declaration += 'protected ';
    
    // Other modifiers
    if (options.static) declaration += 'static ';
    if (options.abstract) declaration += 'abstract ';
    if (options.async) declaration += 'async ';
    
    // Method signature
    const params = parameters.map(p => {
      let param = `${p.name}${p.optional ? '?' : ''}: ${p.type}`;
      if (p.defaultValue) param += ` = ${p.defaultValue}`;
      return param;
    }).join(', ');
    
    declaration += `${name}(${params}): ${returnType}`;
    
    if (options.abstract) {
      this.addLine(declaration + ';');
    } else {
      this.startBlock(declaration);
      if (options.body) {
        this.addLines(options.body);
      }
      this.endBlock();
    }
    
    return this;
  }

  /**
   * Increase indentation level
   */
  public increaseIndent(): this {
    this.indentLevel++;
    return this;
  }

  /**
   * Decrease indentation level
   */
  public decreaseIndent(): this {
    if (this.indentLevel > 0) {
      this.indentLevel--;
    }
    return this;
  }

  /**
   * Add an empty line
   */
  public addEmptyLine(): this {
    this.content.push('');
    return this;
  }

  /**
   * Get the current content as string
   */
  public getContent(): string {
    return this.content.join(this.lineEnding);
  }

  /**
   * Clear all content
   */
  public clear(): this {
    this.content = [];
    this.indentLevel = 0;
    return this;
  }

  /**
   * Write content to file
   */
  public async writeToFile(filePath?: string): Promise<void> {
    const targetPath = filePath || this.options.outputPath;
    
    if (!targetPath) {
      throw new Error('No output path specified');
    }

    // Create directories if needed
    if (this.options.createDirectories !== false) {
      const dir = path.dirname(targetPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    // Check if file exists and overwrite option
    if (fs.existsSync(targetPath) && !this.options.overwrite) {
      throw new Error(`File ${targetPath} already exists and overwrite is disabled`);
    }

    // Write file
    const content = this.getContent();
    fs.writeFileSync(targetPath, content, 'utf8');
  }

  /**
   * Create a new FileBuilder with the same options
   */
  public clone(): FileBuilder {
    return new FileBuilder({ ...this.options });
  }
}
