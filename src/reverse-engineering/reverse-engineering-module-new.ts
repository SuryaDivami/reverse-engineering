import { DynamicModule, Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReverseEngineeringService } from './reverse-engineering-service-new';
import { ReverseEngineeringController } from './reverse-engineering.controller';
import { ReverseEngineeringConfigInput } from './types/config.types';

export interface ReverseEngineeringModuleOptions extends ReverseEngineeringConfigInput {
  /**
   * Whether to expose REST API endpoints
   * @default true
   */
  enableAPI?: boolean;
  
  /**
   * Whether to make the module global
   * @default false
   */
  isGlobal?: boolean;
}

@Global()
@Module({})
export class ReverseEngineeringModule {
  /**
   * Configure the module with provided options
   */
  static forRoot(options: ReverseEngineeringModuleOptions): DynamicModule {
    const providers: any[] = [
      {
        provide: 'REVERSE_ENGINEERING_CONFIG',
        useValue: options,
      },
      {
        provide: ReverseEngineeringService,
        useFactory: (config: ReverseEngineeringConfigInput) => {
          const service = new ReverseEngineeringService();
          service.initialize(config);
          return service;
        },
        inject: ['REVERSE_ENGINEERING_CONFIG'],
      },
    ];

    const controllers = options.enableAPI !== false ? [ReverseEngineeringController] : [];

    return {
      module: ReverseEngineeringModule,
      providers,
      controllers,
      exports: [ReverseEngineeringService],
      global: options.isGlobal || false,
    };
  }

  /**
   * Configure the module for async initialization
   */
  static forRootAsync(options: {
    useFactory?: (...args: any[]) => Promise<ReverseEngineeringModuleOptions> | ReverseEngineeringModuleOptions;
    inject?: any[];
    isGlobal?: boolean;
  }): DynamicModule {
    const providers: any[] = [
      {
        provide: 'REVERSE_ENGINEERING_CONFIG',
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
      {
        provide: ReverseEngineeringService,
        useFactory: (config: ReverseEngineeringConfigInput) => {
          const service = new ReverseEngineeringService();
          service.initialize(config);
          return service;
        },
        inject: ['REVERSE_ENGINEERING_CONFIG'],
      },
    ];

    return {
      module: ReverseEngineeringModule,
      providers,
      controllers: [ReverseEngineeringController],
      exports: [ReverseEngineeringService],
      global: options.isGlobal || false,
    };
  }
}
