export class CartResponseDto {
    id: number;
    items: {
        quantity: number;
        furniture: {
            id: number;
            name: string;
            color: string;
            color_id: number;
            model_id: number;
            price: number;
        }
    }[];
}
