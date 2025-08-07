import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsDate } from 'class-validator';

@Entity('customers')
export class Customers {

  @PrimaryGeneratedColumn()
  @ApiProperty()
  @IsNumber()
  id: number;

  @Column({ length: 255 })
  @ApiProperty()
  @IsString()
  name: string;

  @Column({ length: 255 })
  @ApiProperty()
  @IsString()
  email: string;

  @Column({ length: 50 })
  @ApiProperty()
  @IsString()
  status: string;

  @CreateDateColumn()
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  createdAt?: Date | null;
}