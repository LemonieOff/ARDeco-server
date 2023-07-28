import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { MailModule } from '../mail/mail.module';
import { GoogleStrategy } from './google.strategy';
import { CartModule } from 'src/cart/cart.module';
import { CartService } from 'src/cart/cart.service';

@Module({
    imports: [
        UserModule,
        MailModule,
        CartModule,
        JwtModule.register({
            secret: "secret",
            signOptions: { expiresIn: '1d' },
          }),
    ],
    controllers: [
        AuthController
    ],
    providers: [
        GoogleStrategy
    ]
})
export class AuthModule {}
