import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Comment } from "./models/comment.entity";

@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>
    ) {
    }

    async all(): Promise<Comment[]> {
        return this.commentRepository.find();
    }

    async findOne(id: number): Promise<Comment> {
        return this.commentRepository.findOne({ where: { id } });
    }

    async allForGallery(gallery_id: number): Promise<Comment[]> {
        const all = await this.commentRepository.find({
            where: {
                gallery: {
                    id: gallery_id
                }
            }
        });
        all.forEach(comment => {
            delete comment.gallery;
            delete comment.user;
        });
        return all;
    }

    async create(data: Partial<Comment>): Promise<Partial<Comment>> {
        const comment = await this.commentRepository.save(data);
        console.log("Create comment :", comment);
        return {
            id: comment.id,
            comment: comment.comment,
            gallery_id: comment.gallery_id,
            user_id: comment.user_id,
            creation_date: comment.creation_date
        };
    }

    async update(data: Comment): Promise<Partial<Comment>> {
        data.edited = true;
        data.edit_date = new Date();
        const comment = await this.commentRepository.save(data);
        console.log("Update comment :", comment);
        return {
            id: comment.id,
            comment: comment.comment,
            gallery_id: comment.gallery_id,
            user_id: comment.user_id,
            creation_date: comment.creation_date,
            edited: comment.edited,
            edit_date: comment.edit_date
        };
    }

    async delete(id: number) {
        console.log("Deleting comment ", id);
        return this.commentRepository.delete(id);
    }
}
