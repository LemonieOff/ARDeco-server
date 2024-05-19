import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindOptionsRelations, FindOptionsWhere, Repository, UpdateResult } from "typeorm";
import { GalleryService } from "./gallery.service";
import { Gallery } from "./models/gallery.entity";
import * as test from "node:test";
import { User } from "../user/models/user.entity";

describe('GalleryService', () => {
    let galleryService: GalleryService;
    let galleryRepository: Repository<Gallery>;

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
            ],
        }).compile();

        galleryService = module.get<GalleryService>(GalleryService);
        galleryRepository = module.get<Repository<Gallery>>(getRepositoryToken(Gallery));
    });

    it('should be defined', () => {
        expect(galleryService).toBeDefined();
    });

    describe("create", () => {
        it('should create a new gallery', async () => {
            const data: Gallery = { furniture: '{"": "", "": "", "": ""}' } as any;
            const expectedGallery: Gallery = {
                galleryReports: [],
                user: undefined,
                id: 1,
                user_id: 1,
                visibility: true,
                furniture: '{"": "", "": "", "": ""}',
                name: "Living Room",
                description: "This is a beautiful living room",
                room_type: "Living Room"
            };
            jest.spyOn(galleryRepository, 'save').mockResolvedValueOnce(expectedGallery);
            const result = await galleryService.create(data);
            expect(result).toEqual(expectedGallery);
        });

        it("should return error if furniture is not JSON", async () => {
            const data: Gallery = { furniture: '{"", "", ""}' } as any;
            expect.assertions(1);
            return galleryService.create(data).catch(err => {expect(true).toEqual(true)});
        });
    });

    describe("findOne", () => {
        it("should return an existing gallery with relations", async () => {
            const where: FindOptionsWhere<Gallery> = { id: 1 };
            const relations: [FindOptionsRelations<Gallery>, string[]] = [{}, []];
            const expectedGallery: Gallery = {
                galleryReports: [],
                user: undefined,
                id: 1,
                user_id: 1,
                visibility: true,
                furniture: '{"": "", "": "", "": ""}',
                name: "Living Room",
                description: "This is a beautiful living room",
                room_type: "Living Room"
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
                furniture: '{"": "", "": "", "": ""}',
                name: "Living Room",
                description: "This is a beautiful living room",
                room_type: "Living Room"
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
            const relationOptions: [FindOptionsRelations<Gallery>, string[]] = [{}, []];
            const expectedGalleries: Gallery[] = [
                {
                    galleryReports: [],
                    user: undefined,
                    id: 1,
                    user_id: 1,
                    visibility: true,
                    furniture: '{"": "", "": "", "": ""}',
                    name: "Living Room",
                    description: "This is a beautiful living room",
                    room_type: "Living Room"
                },
                {
                    galleryReports: [],
                    user: undefined,
                    id: 2,
                    user_id: 1,
                    visibility: true,
                    furniture: '{"": "", "": "", "": ""}',
                    name: "Bedroom",
                    description: "This is a cozy bedroom",
                    room_type: "Bedroom"
                }
            ];
            jest.spyOn(galleryRepository, 'find').mockResolvedValueOnce(expectedGalleries);
            const result = await galleryService.findAll(user_id, limit, begin_pos, relationOptions);
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
                    furniture: '{"": "", "": "", "": ""}',
                    name: "Living Room",
                    description: "This is a beautiful living room",
                    room_type: "Living Room"
                },
                {
                    galleryReports: [],
                    user: undefined,
                    id: 2,
                    user_id: 1,
                    visibility: true,
                    furniture: '{"": "", "": "", "": ""}',
                    name: "Bedroom",
                    description: "This is a cozy bedroom",
                    room_type: "Bedroom"
                }
            ];
            jest.spyOn(galleryRepository, 'find').mockResolvedValueOnce(expectedGalleries);
            const result = await galleryService.findAll(null, null, null);
            expect(result).toEqual(expectedGalleries);
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
                    furniture: '{"": "", "": "", "": ""}',
                    name: "Living Room",
                    description: "This is a beautiful living room",
                    room_type: "Living Room"
                },
                {
                    galleryReports: [],
                    user: undefined,
                    id: 2,
                    user_id: 1,
                    visibility: true,
                    furniture: '{"": "", "": "", "": ""}',
                    name: "Bedroom",
                    description: "This is a cozy bedroom",
                    room_type: "Bedroom"
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
                    furniture: '{"": "", "": "", "": ""}',
                    name: "Living Room",
                    description: "This is a beautiful living room",
                    room_type: "Living Room"
                },
                {
                    galleryReports: [],
                    user: undefined,
                    id: 2,
                    user_id: 1,
                    visibility: false,
                    furniture: '{"": "", "": "", "": ""}',
                    name: "Bedroom",
                    description: "This is a cozy bedroom",
                    room_type: "Bedroom"
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
                furniture: "",
                galleryReports: [],
                id: 1,
                name: "",
                room_type: "",
                user: undefined,
                user_id: 1,
                visibility: false
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
});
