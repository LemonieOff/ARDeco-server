import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1719170302587 implements MigrationInterface {
    name = 'SchemaUpdate1719170302587'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user_settings\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`language\` varchar(255) NOT NULL DEFAULT 'fr', \`notifications_enabled\` tinyint NOT NULL DEFAULT 1, \`sounds_enabled\` tinyint NOT NULL DEFAULT 1, \`dark_mode\` tinyint NOT NULL DEFAULT 0, \`automatic_new_gallery_share\` tinyint NOT NULL DEFAULT 0, \`display_surname_on_public\` tinyint NOT NULL DEFAULT 0, \`display_email_on_public\` tinyint NOT NULL DEFAULT 0, UNIQUE INDEX \`IDX_4ed056b9344e6f7d8d46ec4b30\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`command\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`datetime\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`total_amount\` int NOT NULL, \`total_excl_taxes\` int NOT NULL, \`total_taxes\` int NOT NULL, \`vat_rate\` int NOT NULL, \`delivery_country\` varchar(255) NOT NULL, \`delivery_region\` varchar(255) NOT NULL, \`delivery_city\` varchar(255) NOT NULL, \`delivery_postal_code\` varchar(255) NOT NULL, \`delivery_adress_line_1\` varchar(255) NOT NULL, \`delivery_adress_line_2\` varchar(255) NOT NULL, \`delivery_complement\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`surname\` varchar(255) NOT NULL, \`payment_method\` varchar(255) NOT NULL, \`furniture\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ticket\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_init_id\` int NOT NULL, \`status\` varchar(255) NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`date\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`messages\` longtext NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cart\` (\`id\` int NOT NULL AUTO_INCREMENT, \`capacity\` int NOT NULL, \`catalogItems\` varchar(255) NOT NULL, \`userId\` int NULL, UNIQUE INDEX \`REL_756f53ab9466eb52a52619ee01\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`comments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`gallery_id\` int NOT NULL, \`user_id\` int NOT NULL, \`comment\` varchar(255) NOT NULL, \`creation_date\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`gallery\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`visibility\` tinyint NOT NULL, \`furniture\` json NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` longtext NOT NULL, \`room_type\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`gallery_reports\` (\`id\` int NOT NULL AUTO_INCREMENT, \`status\` enum ('open', 'close', 'deleted') NOT NULL, \`report_text\` longtext NULL, \`datetime\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`gallery_id\` int NULL, \`user_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`first_name\` varchar(255) NOT NULL, \`last_name\` varchar(255) NOT NULL DEFAULT '', \`phone\` varchar(255) NULL, \`city\` varchar(255) NULL, \`password\` varchar(255) NOT NULL, \`deleted\` tinyint NOT NULL DEFAULT '0', \`role\` varchar(255) NOT NULL DEFAULT 'client', \`company_api_key\` varchar(255) NULL, \`cart_id\` int NULL, \`profile_picture_id\` int NOT NULL DEFAULT '0', \`checkEmailToken\` varchar(255) NULL, \`checkEmailSent\` timestamp NULL, \`hasCheckedEmail\` tinyint NOT NULL DEFAULT 0, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), UNIQUE INDEX \`REL_cbfb19ddc0218b26522f9fea2e\` (\`cart_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`order_history\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`datetime\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`total_amount\` float NOT NULL, \`furniture\` json NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`favorite_furniture\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`furniture_id\` varchar(255) NOT NULL, \`timestamp\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`favorite_gallery\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`gallery_id\` int NOT NULL, \`timestamp\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`reset\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`link\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_7c700da758e7891f1855a08701\` (\`link\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`blocked_users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`blocked_user_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`archive\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`price\` int NOT NULL, \`styles\` varchar(255) NOT NULL, \`rooms\` varchar(255) NOT NULL, \`width\` int NOT NULL, \`height\` int NOT NULL, \`depth\` int NOT NULL, \`colors\` varchar(255) NOT NULL, \`object_id\` varchar(255) NOT NULL, \`model_id\` int NULL, \`active\` tinyint NOT NULL DEFAULT 1, \`company\` int NOT NULL, \`company_name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`catalog\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`price\` int NOT NULL, \`styles\` varchar(255) NOT NULL, \`rooms\` varchar(255) NOT NULL, \`width\` int NOT NULL, \`height\` int NOT NULL, \`depth\` int NOT NULL, \`colors\` varchar(255) NOT NULL, \`object_id\` varchar(255) NOT NULL, \`model_id\` int NOT NULL DEFAULT '0', \`active\` tinyint NOT NULL DEFAULT 1, \`company\` int NOT NULL, \`company_name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`cart\` ADD CONSTRAINT \`FK_756f53ab9466eb52a52619ee019\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_12e397433db3fba23b633e89623\` FOREIGN KEY (\`gallery_id\`) REFERENCES \`gallery\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_4c675567d2a58f0b07cef09c13d\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`gallery\` ADD CONSTRAINT \`FK_7d957482bdc782cacb0635e4551\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`gallery_reports\` ADD CONSTRAINT \`FK_4b129775e58f46148796db5c687\` FOREIGN KEY (\`gallery_id\`) REFERENCES \`gallery\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`gallery_reports\` ADD CONSTRAINT \`FK_5f6a9301c37a59b8540d8e683df\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_cbfb19ddc0218b26522f9fea2eb\` FOREIGN KEY (\`cart_id\`) REFERENCES \`cart\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_cbfb19ddc0218b26522f9fea2eb\``);
        await queryRunner.query(`ALTER TABLE \`gallery_reports\` DROP FOREIGN KEY \`FK_5f6a9301c37a59b8540d8e683df\``);
        await queryRunner.query(`ALTER TABLE \`gallery_reports\` DROP FOREIGN KEY \`FK_4b129775e58f46148796db5c687\``);
        await queryRunner.query(`ALTER TABLE \`gallery\` DROP FOREIGN KEY \`FK_7d957482bdc782cacb0635e4551\``);
        await queryRunner.query(`ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_4c675567d2a58f0b07cef09c13d\``);
        await queryRunner.query(`ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_12e397433db3fba23b633e89623\``);
        await queryRunner.query(`ALTER TABLE \`cart\` DROP FOREIGN KEY \`FK_756f53ab9466eb52a52619ee019\``);
        await queryRunner.query(`DROP TABLE \`catalog\``);
        await queryRunner.query(`DROP TABLE \`archive\``);
        await queryRunner.query(`DROP TABLE \`blocked_users\``);
        await queryRunner.query(`DROP INDEX \`IDX_7c700da758e7891f1855a08701\` ON \`reset\``);
        await queryRunner.query(`DROP TABLE \`reset\``);
        await queryRunner.query(`DROP TABLE \`favorite_gallery\``);
        await queryRunner.query(`DROP TABLE \`favorite_furniture\``);
        await queryRunner.query(`DROP TABLE \`order_history\``);
        await queryRunner.query(`DROP INDEX \`REL_cbfb19ddc0218b26522f9fea2e\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`gallery_reports\``);
        await queryRunner.query(`DROP TABLE \`gallery\``);
        await queryRunner.query(`DROP TABLE \`comments\``);
        await queryRunner.query(`DROP INDEX \`REL_756f53ab9466eb52a52619ee01\` ON \`cart\``);
        await queryRunner.query(`DROP TABLE \`cart\``);
        await queryRunner.query(`DROP TABLE \`ticket\``);
        await queryRunner.query(`DROP TABLE \`command\``);
        await queryRunner.query(`DROP INDEX \`IDX_4ed056b9344e6f7d8d46ec4b30\` ON \`user_settings\``);
        await queryRunner.query(`DROP TABLE \`user_settings\``);
    }

}
