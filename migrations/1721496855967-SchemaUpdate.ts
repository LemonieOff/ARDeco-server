import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1721496855967 implements MigrationInterface {
    name = 'SchemaUpdate1721496855967'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_4889a0f69f998d84ee93012d35a\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_4889a0f69f998d84ee93012d35a\` FOREIGN KEY (\`user_settings_id\`) REFERENCES \`user_settings\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_4889a0f69f998d84ee93012d35a\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_4889a0f69f998d84ee93012d35a\` FOREIGN KEY (\`user_settings_id\`) REFERENCES \`user_settings\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
