import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Catalog } from "./models/catalog.entity";
import { CatalogController } from "./catalog.controller";
import { CatalogService } from "./catalog.service";
import { UserModule } from "../user/user.module";
import { ArchiveModule } from "../archive/archive.module";
import { CatalogColors } from "./models/catalog_colors.entity";
import { CatalogRooms } from "./models/catalog_rooms.entity";
import { CatalogStyles } from "./models/catalog_styles.entity";
import { CatalogValuesController } from "./catalog-values.controller";

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
        forwardRef(() => ArchiveModule)
    ],
    controllers: [CatalogController, CatalogValuesController],
    providers: [CatalogService],
    exports: [CatalogService]
})
export class CatalogModule {
}
