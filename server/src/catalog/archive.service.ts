import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Archive } from "./models/archive.entity";
import { Catalog } from "./models/catalog.entity";

@Injectable()
export class ArchiveService {
    constructor(
        @InjectRepository(Archive)
        private readonly archiveRepository: Repository<Archive>
    ) {}

    async create(data): Promise<Catalog> {
        return await this.archiveRepository.save(data);
    }

    async findAllObjectsFromCompany(id: number): Promise<Archive[]> {
        return this.archiveRepository.find({ where: { company: id } });
    }

    async deleteAllObjectsFromCompany(id: number): Promise<any> {
        const backup = await this.findAllObjectsFromCompany(id);
        await this.archiveRepository.delete({ company: id });
        return backup;
    }
}
