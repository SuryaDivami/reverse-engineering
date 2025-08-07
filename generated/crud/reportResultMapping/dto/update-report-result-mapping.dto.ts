import { PartialType } from '@nestjs/mapped-types';
import { CreateReportResultMappingDto } from './create-report-result-mapping.dto';

export class UpdateReportResultMappingDto extends PartialType(CreateReportResultMappingDto) {}