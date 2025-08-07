import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsDate } from 'class-validator';

export class CreateSalesDto {

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  customerId?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  region?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  amount?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  date?: Date | null;
}