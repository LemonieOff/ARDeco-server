import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1739007600000 implements MigrationInterface {
    name = "SchemaUpdate1739007600000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`googleId\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`googleId\``);
    }

}
