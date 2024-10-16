import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CatalogColors } from "./catalog_colors.entity";
import { CatalogRooms } from "./catalog_rooms.entity";
import { CatalogStyles } from "./catalog_styles.entity";
import { FavoriteFurniture } from "../../favorite_furniture/models/favorite_furniture.entity";

@Entity("catalog")
export class Catalog {
    @PrimaryGeneratedColumn()
    id: number; // Product ID

    @Column()
    name: string; // Product name

    @Column({ type: "float" })
    price: number; // in euro cents

    @Column({ type: "int" })
    width: number; // in cm

    @Column({ type: "int" })
    height: number; // in cm

    @Column({ type: "int" })
    depth: number; // in cm

    @OneToMany(_ => CatalogStyles, catalogStyles => catalogStyles.furniture, { cascade: true })
    styles: CatalogStyles[];

    @OneToMany(_ => CatalogRooms, catalogRooms => catalogRooms.furniture, { cascade: true })
    rooms: CatalogRooms[];

    @OneToMany(_ => CatalogColors, catalogColors => catalogColors.furniture, { cascade: true })
    colors: CatalogColors[];

    @Column()
    object_id: string; // Partner object ID

    @Column({ default: true })
    active: boolean; // true if the product is active, false if it is not active

    @Column({ default: false })
    archived: boolean; // true if the product has been archived

    @Column()
    company: number; // Company ID

    @Column()
    company_name: string; // Company name

    @OneToMany(_ => FavoriteFurniture, favorite => favorite.furniture)
    favorites: FavoriteFurniture[];
}
