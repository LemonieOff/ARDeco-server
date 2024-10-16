import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1729089736430 implements MigrationInterface {
    name = "SchemaUpdate1729089736430";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`catalog\`
            DROP COLUMN \`price\``);
        await queryRunner.query(`ALTER TABLE \`catalog\`
            ADD \`price\` float NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`catalog\`
            DROP COLUMN \`price\``);
        await queryRunner.query(`ALTER TABLE \`catalog\`
            ADD \`price\` int NOT NULL`);
    }

}
