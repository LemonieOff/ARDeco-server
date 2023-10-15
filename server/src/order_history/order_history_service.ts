import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OrderHistory } from "./models/order_history.entity";

@Injectable()
export class OrderHistoryService {
    constructor(
        @InjectRepository(OrderHistory)
        private readonly orderHistoryRepository: Repository<OrderHistory>
    ) {}

    async all(): Promise<OrderHistory[]> {
        return this.orderHistoryRepository.find();
    }

    async create(data): Promise<OrderHistory> {
        try {
            JSON.parse(data.furniture);
        } catch (e) {
            return await new Promise((_, reject) => {
                reject({
                    error: "JsonError",
                    message: "Furniture is not a valid JSON object",
                    furniture: data.furniture
                });
            });
        }

        /*TODO : Potentially check if every furniture is available in catalog. 
           See if it's relevant based on the manner we pass furniture list
           Also, see if it will be possible to register order history items after a furniture item has been removed from catalog*/

        const item = await this.orderHistoryRepository.save(data);
        console.log("Create OrderHistory item :", item);
        return item;
    }

    async findOne(condit): Promise<OrderHistory> {
        return this.orderHistoryRepository.findOne({ where: condit });
    }
}
