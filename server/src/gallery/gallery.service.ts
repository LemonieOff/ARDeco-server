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
        const item = this.galleryRepository.save(data)
        console.log('Create gallery item :', await item)
        return item
    }

    async findOne(condit): Promise<Gallery> {
        return this.galleryRepository.findOne({where: condit})
    }

    async update(id: number, data: QueryPartialEntity<Gallery>): Promise<UpdateResult> {
        return this.galleryRepository.update(id, data)
    }

    async delete(id: number): Promise<any> {
        //return this.userRepository.delete(id);
        console.log("Deleting gallery item", id)
        await this.galleryRepository.createQueryBuilder('gallery').delete().from(Gallery).where("id = id", {id: id}).execute()
    }
}
