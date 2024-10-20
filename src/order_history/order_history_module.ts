import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderHistory } from "./models/order_history.entity";
import { OrderHistoryController } from "./order_history_controller";
import { OrderHistoryService } from "./order_history_service";
import { UserModule } from "../user/user.module";
import { CartModule } from "../cart/cart.module";

@Module({
    imports: [
        UserModule,
        TypeOrmModule.forFeature([OrderHistory]),
        JwtModule.register({
            secret: "secret"
        }),
        CartModule
    ],
    controllers: [OrderHistoryController],
    providers: [OrderHistoryService],
    exports: [OrderHistoryService]
})
export class OrderHistoryModule {
}
