import { Injectable } from "@nestjs/common";
import { CreateBlockedUserDto } from "./dto/create-blocked_user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BlockedUser } from "./entities/blocked_user.entity";
import { User } from "../user/models/user.entity";

export type Blocked = number; // Users blocked by current user
export type Blocking = number; // Users blocking current user

@Injectable()
export class BlockedUsersService {
    constructor(
        @InjectRepository(BlockedUser)
        private readonly blockedUsersRepository: Repository<BlockedUser>
    ) {
    }

    create(createBlockedUserDto: CreateBlockedUserDto) {
        return this.blockedUsersRepository.save(createBlockedUserDto);
    }

    findOne(user_id: number, blocked_user_id: number) {
        return this.blockedUsersRepository.findOne({
            where: {
                user_id: user_id,
                blocked_user_id: blocked_user_id
            },
            select: ["id"]
        });
    }

    async findByBlocker(user_id: number, request_user: User): Promise<BlockedUser[]> {
        const users = await this.blockedUsersRepository.find({
            where: {
                user_id: user_id
            },
            relations: { blocked_user: { settings: true } },
            select: {
                blocked_user: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    settings: {
                        display_lastname_on_public: true
                    }
                }
            },
            loadRelationIds: false,
            loadEagerRelations: false
        });

        return users.map(user => {
            let displayName = user.blocked_user.settings.display_lastname_on_public;
            if (request_user.role === "admin") displayName = true;
            if (!displayName) user.blocked_user.last_name = "";
            delete user.blocked_user.settings;
            return user;
        });
    }

    findByBlocked(blocked_user_id: number): Promise<BlockedUser[]> {
        return this.blockedUsersRepository.find({
            where: {
                blocked_user_id: blocked_user_id
            }
        });
    }

    async findByBlockedAndBlocking(user_id: number): Promise<[Blocked[], Blocking[]]> {
        const all = await this.blockedUsersRepository.find({
            where: [{ user_id: user_id }, { blocked_user_id: user_id }]
        });

        const blocked: Blocked[] = all.filter(user => user.user_id === user_id).map(user => user.blocked_user_id);
        const blocking: Blocking[] = all.filter(user => user.blocked_user_id === user_id).map(user => user.user_id);

        return [blocked, blocking];
    }

    async checkBlockedForBlocker(blocker_id: number, blocked_id: number): Promise<boolean> {
        const result = await this.blockedUsersRepository.findOne({
            where: {
                user_id: blocker_id,
                blocked_user_id: blocked_id
            }
        });

        return !(!result);
    }

    remove(user_id: number, blocked_user_id: number) {
        return this.blockedUsersRepository.delete({
            user_id: user_id,
            blocked_user_id: blocked_user_id
        });
    }
}
