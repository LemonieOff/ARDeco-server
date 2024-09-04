import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1725462463285 implements MigrationInterface {
    name = "SchemaUpdate1725462463285";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`archive\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`archive\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`price\` int NOT NULL, \`styles\` varchar(255) NOT NULL, \`rooms\` varchar(255) NOT NULL, \`width\` int NOT NULL, \`height\` int NOT NULL, \`depth\` int NOT NULL, \`colors\` varchar(255) NOT NULL, \`object_id\` varchar(255) NOT NULL, \`model_id\` int NULL, \`active\` tinyint NOT NULL DEFAULT 1, \`company\` int NOT NULL, \`company_name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

}
