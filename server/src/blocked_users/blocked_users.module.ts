import { Module } from '@nestjs/common';
import { BlockedUsersService } from './blocked_users.service';
import { BlockedUsersController } from './blocked_users.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlockedUser } from "./entities/blocked_user.entity";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "../user/user.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([BlockedUser]),
        UserModule,
        JwtModule.register({
            secret: "secret",
            signOptions: { expiresIn: "1d" }
        })
    ],
    controllers: [BlockedUsersController],
    providers: [BlockedUsersService],
    exports: [BlockedUsersService]
})
export class BlockedUsersModule {}
