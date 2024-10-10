import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1728594735980 implements MigrationInterface {
    name = "SchemaUpdate1728594735980";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\`
            DROP FOREIGN KEY \`FK_4889a0f69f998d84ee93012d35a\``);
        await queryRunner.query(`DROP INDEX \`REL_4889a0f69f998d84ee93012d35\` ON \`users\``);
        await queryRunner.query(`ALTER TABLE \`users\`
            DROP COLUMN \`user_settings_id\``);
        await queryRunner.query(`ALTER TABLE \`user_settings\`
            DROP COLUMN \`language\``);
        await queryRunner.query(`ALTER TABLE \`user_settings\`
            DROP COLUMN \`notifications_enabled\``);
        await queryRunner.query(`ALTER TABLE \`user_settings\`
            DROP COLUMN \`sounds_enabled\``);
        await queryRunner.query(`ALTER TABLE \`user_settings\`
            DROP COLUMN \`dark_mode\``);
        await queryRunner.query(`ALTER TABLE \`user_settings\`
            ADD \`user_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user_settings\`
            ADD UNIQUE INDEX \`IDX_4ed056b9344e6f7d8d46ec4b30\` (\`user_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_4ed056b9344e6f7d8d46ec4b30\` ON \`user_settings\` (\`user_id\`)`);
        await queryRunner.query(`ALTER TABLE \`user_settings\`
            ADD CONSTRAINT \`FK_4ed056b9344e6f7d8d46ec4b302\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_settings\`
            DROP FOREIGN KEY \`FK_4ed056b9344e6f7d8d46ec4b302\``);
        await queryRunner.query(`DROP INDEX \`REL_4ed056b9344e6f7d8d46ec4b30\` ON \`user_settings\``);
        await queryRunner.query(`ALTER TABLE \`user_settings\`
            DROP INDEX \`IDX_4ed056b9344e6f7d8d46ec4b30\``);
        await queryRunner.query(`ALTER TABLE \`user_settings\`
            DROP COLUMN \`user_id\``);
        await queryRunner.query(`ALTER TABLE \`user_settings\`
            ADD \`dark_mode\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`user_settings\`
            ADD \`sounds_enabled\` tinyint NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`user_settings\`
            ADD \`notifications_enabled\` tinyint NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`user_settings\`
            ADD \`language\` varchar(255) NOT NULL DEFAULT 'fr'`);
        await queryRunner.query(`ALTER TABLE \`users\`
            ADD \`user_settings_id\` int NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_4889a0f69f998d84ee93012d35\` ON \`users\` (\`user_settings_id\`)`);
        await queryRunner.query(`ALTER TABLE \`users\`
            ADD CONSTRAINT \`FK_4889a0f69f998d84ee93012d35a\` FOREIGN KEY (\`user_settings_id\`) REFERENCES \`user_settings\` (\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
