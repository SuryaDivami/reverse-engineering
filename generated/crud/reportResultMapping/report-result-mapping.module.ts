import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportResultMappingController } from './report-result-mapping.controller';
import { ReportResultMappingService } from './report-result-mapping.service';
import { ReportResultMappingRepository } from './report-result-mapping.repository';
import { ReportResultMapping } from './entities/report-result-mapping.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportResultMapping]),
  ],
  controllers: [ReportResultMappingController],
  providers: [ReportResultMappingService, ReportResultMappingRepository],
  exports: [ReportResultMappingService, ReportResultMappingRepository],
})
export class ReportResultMappingModule {}