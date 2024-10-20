export class CartResponseDto {
    id: number;
    total_amount: number;
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
