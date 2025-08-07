import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Users } from './entities/users.entity';
import { CreateUsersDto } from './dto/create-users.dto';
import { UpdateUsersDto } from './dto/update-users.dto';
import { QueryUsersDto } from './dto/query-users.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(Users)
    private readonly repository: Repository<Users>,
  ) {}

  async create(createUsersDto: CreateUsersDto): Promise<Users> {
    const entity = this.repository.create(createUsersDto);
    return await this.repository.save(entity);
  }

  async findAll(queryDto?: QueryUsersDto): Promise<{ data: Users[], total: number }> {
    const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'DESC', ...filters } = queryDto || {};
    
    const options: FindManyOptions<Users> = {
      where: this.buildWhereClause(filters),
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    };
    
    const [data, total] = await this.repository.findAndCount(options);
    return { data, total };
  }

  async findOne(id: number): Promise<Users> {
    const entity = await this.repository.findOne({ where: { id } as any });
    if (!entity) {
      throw new Error(`Users with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: number, updateUsersDto: UpdateUsersDto): Promise<Users> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateUsersDto);
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
    if (filters.password) {
      where.password = filters.password;
    }
    if (filters.mobileNo) {
      where.mobileNo = filters.mobileNo;
    }
    if (filters.profileImage) {
      where.profileImage = filters.profileImage;
    }
    if (filters.country) {
      where.country = filters.country;
    }
    if (filters.city) {
      where.city = filters.city;
    }
    if (filters.role) {
      where.role = filters.role;
    }
    
    return where;
  }
}