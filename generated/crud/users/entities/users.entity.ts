import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsDate } from 'class-validator';

@Entity('users')
export class Users {

  @Column()
  @ApiProperty()
  @IsString()
  id: string;

  @Column({ length: 255 })
  @ApiProperty()
  @IsString()
  name: string;

  @Column({ length: 255 })
  @ApiProperty()
  @IsString()
  email: string;

  @Column({ length: 255 })
  @ApiProperty()
  @IsString()
  password: string;

  @Column({ name: 'mobile_no', length: 255, nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mobileNo?: string | null;

  @Column({ name: 'profile_image', length: 255, nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  profileImage?: string | null;

  @Column({ length: 255, nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string | null;

  @Column({ length: 255, nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string | null;

  @Column({ length: 255 })
  @ApiProperty()
  @IsString()
  role: string;

  @CreateDateColumn()
  @ApiProperty()
  @IsDate()
  createdat: Date;

  @UpdateDateColumn()
  @ApiProperty()
  @IsDate()
  updatedat: Date;
}