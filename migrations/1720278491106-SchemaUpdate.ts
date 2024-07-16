import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1720278491106 implements MigrationInterface {
    name = 'SchemaUpdate1720278491106'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`changelog\` (\`id\` int NOT NULL AUTO_INCREMENT, \`version\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`date\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`changelog\` longtext NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`changelog\``);
    }

}
