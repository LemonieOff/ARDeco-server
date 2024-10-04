import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { GalleryReport } from "../../report/gallery/models/gallery_reports.entity";
import { User } from "../../user/models/user.entity";
import { Comment } from "../../comment/models/comment.entity";
import { Like } from "../../like/models/like.entity";

@Entity("gallery")
export class Gallery {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(_ => User, user => user.galleries, { onDelete: "CASCADE" })
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

    @Column({ type: "boolean", default: false })
    visibility: boolean;

    @Column({ type: "json" })
    model_data: string;

    @Column({ type: "varchar" })
    name: string;

    @Column({ type: "varchar", default: "" })
    description: string;

    @Column({ type: "varchar" })
    room: string;

    @Column({ type: "varchar" })
    style: string;

    @OneToMany(_ => GalleryReport, galleryReport => galleryReport.gallery)
    galleryReports: GalleryReport[];

    @OneToMany(_ => Comment, comment => comment.gallery)
    comments: Comment[];

    @OneToMany(_ => Like, like => like.gallery)
    likes: Like[];
}
