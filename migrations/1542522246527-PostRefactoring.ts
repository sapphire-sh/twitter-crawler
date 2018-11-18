import {MigrationInterface, QueryRunner} from "typeorm";

export class PostRefactoring1542522246527 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `tweets` CHANGE `created_at` `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `tweets` CHANGE `updated_at` `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `crawled_at`");
        await queryRunner.query("ALTER TABLE `users` ADD `crawled_at` bigint NOT NULL DEFAULT '0'");
        await queryRunner.query("ALTER TABLE `users` CHANGE `created_at` `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `users` CHANGE `updated_at` `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `users` CHANGE `updated_at` `updated_at` datetime(6) NOT NULL DEFAULT 'current_timestamp(6)'");
        await queryRunner.query("ALTER TABLE `users` CHANGE `created_at` `created_at` datetime(6) NOT NULL DEFAULT 'current_timestamp(6)'");
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `crawled_at`");
        await queryRunner.query("ALTER TABLE `users` ADD `crawled_at` int NOT NULL DEFAULT '0'");
        await queryRunner.query("ALTER TABLE `tweets` CHANGE `updated_at` `updated_at` datetime(6) NOT NULL DEFAULT 'current_timestamp(6)'");
        await queryRunner.query("ALTER TABLE `tweets` CHANGE `created_at` `created_at` datetime(6) NOT NULL DEFAULT 'current_timestamp(6)'");
    }

}
