import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("favorite_furniture")
export class FavoriteFurniture {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "int", update: false })
    user_id: number;

    @Column({ type: "varchar" })
    furniture_id: string;

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        update: false
    })
    timestamp: Date;
}
