import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Archive } from "./models/archive.entity";
import { Catalog } from "../catalog/models/catalog.entity";
import { CatalogService } from "../catalog/catalog.service";

@Injectable()
export class ArchiveService {
    constructor(
        @InjectRepository(Archive)
        private readonly archiveRepository: Repository<Archive>,
        @Inject(forwardRef(() => CatalogService))
        private readonly catalogService: CatalogService
    ) {
    }

    async create(data): Promise<Archive> {
        return await this.archiveRepository.save(data);
    }

    async findById(id: number): Promise<Archive> {
        return await this.archiveRepository.findOne({ where: { id: id } });
    }

    async findByObjectId(id: string): Promise<Archive> {
        return await this.archiveRepository.findOne({ where: { object_id: id } });
    }

    async findAllObjectsFromCompany(id: number): Promise<Archive[]> {
        return this.archiveRepository.find({ where: { company: id } });
    }

    async deleteAllObjectsFromCompany(id: number): Promise<any> {
        const backup = await this.findAllObjectsFromCompany(id);
        await this.archiveRepository.delete({ company: id });
        return backup;
    }

    async deleteObjectFromCompany(company_id: number, object_id: string): Promise<any> {
        const backup = await this.findByObjectId(object_id);
        await this.archiveRepository.delete({
            company: company_id,
            object_id: object_id
        });
        return backup;
    }

    async restore(id: string): Promise<Catalog> {
        const backup = await this.findByObjectId(id);
        await this.archiveRepository.delete(backup.id);
        return await this.catalogService.create(backup);
    }
}
