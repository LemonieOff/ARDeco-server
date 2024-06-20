import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository, UpdateResult } from "typeorm";
import { Comment } from "./models/comment.entity";
import { QueryPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>
    ) {}

    async all(): Promise<Comment[]> {
        return this.commentRepository.find();
    }

    async allForGallery(gallery_id: number): Promise<Comment[]> {
        return this.commentRepository.find({
            where: {
                gallery: {
                    id: gallery_id
                }
            }
        });
    }

    async create(data: Partial<Comment>): Promise<Comment> {
        const comment = await this.commentRepository.save(data);
        console.log("Create comment :", comment);
        return comment;
    }

    async delete(id: number): Promise<any> {
        console.log("Deleting comment ", id);
        return this.commentRepository.delete(id);
    }
}
