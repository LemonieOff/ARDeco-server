import { Test, TestingModule } from "@nestjs/testing";
import { StatusService } from "./status.service";

describe("GalleryService", () => {
    let statusService: StatusService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StatusService
            ]
        }).compile();

        statusService = module.get<StatusService>(StatusService);
    });

    it("should be defined", () => {
        expect(statusService).toBeDefined();
    });

    describe("getStatus", () => {
        it("should return status", () => {
            const result = statusService.getStatus();
            expect(result).toBeDefined();
            expect(result).toMatchObject(expect.objectContaining({
                api: "internal",
                reachable: true,
                host: "https://api.ardeco.app"
            }));
        });
    });
});
