import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Catalog } from "../catalog/models/catalog.entity";
import { ArchiveService } from "./archive.service";
import { CatalogColors } from "../catalog/models/catalog_colors.entity";
import { CatalogRooms } from "../catalog/models/catalog_rooms.entity";
import { CatalogStyles } from "../catalog/models/catalog_styles.entity";

describe("ArchiveService", () => {
    let service: ArchiveService;
    let archiveRepository: Repository<Catalog>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ArchiveService,
                {
                    provide: getRepositoryToken(Catalog),
                    useValue: {
                        save: jest.fn(),
                        findOne: jest.fn(),
                        find: jest.fn(),
                        delete: jest.fn()
                    }
                },
                {
                    provide: getRepositoryToken(CatalogColors),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        save: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn()
                    }
                },
                {
                    provide: getRepositoryToken(CatalogStyles),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        save: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn()
                    }
                },
                {
                    provide: getRepositoryToken(CatalogRooms),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        save: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<ArchiveService>(ArchiveService);
        archiveRepository = module.get<Repository<Catalog>>(getRepositoryToken(Catalog));
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("archive", () => {
        it("should archive an item", async () => {
            const item: Catalog = {
                id: 1,
                name: "Test",
                price: 100,
                width: 10,
                height: 20,
                depth: 30,
                styles: [],
                rooms: [],
                colors: [],
                object_id: "test-1",
                active: true,
                archived: false,
                company: 1,
                company_name: "Test Company",
                favorites: []
            };
            const expectedArchivedItem = { ...item, archived: true };
            jest.spyOn(archiveRepository, "save").mockResolvedValue(expectedArchivedItem as any);
            const result = await service.archive(item);
            expect(archiveRepository.save).toHaveBeenCalledWith(expectedArchivedItem);
            expect(result).toEqual({ ...expectedArchivedItem, colors: [], styles: [], rooms: [] });
        });
    });

    describe("findById", () => {
        it("should find an archived item by id", async () => {
            const id = 1;
            const mockItem = new Catalog();
            jest.spyOn(archiveRepository, "findOne").mockResolvedValue(mockItem);

            const result = await service.findById(id);

            expect(archiveRepository.findOne).toHaveBeenCalledWith({
                relations: { colors: true, rooms: true, styles: true },
                select: { colors: true, rooms: true, styles: true },
                where: { archived: true, id: id }
            });
            expect(result).toEqual(mockItem);
        });
    });

    describe("findByObjectId", () => {
        it("should find an item by objectId", async () => {
            const objectId = "test-1";
            const mockItem = new Catalog();
            jest.spyOn(archiveRepository, "findOne").mockResolvedValue(mockItem);

            const result = await service.findByObjectId(objectId);

            expect(archiveRepository.findOne).toHaveBeenCalledWith({
                relations: { colors: true, rooms: true, styles: true },
                select: {
                    active: true,
                    colors: { color: true, model_id: true },
                    rooms: { room: true },
                    styles: { style: true },
                    company: true,
                    company_name: true,
                    depth: true,
                    height: true,
                    id: true,
                    name: true,
                    object_id: true,
                    price: true,
                    width: true
                },
                where: { archived: true, object_id: objectId }
            });
            expect(result).toEqual(mockItem);
        });
    });

    describe("findByIdAndCompany", () => {
        it("should find an archived item by id and company", async () => {
            const id = 1;
            const companyId = 1;
            const mockItem: Catalog = {
                id: 1,
                name: "Test",
                price: 100,
                width: 10,
                height: 20,
                depth: 30,
                styles: [{ id: 1, style: "modern", furniture_id: 1 }],
                rooms: [{ id: 1, room: "living_room", furniture_id: 1 }],
                colors: [{ id: 1, color: "red", model_id: 0, furniture_id: 1 }],
                object_id: "test-1",
                active: true,
                archived: false,
                company: 1,
                company_name: "Test Company",
                favorites: []
            } as Catalog;

            jest.spyOn(archiveRepository, "findOne").mockResolvedValue(mockItem as any);

            const result = await service.findByIdAndCompany(id, companyId);

            expect(archiveRepository.findOne).toHaveBeenCalledWith({
                relations: { colors: true, rooms: true, styles: true },
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
                        color: true,
                        model_id: true
                    },
                    styles: {
                        style: true
                    },
                    rooms: {
                        room: true
                    }
                },
                where: { archived: true, company: companyId, id: id }
            });

            expect(result).toEqual({
                ...mockItem,
                colors: [{ color: "red", model_id: 0 }],
                styles: ["modern"],
                rooms: ["living_room"]
            });
        });
    });


    describe("findAllForCompany", () => {
        it("should find all archived items for a company", async () => {
            const companyId = 1;
            const mockItems: Catalog[] = [
                {
                    id: 1,
                    name: "Test 1",
                    price: 100,
                    width: 10,
                    height: 20,
                    depth: 30,
                    styles: [{ style: "modern" }],
                    rooms: [{ room: "living_room" }],
                    colors: [{ color: "red", model_id: 0 }],
                    object_id: "test-1",
                    active: true,
                    archived: true,
                    company: companyId,
                    company_name: "Test Company"
                },
                {
                    id: 2,
                    name: "Test 2",
                    price: 200,
                    width: 15,
                    height: 25,
                    depth: 35,
                    styles: [{ style: "classic" }],
                    rooms: [{ room: "bedroom" }],
                    colors: [{ color: "blue", model_id: 0 }],
                    object_id: "test-2",
                    active: false,
                    archived: true,
                    company: companyId,
                    company_name: "Test Company"
                }
            ] as Catalog[];
            jest.spyOn(archiveRepository, "find").mockResolvedValue(mockItems as any);

            const result = await service.findAllForCompany(companyId);

            expect(archiveRepository.find).toHaveBeenCalledWith({
                where: { company: companyId, archived: true },
                relations: { colors: true, rooms: true, styles: true },
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
                    colors: { color: true, model_id: true },
                    styles: { style: true },
                    rooms: { room: true }
                }
            });
            expect(result).toEqual(mockItems.map(item => ({
                ...item,
                colors: item.colors.map(color => ({ color: color.color, model_id: color.model_id })),
                styles: item.styles.map(style => style.style),
                rooms: item.rooms.map(room => room.room)
            })));
        });
    });

    describe("deleteAllForCompany", () => {
        it("should delete all archived items for a company", async () => {
            const companyId = 1;
            const mockItems: Catalog[] = [
                { id: 1, name: "Test 1", archived: true, company: companyId },
                { id: 2, name: "Test 2", archived: true, company: companyId }
            ] as Catalog[];

            jest.spyOn(service, "findAllForCompany").mockResolvedValue(mockItems.map(item => ({
                ...item,
                colors: [],
                styles: [],
                rooms: []
            })));
            jest.spyOn(archiveRepository, "delete").mockResolvedValue({ affected: 2 } as any);

            const result = await service.deleteAllForCompany(companyId);

            expect(service.findAllForCompany).toHaveBeenCalledWith(companyId);
            expect(archiveRepository.delete).toHaveBeenCalledWith({ company: companyId, archived: true });
            expect(result).toEqual(mockItems.map(item => ({
                ...item,
                colors: [],
                styles: [],
                rooms: []
            })));
        });
    });

    describe("deleteObjectForCompany", () => {
        it("should delete a specific archived item for a company", async () => {
            const companyId = 1;
            const itemId = 1;
            const mockItem = {
                id: itemId,
                name: "Test",
                archived: true,
                company: companyId,
                colors: [{ color: "red", model_id: 0 }],
                styles: [{ style: "modern" }],
                rooms: [{ room: "living_room" }]
            } as Catalog;
            jest.spyOn(service, "findByIdAndCompany").mockResolvedValue(mockItem as any);
            jest.spyOn(archiveRepository, "delete").mockResolvedValue({ affected: 1 } as any);

            const result = await service.deleteObjectForCompany(companyId, itemId);

            expect(service.findByIdAndCompany).toHaveBeenCalledWith(itemId, companyId);
            expect(archiveRepository.delete).toHaveBeenCalledWith({ company: companyId, id: itemId, archived: true });
            expect(result).toEqual({
                ...mockItem,
                colors: [{ color: "red", model_id: 0 }],
                styles: [{ style: "modern" }],
                rooms: [{ room: "living_room" }]
            });
        });
    });

    describe("restore", () => {
        it("should restore an archived item", async () => {
            const item: Catalog = {
                id: 1,
                name: "Test",
                price: 100,
                width: 10,
                height: 20,
                depth: 30,
                styles: [{ id: 1, style: "modern", furniture: null, furniture_id: 1 }],
                rooms: [{ id: 1, room: "living_room", furniture: null, furniture_id: 1 }],
                colors: [{ id: 1, color: "red", model_id: 0, furniture: null, furniture_id: 1 }],
                object_id: "test-1",
                active: true,
                archived: true,
                company: 1,
                company_name: "Test Company",
                favorites: []
            };
            const expectedRestoredItem = { ...item, archived: false };
            jest.spyOn(archiveRepository, "save").mockResolvedValue(expectedRestoredItem as any);

            const result = await service.restore(item);

            expect(archiveRepository.save).toHaveBeenCalledWith(expectedRestoredItem);
            expect(result).toEqual({
                ...expectedRestoredItem,
                colors: [{ color: "red", model_id: 0 }],
                styles: ["modern"],
                rooms: ["living_room"]
            });
        });
    });
});
