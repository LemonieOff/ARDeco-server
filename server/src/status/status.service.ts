import { Injectable } from '@nestjs/common';

@Injectable()
export class StatusService {
    getStatus(): Object {
        return {
            api: "internal",
            version: "0.0.1",
            reachable: true,
            host: "localhost",
            last_update: new Date().getTime()
        };
    }

    notAllowed(method: string): Object {
        return {
            message: `Not allowed method ${method.toUpperCase()}, use GET instead.`
        };
    }
}
