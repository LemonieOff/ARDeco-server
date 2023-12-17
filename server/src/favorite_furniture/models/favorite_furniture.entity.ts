import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("favoriteFurniture")
export class FavoriteFurniture {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "int", update: false })
    user_id: number;

    @Column({ type: "int" })
    furniture_id: string;

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        update: false
    })
    timestqmp: Date;
}
