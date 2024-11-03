import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsRelations, FindOptionsSelect, FindOptionsWhere, Repository } from "typeorm";
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

    async findAll(
        where: FindOptionsWhere<FavoriteGallery>,
        relations: FindOptionsRelations<FavoriteGallery> = {},
        select: FindOptionsSelect<FavoriteGallery> = {}
    ): Promise<FavoriteGallery[]> {
        return this.favoriteGalleryRepository.find({
            where: where,
            loadRelationIds: false,
            loadEagerRelations: false,
            relations: relations,
            select: select
        });
    }

    async findOne(where: FindOptionsWhere<FavoriteGallery>): Promise<FavoriteGallery> {
        return this.favoriteGalleryRepository.findOne({ where: where });
    }


    async delete(gallery_id: number): Promise<any> {
        return this.favoriteGalleryRepository.delete({ gallery_id: gallery_id });
    }
}
