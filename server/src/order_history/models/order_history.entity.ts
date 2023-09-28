import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("order_history")
export class OrderHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "int", update: false })
    user_id: number;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", update: false })
    datetime: Date;

    @Column({ type: "float" })
    total_amount: number;

    @Column({ type: "json" })
    furniture: string;
}
