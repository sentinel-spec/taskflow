import { PartialType } from '@nestjs/mapped-types';
import { CreateIssueDraftDto } from './create-issue-draft.dto';

export class UpdateIssueDraftDto extends PartialType(CreateIssueDraftDto) {}
