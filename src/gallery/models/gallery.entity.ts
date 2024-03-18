/* eslint-disable prettier/prettier */
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { GalleryReport } from "../../report/gallery/models/gallery_reports.entity";
import { User } from "../../user/models/user.entity";

@Entity("gallery")
export class Gallery {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => User, user => user.galleries, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: User;

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

    @OneToMany(type => GalleryReport, galleryReport => galleryReport.gallery)
    galleryReports: GalleryReport[];
}
