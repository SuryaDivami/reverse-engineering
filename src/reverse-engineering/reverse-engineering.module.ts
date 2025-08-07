/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ReverseEngineeringService } from './reverse-engineering.service';
import { ReverseEngineeringController } from './reverse-engineering.controller';

@Module({
  controllers: [ReverseEngineeringController],
  providers: [ReverseEngineeringService],
  exports: [ReverseEngineeringService]
})
export class ReverseEngineeringModule {}
