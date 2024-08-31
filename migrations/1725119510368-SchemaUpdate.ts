import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1725119510368 implements MigrationInterface {
    name = 'SchemaUpdate1725119510368'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`catalog_styles\` (\`id\` int NOT NULL AUTO_INCREMENT, \`furniture_id\` int NOT NULL, \`style\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`catalog\` DROP COLUMN \`styles\``);
        await queryRunner.query(`ALTER TABLE \`catalog_styles\` ADD CONSTRAINT \`FK_89d0bc3b143010108bcdeb93946\` FOREIGN KEY (\`furniture_id\`) REFERENCES \`catalog\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`catalog_styles\` DROP FOREIGN KEY \`FK_89d0bc3b143010108bcdeb93946\``);
        await queryRunner.query(`ALTER TABLE \`catalog\` ADD \`styles\` varchar(255) NOT NULL`);
        await queryRunner.query(`DROP TABLE \`catalog_styles\``);
    }

}
