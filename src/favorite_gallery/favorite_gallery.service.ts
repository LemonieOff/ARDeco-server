import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, FindOptionsWhere, Repository } from "typeorm";
import { FavoriteGallery } from "./models/favorite_gallery.entity";

@Injectable()
export class FavoriteGalleryService {
    constructor(
        @InjectRepository(FavoriteGallery)
        private readonly favoriteGalleryRepository: Repository<FavoriteGallery>
    ) {
    }

    async create(data): Promise<FavoriteGallery> {
        const item = await this.favoriteGalleryRepository.save(data);
        console.log("Create favorite_gallery item :", item);
        return item;
    }

    // TODO : Include relations/select as from gallery entity/service/controller (make true entity database relations)
    async findAll(
        user_id: number | null = null
    ): Promise<FavoriteGallery[]> {
        let where: FindOptionsWhere<FavoriteGallery> = { /*visibility: true*/ }; // Public items only
        if (user_id) {
            where = {
                ...where,
                user_id: user_id
            };
        }

        let options: FindManyOptions<FavoriteGallery> = { where: where };

        return this.favoriteGalleryRepository.find(options);
    }

    async findOne(where: FindOptionsWhere<FavoriteGallery>): Promise<FavoriteGallery> {
        return this.favoriteGalleryRepository.findOne({ where: where });
    }


    async delete(gallery_id: number): Promise<any> {
        return this.favoriteGalleryRepository.delete({ gallery_id: gallery_id });
    }
}
