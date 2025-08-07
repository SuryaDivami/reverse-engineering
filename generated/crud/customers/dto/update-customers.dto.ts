import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomersDto } from './create-customers.dto';

export class UpdateCustomersDto extends PartialType(CreateCustomersDto) {}