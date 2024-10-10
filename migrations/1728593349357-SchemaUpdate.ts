import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1728593349357 implements MigrationInterface {
    name = 'SchemaUpdate1728593349357'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`blocked_users\` ADD CONSTRAINT \`FK_171336109e6fd263f27351b9a7a\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`blocked_users\` ADD CONSTRAINT \`FK_1da464176c039aac8a7532906af\` FOREIGN KEY (\`blocked_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`blocked_users\` DROP FOREIGN KEY \`FK_1da464176c039aac8a7532906af\``);
        await queryRunner.query(`ALTER TABLE \`blocked_users\` DROP FOREIGN KEY \`FK_171336109e6fd263f27351b9a7a\``);
    }

}
