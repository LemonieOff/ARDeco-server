import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UserService } from "./user.service";
import { Repository } from "typeorm";
import { User } from "./models/user.entity";

describe("UserService", () => {
    let service: UserService;
    let repository: Repository<User>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: getRepositoryToken(User),
                    useClass: Repository
                }
            ]
        }).compile();

        service = module.get<UserService>(UserService);
        repository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    describe("all", () => {
        it("should return an array of users", async () => {
            const users = [{ id: 1, email: "test@example.com" } as User];
            jest.spyOn(repository, "find").mockResolvedValueOnce(users);

            expect(await service.all()).toEqual(users);
        });
    });

    describe("create", () => {
        it("should create and return a new user", async () => {
            const user = { id: 1, email: "test@example.com" } as User;
            jest.spyOn(repository, "save").mockResolvedValueOnce(user);

            expect(await service.create(user)).toEqual(user);
        });
    });

    describe("findOne", () => {
        it("should return a user based on the provided conditions", async () => {
            const user = { id: 1, email: "test@example.com" } as User;
            jest.spyOn(repository, "findOne").mockResolvedValueOnce(user);

            expect(await service.findOne({ id: 1 })).toEqual(user);
        });
    });

    describe("findById", () => {
        it("should return a user with its galleryReports by id", async () => {
            const user = { id: 1, email: "test@example.com" } as User;
            jest.spyOn(repository, "findOne").mockResolvedValueOnce(user);

            expect(await service.findById(1)).toEqual(user);
        });
    });

    describe("update", () => {
        it("should update and return the result for a user", async () => {
            const result = { affected: 1 } as any;
            jest.spyOn(repository, "update").mockResolvedValueOnce(result);

            expect(await service.update(1, { email: "new@example.com" })).toEqual(result);
        });
    });

    describe("updateToken", () => {
        it("should update the token and return the result for a user", async () => {
            const result = { affected: 1 } as any;
            jest.spyOn(repository, "update").mockResolvedValueOnce(result);

            expect(await service.updateToken(1, "newtoken")).toEqual(result);
        });
    });

    describe("delete", () => {
        it("should delete and return the result for a user", async () => {
            const result = { affected: 1 } as any;
            jest.spyOn(repository, "delete").mockResolvedValueOnce(result);

            expect(await service.delete(1)).toEqual(result);
        });
    });
});
