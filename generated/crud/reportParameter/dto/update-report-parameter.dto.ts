import { PartialType } from '@nestjs/mapped-types';
import { CreateReportParameterDto } from './create-report-parameter.dto';

export class UpdateReportParameterDto extends PartialType(CreateReportParameterDto) {}