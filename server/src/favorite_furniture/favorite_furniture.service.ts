import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FavoriteFurniture } from "./models/favorite_furniture.entity";

@Injectable()
export class FavoriteFurnitureService {
    constructor(
        @InjectRepository(FavoriteFurniture)
        private readonly favoriteFurnitureRepository: Repository<FavoriteFurniture>
    ) {}

    async create(data): Promise<FavoriteFurniture> {
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
        const item = await this.favoriteFurnitureRepository.save(data);
        console.log("Create favorite_furniture item :", item);
        return item;
    }
    // un create / delete et find
}
