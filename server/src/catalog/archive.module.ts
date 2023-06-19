import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "../user/user.module";
import { ArchiveService } from "./archive.service";
import { ArchiveController } from "./archive.controller";
import { Archive } from "./models/archive.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Archive]),
        JwtModule.register({
            secret: "secret",
            signOptions: { expiresIn: "1d" }
        }),
        UserModule
    ],
    controllers: [ArchiveController],
    providers: [ArchiveService],
    exports: [ArchiveService]

})
export class ArchiveModule {
}
