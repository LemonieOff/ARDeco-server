import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "@nestjs/class-validator";
import { ColorWithModelDto } from "../dtos/catalog-color-model.dto";
import { colors } from "../values";

@ValidatorConstraint({
    name: "CatalogColorValidator",
    async: false
})
export class CatalogColorValidator implements ValidatorConstraintInterface {
    validate(array: (string | ColorWithModelDto)[], args: ValidationArguments) {
        // Check for a not empty array
        if (!array || !(array instanceof Array) || array.length === 0) return false;

        // Check if all values are strings and contained in allowed values
        const isAllString = array.every(value => typeof value === "string" && colors.includes(value));

        // Check if all values are DTO objects and associated colors are contained in allowed values
        const isAllObject = array.every(value => typeof value === "object" && colors.includes(value.color));

        // If not only allowed strings or not only objects containing allowed color, return false
        return !(!isAllString && !isAllObject);
    }

    defaultMessage(args: ValidationArguments) {
        return `colors array must contain either only strings representing valid colors (${colors.join(", ")}) or only objects with a 'color' property representing a valid color.`;
    }
}
