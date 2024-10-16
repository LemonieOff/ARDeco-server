export class CartResponseDto {
    id: number;
    items: {
        color_id: number;
        quantity: number;
        furniture: {
            id: number;
            name: string;
            color: string;
            price: number;
        }
    }[];
}
