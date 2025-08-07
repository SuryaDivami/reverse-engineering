import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { ReportResultMapping } from './entities/report-result-mapping.entity';
import { CreateReportResultMappingDto } from './dto/create-report-result-mapping.dto';
import { UpdateReportResultMappingDto } from './dto/update-report-result-mapping.dto';
import { QueryReportResultMappingDto } from './dto/query-report-result-mapping.dto';

@Injectable()
export class ReportResultMappingRepository {
  constructor(
    @InjectRepository(ReportResultMapping)
    private readonly repository: Repository<ReportResultMapping>,
  ) {}

  async create(createReportResultMappingDto: CreateReportResultMappingDto): Promise<ReportResultMapping> {
    const entity = this.repository.create(createReportResultMappingDto);
    return await this.repository.save(entity);
  }

  async findAll(queryDto?: QueryReportResultMappingDto): Promise<{ data: ReportResultMapping[], total: number }> {
    const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'DESC', ...filters } = queryDto || {};
    
    const options: FindManyOptions<ReportResultMapping> = {
      where: this.buildWhereClause(filters),
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    };
    
    const [data, total] = await this.repository.findAndCount(options);
    return { data, total };
  }

  async findOne(id: number): Promise<ReportResultMapping> {
    const entity = await this.repository.findOne({ where: { id } as any });
    if (!entity) {
      throw new Error(`ReportResultMapping with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: number, updateReportResultMappingDto: UpdateReportResultMappingDto): Promise<ReportResultMapping> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateReportResultMappingDto);
    return await this.repository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    await this.repository.remove(entity);
  }

  private buildWhereClause(filters: any): any {
    const where: any = {};
    
    // Add filter conditions
    if (filters.queryParameterName) {
      where.queryParameterName = filters.queryParameterName;
    }
    if (filters.variableName) {
      where.variableName = filters.variableName;
    }
    if (filters.label) {
      where.label = filters.label;
    }
    if (filters.dataType) {
      where.dataType = filters.dataType;
    }
    if (filters.alignment) {
      where.alignment = filters.alignment;
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
    
    return where;
  }
}