import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersModule } from './customers/customers.module';
import { ReportModule } from './report/report.module';
import { ReportParameterModule } from './reportParameter/report-parameter.module';
import { ReportResultMappingModule } from './reportResultMapping/report-result-mapping.module';
import { SalesModule } from './sales/sales.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // Database configuration goes here
      // type: 'postgres',
      // host: 'localhost',
      // port: 5432,
      // username: 'your-username',
      // password: 'your-password',
      // database: 'your-database',
      // entities: [__dirname + '/**/*.entity{.ts,.js}'],
      // synchronize: true,
    }),
    CustomersModule,
    ReportModule,
    ReportParameterModule,
    ReportResultMappingModule,
    SalesModule,
    UsersModule,
  ],
})
export class AppModule {}