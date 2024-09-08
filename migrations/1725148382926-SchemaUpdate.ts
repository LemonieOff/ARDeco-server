import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1725148382926 implements MigrationInterface {
    name = 'SchemaUpdate1725148382926'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`catalog\` ADD \`archived\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`catalog\` DROP COLUMN \`archived\``);
    }

}
