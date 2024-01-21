import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import {  FindManyOptions, FindOptionsWhere, Repository  } from "typeorm";
import { FavoriteFurniture } from "./models/favorite_furniture.entity";

@Injectable()
export class FavoriteFurnitureService {
    constructor(
        @InjectRepository(FavoriteFurniture)
        private readonly favoriteFurnitureRepository: Repository<FavoriteFurniture>
    ) {}

    // async create(data): Promise<FavoriteFurniture> {
    //     try {
    //         JSON.parse(data.furniture);
    //     } catch (e) {
    //         return await new Promise((_, reject) => {
    //             reject({
    //                 error: "JsonError",
    //                 message: "Furniture is not a valid JSON object",
    //                 furniture: data.furniture
    //             });
    //         });
    //     }
    //     const item = await this.favoriteFurnitureRepository.save(data);
    //     console.log("Create favorite_furniture item :", item);
    //     return item;
    // }
    
    // async findAll(
    //     user_id: number | null,
    //     limit: number | null,
    //     begin_pos: number | null
    // ): Promise<FavoriteFurniture[]> {
    //     let where: FindOptionsWhere<FavoriteFurniture> = { /*visibility: true*/ }; // Public items only
    //     if (user_id) {
    //         where = {
    //             ...where,
    //             user_id: user_id
    //         };
    //     }

    //     let options: FindManyOptions<FavoriteFurniture> = { where: where };
    //     if (limit) {
    //         options = {
    //             ...options,
    //             take: limit
    //         };
    //     }
    //     if (begin_pos && limit) {
    //         options = {
    //             ...options,
    //             skip: begin_pos
    //         };
    //     }
    //     return this.favoriteFurnitureRepository.find(options);
    // }
    // async findOne(where: FindOptionsWhere<FavoriteFurniture>): Promise<FavoriteFurniture> {
    //     return this.favoriteFurnitureRepository.findOne({ where: where });
    // }


    // async delete(id: number): Promise<any> {
    //     return this.favoriteFurnitureRepository
    //         .createQueryBuilder("gallery")
    //         .delete()
    //         .from(FavoriteFurniture)
    //         .where("id = id", { id: id })
    //         .execute();
    // } 
}
