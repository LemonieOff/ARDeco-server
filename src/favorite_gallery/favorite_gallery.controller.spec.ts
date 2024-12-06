import { Test, TestingModule } from "@nestjs/testing";
import { FavoriteGalleryController } from "./favorite_gallery.controller";
import { FavoriteGalleryService } from "./favorite_gallery.service";
import { Request, Response } from "express";
import { User } from "../user/models/user.entity";
import { Gallery } from "../gallery/models/gallery.entity";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { GalleryService } from "../gallery/gallery.service";

describe("FavoriteGalleryController", () => {
    let controller: FavoriteGalleryController;
    let favGalleryService: Partial<FavoriteGalleryService>;
    let jwtService: Partial<JwtService>;
    let userService: Partial<UserService>;
    let galleryService: Partial<GalleryService>;

    beforeEach(async () => {
        favGalleryService = {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            delete: jest.fn()
        };

        jwtService = {
            verify: jest.fn()
        };

        userService = {
            findOne: jest.fn()
        };

        galleryService = {
            findOne: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [FavoriteGalleryController],
            providers: [
                { provide: FavoriteGalleryService, useValue: favGalleryService },
                { provide: JwtService, useValue: jwtService },
                { provide: UserService, useValue: userService },
                { provide: GalleryService, useValue: galleryService }
            ]
        }).compile();

        controller = module.get<FavoriteGalleryController>(FavoriteGalleryController);
    });

    describe("all", () => {
        it("should return favorite gallery items when authorized", async () => {
            const req = { cookies: { jwt: "someToken" }, query: {} } as unknown as Request;
            const res = { status: jest.fn() } as unknown as Response;
            const user = { id: 1, role: "user" } as User;
            (controller as any).checkAuthorization = jest.fn().mockResolvedValue(user);
            const galleryItems = [{ gallery: { user: { settings: { display_lastname_on_public: true } } } }];
            (favGalleryService.findAll as jest.Mock).mockResolvedValue(galleryItems);
            res.status = jest.fn().mockReturnValue(res);

            const result = await controller.all(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(result.status).toBe("OK");
        });
    });

    describe("isFavorite", () => {
        it("should return the favorite status of a gallery", async () => {
            const req = { cookies: { jwt: "someToken" } } as unknown as Request;
            const res = { status: jest.fn() } as unknown as Response;
            const galleryId = 1;
            const user = { id: 1 } as User;
            (controller as any).checkAuthorization = jest.fn().mockResolvedValue(user);
            (favGalleryService.findOne as jest.Mock).mockResolvedValue({});

            const result = await controller.isFavorite(req, res, galleryId);

            expect(result.data).toBe(true);
        });
    });

    describe("post", () => {
        it("should add a gallery to favorites", async () => {
            const req = { cookies: { jwt: "someToken" } } as unknown as Request;
            const res = { status: jest.fn() } as unknown as Response;
            const galleryId = 1;
            const user = { id: 1 } as User;
            const gallery = { id: galleryId } as Gallery;
            (controller as any).checkAuthorization = jest.fn().mockResolvedValue(user);
            (galleryService.findOne as jest.Mock).mockResolvedValue(gallery);
            (favGalleryService.findOne as jest.Mock).mockResolvedValue(null);
            (favGalleryService.create as jest.Mock).mockResolvedValue({});

            const result = await controller.post(req, galleryId, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(result.status).toBe("OK");
        });
    });

    describe("deleteItem", () => {
        it("should remove a gallery from favorites", async () => {
            const req = { cookies: { jwt: "someToken" } } as unknown as Request;
            const res = { status: jest.fn() } as unknown as Response;
            const galleryId = 1;
            const user = { id: 1 } as User;
            const gallery = { user_id: user.id } as Gallery;
            (controller as any).checkAuthorization = jest.fn().mockResolvedValue(user);
            (favGalleryService.findOne as jest.Mock).mockResolvedValue(gallery);
            (favGalleryService.delete as jest.Mock).mockResolvedValue(null);

            const result = await controller.deleteItem(req, galleryId, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(result.status).toBe("OK");
        });
    });
});
