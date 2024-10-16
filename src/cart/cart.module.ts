import { Module } from "@nestjs/common";
import { CartService } from "./cart.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CartController } from "./cart.controller";
import { Cart } from "./models/cart.entity";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "src/user/user.module";
import { CatalogModule } from "src/catalog/catalog.module";
import { CartItem } from "./models/cart_item.entity";

@Module({
    imports: [
        UserModule,
        CatalogModule,
        TypeOrmModule.forFeature([Cart]),
        TypeOrmModule.forFeature([CartItem]),
        JwtModule.register({
            secret: "secret"
        })
    ],
    providers: [CartService],
    controllers: [CartController],
    exports: [CartService]
})
export class CartModule {
}
