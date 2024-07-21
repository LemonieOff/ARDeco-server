import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1720555609130 implements MigrationInterface {
    name = 'SchemaUpdate1720555609130'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_settings\` DROP COLUMN \`display_surname_on_public\``);
        await queryRunner.query(`ALTER TABLE \`user_settings\` DROP COLUMN \`user_id\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`user_settings_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_4889a0f69f998d84ee93012d35\` (\`user_settings_id\`)`);
        await queryRunner.query(`ALTER TABLE \`user_settings\` ADD \`display_lastname_on_public\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_4889a0f69f998d84ee93012d35\` ON \`users\` (\`user_settings_id\`)`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_4889a0f69f998d84ee93012d35a\` FOREIGN KEY (\`user_settings_id\`) REFERENCES \`user_settings\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_4889a0f69f998d84ee93012d35a\``);
        await queryRunner.query(`DROP INDEX \`REL_4889a0f69f998d84ee93012d35\` ON \`users\``);
        await queryRunner.query(`ALTER TABLE \`user_settings\` DROP COLUMN \`display_lastname_on_public\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP INDEX \`IDX_4889a0f69f998d84ee93012d35\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`user_settings_id\``);
        await queryRunner.query(`ALTER TABLE \`user_settings\` ADD \`user_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user_settings\` ADD \`display_surname_on_public\` tinyint NOT NULL DEFAULT '0'`);
    }

}
