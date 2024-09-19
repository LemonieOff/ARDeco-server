import { CatalogColorValidator } from "./catalog_color.validator";
import { ValidationArguments } from "@nestjs/class-validator";

describe("CatalogColorValidator", () => {
    let validator: CatalogColorValidator;

    beforeEach(() => {
        validator = new CatalogColorValidator();
    });

    it("should be defined", () => {
        expect(validator).toBeDefined();
    });

    describe("validate", () => {
        it("should return false for an empty array", () => {
            const result = validator.validate([], {} as ValidationArguments);
            expect(result).toBe(false);
        });

        it("should return false for null or undefined array", () => {
            const result1 = validator.validate(null, {} as ValidationArguments);
            const result2 = validator.validate(undefined, {} as ValidationArguments);
            expect(result1).toBe(false);
            expect(result2).toBe(false);
        });

        it("should return true for an array of valid color strings", () => {
            const colors = ["red", "blue", "green"];
            const result = validator.validate(colors, {} as ValidationArguments);
            expect(result).toBe(true);
        });

        it("should return false for an array with invalid color strings", () => {
            const colors = ["red", "invalid", "green"];
            const result = validator.validate(colors, {} as ValidationArguments);
            expect(result).toBe(false);
        });

        it("should return true for an array of valid ColorWithModelDto objects", () => {
            const colors = [
                { color: "red", model_id: 1 },
                { color: "blue", model_id: 2 }
            ];
            const result = validator.validate(colors, {} as ValidationArguments);
            expect(result).toBe(true);
        });

        it("should return false for an array with invalid ColorWithModelDto objects", () => {
            const colors = [
                { color: "red", model_id: 1 },
                { color: "invalid", model_id: 2 }
            ];
            const result = validator.validate(colors, {} as ValidationArguments);
            expect(result).toBe(false);
        });

        it("should return false for an array with mixed types", () => {
            const colors = ["red", { color: "blue", model_id: 2 }];
            const result = validator.validate(colors, {} as ValidationArguments);
            expect(result).toBe(false);
        });
    });

    describe("defaultMessage", () => {
        it("should return the default error message", () => {
            const result = validator.defaultMessage({} as ValidationArguments);
            expect(result).toContain("colors array must contain either only strings representing valid colors");
        });
    });
});
