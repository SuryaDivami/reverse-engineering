import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUsersDto } from './dto/create-users.dto';
import { UpdateUsersDto } from './dto/update-users.dto';
import { QueryUsersDto } from './dto/query-users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUsersDto: CreateUsersDto) {
    return await this.usersRepository.create(createUsersDto);
  }

  async findAll(queryDto?: QueryUsersDto) {
    return await this.usersRepository.findAll(queryDto);
  }

  async findOne(id: number) {
    const entity = await this.usersRepository.findOne(id);
    if (!entity) {
      throw new Error(`Users with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: number, updateUsersDto: UpdateUsersDto) {
    const entity = await this.usersRepository.update(id, updateUsersDto);
    if (!entity) {
      throw new Error(`Users with ID ${id} not found`);
    }
    return entity;
  }

  async remove(id: number) {
    await this.usersRepository.remove(id);
    return { message: `Users deleted successfully` };
  }
}