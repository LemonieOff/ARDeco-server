import { Injectable } from "@nestjs/common";

@Injectable()
export class StatusService {
    getStatus(): Object {
        return {
            api: "internal",
            version: "1.0.0",
            reachable: true,
            host: "https://api.ardeco.app",
            last_update: new Date().getTime()
        };
    }
}
