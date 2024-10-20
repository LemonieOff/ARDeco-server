import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderHistory } from "./models/order_history.entity";
import { OrderHistoryController } from "./order_history_controller";
import { OrderHistoryService } from "./order_history_service";
import { UserModule } from "../user/user.module";
import { CartService } from "../cart/cart.service";

@Module({
    imports: [
        UserModule,
        TypeOrmModule.forFeature([OrderHistory]),
        JwtModule.register({
            secret: "secret"
        }),
        CartService
    ],
    controllers: [OrderHistoryController],
    providers: [OrderHistoryService],
    exports: [OrderHistoryService]
})
export class OrderHistoryModule {
}
