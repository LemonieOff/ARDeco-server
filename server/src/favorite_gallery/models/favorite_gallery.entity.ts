/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("favorite_gallery")
export class FavoriteGallery {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "int", update: false })
    user_id: number;

    @Column({ type: "int" })
    gallery_id: number;

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        update: false
    })
    timestamp: Date;
}
