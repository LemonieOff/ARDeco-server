import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { MailModule } from '../mail/mail.module';
import { CartModule } from 'src/cart/cart.module';
// import { AuthService } from './auth.service';
import { Reset } from './models/password_reset.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSettingsModule } from "../user_settings/user_settings_module";

@Module({
    imports: [
        // TypeOrmModule.forFeature([Reset]),
        UserModule,
        MailModule,
        CartModule,
        UserSettingsModule,
        JwtModule.register({
            secret: "secret",
        })
    ],
    controllers: [
        AuthController
    ],
    providers: [
        // AuthService
    ]
})
export class AuthModule {}
