import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsRelations, FindOptionsSelect, FindOptionsWhere, Repository } from "typeorm";
import { UserSettings } from "./models/user_settings.entity";
import { QueryPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { DeepPartial } from "typeorm";

@Injectable()
export class UserSettingsService {
    constructor(
        @InjectRepository(UserSettings)
        private readonly userRepository: Repository<UserSettings>
    ) {
    }

    async all(): Promise<UserSettings[]> {
        return this.userRepository.find();
    }

    async create(data: DeepPartial<UserSettings>): Promise<UserSettings> {
        return this.userRepository.save(data);
    }

    async findOne(condit: {}, select: FindOptionsSelect<UserSettings> | null = null): Promise<UserSettings> {
        if (select === null) {
            return this.userRepository.findOne({ where: condit });
        }
        else {
            return this.userRepository.findOne({ where: condit, select : select });
        }
    }

    async update(
        id: number,
        data: QueryPartialEntity<UserSettings>
    ): Promise<UserSettings> {
        await this.userRepository.update(id, data);
        return await this.findOne({ id: id });
    }

    async delete(id: number): Promise<any> {
        console.log("Deleting user settings' :", id);
        return await this.userRepository.delete({ id: id });
    }
}
