import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import { Ticket } from "./models/ticket.entity";
import { TicketService } from "./ticket.service";

describe("TicketService", () => {
    let service: TicketService;
    let ticketRepository: Repository<Ticket>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TicketService,
                {
                    provide: getRepositoryToken(Ticket),
                    useValue: {
                        find: jest.fn(),
                        save: jest.fn(),
                        findOne: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                        createQueryBuilder: jest.fn(() => ({
                            delete: jest.fn().mockReturnThis(),
                            from: jest.fn().mockReturnThis(),
                            where: jest.fn().mockReturnThis(),
                            execute: jest.fn()
                        }))
                    }
                }
            ]
        }).compile();

        service = module.get<TicketService>(TicketService);
        ticketRepository = module.get<Repository<Ticket>>(getRepositoryToken(Ticket));
    });

    describe("all", () => {
        it("should return all tickets", async () => {
            const mockTickets = [new Ticket(), new Ticket()];
            jest.spyOn(ticketRepository, "find").mockResolvedValue(mockTickets);

            const result = await service.all();
            expect(result).toEqual(mockTickets);
        });
    });

    describe("allForUser", () => {
        it("should return all tickets for a user with given ID", async () => {
            const userId = 1;
            const mockTickets = [
                {
                    id: 1,
                    title: "Ticket 1",
                    status: "open",
                    description: "description 1"
                },
                {
                    id: 2,
                    title: "Ticket 2",
                    status: "closed",
                    description: "description 2"
                }
            ];
            jest.spyOn(ticketRepository, "find").mockResolvedValue(mockTickets as any);

            const result = await service.allForUser(userId);
            expect(ticketRepository.find).toHaveBeenCalledWith({
                where: {
                    user_id: userId,
                    status: Not("deleted")
                },
                select: ["id", "title", "status", "description"]
            });
            expect(result).toEqual(mockTickets);
        });
    });

    describe("create", () => {
        it("should create a new ticket", async () => {
            const data = {
                title: "New Ticket",
                user_init_id: 1
            };
            const createdTicket = { id: 1, ...data };
            jest.spyOn(ticketRepository, "save").mockResolvedValue(createdTicket as any);

            const result = await service.create(data);
            expect(result).toEqual(createdTicket);
        });
    });

    describe("findOne", () => {
        it("should find a ticket by condition", async () => {
            const condition = { id: 1 };
            const mockTicket = new Ticket();
            jest.spyOn(ticketRepository, "findOne").mockResolvedValue(mockTicket);

            const result = await service.findOne(condition);
            expect(result).toEqual(mockTicket);
        });
    });

    describe("update", () => {
        it("should update a ticket and return the updated ticket", async () => {
            const id = 1;
            const data = { title: "Updated Ticket" };
            const updatedTicket = {
                id: 1,
                title: "Updated Ticket"
            };
            jest.spyOn(ticketRepository, "update").mockResolvedValue({ affected: 1 } as any);
            jest.spyOn(ticketRepository, "findOne").mockResolvedValue(updatedTicket as any);

            const result = await service.update(id, data);
            expect(result).toEqual(updatedTicket);
        });
    });

    describe("delete", () => {
        it("should delete a ticket", async () => {
            const id = 1;
            const mock = {
                delete: jest.fn().mockReturnValue({
                    from: jest.fn().mockReturnValue({
                        where: jest.fn().mockReturnValue({
                            execute: jest.fn().mockReturnValue({
                                raw: [],
                                affected: 1
                            })
                        })
                    })
                })
            };
            jest.spyOn(ticketRepository, "createQueryBuilder").mockReturnValue(mock as any);

            const result = await service.delete(id);
            expect(mock.delete).toHaveBeenCalled();
            expect(result).toEqual({
                raw: [],
                affected: 1
            });
        });
    });
})
;
