import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Sales } from './entities/sales.entity';
import { CreateSalesDto } from './dto/create-sales.dto';
import { UpdateSalesDto } from './dto/update-sales.dto';
import { QuerySalesDto } from './dto/query-sales.dto';

@Injectable()
export class SalesRepository {
  constructor(
    @InjectRepository(Sales)
    private readonly repository: Repository<Sales>,
  ) {}

  async create(createSalesDto: CreateSalesDto): Promise<Sales> {
    const entity = this.repository.create(createSalesDto);
    return await this.repository.save(entity);
  }

  async findAll(queryDto?: QuerySalesDto): Promise<{ data: Sales[], total: number }> {
    const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'DESC', ...filters } = queryDto || {};
    
    const options: FindManyOptions<Sales> = {
      where: this.buildWhereClause(filters),
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    };
    
    const [data, total] = await this.repository.findAndCount(options);
    return { data, total };
  }

  async findOne(id: number): Promise<Sales> {
    const entity = await this.repository.findOne({ where: { id } as any });
    if (!entity) {
      throw new Error(`Sales with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: number, updateSalesDto: UpdateSalesDto): Promise<Sales> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateSalesDto);
    return await this.repository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    await this.repository.remove(entity);
  }

  private buildWhereClause(filters: any): any {
    const where: any = {};
    
    // Add filter conditions
    if (filters.region) {
      where.region = filters.region;
    }
    
    return where;
  }
}