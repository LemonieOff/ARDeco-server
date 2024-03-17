/* eslint-disable prettier/prettier */
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { GalleryReport } from "../../report/gallery/models/gallery_reports.entity";

@Entity("gallery")
export class Gallery {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "int", update: false })
    user_id: number;

    @Column({ type: "boolean" })
    visibility: boolean;

    @Column({ type: "json" })
    furniture: string;

    @Column({ type: "varchar" })
    name: string;

    @Column({ type: "varchar" })
    description: string;

    @Column({ type: "varchar" })
    room_type: string;

    @OneToMany(type => GalleryReport, galleryReport => galleryReport.gallery)
    galleryReports: GalleryReport[];
}
