/* eslint-disable prettier/prettier */
import {
    Column,
    Entity, ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import { Gallery } from "../../../gallery/models/gallery.entity";
import { User } from "../../../user/models/user.entity";

@Entity("gallery_reports")
export class GalleryReport {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Gallery, gallery => gallery.galleryReports)
    gallery: Gallery;

    @ManyToOne(type => User)
    user: User;

    @Column({ type: "enum", enum: ["open", "close", "deleted"] })
    status: string;

    @Column({ type: "longtext", nullable: true})
    report_text: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    datetime: Date
}
