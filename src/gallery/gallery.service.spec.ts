import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { And, FindOptionsRelations, FindOptionsSelect, FindOptionsWhere, In, Not, Repository } from "typeorm";
import { GalleryService } from "./gallery.service";
import { Gallery } from "./models/gallery.entity";
import { BlockedUsersService } from "../blocked_users/blocked_users.service";

describe("GalleryService", () => {
    let galleryService: GalleryService;
    let galleryRepository: Repository<Gallery>;
    let blockedUsersService: BlockedUsersService;

    const mockGallery: Gallery = {
        id: 1,
        user_id: 1,
        visibility: true,
        model_data: "{}",
        name: "Gallery 1",
        description: "Description 1",
        room: "living_room",
        style: "modern",
        galleryReports: [],
        comments: [],
        likes: [],
        favorites: [],
        user: undefined
    };

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
                                        execute: jest.fn()
                                    })
                                })
                            })
                        })
                    }
                },
                {
                    provide: BlockedUsersService,
                    useValue: {
                        findByBlockedAndBlocking: jest.fn(),
                        checkBlockedForBlocker: jest.fn()
                    }
                }
            ]
        }).compile();

        galleryService = module.get<GalleryService>(GalleryService);
        galleryRepository = module.get<Repository<Gallery>>(getRepositoryToken(Gallery));
        blockedUsersService = module.get<BlockedUsersService>(BlockedUsersService);
    });

    it("should be defined", () => {
        expect(galleryService).toBeDefined();
    });

    describe("create", () => {
        it("should create a new gallery", async () => {
            const model_data = JSON.stringify([
                {
                    id: 0,
                    model_id: 0,
                    position_x: 140.46806498840633,
                    position_y: 10.571208305193373,
                    position_z: -70.9366789464873
                }
            ]);
            const data: Gallery = { model_data: model_data } as any;
            const expectedGallery = {
                id: 1,
                user_id: 1,
                visibility: true,
                model_data,
                name: "Living Room",
                description: "This is a beautiful living room",
                room: "Living Room",
                comments: [],
                galleryReports: [],
                likes: [],
                favorites: [],
                user: undefined,
                style: ""
            };
            jest.spyOn(galleryRepository, "save").mockResolvedValueOnce(expectedGallery as any);

            const result = await galleryService.create(data);

            expect(galleryRepository.save).toHaveBeenCalledWith(data);
            expect(result).toEqual(expectedGallery);
        });

        it("should reject if model_data is not valid JSON", async () => {
            const data = { model_data: "invalid JSON" };

            // Expecting a rejected promise with specific error details
            await expect(galleryService.create(data as any)).rejects.toEqual({
                error: "JsonError",
                message: "Furniture is not a valid JSON object",
                furniture: "invalid JSON"
            });
        });
    });

    describe("findOne", () => {
        it("should find a gallery by where clause", async () => {
            const where: FindOptionsWhere<Gallery> = { id: 1 };
            const relations: FindOptionsRelations<Gallery> = { comments: true };
            const select: FindOptionsSelect<Gallery> = { id: true, name: true };
            jest.spyOn(galleryRepository, "findOne").mockResolvedValue(mockGallery as any);

            const result = await galleryService.findOne(where, relations, select, true, true);

            expect(galleryRepository.findOne).toHaveBeenCalledWith({
                where,
                relations,
                select,
                loadRelationIds: true,
                loadEagerRelations: true
            });
            expect(result).toEqual(mockGallery);
        });
    });

    describe("findOneById", () => {
        it("should find a gallery by ID with relations and select", async () => {
            const id = 1;
            const relations: FindOptionsRelations<Gallery> = { comments: true };
            const select: FindOptionsSelect<Gallery> = { id: true, name: true };
            const expectedGallery: Gallery = { id: 1, name: "Test Gallery" } as Gallery;

            jest.spyOn(galleryService, "findOne").mockResolvedValueOnce(expectedGallery as any);

            const result = await galleryService.findOneById(id, relations, select);

            expect(galleryService.findOne).toHaveBeenCalledWith({ id }, relations, select);
            expect(result).toEqual(expectedGallery);
        });
    });

    describe("findOneRestricted", () => {
        it("should find a restricted gallery", async () => {
            const fetcherId = 1;
            const galleryId = 1;
            const relations: FindOptionsRelations<Gallery> = { comments: true };
            const select: FindOptionsSelect<Gallery> = { id: true, name: true };
            const blocked = [2];
            const blocking = [3];
            jest.spyOn(blockedUsersService, "findByBlockedAndBlocking").mockResolvedValue([[2], [3]]);
            jest.spyOn(galleryRepository, "findOne").mockResolvedValue(mockGallery as any);

            const result = await galleryService.findOneRestricted(fetcherId, galleryId, relations, select);

            expect(blockedUsersService.findByBlockedAndBlocking).toHaveBeenCalledWith(fetcherId);
            expect(galleryRepository.findOne).toHaveBeenCalledWith({
                where: { id: galleryId, visibility: true, user_id: And(Not(In(blocked)), Not(In(blocking))) },
                relations,
                select,
                loadRelationIds: false,
                loadEagerRelations: false
            });
            expect(result).toEqual(mockGallery);
        });
    });

    describe("findAll", () => {
        it("should find all galleries with default parameters", async () => {
            const fetcherId = 1;
            const mockGalleries: Gallery[] = [mockGallery, { ...mockGallery, id: 2 }];
            jest.spyOn(blockedUsersService, "findByBlockedAndBlocking").mockResolvedValue([[], []]);
            jest.spyOn(galleryRepository, "find").mockResolvedValue(mockGalleries as any);

            const result = await galleryService.findAll(fetcherId, null, null, null, false);

            expect(blockedUsersService.findByBlockedAndBlocking).toHaveBeenCalledWith(fetcherId);
            expect(galleryRepository.find).toHaveBeenCalledWith({
                where: { visibility: true, user_id: And(Not(In([])), Not(In([]))) },
                relations: {},
                select: {},
                loadRelationIds: false,
                loadEagerRelations: false
            });
            expect(result).toEqual(mockGalleries);
        });

        it("should find all galleries with provided parameters", async () => {
            const fetcherId = 1;
            const userId = 1;
            const limit = 10;
            const begin_pos = 0;
            const relations: FindOptionsRelations<Gallery> = { comments: true };
            const select: FindOptionsSelect<Gallery> = { id: true };
            const mockGalleries = [mockGallery];

            jest.spyOn(blockedUsersService, "findByBlockedAndBlocking").mockResolvedValue([[], []]);
            jest.spyOn(galleryRepository, "find").mockResolvedValue(mockGalleries as any);

            const result = await galleryService.findAll(fetcherId, userId, limit, begin_pos, false, relations, select);


            expect(blockedUsersService.findByBlockedAndBlocking).toHaveBeenCalledWith(fetcherId);
            expect(galleryRepository.find).toHaveBeenCalledWith({
                where: { user_id: userId, visibility: true },
                take: limit,
                skip: begin_pos,
                relations,
                select,
                loadRelationIds: false,
                loadEagerRelations: false
            });
            expect(result).toEqual(mockGalleries);
        });

        it("should return empty array if user is blocked or blocking", async () => {
            const fetcherId = 1;
            const userId = 2;
            jest.spyOn(blockedUsersService, "findByBlockedAndBlocking").mockResolvedValue([[userId], []]);
            const result = await galleryService.findAll(fetcherId, userId, null, null, false);
            expect(result).toEqual([]);

            jest.spyOn(blockedUsersService, "findByBlockedAndBlocking").mockRestore();
            jest.spyOn(blockedUsersService, "findByBlockedAndBlocking").mockResolvedValue([[], [userId]]);
            const result2 = await galleryService.findAll(fetcherId, userId, null, null, false);
            expect(result2).toEqual([]);
        });

        it("should find all galleries if isAdmin is true", async () => {
            const fetcherId = 1;
            const userId = 1;
            const limit = 10;
            const begin_pos = 0;
            const relations: FindOptionsRelations<Gallery> = { comments: true };
            const select: FindOptionsSelect<Gallery> = { id: true };
            const mockGalleries = [mockGallery];
            jest.spyOn(galleryRepository, "find").mockResolvedValue(mockGalleries as any);

            const result = await galleryService.findAll(fetcherId, userId, limit, begin_pos, true, relations, select);

            expect(galleryRepository.find).toHaveBeenCalledWith({
                where: {},
                take: limit,
                skip: begin_pos,
                relations,
                select,
                loadRelationIds: false,
                loadEagerRelations: false
            });
            expect(result).toEqual(mockGalleries);
        });
    });


    describe("findForUser", () => {
        it("should find galleries for a user with visibility", async () => {
            const userId = 1;
            const visibility = true;
            const mockGalleries = [{
                id: 1, user: { settings: { display_lastname_on_public: true } }
            }];
            jest.spyOn(galleryRepository, "find").mockResolvedValue(mockGalleries as any);

            const result = await galleryService.findForUser(userId, visibility);

            expect(galleryRepository.find).toHaveBeenCalledWith({
                loadEagerRelations: false,
                loadRelationIds: false,
                relations: { user: { settings: true }, comments: true },
                select: {
                    comments: true,
                    description: true,
                    id: true,
                    model_data: true,
                    name: true,
                    room: true,
                    style: true,
                    user: {
                        first_name: true,
                        id: true,
                        last_name: true,
                        profile_picture_id: true,
                        role: true,
                        settings: { display_lastname_on_public: true }
                    },
                    visibility: true
                },
                where: { user_id: userId, visibility: visibility }
            });
            expect(result).toEqual(mockGalleries);
        });

        it("should find galleries for a user without visibility", async () => {
            const userId = 1;
            const visibility = false;
            const mockGalleries = [{
                id: 1, user: { settings: { display_lastname_on_public: true } }
            }];
            jest.spyOn(galleryRepository, "find").mockResolvedValue(mockGalleries as any);

            const result = await galleryService.findForUser(userId, visibility);

            expect(galleryRepository.find).toHaveBeenCalledWith({
                loadEagerRelations: false,
                loadRelationIds: false,
                relations: { user: { settings: true }, comments: true },
                select: {
                    comments: true,
                    description: true,
                    id: true,
                    model_data: true,
                    name: true,
                    room: true,
                    style: true,
                    user: {
                        first_name: true,
                        id: true,
                        last_name: true,
                        profile_picture_id: true,
                        role: true,
                        settings: { display_lastname_on_public: true }
                    },
                    visibility: true
                },
                where: { user_id: userId }
            });
            expect(result).toEqual(mockGalleries);
        });
    });

    describe("update", () => {
        it("should update a gallery", async () => {
            const id = 1;
            const data = { name: "Updated Gallery" };
            const updatedGallery = { ...mockGallery, ...data };
            jest.spyOn(galleryRepository, "update").mockResolvedValue({} as any);
            jest.spyOn(galleryRepository, "findOne").mockResolvedValue(updatedGallery as any);

            const result = await galleryService.update(id, data as any);

            expect(galleryRepository.update).toHaveBeenCalledWith(id, data);
            expect(galleryRepository.findOne).toHaveBeenCalledWith({ id });
            expect(result).toEqual(updatedGallery);
        });
    });

    describe("delete", () => {
        it("should delete a gallery", async () => {
            const id = 1;
            jest.spyOn(galleryRepository, "delete").mockResolvedValue({ affected: 1 } as any);

            const result = await galleryService.delete(id);

            expect(galleryRepository.delete).toHaveBeenCalledWith({ id });
            expect(result.affected).toBe(1);
        });
    });
});
