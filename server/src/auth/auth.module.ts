import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [
        UserModule,
        MailModule,
        JwtModule.register({
            secret: "secret",
            signOptions: { expiresIn: '1d' },
          }),
    ],
    controllers: [
        AuthController
    ]
})
export class AuthModule {}
