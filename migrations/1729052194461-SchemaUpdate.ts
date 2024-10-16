import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1729052194461 implements MigrationInterface {
    name = 'SchemaUpdate1729052194461'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`order_history\` ADD \`name\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`order_history\` ADD \`address\` varchar(255) NOT NULL DEFAULT '24 rue Pasteur'`);
        await queryRunner.query(`ALTER TABLE \`order_history\` ADD \`city\` varchar(255) NOT NULL DEFAULT 'Le Kremlin-Bicêtre'`);
        await queryRunner.query(`ALTER TABLE \`order_history\` ADD \`zip_code\` varchar(255) NOT NULL DEFAULT '94270'`);
        await queryRunner.query(`ALTER TABLE \`order_history\` ADD \`country\` varchar(255) NOT NULL DEFAULT 'France'`);
        await queryRunner.query(`ALTER TABLE \`order_history\` CHANGE \`user_id\` \`user_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`order_history\` ADD CONSTRAINT \`FK_61871121875401d7807e617256b\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`order_history\` DROP FOREIGN KEY \`FK_61871121875401d7807e617256b\``);
        await queryRunner.query(`ALTER TABLE \`order_history\` CHANGE \`user_id\` \`user_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`order_history\` DROP COLUMN \`country\``);
        await queryRunner.query(`ALTER TABLE \`order_history\` DROP COLUMN \`zip_code\``);
        await queryRunner.query(`ALTER TABLE \`order_history\` DROP COLUMN \`city\``);
        await queryRunner.query(`ALTER TABLE \`order_history\` DROP COLUMN \`address\``);
        await queryRunner.query(`ALTER TABLE \`order_history\` DROP COLUMN \`name\``);
    }

}
