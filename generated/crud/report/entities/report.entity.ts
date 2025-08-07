import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsDate } from 'class-validator';

@Entity('report')
export class Report {

  @PrimaryGeneratedColumn()
  @ApiProperty()
  @IsNumber()
  id: number;

  @Column({ length: 255, nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string | null;

  @Column({ length: 255, nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  label?: string | null;

  @Column({ name: 'end_point', length: 255, nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  endPoint?: string | null;

  @Column({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  query?: string | null;

  @CreateDateColumn()
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  createdAt?: Date | null;

  @UpdateDateColumn()
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  updatedAt?: Date | null;

  @Column({ name: 'deleted_at', nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  deletedAt?: Date | null;

  @Column({ name: 'created_by', length: 255, nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  createdBy?: string | null;

  @Column({ name: 'updated_by', length: 255, nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  updatedBy?: string | null;

  @Column({ name: 'deleted_by', length: 255, nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  deletedBy?: string | null;

  @Column({ name: 'order_no', nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  orderNo?: number | null;
}