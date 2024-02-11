import { Module } from "@nestjs/common";
import { FavoriteFurnitureService } from "./favorite_furniture.service";
import { FavoriteFurnitureController } from "./favorite_furniture.controller";
import { UserModule } from "../user/user.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { FavoriteFurniture } from "./models/favorite_furniture.entity";
import { CatalogModule } from "../catalog/catalog.module";

@Module({
    imports: [
        UserModule,
        TypeOrmModule.forFeature([FavoriteFurniture]),
        JwtModule.register({
            secret: "secret",
            signOptions: { expiresIn: "1d" }
        }),
        CatalogModule
    ],
    controllers: [FavoriteFurnitureController],
    providers: [FavoriteFurnitureService],
    exports: [FavoriteFurnitureService]
})
export class FavoriteFurnitureModule {}
