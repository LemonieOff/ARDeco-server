export class CatalogResponseDto {
    id: number;
    name: string;
    object_id: string;
    company: number;
    company_name: string;
    price: number;
    width: number;
    height: number;
    depth: number;
    colors: {
        color: string;
        model_id: number;
    }[];
    rooms: string[];
    styles: string[];
    active: boolean;
}
