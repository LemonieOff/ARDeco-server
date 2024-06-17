import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
    let appController: AppController;
    let appService: AppService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [AppService],
        }).compile();

        appController = module.get<AppController>(AppController);
        appService = module.get<AppService>(AppService);
    });

    describe('getHello', () => {
        it('should return "Hello ARDeco !"', () => {
            // Mock the getHello method of AppService
            // jest.spyOn(appService, 'getHello').mockReturnValue('Mocked Hello');

            expect(appController.getHello()).toBe('Hello ARDeco !');
        });
    });
});
