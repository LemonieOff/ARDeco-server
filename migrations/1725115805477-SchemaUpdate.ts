import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1725115805477 implements MigrationInterface {
    name = 'SchemaUpdate1725115805477'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`catalog_colors\` (\`id\` int NOT NULL AUTO_INCREMENT, \`furniture_id\` int NOT NULL, \`color\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`catalog\` DROP COLUMN \`colors\``);
        await queryRunner.query(`ALTER TABLE \`catalog_colors\` ADD CONSTRAINT \`FK_677e6619f1cef8bc95c50e8a96f\` FOREIGN KEY (\`furniture_id\`) REFERENCES \`catalog\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`catalog_colors\` DROP FOREIGN KEY \`FK_677e6619f1cef8bc95c50e8a96f\``);
        await queryRunner.query(`ALTER TABLE \`catalog\` ADD \`colors\` varchar(255) NOT NULL`);
        await queryRunner.query(`DROP TABLE \`catalog_colors\``);
    }

}
