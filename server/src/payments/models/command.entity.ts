import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("command")
export class Command {
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

    @Column({ type: "varchar", update: false })
    delivery_country: string;

    @Column({ type: "varchar", update: false })
    delivery_region: string;

    @Column({ type: "varchar", update: false })
    delivery_city: string;

    @Column({ type: "varchar", update: false })
    delivery_postal_code: string;

    @Column({ type: "varchar", update: false })
    delivery_adress_line_1: string;

    @Column({ type: "varchar", update: false })
    delivery_adress_line_2: string;

    @Column({ type: "varchar", update: false })
    delivery_complement: string;

    @Column({ type: "varchar", update: false })
    name: string;

    @Column({ type: "varchar", update: false })
    surname: string;

    @Column({ type: "varchar", update: false })
    payment_method: string;

    @Column({ type: "json", update: false })
    furniture: JSON;
}
