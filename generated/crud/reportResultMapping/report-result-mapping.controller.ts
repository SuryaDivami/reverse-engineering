import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ParseIntPipe } from '@nestjs/common';
import { ReportResultMappingService } from './report-result-mapping.service';
import { CreateReportResultMappingDto } from './dto/create-report-result-mapping.dto';
import { UpdateReportResultMappingDto } from './dto/update-report-result-mapping.dto';
import { QueryReportResultMappingDto } from './dto/query-report-result-mapping.dto';

@ApiTags('report-result-mapping')
@Controller('report-result-mapping')
export class ReportResultMappingController {
  constructor(private readonly reportResultMappingService: ReportResultMappingService) {}

  @ApiOperation({ summary: 'Create a new reportresultmapping' })
  @ApiResponse({ status: 201, description: 'The reportresultmapping has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Post()
  create(@Body() createReportResultMappingDto: CreateReportResultMappingDto) {
    return this.reportResultMappingService.create(createReportResultMappingDto);
  }

  @ApiOperation({ summary: 'Get all reportresultmappings' })
  @ApiResponse({ status: 200, description: 'Return all reportresultmappings.' })
  @Get()
  findAll(@Query() queryDto: QueryReportResultMappingDto) {
    return this.reportResultMappingService.findAll(queryDto);
  }

  @ApiOperation({ summary: 'Get a reportresultmapping by id' })
  @ApiParam({ name: 'id', description: 'ReportResultMapping ID' })
  @ApiResponse({ status: 200, description: 'Return the reportresultmapping.' })
  @ApiResponse({ status: 404, description: 'ReportResultMapping not found.' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reportResultMappingService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a reportresultmapping' })
  @ApiParam({ name: 'id', description: 'ReportResultMapping ID' })
  @ApiResponse({ status: 200, description: 'The reportresultmapping has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'ReportResultMapping not found.' })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateReportResultMappingDto: UpdateReportResultMappingDto) {
    return this.reportResultMappingService.update(id, updateReportResultMappingDto);
  }

  @ApiOperation({ summary: 'Delete a reportresultmapping' })
  @ApiParam({ name: 'id', description: 'ReportResultMapping ID' })
  @ApiResponse({ status: 200, description: 'The reportresultmapping has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'ReportResultMapping not found.' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reportResultMappingService.remove(id);
  }
}