import { PartialType } from '@nestjs/mapped-types';
import { CreateBlockedUserDto } from './create-blocked_user.dto';

export class UpdateBlockedUserDto extends PartialType(CreateBlockedUserDto) {}
