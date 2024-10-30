import * as util from "node:util";

export function logObject(object: object): string {
    return util.inspect(object, { colors: true });
}
