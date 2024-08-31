import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Catalog } from "./catalog.entity";

@Entity("catalog_rooms")
export class CatalogRooms {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(_ => Catalog, catalog => catalog.rooms, {
        onDelete: "CASCADE"
    })
    @JoinColumn({
        name: "furniture_id",
        referencedColumnName: "id"
    })
    furniture: Catalog;

    @Column({
        type: "int",
        update: false
    })
    furniture_id: number;

    @Column()
    room: string;
}
