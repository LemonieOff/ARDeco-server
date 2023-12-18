import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FavoriteGallery } from "./models/favorite_Gallery.entity";

@Injectable()
export class FavoriteGalleryService {
    constructor(
        @InjectRepository(FavoriteGallery)
        private readonly favoriteGalleryRepository: Repository<FavoriteGallery>
    ) {}

    async create(data): Promise<FavoriteGallery> {
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
        const item = await this.favoriteGalleryRepository.save(data);
        console.log("Create favorite_gallery item :", item);
        return item;
    }
}
