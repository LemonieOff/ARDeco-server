import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("command")
export class command {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "int", update: false })
    user_id: number;

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        update: false
    })
    datetime: Date;

    @Column({ type: "float", update: false })
    total_amount: number;

    @Column({ type: "float", update: false })
    total_excl_taxes: number;

    @Column({ type: "float", update: false })
    total_taxes: number;

    @Column({ type: "float", update: false })
    vat_rate: number;

    @Column({ type: "string", update: false })
    delivery_country: string;

    @Column({ type: "string", update: false })
    delivery_region: string;

    @Column({ type: "string", update: false })
    delivery_city: string;

    @Column({ type: "string", update: false })
    delivery_postal_code: string;

    @Column({ type: "string", update: false })
    delivery_adress_line_1: string;

    @Column({ type: "string", update: false })
    delivery_adress_line_2: string;

    @Column({ type: "string", update: false })
    delivery_complement: string;

    @Column({ type: "string", update: false })
    name: string;

    @Column({ type: "string", update: false })
    surname: string;

    @Column({ type: "string", update: false })
    payment_method: string;

    @Column({ type: "json", update: false })
    furniture: JSON;
}
