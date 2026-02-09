import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Cart } from "../../cart/models/cart.entity";
import { GalleryReport } from "../../report/gallery/models/gallery_reports.entity";
import { Gallery } from "../../gallery/models/gallery.entity";
import { Comment } from "../../comment/models/comment.entity";
import { Feedback } from "../../feedback/models/feedback.entity";
import { UserSettings } from "../../user_settings/models/user_settings.entity";
import { Like } from "../../like/models/like.entity";
import { BlockedUser } from "../../blocked_users/entities/blocked_user.entity";
import { FavoriteGallery } from "../../favorite_gallery/models/favorite_gallery.entity";
import { FavoriteFurniture } from "../../favorite_furniture/models/favorite_furniture.entity";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    first_name: string; // First name for users, company name for companies

    @Column({ default: "" })
    last_name: string; // Last name for users, sub-company name (or company name if not) for companies

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    city: string;

    @Column()
    password: string;

    @Column({ default: 0 }) // 0 = false, 1 = true
    deleted: boolean;

    @Column({ default: "client" })
    role: string; // client, company, admin

    @Column({ nullable: true })
    company_api_key: string; // API key for company users, null for all other account types

    @OneToOne(() => Cart, cart => cart.user, { onDelete: "SET NULL", onUpdate: "CASCADE", nullable: true })
    cart: Cart;

    @OneToMany(_ => GalleryReport, galleryReport => galleryReport.user)
    galleryReports: GalleryReport[];

    @OneToMany(_ => Gallery, gallery => gallery.user)
    galleries: Gallery[];

    @Column({ default: 0 })
    profile_picture_id: number;

    @Column({ nullable: true })
    checkEmailToken: string;

    @Column({
        nullable: true,
        type: "timestamp",
        default: null
    })
    checkEmailSent: Date;

    @Column({
        type: "boolean",
        default: false // 0 = false, 1 = true
    })
    hasCheckedEmail: boolean;

    @Column({ nullable: true })
    googleId: string;

    @OneToMany(_ => Comment, galleryComment => galleryComment.user)
    galleryComments: Comment[];

    @OneToMany(_ => Feedback, feedback => feedback.user)
    feedbacks: Feedback[];

    @OneToOne(_ => UserSettings, settings => settings.user, { eager: true, onDelete: "SET NULL" })
    settings: UserSettings;

    @OneToMany(_ => Like, like => like.user)
    galleryLikes: Like[];

    // Users blocked by current user
    @OneToMany(_ => BlockedUser, blocked => blocked.user)
    blocking: BlockedUser[];

    // Users blocking current user
    @OneToMany(_ => BlockedUser, blocked => blocked.blocked_user)
    blocked_by: BlockedUser[];

    @OneToMany(_ => FavoriteGallery, favorite => favorite.user)
    favorite_galleries: FavoriteGallery[];

    @OneToMany(_ => FavoriteFurniture, favorite => favorite.user)
    favorite_furniture: FavoriteFurniture[];
}
