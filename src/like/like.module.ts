import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "../user/user.module";
import { Like } from "./models/like.entity";
import { GalleryModule } from "../gallery/gallery.module";
import { LikeService } from "./like.service";

@Module({
    imports: [
        UserModule,
        TypeOrmModule.forFeature([Like]),
        JwtModule.register({
            secret: "secret"
        }),
        GalleryModule
    ],
    controllers: [LikeController],
    providers: [LikeService],
    exports: [LikeService]
})
export class LikeModule {
}
