import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/models/user.entity";
import { CartItem } from "./cart_item.entity";

@Entity("cart")
export class Cart {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(_ => CartItem, item => item.cart, { cascade: true })
    items: CartItem[];

    @OneToOne(() => User, user => user.cart, { onDelete: "CASCADE" })
    @JoinColumn({
        name: "user_id",
        referencedColumnName: "id"
    })
    user: User;

    @Column({ type: "int", unique: true })
    user_id: number;
}
