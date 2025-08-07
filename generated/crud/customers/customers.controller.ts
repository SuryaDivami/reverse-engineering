import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ParseIntPipe } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomersDto } from './dto/create-customers.dto';
import { UpdateCustomersDto } from './dto/update-customers.dto';
import { QueryCustomersDto } from './dto/query-customers.dto';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @ApiOperation({ summary: 'Create a new customers' })
  @ApiResponse({ status: 201, description: 'The customers has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Post()
  create(@Body() createCustomersDto: CreateCustomersDto) {
    return this.customersService.create(createCustomersDto);
  }

  @ApiOperation({ summary: 'Get all customerss' })
  @ApiResponse({ status: 200, description: 'Return all customerss.' })
  @Get()
  findAll(@Query() queryDto: QueryCustomersDto) {
    return this.customersService.findAll(queryDto);
  }

  @ApiOperation({ summary: 'Get a customers by id' })
  @ApiParam({ name: 'id', description: 'Customers ID' })
  @ApiResponse({ status: 200, description: 'Return the customers.' })
  @ApiResponse({ status: 404, description: 'Customers not found.' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a customers' })
  @ApiParam({ name: 'id', description: 'Customers ID' })
  @ApiResponse({ status: 200, description: 'The customers has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Customers not found.' })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCustomersDto: UpdateCustomersDto) {
    return this.customersService.update(id, updateCustomersDto);
  }

  @ApiOperation({ summary: 'Delete a customers' })
  @ApiParam({ name: 'id', description: 'Customers ID' })
  @ApiResponse({ status: 200, description: 'The customers has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Customers not found.' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.remove(id);
  }
}