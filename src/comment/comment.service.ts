import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Comment } from "./models/comment.entity";
import { User } from "../user/models/user.entity";
import { logObject } from "../logging/LogObject";

@Injectable()
export class CommentService {
    private readonly logger = new Logger("CommentService");

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

    async allForGallery(gallery_id: number, requesting_user: User | null): Promise<Comment[]> {
        const all = await this.commentRepository.find({
            where: {
                gallery: {
                    id: gallery_id
                }
            },
            relations: {
                user: true
            },
            select: {
                user: {
                    first_name: true,
                    last_name: true,
                    profile_picture_id: true
                }
            }
        });
        all.forEach(comment => {
            let display_lastName = false;

            const [first_name, last_name, picture] = [comment.user.first_name, comment.user.last_name, comment.user.profile_picture_id];

            if (requesting_user) {
                display_lastName = requesting_user.settings.display_lastname_on_public;
                if (requesting_user.role === "admin" || requesting_user.id === comment.user_id) display_lastName = true; // Always display last name if admin or self
            }

            delete comment.gallery;
            delete comment.user;

            comment.user = {
                first_name: first_name,
                last_name: display_lastName ? last_name : "",
                profile_picture_id: picture
            } as User;
        });
        return all;
    }

    async create(data: Partial<Comment>): Promise<Partial<Comment>> {
        const comment = await this.commentRepository.save(data);
        this.logger.debug(`Create comment : ${logObject(comment)}`);
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
        this.logger.debug(`Update comment : ${logObject(comment)}`);
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
        this.logger.debug(`Deleting comment ${id}`);
        return this.commentRepository.delete(id);
    }
}
