import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
    And,
    FindManyOptions,
    FindOptionsRelations,
    FindOptionsSelect,
    FindOptionsWhere,
    In,
    Not,
    Repository
} from "typeorm";
import { Gallery } from "./models/gallery.entity";
import { QueryPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { BlockedUsersService } from "../blocked_users/blocked_users.service";

@Injectable()
export class GalleryService {
    constructor(
        @InjectRepository(Gallery)
        private readonly galleryRepository: Repository<Gallery>,
        private blockedUsersService: BlockedUsersService
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

    async findOne(
        where: FindOptionsWhere<Gallery>,
        relations: FindOptionsRelations<Gallery> = {},
        select: FindOptionsSelect<Gallery> = {},
        loadIds: boolean = false
    ): Promise<Gallery> {
        return this.galleryRepository.findOne({
            where: where,
            relations: relations,
            loadRelationIds: loadIds,
            loadEagerRelations: false,
            select: select
        });
    }

    async findOneById(
        id: number,
        relations: FindOptionsRelations<Gallery>,
        select: FindOptionsSelect<Gallery> = {}
    ) {
        return this.findOne({ id: id }, relations, select);
    }

    // TODO : Blocked users restriction (comments)
    async findOneRestricted(
        fetcher_id: number,
        id: number,
        relations: FindOptionsRelations<Gallery> = {},
        select: FindOptionsSelect<Gallery> = {},
        loadIds: boolean = false
    ): Promise<Gallery> {
        const [blocked, blocking] = await this.blockedUsersService.findByBlockedAndBlocking(fetcher_id);

        return this.galleryRepository.findOne({
            where: {
                id: id,
                visibility: true,
                user_id: And(Not(In(blocked)), Not(In(blocking)))
            },
            relations: relations,
            loadRelationIds: loadIds,
            loadEagerRelations: false,
            select: select
        });
    }

    // TODO : Blocked users restriction (comments)
    async findAll(
        fetcher_id: number,
        user_id: number | null,
        limit: number | null,
        begin_pos: number | null,
        relations: FindOptionsRelations<Gallery> = {},
        select: FindOptionsSelect<Gallery> = {},
        loadIds: boolean = false
    ): Promise<Gallery[]> {
        const [blocked, blocking] = await this.blockedUsersService.findByBlockedAndBlocking(fetcher_id);

        let where: FindOptionsWhere<Gallery> = { visibility: true }; // Public items only
        if (user_id) {
            if (blocked.includes(user_id) || blocking.includes(user_id)) return [];
            where = {
                ...where,
                user_id: user_id
            };
        } else {
            where = {
                ...where,
                user_id: And(Not(In(blocked)), Not(In(blocking)))
            };
        }

        let options: FindManyOptions<Gallery> = {
            where: where,
            relations: relations,
            loadRelationIds: loadIds,
            loadEagerRelations: false,
            select: select
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

    // TODO : Blocked users restriction (gallery + comments)
    async findForUser(user_id: number, visibility: boolean): Promise<Gallery[]> {
        let visibilityQuery = visibility === false ? { user_id: user_id } : {
            user_id: user_id,
            visibility: visibility
        };

        return this.galleryRepository.find({
            where: visibilityQuery,
            relations: {
                user: {
                    settings: true
                },
                comments: true
            },
            loadEagerRelations: false,
            loadRelationIds: false,
            select: {
                id: true,
                visibility: true,
                description: true,
                furniture: true,
                name: true,
                room_type: true,
                comments: true,
                user: {
                    id: true,
                    role: true,
                    first_name: true,
                    last_name: true,
                    profile_picture_id: true,
                    settings: {
                        display_lastname_on_public: true
                    }
                }
            }
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
