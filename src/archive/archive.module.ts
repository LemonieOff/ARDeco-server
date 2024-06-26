import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "../user/user.module";
import { ArchiveService } from "./archive.service";
import { ArchiveController } from "./archive.controller";
import { Archive } from "./models/archive.entity";
import { CatalogModule } from "../catalog/catalog.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Archive]),
        JwtModule.register({
            secret: "secret"
        }),
        UserModule,
        forwardRef(() => CatalogModule)
    ],
    controllers: [ArchiveController],
    providers: [ArchiveService],
    exports: [ArchiveService]
})
export class ArchiveModule {}
