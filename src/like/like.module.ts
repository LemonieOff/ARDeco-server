import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "../user/user.module";
import { Like } from "./models/like.entity";
import { GalleryModule } from "../gallery/gallery.module";
import { LikeService } from "./like.service";
import { LikeController } from "./like.controller";
import { BlockedUsersModule } from "../blocked_users/blocked_users.module";

@Module({
    imports: [
        UserModule,
        TypeOrmModule.forFeature([Like]),
        JwtModule.register({
            secret: "secret"
        }),
        GalleryModule,
        BlockedUsersModule
    ],
    controllers: [LikeController],
    providers: [LikeService],
    exports: [LikeService]
})
export class LikeModule {
}
