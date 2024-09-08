import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Changelog } from "./models/changelog.entity";
import { ChangelogController } from "./changelog.controller";
import { ChangelogService } from "./changelog.service";
import { UserModule } from "../user/user.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Changelog]),
        UserModule,
        JwtModule.register({
            secret: "secret"
        })
    ],
    controllers: [ChangelogController],
    providers: [ChangelogService],
    exports: [ChangelogService]
})
export class ChangelogModule {}
