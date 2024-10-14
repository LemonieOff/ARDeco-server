/* eslint-disable prettier/prettier */
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/models/user.entity";
import { Gallery } from "../../gallery/models/gallery.entity";

@Entity("favorite_gallery")
export class FavoriteGallery {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(_ => User, user => user.favorite_galleries, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({
        name: "user_id",
        referencedColumnName: "id"
    })
    user: User;

    @Column({ type: "int" })
    user_id: number;

    @ManyToOne(_ => Gallery, gallery => gallery.favorites, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({
        name: "gallery_id",
        referencedColumnName: "id"
    })
    gallery: Gallery;

    @Column({ type: "int" })
    gallery_id: number;

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP"
    })
    timestamp: Date;
}
