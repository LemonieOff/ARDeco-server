import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, FindOneOptions, FindOptionsSelect, FindOptionsWhere, Repository } from "typeorm";
import { UserSettings } from "./models/user_settings.entity";
import { UserSettingsDto } from "./models/user_settings.dto";

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

    async findOne(condit: FindOptionsWhere<UserSettings>, select: FindOptionsSelect<UserSettings> | null = null): Promise<UserSettings> {
        const defaultOptions: FindOneOptions<UserSettings> = {
            where: condit,
            relations: {
                user: true
            },
            loadEagerRelations: false
        };

        let settings: UserSettings;
        if (select === null) {
            settings = await this.userRepository.findOne({ ...defaultOptions, loadRelationIds: true });
        } else {
            settings = await this.userRepository.findOne({ ...defaultOptions, select: select });
        }
        return settings;
    }

    async update(
        id: number,
        data: UserSettingsDto
    ): Promise<UserSettings> {
        await this.userRepository.update(id, data);
        return await this.findOne({ id: id });
    }

    async delete(id: number): Promise<any> {
        console.log("Deleting user settings' :", id);
        return await this.userRepository.delete({ id: id });
    }
}
