import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { Order } from "./models/order.entity";
import { User } from "../user/models/user.entity";
import { CartOrderResponseDto } from "../cart/dtos/CartOrderResponse.dto";

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orderHistoryRepository: Repository<Order>
    ) {
    }

    async all(): Promise<Order[]> {
        return this.orderHistoryRepository.find();
    }

    async allIds(): Promise<number[]> {
        return (await this.orderHistoryRepository.find()).map((item) => item.id);
    }

    async create(user: User, cart: CartOrderResponseDto): Promise<Order> {
        const order = new Order();
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

        return await this.orderHistoryRepository.save(order);
    }

    async findOne(condit: FindOptionsWhere<Order>): Promise<Order> {
        return this.orderHistoryRepository.findOne({ where: condit });
    }

    async find(condit: FindOptionsWhere<Order>): Promise<Order[]> {
        return this.orderHistoryRepository.find({ where: condit });
    }
}
