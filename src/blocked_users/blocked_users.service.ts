import { Injectable } from "@nestjs/common";
import { CreateBlockedUserDto } from "./dto/create-blocked_user.dto";
import { UpdateBlockedUserDto } from "./dto/update-blocked_user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BlockedUser } from "./entities/blocked_user.entity";

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

    findAll(user_id: number) {
        return this.blockedUsersRepository.find({
            where: {
                user_id: user_id
            }
        });
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

    remove(user_id: number, blocked_user_id: number) {
        return this.blockedUsersRepository.delete({
            user_id: user_id,
            blocked_user_id: blocked_user_id
        });
    }
}
