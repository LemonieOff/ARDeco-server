import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1728934188924 implements MigrationInterface {
    name = "SchemaUpdate1728934188924";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`catalog_colors\`
            DROP FOREIGN KEY \`FK_677e6619f1cef8bc95c50e8a96f\``);
        await queryRunner.query(`ALTER TABLE \`catalog_rooms\`
            DROP FOREIGN KEY \`FK_89250783840a796c81852df762d\``);
        await queryRunner.query(`ALTER TABLE \`catalog_styles\`
            DROP FOREIGN KEY \`FK_89d0bc3b143010108bcdeb93946\``);
        await queryRunner.query(`DROP INDEX \`IDX_4ed056b9344e6f7d8d46ec4b30\` ON \`user_settings\``);
        await queryRunner.query(`ALTER TABLE \`favorite_furniture\`
            DROP COLUMN \`furniture_id\``);
        await queryRunner.query(`ALTER TABLE \`favorite_furniture\`
            ADD \`furniture_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`favorite_gallery\`
            ADD CONSTRAINT \`FK_f81d6312107570e3953b286595f\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`favorite_gallery\`
            ADD CONSTRAINT \`FK_c93d84162f0c67bdf31269bb6c1\` FOREIGN KEY (\`gallery_id\`) REFERENCES \`gallery\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`catalog_colors\`
            ADD CONSTRAINT \`FK_677e6619f1cef8bc95c50e8a96f\` FOREIGN KEY (\`furniture_id\`) REFERENCES \`catalog\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`catalog_rooms\`
            ADD CONSTRAINT \`FK_89250783840a796c81852df762d\` FOREIGN KEY (\`furniture_id\`) REFERENCES \`catalog\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`catalog_styles\`
            ADD CONSTRAINT \`FK_89d0bc3b143010108bcdeb93946\` FOREIGN KEY (\`furniture_id\`) REFERENCES \`catalog\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`favorite_furniture\`
            ADD CONSTRAINT \`FK_f9bfd99dff94d407d95e7431133\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`favorite_furniture\`
            ADD CONSTRAINT \`FK_4b08bfebafa4ea7eece775604ac\` FOREIGN KEY (\`furniture_id\`) REFERENCES \`catalog\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`favorite_furniture\`
            DROP FOREIGN KEY \`FK_4b08bfebafa4ea7eece775604ac\``);
        await queryRunner.query(`ALTER TABLE \`favorite_furniture\`
            DROP FOREIGN KEY \`FK_f9bfd99dff94d407d95e7431133\``);
        await queryRunner.query(`ALTER TABLE \`catalog_styles\`
            DROP FOREIGN KEY \`FK_89d0bc3b143010108bcdeb93946\``);
        await queryRunner.query(`ALTER TABLE \`catalog_rooms\`
            DROP FOREIGN KEY \`FK_89250783840a796c81852df762d\``);
        await queryRunner.query(`ALTER TABLE \`catalog_colors\`
            DROP FOREIGN KEY \`FK_677e6619f1cef8bc95c50e8a96f\``);
        await queryRunner.query(`ALTER TABLE \`favorite_gallery\`
            DROP FOREIGN KEY \`FK_c93d84162f0c67bdf31269bb6c1\``);
        await queryRunner.query(`ALTER TABLE \`favorite_gallery\`
            DROP FOREIGN KEY \`FK_f81d6312107570e3953b286595f\``);
        await queryRunner.query(`ALTER TABLE \`favorite_furniture\`
            DROP COLUMN \`furniture_id\``);
        await queryRunner.query(`ALTER TABLE \`favorite_furniture\`
            ADD \`furniture_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_4ed056b9344e6f7d8d46ec4b30\` ON \`user_settings\` (\`user_id\`)`);
        await queryRunner.query(`ALTER TABLE \`catalog_styles\`
            ADD CONSTRAINT \`FK_89d0bc3b143010108bcdeb93946\` FOREIGN KEY (\`furniture_id\`) REFERENCES \`catalog\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`catalog_rooms\`
            ADD CONSTRAINT \`FK_89250783840a796c81852df762d\` FOREIGN KEY (\`furniture_id\`) REFERENCES \`catalog\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`catalog_colors\`
            ADD CONSTRAINT \`FK_677e6619f1cef8bc95c50e8a96f\` FOREIGN KEY (\`furniture_id\`) REFERENCES \`catalog\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
