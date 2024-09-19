import * as FurnitureValues from "./values";

describe("CatalogValues", () => {
    describe("colors", () => {
        it("should return all colors", async () => {
            const colors = ["red", "orange", "yellow", "green", "blue", "purple", "pink", "brown", "black", "white", "grey", "beige", "turquoise", "gold", "silver", "olive", "navy", "teal", "ivory"];
            expect(FurnitureValues.colors).toEqual(colors);
        });
    });

    describe("styles", () => {
        it("should return all styles", async () => {
            const styles = ["modern", "scandinavian", "industrial", "traditional", "contemporary", "rustic", "bohemian", "coastal", "farmhouse", "minimalist", "art_deco", "french_country","shabby_chic","metal","retro","classic","romantic","gothic","victorian","asian","african","bauhaus","baroque"];
            expect(FurnitureValues.styles).toEqual(styles);
        });
    });

    describe("rooms", () => {
        it("should return all rooms", async () => {
            const rooms = ["living_room", "kitchen", "dining_room", "bedroom", "bathroom", "office", "guest_room", "gaming_room", "library", "hallway", "laundry_room", "balcony", "patio", "garden", "family_room", "attic", "garage", "pantry"];
            expect(FurnitureValues.rooms).toEqual(rooms);
        });
    });
});
