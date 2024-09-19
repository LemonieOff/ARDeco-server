import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
    And,
    FindOptionsRelations,
    FindOptionsSelect,
    FindOptionsWhere,
    In,
    Not,
    Repository,
    UpdateResult
} from "typeorm";
import { GalleryService } from "./gallery.service";
import { Gallery } from "./models/gallery.entity";
import { BlockedUsersService } from "../blocked_users/blocked_users.service";

describe('GalleryService', () => {
    let galleryService: GalleryService;
    let galleryRepository: Repository<Gallery>;
    let blockedUserService: BlockedUsersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GalleryService,
                {
                    provide: getRepositoryToken(Gallery),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        save: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                        createQueryBuilder: jest.fn().mockReturnValue({
                            delete: jest.fn().mockReturnValue({
                                from: jest.fn().mockReturnValue({
                                    where: jest.fn().mockReturnValue({
                                        execute: jest.fn(),
                                    }),
                                }),
                            }),
                        }),
                    },
                },
                {
                    provide: BlockedUsersService,
                    useValue: {
                        checkBlockedForBlocker: jest.fn(),
                        findByBlockedAndBlocking: jest.fn(),
                    }
                }
            ],
        }).compile();

        galleryService = module.get<GalleryService>(GalleryService);
        galleryRepository = module.get<Repository<Gallery>>(getRepositoryToken(Gallery));
        blockedUserService = module.get<BlockedUsersService>(BlockedUsersService);
    });

    it('should be defined', () => {
        expect(galleryService).toBeDefined();
    });

    describe("create", () => {
        it('should create a new gallery', async () => {
            const model_data = JSON.stringify([
                {
                    "id":0,
                    "model_id":0,
                    "position_x":140.46806498840633,
                    "position_y":10.571208305193373,
                    "position_z":-70.9366789464873
                }
            ]);
            const data: Gallery = { model_data: model_data } as any;
            const expectedGallery: Gallery = {
                galleryReports: [],
                user: undefined,
                id: 1,
                user_id: 1,
                visibility: true,
                model_data: model_data,
                name: "Living Room",
                description: "This is a beautiful living room",
                room: "Living Room",
                comments: [],
                style: ""
            };
            jest.spyOn(galleryRepository, 'save').mockResolvedValueOnce(expectedGallery);
            const result = await galleryService.create(data);
            expect(result).toEqual(expectedGallery);
        });

        it("should return error if furniture is not JSON", async () => {
            const data: Gallery = { model_data: '{"", "", ""}' } as any;
            expect.assertions(1);
            return galleryService.create(data).catch(err => {expect(true).toEqual(true)});
        });
    });

    describe("findOne", () => {
        it("should return an existing gallery with relations", async () => {
            const where: FindOptionsWhere<Gallery> = { id: 1 };
            const relations: FindOptionsRelations<Gallery> = {};
            const expectedGallery: Gallery = {
                galleryReports: [],
                user: undefined,
                id: 1,
                user_id: 1,
                visibility: true,
                model_data: "{\"\": \"\", \"\": \"\", \"\": \"\"}",
                name: "Living Room",
                description: "This is a beautiful living room",
                room: "Living Room",
                comments: [],
                style: ""
            };
            jest.spyOn(galleryRepository, 'findOne').mockResolvedValueOnce(expectedGallery);
            const result = await galleryService.findOne(where, relations);
            expect(result).toEqual(expectedGallery);
        });

        it("should return an existing gallery without relations", async () => {
            const where: FindOptionsWhere<Gallery> = { id: 1 };
            const expectedGallery: Gallery = {
                galleryReports: [],
                user: undefined,
                id: 1,
                user_id: 1,
                visibility: true,
                model_data: "{\"\": \"\", \"\": \"\", \"\": \"\"}",
                name: "Living Room",
                description: "This is a beautiful living room",
                room: "Living Room",
                comments: [],
                style: ""
            };
            jest.spyOn(galleryRepository, 'findOne').mockResolvedValueOnce(expectedGallery);
            const result = await galleryService.findOne(where);
            expect(result).toEqual(expectedGallery);
        });
    });

    describe("findAll", () => {
        it("should return a list of galleries with all", async () => {
            const user_id: number = 1;
            const limit: number = 10;
            const begin_pos: number = 2;
            const relationOptions: FindOptionsRelations<Gallery> = {};
            const expectedGalleries: Gallery[] = [
                {
                    galleryReports: [],
                    user: undefined,
                    id: 1,
                    user_id: 1,
                    visibility: true,
                    model_data: "{\"\": \"\", \"\": \"\", \"\": \"\"}",
                    name: "Living Room",
                    description: "This is a beautiful living room",
                    room: "Living Room",
                    comments: [],
                    style: ""
                },
                {
                    galleryReports: [],
                    user: undefined,
                    id: 2,
                    user_id: 1,
                    visibility: true,
                    model_data: "{\"\": \"\", \"\": \"\", \"\": \"\"}",
                    name: "Bedroom",
                    description: "This is a cozy bedroom",
                    room: "Bedroom",
                    comments: [],
                    style: ""
                }
            ];
            jest.spyOn(blockedUserService, "findByBlockedAndBlocking").mockResolvedValueOnce([[], []]);
            jest.spyOn(galleryRepository, 'find').mockResolvedValueOnce(expectedGalleries);
            const result = await galleryService.findAll(4, user_id, limit, begin_pos, relationOptions);
            expect(result).toEqual(expectedGalleries);
        });

        it("should return a list of galleries with all null", async () => {
            const expectedGalleries: Gallery[] = [
                {
                    galleryReports: [],
                    user: undefined,
                    id: 1,
                    user_id: 1,
                    visibility: true,
                    model_data: "{\"\": \"\", \"\": \"\", \"\": \"\"}",
                    name: "Living Room",
                    description: "This is a beautiful living room",
                    room: "Living Room",
                    comments: [],
                    style: ""
                },
                {
                    galleryReports: [],
                    user: undefined,
                    id: 2,
                    user_id: 1,
                    visibility: true,
                    model_data: "{\"\": \"\", \"\": \"\", \"\": \"\"}",
                    name: "Bedroom",
                    description: "This is a cozy bedroom",
                    room: "Bedroom",
                    comments: [],
                    style: ""
                }
            ];
            jest.spyOn(blockedUserService, 'findByBlockedAndBlocking').mockResolvedValueOnce([[], []]);
            jest.spyOn(galleryRepository, 'find').mockResolvedValueOnce(expectedGalleries);
            const result = await galleryService.findAll(4, null, null, null);
            expect(result).toEqual(expectedGalleries);
        });

        it('should return an empty array if the fetcher_id is blocked by the user_id', async () => {
            const fetcherId = 1;
            const userId = 2;
            const relations: FindOptionsRelations<Gallery> = {};
            const select: FindOptionsSelect<Gallery> = {};

            jest.spyOn(blockedUserService, 'findByBlockedAndBlocking').mockResolvedValueOnce([[userId], []]);

            const result = await galleryService.findAll(fetcherId, userId, null, null, relations, select);

            expect(galleryRepository.find).not.toHaveBeenCalled();
            expect(result).toEqual([]);
        });

        it('should return an empty array if the fetcher_id is blocking the user_id', async () => {
            const fetcherId = 1;
            const userId = 2;
            const relations: FindOptionsRelations<Gallery> = {};
            const select: FindOptionsSelect<Gallery> = {};

            jest.spyOn(blockedUserService, 'findByBlockedAndBlocking').mockResolvedValueOnce([[], [userId]]);

            const result = await galleryService.findAll(fetcherId, userId, null, null, relations, select);

            expect(galleryRepository.find).not.toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    describe("findForUser", () => {
        it("should return galleries with visibility", async () => {
            const expectedGalleries: Gallery[] = [
                {
                    galleryReports: [],
                    user: undefined,
                    id: 1,
                    user_id: 1,
                    visibility: true,
                    model_data: "{\"\": \"\", \"\": \"\", \"\": \"\"}",
                    name: "Living Room",
                    description: "This is a beautiful living room",
                    room: "Living Room",
                    comments: [],
                    style: ""
                },
                {
                    galleryReports: [],
                    user: undefined,
                    id: 2,
                    user_id: 1,
                    visibility: true,
                    model_data: "{\"\": \"\", \"\": \"\", \"\": \"\"}",
                    name: "Bedroom",
                    description: "This is a cozy bedroom",
                    room: "Bedroom",
                    comments: [],
                    style: ""
                }
            ];
            jest.spyOn(galleryRepository, 'find').mockResolvedValueOnce(expectedGalleries);
            const result = await galleryService.findForUser(4, true);
            expect(result).toEqual(expectedGalleries);
        });

        it("should return galleries without visibility", async () => {
            const expectedGalleries: Gallery[] = [
                {
                    galleryReports: [],
                    user: undefined,
                    id: 1,
                    user_id: 1,
                    visibility: false,
                    model_data: "{\"\": \"\", \"\": \"\", \"\": \"\"}",
                    name: "Living Room",
                    description: "This is a beautiful living room",
                    room: "Living Room",
                    comments: [],
                    style: ""
                },
                {
                    galleryReports: [],
                    user: undefined,
                    id: 2,
                    user_id: 1,
                    visibility: false,
                    model_data: "{\"\": \"\", \"\": \"\", \"\": \"\"}",
                    name: "Bedroom",
                    description: "This is a cozy bedroom",
                    room: "Bedroom",
                    comments: [],
                    style: ""
                }
            ];
            jest.spyOn(galleryRepository, 'find').mockResolvedValueOnce(expectedGalleries);
            const result = await galleryService.findForUser(4, false);
            expect(result).toEqual(expectedGalleries);
        });
    });

    describe("update", () => {
        it("should update a gallery", async () => {
            const gallery: Gallery = {
                description: "",
                model_data: "",
                galleryReports: [],
                id: 1,
                name: "",
                room: "",
                user: undefined,
                user_id: 1,
                visibility: false,
                comments: [],
                style: ""
            }
            jest.spyOn(galleryRepository, "update").mockResolvedValue({affected: 1} as UpdateResult);
            jest.spyOn(galleryRepository, "findOne").mockResolvedValue(gallery);
            const result = await galleryService.update(1, gallery);
            expect(result).toBeDefined();
            expect(result.id).toEqual(1);
        });
    });

    describe("delete", () => {
        it("should delete a gallery", async () => {
            jest.spyOn(galleryRepository, "createQueryBuilder").mockReturnValue({
                delete: jest.fn().mockReturnValue({
                    from: jest.fn().mockReturnValue({
                        where: jest.fn().mockReturnValue({
                            execute: jest.fn()
                        })
                    })
                })
            } as any);
            const result = await galleryService.delete(1);
            console.log(result);
            expect(result).toBeUndefined();
        });
    });

    describe('findOneById', () => {
        it('should find a gallery by its ID with provided relations and select', async () => {
            const id = 1;
            const relations: FindOptionsRelations<Gallery> = { comments: true };
            const select: FindOptionsSelect<Gallery> = { id: true, name: true };
            const expectedGallery: Gallery = { id: 1, name: 'Test Gallery' } as Gallery;

            // Mock the findOne method to return the expected gallery
            jest.spyOn(galleryService, 'findOne').mockResolvedValueOnce(expectedGallery);

            const result = await galleryService.findOneById(id, relations, select);

            // Verify that findOne is called with the correct arguments
            expect(galleryService.findOne).toHaveBeenCalledWith({ id }, relations, select);

            // Verify that the result matches the expected gallery
            expect(result).toEqual(expectedGallery);
        });

        it('should find a gallery by its ID with default select when select is not provided', async () => {
            const id = 1;
            const relations: FindOptionsRelations<Gallery> = { comments: true };
            const expectedGallery: Gallery = { id: 1, name: 'Test Gallery' } as Gallery;

            // Mock the findOne method to return the expected gallery
            jest.spyOn(galleryService, 'findOne').mockResolvedValueOnce(expectedGallery);

            const result = await galleryService.findOneById(id, relations);

            // Verify that findOne is called with the correct arguments, including an empty select object
            expect(galleryService.findOne).toHaveBeenCalledWith({ id }, relations, {});

            // Verify that the result matches the expected gallery
            expect(result).toEqual(expectedGallery);
        });
    });

    describe('findOneRestricted', () => {
        it('should return a public gallery not blocked by or blocking the fetcher', async () => {
            const fetcherId = 1;
            const galleryId = 1;
            const relations: FindOptionsRelations<Gallery> = {};
            const select: FindOptionsSelect<Gallery> = {};
            const expectedGallery: Gallery = {
                id: galleryId,
                user_id: 2, // Different user
                visibility: true,
                model_data: "{}",
                name: "Living Room",
                description: "This is a beautiful living room",
                room: "Living Room",
                comments: [],
                galleryReports: [],
                user: undefined,
                style: ""
            };

            const findBlocked = jest.spyOn(blockedUserService, 'findByBlockedAndBlocking').mockResolvedValueOnce([[], []]);
            jest.spyOn(galleryRepository, 'findOne').mockResolvedValueOnce(expectedGallery);

            const result = await galleryService.findOneRestricted(fetcherId, galleryId, relations, select);

            expect(findBlocked).toHaveBeenCalledWith(fetcherId);
            expect(galleryRepository.findOne).toHaveBeenCalledWith({
                where: {
                    id: galleryId,
                    visibility: true,
                    user_id: And(Not(In([])), Not(In([])))
                },
                relations: relations,
                loadRelationIds: false,
                loadEagerRelations: false,
                select: select
            });
            expect(result).toEqual(expectedGallery);
        });

        it('should return null if the gallery is private', async () => {
            const fetcherId = 1;
            const galleryId = 1;

            jest.spyOn(blockedUserService, 'findByBlockedAndBlocking').mockResolvedValueOnce([[], []]);
            jest.spyOn(galleryRepository, 'findOne').mockResolvedValueOnce(null);

            const result = await galleryService.findOneRestricted(fetcherId, galleryId);

            expect(result).toBeNull();
        });

        it('should return null if the fetcher is blocking the gallery owner', async () => {
            const fetcherId = 1;
            const galleryId = 1;
            const relations: FindOptionsRelations<Gallery> = {};
            const select: FindOptionsSelect<Gallery> = {};
            const gallery: Gallery = {
                id: galleryId,
                user_id: 2,
                visibility: true,
                model_data: "{}",
                name: "Living Room",
                description: "This is a beautiful living room",
                room: "Living Room",
                comments: [],
                galleryReports: [],
                user: undefined,
                style: ""
            };

            jest.spyOn(blockedUserService, 'findByBlockedAndBlocking').mockResolvedValueOnce([[gallery.user_id], []]);
            jest.spyOn(galleryRepository, 'findOne').mockResolvedValueOnce(null);

            const result = await galleryService.findOneRestricted(fetcherId, galleryId, relations, select);

            expect(result).toBeNull();
        });

        it('should return null if the fetcher is blocked by the gallery owner', async () => {
            const fetcherId = 1;
            const galleryId = 1;
            const relations: FindOptionsRelations<Gallery> = {};
            const select: FindOptionsSelect<Gallery> = {};
            const gallery: Gallery = {
                id: galleryId,
                user_id: 2,
                visibility: true,
                model_data: "{}",
                name: "Living Room",
                description: "This is a beautiful living room",
                room: "Living Room",
                comments: [],
                galleryReports: [],
                user: undefined,
                style: ""
            };

            jest.spyOn(blockedUserService, 'findByBlockedAndBlocking').mockResolvedValueOnce([[], [gallery.user_id]]);
            jest.spyOn(galleryRepository, 'findOne').mockResolvedValueOnce(null);

            const result = await galleryService.findOneRestricted(fetcherId, galleryId, relations, select);

            expect(result).toBeNull();
        });

        it('should return null if the gallery is not found', async () => {
            const fetcherId = 1;
            const galleryId = 1;
            const relations: FindOptionsRelations<Gallery> = {};
            const select: FindOptionsSelect<Gallery> = {};

            jest.spyOn(blockedUserService, 'findByBlockedAndBlocking').mockResolvedValueOnce([[], []]);
            jest.spyOn(galleryRepository, 'findOne').mockResolvedValueOnce(null);

            const result = await galleryService.findOneRestricted(fetcherId, galleryId, relations, select);

            expect(result).toBeNull();
        });
    });
});
