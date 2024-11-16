import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/models/user.entity";

@Entity("feedbacks")
export class Feedback {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(_ => User, user => user.galleryComments, { onDelete: "CASCADE" })
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

    @Column({
        type: "longtext"
    })
    feedback: string;

    @Column({
        type: "enum",
        enum: ["feedback", "suggestion", "bug"],
        default: "feedback"
    })
    type: string;

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP"
    })
    date: Date;

    @Column({
        type: "boolean",
        default: false
    })
    processed: boolean;

    @Column({
        type: "timestamp",
        nullable: true,
        default: null
    })
    processed_date: Date;
}
