import { Injectable } from '@nestjs/common';
import { ReportResultMappingRepository } from './report-result-mapping.repository';
import { CreateReportResultMappingDto } from './dto/create-report-result-mapping.dto';
import { UpdateReportResultMappingDto } from './dto/update-report-result-mapping.dto';
import { QueryReportResultMappingDto } from './dto/query-report-result-mapping.dto';

@Injectable()
export class ReportResultMappingService {
  constructor(private readonly reportResultMappingRepository: ReportResultMappingRepository) {}

  async create(createReportResultMappingDto: CreateReportResultMappingDto) {
    return await this.reportResultMappingRepository.create(createReportResultMappingDto);
  }

  async findAll(queryDto?: QueryReportResultMappingDto) {
    return await this.reportResultMappingRepository.findAll(queryDto);
  }

  async findOne(id: number) {
    const entity = await this.reportResultMappingRepository.findOne(id);
    if (!entity) {
      throw new Error(`ReportResultMapping with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: number, updateReportResultMappingDto: UpdateReportResultMappingDto) {
    const entity = await this.reportResultMappingRepository.update(id, updateReportResultMappingDto);
    if (!entity) {
      throw new Error(`ReportResultMapping with ID ${id} not found`);
    }
    return entity;
  }

  async remove(id: number) {
    await this.reportResultMappingRepository.remove(id);
    return { message: `ReportResultMapping deleted successfully` };
  }
}