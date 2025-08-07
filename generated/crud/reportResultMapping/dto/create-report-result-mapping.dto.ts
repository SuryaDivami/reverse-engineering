import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsDate } from 'class-validator';

export class CreateReportResultMappingDto {

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  reportId?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  queryParameterName?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  variableName?: string | null;

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
  @IsString()
  alignment?: string | null;

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
}