import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserSettings } from "./models/user_settings.entity";
import { QueryPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class UserSettingsService {
    constructor(
        @InjectRepository(UserSettings)
        private readonly userRepository: Repository<UserSettings>
    ) {}

    async all(): Promise<UserSettings[]> {
        return this.userRepository.find();
    }

    async create(data): Promise<UserSettings> {
        return this.userRepository.save(data);
    }

    async findOne(condit): Promise<UserSettings> {
        return this.userRepository.findOne({ where: condit });
    }

    async update(
        id: number,
        data: QueryPartialEntity<UserSettings>
    ): Promise<UserSettings> {
        await this.userRepository.update(id, data);
        return await this.findOne({ id: id });
    }

    async delete(id: number): Promise<any> {
        console.log("Deleting user ", id);
        return this.userRepository
            .createQueryBuilder("user_settings")
            .delete()
            .from(UserSettings)
            .where("id = id", { id: id })
            .execute();
    }
}
