import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/models/user.entity";
import { Catalog } from "../../catalog/models/catalog.entity";

@Entity("favorite_furniture")
export class FavoriteFurniture {
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

    @ManyToOne(_ => Catalog, furniture => furniture.favorites, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({
        name: "furniture_id",
        referencedColumnName: "id"
    })
    furniture: Catalog;

    @Column({ type: "int" })
    furniture_id: number;

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP"
    })
    timestamp: Date;
}
