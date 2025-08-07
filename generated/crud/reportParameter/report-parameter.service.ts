import { Injectable } from '@nestjs/common';
import { ReportParameterRepository } from './report-parameter.repository';
import { CreateReportParameterDto } from './dto/create-report-parameter.dto';
import { UpdateReportParameterDto } from './dto/update-report-parameter.dto';
import { QueryReportParameterDto } from './dto/query-report-parameter.dto';

@Injectable()
export class ReportParameterService {
  constructor(private readonly reportParameterRepository: ReportParameterRepository) {}

  async create(createReportParameterDto: CreateReportParameterDto) {
    return await this.reportParameterRepository.create(createReportParameterDto);
  }

  async findAll(queryDto?: QueryReportParameterDto) {
    return await this.reportParameterRepository.findAll(queryDto);
  }

  async findOne(id: number) {
    const entity = await this.reportParameterRepository.findOne(id);
    if (!entity) {
      throw new Error(`ReportParameter with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: number, updateReportParameterDto: UpdateReportParameterDto) {
    const entity = await this.reportParameterRepository.update(id, updateReportParameterDto);
    if (!entity) {
      throw new Error(`ReportParameter with ID ${id} not found`);
    }
    return entity;
  }

  async remove(id: number) {
    await this.reportParameterRepository.remove(id);
    return { message: `ReportParameter deleted successfully` };
  }
}