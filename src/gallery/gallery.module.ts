import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Gallery } from "./models/gallery.entity";
import { GalleryController } from "./gallery.controller";
import { GalleryService } from "./gallery.service";
import { UserModule } from "../user/user.module";
import { BlockedUsersModule } from "../blocked_users/blocked_users.module";

@Module({
    imports: [
        UserModule,
        TypeOrmModule.forFeature([Gallery]),
        JwtModule.register({
            secret: "secret"
        }),
        BlockedUsersModule
    ],
    controllers: [GalleryController],
    providers: [GalleryService],
    exports: [GalleryService]
})
export class GalleryModule {}
