import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1725116265695 implements MigrationInterface {
    name = 'SchemaUpdate1725116265695'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`catalog_rooms\` (\`id\` int NOT NULL AUTO_INCREMENT, \`furniture_id\` int NOT NULL, \`room\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`catalog\` DROP COLUMN \`rooms\``);
        await queryRunner.query(`ALTER TABLE \`catalog_rooms\` ADD CONSTRAINT \`FK_89250783840a796c81852df762d\` FOREIGN KEY (\`furniture_id\`) REFERENCES \`catalog\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`catalog_rooms\` DROP FOREIGN KEY \`FK_89250783840a796c81852df762d\``);
        await queryRunner.query(`ALTER TABLE \`catalog\` ADD \`rooms\` varchar(255) NOT NULL`);
        await queryRunner.query(`DROP TABLE \`catalog_rooms\``);
    }

}
