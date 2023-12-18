/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("favoriteGallery")
export class FavoriteGallery {
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
