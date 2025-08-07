import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryReportParameterDto {

  @ApiPropertyOptional({ description: 'Page number for pagination' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @ApiPropertyOptional({ description: 'Number of items per page' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  limit?: number;

  @ApiPropertyOptional({ description: 'Filter by parameter_name' })
  @IsOptional()
  @IsString()
  parameterName?: string;

  @ApiPropertyOptional({ description: 'Filter by label' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ description: 'Filter by data_type' })
  @IsOptional()
  @IsString()
  dataType?: string;

  @ApiPropertyOptional({ description: 'Filter by created_by' })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiPropertyOptional({ description: 'Filter by updated_by' })
  @IsOptional()
  @IsString()
  updatedBy?: string;

  @ApiPropertyOptional({ description: 'Filter by deleted_by' })
  @IsOptional()
  @IsString()
  deletedBy?: string;

  @ApiPropertyOptional({ description: 'Filter by query_parameter' })
  @IsOptional()
  @IsString()
  queryParameter?: string;

  @ApiPropertyOptional({ description: 'Filter by input_field_type' })
  @IsOptional()
  @IsString()
  inputFieldType?: string;

  @ApiPropertyOptional({ description: 'Filter by option_type' })
  @IsOptional()
  @IsString()
  optionType?: string;

  @ApiPropertyOptional({ description: 'Field to sort by' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort direction', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}