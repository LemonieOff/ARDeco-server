import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1726591245513 implements MigrationInterface {
    name = 'SchemaUpdate1726591245513'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`gallery\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`gallery\` ADD \`description\` varchar(255) NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`gallery\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`gallery\` ADD \`description\` longtext NOT NULL`);
    }

}
