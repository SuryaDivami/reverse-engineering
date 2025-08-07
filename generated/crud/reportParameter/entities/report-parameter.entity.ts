import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsDate } from 'class-validator';

@Entity('report_parameter')
export class ReportParameter {

  @PrimaryGeneratedColumn()
  @ApiProperty()
  @IsNumber()
  id: number;

  @Column({ name: 'report_id', nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  reportId?: number | null;

  @Column({ name: 'parameter_name', length: 255, nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  parameterName?: string | null;

  @Column({ length: 255, nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  label?: string | null;

  @Column({ name: 'data_type', length: 100, nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dataType?: string | null;

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

  @Column({ name: 'query_parameter', length: 255, nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  queryParameter?: string | null;

  @Column({ name: 'input_field_type', length: 100, nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  inputFieldType?: string | null;

  @Column({ name: 'option_type', length: 100, nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  optionType?: string | null;

  @Column({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  option?: any | null;

  @Column({ name: 'order_no', nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  orderNo?: number | null;
}