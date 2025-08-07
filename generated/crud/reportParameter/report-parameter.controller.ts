import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ParseIntPipe } from '@nestjs/common';
import { ReportParameterService } from './report-parameter.service';
import { CreateReportParameterDto } from './dto/create-report-parameter.dto';
import { UpdateReportParameterDto } from './dto/update-report-parameter.dto';
import { QueryReportParameterDto } from './dto/query-report-parameter.dto';

@ApiTags('report-parameter')
@Controller('report-parameter')
export class ReportParameterController {
  constructor(private readonly reportParameterService: ReportParameterService) {}

  @ApiOperation({ summary: 'Create a new reportparameter' })
  @ApiResponse({ status: 201, description: 'The reportparameter has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Post()
  create(@Body() createReportParameterDto: CreateReportParameterDto) {
    return this.reportParameterService.create(createReportParameterDto);
  }

  @ApiOperation({ summary: 'Get all reportparameters' })
  @ApiResponse({ status: 200, description: 'Return all reportparameters.' })
  @Get()
  findAll(@Query() queryDto: QueryReportParameterDto) {
    return this.reportParameterService.findAll(queryDto);
  }

  @ApiOperation({ summary: 'Get a reportparameter by id' })
  @ApiParam({ name: 'id', description: 'ReportParameter ID' })
  @ApiResponse({ status: 200, description: 'Return the reportparameter.' })
  @ApiResponse({ status: 404, description: 'ReportParameter not found.' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reportParameterService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a reportparameter' })
  @ApiParam({ name: 'id', description: 'ReportParameter ID' })
  @ApiResponse({ status: 200, description: 'The reportparameter has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'ReportParameter not found.' })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateReportParameterDto: UpdateReportParameterDto) {
    return this.reportParameterService.update(id, updateReportParameterDto);
  }

  @ApiOperation({ summary: 'Delete a reportparameter' })
  @ApiParam({ name: 'id', description: 'ReportParameter ID' })
  @ApiResponse({ status: 200, description: 'The reportparameter has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'ReportParameter not found.' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reportParameterService.remove(id);
  }
}