import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "../user/user.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "../user/models/user.entity";
import { JwtService } from "@nestjs/jwt";
import { GalleryService } from "./gallery.service";
import { GalleryController } from "./gallery.controller";
import { Gallery } from "./models/gallery.entity";

describe("GalleryController", () => {
    let galleryController: GalleryController;
    let galleryService: GalleryService;
    let userService: UserService;
    let jwtService: JwtService;

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
                }
            ]
        }).compile();

        galleryController = module.get<GalleryController>(GalleryController);
        galleryService = module.get<GalleryService>(GalleryService);
        userService = module.get<UserService>(UserService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it("should be defined", () => {
        expect(galleryController).toBeDefined();
    });

    describe("all", () => {
        it("should return 200 and an array of galleries without user details", async () => {
            const galleries: Gallery[] = [{} as any, {} as any];
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
            const galleries: Gallery[] = [{} as any, {} as any];
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
            jest.spyOn(userService, "findOne").mockResolvedValue(null as any);
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
        it("should return 200 and specific gallery without user details", async () => {
            const gallery: Gallery = {} as any;
            jest.spyOn(galleryService, "findOne").mockResolvedValue(gallery);
            jest.spyOn(galleryController, "checkAuthorization").mockResolvedValue(new User);
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
            const gallery: Gallery = {} as any;
            jest.spyOn(galleryService, "findOne").mockResolvedValue(gallery);
            jest.spyOn(galleryController, "checkAuthorization").mockResolvedValue(new User);
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

        it("should return error if checkAuthorization doesn't pass", async () => {
            const gallery: Gallery = {} as any;
            jest.spyOn(galleryService, "findOne").mockResolvedValue(gallery);
            jest.spyOn(galleryController, "checkAuthorization").mockResolvedValue({
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
        it("should return 200 and gallery items as an admin", async () => {
            const user: User = new User;
            user.id = 1;
            user.role = "admin";
            jest.spyOn(galleryController, "checkAuthorization").mockResolvedValue(user);
            const galleries: Gallery[] = [{} as any, {} as any];
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
            jest.spyOn(galleryController, "checkAuthorization").mockResolvedValue(user);
            const galleries: Gallery[] = [{} as any, {} as any];
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
            jest.spyOn(galleryController, "checkAuthorization").mockResolvedValue(user);
            const galleries: Gallery[] = [{} as any, {} as any];
            jest.spyOn(galleryService, "findForUser").mockResolvedValue(galleries);
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.getFromUser(req, 4, res);
            expect(result.status).toEqual("OK");
            expect(result.code).toEqual(200);
            expect(result.data).toEqual(galleries);
        });

        it("should return error 400 if user id is not a number", async () => {
            jest.spyOn(galleryController, "checkAuthorization").mockResolvedValue({
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

        it("should return error if checkAuthorization doesn't pass", async () => {
            jest.spyOn(galleryController, "checkAuthorization").mockResolvedValue({
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
            jest.spyOn(userService, "findOne").mockResolvedValue(new User);
            const gallery: Gallery = {} as any;
            jest.spyOn(galleryService, "create").mockResolvedValue(gallery);
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
            const result = await galleryController.post(req, gallery, res);
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(400);
            expect(result.data).toBeNull();
        });
    });

    describe("delete", () => {
        it("should return 200 on delete", async () => {
            const gallery: Gallery = {} as any;
            jest.spyOn(galleryService, "findOne").mockResolvedValue(gallery);
            jest.spyOn(galleryController, "checkAuthorization").mockResolvedValue(new User);
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
            jest.spyOn(galleryController, "checkAuthorization").mockResolvedValue({
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
            jest.spyOn(galleryController, "checkAuthorization").mockResolvedValue(new User);
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
                data: {}
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
        it("should return 200 on edit", async () => {
            jest.spyOn(galleryService, "findOne").mockResolvedValue({} as any);
            jest.spyOn(galleryController, "checkAuthorization").mockResolvedValue(new User);
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
            jest.spyOn(galleryController, "checkAuthorization").mockResolvedValue({
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
            jest.spyOn(galleryController, "checkAuthorization").mockResolvedValue(new User);
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

    describe("checkAuthorization", () => {
        it("should return user when everything is correct", async () => {
            const user = new User;
            jest.spyOn(userService, "findOne").mockResolvedValue(user);
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const item: Gallery = { visibility: true } as any;
            const result = await galleryController.checkAuthorization(req, res, item, "view");
            expect(result).toMatchObject(user);
        });

        it("should return error 404 if item doesn't exist for view action", async () => {
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.checkAuthorization(req, res, null, "view");
            if (result instanceof User) {
                fail("Result should not be an instance of User");
            }
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(404);
            expect(result.data).toBeNull();
        });

        it("should return error 404 if item doesn't exist for edit action", async () => {
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.checkAuthorization(req, res, null, "edit");
            if (result instanceof User) {
                fail("Result should not be an instance of User");
            }
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(404);
            expect(result.data).toBeNull();
        });

        it("should return error 404 if item doesn't exist for delete action", async () => {
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const result = await galleryController.checkAuthorization(req, res, null, "delete");
            if (result instanceof User) {
                fail("Result should not be an instance of User");
            }
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(404);
            expect(result.data).toBeNull();
        });

        it("should return error 401 if user is not connected", async () => {
            const req = { cookies: { jwt: undefined } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const item: Gallery = { visibility: true } as any;
            const result = await galleryController.checkAuthorization(req, res, item, "view");
            if (result instanceof User) {
                fail("Result should not be an instance of User");
            }
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(401);
            expect(result.data).toBeNull();
        });

        it("should return error 403 if user doesn't exist", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValue(null);
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const item: Gallery = { visibility: true } as any;
            const result = await galleryController.checkAuthorization(req, res, item, "view");
            if (result instanceof User) {
                fail("Result should not be an instance of User");
            }
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(403);
            expect(result.data).toBeNull();
        });

        it("should return error 403 if user is not the creator nor an admin for view action if item is private", async () => {
            const user = new User;
            user.id = 1;
            user.role = "client";
            jest.spyOn(userService, "findOne").mockResolvedValue(user);
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const item: Gallery = {
                visibility: false,
                user_id: 4
            } as any;
            const result = await galleryController.checkAuthorization(req, res, item, "view");
            if (result instanceof User) {
                fail("Result should not be an instance of User");
            }
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(403);
            expect(result.data).toBeNull();
        });

        it("should return user if user is not the creator but an admin for view action if item is private", async () => {
            const user = new User;
            user.id = 1;
            user.role = "admin";
            jest.spyOn(userService, "findOne").mockResolvedValue(user);
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const item: Gallery = {
                visibility: false,
                user_id: 4
            } as any;
            const result = await galleryController.checkAuthorization(req, res, item, "view");
            expect(result).toMatchObject(user);
        });

        it("should return error 403 if user is not the creator nor an admin for edit action", async () => {
            const user = new User;
            user.id = 1;
            user.role = "client";
            jest.spyOn(userService, "findOne").mockResolvedValue(user);
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const item: Gallery = {
                visibility: false,
                user_id: 4
            } as any;
            const result = await galleryController.checkAuthorization(req, res, item, "edit");
            if (result instanceof User) {
                fail("Result should not be an instance of User");
            }
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(403);
            expect(result.data).toBeNull();
        });

        it("should return user if user is not the creator but an admin for edit action", async () => {
            const user = new User;
            user.id = 1;
            user.role = "admin";
            jest.spyOn(userService, "findOne").mockResolvedValue(user);
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const item: Gallery = {
                visibility: false,
                user_id: 4
            } as any;
            const result = await galleryController.checkAuthorization(req, res, item, "edit");
            expect(result).toMatchObject(user);
        });

        it("should return error 403 if user is not the creator nor an admin for delete action", async () => {
            const user = new User;
            user.id = 1;
            user.role = "client";
            jest.spyOn(userService, "findOne").mockResolvedValue(user);
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const item: Gallery = {
                visibility: false,
                user_id: 4
            } as any;
            const result = await galleryController.checkAuthorization(req, res, item, "delete");
            if (result instanceof User) {
                fail("Result should not be an instance of User");
            }
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(403);
            expect(result.data).toBeNull();
        });

        it("should return user if user is not the creator but an admin for delete action", async () => {
            const user = new User;
            user.id = 1;
            user.role = "admin";
            jest.spyOn(userService, "findOne").mockResolvedValue(user);
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const item: Gallery = {
                visibility: false,
                user_id: 4
            } as any;
            const result = await galleryController.checkAuthorization(req, res, item, "delete");
            expect(result).toMatchObject(user);
        });

        it("should return error 501 if user_id is not passed for user_gallery action", async () => {
            const user = new User;
            jest.spyOn(userService, "findOne").mockResolvedValue(user);
            const req = { cookies: { jwt: "token" } } as any;
            const res = { status: jest.fn().mockReturnValue(this) } as any;
            const item: Gallery = { visibility: true } as any;
            const result = await galleryController.checkAuthorization(req, res, item, "user_gallery");
            if (result instanceof User) {
                fail("Result should not be an instance of User");
            }
            expect(result.status).toEqual("KO");
            expect(result.code).toEqual(501);
            expect(result.data).toBeNull();
        });
    });
});
