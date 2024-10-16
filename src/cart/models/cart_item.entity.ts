import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CatalogColors } from "../../catalog/models/catalog_colors.entity";
import { Cart } from "./cart.entity";

@Entity("cart_items")
export class CartItem {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Cart, cart => cart.items, { onDelete: "CASCADE", orphanedRowAction: "delete" })
    @JoinColumn({ name: "cart_id", referencedColumnName: "id" })
    cart: Cart;

    @Column({ type: "int" })
    cart_id: number;

    @ManyToOne(() => CatalogColors, { onDelete: "CASCADE" })
    @JoinColumn({ name: "color_id", referencedColumnName: "id" })
    color: CatalogColors;

    @Column({ type: "int" })
    color_id: number;

    @Column({ type: "int", default: 1 })
    quantity: number;
}
