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
        await this.archiveRepository.update({ id: item.id }, { archived: true });
        const archive = await this.findById(item.id);

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

    async findByObjectId(id: string): Promise<Catalog> {
        return await this.archiveRepository.findOne({
            where: {
                object_id: id,
                archived: true
            },
            ...selectRelations
        });
    }

    async findByObjectIdAndCompany(id: string, company_id: number): Promise<CatalogResponseDto> {
        const archive = await this.archiveRepository.findOne({
            where: {
                object_id: id,
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

    async findAllForCompany(id: number): Promise<CatalogResponseDto[]> {
        const archive = await this.archiveRepository.find({
            where: {
                company: id,
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

    async deleteAllForCompany(id: number): Promise<CatalogResponseDto[]> {
        const backup = await this.findAllForCompany(id);
        await this.archiveRepository.delete({
            company: id,
            archived: true
        });
        return backup;
    }

    async deleteObjectForCompany(company_id: number, object_id: string): Promise<CatalogResponseDto> {
        const backup = await this.findByObjectIdAndCompany(object_id, company_id);
        await this.archiveRepository.delete({
            company: company_id,
            object_id: object_id,
            archived: true
        });
        return backup;
    }

    async restore(id: string): Promise<CatalogResponseDto> {
        await this.archiveRepository.update({ object_id: id }, { archived: false });
        const archive = await this.archiveRepository.findOne({ where: { object_id: id }, ...selectRelations });
        return {
            ...archive,
            colors: archive.colors.map(color => color.color),
            styles: archive.styles.map(style => style.style),
            rooms: archive.rooms.map(room => room.room)
        };
    }

    async restoreItem(item: Catalog): Promise<CatalogResponseDto> {
        return this.restore(item.object_id);
    }
}
