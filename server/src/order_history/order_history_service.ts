import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OrderHistory } from "./models/order_history.entity";
import { QueryPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class OrderHistoryService {
    constructor(
        @InjectRepository(OrderHistory) private readonly galleryRepository: Repository<OrderHistory>
    ) {
    }

    async all(): Promise<OrderHistory[]> {
        return this.galleryRepository.find();
    }

    async create(data): Promise<OrderHistory> {
        try {
            JSON.parse(data.furniture);
        } catch (e) {
            return await new Promise((_, reject) => {
                reject({
                    "error": "JsonError",
                    "message": "Furniture is not a valid JSON object",
                    "furniture": data.furniture
                });
            });
        }
        const item = await this.galleryRepository.save(data);
        console.log("Create OrderHistory item :", item);
        return item;
    }

    async findOne(condit): Promise<OrderHistory> {
        return this.galleryRepository.findOne({ where: condit });
    }

    async update(id: number, data: QueryPartialEntity<OrderHistory>): Promise<OrderHistory> {
        await this.galleryRepository.update(id, data);
        return await this.findOne({ id: id });
    }

    async delete(id: number): Promise<any> {
        console.log("Deleting OrderHistory item", id);
        return this.galleryRepository.createQueryBuilder("OrderHistory").delete().from(OrderHistory).where("id = id", { id: id }).execute();
    }
}
