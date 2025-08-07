import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ParseIntPipe } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSalesDto } from './dto/create-sales.dto';
import { UpdateSalesDto } from './dto/update-sales.dto';
import { QuerySalesDto } from './dto/query-sales.dto';

@ApiTags('sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @ApiOperation({ summary: 'Create a new sales' })
  @ApiResponse({ status: 201, description: 'The sales has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Post()
  create(@Body() createSalesDto: CreateSalesDto) {
    return this.salesService.create(createSalesDto);
  }

  @ApiOperation({ summary: 'Get all saless' })
  @ApiResponse({ status: 200, description: 'Return all saless.' })
  @Get()
  findAll(@Query() queryDto: QuerySalesDto) {
    return this.salesService.findAll(queryDto);
  }

  @ApiOperation({ summary: 'Get a sales by id' })
  @ApiParam({ name: 'id', description: 'Sales ID' })
  @ApiResponse({ status: 200, description: 'Return the sales.' })
  @ApiResponse({ status: 404, description: 'Sales not found.' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a sales' })
  @ApiParam({ name: 'id', description: 'Sales ID' })
  @ApiResponse({ status: 200, description: 'The sales has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Sales not found.' })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSalesDto: UpdateSalesDto) {
    return this.salesService.update(id, updateSalesDto);
  }

  @ApiOperation({ summary: 'Delete a sales' })
  @ApiParam({ name: 'id', description: 'Sales ID' })
  @ApiResponse({ status: 200, description: 'The sales has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Sales not found.' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.remove(id);
  }
}