import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { MailModule } from '../mail/mail.module';
import { GoogleStrategy } from './google.strategy';
import { CartModule } from 'src/cart/cart.module';
import { CartService } from 'src/cart/cart.service';
import { AuthService } from './auth.service';
import { Reset } from './models/password_reset.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forFeature([Reset]),
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
        GoogleStrategy, AuthService
    ]
})
export class AuthModule {}
