import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/models/user.entity";

@Entity("order_history")
export class OrderHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(_ => User, user => user.galleries, { onDelete: "SET NULL" })
    @JoinColumn({
        name: "user_id",
        referencedColumnName: "id"
    })
    user: User;

    @Column({
        type: "int", nullable: true
    })
    user_id: number;

    @Column()
    name: string;

    @Column({ default: "24 rue Pasteur" })
    address: string;

    @Column({ default: "Le Kremlin-Bicêtre" })
    city: string;

    @Column({ default: "94270" })
    zip_code: string;

    @Column({ default: "France" })
    country: string;

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP"
    })
    datetime: Date;

    @Column({ type: "float" })
    total_amount: number;

    @Column({ type: "json" })
    furniture: string; // TODO : Change this (maybe)
}
