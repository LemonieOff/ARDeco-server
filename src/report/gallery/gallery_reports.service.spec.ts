import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { GalleryReport } from "./models/gallery_reports.entity";
import { GalleryReportsService } from "./gallery_reports.service";
import { User } from "../../user/models/user.entity";
import { Gallery } from "../../gallery/models/gallery.entity";
import { UpdateGalleryReportDto } from "./dto/update-gallery_report.dto";

describe("GalleryReportsService", () => {
    let service: GalleryReportsService;
    let galleryReportRepository: Repository<GalleryReport>;

    const mockUser = new User();
    mockUser.id = 1;

    const mockGallery = new Gallery();
    mockGallery.id = 10;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GalleryReportsService,
                {
                    provide: getRepositoryToken(GalleryReport),
                    useValue: {
                        save: jest.fn(),
                        find: jest.fn(),
                        findOne: jest.fn(),
                        update: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<GalleryReportsService>(GalleryReportsService);
        galleryReportRepository = module.get<Repository<GalleryReport>>(
            getRepositoryToken(GalleryReport)
        );
    });

    describe("create", () => {
        it("should create a new gallery report", async () => {
            const reportText = "This gallery is inappropriate";
            const newReport = {
                id: 1,
                user: mockUser,
                gallery: mockGallery,
                report_text: reportText,
                status: "open"
            };

            jest.spyOn(galleryReportRepository, "save").mockResolvedValue(newReport as any);

            const result = await service.create(mockUser, mockGallery, reportText);
            expect(result).toEqual(newReport);
            expect(galleryReportRepository.save).toHaveBeenCalledWith({
                user: mockUser,
                gallery: mockGallery,
                report_text: reportText,
                status: "open"
            });
        });
    });

    describe("findAllByUser", () => {
        it("should find all reports by user", async () => {
            const userId = 1;
            const mockReports = [new GalleryReport(), new GalleryReport()];

            jest.spyOn(galleryReportRepository, "find").mockResolvedValue(mockReports);

            const result = await service.findAllByUser(userId);
            expect(result).toEqual(mockReports);
            expect(galleryReportRepository.find).toHaveBeenCalledWith({
                where: { user: { id: userId } }
            });
        });
    });

    describe("findAllByGallery", () => {
        it("should find all reports by gallery", async () => {
            const galleryId = 10;
            const mockReports = [new GalleryReport(), new GalleryReport()];

            jest.spyOn(galleryReportRepository, "find").mockResolvedValue(mockReports);

            const result = await service.findAllByGallery(galleryId);
            expect(result).toEqual(mockReports);
            expect(galleryReportRepository.find).toHaveBeenCalledWith({
                where: { gallery: { id: galleryId } },
                loadRelationIds: true
            });
        });

        it("should find all reports by gallery with additional conditions", async () => {
            const galleryId = 10;
            const where: FindOptionsWhere<GalleryReport> = { status: "open" };
            const mockReports = [new GalleryReport(), new GalleryReport()];

            jest.spyOn(galleryReportRepository, "find").mockResolvedValue(mockReports);

            const result = await service.findAllByGallery(galleryId, where);
            expect(result).toEqual(mockReports);
            expect(galleryReportRepository.find).toHaveBeenCalledWith({
                where: {
                    gallery: { id: galleryId },
                    status: "open"
                },
                loadRelationIds: true
            });
        });
    });

    // ... (imports and other tests remain the same)

    describe("findOpenByUserAndGallery", () => {
        it("should find an open report by user and gallery", async () => {
            const userId = 1;
            const galleryId = 10;
            const mockReport = new GalleryReport();

            jest.spyOn(galleryReportRepository, "findOne").mockResolvedValue(mockReport);

            const result = await service.findOpenByUserAndGallery(userId, galleryId);
            expect(result).toEqual(mockReport);
            expect(galleryReportRepository.findOne).toHaveBeenCalledWith({
                where: {
                    user: { id: userId },
                    gallery: { id: galleryId },
                    status: "open"
                }
            });
        });

        it("should return null if no open report is found", async () => {
            const userId = 1;
            const galleryId = 10;

            jest.spyOn(galleryReportRepository, "findOne").mockResolvedValue(null);

            const result = await service.findOpenByUserAndGallery(userId, galleryId);
            expect(result).toBeNull();
        });
    });

    describe("findOne", () => {
        it("should find a report by ID", async () => {
            const reportId = 1;
            const mockReport = new GalleryReport();

            jest.spyOn(galleryReportRepository, "findOne").mockResolvedValue(mockReport);

            const result = await service.findOne(reportId);
            expect(result).toEqual(mockReport);
            expect(galleryReportRepository.findOne).toHaveBeenCalledWith({
                where: { id: reportId },
                loadRelationIds: true
            });
        });

        it("should return null if no report is found", async () => {
            const reportId = 1;

            jest.spyOn(galleryReportRepository, "findOne").mockResolvedValue(null);

            const result = await service.findOne(reportId);
            expect(result).toBeNull();
        });
    });

    describe("edit", () => {
        it("should update a report by ID", async () => {
            const reportId = 1;
            const updateGalleryReportDto: UpdateGalleryReportDto = {
                status: "closed"
            };

            const mockReport = new GalleryReport();
            jest.spyOn(galleryReportRepository, "findOne").mockResolvedValue(mockReport); // For error handling
            jest.spyOn(galleryReportRepository, "update").mockResolvedValue({ affected: 1 } as any);

            await service.edit(reportId, updateGalleryReportDto);

            expect(galleryReportRepository.update).toHaveBeenCalledWith(reportId, updateGalleryReportDto);
        });
    });

    describe("editAll", () => {
        it("should update multiple reports by condition", async () => {
            const where: FindOptionsWhere<GalleryReport> = { status: "open" };
            const updateGalleryReportDto: UpdateGalleryReportDto = {
                status: "pending review"
            };

            jest.spyOn(galleryReportRepository, "update").mockResolvedValue({ affected: 2 } as any);

            const result = await service.editAll(where, updateGalleryReportDto);
            expect(result.affected).toBe(2);
            expect(galleryReportRepository.update).toHaveBeenCalledWith(
                where,
                updateGalleryReportDto
            );
        });
    });

});
