import { Injectable } from '@nestjs/common';
import { ReportRepository } from './report.repository';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { QueryReportDto } from './dto/query-report.dto';

@Injectable()
export class ReportService {
  constructor(private readonly reportRepository: ReportRepository) {}

  async create(createReportDto: CreateReportDto) {
    return await this.reportRepository.create(createReportDto);
  }

  async findAll(queryDto?: QueryReportDto) {
    return await this.reportRepository.findAll(queryDto);
  }

  async findOne(id: number) {
    const entity = await this.reportRepository.findOne(id);
    if (!entity) {
      throw new Error(`Report with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: number, updateReportDto: UpdateReportDto) {
    const entity = await this.reportRepository.update(id, updateReportDto);
    if (!entity) {
      throw new Error(`Report with ID ${id} not found`);
    }
    return entity;
  }

  async remove(id: number) {
    await this.reportRepository.remove(id);
    return { message: `Report deleted successfully` };
  }
}