import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1729470305303 implements MigrationInterface {
    name = "SchemaUpdate1729470305303";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`order\`
                                 (
                                     \`id\`           int          NOT NULL AUTO_INCREMENT,
                                     \`user_id\`      int          NULL,
                                     \`name\`         varchar(255) NOT NULL,
                                     \`address\`      varchar(255) NOT NULL DEFAULT '24 rue Pasteur',
                                     \`city\`         varchar(255) NOT NULL DEFAULT 'Le Kremlin-Bicêtre',
                                     \`zip_code\`     varchar(255) NOT NULL DEFAULT '94270',
                                     \`country\`      varchar(255) NOT NULL DEFAULT 'France',
                                     \`datetime\`     timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                     \`total_amount\` float        NOT NULL,
                                     \`furniture\`    json         NOT NULL,
                                     PRIMARY KEY (\`id\`)
                                 ) ENGINE = InnoDB`);
        await queryRunner.query(`ALTER TABLE \`order\`
            ADD CONSTRAINT \`FK_199e32a02ddc0f47cd93181d8fd\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`order\`
            DROP FOREIGN KEY \`FK_199e32a02ddc0f47cd93181d8fd\``);
        await queryRunner.query(`DROP TABLE \`order\``);
    }

}
