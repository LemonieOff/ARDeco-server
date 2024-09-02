import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, FindOptionsWhere, In, Repository } from "typeorm";
import { Catalog } from "./models/catalog.entity";
import { ArchiveService } from "../archive/archive.service";
import { CatalogFilterDto } from "./dtos/catalog-filter.dto";
import { CatalogCreateDto } from "./dtos/catalog-create.dto";
import { CatalogColors } from "./models/catalog_colors.entity";
import { CatalogRooms } from "./models/catalog_rooms.entity";
import { CatalogStyles } from "./models/catalog_styles.entity";
import { CatalogResponseDto } from "./dtos/catalog-response.dto";

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
export class CatalogService {
    constructor(
        @InjectRepository(Catalog)
        private readonly catalogRepository: Repository<Catalog>,
        private readonly archiveService: ArchiveService
    ) {
    }

    async all(): Promise<CatalogResponseDto[]> {
        const catalog = await this.catalogRepository.find({
            where: { archived: false },
            ...selectRelations
        });

        return catalog.map(catalog => ({
            ...catalog,
            colors: catalog.colors.map(color => color.color),
            styles: catalog.styles.map(style => style.style),
            rooms: catalog.rooms.map(room => room.room)
        }));
    }

    async create(data: CatalogCreateDto): Promise<Catalog> {
        const object = new Catalog();
        object.name = data.name;
        object.width = data.width;
        object.height = data.height;
        object.depth = data.depth;
        object.company = data.company;
        object.company_name = data.company_name;
        object.price = data.price;
        object.object_id = data.object_id;

        let colors: CatalogColors[] = [];
        for (const colorString of data.colors) {
            const color: CatalogColors = new CatalogColors();
            color.color = colorString;
            color.furniture = object;
            colors.push(color);
        }
        object.colors = colors;

        let rooms: CatalogRooms[] = [];
        for (const roomString of data.rooms) {
            const room: CatalogRooms = new CatalogRooms();
            room.room = roomString;
            room.furniture = object;
            rooms.push(room);
        }
        object.rooms = rooms;

        let styles: CatalogStyles[] = [];
        for (const styleString of data.styles) {
            const style: CatalogStyles = new CatalogStyles();
            style.style = styleString;
            style.furniture = object;
            styles.push(style);
        }
        object.styles = styles;

        return this.catalogRepository.save(object);
    }

    async findOne(where: FindOptionsWhere<Catalog>): Promise<Catalog> {
        where.archived = false;
        return await this.catalogRepository.findOne({
            where: {
                ...where,
                archived: false
            },
            ...selectRelations
        });
    }

    async findByCompany(company_id: number): Promise<CatalogResponseDto[]> {
        const catalog = await this.catalogRepository.find({
            where: {
                company: company_id,
                archived: false
            },
            ...selectRelations
        });

        return catalog.map(catalog => ({
            ...catalog,
            colors: catalog.colors.map(color => color.color),
            styles: catalog.styles.map(style => style.style),
            rooms: catalog.rooms.map(room => room.room)
        }));
    }

    async update(id: number, data): Promise<any> {
        return this.catalogRepository.update({
            id: id,
            archived: false
        }, data);
    }

    /*async deleteFromObjectId(object_id: string): Promise<any> {
        return this.catalogRepository.delete({ object_id: object_id });
    }*/

    async archive(id: number): Promise<CatalogResponseDto> {
        const item = await this.findOne({ id: id });
        return this.archiveService.archive(item);
    }

    async archiveItem(item: Catalog): Promise<CatalogResponseDto> {
        return this.archiveService.archive(item);
    }

    async archiveArray(ids: number[]): Promise<CatalogResponseDto[]> {
        const itemList = await this.catalogRepository.findBy({ id: In(ids) });
        let archivedList: CatalogResponseDto[] = [];

        // Archive each furniture
        for (const item of itemList) {
            archivedList.push(await this.archiveItem(item));
        }

        return archivedList;
    }

    async archiveAllForCompany(company_id: number): Promise<CatalogResponseDto[]> {
        const itemList = await this.catalogRepository.find({
            where: { company: company_id, archived: false }
        });
        let archivedList: CatalogResponseDto[] = [];

        // Archive each furniture
        for (const item of itemList) {
            archivedList.push(await this.archiveItem(item));
        }

        return archivedList;
    }

    async filterCatalog(filterDto: CatalogFilterDto): Promise<Catalog[]> {
        // Implement your filtering logic based on the provided criteria
        return this.catalogRepository.find({
            // where: filterDto
        });
    }
}
