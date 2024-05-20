import { Controller, Get } from "@nestjs/common";
import { StatusService } from "./status.service";

@Controller("status")
export class StatusController {
    constructor(private readonly statusService: StatusService) {
    }

    @Get()
    status() {
        return this.statusService.getStatus();
    }
}
