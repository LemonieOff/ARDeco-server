import { UserSettings } from "./user_settings.entity";
import { IsOptional } from "@nestjs/class-validator";

export class UserSettingsCreateDto implements Partial<UserSettings> {
    @IsOptional()
    dark_mode: boolean;

    @IsOptional()
    language: string;

    @IsOptional()
    display_email_on_public_profile: boolean;

    @IsOptional()
    display_lastname_on_public_profile: boolean;

    @IsOptional()
    automatic_new_gallery_share: boolean;

    @IsOptional()
    sounds_enabled: boolean;

    @IsOptional()
    notifications_enabled: boolean;
}
