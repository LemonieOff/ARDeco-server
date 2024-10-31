import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository, UpdateResult } from "typeorm";
import { User } from "./models/user.entity";
import { UserSettings } from "../user_settings/models/user_settings.entity";

describe("UserService", () => {
    let userService: UserService;
    let userRepository: Repository<User>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
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
                }
            ]
        }).compile();

        userService = module.get<UserService>(UserService);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    it("should be defined", () => {
        expect(userService).toBeDefined();
    });

    describe("all", () => {
        it("should return an array of users", async () => {
            const users: User[] = [
                {
                    id: 1,
                    first_name: "Test",
                    last_name: "User",
                    email: "test@example.com",
                    password: "password",
                    deleted: false,
                    role: "client",
                    company_api_key: null,
                    cart: null,
                    galleries: [],
                    galleryReports: [],
                    profile_picture_id: 0,
                    phone: "",
                    city: "",
                    checkEmailToken: "",
                    checkEmailSent: undefined,
                    hasCheckedEmail: false,
                    galleryComments: [],
                    feedbacks: [],
                    settings: {} as UserSettings,
                    galleryLikes: [],
                    blocking: [],
                    blocked_by: [],
                    favorite_galleries: [],
                    favorite_furniture: []
                }
            ];
            jest.spyOn(userRepository, "find").mockResolvedValue(users);
            expect(await userService.all()).toEqual(users);
        });
    });

    describe("create", () => {
        it("should create a new user", async () => {
            const user: User = {
                blocked_by: [], blocking: [], favorite_furniture: [], favorite_galleries: [], galleryLikes: [],
                feedbacks: [],
                settings: undefined,
                city: "",
                phone: "",
                id: 1,
                first_name: "Test",
                last_name: "User",
                email: "test@example.com",
                password: "password",
                deleted: false,
                role: "client",
                company_api_key: null,
                cart: null,
                galleries: [],
                galleryReports: [],
                profile_picture_id: 0,
                checkEmailToken: "",
                checkEmailSent: undefined,
                hasCheckedEmail: false,
                galleryComments: []
            };
            jest.spyOn(userRepository, "save").mockResolvedValue(user);
            expect(await userService.create(user)).toEqual(user);
        });
    });

    describe("findOne", () => {
        it("should return a user by email", async () => {
            const user: User = {
                blocked_by: [], blocking: [], favorite_furniture: [], favorite_galleries: [], galleryLikes: [],
                feedbacks: [],
                settings: undefined,
                city: "",
                phone: "",
                id: 1,
                first_name: "Test",
                last_name: "User",
                email: "test@example.com",
                password: "password",
                deleted: false,
                role: "client",
                company_api_key: null,
                cart: null,
                galleries: [],
                galleryReports: [],
                profile_picture_id: 0,
                checkEmailToken: "",
                checkEmailSent: undefined,
                hasCheckedEmail: false,
                galleryComments: []
            };
            jest.spyOn(userRepository, "findOne").mockResolvedValue(user);
            expect(await userService.findOne({ email: "test@example.com" })).toEqual(user);
        });
    });

    describe("findById", () => {
        it("should return a user by id", async () => {
            const user: User = {
                blocked_by: [], blocking: [], favorite_furniture: [], favorite_galleries: [], galleryLikes: [],
                feedbacks: [],
                settings: undefined,
                city: "",
                phone: "",
                id: 1,
                first_name: "Test",
                last_name: "User",
                email: "test@example.com",
                password: "password",
                deleted: false,
                role: "client",
                company_api_key: null,
                cart: null,
                galleries: [],
                galleryReports: [],
                profile_picture_id: 0,
                checkEmailToken: "",
                checkEmailSent: undefined,
                hasCheckedEmail: false,
                galleryComments: []
            };
            jest.spyOn(userRepository, "findOne").mockResolvedValue(user);
            expect(await userService.findById(1)).toEqual(user);
        });
    });

    describe("update", () => {
        it("should update a user", async () => {
            const user: User = {
                blocked_by: [], blocking: [], favorite_furniture: [], favorite_galleries: [], galleryLikes: [],
                feedbacks: [],
                settings: undefined,
                city: "",
                phone: "",
                id: 1,
                first_name: "Test",
                last_name: "User",
                email: "test@example.com",
                password: "password",
                deleted: false,
                role: "client",
                company_api_key: null,
                cart: null,
                galleries: [],
                galleryReports: [],
                profile_picture_id: 0,
                checkEmailToken: "",
                checkEmailSent: undefined,
                hasCheckedEmail: false,
                galleryComments: []
            };
            jest.spyOn(userRepository, "update").mockResolvedValue({ affected: 1 } as UpdateResult);
            const result = await userService.update(1, user);
            expect(result).toBeDefined();
            expect(result.affected).toBeDefined();
            expect(result.affected).toEqual(1);
        });
    });

    describe("delete", () => {
        it("should delete a user", async () => {
            jest.spyOn(userRepository, "createQueryBuilder").mockReturnValue({
                delete: jest.fn().mockReturnValue({
                    from: jest.fn().mockReturnValue({
                        where: jest.fn().mockReturnValue({
                            execute: jest.fn()
                        })
                    })
                })
            } as any);
            const result = await userService.delete(1);
            expect(result).toBeUndefined();
        });
    });
});

