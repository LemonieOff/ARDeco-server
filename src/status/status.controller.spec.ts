import { Test, TestingModule } from "@nestjs/testing";
import { StatusController } from "./status.controller";
import { StatusService } from "./status.service";

describe("CompanyController", () => {
    let statusController: StatusController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [StatusController],
            providers: [StatusService]
        }).compile();

        statusController = module.get<StatusController>(StatusController);
    });

    it("should be defined", () => {
        expect(statusController).toBeDefined();
    });

    describe("status", () => {
        it("should return status", () => {
            const result = statusController.status();
            expect(result).toBeDefined();
            expect(result).toMatchObject(expect.objectContaining({
                api: "internal",
                reachable: true,
                host: "https://api.ardeco.app"
            }));
        });
    });
});
