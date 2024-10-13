import { UserSettings } from "./user_settings.entity";
import { IsBoolean, IsOptional } from "@nestjs/class-validator";

export class UserSettingsDto implements Partial<UserSettings> {
    @IsOptional()
    @IsBoolean()
    display_email_on_public_profile: boolean;

    @IsOptional()
    @IsBoolean()
    display_lastname_on_public_profile: boolean;

    @IsOptional()
    @IsBoolean()
    automatic_new_gallery_share: boolean;
}
