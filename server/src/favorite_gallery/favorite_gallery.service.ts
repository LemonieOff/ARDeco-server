import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import {  FindManyOptions, FindOptionsWhere, Repository  } from "typeorm";
import { FavoriteGallery } from "./models/favorite_gallery.entity";

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


    async findAll(
        user_id: number | null,
        limit: number | null,
        begin_pos: number | null
    ): Promise<FavoriteGallery[]> {
        let where: FindOptionsWhere<FavoriteGallery> = { /*visibility: true*/ }; // Public items only
        if (user_id) {
            where = {
                ...where,
                user_id: user_id
            };
        }

        let options: FindManyOptions<FavoriteGallery> = { where: where };
        if (limit) {
            options = {
                ...options,
                take: limit
            };
        }
        if (begin_pos && limit) {
            options = {
                ...options,
                skip: begin_pos
            };
        }
        return this.favoriteGalleryRepository.find(options);
    }
    async findOne(where: FindOptionsWhere<FavoriteGallery>): Promise<FavoriteGallery> {
        return this.favoriteGalleryRepository.findOne({ where: where });
    }


    async delete(id: number): Promise<any> {
        return this.favoriteGalleryRepository
            .createQueryBuilder("gallery")
            .delete()
            .from(FavoriteGallery)
            .where("id = id", { id: id }) // chamger id par furniture Id
            .execute();
    }
}
