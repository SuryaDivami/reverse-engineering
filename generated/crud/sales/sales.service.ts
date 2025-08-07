import { Injectable } from '@nestjs/common';
import { SalesRepository } from './sales.repository';
import { CreateSalesDto } from './dto/create-sales.dto';
import { UpdateSalesDto } from './dto/update-sales.dto';
import { QuerySalesDto } from './dto/query-sales.dto';

@Injectable()
export class SalesService {
  constructor(private readonly salesRepository: SalesRepository) {}

  async create(createSalesDto: CreateSalesDto) {
    return await this.salesRepository.create(createSalesDto);
  }

  async findAll(queryDto?: QuerySalesDto) {
    return await this.salesRepository.findAll(queryDto);
  }

  async findOne(id: number) {
    const entity = await this.salesRepository.findOne(id);
    if (!entity) {
      throw new Error(`Sales with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: number, updateSalesDto: UpdateSalesDto) {
    const entity = await this.salesRepository.update(id, updateSalesDto);
    if (!entity) {
      throw new Error(`Sales with ID ${id} not found`);
    }
    return entity;
  }

  async remove(id: number) {
    await this.salesRepository.remove(id);
    return { message: `Sales deleted successfully` };
  }
}