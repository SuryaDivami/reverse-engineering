import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsDate } from 'class-validator';

@Entity('sales')
export class Sales {

  @PrimaryGeneratedColumn()
  @ApiProperty()
  @IsNumber()
  id: number;

  @Column({ name: 'customer_id', nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  customerId?: number | null;

  @Column({ length: 100, nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  region?: string | null;

  @Column({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  amount?: number | null;

  @Column({ default: () => "CURRENT_DATE", nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  date?: Date | null;
}