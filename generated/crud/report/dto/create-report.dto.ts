import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsDate } from 'class-validator';

export class CreateReportDto {

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endPoint?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  query?: string | null;

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
  @IsNumber()
  orderNo?: number | null;
}