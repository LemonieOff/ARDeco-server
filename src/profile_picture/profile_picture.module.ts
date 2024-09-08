import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ProfilePictureController } from "./profile_picture.controller";
import { UserModule } from "../user/user.module";

@Module({
    imports: [
        UserModule,
        JwtModule.register({
            secret: "secret"
        })
    ],
    controllers: [ProfilePictureController],
/*    providers: [ProfilePictureService],
    exports: [ProfilePictureService]*/
})
export class ProfilePictureModule {}
