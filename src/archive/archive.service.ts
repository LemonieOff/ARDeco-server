import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Catalog } from "../catalog/models/catalog.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class ArchiveService {
    constructor(
        @InjectRepository(Catalog)
        private readonly archiveRepository: Repository<Catalog>
    ) {
    }

    async archive(item: Catalog): Promise<Catalog> {
        item.archived = true;
        return await this.archiveRepository.save(item);
    }

    async findById(id: number): Promise<Catalog> {
        return await this.archiveRepository.findOne({
            where: {
                id: id,
                archived: true
            }
        });
    }

    async findByObjectId(id: string): Promise<Catalog> {
        return await this.archiveRepository.findOne({
            where: {
                object_id: id,
                archived: true
            }
        });
    }

    async findByObjectIdAndCompany(id: string, company_id: number): Promise<Catalog> {
        return await this.archiveRepository.findOne({
            where: {
                object_id: id,
                company: company_id,
                archived: true
            }
        });
    }

    async findAllForCompany(id: number): Promise<Catalog[]> {
        return this.archiveRepository.find({
            where: {
                company: id,
                archived: true
            }
        });
    }

    async deleteAllForCompany(id: number): Promise<Catalog[]> {
        const backup = await this.findAllForCompany(id);
        await this.archiveRepository.delete({
            company: id,
            archived: true
        });
        return backup;
    }

    async deleteObjectForCompany(company_id: number, object_id: string): Promise<Catalog> {
        const backup = await this.findByObjectIdAndCompany(object_id, company_id);
        await this.archiveRepository.delete({
            company: company_id,
            object_id: object_id,
            archived: true
        });
        return backup;
    }

    async restore(id: string): Promise<Catalog> {
        const item = await this.findByObjectId(id);
        item.archived = false;
        return await this.archiveRepository.save(item);
    }

    async restoreItem(item: Catalog): Promise<Catalog> {
        item.archived = false;
        return await this.archiveRepository.save(item);
    }
}
