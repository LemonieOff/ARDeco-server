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

    @Column()
    total_amount: number;

    @Column()
    total_excl_taxes: number;

    @Column()
    total_taxes: number;

    @Column()
    vat_rate: number;

    @Column()
    delivery_country: string;

    @Column()
    delivery_region: string;

    @Column()
    delivery_city: string;

    @Column()
    delivery_postal_code: string;

    @Column()
    delivery_adress_line_1: string;

    @Column()
    delivery_adress_line_2: string;

    @Column()
    delivery_complement: string;

    @Column()
    name: string;

    @Column()
    surname: string;

    @Column()
    payment_method: string;

    @Column()
    furniture: string;
}
