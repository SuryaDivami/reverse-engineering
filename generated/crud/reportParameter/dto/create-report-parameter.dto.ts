import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsDate } from 'class-validator';

export class CreateReportParameterDto {

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  reportId?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parameterName?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dataType?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  deletedAt?: Date | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  createdBy?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  updatedBy?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deletedBy?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  queryParameter?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  inputFieldType?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  optionType?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  option?: any | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  orderNo?: number | null;
}