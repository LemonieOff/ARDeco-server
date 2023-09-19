import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, UpdateResult} from "typeorm";
import {Gallery} from './models/gallery.entity';
import {QueryPartialEntity} from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class GalleryService {
    constructor(
        @InjectRepository(Gallery) private readonly galleryRepository: Repository<Gallery>,
    ) {
    }

    async all(): Promise<Gallery[]> {
        return this.galleryRepository.find();
    }

    async create(data): Promise<Gallery> {
        try {
            JSON.parse(data.furniture);
        } catch (e) {
            return await new Promise((_, reject) => {
                reject({
                    "error": "JsonError",
                    "message": "Furniture is not a valid JSON object",
                    "furniture": data.furniture,
                });
            });
        }
        const item = await this.galleryRepository.save(data);
        console.log('Create gallery item :', item);
        return item;
    }

    async findOne(condit): Promise<Gallery> {
        return this.galleryRepository.findOne({where: condit})
    }

    async update(id: number, data: QueryPartialEntity<Gallery>): Promise<Gallery> {
        await this.galleryRepository.update(id, data);
        return await this.findOne({id: id});
    }

    async delete(id: number): Promise<any> {
        //return this.userRepository.delete(id);
        console.log("Deleting gallery item", id)
        return this.galleryRepository.createQueryBuilder('gallery').delete().from(Gallery).where("id = id", {id: id}).execute()
    }
}
