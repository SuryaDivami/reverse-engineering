import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { ReportParameter } from './entities/report-parameter.entity';
import { CreateReportParameterDto } from './dto/create-report-parameter.dto';
import { UpdateReportParameterDto } from './dto/update-report-parameter.dto';
import { QueryReportParameterDto } from './dto/query-report-parameter.dto';

@Injectable()
export class ReportParameterRepository {
  constructor(
    @InjectRepository(ReportParameter)
    private readonly repository: Repository<ReportParameter>,
  ) {}

  async create(createReportParameterDto: CreateReportParameterDto): Promise<ReportParameter> {
    const entity = this.repository.create(createReportParameterDto);
    return await this.repository.save(entity);
  }

  async findAll(queryDto?: QueryReportParameterDto): Promise<{ data: ReportParameter[], total: number }> {
    const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'DESC', ...filters } = queryDto || {};
    
    const options: FindManyOptions<ReportParameter> = {
      where: this.buildWhereClause(filters),
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    };
    
    const [data, total] = await this.repository.findAndCount(options);
    return { data, total };
  }

  async findOne(id: number): Promise<ReportParameter> {
    const entity = await this.repository.findOne({ where: { id } as any });
    if (!entity) {
      throw new Error(`ReportParameter with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: number, updateReportParameterDto: UpdateReportParameterDto): Promise<ReportParameter> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateReportParameterDto);
    return await this.repository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    await this.repository.remove(entity);
  }

  private buildWhereClause(filters: any): any {
    const where: any = {};
    
    // Add filter conditions
    if (filters.parameterName) {
      where.parameterName = filters.parameterName;
    }
    if (filters.label) {
      where.label = filters.label;
    }
    if (filters.dataType) {
      where.dataType = filters.dataType;
    }
    if (filters.createdBy) {
      where.createdBy = filters.createdBy;
    }
    if (filters.updatedBy) {
      where.updatedBy = filters.updatedBy;
    }
    if (filters.deletedBy) {
      where.deletedBy = filters.deletedBy;
    }
    if (filters.queryParameter) {
      where.queryParameter = filters.queryParameter;
    }
    if (filters.inputFieldType) {
      where.inputFieldType = filters.inputFieldType;
    }
    if (filters.optionType) {
      where.optionType = filters.optionType;
    }
    
    return where;
  }
}