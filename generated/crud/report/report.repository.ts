import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { QueryReportDto } from './dto/query-report.dto';

@Injectable()
export class ReportRepository {
  constructor(
    @InjectRepository(Report)
    private readonly repository: Repository<Report>,
  ) {}

  async create(createReportDto: CreateReportDto): Promise<Report> {
    const entity = this.repository.create(createReportDto);
    return await this.repository.save(entity);
  }

  async findAll(queryDto?: QueryReportDto): Promise<{ data: Report[], total: number }> {
    const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'DESC', ...filters } = queryDto || {};
    
    const options: FindManyOptions<Report> = {
      where: this.buildWhereClause(filters),
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    };
    
    const [data, total] = await this.repository.findAndCount(options);
    return { data, total };
  }

  async findOne(id: number): Promise<Report> {
    const entity = await this.repository.findOne({ where: { id } as any });
    if (!entity) {
      throw new Error(`Report with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: number, updateReportDto: UpdateReportDto): Promise<Report> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateReportDto);
    return await this.repository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    await this.repository.remove(entity);
  }

  private buildWhereClause(filters: any): any {
    const where: any = {};
    
    // Add filter conditions
    if (filters.name) {
      where.name = filters.name;
    }
    if (filters.label) {
      where.label = filters.label;
    }
    if (filters.endPoint) {
      where.endPoint = filters.endPoint;
    }
    if (filters.query) {
      where.query = filters.query;
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