import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { GalleryReport } from "../../report/gallery/models/gallery_reports.entity";
import { User } from "../../user/models/user.entity";
import { Comment } from "../../comment/models/comment.entity";

@Entity("gallery")
export class Gallery {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.galleries, { onDelete: "CASCADE" })
    @JoinColumn({
        name: "user_id",
        referencedColumnName: "id"
    })
    user: User;

    @Column({
        type: "int",
        update: false
    })
    user_id: number;

    @Column({ type: "boolean" })
    visibility: boolean;

    @Column({ type: "json" })
    furniture: string;

    @Column({ type: "varchar" })
    name: string;

    @Column({ type: "longtext" })
    description: string;

    @Column({ type: "varchar" })
    room_type: string;

    @OneToMany(() => GalleryReport, galleryReport => galleryReport.gallery)
    galleryReports: GalleryReport[];

    @OneToMany(() => Comment, comment => comment.gallery)
    comments: Comment[];
}
