import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "../user/user.module";
import { ArchiveService } from "./archive.service";
import { ArchiveController } from "./archive.controller";
import { CatalogModule } from "../catalog/catalog.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Catalog } from "../catalog/models/catalog.entity";
import { CatalogStyles } from "../catalog/models/catalog_styles.entity";
import { CatalogRooms } from "../catalog/models/catalog_rooms.entity";
import { CatalogColors } from "../catalog/models/catalog_colors.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Catalog,
            CatalogColors,
            CatalogRooms,
            CatalogStyles
        ]),
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
