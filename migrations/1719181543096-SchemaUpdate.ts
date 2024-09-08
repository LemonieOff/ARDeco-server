import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1719181543096 implements MigrationInterface {
    name = 'SchemaUpdate1719181543096'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`feedbacks\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`feedback\` varchar(255) NOT NULL, \`type\` enum ('feedback', 'suggestion', 'bug') NOT NULL DEFAULT 'feedback', \`date\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`processed\` tinyint NOT NULL DEFAULT 0, \`processed_date\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`feedbacks\` ADD CONSTRAINT \`FK_4334f6be2d7d841a9d5205a100e\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`feedbacks\` DROP FOREIGN KEY \`FK_4334f6be2d7d841a9d5205a100e\``);
        await queryRunner.query(`DROP TABLE \`feedbacks\``);
    }

}
