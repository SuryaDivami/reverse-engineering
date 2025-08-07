import { Injectable } from '@nestjs/common';
import { CustomersRepository } from './customers.repository';
import { CreateCustomersDto } from './dto/create-customers.dto';
import { UpdateCustomersDto } from './dto/update-customers.dto';
import { QueryCustomersDto } from './dto/query-customers.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly customersRepository: CustomersRepository) {}

  async create(createCustomersDto: CreateCustomersDto) {
    return await this.customersRepository.create(createCustomersDto);
  }

  async findAll(queryDto?: QueryCustomersDto) {
    return await this.customersRepository.findAll(queryDto);
  }

  async findOne(id: number) {
    const entity = await this.customersRepository.findOne(id);
    if (!entity) {
      throw new Error(`Customers with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: number, updateCustomersDto: UpdateCustomersDto) {
    const entity = await this.customersRepository.update(id, updateCustomersDto);
    if (!entity) {
      throw new Error(`Customers with ID ${id} not found`);
    }
    return entity;
  }

  async remove(id: number) {
    await this.customersRepository.remove(id);
    return { message: `Customers deleted successfully` };
  }
}