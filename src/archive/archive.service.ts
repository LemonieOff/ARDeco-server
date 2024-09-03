import { Injectable } from "@nestjs/common";
import { FindManyOptions, Repository } from "typeorm";
import { Catalog } from "../catalog/models/catalog.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CatalogResponseDto } from "../catalog/dtos/catalog-response.dto";

const selectRelations: FindManyOptions<Catalog> = {
    relations: {
        colors: true,
        rooms: true,
        styles: true
    },
    select: {
        id: true,
        name: true,
        object_id: true,
        company: true,
        company_name: true,
        price: true,
        width: true,
        height: true,
        depth: true,
        active: true,
        colors: {
            color: true
        },
        styles: {
            style: true
        },
        rooms: {
            room: true
        }
    }
};

@Injectable()
export class ArchiveService {
    constructor(
        @InjectRepository(Catalog)
        private readonly archiveRepository: Repository<Catalog>
    ) {
    }

    async archive(item: Catalog): Promise<CatalogResponseDto> {
        item.archived = true;
        const archive = await this.archiveRepository.save(item);

        return {
            ...archive,
            colors: archive.colors.map(color => color.color),
            styles: archive.styles.map(style => style.style),
            rooms: archive.rooms.map(room => room.room)
        };
    }

    async findById(id: number): Promise<Catalog> {
        return await this.archiveRepository.findOne({
            where: {
                id: id,
                archived: true
            },
            ...selectRelations
        });
    }

    async findByObjectId(object_id: string): Promise<Catalog> {
        return await this.archiveRepository.findOne({
            where: {
                object_id: object_id,
                archived: true
            },
            ...selectRelations
        });
    }

    async findByIdAndCompany(id: number, company_id: number): Promise<CatalogResponseDto> {
        const archive = await this.archiveRepository.findOne({
            where: {
                id: id,
                company: company_id,
                archived: true
            },
            ...selectRelations
        });

        return {
            ...archive,
            colors: archive.colors.map(color => color.color),
            styles: archive.styles.map(style => style.style),
            rooms: archive.rooms.map(room => room.room)
        };
    }

    async findAllForCompany(company_id: number): Promise<CatalogResponseDto[]> {
        const archive = await this.archiveRepository.find({
            where: {
                company: company_id,
                archived: true
            },
            ...selectRelations
        });

        return archive.map(catalog => ({
            ...catalog,
            colors: catalog.colors.map(color => color.color),
            styles: catalog.styles.map(style => style.style),
            rooms: catalog.rooms.map(room => room.room)
        }));
    }

    async deleteAllForCompany(company_id: number): Promise<CatalogResponseDto[]> {
        const backup = await this.findAllForCompany(company_id);
        await this.archiveRepository.delete({
            company: company_id,
            archived: true
        });
        return backup;
    }

    async deleteObjectForCompany(company_id: number, id: number): Promise<CatalogResponseDto> {
        const backup = await this.findByIdAndCompany(id, company_id);
        await this.archiveRepository.delete({
            company: company_id,
            id: id,
            archived: true
        });
        return backup;
    }

    async restore(item: Catalog): Promise<CatalogResponseDto> {
        item.archived = false;
        const restoredItem = await this.archiveRepository.save(item);
        return {
            ...restoredItem,
            colors: restoredItem.colors.map(color => color.color),
            styles: restoredItem.styles.map(style => style.style),
            rooms: restoredItem.rooms.map(room => room.room)
        };
    }
}
