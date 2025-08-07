import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportParameterController } from './report-parameter.controller';
import { ReportParameterService } from './report-parameter.service';
import { ReportParameterRepository } from './report-parameter.repository';
import { ReportParameter } from './entities/report-parameter.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportParameter]),
  ],
  controllers: [ReportParameterController],
  providers: [ReportParameterService, ReportParameterRepository],
  exports: [ReportParameterService, ReportParameterRepository],
})
export class ReportParameterModule {}