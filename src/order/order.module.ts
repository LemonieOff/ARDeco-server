import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "./models/order.entity";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { UserModule } from "../user/user.module";
import { CartModule } from "../cart/cart.module";

@Module({
    imports: [
        UserModule,
        TypeOrmModule.forFeature([Order]),
        JwtModule.register({
            secret: "secret"
        }),
        CartModule
    ],
    controllers: [OrderController],
    providers: [OrderService],
    exports: [OrderService]
})
export class OrderHistoryModule {
}
