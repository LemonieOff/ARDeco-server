import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1726079343397 implements MigrationInterface {
    name = 'SchemaUpdate1726079343397'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`catalog\` DROP COLUMN \`model_id\``);
        await queryRunner.query(`ALTER TABLE \`catalog_colors\` ADD \`model_id\` int NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`catalog_colors\` DROP COLUMN \`model_id\``);
        await queryRunner.query(`ALTER TABLE \`catalog\` ADD \`model_id\` int NOT NULL DEFAULT '0'`);
    }

}
