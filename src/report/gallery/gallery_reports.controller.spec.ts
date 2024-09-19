import { Test, TestingModule } from "@nestjs/testing";
import { GalleryReportsController } from "./gallery_reports.controller";
import { GalleryReportsService } from "./gallery_reports.service";
import { GalleryService } from "../../gallery/gallery.service";
import { UserService } from "../../user/user.service";
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from "express";
import { User } from "../../user/models/user.entity";
import { Gallery } from "../../gallery/models/gallery.entity";
import { PostGalleryReportDto } from "./dto/post-gallery_report.dto";
import { GalleryReport } from "./models/gallery_reports.entity";

describe("GalleryReportsController", () => {
    let controller: GalleryReportsController;
    let galleryReportsService: GalleryReportsService;
    let galleryService: GalleryService;
    let userService: UserService;

    const mockUser = new User();
    mockUser.id = 1;
    mockUser.role = "admin"; // Default user role for most tests

    const mockGallery = new Gallery();
    mockGallery.id = 10;

    const mockRequest = {
        cookies: { jwt: "validJwtToken" }
    } as Request;
    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    } as unknown as Response;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GalleryReportsController],
            providers: [
                {
                    provide: GalleryReportsService,
                    useValue: {
                        create: jest.fn(),
                        findAllByUser: jest.fn(),
                        findAllByGallery: jest.fn(),
                        findOpenByUserAndGallery: jest.fn(),
                        findOne: jest.fn(),
                        edit: jest.fn(),
                        editAll: jest.fn()
                    }
                },
                {
                    provide: GalleryService,
                    useValue: {
                        findOne: jest.fn().mockResolvedValue(mockGallery)
                    }
                },
                {
                    provide: UserService,
                    useValue: {
                        findOne: jest.fn().mockResolvedValue(mockUser)
                    }
                },
                {
                    provide: JwtService,
                    useValue: {
                        verify: jest.fn().mockReturnValue({ id: 1 })
                    }
                }
            ]
        }).compile();

        controller = module.get<GalleryReportsController>(GalleryReportsController);
        galleryReportsService = module.get<GalleryReportsService>(GalleryReportsService);
        galleryService = module.get<GalleryService>(GalleryService);
        userService = module.get<UserService>(UserService);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("reportGallery", () => {
        it("should return 400 if gallery_id is not a number", async () => {
            const postGalleryReportDto = { report_text: "Inappropriate content" };
            const result = await controller.reportGallery(
                mockRequest,
                mockResponse,
                "invalid" as any,
                postGalleryReportDto as PostGalleryReportDto
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "The id of the gallery to report must be a number",
                data: null
            });
        });

        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as Request;
            const postGalleryReportDto = { report_text: "Inappropriate content" };
            const result = await controller.reportGallery(
                req,
                mockResponse,
                10,
                postGalleryReportDto as PostGalleryReportDto
            );
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You have to login in order to report a gallery",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const postGalleryReportDto = { report_text: "Inappropriate content" };
            const result = await controller.reportGallery(
                mockRequest,
                mockResponse,
                10,
                postGalleryReportDto as PostGalleryReportDto
            );
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "User not found",
                data: null
            });
        });

        it("should return 404 if gallery is not found", async () => {
            jest.spyOn(galleryService, "findOne").mockResolvedValueOnce(null);
            const postGalleryReportDto = { report_text: "Inappropriate content" };
            const result = await controller.reportGallery(
                mockRequest,
                mockResponse,
                10,
                postGalleryReportDto as PostGalleryReportDto
            );
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "Gallery item was not found",
                data: null
            });
        });

        it("should return 409 if user has already reported the gallery", async () => {
            const postGalleryReportDto = { report_text: "Inappropriate content" };
            jest.spyOn(galleryReportsService, "findOpenByUserAndGallery")
                .mockResolvedValue(new GalleryReport() as any);
            const result = await controller.reportGallery(
                mockRequest,
                mockResponse,
                10,
                postGalleryReportDto as PostGalleryReportDto
            );
            expect(mockResponse.status).toHaveBeenCalledWith(409);
            expect(result).toEqual({
                status: "KO",
                code: 409,
                description: "You have already reported this gallery",
                data: null
            });
        });

        it("should create a report and return 201", async () => {
            const postGalleryReportDto = { report_text: "Inappropriate content" };
            const createdReport = { id: 1 } as GalleryReport;
            jest.spyOn(galleryReportsService, "create").mockResolvedValue(createdReport as any);
            jest.spyOn(galleryReportsService, "findOpenByUserAndGallery")
                .mockResolvedValue(null);
            const result = await controller.reportGallery(
                mockRequest,
                mockResponse,
                10,
                postGalleryReportDto as PostGalleryReportDto
            );
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(result).toEqual({
                status: "OK",
                code: 201,
                description: "Gallery has been reported successfully",
                data: createdReport
            });
        });

        it("should return 501 if there's an error creating the report", async () => {
            const postGalleryReportDto = { report_text: "Inappropriate content" };
            jest.spyOn(galleryReportsService, "create").mockResolvedValue(null);
            jest.spyOn(galleryReportsService, "findOpenByUserAndGallery")
                .mockResolvedValue(null);
            const result = await controller.reportGallery(
                mockRequest,
                mockResponse,
                10,
                postGalleryReportDto as PostGalleryReportDto
            );
            expect(mockResponse.status).toHaveBeenCalledWith(501);
            expect(result).toEqual({
                status: "KO",
                code: 501,
                description: "Gallery has not been reported because of an error",
                data: null
            });
        });
    });

    describe("getReportsNumber", () => {
        it("should return 400 if gallery_id is not a number", async () => {
            const result = await controller.getReportsNumber(
                mockRequest,
                mockResponse,
                "invalid" as any
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "The id of the gallery to report must be a number",
                data: null
            });
        });

        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as Request;
            const result = await controller.getReportsNumber(req, mockResponse, 10);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You have to login in order to report a gallery",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.getReportsNumber(mockRequest, mockResponse, 10);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "User not found",
                data: null
            });
        });

        it("should return 404 if gallery is not found", async () => {
            jest.spyOn(galleryService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.getReportsNumber(mockRequest, mockResponse, 10);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "Gallery item was not found",
                data: null
            });
        });

        it("should return 403 if user is not an admin", async () => {
            mockUser.role = "client";
            const result = await controller.getReportsNumber(mockRequest, mockResponse, 10);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You must be an admin to access/close gallery reports",
                data: null
            });
        });

        it("should return 200 and the number of reports", async () => {
            const mockReports = [{}, {}, {}] as GalleryReport[]; // 3 reports
            jest.spyOn(galleryReportsService, "findAllByGallery").mockResolvedValue(mockReports as any);
            jest.spyOn(controller, "checkAuthorization").mockResolvedValue([mockUser, mockGallery]);
            const result = await controller.getReportsNumber(mockRequest, mockResponse, 10);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Number of reports for this gallery",
                data: 3
            });
        });
    });

    describe("getReportsList", () => {
        // ... (Similar tests as getReportsNumber, except for the expected data and description)
        it("should return 400 if gallery_id is not a number", async () => {
            const result = await controller.getReportsList(
                mockRequest,
                mockResponse,
                "invalid" as any
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "The id of the gallery to report must be a number",
                data: null
            });
        });

        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as Request;
            const result = await controller.getReportsList(req, mockResponse, 10);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You have to login in order to report a gallery",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.getReportsList(mockRequest, mockResponse, 10);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "User not found",
                data: null
            });
        });

        it("should return 404 if gallery is not found", async () => {
            jest.spyOn(galleryService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.getReportsList(mockRequest, mockResponse, 10);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "Gallery item was not found",
                data: null
            });
        });

        it("should return 403 if user is not an admin", async () => {
            mockUser.role = "client";
            const result = await controller.getReportsList(mockRequest, mockResponse, 10);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You must be an admin to access/close gallery reports",
                data: null
            });
        });

        it("should return 200 and a list of reports", async () => {
            const mockReports = [{ id: 1 }, { id: 2 }] as GalleryReport[];
            jest.spyOn(controller, "checkAuthorization").mockResolvedValue([mockUser, mockGallery]);
            jest.spyOn(galleryReportsService, "findAllByGallery").mockResolvedValue(mockReports);
            const result = await controller.getReportsList(mockRequest, mockResponse, 10);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "List of reports for this gallery",
                data: mockReports
            });
        });
    });

    describe("closeAllReports", () => {
        it("should return 400 if gallery_id is not a number", async () => {
            const result = await controller.closeAllReports(
                mockRequest,
                mockResponse,
                "invalid" as any
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "The id of the gallery to report must be a number",
                data: null
            });
        });

        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as Request;
            const result = await controller.closeAllReports(req, mockResponse, 10);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You have to login in order to report a gallery",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.closeAllReports(mockRequest, mockResponse, 10);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "User not found",
                data: null
            });
        });

        it("should return 404 if gallery is not found", async () => {
            jest.spyOn(galleryService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.closeAllReports(mockRequest, mockResponse, 10);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "Gallery item was not found",
                data: null
            });
        });

        it("should return 403 if user is not an admin", async () => {
            mockUser.role = "client";
            const result = await controller.closeAllReports(mockRequest, mockResponse, 10);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You must be an admin to access/close gallery reports",
                data: null
            });
        });

        it("should return 404 if no reports are found for the gallery", async () => {
            const localUser = new User();
            localUser.role = "admin";
            jest.spyOn(userService, "findOne").mockResolvedValue(localUser);
            jest.spyOn(galleryReportsService, "findAllByGallery").mockResolvedValue([]);
            const result = await controller.closeAllReports(mockRequest, mockResponse, 10);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "No reports found for this gallery",
                data: null
            });
        });

        it("should close all reports and return 200", async () => {
            const mockReports = [{ id: 1 }, { id: 2 }] as GalleryReport[];
            const localUser = new User();
            localUser.role = "admin";
            jest.spyOn(userService, "findOne").mockResolvedValue(localUser);
            jest.spyOn(galleryReportsService, "findAllByGallery").mockResolvedValue(mockReports as any);
            const editMock = jest.spyOn(galleryReportsService, "editAll").mockResolvedValue({ affected: 2 } as any);
            const result = await controller.closeAllReports(mockRequest, mockResponse, 10);
            expect(editMock).toHaveBeenCalledWith({ gallery: { id: 10 }, status: "open" }, { status: "close" });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Reports have been closed successfully",
                data: 2 // Number of affected reports
            });
        });

        it("should return 501 if there's an error closing the reports", async () => {
            const mockReports = [{ id: 1 }, { id: 2 }] as GalleryReport[];
            const localUser = new User();
            localUser.role = "admin";
            jest.spyOn(userService, "findOne").mockResolvedValue(localUser);
            jest.spyOn(galleryReportsService, "findAllByGallery").mockResolvedValue(mockReports as any);
            jest.spyOn(galleryReportsService, "editAll").mockResolvedValue(null);
            const result = await controller.closeAllReports(mockRequest, mockResponse, 10);
            expect(mockResponse.status).toHaveBeenCalledWith(501);
            expect(result).toEqual({
                status: "KO",
                code: 501,
                description: "Reports have not been closed because of an error",
                data: null
            });
        });
    });

    describe("closeReport", () => {
        // ... (Similar tests as closeAllReports, with additional checks for report_id)
        it("should return 400 if gallery_id is not a number", async () => {
            const result = await controller.closeReport(
                mockRequest,
                mockResponse,
                "invalid" as any,
                1
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "The id of the gallery to report must be a number",
                data: null
            });
        });

        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as Request;
            const result = await controller.closeReport(req, mockResponse, 10, 1);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You have to login in order to report a gallery",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.closeReport(mockRequest, mockResponse, 10, 1);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "User not found",
                data: null
            });
        });

        it("should return 404 if gallery is not found", async () => {
            jest.spyOn(galleryService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.closeReport(mockRequest, mockResponse, 10, 1);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "Gallery item was not found",
                data: null
            });
        });

        it("should return 403 if user is not an admin", async () => {
            mockUser.role = "client";
            const result = await controller.closeReport(mockRequest, mockResponse, 10, 1);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "You must be an admin to access/close gallery reports",
                data: null
            });
        });

        it("should return 404 if report is not found", async () => {
            const localUser = new User();
            localUser.role = "admin";
            jest.spyOn(userService, "findOne").mockResolvedValue(localUser);
            jest.spyOn(galleryReportsService, "findOne").mockResolvedValueOnce(null);
            const result = await controller.closeReport(mockRequest, mockResponse, 10, 1);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "This report has not been found",
                data: null
            });
        });

        it("should return 404 if report is not open", async () => {
            const localUser = new User();
            localUser.role = "admin";
            jest.spyOn(userService, "findOne").mockResolvedValue(localUser);
            const mockReport = { id: 1, status: "closed" } as GalleryReport;
            jest.spyOn(galleryReportsService, "findOne").mockResolvedValueOnce(mockReport as any);
            const result = await controller.closeReport(mockRequest, mockResponse, 10, 1);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "This report has not been found",
                data: null
            });
        });

        it("should return 404 if report does not belong to gallery", async () => {
            const gallery: Gallery = { id: 11 } as Gallery;
            const mockReport: GalleryReport = {
                id: 1, gallery: gallery, status: "open",
                user: mockUser,
                report_text: "",
                datetime: undefined
            };
            const localUser = new User();
            localUser.role = "admin";
            jest.spyOn(userService, "findOne").mockResolvedValue(localUser);
            jest.spyOn(galleryReportsService, "findOne").mockResolvedValueOnce(mockReport as any);
            const result = await controller.closeReport(mockRequest, mockResponse, 10, 1);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "This report does not belong to this gallery",
                data: null
            });
        });

        it("should close the report and return 200", async () => {
            const gallery: Gallery = { id: 10 } as Gallery;
            const mockReport: GalleryReport = {
                id: 1, gallery: gallery, status: "open",
                user: mockUser,
                report_text: "",
                datetime: undefined
            };
            const localUser = new User();
            localUser.role = "admin";
            jest.spyOn(userService, "findOne").mockResolvedValue(localUser);
            jest.spyOn(galleryReportsService, "findOne").mockResolvedValueOnce(mockReport as any);
            jest.spyOn(galleryReportsService, "edit").mockResolvedValue({ affected: 1 } as any);
            const result = await controller.closeReport(mockRequest, mockResponse, 10, 1);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "OK",
                code: 200,
                description: "Report has been closed successfully",
                data: null
            });
        });

        it("should return 501 if there's an error closing the report", async () => {
            const gallery: Gallery = { id: 10 } as Gallery;
            const mockReport: GalleryReport = {
                id: 1, gallery: gallery, status: "open",
                user: mockUser,
                report_text: "",
                datetime: undefined
            };
            const localUser = new User();
            localUser.role = "admin";
            jest.spyOn(userService, "findOne").mockResolvedValue(localUser);
            jest.spyOn(galleryReportsService, "findOne").mockResolvedValueOnce(mockReport as any);
            jest.spyOn(galleryReportsService, "edit").mockResolvedValue(null);
            const result = await controller.closeReport(mockRequest, mockResponse, 10, 1);
            expect(mockResponse.status).toHaveBeenCalledWith(501);
            expect(result).toEqual({
                status: "KO",
                code: 501,
                description: "Report has not been closed because of an error",
                data: null
            });
        });
    });

    describe("checkAuthorization", () => {
        it("should return 400 if gallery_id is not a number", async () => {
            const result = await controller["checkAuthorization"](
                mockRequest,
                mockResponse,
                "invalid" as any,
                "get"
            );
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(result).toEqual({
                status: "KO",
                code: 400,
                description: "The id of the gallery to report must be a number",
                data: null
            });
        });

        it("should return 401 if user is not connected", async () => {
            const req = { cookies: {} } as Request;
            const result = await controller["checkAuthorization"](req, mockResponse, 10, "get");
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(result).toEqual({
                status: "KO",
                code: 401,
                description: "You have to login in order to report a gallery",
                data: null
            });
        });

        it("should return 403 if user is not found", async () => {
            jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
            const result = await controller["checkAuthorization"](mockRequest, mockResponse, 10, "get");
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(result).toEqual({
                status: "KO",
                code: 403,
                description: "User not found",
                data: null
            });
        });

        it("should return 404 if gallery is not found", async () => {
            jest.spyOn(galleryService, "findOne").mockResolvedValueOnce(null);
            const result = await controller["checkAuthorization"](mockRequest, mockResponse, 10, "get");
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(result).toEqual({
                status: "KO",
                code: 404,
                description: "Gallery item was not found",
                data: null
            });
        });

        describe("when type is 'post'", () => {
            it("should return 409 if user has already reported the gallery", async () => {
                jest.spyOn(galleryReportsService, "findOpenByUserAndGallery")
                    .mockResolvedValue(new GalleryReport() as any);
                const result = await controller["checkAuthorization"](mockRequest, mockResponse, 10, "post");
                expect(mockResponse.status).toHaveBeenCalledWith(409);
                expect(result).toEqual({
                    status: "KO",
                    code: 409,
                    description: "You have already reported this gallery",
                    data: null
                });
            });

            it("should return user and gallery if authorized", async () => {
                jest.spyOn(galleryReportsService, "findOpenByUserAndGallery")
                    .mockResolvedValue(null);
                const result = await controller["checkAuthorization"](mockRequest, mockResponse, 10, "post");
                expect(result).toEqual([mockUser, mockGallery]);
            });
        });

        describe("when type is not 'post'", () => {
            it("should return 403 if user is not an admin", async () => {
                mockUser.role = "client";
                const result = await controller["checkAuthorization"](mockRequest, mockResponse, 10, "get");
                expect(mockResponse.status).toHaveBeenCalledWith(403);
                expect(result).toEqual({
                    status: "KO",
                    code: 403,
                    description: "You must be an admin to access/close gallery reports",
                    data: null
                });
            });

            it("should return user and gallery if authorized", async () => {
                const localUser = new User();
                localUser.role = "admin";
                jest.spyOn(userService, "findOne").mockResolvedValue(localUser);
                jest.spyOn(galleryService, "findOne").mockResolvedValue(mockGallery);
                const result = await controller["checkAuthorization"](mockRequest, mockResponse, 10, "get");
                expect(result).toEqual([localUser, mockGallery]);
            });
        });
    });
});
