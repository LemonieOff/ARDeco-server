import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1731721310945 implements MigrationInterface {
    name = "SchemaUpdate1731721310945";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`feedbacks\` DROP COLUMN \`feedback\``);
        await queryRunner.query(`ALTER TABLE \`feedbacks\` ADD \`feedback\` longtext NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`feedbacks\` DROP COLUMN \`feedback\``);
        await queryRunner.query(`ALTER TABLE \`feedbacks\` ADD \`feedback\` varchar(255) NOT NULL`);
    }

}
