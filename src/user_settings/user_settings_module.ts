import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserSettings } from "./models/user_settings.entity";
import { UserSettingsController } from "./user_settings_controller";
import { UserSettingsService } from "./user_settings_service";
import { UserModule } from "../user/user.module";

@Module({
    imports: [
        UserModule,
        TypeOrmModule.forFeature([UserSettings]),
        JwtModule.register({
            secret: "secret"
        })
    ],
    controllers: [UserSettingsController],
    providers: [UserSettingsService],
    exports: [UserSettingsService]
})
export class UserSettingsModule {}
