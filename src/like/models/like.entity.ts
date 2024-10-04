import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/models/user.entity";
import { Gallery } from "../../gallery/models/gallery.entity";

@Entity("likes")
export class Like {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(_ => User, user => user.galleryLikes, { onDelete: "CASCADE" })
    @JoinColumn({
        name: "user_id",
        referencedColumnName: "id"
    })
    user: User;

    @Column({ type: "int" })
    user_id: number;

    @ManyToOne(_ => Gallery, gallery => gallery.likes, { onDelete: "CASCADE" })
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
    creation_date: Date;
}
