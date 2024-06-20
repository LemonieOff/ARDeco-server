import { Module } from "@nestjs/common";
// import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Comment } from "./models/comment.entity";
import { CommentController } from "./comment.controller";
import { CommentService } from "./comment.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Comment]),
        // JwtModule
    ],
    controllers: [CommentController],
    providers: [CommentService],
    exports: [CommentService]
})
export class CommentModule {}
