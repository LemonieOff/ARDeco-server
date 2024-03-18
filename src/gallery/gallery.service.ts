import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, FindOptionsRelations, FindOptionsWhere, Repository } from "typeorm";
import { Gallery } from "./models/gallery.entity";
import { QueryPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class GalleryService {
    constructor(
        @InjectRepository(Gallery)
        private readonly galleryRepository: Repository<Gallery>
    ) {
    }

    async create(data): Promise<Gallery> {
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
        return await this.galleryRepository.save(data);
    }

    async findOne(where: FindOptionsWhere<Gallery>, options: [FindOptionsRelations<Gallery>, string[]] = [{}, []]): Promise<Gallery> {
        const [relations, idsLoads] = options;
        return this.galleryRepository.findOne({
            where: where,
            relations: relations,
            loadRelationIds: {
                relations: idsLoads
            }
        });
    }

    async findAll(
        user_id: number | null,
        limit: number | null,
        begin_pos: number | null,
        relationOptions: [FindOptionsRelations<Gallery>, string[]] = [{}, []]
    ): Promise<Gallery[]> {
        const [relations, idsLoads] = relationOptions;
        let where: FindOptionsWhere<Gallery> = { visibility: true }; // Public items only
        if (user_id) {
            where = {
                ...where,
                user_id: user_id
            };
        }

        let options: FindManyOptions<Gallery> = {
            where: where,
            relations: relations,
            loadRelationIds: {
                relations: idsLoads
            }
        };
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
        return this.galleryRepository.find(options);
    }

    async findForUser(user_id: number, visibility: boolean) {
        let visibilityQuery = visibility === false ? { user_id: user_id } : {
            user_id: user_id,
            visibility: visibility
        };

        return this.galleryRepository.find({
            where: visibilityQuery
        });
    }

    async update(
        id: number,
        data: QueryPartialEntity<Gallery>
    ): Promise<Gallery> {
        await this.galleryRepository.update(id, data);
        return await this.findOne({ id: id });
    }

    async delete(id: number): Promise<any> {
        return this.galleryRepository
            .createQueryBuilder("gallery")
            .delete()
            .from(Gallery)
            .where("id = id", { id: id })
            .execute();
    }
}
