import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { OrderHistory } from "./models/order_history.entity";
import { User } from "../user/models/user.entity";
import { CartOrderResponseDto } from "../cart/dtos/CartOrderResponse.dto";

@Injectable()
export class OrderHistoryService {
    constructor(
        @InjectRepository(OrderHistory)
        private readonly orderHistoryRepository: Repository<OrderHistory>
    ) {
    }

    async all(): Promise<OrderHistory[]> {
        return this.orderHistoryRepository.find();
    }

    async allIds(): Promise<number[]> {
        return (await this.orderHistoryRepository.find()).map((item) => item.id);
    }

    async create(user: User, cart: CartOrderResponseDto): Promise<OrderHistory> {
        const order = new OrderHistory();
        order.user = user;
        order.name = user.first_name + " " + user.last_name;
        order.total_amount = cart.total_amount;
        order.furniture = cart.items.map(item => ({
            id: item.furniture.id,
            amount: item.amount,
            quantity: item.quantity,
            color: item.furniture.color,
            color_id: item.furniture.color_id,
            price: item.furniture.price,
            company: item.furniture.company,
            name: item.furniture.name,
            object_id: item.furniture.object_id
        }));

        const item = await this.orderHistoryRepository.save(order);
        console.log("Create OrderHistory item :", item);
        return item;
    }

    async findOne(condit: FindOptionsWhere<OrderHistory>): Promise<OrderHistory> {
        return this.orderHistoryRepository.findOne({ where: condit });
    }

    async find(condit: FindOptionsWhere<OrderHistory>): Promise<OrderHistory[]> {
        return this.orderHistoryRepository.find({ where: condit });
    }
}
