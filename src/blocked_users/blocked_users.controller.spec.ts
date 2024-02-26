import { Test, TestingModule } from "@nestjs/testing";
import { BlockedUsersController } from "./blocked_users.controller";
import { BlockedUsersService } from "./blocked_users.service";

describe('BlockedUsersController', () => {
  let controller: BlockedUsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlockedUsersController],
      providers: [BlockedUsersService],
    }).compile();

    controller = module.get<BlockedUsersController>(BlockedUsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

