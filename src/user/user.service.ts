import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository, UpdateResult } from "typeorm";
import { User } from "./models/user.entity";
import { QueryPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}

    async all(): Promise<User[]> {
        return this.userRepository.find();
    }

    async create(data): Promise<User> {
        const user = await this.userRepository.save(data);
        console.log("Create user :", user);
        return user;
    }

    async findOne(condit: FindOptionsWhere<User>): Promise<User> {
        return this.userRepository.findOne({ where: condit });
    }

    async findById(id: number): Promise<User> {
        return this.userRepository.findOne({ where: { id: id }, relations: ["galleryReports"] });
    }

    async update(
        id: number,
        data: QueryPartialEntity<User>
    ): Promise<UpdateResult> {
        console.log("ID : ", id, ", DATA : ", data)
        return this.userRepository.update(id, data);
    }

    async delete(id: number): Promise<any> {
        //return this.userRepository.delete(id);
        console.log("Deleting user ", id);
        await this.userRepository
            .createQueryBuilder("user")
            .delete()
            .from(User)
            .where("id = id", { id: id })
            .execute();
    }
}
