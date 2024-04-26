import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, FindOptionsWhere, Repository } from "typeorm";
import { User } from "../user/models/user.entity";
import { QueryPartialEntity } from "typeorm/query-builder/QueryPartialEntity";



@Injectable()
export class CreateCompanyService {
    constructor(
        @InjectRepository(User)
        private readonly user: Repository<User>
    ) {}
}
