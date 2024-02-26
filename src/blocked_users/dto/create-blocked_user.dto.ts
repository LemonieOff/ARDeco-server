import { IsNumber } from "@nestjs/class-validator";

export class CreateBlockedUserDto {
    @IsNumber()
    user_id: number;

    @IsNumber()
    blocked_user_id: number;
}
