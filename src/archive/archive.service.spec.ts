import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Catalog } from "../catalog/models/catalog.entity";
import { ArchiveService } from "./archive.service";
import { CatalogService } from "../catalog/catalog.service";

describe("ArchiveService", () => {
    let service: ArchiveService;
    let archiveRepository: Repository<Catalog>;
    let catalogService: CatalogService; // Mock CatalogService

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
                    provide: CatalogService, // Mock the CatalogService dependency
                    useValue: {
                        create: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<ArchiveService>(ArchiveService);
        archiveRepository = module.get<Repository<Catalog>>(
            getRepositoryToken(Catalog)
        );
        catalogService = module.get<CatalogService>(CatalogService); // Get the mock CatalogService
    });

    describe("create", () => {
        it("should create a new archive item", async () => {
            const data: Catalog = {
                favorites: [],
                active: false,
                archived: false,
                colors: [],
                company_name: "",
                depth: 0,
                height: 0,
                id: 1,
                name: "",
                price: 0,
                rooms: [],
                styles: [],
                width: 0,
                object_id: "OBJ_ID",
                company: 1
            };
            const createdItem = new Catalog();
            Object.assign(createdItem, data);

            jest.spyOn(archiveRepository, "save").mockResolvedValue(createdItem);

            const result = await service.archive(createdItem);
            expect(result).toEqual(createdItem);
        });
    });

    describe("findById", () => {
        it("should find an archive item by ID", async () => {
            const id = 1;
            const mockArchiveItem = new Catalog();
            jest.spyOn(archiveRepository, "findOne").mockResolvedValue(mockArchiveItem);

            const result = await service.findById(id);
            expect(archiveRepository.findOne).toHaveBeenCalledWith({
                relations: {
                    colors: true,
                    rooms: true,
                    styles: true
                },
                select: {
                    colors: true,
                    rooms: true,
                    styles: true
                },
                where: {
                    archived: true,
                    id: id
                }
            });
            expect(result).toEqual(mockArchiveItem);
        });
    });

    describe("findByObjectId", () => {
        it("should find an archive item by object ID", async () => {
            const objectId = "OBJ_ID";
            const mockArchiveItem = new Catalog();
            jest.spyOn(archiveRepository, "findOne").mockResolvedValue(mockArchiveItem);

            const result = await service.findByObjectId(objectId);
            expect(archiveRepository.findOne).toHaveBeenCalledWith({
                relations: {
                    colors: true,
                    rooms: true,
                    styles: true
                },
                select: {
                    active: true,
                    colors: {
                        color: true,
                        model_id: true
                    },
                    rooms: {
                        room: true
                    },
                    styles: {
                        style: true
                    },
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
                where: {
                    archived: true,
                    object_id: objectId
                }
            });
            expect(result).toEqual(mockArchiveItem);
        });
    });

    describe("findAllObjectsFromCompany", () => {
        it("should find all archive items for a company", async () => {
            const companyId = 1;
            const data: Catalog = {
                favorites: [],
                active: false,
                archived: false,
                colors: [],
                company_name: "",
                depth: 0,
                height: 0,
                id: 1,
                name: "",
                price: 0,
                rooms: [],
                styles: [],
                width: 0,
                object_id: "OBJ_ID",
                company: companyId
            };
            const catalog1 = new Catalog();
            const catalog2 = new Catalog();
            Object.assign(catalog1, data);
            Object.assign(catalog2, data, { id: 2 });
            const mockArchiveItems = [catalog1, catalog2];
            jest.spyOn(archiveRepository, "find").mockResolvedValue(mockArchiveItems);

            const result = await service.findAllForCompany(companyId);
            expect(archiveRepository.find).toHaveBeenCalledWith({
                relations: {
                    colors: true,
                    rooms: true,
                    styles: true
                },
                select: {
                    active: true,
                    colors: {
                        color: true,
                        model_id: true
                    },
                    company: true,
                    company_name: true,
                    depth: true,
                    height: true,
                    id: true,
                    name: true,
                    object_id: true,
                    price: true,
                    rooms: {
                        room: true
                    },
                    styles: {
                        style: true
                    },
                    width: true
                },
                where: { archived: true, company: companyId }
            });
            expect(result).toEqual(mockArchiveItems);
        });
    });

    describe("deleteAllObjectsFromCompany", () => {
        it("should delete all archive items for a company and return a backup", async () => {
            const companyId = 1;
            const data: Catalog = {
                favorites: [],
                active: false,
                archived: false,
                colors: [],
                company_name: "",
                depth: 0,
                height: 0,
                id: 1,
                name: "",
                price: 0,
                rooms: [],
                styles: [],
                width: 0,
                object_id: "OBJ_ID",
                company: companyId
            };
            const catalog1 = new Catalog();
            const catalog2 = new Catalog();
            Object.assign(catalog1, data);
            Object.assign(catalog2, data, { id: 2 });
            const mockArchiveItems = [catalog1, catalog2];
            jest.spyOn(archiveRepository, "find").mockResolvedValue(mockArchiveItems);
            jest.spyOn(archiveRepository, "delete").mockResolvedValue({ affected: 2 } as any);

            const result = await service.deleteAllForCompany(companyId);
            expect(archiveRepository.find).toHaveBeenCalledWith({
                relations: {
                    colors: true,
                    rooms: true,
                    styles: true
                },
                select: {
                    active: true,
                    colors: {
                        color: true,
                        model_id: true
                    },
                    company: true,
                    company_name: true,
                    depth: true,
                    height: true,
                    id: true,
                    name: true,
                    object_id: true,
                    price: true,
                    rooms: {
                        room: true
                    },
                    styles: {
                        style: true
                    },
                    width: true
                },
                where: { archived: true, company: companyId }
            });
            expect(archiveRepository.delete).toHaveBeenCalledWith({
                archived: true,
                company: companyId
            });
            expect(result).toEqual(mockArchiveItems); // Backup returned
        });
    });

    describe("deleteObjectFromCompany", () => {
        it("should delete a specific archive item for a company and return a backup", async () => {
            const companyId = 4;
            const id = 1;
            const data: Catalog = {
                favorites: [],
                active: false,
                archived: false,
                colors: [],
                company_name: "",
                depth: 0,
                height: 0,
                id: 1,
                name: "",
                price: 0,
                rooms: [],
                styles: [],
                width: 0,
                object_id: "OBJ_ID",
                company: companyId
            };
            const mockArchiveItem = new Catalog();
            Object.assign(mockArchiveItem, data);
            jest.spyOn(archiveRepository, "findOne").mockResolvedValue(mockArchiveItem);
            jest.spyOn(archiveRepository, "delete").mockResolvedValue({ affected: 1 } as any);

            const result = await service.deleteObjectForCompany(companyId, id);
            expect(archiveRepository.findOne).toHaveBeenCalledWith({
                relations: {
                    colors: true,
                    rooms: true,
                    styles: true
                },
                select: {
                    active: true,
                    colors: {
                        color: true,
                        model_id: true
                    },
                    company: true,
                    company_name: true,
                    depth: true,
                    height: true,
                    id: true,
                    name: true,
                    object_id: true,
                    price: true,
                    rooms: {
                        room: true
                    },
                    styles: {
                        style: true
                    },
                    width: true
                },
                where: { archived: true, company: companyId, id: id }
            });
            expect(archiveRepository.delete).toHaveBeenCalledWith({
                archived: true,
                company: companyId,
                id: id
            });
            expect(result).toEqual(mockArchiveItem); // Backup returned
        });
    });

    describe("restore", () => {
        it("should restore an object from the archive", async () => {
            const objectId = 1;
            const data = {
                active: false,
                archived: true,
                colors: [{ color: "red", model_id: 1 }, { color: "blue", model_id: 2 }], // Couleurs ajoutées
                company_name: "Company Name",
                depth: 5,
                height: 2,
                id: objectId,
                name: "Product Name",
                price: 1000,
                rooms: [{
                    room: "living_room"
                }, {
                    room: "bedroom"
                }],
                styles: [{
                    style: "modern"
                }, {
                    style: "classic"
                }],
                width: 48,
                object_id: "OBJ_ID",
                company: 1
            };
            const mockArchiveItem = new Catalog();
            Object.assign(mockArchiveItem, data);

            const mockRestoredItem = new Catalog();
            Object.assign(mockRestoredItem, mockArchiveItem, { archived: false });

            jest.spyOn(archiveRepository, "save").mockResolvedValue(mockRestoredItem);

            const result = await service.restore(mockArchiveItem);

            expect(archiveRepository.save).toHaveBeenCalledWith(mockRestoredItem);

            expect(result).toEqual({
                ...mockRestoredItem,
                colors: [{ color: "red", model_id: 1 }, { color: "blue", model_id: 2 }], // Vérification des couleurs
                styles: ["modern", "classic"], // Vérification des styles
                rooms: ["living_room", "bedroom"] // Vérification des pièces
            });
        });
    });
});
