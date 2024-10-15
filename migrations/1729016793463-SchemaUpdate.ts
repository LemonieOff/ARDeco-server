import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1729016793463 implements MigrationInterface {
    name = "SchemaUpdate1729016793463";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cart\`
            DROP FOREIGN KEY \`FK_756f53ab9466eb52a52619ee019\``);
        await queryRunner.query(`ALTER TABLE \`users\`
            DROP FOREIGN KEY \`FK_cbfb19ddc0218b26522f9fea2eb\``);
        await queryRunner.query(`DROP INDEX \`REL_756f53ab9466eb52a52619ee01\` ON \`cart\``);
        await queryRunner.query(`DROP INDEX \`REL_cbfb19ddc0218b26522f9fea2e\` ON \`users\``);
        await queryRunner.query(`CREATE TABLE \`cart_models\`
                                 (
                                     \`cart_id\`  int NOT NULL,
                                     \`color_id\` int NOT NULL,
                                     INDEX \`IDX_e740b5f3777c5a6c1930ca7933\` (\`cart_id\`),
                                     INDEX \`IDX_2c2a3646dca0176492551c7736\` (\`color_id\`),
                                     PRIMARY KEY (\`cart_id\`, \`color_id\`)
                                 ) ENGINE = InnoDB`);
        await queryRunner.query(`ALTER TABLE \`cart\`
            DROP COLUMN \`capacity\``);
        await queryRunner.query(`ALTER TABLE \`cart\`
            DROP COLUMN \`catalogItems\``);
        await queryRunner.query(`ALTER TABLE \`cart\`
            DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`users\`
            DROP COLUMN \`cart_id\``);
        await queryRunner.query(`ALTER TABLE \`cart\`
            ADD \`user_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`cart\`
            ADD UNIQUE INDEX \`IDX_f091e86a234693a49084b4c2c8\` (\`user_id\`)`);
        await queryRunner.query(`ALTER TABLE \`gallery\`
            CHANGE \`visibility\` \`visibility\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`gallery\`
            CHANGE \`style\` \`style\` varchar(255) NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_f091e86a234693a49084b4c2c8\` ON \`cart\` (\`user_id\`)`);
        await queryRunner.query(`ALTER TABLE \`cart\`
            ADD CONSTRAINT \`FK_f091e86a234693a49084b4c2c86\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cart_models\`
            ADD CONSTRAINT \`FK_e740b5f3777c5a6c1930ca7933e\` FOREIGN KEY (\`cart_id\`) REFERENCES \`cart\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`cart_models\`
            ADD CONSTRAINT \`FK_2c2a3646dca0176492551c77363\` FOREIGN KEY (\`color_id\`) REFERENCES \`catalog_colors\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cart_models\`
            DROP FOREIGN KEY \`FK_2c2a3646dca0176492551c77363\``);
        await queryRunner.query(`ALTER TABLE \`cart_models\`
            DROP FOREIGN KEY \`FK_e740b5f3777c5a6c1930ca7933e\``);
        await queryRunner.query(`ALTER TABLE \`cart\`
            DROP FOREIGN KEY \`FK_f091e86a234693a49084b4c2c86\``);
        await queryRunner.query(`DROP INDEX \`REL_f091e86a234693a49084b4c2c8\` ON \`cart\``);
        await queryRunner.query(`ALTER TABLE \`gallery\`
            CHANGE \`style\` \`style\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`gallery\`
            CHANGE \`visibility\` \`visibility\` tinyint NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`cart\`
            DROP INDEX \`IDX_f091e86a234693a49084b4c2c8\``);
        await queryRunner.query(`ALTER TABLE \`cart\`
            DROP COLUMN \`user_id\``);
        await queryRunner.query(`ALTER TABLE \`users\`
            ADD \`cart_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`cart\`
            ADD \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`cart\`
            ADD \`catalogItems\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`cart\`
            ADD \`capacity\` int NOT NULL`);
        await queryRunner.query(`DROP INDEX \`IDX_2c2a3646dca0176492551c7736\` ON \`cart_models\``);
        await queryRunner.query(`DROP INDEX \`IDX_e740b5f3777c5a6c1930ca7933\` ON \`cart_models\``);
        await queryRunner.query(`DROP TABLE \`cart_models\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_cbfb19ddc0218b26522f9fea2e\` ON \`users\` (\`cart_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_756f53ab9466eb52a52619ee01\` ON \`cart\` (\`userId\`)`);
        await queryRunner.query(`ALTER TABLE \`users\`
            ADD CONSTRAINT \`FK_cbfb19ddc0218b26522f9fea2eb\` FOREIGN KEY (\`cart_id\`) REFERENCES \`cart\` (\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cart\`
            ADD CONSTRAINT \`FK_756f53ab9466eb52a52619ee019\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
