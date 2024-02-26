import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Catalog } from "./models/catalog.entity";
import { ArchiveService } from "../archive/archive.service";
import { CatalogFilterDto } from "./models/catalog-filter.dto";

@Injectable()
export class CatalogService {
    constructor(
        @InjectRepository(Catalog)
        private readonly catalogRepository: Repository<Catalog>,
        @Inject(forwardRef(() => ArchiveService))
        private readonly archiveService: ArchiveService
    ) {}

    async all(): Promise<Catalog[]> {
        return this.catalogRepository.find();
    }

    async create(data): Promise<Catalog> {
        return await this.catalogRepository.save(data);
    }

    async findOne(condit): Promise<Catalog> {
        return await this.catalogRepository.findOne({ where: condit });
    }

    async update(id: number, data): Promise<any> {
        return this.catalogRepository.update(id, data);
    }

    /*async deleteFromObjectId(object_id: string): Promise<any> {
        return this.catalogRepository.delete({ object_id: object_id });
    }*/

    async delete(id: number): Promise<Catalog> {
        const backup = await this.findOne({ id: id });

        // Create archive
        const archive = await this.archiveService.create(backup);

        // Check if archive has successfully been created
        if (!archive) {
            return null;
        }

        // Check if object has successfully been backed up correctly
        if (backup.object_id !== archive.object_id) {
            return null;
        }

        await this.catalogRepository.delete(id);

        return backup;
    }

    async deleteArray(ids: number[]) {
        const backup = await this.catalogRepository.findBy({ id: In(ids) });

        // Create archive for each backup item
        for (const item of backup) {
            // Create archive
            const archive = await this.archiveService.create(item);

            // Check if archive has successfully been created
            if (!archive) {
                return null;
            }

            // Check if object has successfully been backed up correctly
            if (item.object_id !== archive.object_id) {
                return null;
            }

            // Delete from catalog if archive was created
            await this.catalogRepository.delete(item.id);
        }

        return backup;
    }

    async deleteAllObjectsFromCompany(company_id: number) {
        const backup = await this.catalogRepository.find({
            where: { company: company_id }
        });

        // Create archive for each backup item
        for (const item of backup) {
            // Create archive
            const archive = await this.archiveService.create(item);

            // Check if archive has successfully been created
            if (!archive) {
                return null;
            }

            // Check if object has successfully been backed up correctly
            if (item.object_id !== archive.object_id) {
                return null;
            }

            // Delete from catalog if archive was created
            await this.catalogRepository.delete(item.id);
        }

        // Make sure everything has been deleted (not necessary)
        await this.catalogRepository.delete({
            company: company_id
        });

        return backup;
    }

    async filterCatalog(filterDto: CatalogFilterDto): Promise<Catalog[]> {
        // Implement your filtering logic based on the provided criteria
        return this.catalogRepository.find({
            where: filterDto
        });
    }

    private buildWhereClause(filterDto: CatalogFilterDto): object {
        const whereClause: any = {};

        // Add conditions for each property in the filterDto
        console.log("1", whereClause);
        if (filterDto.width) {
            whereClause.width = filterDto.width;
        }
        console.log("2", whereClause);
        // Add other conditions as needed for additional properties

        return whereClause;
    }
}
