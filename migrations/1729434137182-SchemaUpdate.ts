import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1729434137182 implements MigrationInterface {
    name = "SchemaUpdate1729434137182";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`comments\`
            ADD \`edited\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`comments\`
            ADD \`edit_date\` timestamp NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`comments\`
            DROP COLUMN \`edit_date\``);
        await queryRunner.query(`ALTER TABLE \`comments\`
            DROP COLUMN \`edited\``);
    }

}
