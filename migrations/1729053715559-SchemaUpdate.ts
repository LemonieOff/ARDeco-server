import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1729053715559 implements MigrationInterface {
    name = "SchemaUpdate1729053715559";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ticket\`
            CHANGE \`user_init_id\` \`user_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`ticket\`
            ADD CONSTRAINT \`FK_368610dc3312f9b91e9ace40354\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ticket\`
            DROP FOREIGN KEY \`FK_368610dc3312f9b91e9ace40354\``);
        await queryRunner.query(`ALTER TABLE \`ticket\`
            CHANGE \`user_id\` \`user_init_id\` int NOT NULL`);
    }

}
