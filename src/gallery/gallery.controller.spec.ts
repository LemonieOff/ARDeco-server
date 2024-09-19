import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "../user/user.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "../user/models/user.entity";
import { JwtService } from "@nestjs/jwt";
import { GalleryService } from "./gallery.service";
import { GalleryController } from "./gallery.controller";
import { Gallery } from "./models/gallery.entity";
import { BlockedUsersService } from "../blocked_users/blocked_users.service";
import { QueryPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { DeepPartial } from "typeorm";

describe("GalleryController", () => {
    let galleryController: GalleryController;
    let galleryService: GalleryService;
    let userService: UserService;
    let blockedUserService: BlockedUsersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GalleryController],
            providers: [
                GalleryService,
                UserService,
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
                    provide: getRepositoryToken(User),
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
                    provide: JwtService,
                    useValue: {
                        signAsync: jest.fn().mockResolvedValue("token"),
                        verify: jest.fn().mockReturnValue({ id: 1 }),
                        verifyAsync: jest.fn().mockResolvedValue({ id: 1 })
                    }
                },
                {
                    provide: BlockedUsersService,
                    useValue: {
                        checkBlockedForBlocker: jest.fn()
                    }
                }
            ]
        }).compile();

        galleryController = module.get<GalleryController>(GalleryController);
        galleryService = module.get<GalleryService>(GalleryService);
        userService = module.get<UserService>(UserService);
        blockedUserService = module.get<BlockedUsersService>(BlockedUsersService);

        jest.spyOn(userService, "findOne").mockResolvedValueOnce(new User);
    });

    it("should be defined", () => {
        expect(galleryController).toBeDefined();
    });

    describe("all", () => {
        it("should return 200 and an array of galleries without user details", async () => {
            const galleries: Gallery[] = [{
                user: {
                    settings: undefined
                }
            } as Gallery, {
                user: {
                    last_name: "Hidden last name",
                    settings: {
                        display_lastname_on_public: false
                    }
                }
            } as Gallery];
            jest.spyOn(galleryService, "findAll").mockResolvedValue(galleries);
            const req = {
                cookies: { jwt: "token" },
                query: { user_id: undefined }
            } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.all(req, res);
            expect(result.status).toEqual("OK");
            expect(result.code).toEqual(200);
            expect(result.data).toEqual(galleries);
        });

        it("should return 200 and an array of galleries with user details", async () => {
            const galleries: Gallery[] = [{
                user: {
                    settings: undefined
                }
            } as Gallery, {
                user: {
                    last_name: "Hidden last name",
                    settings: {
                        display_lastname_on_public: false
                    }
                }
            } as Gallery];
            jest.spyOn(galleryService, "findAll").mockResolvedValue(galleries);
            const req = {
                cookies: { jwt: "token" },
                query: { user_details: true }
            } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.all(req, res);
            expect(result.status).toEqual("OK");
            expect(result.code).toEqual(200);
            expect(result.data).toEqual(galleries);
            expect(result.data[1].user.last_name).toEqual("");
        });

        it("should return error 401 if not connected", async () => {
            const req = { cookies: { jwt: undefined } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.all(req, res);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(401);
            expect(result.data).toBeNull();
        });

        it("should return error 400 if user_id query is defined and NaN", async () => {
            const req = {
                cookies: { jwt: "token" },
                query: { user_id: "NaN" }
            } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.all(req, res);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(400);
            expect(result.data).toEqual(null);
        });

        it("should return error 404 if user_id query is defined and user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null as any);
            const req = {
                cookies: { jwt: "token" },
                query: { user_id: 5 }
            } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.all(req, res);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(404);
            expect(result.data).toEqual(null);
        });

        it("should return error 400 if limit query is defined and NaN", async () => {
            const req = {
                cookies: { jwt: "token" },
                query: { limit: "NaN" }
            } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.all(req, res);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(400);
            expect(result.data).toEqual(null);
        });

        it("should return error 400 if begin_pos query is defined and NaN", async () => {
            const req = {
                cookies: { jwt: "token" },
                query: { begin_pos: "NaN" }
            } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.all(req, res);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(400);
            expect(result.data).toEqual(null);
        });

        it("should return error 400 if begin_pos query is defined and limit not set", async () => {
            const req = {
                cookies: { jwt: "token" },
                query: { begin_pos: 2 }
            } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.all(req, res);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(400);
            expect(result.data).toEqual(null);
        });
    });

    describe("get", () => {
        it("should return error 401 if not connected", async () => {
            const req = { cookies: { jwt: undefined } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.get(req, 1, res);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(401);
            expect(result.data).toBeNull();
        });

        it("should return 200 and specific gallery without user details", async () => {
            const gallery: Gallery = {
                user: {
                    last_name: "Hidden last name",
                    settings: {
                        display_lastname_on_public: false
                    }
                }
            } as Gallery;
            jest.spyOn(galleryService, "findOne").mockResolvedValue(gallery);
            jest.spyOn(galleryController, "checkViewGalleryAccess").mockResolvedValue(null);
            const req = {
                cookies: { jwt: "token" },
                query: { user_details: undefined }
            } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.get(req, 1, res);
            expect(result.status).toEqual("OK");
            expect(result.code).toEqual(200);
            expect(result.data).toEqual(gallery);
        });

        it("should return 200 and specific gallery with user details", async () => {
            const gallery: Gallery = {
                user: {
                    last_name: "Hidden last name",
                    settings: {
                        display_lastname_on_public: false
                    }
                }
            } as Gallery;
            jest.spyOn(galleryService, "findOne").mockResolvedValue(gallery);
            jest.spyOn(galleryController, "checkViewGalleryAccess").mockResolvedValue(null);
            const req = {
                cookies: { jwt: "token" },
                query: { user_details: true }
            } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.get(req, 1, res);
            expect(result.status).toEqual("OK");
            expect(result.code).toEqual(200);
            expect(result.data).toEqual(gallery);
        });

        it("should return error if checkViewGalleryAccess doesn't pass", async () => {
            const gallery: Gallery = {} as any;
            jest.spyOn(galleryService, "findOne").mockResolvedValue(gallery);
            jest.spyOn(galleryController, "checkViewGalleryAccess").mockResolvedValue({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            });
            const req = {
                cookies: { jwt: "token" },
                query: { user_details: undefined }
            } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.get(req, 1, res);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(401);
            expect(result.data).toEqual(null);
        });
    });

    describe("getFromUser", () => {
        it("should return error 401 if not connected", async () => {
            const req = { cookies: { jwt: undefined } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.getFromUser(req, 1, res);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(401);
            expect(result.data).toBeNull();
        });

        it("should return 200 and gallery items as an admin", async () => {
            const user: User = new User;
            user.id = 1;
            user.role = "admin";
            jest.spyOn(galleryController, "checkViewUserAccess").mockResolvedValue(null);
            const galleries: Gallery[] = [{
                user: {
                    settings: undefined
                }
            } as Gallery, {
                user: {
                    last_name: "Hidden last name",
                    settings: {
                        display_lastname_on_public: false
                    }
                }
            } as Gallery];
            jest.spyOn(galleryService, "findForUser").mockResolvedValue(galleries);
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.getFromUser(req, 4, res);
            expect(result.status).toEqual("OK");
            expect(result.code).toEqual(200);
            expect(result.data).toEqual(galleries);
        });

        it("should return 200 and gallery items as the author", async () => {
            const user: User = new User;
            user.id = 1;
            user.role = "client";
            jest.spyOn(galleryController, "checkViewUserAccess").mockResolvedValue(null);
            const galleries: Gallery[] = [{
                user: {
                    settings: undefined
                }
            } as Gallery, {
                user: {
                    last_name: "Hidden last name",
                    settings: {
                        display_lastname_on_public: false
                    }
                }
            } as Gallery];
            jest.spyOn(galleryService, "findForUser").mockResolvedValue(galleries);
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.getFromUser(req, 1, res);
            expect(result.status).toEqual("OK");
            expect(result.code).toEqual(200);
            expect(result.data).toEqual(galleries);
        });

        it("should return 200 and gallery items as another one", async () => {
            const user: User = new User;
            user.id = 1;
            user.role = "client";
            jest.spyOn(galleryController, "checkViewUserAccess").mockResolvedValue(null);
            const galleries: Gallery[] = [{
                user: {
                    settings: undefined
                }
            } as Gallery, {
                user: {
                    last_name: "Hidden last name",
                    settings: {
                        display_lastname_on_public: false
                    }
                }
            } as Gallery];
            jest.spyOn(galleryService, "findForUser").mockResolvedValue(galleries);
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.getFromUser(req, 4, res);
            expect(result.status).toEqual("OK");
            expect(result.code).toEqual(200);
            expect(result.data).toEqual(galleries);
        });

        it("should return error 400 if user id is not a number", async () => {
            jest.spyOn(galleryController, "checkViewUserAccess").mockResolvedValue({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            });
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.getFromUser(req, "NaN" as any, res);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(400);
            expect(result.data).toEqual(null);
        });

        it("should return error if checkViewUserAccess doesn't pass", async () => {
            jest.spyOn(galleryController, "checkViewUserAccess").mockResolvedValue({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            });
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.getFromUser(req, 1, res);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(401);
            expect(result.data).toEqual(null);
        });
    });

    describe("post", () => {
        it("should return 201 on created", async () => {
            jest.spyOn(userService, "findOne").mockReturnValue(null);
            const gallery: QueryPartialEntity<Gallery> = {} as any;
            jest.spyOn(galleryService, "create").mockResolvedValue(gallery as DeepPartial<Gallery>);
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.post(req, gallery, res);
            expect(result.status).toEqual("OK");
            expect(result.code).toEqual(201);
            expect(result.data).toEqual(gallery);
        });

        it("should return error 401 if user is not connected", async () => {
            const gallery: Gallery = {} as any;
            const req = { cookies: { jwt: undefined } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.post(req, gallery, res);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(401);
            expect(result.data).toBeNull();
        });

        it("should return error 403 if user is not allowed", async () => {
            (userService.findOne as jest.Mock).mockRestore();
            jest.spyOn(userService, "findOne").mockResolvedValue(null);
            const gallery: Gallery = {} as any;
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.post(req, gallery, res);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(403);
            expect(result.data).toBeNull();
        });

        it("should return error 400 on error", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValue(new Gallery as any);
            const gallery: Gallery = {} as any;
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            jest.spyOn(console, 'log').mockImplementationOnce(() => { throw new Error() }); // TODO : TEMPORARY while create is not checking JSON
            const result = await galleryController.post(req, gallery, res);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(400);
            expect(result.data).toBeNull();
        });
    });

    describe("delete", () => {
        it("should return error 401 if not connected", async () => {
            const req = { cookies: { jwt: undefined } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.deleteItem(req, 1, res);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(401);
            expect(result.data).toBeNull();
        });

        it("should return 200 on delete", async () => {
            const gallery: Gallery = {} as any;
            jest.spyOn(galleryService, "findOne").mockResolvedValue(gallery);
            jest.spyOn(galleryController, "checkPermissions").mockReturnValue(null);
            jest.spyOn(galleryService, "delete").mockResolvedValue({} as any);
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.deleteItem(req, 4, res);
            expect(result.status).toEqual("OK");
            expect(result.code).toEqual(200);
            expect(result.data).toBeDefined();
        });

        it("should return error if checkAuthorization doesn't pass", async () => {
            const gallery: Gallery = {} as any;
            jest.spyOn(galleryService, "findOne").mockResolvedValue(gallery);
            jest.spyOn(galleryController, "checkPermissions").mockReturnValue({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            });
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.deleteItem(req, 4, res);
            expect(result.status).toEqual("KO");
            expect(result.code !== 200).toBeTruthy();
            expect(result.data).toBeNull();
        });

        it("should return error 500 on server error", async () => {
            const gallery: Gallery = {} as any;
            jest.spyOn(galleryService, "findOne").mockResolvedValue(gallery);
            jest.spyOn(galleryController, "checkPermissions").mockReturnValue(null);
            jest.spyOn(galleryService, "delete").mockImplementation(() => {
                throw new Error();
            });
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.deleteItem(req, 4, res);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(500);
            expect(result.data).toEqual(gallery);
        });
    });

    describe("editViaParam", () => {
        it("should return 200 on editViaParam", async () => {
            jest.spyOn(galleryController, "editItem").mockResolvedValue({
                status: "OK",
                code: 200,
                description: "",
                data: {} as Gallery
            });
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.editViaParam(req, 4, {} as any, res);
            expect(result.status).toEqual("OK");
            expect(result.code).toEqual(200);
            expect(result.data).toBeDefined();
        });
    });

    describe("editItem", () => {
        it('should return a 401 error if the user is not authenticated', async () => {
            const notAuthenticatedError = {
                status: 'KO',
                code: 401,
                description: 'You are not connected',
                data: null
            };
            const req = { cookies: { jwt: undefined } } as any;
            const res = { status: jest.fn().mockReturnThis() } as any;
            const newItem = { name: 'Updated Gallery' };

            const result = await galleryController.editItem(req, 1, newItem, res);

            expect(result).toEqual(notAuthenticatedError);
        });

        it("should return 200 on edit", async () => {
            jest.spyOn(galleryService, "findOne").mockResolvedValue({} as any);
            jest.spyOn(galleryController, "checkPermissions").mockReturnValue(null);
            jest.spyOn(galleryService, "update").mockResolvedValue({} as any);
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.editItem(req, 4, {} as any, res);
            expect(result.status).toEqual("OK");
            expect(result.code).toEqual(200);
            expect(result.data).toBeDefined();
        });

        it("should return error when checkAuthorization doesn't pass", async () => {
            jest.spyOn(galleryService, "findOne").mockResolvedValue({} as any);
            jest.spyOn(galleryController, "checkPermissions").mockReturnValue({
                status: "KO",
                code: 401,
                description: "",
                data: null
            });
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.editItem(req, 4, {} as any, res);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(401);
            expect(result.data).toBeNull();
        });

        it("should return error 400 on error", async () => {
            jest.spyOn(galleryService, "findOne").mockResolvedValue({} as any);
            jest.spyOn(galleryController, "checkPermissions").mockReturnValue(null);
            jest.spyOn(galleryService, "update").mockImplementation(() => {
                throw new Error();
            });
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.editItem(req, 4, {} as any, res);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(400);
            expect(result.data).toBeDefined();
        });
    });

    describe("checkLogin", () => {
        it("should return user when everything is correct", async () => {
            (userService.findOne as jest.Mock).mockRestore();
            const user = new User();
            jest.spyOn(userService, "findOne").mockResolvedValue(user);
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnThis() } as any;

            const result = await galleryController.checkLogin(req, res);

            expect(result).toBe(user);
        });

        it("should return error 401 if cookie or JWT is not valid", async () => {
            const req = { cookies: { jwt: undefined } } as any;
            const res = { status: jest.fn().mockReturnThis() } as any;

            const result = await galleryController.checkLogin(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You are not connected",
                data: null
            });
        });

        it("should return error 403 if user does not exist", async () => {
            (userService.findOne as jest.Mock).mockRestore();
            jest.spyOn(userService, "findOne").mockResolvedValue(null);
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnThis() } as any;

            const result = await galleryController.checkLogin(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access/modify this gallery",
                data: null
            });
        });
    });

    describe("checkViewGalleryAccess", () => {
        it("should return null if the user is the creator", async () => {
            const user = new User();
            user.id = 1;
            const item: Gallery = {
                user_id: 1,
                user: { id: 1 }
            } as Gallery;
            const res = { status: jest.fn().mockReturnThis() } as any;

            const result = await galleryController.checkViewGalleryAccess(user, item, res);

            expect(result).toBeNull();
        });

        it("should return null if the user is an admin", async () => {
            const user = new User();
            user.role = "admin";
            const item: Gallery = {
                user_id: 2,
                user: { id: 2 }
            } as Gallery;
            const res = { status: jest.fn().mockReturnThis() } as any;

            const result = await galleryController.checkViewGalleryAccess(user, item, res);

            expect(result).toBeNull();
        });

        it("should return an error if the gallery is not found", async () => {
            const user = new User();
            const item: Gallery = null;
            const res = { status: jest.fn().mockReturnThis() } as any;

            const result = await galleryController.checkViewGalleryAccess(user, item, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "Gallery was not found",
                data: null
            });
        });

        it("should return an error if the gallery is private and the user is not the creator or an admin", async () => {
            const user = new User();
            user.id = 1;
            const item: Gallery = {
                visibility: false,
                user_id: 2,
                user: { id: 2 }
            } as Gallery;
            const res = { status: jest.fn().mockReturnThis() } as any;

            const result = await galleryController.checkViewGalleryAccess(user, item, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access this gallery",
                data: null
            });
        });

        it("should return an error if the fetcher is blocking the creator", async () => {
            const user = new User();
            user.id = 1;
            const item: Gallery = {
                visibility: true,
                user_id: 2,
                user: { id: 2 }
            } as Gallery;
            const res = { status: jest.fn().mockReturnThis() } as any;

            jest.spyOn(blockedUserService, "checkBlockedForBlocker").mockResolvedValueOnce(true);

            const result = await galleryController.checkViewGalleryAccess(user, item, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You cannot access this gallery because you have blocked its creator.",
                data: null
            });
        });

        it("should return an error if the fetcher is blocked by the creator", async () => {
            const user = new User();
            user.id = 1;
            const item: Gallery = {
                visibility: true,
                user_id: 2,
                user: { id: 2 }
            } as Gallery;
            const res = { status: jest.fn().mockReturnThis() } as any;

            jest.spyOn(blockedUserService, "checkBlockedForBlocker").mockResolvedValueOnce(false);
            jest.spyOn(blockedUserService, "checkBlockedForBlocker").mockResolvedValueOnce(true);

            const result = await galleryController.checkViewGalleryAccess(user, item, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access this gallery",
                data: null
            });
        });

        it('should return null if the gallery is public and there are no blocks', async () => {
            const user = new User();
            user.id = 1;
            user.role = 'client'; // Not an admin
            const item: Gallery = { visibility: true, user_id: 2, user: { id: 2 } } as Gallery;
            const res = { status: jest.fn().mockReturnThis() } as any;

            jest.spyOn(blockedUserService, "checkBlockedForBlocker").mockResolvedValue(false);

            const result = await galleryController.checkViewGalleryAccess(user, item, res);

            expect(result).toBeNull(); // Successful access
        });
    });

    describe("checkViewUserAccess", () => {
        it("should return null if the fetcher is the same as the user to fetch", async () => {
            const fetcher = new User();
            fetcher.id = 1;
            const userId = 1;
            const res = { status: jest.fn().mockReturnThis() } as any;

            const result = await galleryController.checkViewUserAccess(fetcher, userId, res);

            expect(result).toBeNull();
        });

        it("should return null if the fetcher is an admin", async () => {
            const fetcher = new User();
            fetcher.role = "admin";
            const userId = 2;
            const res = { status: jest.fn().mockReturnThis() } as any;

            jest.spyOn(userService, "findOne").mockResolvedValue({ id: userId } as User);

            const result = await galleryController.checkViewUserAccess(fetcher, userId, res);

            expect(result).toBeNull();
        });

        it("should return an error if the user to fetch is not found", async () => {
            (userService.findOne as jest.Mock).mockRestore();
            const fetcher = new User();
            fetcher.id = 1;
            const userId = 2;
            const res = { status: jest.fn().mockReturnThis() } as any;

            jest.spyOn(userService, "findOne").mockResolvedValue(null);

            const result = await galleryController.checkViewUserAccess(fetcher, userId, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "Gallery creator user was not found",
                data: null
            });
        });

        it("should return an error if the fetcher is blocking the user to fetch", async () => {
            const fetcher = new User();
            fetcher.id = 1;
            const userId = 2;
            const res = { status: jest.fn().mockReturnThis() } as any;

            jest.spyOn(userService, "findOne").mockResolvedValue({ id: userId } as User);
            jest.spyOn(blockedUserService, "checkBlockedForBlocker").mockResolvedValueOnce(true);

            const result = await galleryController.checkViewUserAccess(fetcher, userId, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You cannot access this user's public galleries because you have blocked them.",
                data: null
            });
        });

        it("should return an error if the fetcher is blocked by the user to fetch", async () => {
            const fetcher = new User();
            fetcher.id = 1;
            const userId = 2;
            const res = { status: jest.fn().mockReturnThis() } as any;

            jest.spyOn(userService, "findOne").mockResolvedValue({ id: userId } as User);
            jest.spyOn(blockedUserService, "checkBlockedForBlocker").mockResolvedValueOnce(false);
            jest.spyOn(blockedUserService, "checkBlockedForBlocker").mockResolvedValueOnce(true);

            const result = await galleryController.checkViewUserAccess(fetcher, userId, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to access this user's public galleries",
                data: null
            });
        });

        it('should return null if neither fetcher is blocking the user to fetch nor is blocked by them', async () => {
            const fetcher = new User();
            fetcher.id = 1;
            fetcher.role = 'client'; // Not an admin
            const userId = 2;
            const res = { status: jest.fn().mockReturnThis() } as any;

            jest.spyOn(userService, 'findOne').mockResolvedValue({ id: userId } as User);
            jest.spyOn(blockedUserService, "checkBlockedForBlocker").mockResolvedValue(false);

            const result = await galleryController.checkViewUserAccess(fetcher, userId, res);

            expect(result).toBeNull(); // Successful access
        });
    });

    describe("checkPermissions", () => {
        it("should return null when the user is the creator", async () => {
            const user = new User();
            user.id = 1;
            const item: Gallery = { user_id: 1 } as Gallery;
            const res = { status: jest.fn().mockReturnThis() } as any;

            const result = galleryController.checkPermissions(user, res, item, "modify");

            expect(result).toBeNull();
        });

        it("should return null when the user is an admin", async () => {
            const user = new User();
            user.role = "admin";
            const item: Gallery = { user_id: 2 } as Gallery;
            const res = { status: jest.fn().mockReturnThis() } as any;

            const result = galleryController.checkPermissions(user, res, item, "modify");

            expect(result).toBeNull();
        });

        it("should return an error if the item is not found", async () => {
            const user = new User();
            const item: Gallery = null;
            const res = { status: jest.fn().mockReturnThis() } as any;

            const result = galleryController.checkPermissions(user, res, item, "modify");

            expect(res.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "Gallery was not found",
                data: null
            });
        });

        it("should return an error if the user is not the creator or an admin for modify action", async () => {
            const user = new User();
            user.id = 1;
            user.role = "client";
            const item: Gallery = { user_id: 2 } as Gallery;
            const res = { status: jest.fn().mockReturnThis() } as any;

            const result = galleryController.checkPermissions(user, res, item, "modify");

            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to modify this gallery",
                data: null
            });
        });

        it("should return an error if the user is not the creator or an admin for delete action", async () => {
            const user = new User();
            user.id = 1;
            user.role = "client";
            const item: Gallery = { user_id: 2 } as Gallery;
            const res = { status: jest.fn().mockReturnThis() } as any;

            const result = galleryController.checkPermissions(user, res, item, "delete");

            expect(res.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You are not allowed to delete this gallery",
                data: null
            });
        });
    });

    describe('getSelect', () => {
        it('should return default select and relations when no query parameters are provided', () => {
            const req = { query: {} } as any;

            const [select, relations] = galleryController.getSelect(req);

            expect(select).toEqual({
                id: true,
                visibility: true,
                description: true,
                model_data: true,
                name: true,
                room: true,
                style: true,
                comments: {
                    id: true
                },
                user: {
                    id: true
                }
            });
            expect(relations).toEqual({
                comments: true,
                user: true
            });
        });

        it('should include user details when user_details query parameter is provided', () => {
            const req = { query: { user_details: 'true' } } as any;

            const [select, relations] = galleryController.getSelect(req);

            expect(select).toMatchObject({
                user: {
                    id: true,
                    role: true,
                    first_name: true,
                    last_name: true,
                    profile_picture_id: true,
                    settings: {
                        display_lastname_on_public: true
                    }
                }
            });
            expect(relations).toMatchObject({
                user: {
                    settings: true
                }
            });
        });

        it('should include all comment details when comments_details query parameter is provided', () => {
            const req = { query: { comments_details: 'true' } } as any;

            const [select, relations] = galleryController.getSelect(req);

            // We expect the select object to include all comment details
            expect(select.comments).toBe(true);

            // Relations should remain unchanged
            expect(relations).toEqual({
                comments: true,
                user: true
            });
        });
    });
});
