import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Comment } from "./models/comment.entity";
import { CommentController } from "./comment.controller";
import { CommentService } from "./comment.service";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "../user/user.module";
import { GalleryModule } from "../gallery/gallery.module";
import { BlockedUsersModule } from "../blocked_users/blocked_users.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Comment]),
        JwtModule.register({ secret: "secret" }),
        UserModule,
        GalleryModule,
        BlockedUsersModule
    ],
    controllers: [CommentController],
    providers: [CommentService],
    exports: [CommentService]
})
export class CommentModule {}
