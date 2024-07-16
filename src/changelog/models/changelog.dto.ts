import { IsEmail, IsNotEmpty } from "@nestjs/class-validator";

export class ChangelogDto {
    @IsNotEmpty()
    version: string;

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    changelog: string;
}
