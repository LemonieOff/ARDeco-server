import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/models/user.entity";
import { CatalogColors } from "../../catalog/models/catalog_colors.entity";

@Entity("cart")
export class Cart {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToMany(_ => CatalogColors, { onDelete: "CASCADE", onUpdate: "CASCADE", cascade: true })
    @JoinTable({
        name: "cart_models",
        joinColumn: {
            name: "cart_id",
            referencedColumnName: "id"
        },
        inverseJoinColumn: {
            name: "color_id",
            referencedColumnName: "id"
        }
    })
    models: CatalogColors[];

    @OneToOne(() => User, user => user.cart, { onDelete: "CASCADE" })
    @JoinColumn({
        name: "user_id",
        referencedColumnName: "id"
    })
    user: User;

    @Column({ type: "int", unique: true })
    user_id: number;
}
