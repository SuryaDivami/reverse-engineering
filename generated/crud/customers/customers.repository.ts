import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Customers } from './entities/customers.entity';
import { CreateCustomersDto } from './dto/create-customers.dto';
import { UpdateCustomersDto } from './dto/update-customers.dto';
import { QueryCustomersDto } from './dto/query-customers.dto';

@Injectable()
export class CustomersRepository {
  constructor(
    @InjectRepository(Customers)
    private readonly repository: Repository<Customers>,
  ) {}

  async create(createCustomersDto: CreateCustomersDto): Promise<Customers> {
    const entity = this.repository.create(createCustomersDto);
    return await this.repository.save(entity);
  }

  async findAll(queryDto?: QueryCustomersDto): Promise<{ data: Customers[], total: number }> {
    const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'DESC', ...filters } = queryDto || {};
    
    const options: FindManyOptions<Customers> = {
      where: this.buildWhereClause(filters),
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    };
    
    const [data, total] = await this.repository.findAndCount(options);
    return { data, total };
  }

  async findOne(id: number): Promise<Customers> {
    const entity = await this.repository.findOne({ where: { id } as any });
    if (!entity) {
      throw new Error(`Customers with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: number, updateCustomersDto: UpdateCustomersDto): Promise<Customers> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateCustomersDto);
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
    if (filters.email) {
      where.email = filters.email;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    
    return where;
  }
}