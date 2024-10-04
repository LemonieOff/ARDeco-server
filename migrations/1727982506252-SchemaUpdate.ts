import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1727982506252 implements MigrationInterface {
    name = "SchemaUpdate1727982506252";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`likes\`
                                 (
                                     \`id\`            int       NOT NULL AUTO_INCREMENT,
                                     \`user_id\`       int       NOT NULL,
                                     \`gallery_id\`    int       NOT NULL,
                                     \`creation_date\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                     PRIMARY KEY (\`id\`)
                                 ) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`likes\`
            ADD CONSTRAINT \`FK_3f519ed95f775c781a254089171\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`likes\`
            ADD CONSTRAINT \`FK_7bfb23e205e6e49582749b5abdf\` FOREIGN KEY (\`gallery_id\`) REFERENCES \`gallery\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`likes\` DROP FOREIGN KEY \`FK_7bfb23e205e6e49582749b5abdf\``);
        await queryRunner.query(`ALTER TABLE \`likes\` DROP FOREIGN KEY \`FK_3f519ed95f775c781a254089171\``);
        await queryRunner.query(`DROP TABLE \`likes\``);
    }

}
