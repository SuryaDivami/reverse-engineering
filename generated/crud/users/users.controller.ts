import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUsersDto } from './dto/create-users.dto';
import { UpdateUsersDto } from './dto/update-users.dto';
import { QueryUsersDto } from './dto/query-users.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create a new users' })
  @ApiResponse({ status: 201, description: 'The users has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Post()
  create(@Body() createUsersDto: CreateUsersDto) {
    return this.usersService.create(createUsersDto);
  }

  @ApiOperation({ summary: 'Get all userss' })
  @ApiResponse({ status: 200, description: 'Return all userss.' })
  @Get()
  findAll(@Query() queryDto: QueryUsersDto) {
    return this.usersService.findAll(queryDto);
  }

  @ApiOperation({ summary: 'Get a users by id' })
  @ApiParam({ name: 'id', description: 'Users ID' })
  @ApiResponse({ status: 200, description: 'Return the users.' })
  @ApiResponse({ status: 404, description: 'Users not found.' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a users' })
  @ApiParam({ name: 'id', description: 'Users ID' })
  @ApiResponse({ status: 200, description: 'The users has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Users not found.' })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUsersDto: UpdateUsersDto) {
    return this.usersService.update(id, updateUsersDto);
  }

  @ApiOperation({ summary: 'Delete a users' })
  @ApiParam({ name: 'id', description: 'Users ID' })
  @ApiResponse({ status: 200, description: 'The users has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Users not found.' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}